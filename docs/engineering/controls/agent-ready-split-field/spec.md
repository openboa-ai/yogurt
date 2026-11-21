# Agent-ready split field: web implementation

## Accepted scope

The owner approved replacing component behavior while retaining design and motion. This slice covers the Web split field and its installed entry. Native rendering and product authorization remain separate.

## Contract

- Preserve the public legend, part labels and IDs, per-part controlled value, input mode, maximum length, separator, callback and empty-list behavior. Editing one part must not alter another.
- Preserve the existing dimensions, spacing, typography, separators, focus treatment, responsive behavior and reduced-motion treatment. Do not add ordinary outlines.
- Use the shared input behavior for each actual field. Rendering does not create a bridge. An explicitly configured host can discover and change only allowed parts; it controls disclosure, permission and effects.

## Evidence

Compare narrow and wide guide captures. Exercise multiple parts, selection and editing, maximum length, label associations, keyboard focus, host callback identity and allowed and refused agent changes in installed Vite and Next.js consumers. Run affected component checks. Native and full motion-frame parity remain separate evidence.
