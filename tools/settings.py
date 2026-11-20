"""Plan, apply and verify GitHub repository settings with an existing gh login."""

import argparse
import copy
import json
import re
import subprocess
import sys
from urllib.parse import quote

CHECKS = ("Contribution names", "Repository hygiene", "Required CI")
ACTIONS_APP = 15368  # GitHub Actions on github.com
MERGE = {"allow_squash_merge": True, "allow_merge_commit": False, "allow_rebase_merge": False, "allow_auto_merge": True,
         "delete_branch_on_merge": True, "squash_merge_commit_title": "PR_TITLE", "squash_merge_commit_message": "PR_BODY"}
WORKFLOW = ".github/workflows/repository.yml"


class GitHub:
    def __call__(self, method, path, body=None, *, missing=False):
        cmd = ["gh", "api", "--hostname", "github.com", "--method", method, path]
        if body is not None:
            cmd.extend(["--input", "-"])
        proc = subprocess.run(cmd, input=json.dumps(body) if body is not None else None, text=True, capture_output=True)
        if proc.returncode:
            if missing and "(HTTP 404)" in proc.stderr:
                return None
            raise RuntimeError(f"{method} {path}: {proc.stderr.strip()}")
        return json.loads(proc.stdout) if proc.stdout.strip() else {}


def rule_payload(current, branch, qualified):
    scope = {"ref_name": {"include": ["refs/heads/" + branch], "exclude": []}}
    if current and current["conditions"] != scope:
        raise ValueError("The managed ruleset targets other refs. Reconcile its scope before applying changes.")
    rules = copy.deepcopy(current.get("rules", []))
    by_type = {rule["type"]: rule for rule in rules}
    for kind in ("deletion", "non_fast_forward", "required_linear_history", "pull_request"):
        if kind not in by_type:
            rule = {"type": kind}
            by_type[kind] = rule
            rules.append(rule)
    review = by_type["pull_request"].setdefault("parameters", {})
    review.setdefault("required_approving_review_count", 0)
    review.setdefault("require_last_push_approval", False)
    review.update(require_code_owner_review=True, dismiss_stale_reviews_on_push=True,
                  required_review_thread_resolution=True, allowed_merge_methods=["squash"])

    status = by_type.get("required_status_checks")
    statuses = status.get("parameters", {}) if status else {}
    contexts = statuses.get("required_status_checks", [])
    if any(c["context"] in CHECKS and c.get("integration_id") not in (None, -1, ACTIONS_APP) for c in contexts):
        raise ValueError("A managed check name already belongs to another app. Preserve it and resolve the name collision.")
    verified = all(any(c["context"] == name and c.get("integration_id") == ACTIONS_APP for c in contexts)
                   for name in CHECKS)
    if qualified or verified:
        if status is None:
            statuses = {}
            rules.append({"type": "required_status_checks", "parameters": statuses})
        statuses["strict_required_status_checks_policy"] = True
        statuses["required_status_checks"] = [
            c for c in contexts if c["context"] not in CHECKS or c.get("integration_id") == ACTIONS_APP
        ]
        for name in CHECKS:
            if not any(c["context"] == name for c in statuses["required_status_checks"]):
                statuses["required_status_checks"].append({"context": name, "integration_id": ACTIONS_APP})

    desired = {"name": "Protect " + branch, "target": "branch", "enforcement": "active", "bypass_actors": [],
               "conditions": scope, "rules": rules}
    return desired, not (verified or qualified)


def qualify(api, root, number, repo):
    pr = api("GET", f"{root}/pulls/{number}")
    head = pr["head"]["sha"]
    if pr["base"]["ref"] != repo["default_branch"] or pr["base"]["repo"]["id"] != repo["id"] or pr["head"]["repo"]["id"] != repo["id"]:
        raise ValueError("Qualify using a same-repository PR targeting the default branch.")
    runs = api("GET", f"{root}/actions/runs?event=pull_request&head_sha={head}&per_page=100")["workflow_runs"]
    runs = [r for r in runs if r["head_sha"] == head and r["path"] == WORKFLOW and r["repository"]["id"] == repo["id"]
            and r["event"] == "pull_request" and r["head_branch"] == pr["head"]["ref"]
            and (r.get("head_repository") or {}).get("id") == repo["id"]]
    if not runs or runs[0]["conclusion"] != "success":
        raise ValueError("The latest workflow for this PR head must have succeeded.")
    run = runs[0]
    attached = [item["number"] for item in run["pull_requests"]]
    if number not in attached:
        # GitHub can drop the run's PR references after the merged head branch is deleted.
        if attached or not pr.get("merged"):
            raise ValueError("The workflow run is not linked to the requested PR.")
        associated = api("GET", f"{root}/commits/{head}/pulls?per_page=100")
        if [p["number"] for p in associated] != [number]:
            raise ValueError("Cannot uniquely attribute the merged head to the requested PR.")
    jobs = api("GET", f"{root}/actions/runs/{run['id']}/attempts/{run['run_attempt']}/jobs?per_page=100")["jobs"]
    for name in CHECKS:
        hits = [j for j in jobs if j["name"] == name and j["head_sha"] == head and j["conclusion"] == "success"]
        if len(hits) != 1:
            raise ValueError(f"Expected one successful {name} job in the current attempt.")
        check = api("GET", f"{root}/check-runs/{hits[0]['id']}")
        if check["head_sha"] != head or check["name"] != name or check["conclusion"] != "success" or check["app"]["id"] != ACTIONS_APP:
            raise ValueError(f"Unverified check producer for {name}.")


def plan(api, target, pr_number=None):
    if not re.fullmatch(r"[A-Za-z0-9_-][A-Za-z0-9_.-]*/[A-Za-z0-9_.-]+", target) or target.split("/")[1] in (".", ".."):
        raise ValueError("Specify an explicit OWNER/REPOSITORY.")
    root = "repos/" + target
    repo = api("GET", root)
    if repo["full_name"].lower() != target.lower() or repo["archived"] or repo["fork"]:
        raise ValueError("Expected an active, independent destination repository.")
    branch = repo["default_branch"]
    if not branch:
        raise ValueError("Initialize the default branch before configuring its checks.")
    # This read also exposes plan limitations before any write can occur.
    rules = []
    page = 1
    while True:
        batch = api("GET", f"{root}/rulesets?includes_parents=false&per_page=100&page={page}")
        rules.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    owned = [r for r in rules if r["name"] == "Protect " + branch and r["source"].lower() == target.lower()]
    if len(owned) > 1:
        raise ValueError("Multiple managed rulesets have the same name.")
    url = root + "/rulesets"
    current = {}
    if owned:
        url += "/" + str(owned[0]["id"])
        current = api("GET", url)
    if pr_number is not None:
        qualify(api, root, pr_number, repo)
    desired, pending = rule_payload(current, branch, pr_number is not None)
    changes = []
    patch = {k: v for k, v in MERGE.items() if repo.get(k) != v}
    security = repo.get("security_and_analysis") or {}
    toggles = ("secret_scanning", "secret_scanning_push_protection")
    diff = {k: {"status": "enabled"} for k in toggles if security.get(k, {}).get("status") != "enabled"}
    if diff and repo["private"]:
        raise ValueError("Confirm this private repository's secret protection entitlement before enabling it.")
    if diff:
        patch["security_and_analysis"] = diff
    if patch:
        changes.append(("PATCH", root, patch))
    if any(current.get(k) != v for k, v in desired.items()):
        changes.append(("PUT" if current else "POST", url, desired))
    actions = root + "/actions/permissions"
    policy = api("GET", actions)
    if not policy.get("enabled") or not policy.get("sha_pinning_required"):
        data = {"enabled": True, "sha_pinning_required": True}
        if "allowed_actions" in policy:
            data["allowed_actions"] = policy["allowed_actions"]
        changes.append(("PUT", actions, data))
    workflow = api("GET", actions + "/workflow")
    token = {"default_workflow_permissions": "read", "can_approve_pull_request_reviews": False}
    if any(workflow.get(k) != v for k, v in token.items()):
        changes.append(("PUT", actions + "/workflow", token))
    if api("GET", root + "/vulnerability-alerts", missing=True) is None:
        changes.append(("PUT", root + "/vulnerability-alerts", None))
    for endpoint in ("automated-security-fixes", "private-vulnerability-reporting"):
        path = root + "/" + endpoint
        enabled = api("GET", path)
        if not enabled.get("enabled"):
            changes.append(("PUT", path, None))
    return changes, pending, repo


def verify_effective(api, repo, *, owners):
    root = "repos/" + repo["full_name"]
    branch = quote(repo["default_branch"], safe="")
    rules = api("GET", root + "/rules/branches/" + branch)
    effective = {r["type"] for r in rules}
    if not {"deletion", "non_fast_forward", "required_linear_history", "pull_request", "required_status_checks"} <= effective:
        raise ValueError("Required rules are missing from the effective default-branch rules.")
    groups = [r["parameters"] for r in rules if r["type"] == "required_status_checks"]
    if not any(g.get("strict_required_status_checks_policy") and
               all(any(c["context"] == n and c.get("integration_id") == ACTIONS_APP for c in g["required_status_checks"])
                   for n in CHECKS) for g in groups):
        raise ValueError("The effective rules do not require every expected check from GitHub Actions.")
    if owners:
        api("GET", root + "/contents/.github/CODEOWNERS?ref=" + branch)
        errors = api("GET", root + "/codeowners/errors?ref=" + branch)["errors"]
        if errors:
            raise ValueError("GitHub reports invalid CODEOWNERS entries.")


def execute(api, mode, target, number=None):
    changes, pending, repo = plan(api, target, number)
    report = {"repository": repo["full_name"], "changes": changes, "awaiting_required_checks": pending}
    if mode == "apply":
        if not repo.get("permissions", {}).get("admin"):
            raise ValueError("Apply requires administrative access to the destination repository.")
        for method, path, body in changes:
            api(method, path, body)
        remaining, pending, repo = plan(api, target, number)
        report.update(remaining_changes=len(remaining), awaiting_required_checks=pending)
        if remaining:
            raise ValueError("Settings have not converged. Rerun plan to see the remaining changes.")
    if mode == "verify" and (changes or pending):
        return report, 1
    if mode in ("apply", "verify") and not pending:
        verify_effective(api, repo, owners=mode == "verify")
    return report, 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("plan", "apply", "verify"))
    parser.add_argument("--repo", required=True)
    parser.add_argument("--qualify-pr", type=int, help="Enroll checks proven by this successful pull request")
    args = parser.parse_args()
    if args.qualify_pr is not None and args.qualify_pr < 1:
        parser.error("Use a positive PR number.")
    try:
        result, code = execute(GitHub(), args.mode, args.repo, args.qualify_pr)
        print(json.dumps(result, indent=2))
        sys.exit(code)
    except (ValueError, KeyError, RuntimeError, OSError) as error:
        sys.exit(str(error))
