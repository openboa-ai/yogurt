"""Initialize destination-specific files in a local GitHub template checkout."""

import argparse
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

SEED_NAME = "Repository starter"
SEED_DESCRIPTION = "A starting point for projects with pull-request checks, secret scanning and repeatable GitHub settings."
HELP = "https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability"
OWNER_PATHS = ("/.github/", "/.gitattributes", "/.gitleaks*", "/SECURITY.md", "/tools/")
STATE = ".github/starter.json"


def regular_path(root, relative):
    path = root / relative
    if path.resolve() != path or (path.exists() and not path.is_file()):
        raise ValueError(f"Expected a regular project file: {relative}")
    return path


def blocks(meta):
    owner = meta["reviewer"] if meta else "@SonSangjoon"
    name = meta["repo"].split("/")[1] if meta else SEED_NAME
    description = meta["description"] if meta else SEED_DESCRIPTION
    url = f'https://github.com/{meta["repo"]}/security/advisories/new' if meta else HELP
    report = (f"Send a private report to the maintainers using [GitHub private vulnerability reporting]({url})."
              if meta else "Open this repository's **Security** tab and select **Report a vulnerability** to contact its maintainers privately.")
    return (
        ("README.md", "<!-- starter:project -->", "<!-- /starter:project -->", f"# {name}\n\n{description}"),
        ("SECURITY.md", "<!-- starter:report -->", "<!-- /starter:report -->", report),
        (".github/CODEOWNERS", "# starter:owners", "# /starter:owners", "\n".join(f"{p} {owner}" for p in OWNER_PATHS)),
        (".github/ISSUE_TEMPLATE/config.yml", "    # starter:report", "    # /starter:report", "    url: " + url),
    )


def managed_block(text, start, end, previous, wanted, filename):
    lines = text.splitlines(keepends=True)
    for marker in (start, end):
        if sum(line.rstrip("\r\n") == marker for line in lines) != 1:
            raise ValueError(f"Missing or ambiguous marker in {filename}")
    begin = lines.index(start + "\n")
    finish = lines.index(end + "\n")
    if begin >= finish or "".join(lines[begin + 1:finish]) not in (previous + "\n", wanted + "\n"):
        raise ValueError(f"Preserve local edits in {filename}. Reconcile its managed block before initializing.")
    return "".join(lines[:begin + 1]) + wanted + "\n" + "".join(lines[finish:])


def initialize(root, repo, description, reviewer, branch, *, dry_run=False):
    root = root.resolve()
    def git(*args):
        return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()
    if Path(git("rev-parse", "--show-toplevel")).resolve() != root:
        raise ValueError("Run at the root of the generated checkout.")
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo, re.ASCII) or any(x in (".", "..") for x in repo.split("/")):
        raise ValueError("Supply the destination as OWNER/REPOSITORY.")
    remote = git("remote", "get-url", "origin").removesuffix(".git").lower()
    if remote not in {s + repo.lower() for s in ("https://github.com/", "git@github.com:", "ssh://git@github.com/")}:
        raise ValueError("Destination differs from this checkout's GitHub origin.")
    if not re.fullmatch(r"@[a-zA-Z0-9-]+(?:/[a-zA-Z0-9_-]+)?", reviewer):
        raise ValueError("Use an existing @user or @organization/team with write access.")
    if not description.strip() or any(x in description for x in ("\n", "\r", "<!--", "-->")):
        raise ValueError("Provide a one-line description.")
    # A workflow branch filter is a glob. Accept a literal branch, never a glob.
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_./-]*", branch):
        raise ValueError("Use a literal default branch name.")
    git("check-ref-format", "--branch", branch)
    metadata = {"repo": repo, "description": description, "reviewer": reviewer, "default_branch": branch, "starter_version": 1}
    state = regular_path(root, STATE)
    previous = json.loads(state.read_text()) if state.exists() else None
    if previous and (previous["repo"].lower() != repo.lower() or previous.get("starter_version") != 1):
        raise ValueError("Existing starter metadata belongs to another repository or version.")
    updates = {}
    for old, new in zip(blocks(previous), blocks(metadata)):
        filename, start, end, wanted = new
        path = regular_path(root, filename)
        original = path.read_text()
        updated = managed_block(original, start, end, old[3], wanted, filename)
        if updated != original:
            updates[path] = updated
    workflow = regular_path(root, ".github/workflows/repository.yml")
    original = workflow.read_text()
    old_branch = previous["default_branch"] if previous else "main"
    def branch_line(value):
        return f"    branches: [{json.dumps(value)}]  # starter-default-branch"
    markers = [line for line in original.splitlines() if line.endswith("# starter-default-branch")]
    if len(markers) != 2 or any(line not in (branch_line(old_branch), branch_line(branch)) for line in markers):
        raise ValueError("Reconcile the two default-branch filters in the workflow.")
    updated = original.replace(branch_line(old_branch) + "\n", branch_line(branch) + "\n")
    if updated != original:
        updates[workflow] = updated
    if previous != metadata:
        updates[state] = json.dumps(metadata, indent=2, ensure_ascii=False) + "\n"
    if not dry_run:
        for path, updated in updates.items():
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as tmp:
                tmp.write(updated)
            mode = stat.S_IMODE(path.stat().st_mode) if path.exists() else 0o644
            os.chmod(tmp.name, mode)
            os.replace(tmp.name, path)
    return [str(path.relative_to(root)) for path in updates]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--reviewer", required=True)
    parser.add_argument("--default-branch", default="main")
    parser.add_argument("--path", type=Path, default=Path.cwd())
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        files = initialize(args.path, args.repo, args.description, args.reviewer, args.default_branch, dry_run=args.dry_run)
        print(json.dumps({"changed_files": files, "dry_run": args.dry_run}, indent=2))
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
        sys.exit(str(error))
