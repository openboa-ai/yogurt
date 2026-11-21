# Agent-ready toggles: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving current design and motion. This slice covers the Web toggle and toggle group, their normal exports and installed examples. Native support and product agent authorization remain separate.

## Contract

- Preserve the controlled toggle and group properties, disabled options, accessible labels, single and multiple selection, deselection, callback values and keyboard navigation. Toggling an option reports one change and does not submit a surrounding form.
- Preserve current button and grouped-option sizes, text, spacing, selected colors, visible keyboard focus and motion. Ordinary surfaces must not gain outlines.
- Use the shared behavior provider and preserve the existing public exports. Rendering alone never creates an agent bridge. An explicitly configured host can inspect and change supported values and retains control of permissions, disclosure and effects.

## Evidence

Compare narrow and wide captures before and after in both states. Exercise pointer, keyboard, single and multiple selection, deselection, disabled items, form behavior, and allowed and refused agent changes with host callback counts in installed Vite and Next.js fixtures. Run affected catalog and interaction checks. Native rendering, complete animation frames and live product behavior require separate evidence.
