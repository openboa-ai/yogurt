# Agent-ready quantity: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving existing design and motion. This first Web slice verifies the existing numeric spinner's shared button behaviors and installed entry. The dedicated numeric provider, Native rendering and product authorization remain separate. The numeric provider's grid snapping differs from the current control when an existing value is not aligned to its step, so it must not replace the current adapter without resolving that difference.

## Contract

- Preserve controlled values, labels and help, custom button labels, disabled and boundary states, integer step normalization, callback behavior, live output and public import. Clicking an enabled button reports one bounded change; disabled controls do not change.
- Preserve existing sizing, spacing, button appearance, number transition, focus and reduced-motion behavior. Do not add an ordinary outline or a visible editable field.
- Use the existing shared button controls for agent actions and retain the Yogurt numeric adapter in this slice. Rendering does not create an agent bridge; the host controls authorization and effects. Disabled actions must not update the host.

## Evidence

Compare narrow and wide initial and changed screenshots. Exercise increment and decrement, bounds, disabled state, step normalization, callback counts and allowed and refused agent actions in installed Vite and Next.js consumers. Run affected quantity and motion checks. Native and every animation frame remain separately unqualified.
