---
name: yogurt-review
description: Verify or critique an implemented interface, screenshot or recording against Yogurt. Use for interaction regressions, accessibility, visual hierarchy, voice or motion in an existing artifact.
---

Begin with the user's task and the artifact supplied for review. For an installed consumer, resolve its pin with `node ../../bin/resolve-sdk.mjs <project-root> <web|native>` relative to this skill folder. Start from the relevant pattern and inspect the user-visible behavior on the named renderer.

For whole-screen critique, use [screen composition](../../references/composition.md) and audit against the six Yogurt `0.2.0` spatial placement grammar criteria: (1) inline status badges beside titles, (2) trailing edge strictly isolated for actions or timestamps, (3) control height and baseline parity (`32px`/`36px`/`40px`/`44px`), (4) intrinsic-width actions with right-aligned `[Discard] [Primary]` footers, (5) framed `Card` containment for focused panels vs full-width workspaces, and (6) single reading edge with unified 2 px Ink Blue `:focus-visible` rings and zero initial mount fly-in on `Tabs`/`SegmentedControl`. Inspect Light and Dark surfaces (Warm Neutral `#FAF9F7`/`#F3F2EF`/`#FCFBFA` light, `#161513`/`#1D1C19`/`#24221F` dark, plus `paper`/`mist`), crisp `--yg-border-control` resting boundaries, disabled button hierarchy, and zero horizontal overflow at `1440px` and `390px`. Name what to move, combine or give more room and which task that change helps.

Observe keyboard focus after dismissal, status before and after recovery, or both visible and accessible data after revocation as applicable. Review motion in a normal-speed recording at the real size and check reduced motion separately. A source check or still capture supplies only the evidence it shows.

For an agent-operated surface, inspect what the host exposes and test allowed and refused actions against observed host state. A request can return `ok: true` while an individual step has `result: false`; verify each step and the actual host state. An action policy does not filter observations, and an unsuccessful multi-step request does not prove earlier steps were undone. Distinguish a local bridge fixture from an actual model or Native runtime.

Return actionable findings with the file and line for source evidence, or the renderer, action and state for interaction evidence. Include the reproduction, expected behavior, owner and any unverified scope. Keep a review request within review.

For a composed screen, start from the person’s task and the installed composition guide. Compare the same flow at normal and narrow sizes. Identify the main reading edge, appropriate action emphasis, visible state and the return path. Report the actual component or recipe and the renderer that exhibited the problem.
