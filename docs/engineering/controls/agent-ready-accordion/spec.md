# Agent-ready accordion: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving design and motion. This slice covers the Web accordion and installed entry. Native rendering and product agent authorization remain separate.

## Contract

- Preserve the public label, items and disabled options, collapsed initial state, single collapsible and multiple behavior. Retain existing keyboard selection and focus behavior including disabled options, heading hierarchy and trigger-to-panel accessibility relationships. Closed content must have the same lifetime as before.
- Preserve existing geometry, typography, indicator rotation, opening and closing motion, focus treatment and reduced-motion behavior. Do not introduce ordinary outlines.
- Use the shared behavior provider without creating a bridge during rendering. An explicitly connected host can inspect and change supported values under its own policy; products own permissions, disclosure and effects.

## Evidence

Compare narrow and wide captures with closed and open sections. Exercise single and multiple sections, keyboard, disabled items, panel lifetime, accessibility relationships and allowed and refused agent operations in installed Vite and Next.js fixtures. Run component and affected motion checks. Native and complete frame-by-frame motion are separate evidence.
