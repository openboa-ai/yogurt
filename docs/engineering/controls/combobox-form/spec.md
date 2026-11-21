# Combobox form value

Status: reviewed corrective scope under the owner-selected component foundation replacement. The existing public `Choices` contract already exposes `name` and a host-controlled `value`; the foundation specification requires existing props, native form behavior and callbacks to remain compatible. This correction makes the named combobox's committed value available to an enclosing Web form. It does not change the selection model, redesign the popup or establish Native support.

## Contract

- When `name` is nonempty, submit exactly one successful form control carrying the host-controlled `value`, which is the selected option ID. Submit an empty string when the host supplies an empty value. Do not submit the visible option label or temporary search query. When `name` is absent or empty, add no named form value.
- When disabled, exclude the combobox value from form data. Restore the same host-controlled value when re-enabled. Keep the visible combobox disabled and preserve existing accessible label, help, error, focus and keyboard behavior.
- Typing, opening, closing or cancelling the list does not commit a new value. Selecting an enabled option requests the selected ID through the existing `onValueChange` callback; the host decides whether and when to update `value`. A disabled option cannot commit or trigger that callback. Form serialization follows the latest host value, including changes made outside the combobox.
- Reset does not invent an uncontrolled default or change the existing callback contract. A host that wants a different value after reset updates its controlled `value`; the form then serializes that host value. The host owns reset cancellation and other product effects.
- The submitted control is presentation-free and must not create an extra accessible field, visual surface, focus stop or ordinary outline. Preserve the existing public component ID, export, registry, types and motion.

## Evidence

In the built Web component, inspect `FormData` for an initial selected ID, a temporary query, an enabled keyboard selection, an externally changed value and an empty value. Verify absent names and disabled fields are omitted, disabled options cannot commit, and a host-controlled form reset produces the host's chosen value without an unsolicited selection callback. Check label and interaction behavior at narrow and wide widths. Exercise the installed component independently in Vite and Next.js before claiming those hosts, and report Native evidence separately.
