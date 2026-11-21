# Native input alignment

Status: reviewed follow-up under the accepted component library contract. This scope applies to Native markup, not Web or an established Native parity claim.

## Intent and contract

Make the native input group a single-line labeled input with its host-provided adjacent action in the same row, and make numeric spinner actions compact icon controls. The host continues to supply current values, edit/increment/decrement messages, the input-group slot, and first/last boundary booleans. Preserve template names and arguments, one request per explicit action, bound-disabled behavior, accessible names, and regular keyboard interaction. Do not introduce an automatic submission, change data, or add a service effect. Use supported native controls and shared theme roles.

The input group continues to dispatch `edit`, and the action slot remains supplied by the host. Numeric spinner continues to dispatch `decrement` and `increment`; the displayed value remains host-owned. Its two compact symbol buttons remain named Decrease and Increase. The current OTP remains a single labeled editable field because a code-slot presentation must not compromise input, paste, or host ownership; an independently qualified native slot renderer is needed for matching that presentation.

For labeled text, search, multiline, split, slider, field and label templates, use the supported small text size for the 13-point label role and a six-point label-to-control gap. Keep the split field's eight-point internal gap and the existing controls, template inputs, slots, `edit`, `edit_first`, `edit_last`, `clear` and `adjust` messages. This applies established shared presentation values only; it does not change validation or editing behavior.

For select, select-picker, combobox and date-picker, display the supplied label using the same small text role and six-point gap while keeping the popup in its existing stack. Apply the label role to OTP, keypad and agreement; retain the keypad and agreement list spacing. Preserve all input, choice, dismissal and navigation callbacks, host-owned state and slots. OTP remains one editable field with its existing input and paste behavior.

Display the existing radio-group and selection-list labels using the small label role and six-point gap, preserving each native group, list and host slot. Use the same label role for the calendar label, retaining month navigation, day selection and disabled states. Keep native checkbox, toggle, grouping and form interactions unchanged when the SDK offers no verified equivalent styling or motion.

Use one SDK switch with its default geometry and motion, the supplied visible and accessible label, the host-owned checked state, and the existing `toggle` message. Its label uses the shared text color in both appearances; the thumb retains its existing switch foreground role. Do not add a separate pressable row or override the switch dimensions. The theme remains the source of shared visual roles.

Indent the individual agreement choices by 12 points below their group control. Keep keypad keys within a readable bounded width while allowing the host to provide a narrower space; retain existing labels, state and input callbacks.

Keep the verification input bounded to 320 points and use a 56-point input height while retaining its single editable value and paste behavior. Use the shared small label role for rating. These dimensions do not claim segmented-code or star rendering support.

## Evidence

Instantiate the edited templates in the native catalog and run strict markup validation. Render an installed sample with both controls; confirm input can be edited and each enabled button reports its distinct message once, while boundaries disable the appropriate action. Check the labeled templates' typography, spacing, popup placement and existing callbacks at narrow width. Inspect the narrow layout and keyboard names. Check that the single switch displays its label and sends one `toggle` request per pointer or keyboard activation. Record actual Native renderer and SDK evidence separately from source or markup compilation; do not claim OTP appearance or full visual/motion parity.
