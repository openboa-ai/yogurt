# Agent-ready text fields: web implementation

## Accepted scope

The owner approved replacing components on the selected behavior foundation while preserving the existing design and motion. This slice covers Web TextField and SearchField and their existing public entries. Textarea, other controls, the native renderer and a product agent bridge are separate work.

## Contract

- Retain the existing public props, native input attributes and ref, accessible label, help and error relationships, form submission and reset, controlled and uncontrolled values, change, focus and keyboard callbacks, five size choices and disabled and read-only behavior.
- Use the shared unstyled input and input group behavior with Yogurt's existing surface, padding, typography, icons and clear action. Keep the same focus, error, reduced-motion and forced-color presentation; clicking the input container must still focus the field without stealing an action button click.
- Preserve native `onChange` behavior for controlled text fields and the existing value callback for search fields. Clearing search emits one empty value and restores focus. An agent-requested value change must reach the same host-owned state exactly once and retain source-independent authorization at the host.
- A bridge is consumer-owned and explicitly connected. Rendering a field must not expose data or grant an action by itself. The host owns sensitive data, permission and effects.

## Evidence

Capture both fields at narrow and wide widths in the existing guide. Check the public size roles, labels and descriptions, typing, clear and focus behavior, controlled and uncontrolled values, native form data and reset, disabled and read-only states, keyboard input and reduced motion. In isolated installed Vite and Next.js consumers verify discovery and allowed and denied value changes with host state and callback agreement. Run the affected guide and gallery tests. Report native qualification separately.
