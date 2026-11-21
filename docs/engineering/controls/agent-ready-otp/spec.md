# Agent-ready one-time code: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving existing design and motion. This first Web slice connects the existing single input to shared input behavior and marks its value secret. The dedicated one-time-code provider, Native rendering and product authorization remain separate. The dedicated provider must not replace the existing behavior until its handling of mixed paste, external values and form validity is reconciled.

## Contract

- Preserve the controlled value and callback, numeric filtering, paste and autofill, length bounds, editable cursor and selection, one native form field, name, disabled and verification states, help and error association, public properties and existing form validity behavior. Do not infer successful verification from a full code; the host controls `verified`.
- Preserve slot dimensions, focus and caret, digit animation, joining and confirmation choreography, motion interruption and reduced-motion behavior. Retain current sizing at narrow widths and do not add ordinary outlines.
- Use shared input behavior with an explicit secret mark. Snapshots must redact the code, and rendering alone cannot create a bridge, authorize an action or submit a code. The product controls disclosure, permission and verification. The existing numeric, paste and cursor adapter remains in place in this slice.

## Evidence

Compare empty, focused, partially filled, full and verified states at narrow and wide widths. Test typing, paste, filtering, cursor edits, disabled state, form submission and validity, interrupted confirmation and reduced motion. Exercise allowed and refused agent changes and redacted snapshots in installed Vite and Next.js consumers. Run affected component and motion checks. Native and every animation frame remain separate evidence.
