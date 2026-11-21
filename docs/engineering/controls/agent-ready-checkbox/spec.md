# Agent-ready checkbox: web implementation

## Accepted scope

The owner approved the component replacement plan and preservation of the current design and motion. This slice covers the existing Web checkbox, its checklist usage, installed Web entry and associated evidence. The Native renderer remains a separate implementation and qualification.

## Contract

- Preserve the existing public checkbox props, label association, controlled and uncontrolled state, `true`, `false` and `indeterminate`, disabled, required, form name and value, focus and blur callbacks.
- Use the unstyled behavior provider through the shared consumer runtime. Keep Yogurt's 24 px mark, 8 px corner, 44 px interaction area, check drawing, press motion and reduced-motion and forced-color behavior. The checklist continues to use the same checkbox.
- Preserve a native form input so submission and reset correspond to the actual state. A disabled control cannot update its state or call the host. An indeterminate activation becomes checked.
- A consumer can explicitly connect a bridge sharing the same runtime. Rendering a checkbox never creates a bridge or grants authority. The host controls actions, data and effects.

## Evidence

Capture the existing checkbox and checklist before replacement at narrow and wide sizes. Compare resting and selected presentation and motion, including controlled and indeterminate states. Exercise keyboard, pointer, form submission and reset, disabled, reduced motion and forced colors. Build installed Vite and Next.js consumers and verify bridge discovery, allowed and denied actions and state/callback agreement. Run the checkbox and gallery interaction checks. Record Native support separately.
