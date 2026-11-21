# SDK-default input motion

Status: reviewed follow-up to the SDK-default motion decision.

Use SDK input and switch interactions without decorative text mirroring, caret springs or switch stretch. Keep the existing `motion` prop and `SpringTextInput` export compatible, while rendering the ordinary SDK input. Preserve labels, descriptions, controlled and uncontrolled values, input events, selection, composition, imperative maximum-length enforcement and form behavior.

OTP digits and verification state settle immediately, preserving the editable input, selection, paste, digit limits and verified status. Rating stars and its status settle to the current hover or selected value immediately while preserving pointer, keyboard, selection and accessible status. Keep appearance and layout through existing CSS variables; do not alter colors, sizing, pending feedback or public callbacks.

Verify typing, composition, selection and reset for both input entry points, switch callbacks, OTP editing/paste/verification, and rating pointer and keyboard behavior. Check default and reduced-motion rendering and confirm no blank or hidden final state. Build and browser checks are separate evidence.

Ghost suggestions are visible immediately. Accepting a suggestion leaves the real textarea text visible and hides the decorative accepted-text duplicate; retain keyboard acceptance, caret, controlled/uncontrolled values and accessible descriptions. Verify typing and acceptance at default and reduced motion and in forced colors.
