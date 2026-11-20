"""Check contribution metadata supplied by GitHub, without reading intermediate commit messages."""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

TYPES = "feat|fix|docs|refactor|test|ci|build|chore|perf|style|revert"
SUBJECT = re.compile(rf"(?:{TYPES})(?:\([^()\s]+\))?!?: [^\s][^\r\n]*")
TOPIC = re.compile(rf"(?:{TYPES}|codex)/[a-z0-9]+(?:-[a-z0-9]+)*")


def errors(event_name, event, *, initial_root=False):
    if event_name == "push":
        commit = event.get("head_commit") or {}
        default = event["repository"]["default_branch"]
        if event.get("ref") != "refs/heads/" + default or not commit.get("id") or commit["id"] != event.get("after"):
            return ["Expected the resulting default-branch commit in the push event."]
        if initial_root and event.get("created") is True and event.get("before") == "0" * 40:
            return []
        subject = commit.get("message", "").partition("\n")[0]
        if not SUBJECT.fullmatch(subject):
            return ["The final commit subject must follow Conventional Commits, e.g. fix(queue): retry jobs."]
        return []

    if event_name != "pull_request":
        return ["Expected a pull_request or main push event."]

    pr = event["pull_request"]
    head = pr["head"]
    branch = head["ref"]
    author = pr["user"]
    dependabot_branch = (
        author.get("type") == "Bot"
        and author.get("login") == "dependabot[bot]"
        and head["repo"]["id"] == event["repository"]["id"]
        and branch.startswith("dependabot/")
        and len(branch) > len("dependabot/")
    )
    problems = []
    if not TOPIC.fullmatch(branch) and not dependabot_branch:
        problems.append("Use a lowercase topic branch, e.g. fix/42-retry-timeout.")
    if not SUBJECT.fullmatch(pr["title"]):
        problems.append("Use a conventional PR title, e.g. fix(queue): retry interrupted jobs.")
    return problems


if __name__ == "__main__":
    payload = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text(encoding="utf-8"))
    event_name = os.environ["GITHUB_EVENT_NAME"]
    initial_root = False
    if event_name == "push" and payload.get("before") == "0" * 40 and payload.get("created") is True:
        # The raw commit headers retain parent IDs even in a shallow checkout.
        obj = subprocess.check_output(["git", "cat-file", "-p", "HEAD"], text=True)
        head = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
        initial_root = head == payload.get("after") and not any(
            line.startswith("parent ") for line in obj.partition("\n\n")[0].splitlines()
        )
    problems = errors(event_name, payload, initial_root=initial_root)
    for problem in problems:
        print(problem, file=sys.stderr)
    sys.exit(bool(problems))
