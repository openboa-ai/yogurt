---
name: yogurt-review
description: Verify or critique an implemented interface, screenshot or recording against Yogurt. Use for interaction regressions, accessibility, visual hierarchy, voice or motion in an existing artifact.
---

Begin with the user's task and the artifact supplied for review. For an installed consumer, resolve its pin with `node ../../bin/resolve-sdk.mjs <project-root> <web|native>` relative to this skill folder. Start from the relevant pattern and inspect the user-visible behavior on the named renderer.

For whole-screen critique, use [screen composition](../../references/composition.md). Inspect information order, alignment, grouping, density and the relationship between the main action and its subject. Name what to move, combine or give more room and which task that change helps.

Observe keyboard focus after dismissal, status before and after recovery, or both visible and accessible data after revocation as applicable. Review motion in a normal-speed recording at the real size and check reduced motion separately. A source check or still capture supplies only the evidence it shows.

Return actionable findings with the file and line for source evidence, or the renderer, action and state for interaction evidence. Include the reproduction, expected behavior, owner and any unverified scope. Keep a review request within review.
