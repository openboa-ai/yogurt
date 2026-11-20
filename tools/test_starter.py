import copy
import subprocess
import tempfile
import unittest
from pathlib import Path

import initialize
import settings


class InitializationTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name).resolve()
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        subprocess.run(["git", "-C", str(self.root), "remote", "add", "origin", "https://github.com/example/project.git"], check=True)
        for name, start, end, seed in initialize.blocks(None):
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(f"{start}\n{seed}\n{end}\n")
        wf = self.root / ".github/workflows/repository.yml"
        wf.parent.mkdir()
        wf.write_text(('    branches: ["main"]  # starter-default-branch\n') * 2)
        self.values = ["example/project", "A new service", "@example/maintainers", "trunk"]

    def test_initialize_preview_repeat_and_preserve(self):
        before = (self.root / "README.md").read_bytes()
        changed = initialize.initialize(self.root, *self.values, dry_run=True)
        self.assertEqual((self.root / "README.md").read_bytes(), before)
        self.assertEqual(changed, initialize.initialize(self.root, *self.values))
        readme = self.root / "README.md"
        readme.write_text(readme.read_text() + "\nProject instructions\n")
        self.assertEqual(initialize.initialize(self.root, *self.values), [])
        self.assertIn("Project instructions", readme.read_text())
        self.assertIn("@example/maintainers", (self.root / ".github/CODEOWNERS").read_text())
        self.assertNotIn("@SonSangjoon", (self.root / ".github/CODEOWNERS").read_text())
        self.assertIn("example/project/security/advisories/new", (self.root / "SECURITY.md").read_text())
        self.assertIn('["trunk"]', (self.root / ".github/workflows/repository.yml").read_text())

    def test_conflict_or_wrong_remote_is_read_only(self):
        with self.assertRaises(ValueError):
            initialize.initialize(self.root, "example/wrong", *self.values[1:])
        owned = self.root / ".github/CODEOWNERS"
        owned.write_text(owned.read_text().replace("@SonSangjoon", "@another"))
        with self.assertRaisesRegex(ValueError, "Preserve local edits"):
            initialize.initialize(self.root, *self.values)
        self.assertFalse((self.root / initialize.STATE).exists())
        self.assertIn("Repository starter", (self.root / "README.md").read_text())


class FakeGitHub:
    root = "repos/example/project"

    def __init__(self):
        self.repo = {"full_name": "example/project", "id": 40, "default_branch": "main", "private": False,
                     "archived": False, "fork": False, "permissions": {"admin": True}, "security_and_analysis": {}}
        self.rule = None
        self.calls = []
        self.actions = {"enabled": True, "allowed_actions": "selected", "sha_pinning_required": False}
        self.token = {"default_workflow_permissions": "write", "can_approve_pull_request_reviews": True}
        self.enabled = {}
        self.unavailable = False
        self.mismatched_app = False
        self.failed_latest = False
        self.missing_job = None
        self.merged = False
        self.associated_numbers = [7]
        self.fail_write = None

    def __call__(self, method, path, body=None, *, missing=False):
        p = path.removeprefix(self.root)
        if method != "GET":
            self.calls.append((method, p))
            if p == self.fail_write:
                self.fail_write = None
                raise RuntimeError("temporary API failure")
            if p == "":
                self.repo.update(body)
            elif p in ("/rulesets", "/rulesets/10"):
                self.rule = copy.deepcopy(body)
            elif p == "/actions/permissions":
                self.actions.update(body)
            elif p == "/actions/permissions/workflow":
                self.token.update(body)
            else:
                self.enabled[p] = True
            return {}
        if p == "":
            return copy.deepcopy(self.repo)
        if p.startswith("/rulesets?"):
            if self.unavailable:
                raise RuntimeError("rulesets unavailable on this plan")
            found = [{"name": "Unrelated rule", "source": "example/project", "id": 99}]
            if self.rule:
                found.append({"name": "Protect main", "source": "example/project", "id": 10})
            return found
        if p == "/rulesets/10":
            return copy.deepcopy(self.rule)
        if p == "/actions/permissions":
            return self.actions
        if p == "/actions/permissions/workflow":
            return self.token
        if p == "/vulnerability-alerts":
            return {} if self.enabled.get(p) else None
        if p in ("/automated-security-fixes", "/private-vulnerability-reporting"):
            return {"enabled": self.enabled.get(p, False)}
        if p == "/rules/branches/main":
            return self.rule["rules"]
        if p.startswith("/contents/.github/CODEOWNERS"):
            return {"type": "file"}
        if p.startswith("/codeowners/errors"):
            return {"errors": []}
        if p == "/pulls/7":
            return {"merged": self.merged, "base": {"ref": "main", "repo": {"id": 40}}, "head": {"ref": "ci/checks", "sha": "abc", "repo": {"id": 40}}}
        if p.startswith("/commits/abc/pulls?"):
            return [{"number": n} for n in self.associated_numbers]
        if p.startswith("/actions/runs?"):
            return {"workflow_runs": [{"id": 55, "run_attempt": 1, "head_sha": "abc", "path": settings.WORKFLOW,
                                       "repository": {"id": 40}, "head_branch": "ci/checks", "head_repository": {"id": 40},
                                       "event": "pull_request", "pull_requests": [] if self.merged else [{"number": 7}],
                                       "conclusion": "failure" if self.failed_latest else "success"}]}
        if p.startswith("/actions/runs/55/attempts/1/jobs"):
            return {"jobs": [{"id": i, "head_sha": "abc", "name": name, "conclusion": "success"}
                             for i, name in enumerate(settings.CHECKS) if name != self.missing_job]}
        if p.startswith("/check-runs/"):
            return {"name": settings.CHECKS[int(p.rsplit("/", 1)[1])], "head_sha": "abc", "conclusion": "success",
                    "app": {"id": 1 if self.mismatched_app else settings.ACTIONS_APP}}
        raise AssertionError("Unexpected endpoint " + p)


class SettingsTests(unittest.TestCase):
    def test_plan_enroll_verify_and_repeat(self):
        api = FakeGitHub()
        preview, _ = settings.execute(api, "plan", "example/project")
        self.assertTrue(preview["changes"])
        self.assertFalse(api.calls)
        settings.execute(api, "apply", "example/project")
        self.assertTrue(settings.execute(api, "verify", "example/project")[1])
        settings.execute(api, "apply", "example/project", 7)
        self.assertEqual(settings.execute(api, "verify", "example/project")[1], 0)
        api.calls.clear()
        self.assertEqual(settings.execute(api, "apply", "example/project")[0]["changes"], [])
        self.assertEqual(api.calls, [])
        self.assertEqual(api.actions["allowed_actions"], "selected")
        self.assertIs(api.repo["allow_auto_merge"], True)

    def test_existing_two_checks_stay_required_until_the_third_is_proven(self):
        api = FakeGitHub()
        settings.execute(api, "apply", "example/project", 7)
        checks = next(rule["parameters"]["required_status_checks"] for rule in api.rule["rules"]
                      if rule["type"] == "required_status_checks")
        checks[:] = [check for check in checks if check["context"] != "Required CI"]
        preview, code = settings.execute(api, "verify", "example/project")
        self.assertEqual(code, 1)
        self.assertTrue(preview["awaiting_required_checks"])
        api.calls.clear()
        api.missing_job = "Required CI"
        with self.assertRaisesRegex(ValueError, "Required CI"):
            settings.execute(api, "apply", "example/project", 7)
        self.assertFalse(api.calls)
        self.assertEqual([c["context"] for c in checks], ["Contribution names", "Repository hygiene"])
        api.missing_job = None
        settings.execute(api, "apply", "example/project", 7)
        self.assertEqual(settings.execute(api, "verify", "example/project")[1], 0)

    def test_keep_existing_controls_on_retry(self):
        api = FakeGitHub()
        api.fail_write = "/actions/permissions"
        with self.assertRaisesRegex(RuntimeError, "temporary"):
            settings.execute(api, "apply", "example/project")
        api.rule["rules"].append({"type": "required_signatures"})
        review = next(r["parameters"] for r in api.rule["rules"] if r["type"] == "pull_request")
        review["required_approving_review_count"] = 2
        settings.execute(api, "apply", "example/project", 7)
        other = {"context": "Product tests", "integration_id": 123}
        next(r for r in api.rule["rules"] if r["type"] == "required_status_checks")["parameters"]["required_status_checks"].append(other)
        self.assertEqual(settings.execute(api, "verify", "example/project")[0]["changes"], [])
        self.assertIn({"type": "required_signatures"}, api.rule["rules"])
        self.assertEqual(review["required_approving_review_count"], 2)

    def test_unavailable_or_unqualified_is_read_only(self):
        for attribute in ("unavailable", "mismatched_app", "failed_latest"):
            with self.subTest(attribute=attribute):
                api = FakeGitHub()
                setattr(api, attribute, True)
                with self.assertRaises((ValueError, RuntimeError)):
                    settings.execute(api, "apply", "example/project", 7)
                self.assertFalse(api.calls)

    def test_reconcile_a_customized_ruleset_without_narrowing_it(self):
        api = FakeGitHub()
        settings.execute(api, "apply", "example/project")
        api.rule["conditions"]["ref_name"]["include"].append("refs/heads/release")
        api.calls.clear()
        with self.assertRaisesRegex(ValueError, "other refs"):
            settings.execute(api, "apply", "example/project")
        self.assertFalse(api.calls)

    def test_merged_deleted_branch_still_needs_unambiguous_proof(self):
        api = FakeGitHub()
        api.merged = True
        settings.qualify(api, api.root, 7, api.repo)
        api.associated_numbers.append(9)
        with self.assertRaisesRegex(ValueError, "uniquely"):
            settings.qualify(api, api.root, 7, api.repo)

    def test_existing_named_check_from_another_app_is_preserved(self):
        api = FakeGitHub()
        settings.execute(api, "apply", "example/project", 7)
        statuses = next(r["parameters"] for r in api.rule["rules"] if r["type"] == "required_status_checks")
        statuses["required_status_checks"][0]["integration_id"] = 123
        api.calls.clear()
        with self.assertRaisesRegex(ValueError, "another app"):
            settings.execute(api, "apply", "example/project", 7)
        self.assertFalse(api.calls)
