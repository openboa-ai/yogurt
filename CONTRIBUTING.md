# Contributing

Yogurt is also a customer of its SDK. A change to a shared decision should improve the installed component, the guide and the products that adopt that revision. Start with [why Yogurt exists and who owns each decision](docs/design-system-rules.md#why-yogurt-exists).

## Changing shared UI

1. **Reproduce the promise at the public entry.** Name the component ID, SDK revision, target, starting state, user action, expected result and observed result. A report about pressing Tab into `input-otp` starts with the installed field and that keypress. A missing component starts with the task a consumer cannot express using the current API.
2. **Choose the owner before editing.** Follow the [source map](docs/design-system-rules.md#one-source-for-ui) from the catalog to the role, renderer, recipe or product. Trace how a consumer reaches it. A demo can supply data and callbacks. If a demo has to draw the control or implement its focus handling, correct the public entry and use it in the demo. Preserve published IDs and compatibility entry points when changing the recommended default.
3. **Exercise the change at the right boundary.** Choose the smallest check below that could fail for the reported reason. Fix the owner, run that check again, and repeat the original action in the affected consumer. Extend the check to other targets or consumers that read the changed decision. Use the existing release suites for release-wide claims.
4. **Leave a reproducible result.** In the existing issue or PR, record the revision, public entry, command or interaction, observed result and any target or state still open. When work resumes, replay that path first. A reviewer should be able to see the change with the same pin and inputs without reconstructing the previous session.

For a new component, start with a real composition that needs it. State what a person does, what changes on screen, what the host supplies and which existing control comes closest. Put a working default in the public renderer first. Build the example with it, try a realistic constraint such as a long label or a narrow column, and use the result to refine the API. A consumer should be able to reproduce the example using only the documented entry and public parts. Put the choice and verification states in the component's catalog guidance so the guide and agent can both find them.

When several controls show the same symptom, trace one all the way from the product to the source. If OTP and other inputs acquire the same outer box, first find which renderer draws it on focus. Prove the correction in a running consumer before applying it across the family. Batch checks for every affected binding, then exercise each distinct interaction on its target. Report which states were sampled.

| Decision under review | Evidence that answers it |
| --- | --- |
| A shared design role reaches the React UI | Change the role in a disposable fixture. Check the generated stylesheet and a running React consumer that uses it. For a running layout claim, also inspect the affected control on that target. `npm run tokens` regenerates outputs. `npm run check:tokens` detects stale outputs. |
| A guide, installer or agent selects the intended control | Resolve the public ID through the affected paths with the same packed SDK and target. Inspect the installed entry and use it in a consumer. `node --test checks/design-sources.mjs` covers token propagation and public guide imports. |
| A visible state, interaction or transition works | Trigger the reported state on the affected target. For the borderless OTP, click and Tab into the six-cell field, enter a digit and check the active cell. Verify that keyboard focus is visible within the field and the unwanted outer box stays absent. For a motion change, exercise the transition and its reduced-motion result. |
| Browser and desktop WebView run the same design | Use the same React example, size, theme and interaction. Compare visible focus and motion at actual size in the browser and in the packaged app. |
| A refactor preserves an accepted design | Compare old and new public outputs with the same input and state. Use the accepted behavior or an observation made before the edit as the expectation. A planned appearance change requires its own expectation. |

### Review and regression rules

- State the broken promise in terms of input and observable outcome. An assertion that reads its expected value from the renderer being tested can pass with the same mistake on both sides. Keep the accepted example, expected result or independent observation available to the reviewer.
- Add a regression alongside a fix when it catches the original failure. Confirm it fails against the old behavior and that a supported case stays green. A changed expectation, removed state, refreshed snapshot or switch from a real interaction to a fixture needs a reason tied to an explicit change in the contract. Review that decision against the previously accepted revision.
- Match the claim to the evidence. A build proves compilation. An import check proves which implementation is selected. A screenshot shows a particular frame. A keyboard, focus or transition claim needs the interaction in the running target. Keep unobserved states open.
- If the same problem returns, trace the path that bypassed the owner. Put the cheapest reliable regression at that boundary. Before making a check mandatory, try a known failure and a valid change. On re-review, inspect the changed path and its dependents. If another pass yields the same result, revisit the diagnosis before spending another run.

## Submitting a change

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

For a README change, select **Enable auto-merge** on the PR while checks are pending. GitHub squashes the PR once all branch requirements are met. **Required CI** requires naming, hygiene, shared UI source checks and WebKit interactions to succeed.

The format follows [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/). The [component verification record](docs/engineering/controls/component-library/verification.md) describes SDK and renderer coverage.

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
