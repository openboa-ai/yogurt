# Yogurt skill evaluation

Run from a reviewed local checkout with Node and the Codex CLI. The runner uses the current ChatGPT login and opens a fresh, read-only session for each attempt. It mounts workspace skills and synthetic inputs in disposable consumer roots. Codex marketplace discovery is checked separately by `checks/plugin-catalog.mjs`.

```sh
node --test checks/evals/grade.test.mjs
node checks/evals/run.mjs --out <new-report-directory> --case build-series-rows
```

Use repeatable `--case` values or select a `--split`. The runner defaults to the small arm and one model call. Use `--plan` to see the maximum calls before starting a comparison, and set `--max-model-calls` when the selection requires more than one. This limit includes possible routed retries. The baseline uses the earlier workspace skill on the small profile. The runner reads it from the recorded Git revision or accepts the matching file with `--baseline-skill <file>` and checks its digest. Small and large use the candidate skills. Routed starts with small and tries large once after an observed outcome failure. The [model profiles](profiles.json) record the initial tested model IDs and efforts. They describe evaluation roles.

Use `--sdk <archive>` for the installed-web fixture. The runner installs the archive using npm offline, skips lifecycle scripts and checks the installed lock and resolver. This fixture exercises SDK guidance and import resolution. Browser fixtures separately install React dependencies and drive the interface. The runner applies a named Codex permission profile for each attempt. It verifies fixture reads and checks that sibling reads and fixture writes are denied. Source and other attempts stay outside the allowed tool paths. Unsupported fixture or permission setup produces `fixture-unavailable` without a model attempt.

Use `--legacy-sdk <archive>` for `decide-installed-only`. The runner checks the archive digest against the fixture's recorded revision and verifies the installed guide and known missing resources. The agent sees the installed project and prompt. The expected inventory stays with the evaluator.

Run `compose-first-screen` with `--sdk <archive>` to check selection and composition from a task that names no controls. The fixture has a locked Web package and a Native consumer whose archive digest is recorded in its config. The grader covers pattern selection, public bindings, retained host state and recovery. Measure actual Web and Native behavior in the client runtimes.

Run `build-review-decision` with `--sdk <archive>` and Chrome available. The agent returns a component. The browser grader bundles it against the fixture's installed SDK and exercises the decision and receipt with a simulated host. Each attempt saves the host ledger, accessibility evidence and available screenshots. End-to-end time includes browser grading, and the report also gives model time separately.

After changing decision grading, replay completed outputs using `node checks/evals/replay-decision.mjs <previous-report> <same-sdk-archive> <new-output-dir>`. The replay uses the original suite revision and a verified package digest. It saves new browser observations without calling any model.

To use an independent decision brief, add `--case build-review-decision --decision-scenario <file>` to a run or plan. The grader's JSON contains `prompt`, two `records` with `id`, `shortName` and `revision`, `labels` with the ordered `select` names, `action`, `dialog` and `back`, and a grader-only `receipt` with `id` and the eventual `revision`. Keep this file outside the consumer. For replay, append the same file as the fourth argument. Its bytes must match the run's recorded digest.

For an outcome-only diagnosis, add `--invoke-skill yogurt-build` to tell the model to read the staged build skill. The report records whether a read was observed. This mode does not score automatic routing.

Add `--agent-guide` with a compatible `--sdk` archive to place the generated index in the isolated consumer's `AGENTS.md`. Keep other arguments fixed when comparing with a run that omits this flag. The fixture receipt records the index size and digest.

In a routed decision trial, a larger model may retry a receipt or outcome failure after the shared dialog and correct command are observed. Import failures, incorrect commands and cross-record receipt exposure keep their first result for diagnosis.

The feedback cases use a stdio tool backed by the shared issue broker and a synthetic tracker. Run `node --test checks/evals/issue-fixture.test.mjs` to exercise draft, recovery and deduplication through the tool. Live evaluation artifacts include the simulated issue calls and receipts. No GitHub connector is configured for these trials.

Executable graders cover row behavior, profile decisions, design and review handoffs, installed guidance, generated decisions and delegated issue outcomes. Cases without their required evidence retain unobserved assertions. Routing records a selected skill when the CLI shows a read of its instructions. A complete tool-free response records no read. An incomplete trace or unexplained tool activity leaves activation unobserved. Keep the final grade inputs independent of tuning before release validation.

Retain `run.json`, per-case results and `summary.json`. Raw transcripts and answers stay in the report directory. All attempts, including escalations, count toward token and latency totals. A missing usage receipt remains unknown. ChatGPT subscription calls report usage when available, with the monetary charge unavailable to this runner. For a separately priced host, `--rates` accepts a reviewed JSON rate card with `currency`, `asOf` and a `models` table keyed by exact model ID. Each model supplies `input`, `cachedInput` and `output` rates per million tokens. Computed figures are estimates and are stored separately from observed charges.

See the [evaluation protocol](../../docs/engineering/adoption/U19D-guide-and-evaluate-skills/evaluation.md) for promotion criteria and renderer evidence.
