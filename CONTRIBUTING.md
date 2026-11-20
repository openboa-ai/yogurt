# Contributing

Start a short-lived branch from the default branch and open a pull request for one change. Include the reason, the checks you ran, and a related issue when applicable.

| Item | Example | Rule |
| --- | --- | --- |
| Topic branch | `fix/42-retry-timeout` | Use `<type>/<lowercase-kebab-slug>`. An existing issue number is optional. |
| PR title | `fix(queue): retry interrupted jobs` | Use `type(scope): summary`. The scope is optional. Add `!` before the colon for a breaking change. |
| Working commits | `WIP`, `fixup! retry` | Choose messages that help you develop and review the change. |
| Squash commit on the default branch | `fix(queue): retry interrupted jobs (#42)` | Keep the conventional PR title in the GitHub squash dialog. The PR number suffix is allowed. |

Types are `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `build`, `chore`, `perf`, `style`, and `revert`. Use a short, nonempty scope and a descriptive summary. `Fix My Thing` fails as a branch name and `WIP` fails as a PR title. Managed branches may use `codex/<kebab-slug>`. Dependabot can use its generated branch names and follows the same title convention.

GitHub runs **Contribution names** when you open a PR, push commits, or edit its title. **Repository hygiene** runs actionlint, checks the diff for whitespace errors, and scans the reachable history and current files with Gitleaks. A finding remains relevant even if a later commit removed the value. If a real credential was exposed, revoke it and use the [private reporting channel](SECURITY.md). Keep example credentials inactive.

All changes to the default branch go through a squash PR. Resolve review conversations before merging. The designated code owner reviews changes to CI, ownership, scanner policy, and security reporting. A push check validates the final subject written to the default branch. GitHub Free allows the merger to edit that subject, so keep the default title in the merge dialog.

For a README change, select **Enable auto-merge** on the PR while checks are pending. GitHub squashes the PR once all branch requirements are met. **Required CI** checks that both naming and hygiene jobs finished successfully.

The format follows [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/). Package-specific build and test commands will be documented when the project has an application manifest.

## Running checks locally

Run the required suites and check whitespace before pushing a topic branch. Each suite must run at least one test and report zero skips.

```sh
python3 -I .github/scripts/run_required_tests.py .github/scripts
python3 -I .github/scripts/run_required_tests.py tools
git diff --check origin/HEAD...HEAD
```

With Gitleaks CLI installed, scan committed history and your current files. Both commands redact detected values.

```sh
gitleaks git --redact --log-opts="--full-history HEAD" .
gitleaks dir --redact .
```

CI also verifies the tool versions and scanner configuration, checks workflow syntax with actionlint, and validates the current PR metadata on GitHub.
