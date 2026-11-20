# The component foundation

Yogurt owns the public component names, behavior, token roles and guide examples. Web and [Native](native-stack.md) use separate renderers under the same component contract. Check [renderer evidence](engineering/controls/component-library/verification.md) for tested hosts and versions.

## Install one component

Import a named entry such as `@openboa/yogurt/text-field`, or use `yogurt add text-field --target web` to install a local entry that delegates to the pinned package. The product owns the field's label, validation and submission. [Installation](using-yogurt.md)

## One action menu across layers

| Layer | Responsibility |
| --- | --- |
| Product | Supplies available actions, their stable IDs and any effects. |
| Shared contract | Defines the trigger, available items, open state, dismissal and selection event. Opening or canceling dispatches no product command. |
| Design | Supplies type, token roles, pressed and focus states, and motion at the trigger. |
| Renderer | Handles keyboard navigation, focus return and selection in its platform. |
| Composition | A product can arrange the menu with shared primitives or edit an installed block. |

Exercise the same labels, sizes, options and behaviors in each renderer. Check selection, alternate dismissal paths, focus return, event count, rapid reversal, reduced motion and clean unmount. [Existing web specimen](action-menu.md) · [Component craft](component-quality.md)
