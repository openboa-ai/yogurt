# Using the repository starter

## Create and initialize

1. Choose **Use this template** on the template's GitHub page. Select the destination owner, name and visibility. Copy the default branch only. Clone the new repository, create a topic branch, and work from its root.
2. Preview the project-specific files. Replace the example destination, description and existing reviewer with your values. Use `--default-branch` if the destination uses a branch other than `main`.

   ```sh
   python3 tools/initialize.py --repo example-org/my-service --description "A job scheduler" --reviewer @maintainer --dry-run
   python3 tools/initialize.py --repo example-org/my-service --description "A job scheduler" --reviewer @maintainer
   ```

   The reviewer must already have write access. The initializer updates marked sections, the workflow's branch filters and `.github/starter.json`. It checks the origin, preserves text outside its markers, and stops on a conflicting edit. Review the diff and open a PR. The generated seed initially contains the template source's reviewer. Set the intended reviewer before enrolling the destination. The generic reporting link explains how to open the destination's Security tab until initialization replaces it.

3. Confirm that source branch protection and GitHub Actions are supported for the destination's visibility and plan. New public repositories on GitHub Free for organizations support the branch rules used here. Private repositories on that plan require a separate decision about protection. [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)

## Apply GitHub settings

Use Python 3.9+ and the GitHub CLI signed in as an administrator of the destination on github.com. Run the settings commands from a **reviewed checkout of the template** at a known commit. The PR workflow has read-only permissions. Keep administrative credentials outside PR CI.

```sh
python3 tools/settings.py plan --repo example-org/my-service
python3 tools/settings.py apply --repo example-org/my-service
```

The plan shows the exact repository-level mutations. Apply reconciles the squash method, native auto-merge option, default-branch ruleset, Actions settings, secret scanning and private reporting, and Dependabot alerts and security updates. A failed API call identifies the endpoint. Run plan again after correcting the problem and apply the outstanding changes. Only the named ruleset is managed. Additional rulesets and additional required checks are retained. GitHub's per-repository controls and source files have separate lifecycles.

## Enroll and verify required checks

Open a same-repository PR targeting the default branch. Check that an invalid title fails, edit the title to a conventional one, and wait for **Contribution names**, **Repository hygiene** and **Required CI** on the same head to succeed. Supply that PR's actual number.

```sh
python3 tools/settings.py plan --repo example-org/my-service --qualify-pr 7
python3 tools/settings.py apply --repo example-org/my-service --qualify-pr 7
python3 tools/settings.py verify --repo example-org/my-service
```

The enrollment reads the workflow, latest attempt, PR head, jobs and GitHub Actions app identity. A missing producer leaves the initial repository in a pending state. Verify returns a nonzero exit code for drift or pending checks. After the onboarding PR merges, verify checks the live default-branch rules and GitHub's CODEOWNERS errors. A second plan should return an empty changes list. An ordinary documentation PR is enough to confirm merge blocking and the final squash subject on the default branch. Check fork contributions separately under the destination's contributor-approval policy.

## Update the starter

Use an issue and a protected PR to change this source. Record the source revision when distributing a change. Compare the relevant managed files and settings with each existing project, then open an update PR in that project. Preserve its README, reviewer, license, dependency lockfiles and project-specific tests. A repository generated from a template starts its own history and does not receive future file changes automatically. [GitHub template behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

The seed uses immutable Actions pins and a pinned public OpenBoa tool installer. Review both action pins and explicit tool checkout revisions when updating CI. Select the project's license and language-specific test, build and release settings when those decisions apply.
