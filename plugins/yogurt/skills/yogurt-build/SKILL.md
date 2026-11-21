---
name: yogurt-build
description: Implement or change an OpenBoa screen, control or composition with the product's pinned Yogurt SDK on web or Vercel Native. Use when the deliverable is a working product change.
---

From the consumer root, run `node "<skill-directory>/../../bin/resolve-sdk.mjs" . <web|native> --lookup <id> [<id> ...]` using the directory of the discovered SKILL.md. Pass the relevant pattern and component IDs together. The result gives the installed public imports, exact declaration paths and short declarations, or Native template paths. Open a declaration without inline text when you need its props. Use the resolver without IDs when you only need the installed guide paths.

Use each returned component's `guidance` to select it, combine it and verify its relevant states. Use task patterns for complete flows. Missing guidance is an open gap; check the installed contract instead of inventing a rule.

On web, copy each component's `importStatement` exactly. Resolve every additional component before importing it. A shared `types` path is only for inspection: never combine names from different public entries into one import.

Resolve reusable motion components by their installed `motion-` ID. An unavailable Native entry is not a Native implementation.

For a decision that can lose its acknowledgement, query `pattern.review-decision pattern.track-request` together. Keep the original receipt ID with the submitted record and revision in host state that survives closing the detail view. Reopening the original record must recover that receipt. Opening another record must leave it hidden. Use the host's lookup to confirm the outcome.

For that Web flow, start from the [tested decision example](../../references/examples/review-decision.web.tsx). Reuse its SDK imports, scope checks and recovery sequence. `Receipt` renders its state heading and, with `onLookup`, its check action; do not duplicate either. Replace the simulated ledger, sample records and endpoint bindings with the project's host operations.

Use token roles and language from the installed pin. Preserve the host's routes and callbacks. Report an unavailable adapter before proposing a local fallback.

For a user-requested agent-operated Web surface, check the installed SDK's `@openboa/yogurt/agent` entry and control support before wiring a bridge. The host supplies the action policy, observation scope, confirmations and service authorization; an action policy does not filter snapshots. A request can return `ok: true` while an individual step has `result: false`; verify the steps and actual host state. Do not create a bridge merely by rendering a control. Report a missing entry or unqualified Native connection rather than inferring support.

Run the installed consumer checker and exercise the normal and recovery paths in the actual renderer. Report the version, target, observations and remaining gaps.
