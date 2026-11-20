# Evaluation protocol

Evaluate rules by observing tasks from the [consumer journeys](journeys.md). Use the existing [cases](evalset.json) as inputs for building the suite, and record the result against the exact candidate. The fixture drives the real consumer or a stateful simulated external service. The grader records whether each condition occurred.

## Runner and result contract

Use a suite index that binds each case ID to a fixture type, runner, grader, timeout and required evidence. A run selects a case or split, an immutable package and plugin revision, a model profile and an output directory. The fixture provisioner creates a fresh project and host state for each attempt. The host adapter receives the prompt, fixture mount and allowed tools. Keep expected answers, other candidate outputs and grader-held cases outside the agent mount. Return observed skill loads with their source paths, tool effects, artifacts and actual usage when available.

An installed-web fixture uses npm to install the local archive offline, with lifecycle scripts disabled. Pin validation requires the real project and installed locks and the Node-resolved entry. Install the package and confirm its guide before handing the fixture to the agent. Tasks that need missing or incompatible guides declare a distinct fixture. An unpacked archive alone supplies no installed-read evidence.

For a missing-guide result, accept a direct check of the installed path or the official inspection command when its successful trace identifies the same pin and missing resource. The design entry is the guide a consumer reads to choose a pattern. A renderer template does not fill that role. Regrade earlier traces under the same rules when repairing an evidence matcher.

For read-only attempts, allow shell reads from the exact fixture and the runtime needed to run its tools. Block shell writes and network, disable hosted web search, and keep runner credentials outside the shell environment. Probe the effective tool configuration before dispatch with a read inside the project and a denied read of a synthetic file next to it. Verify the SDK resolver through the same policy when the case needs the installation. Treat a failed probe as an unavailable fixture. Keep setup duration out of model latency and record the probe outcome with the attempt.

Persist one result for each attempted case with its case ID, revision pair, target, variant, attempt number and source evidence. Grade every required assertion as passed, failed or unobserved. The overall case passes when its required assertions pass. A blocked renderer, timeout, missing trace or unavailable model gets its own result and reason. Start the next case from a fresh fixture. Preserve outputs separately from masked summaries. Run the deterministic checks without a model so a model or service outage does not hide a packaging or runtime regression.

Use the platform's available capability to observe skill discovery. Explicitly invoking a skill exercises output behavior. It leaves automatic selection unobserved for that attempt. Compare visible and accessible UI states through the consumer host. Record blind review choices against anonymously keyed captures and reveal their versions after grading.

In the staged Codex runner, a complete turn containing only reasoning and a delivered answer supplies evidence of no skill read requiring a tool call. Record that as `none` for routing, including missed activation on a case that requires a read. A trace with an unparseable line, unknown event, or tool activity without a recognizable skill read remains unobserved. Compare observed file reads and tool-free turns only. Do not infer a read from an agent's claim or infer how the host ranked undisclosed skills.

For a targeted outcome diagnosis, allow an explicit instruction to read a named skill from the staged inventory. Record that instruction and any observed read in the attempt. When no read is observed, report the output separately from skill effectiveness. Keep explicit invocations out of routing cases.

Recognize returned skill frontmatter in a completed command trace even when a later command in the same shell exits unsuccessfully. A filename with no returned frontmatter is insufficient. Allow a matched comparison to stage the generated project instruction index before the session. Record its bytes and digest. Keep the index disabled by default and require the compatible SDK fixture to generate it.

Maintainer cases use the repository's discoverable evaluation skill alongside the shared skills. Mark these cases in the suite so the provisioner can install the maintainer entry only in that context. Product fixtures use the consumer plugin inventory.

| Question | Evidence and grader |
| --- | --- |
| Did the right skill run? | Start a clean session with the normal skill inventory and prompt only. Record the opened entry. Report missed activations, extraneous activations and unnecessary cross-skill handoffs. Backend-only and unrelated issue prompts establish when no Yogurt entry should open. |
| Did the installed kit supply the answer? | Mount the consumer with the pinned installation only. Verify required links, the guide lookup, package imports and installed Native files. An incomplete installation fixture proves the reported error path. |
| Did the task work? | Keep the host event log and inspect DOM or accessibility state using the supported renderer. Count writes, compare receipt identity and verify revocation. Test focus by operating the keyboard. Report a missing renderer as unexercised. |
| Can someone recognize the intended design? | Compare unlabelled views at their real sizes. Observe normal-speed and reduced-motion roster states. Give the reviewer a task and labels for the expected semantic states. Record preference, ties, stated reason and any accessibility failure. |
| Was the proposal processed correctly? | Start with an empty or seeded simulated issue tracker. Test product versus Yogurt ownership, absent authority, deduplication and creation followed by a lost response. Count calls and persisted issues at each destination. |

Seed development and validation using the existing 21 cases. Require a corresponding fixture and grader for each case before counting it in the benchmark. Group related requests by scenario when splitting data. Prepare a fresh final set with at least one new product task and near-miss prompts, held by the grader until the intended release candidate is fixed. A case used to tune a candidate becomes development or validation material.

Grade the public holdout seeds against their supplied facts. The printing brief must preserve the original station, job and receipt through delayed confirmation. The release decision must hold adoption after the cross-account disclosure even when the candidate is faster and more often preferred. For copy, automate checks for factually empty and unavailable states and supported actions. Leave the English voice judgment and overall sign-off unobserved until an independent reviewer has examined the proposed strings. These seed fixtures prepare the grader and do not replace a fresh final set.

For skill changes, use the same model, effort, fixtures, SDK pin, tool access and budget for both versions. Compare the old workflow and the candidate in fresh sessions. Use a no-skill baseline for a new capability. Run each stochastic case three times as an initial sample and record how many attempts contributed. Vary the order of the two variants and retain cache measurements.

For model selection, hold the workflow revision fixed and run the same tasks using small-only, large-only and small-first with one evidence-based escalation. Models used for ordinary implementation must show that they can follow the installed API contract and pass normal and recovery behavior. Escalate an unresolved cross-product rule, conflicting evidence or a targeted code retry that still fails. Record availability, exact model ID and effort. Include both attempts when recording routed performance.

A candidate with a forbidden write, duplicate effect, exposed revoked data or an unconfirmed completion claim fails. Require all deterministic install, authority and state checks and review every newly observed critical failure. Report pass rates per scenario family. Use the candidate as the default only when quality holds and repeated results support a time or cost gain, or the reviewed quality gain justifies the expense. Retain the baseline if there is insufficient evidence. Open the final set for the selected candidate and its baseline after tuning.

Record task, version, model, effort, loaded skills, fixture, grader, cache condition, attempts, results and end-to-end time. Collect input, cached input and output tokens as reported by the runtime. A reasoning subtotal belongs to output where already included by the runtime. Report median latency, sample size and total spend across attempts divided by accepted tasks. Separate observed charge from a rate-card estimate and leave both unknown when pricing does not apply. Unknown results do not count as passes.

Before sending model requests, validate the selected cases, arms and repeats against an explicit call ceiling. Count the possible routed retry in that ceiling. Start ordinary smoke checks with the small profile and choose the comparison arms explicitly. Regrade existing captures after a grader correction before deciding whether to pay for fresh responses. Run deterministic fixture checks before expanding to a repeated comparison.

For routed decision-screen trials, escalate only when the small model uses the shared dialog and sends the correct command exactly once, but fails a receipt-recovery or outcome check. Compile errors, missing controls, incorrect effects and observed receipt exposure on another record remain visible for diagnosis without escalation. Pass the affected stage to the larger model. Keep results from the previous route under its original revision.

## Recorded comparisons

Both comparisons used Codex CLI 0.144.5. Small was `gpt-5.6-luna` at low effort. Large was `gpt-5.6-sol` at low effort. The earlier workflow used the previous skill on the small model. The routed arm began on the small model and counted the larger retry when it ran.

| Task and runner revision | Workflow | Accepted | Model calls | Median end-to-end | Tokens per accepted task |
| --- | --- | ---: | ---: | ---: | ---: |
| Row mapper · `d43dbec` | Earlier skill | 3/3 | 3 | 4.634 s | 11,367 |
| Row mapper · `d43dbec` | Small | 3/3 | 3 | 4.340 s | 13,249 |
| Row mapper · `d43dbec` | Large | 3/3 | 3 | 4.681 s | 14,328 |
| Row mapper · `d43dbec` | Routed | 3/3 | 3 | 4.105 s | 11,682 |
| Installed decision · `374a93e` | Earlier skill | 0/3 | 3 | 57.156 s | No accepted tasks |
| Installed decision · `374a93e` | Small | 0/3 | 3 | 90.010 s | No accepted tasks |
| Installed decision · `374a93e` | Large | 1/3 | 3 | 88.104 s | Incomplete usage |
| Installed decision · `374a93e` | Routed | 0/3 | 5 | 158.202 s | No accepted tasks |

Row-mapper assertions covered access, ordering and zero versus missing values in a code fixture. Decision assertions used the installed SDK and the simulated command ledger, including receipt recovery. Four decision timeouts had no usage receipt. The passed decision response used 252,584 reported tokens including cached input. Monetary charges and rate-derived estimates were unavailable for both comparisons.

Keep model selection open. The code fixture passed on every arm and the decision task had just one accepted response. Both comparisons preceded the current plugin's packaged decision example.

### Routing diagnostic

At `3ff61bfa8737edba8dafcc47156b4ce1e76cc7b2`, two low-effort small-model calls used the installed `.16` SDK and generated project index. One implementation request read three skills and took 36.743 seconds with 99,216 reported tokens. One unrelated caption edit read the build skill and took 39.452 seconds with 135,849 reported tokens. Both failed their routing assertions. Per-call charges were unavailable.

The host had global instructions alongside the staged project index. The traces attempted to follow that unrelated context even though the shell preflight denied access outside the fixture. Exclude these calls from isolated skill comparisons. Use an evaluator identity with a clean Codex home and compare against the same staged project before judging the current plugin. [Host instruction loader at 0.144.5](https://github.com/openai/codex/blob/rust-v0.144.5/codex-rs/codex-home/src/instructions/mod.rs)

## Screen composition

Pair two layouts with the same task, content, SDK pin and effect contract. Give a reviewer the task and anonymously keyed variants in varied order. Present both at comparable widths, color schemes and scale. Review narrow and wide views, the normal state, and a recovery or access change. When an interaction is in question, supply the running view or a recording and keep still observations distinct from interaction evidence.

| Look for | Example prompt to the reviewer |
| --- | --- |
| Orientation and emphasis | Which item is this about? What do you notice first? Where would you go next in this state? |
| Grouping and alignment | Which value or time belongs to which information? Where do you look to compare items? |
| Density and readable order | Does the compact layout preserve what you need? Can you read realistic long content and reach the next action? |
| Continuity | Can you return to the same task after opening evidence, changing window size, or dismissing a control? |
| State and recovery | Can you tell ongoing work from a request for attention or a confirmed result at the size where you first see it? Can you reach the intended recovery? |

Record preference, tie or unavailable for each pair, with the observation behind the decision. Keep the Playwright or native assertions alongside the judgment. Passing the journey verifies behavior. The preference requires its own observation.

Use the reading fixture as a development pair. Compare the coverage summary and chart when they are separate headings and when the coverage sits next to the selected room. The same task is to identify the missing reading, inspect its source and time, and recover the correct visible state if access is revoked. Extend the evaluation with a narrow list and detail flow that preserves selection, and an agent roster where a waiting item needs attention while other work continues. Keep these inputs separate from the final held-out cases.

Build the roster replay from an isolated Web installation. Show the same agent and appearance at 24 CSS px in each row. Present thinking, working and waiting for you in random order under anonymous letter labels. Keep the order in a separate grader receipt and offer a replay control. Check that motion advances at normal speed and that restarting replaces the animation instances. In a separate reduced-motion browser context, check that the status labels remain readable and that no avatar animation runs. Keep mechanical checks distinct from an independent reviewer's state identifications.

## Fixtures to implement first

| Fixture | Setup and observations |
| --- | --- |
| Installed guidance and rollback | Use two isolated synthetic consumers with their own lock or immutable Native artifact receipt. Record their initial pins. Move one to the candidate and run lookup and entry verification in both. Roll back the first and repeat. Check the actual resolved SDK revision and guide location on each run. Add disposable copies with a catalog missing or an incompatible format. |
| Decision and receipt | Use the two similarly labelled records and in-memory ledger in `build-review-decision`. Capture the ledger after cancel and after one explicit confirmation. Independently control the server's effective result and what acknowledgement the UI receives. Persist the original receipt across a reopened view and verify lookup targets it. Record user-visible and accessible status before and after reconciliation. Adapt the same host contract to Native for the claimed Native support. |
| Partial record and revocation | Populate a record with observed zero, a missing observation and an observed nonzero value. Keep the original observation time distinct from refresh time. Look up the chart presentation and accessible text before and after revocation while the readings are open. The protected projection is absent in both after revocation. |
| Delegated issue creation | Drive the host and simulated tracker independently to observe the actual write count. Include destination substitution, absent grant, a duplicate with a different title, concurrent identical proposals and a dropped response with delayed visibility. Retain request and subsequent lookups separately. [Feedback cases](plugin-and-feedback.md#acceptance) |

Include an example of every result state in the runner's own tests. An absent grader, unavailable runtime, unobserved activation and missing rate card must remain visible in its report.

### Generated decision screen

For `build-review-decision`, give the model the installed web SDK and the component input contract. Take its returned component into a separate browser fixture. Allow direct imports from React and the installed Yogurt package. Serve the bundled page in a fresh context at a synthetic origin. Intercept requests at that origin to drive an in-memory ledger and deny other requests. Keep the ledger, its completion control and the grader outside the generated component. The fixture has no live product data or credentials.

Check mounting and actual inclusion of a shared dialog or decision control. Operate cancel and confirm on two distinct revisions. Check the count and target of business commands at each step, then close and reopen the record. Hold confirmation unavailable until the grader completes the original receipt. Check rendered and accessible states before and after that event. Preserve the submitted artifact, per-stage observations and screenshots. Treat an unavailable browser as unobserved, a compile or interaction error as failure, and record model latency and browser grading time separately. Keep this behavioral result separate from the masked visual review.

Selecting a record may open confirmation immediately or present another control to open it. Check which state is visible before clicking. Use the confirmation button only for the intended submit. Record keyboard focus return as a review observation and apply the acceptance assertions defined for this case.

A receipt may appear in a summary and in the detailed status. Record how often it appears and check that at least one visible reference matches the original ID on the correct record. The other record must expose no matching reference. Grade the cancel and confirm effects from the ledger independently of the receipt display.

Check the shared dialog used on the screen. A supported root import and a supported component subpath are equivalent ways to select the same published control. Confirm that an installed dialog renders when the selected decision opens. Replay retained root-import and subpath responses with the same package and host before comparing models again.

Use the frozen decision input from the original run's revision and verify the SDK archive digest against that run before replaying. Save revised browser evidence alongside the original outcome, with no model charges or new token rows for the replay. A previous attempt that supplied no browser artifact retains its original outcome.

For a grader-held variation, select the decision case explicitly with `--case build-review-decision --decision-scenario <file>`. The scenario contains a prompt, two revisioned records, the selection and action labels, and a grader-only receipt with its eventual revision. Keep the scenario outside the mounted consumer. Pass only the prompt, records and visible labels to the agent. Reject malformed scenarios before provisioning and record the exact scenario SHA-256 with the run. Replay takes the original scenario as a fourth argument and verifies the digest before installing the SDK. Keep the public seed available without a scenario. Calibrate a new scenario with both a passing implementation and an implementation that submits again or looks up the wrong receipt. Grader inputs used for calibration or tuning do not qualify as an independent final case.

### Delegated issue outcomes

Expose the reporting broker through a fixture-only stdio tool. Bind its project, grants, mock tracker and evidence location at startup. Let the agent supply report fields and intent. The tool has no live GitHub connector and accepts no destination or file path from the agent. Keep its ledger and effect log outside the read-only agent workspace. Persist tool startup, repository lookups, searches, write attempts and observed broker results. A missing service leaves the case unobserved.

Evaluate a product-owned draft, a lost acknowledgement after the authorized repository records a create and a previously filed issue with a different title. Grading compares the agent's final claim and report fields with the observed mock receipt and effect log. Reconciliation and duplicate checks use the shared broker rather than an answer-only simulation.

### Design and review handoffs

Grade the sidebar brief against the installed shared entry, ownership boundaries and the proposed keyboard test. For the coverage and roster review cases, grade the findings against the supplied captures and source facts. A finding distinguishes present evidence from the test proposed to verify a fix. Motion at roster size still needs a normal-speed capture or a live replay. Grade that evidence boundary separately from the labels in the still frames.
