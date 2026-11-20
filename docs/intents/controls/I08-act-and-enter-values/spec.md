# I08 design · Submit only the value or action I intended

Parent: [originating intent, revision 2](intent.md). Review: NOT ACCEPTED. Design revision 2. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I08-U08A.** Button, icon button and action groups share visible pressed, focus, pending and unavailable states. An icon-only action has an explicit accessible name. The host chooses the single primary consequence in context.
- **I08-U08B.** Specify text, search, textarea and select fields plus checkbox, radio and switch. Use radio for an exclusive set, checkbox for independent choices, and switch for an immediate setting. Keep a persistent label and associate help and errors.
- **I08-U08C.** A combobox edits or filters a value and exposes a related suggestion list. Typed text, active suggestion and committed value are separate states. Choosing a command and choosing a value have different host effects.

**Constraint.** Yogurt owns control semantics and callbacks. The client owns validation rules, submission, authorization and idempotency. New control families require a real product case.

**Design alternative to rule out.** A placeholder disappears with the only field label. A button changes width at the first spinner frame or fires from both keydown and click.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U08A · Activate one named action](../../../engineering/controls/U08A-activate-an-action/spec.md) | `catalog/components/actions` | Forms, toolbar actions and primary commands | A keyboard and pointer tester observing the host callback counter |
| [U08B · Edit and validate a labeled value](../../../engineering/controls/U08B-edit-labeled-values/spec.md) | `catalog/components/fields` | Forms, search, filters and short single or multiple choices | A field tester comparing the source model, keyboard order and accessible descriptions |
| [U08C · Choose the intended value from a long list](../../../engineering/controls/U08C-choose-a-search-result/spec.md) | `catalog/components/combobox` | Searchable option pickers in forms and filters | A keyboard and screen-reader tester who knows the option IDs in the fixture |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

The [first four design pairs](../../../engineering/controls/first-four/README.md) provide the first visual review. They refine U08A and U08B at the level of one named control. Their browser study is a design specimen.

## Integrated acceptance

Exercise an enabled action, disabled or pending action, empty field, invalid edit and recovered state in one form. Confirm that a failed field retains safe input and its recovery message is reachable.

**End scene.** Type into a named field, correct a validation error, then activate a labeled action with a keyboard. Observe the exact value and one callback. Repeating input while pending cannot submit a second command.

**Current sources and open decisions.** [patterns.json](../../../../catalog/patterns.json) · [Controls](../../../../system.html#controls) · [components.css](../../../../styles/components.css) · [Delivery status and owner decisions](../../../status.md)
