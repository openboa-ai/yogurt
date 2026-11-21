# Native input alignment

Status: reviewed follow-up under the accepted component library contract. This scope applies to Native markup, not Web or an established Native parity claim.

## Intent and contract

Make the native input group a single-line labeled input with its host-provided adjacent action in the same row, and make numeric spinner actions compact icon controls. The host continues to supply current values, edit/increment/decrement messages, the input-group slot, and first/last boundary booleans. Preserve template names and arguments, one request per explicit action, bound-disabled behavior, accessible names, and regular keyboard interaction. Do not introduce an automatic submission, change data, or add a service effect. Use supported native controls and shared theme roles.

The input group continues to dispatch `edit`, and the action slot remains supplied by the host. Numeric spinner continues to dispatch `decrement` and `increment`; the displayed value remains host-owned. Its two compact symbol buttons remain named Decrease and Increase. The current OTP remains a single labeled editable field because a code-slot presentation must not compromise input, paste, or host ownership; an independently qualified native slot renderer is needed for matching that presentation.

## Evidence

Instantiate the edited templates in the native catalog and run strict markup validation. Render an installed sample with both controls; confirm input can be edited and each enabled button reports its distinct message once, while boundaries disable the appropriate action. Inspect the narrow layout and keyboard names. Record actual Native renderer and SDK evidence separately from source or markup compilation; do not claim OTP appearance or full visual/motion parity.
