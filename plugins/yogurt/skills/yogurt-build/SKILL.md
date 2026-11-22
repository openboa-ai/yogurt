---
name: yogurt-build
description: Implement or change an OpenBoa screen, control or composition with the product's pinned Yogurt SDK on web or Vercel Native. Use when the deliverable is a working product change.
---

Start with what the person needs to do and identify the target from the consumer's configuration. This skill can take a plain-language request through design, implementation and verification.

1. From the consumer root, run `node "<skill-directory>/../../bin/resolve-sdk.mjs" . <web|native>` using the directory of this SKILL.md. Open the task map in the returned design entry. For a whole screen, follow its composition guide for hierarchy, actions, states and an editable recipe if one fits. If the pin cannot resolve, use `--inspect` and the installation guide before proceeding.
2. Translate the task to the closest pattern or recipe and select the smallest set of parts that covers it. Use the installed `describe-pattern.mjs --list` or `yogurt list` when the ID is unknown. For example, finding an item and returning from its detail belongs to finding and inspecting a record. Use the host for the query, selected ID, routing, permissions and results.
3. Add `--lookup <id> [<id> ...]` to resolve the chosen pattern and controls. Read the relevant `guidance` for use, companions and states. Use each Web `importStatement` as printed and open its declaration for props. On Native run the returned install command, then mount the typed view or register the printed markup source. Install a matching block by its block ID using the installed CLI. Check additional controls against the same pin.
4. Compose against the installed roles and slots. Keep the reading edge, primary action and recovery controls predictable at normal and narrow sizes. For reusable motion, resolve the installed `motion-` ID for the target. Use the capability reported by the SDK.

For a decision with an uncertain acknowledgement, use the [tested Web recovery example](../../references/examples/review-decision.web.tsx) and resolve `pattern.review-decision pattern.track-request` together. Keep the original receipt with its record and submitted revision in the host so it survives dismiss and reopen.

Use token roles and language from the installed pin. Preserve the host's routes and callbacks. Report an unavailable adapter before proposing a local fallback.

For a user-requested agent-operated Web surface, check the installed SDK's `@openboa/yogurt/agent` entry and control support before wiring a bridge. The host supplies the action policy, observation scope, confirmations and service authorization; an action policy does not filter snapshots. A request can return `ok: true` while an individual step has `result: false`; verify the steps and actual host state. Do not create a bridge merely by rendering a control. Report a missing entry or unqualified Native connection rather than inferring support.

Run the installed consumer checker and exercise the normal and recovery paths in the actual renderer. Verify layout at a narrow width and keyboard focus where the task changes views. Report the version, target, component IDs, observations and remaining gaps.
