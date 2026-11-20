import unittest

from check_conventions import errors


def pull_request(branch="fix/42-retry-timeout", title="fix(queue): retry interrupted jobs", *, author="user", fork=False):
    return {
        "repository": {"id": 1},
        "pull_request": {
            "head": {"ref": branch, "repo": {"id": 2 if fork else 1}},
            "user": {"login": author, "type": "Bot" if author == "dependabot[bot]" else "User"},
            "title": title,
        },
    }


class ConventionsTest(unittest.TestCase):
    def test_topic_and_title(self):
        for branch in ["fix/42-retry-timeout", "ci/checks", "codex/repository-bootstrap"]:
            with self.subTest(branch=branch):
                self.assertEqual(errors("pull_request", pull_request(branch, "feat(api)!: change response", fork=True)), [])
        for branch in ["main", "Fix/Login", "feat/double--dash", "fix/"]:
            with self.subTest(branch=branch):
                self.assertTrue(errors("pull_request", pull_request(branch)))

    def test_title_edit_and_working_commits(self):
        pr = pull_request(title="WIP")
        pr["commits"] = [{"message": "WIP"}]
        self.assertTrue(errors("pull_request", pr))
        pr["pull_request"]["title"] = "docs: explain retry behavior"
        self.assertEqual(errors("pull_request", pr), [])
        for title in ["fix:", "fix:   ", "fix: first\nsecond", "custom: retry"]:
            with self.subTest(title=title):
                self.assertTrue(errors("pull_request", pull_request(title=title)))

    def test_dependabot_branch_identity(self):
        branch = "dependabot/github_actions/actions/checkout-6"
        self.assertEqual(errors("pull_request", pull_request(branch, author="dependabot[bot]")), [])
        self.assertTrue(errors("pull_request", pull_request(branch)))
        self.assertTrue(errors("pull_request", pull_request(branch, author="dependabot[bot]", fork=True)))

    def test_final_squash_subject_and_identity(self):
        push = {"repository": {"default_branch": "main"}, "ref": "refs/heads/main", "after": "a", "head_commit": {"id": "a", "message": "fix: retry (#12)\n\nCloses #10"}}
        self.assertEqual(errors("push", push), [])
        push["head_commit"]["message"] = "WIP\n\nfix: only in the body"
        self.assertTrue(errors("push", push))
        push["head_commit"] = {"id": "b", "message": "fix: retry"}
        self.assertTrue(errors("push", push))

    def test_initial_generated_commit_only(self):
        event = {"repository": {"default_branch": "trunk"}, "ref": "refs/heads/trunk", "after": "a",
                 "created": True, "before": "0" * 40, "head_commit": {"id": "a", "message": "Initial commit"}}
        self.assertEqual(errors("push", event, initial_root=True), [])
        self.assertTrue(errors("push", event))
        event["created"] = False
        self.assertTrue(errors("push", event, initial_root=True))
