# Agent-ready textarea: web implementation

## Accepted scope

The owner approved the behavior-provider transition with the existing design and motion preserved. This slice covers the Web multiline field and its installed entry. Native support is qualified separately.

## Contract

- Retain the existing public textarea attributes and event handlers, ref, value and default value, three-row default, label, help and error associations, form data and reset, disabled and read-only behavior.
- Apply the existing surface, typography, spacing, focus and reduced-motion treatment around the unstyled behavior provider. Keep the editable textarea as the actual focus and form element.
- Controlled host callbacks receive a user or agent value update once. An agent bridge is host-created and policy-controlled; rendering the control performs no registration or effect by itself.

## Evidence

Compare narrow and wide resting captures with the previous guide. Exercise controlled and uncontrolled typing, agent-requested and denied updates, disabled state, label associations, native form data and reset in installed Vite and Next.js fixtures. Run the affected gallery and form checks. Native and production integration remain separately unqualified.
