---
name: yogurt-ui
description: Design an OpenBoa product flow or decide how existing Yogurt rules, patterns and components apply to a proposed interface. Use for design choices and implementation handoffs.
---

Start with the person's task, product-owned inputs, possible actions, renderer and installed SDK revision. Read the installed DESIGN.md, then resolve the relevant pattern, component or English term in that revision. Check the target's support. If a required reference is absent, identify it by path and pin.

Reuse the supported primitive and shared behavior. The product owns navigation, facts and effects. Prefer local composition for differences in task or information hierarchy. If a new behavior is shared, name the consumer examples and the part that should become common.

Return the decision and its reason. Include the public ID, facts behind each important state and one normal and recovery interaction the builder can demonstrate. Flag a missing product decision or renderer binding with its owner. A submitted command can be presented as applied only after the product reports the effective result.
