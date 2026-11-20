---
name: yogurt-ui
description: Find design guides, patterns or components in the installed Yogurt SDK. Use for installation and platform support questions, new screen designs and implementation handoffs.
---

Locate this SKILL.md. Resolve paths from its directory. Run `node ../../bin/resolve-sdk.mjs <project-root> <web|native>` for a design task. Read the returned design entry and run the installed lookup for the relevant pattern and renderer.

For an installation question or a failed resolution, add `--inspect`. Inspect an npm install with `web` even when checking whether its files could inform a Native design. Use `native` for a declared Native SDK pin. Report the installed version, available design entry, missing resources and the exact check to repeat. Treat installed files as file evidence and reserve interaction claims for a runtime observation.

For a whole screen, layout or flow, open [screen composition](../../references/composition.md) from the plugin root, two directories above this skill. Decide what the user should recognize first, which information belongs together, and which next action to emphasize. Compare layouts with the same content when reading order or density is uncertain. Describe what changes at a narrow size.

Ground component behavior or props in the installed guides, public types or Native templates. Keep navigation, information order, product decisions and effects with the host. Return the recommended composition, its state mapping and one observable normal and recovery interaction. An original receipt can confirm an outcome only after the host observes it.
