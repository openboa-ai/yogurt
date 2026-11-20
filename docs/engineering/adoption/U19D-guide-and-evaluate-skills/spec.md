# Yogurt skills and their evaluation

Revision 2. The project owner accepted the adoption and evaluation plan, including project-level GitHub delegation. This record defines the work in delivery order. Each implementation change uses the matching scope below and a confirmed repository base. The skill texts below remain review candidates. [Execution handoff](execution.md) · [Intent](intent.md) · [Repository and implementation order](repository-transition.md) · [Consumer journeys](journeys.md) · [Evaluation protocol](evaluation.md) · [Evaluation cases](evalset.json)

## Rules and responsibilities

Yogurt defines the shared brand, English voice, token roles, component behavior and target support. The SDK implements those rules. The plugin teaches a consumer's agent to apply them and shows the evidence behind a decision. The adopting product supplies its own data, available commands and permission checks. Its owner decides adoption and release.

| Decision | Rule | Observable result |
| --- | --- | --- |
| Reuse a component | Use the supported entry on the installed target for the same user action. | The import or native item resolves at the consumer's pin. Keyboard, focus and recovery behave as documented. |
| Compose a screen | Use shared primitives, tokens, language and interaction behavior. Let the product choose the order of information and its actions. | Two products can have different sidebars using the same collapse, dismissal and focus behavior. |
| Propose a shared change | Use a minimal reproduction for a shared defect. Compare real tasks and state contracts before promoting a local composition to a preset. | A defect can be reported from one product. A proposed preset identifies repeated behavior and the slots that vary. |
| Decide an exception | Name the unresolved rule, owner, affected target and proposed local fallback. The owner decides whether to change the shared rule. | The handoff distinguishes an observed gap from an approved exception. |

The current rule text lives in [design system rules](../../../design-system-rules.md). Brand and language start in [DESIGN.md](../../../../DESIGN.md). Keep one authoritative version of each rule. Use links and installed catalog IDs from skills.

## Plugin shape

One independently versioned Yogurt plugin distributes the consumer skills below. The maintainer evaluation skill belongs to its development tooling. The SDK remains the product dependency. The SDK ships the rules, catalog and lookup from the same revision as its public entries. The plugin declares the catalog formats it can read. Each run resolves the consumer's locked SDK and chosen renderer. Test plugin discovery, rule links, pattern lookup and public imports from a fresh installation with the author checkout unavailable. A mismatch reports the incompatible versions and available next action. Existing consumers can continue to use the previous compatible pair.

The [plugin and feedback implementation design](plugin-and-feedback.md) specifies discovery, version matching, delegation and the reconciliation cases for review.

| Candidate entry | User asks for | Result |
| --- | --- | --- |
| [yogurt-ui](candidates/yogurt-ui/SKILL.md) | Design a flow or decide which rule applies | Pattern, actual states, ownership, reuse decision and acceptance example. Keeps the established entry name. |
| [yogurt-build](candidates/yogurt-build/SKILL.md) | Build or change a screen | Scoped product change using the selected SDK, with normal and recovery evidence. |
| [yogurt-review](candidates/yogurt-review/SKILL.md) | Test or critique an existing interaction | Reproduced findings tied to the affected state, rule, target and evidence. |
| [yogurt-feedback](candidates/yogurt-feedback/SKILL.md) | Suggest an addition, resolve ownership or report a defect | Local decision, actionable draft, existing issue or one confirmed new issue. |
| [yogurt-evaluate](../../../../.agents/skills/yogurt-evaluate/SKILL.md) | Compare skill versions or model policies in the Yogurt checkout | Paired outcomes, failures and resource measurements with a retain, revise or inconclusive decision. |

Most requests take one path. An implementation can use its existing test commands directly. A review can return an issue-ready finding directly. Invoke another skill only when the requested outcome needs that work. Load the task-specific rule or component entry on demand.

The build skill starts with the resolver next to the discovered skill, then reads the relevant pattern and the exact types or templates for the selected controls. A consequential decision with uncertain acknowledgement also uses the original-receipt pattern. Keep the receipt bound to its host-owned record and submitted revision across view dismissal and reopen. Exercise that record and another record when verifying recovery. This refinement uses the current SDK and its existing contracts. Verify compatibility with the same SDK pin after upgrading and rolling back the plugin.

Offer a short project instruction index for ordinary UI work. Generate it from a validated SDK pin using the installed rules, pattern IDs and public renderer bindings. A consumer can add the printed section to its own `AGENTS.md`. The resolver only prints the section. The consumer retains control of its instructions and the SDK pin. Skills remain available for build, review and feedback workflows that need more context. Verify Web and Native output from independent installs. Compare instruction delivery on matched fixtures with the prompt, package, skill revision and model fixed.

Link the Web build skill to the existing exercised decision view when the task needs receipt recovery. Maintain one example source and use it in the installed consumer browser checks. Its simulated host illustrates product ownership while the view uses the published SDK. The example must demonstrate cancel, explicit confirmation, switching to another record, and recovering the original receipt. Its product and effect callbacks are example data. Evaluate adaptation and reserve fresh tasks for independent evaluation of other products.

## Screen composition

The design and review skills share a reference for whole screens and multi-step tasks. It teaches the choice of reading order, alignment, density, layout and state visibility. A product keeps control of its layout and task. The reference adds no new public SDK API, token or required preset. It must be available with the installed plugin. Short control-level requests can continue directly to the relevant SDK entry.

Compare compositions using the same installed SDK, task, data and states. Include one paired example in which the hierarchy or grouping changes while the data and behavior still pass the same user journey. Check the normal and recovery states at a narrow and a wide window size. Record visual preference independently from technical assertions. [Composition evaluation](evaluation.md#screen-composition)

## GitHub feedback

Resolve the target repository from the adopting project's configured bindings. A product fact or permission error belongs to the product. A defect reproducible at the shared SDK boundary belongs to Yogurt. A request for a new shared pattern includes the task, existing alternatives, consumer examples and the proposed public behavior. A product-only composition can stay local.

An issue draft contains the target, affected SDK pin and platform, expected and observed behavior, minimal sanitized reproduction or design examples, impact and an observable acceptance condition. Read the project's explicit destination and allowed issue operation from trusted configuration. Use the actor and access supplied by the host. With no binding or access, produce a draft.

Search open and closed issues using the affected public ID, symptom and target. Reuse a matching issue and report its URL. A closed issue can be evidence of a regression on a new pin. Explain that distinction before proposing a new report. For an authorized create, record a stable identity for the same report and serialize identical pending requests within the host. When a create response is lost, look up that identity before doing anything else. An outcome that remains unknown stays pending without another write. Test the observed write count against a stateful fake tracker.

## Model and resource policy

Choose models at execution time. The initial candidates are a larger reasoning model for ambiguous decisions and a smaller model such as Terra for work with a defined contract. Record the exact model and effort used in each run. An unsupported tier is a visible availability result. Each consumer can set its own time or spending limit.

| Work | Initial route to test | When to spend more |
| --- | --- | --- |
| Resolve pins, inspect tokens and exports, count writes, run assertions | Local code | Missing evidence returns to the caller with the exact missing input. |
| Compose supported controls, implement an agreed spec, prepare a report or run a known review | Small model with the relevant contract | Escalate once when the contract conflicts, ownership is ambiguous or a targeted retry still fails an acceptance case. |
| Design new shared behavior, settle competing accessibility or UX requirements, adjudicate an ambiguous evaluation | Larger model with the conflicting evidence | Request the owner's decision when the choice changes product meaning, authority or brand policy. |

For evaluation, compare small-only, large-only and routed execution on matched tasks. A larger model should receive the unresolved question, evidence and relevant contract. Include context transfer, tool calls, retries and escalations in the total. A subscription run can expose tokens and time while its per-run charge is unknown.

## Evaluation and promotion

1. Freeze the inputs, public SDK and plugin revisions, model settings, tools and grader version. For each routing case give the agent only the prompt, relevant inputs and the normal discoverable skills. Observe which skill it actually loads. Score omissions, incorrect activations and unnecessary handoffs, including requests that need no Yogurt skill.
2. For output cases give each fresh agent the same starting files and task. Use a no-skill baseline when introducing a capability, the existing skill on revisions and a candidate under the same settings. Give graders the private expected behavior. Keep the evaluation file and other agents' answers outside the solver's workspace. Use isolated GitHub doubles and disposable consumers.
3. Grade what happened. Inspect actual imports and pixels, operate the public control, revoke access or lose an acknowledgement, and count effects. Check a visual or motion judgement at product size with versions hidden from the reviewer. A missing runtime, unavailable recording or unchecked rule is a missing result. Record the case result separately from the visual preference.
4. Diagnose one development failure and change one thing, such as the description, a rule example, reference lookup or choice of model. Compare on the validation split. Reserve holdout families for the selected candidate and replenish them once they influence edits. Retain the previous version and evidence if a change adds a critical regression.
5. Compare quality first. Unauthorized or duplicate effects, exposure after revocation and false claims of a completed action fail the candidate. Report other per-case results, activation precision/recall, and visual preferences with ties. A quality-equivalent improvement can reduce cost or latency. Record the trade-off if the measures disagree. Use paired repeats and disclose sample size and uncertainty before selecting a default.

Record run ID, case, split, variant, model, reasoning effort, SDK/plugin revision, toolset, observed skill loads, assertions, actual artifacts, cache condition, retries, escalations and elapsed time. Record total input, the cached subset, output and any reported reasoning subset. Sum billed usage across all attempts. For a known applicable rate card use uncached input = total input − cached input and add each separately priced category once. Record currency and effective pricing date. Missing billing data stays unknown. Compare total cost and total tokens across all attempts divided by successful tasks, pass rate and end-to-end latency. Report median and tail latency with sample counts once repeated runs cover the workload.

## Admission evidence

| Criterion | Evidence required |
| --- | --- |
| Installation | Two independent fresh consumers resolve the versioned plugin and SDK, including the references each skill loads. Exercise the missing-resource and incompatible-pin paths. |
| Delivery | A web task and a Vercel Native task use the supported public entry. The run records the target that was exercised, normal interaction and recovery. |
| Governance | Observe local composition, a shared defect, a duplicate, a missing repository binding and a lost write response on the fake tracker. Check disposition, destination and write count. |
| Optimization | Use the fixed eval set with output artifacts, previous and candidate versions, model/effort, measured usage and latency. Record what improved, regressed or remains inconclusive. |

The local SDK package file list includes the component catalog and consumer checker. It omits the existing standalone skill, pattern catalog and pattern lookup script. Binding and distributing these resources is an implementation item. The installed-only case makes that gap reproducible.

[Agent Skills format](https://agentskills.io/specification) · [Routing evaluation](https://agentskills.io/skill-creation/optimizing-descriptions) · [Output evaluation](https://agentskills.io/skill-creation/evaluating-skills)
