# U09A · Open, use and interrupt an action menu

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I09 design r1](../../../intents/controls/I09-navigate-and-dismiss/spec.md) · criterion `I09-U09A`. Parent specification SHA-256 `f2a5574f5e73bb24ba2a924991ef2f0e365a1cc15e2ace08f18d178f511aaf73`.

## Decision and ownership

The trigger identifies the menu and its open state. Use a supported keyboard entry, arrow navigation and typeahead on targets that implement it. Escape returns focus. Tab provides a predictable way to leave. Record each target’s stepping behavior and anchor the moving surface to the trigger.

**Proposed writer.** Components maintainer, `catalog/components/action-menu`. **Consumer.** A row, toolbar or guide that exposes secondary commands. **Independent verifier.** An interaction reviewer who compares the visible layer, accessibility tree and selection counter. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given one trigger, uniquely identified enabled items and a surviving focus target, open and focus the appropriate item. On selection emit a single item ID. The host owns any command or navigation.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** Opening or dismissing cannot invoke an item. A menu is unsuitable as the persistent value field or as confirmation of an irreversible decision.

## Failure and compatibility

Handle open–dismiss–open before the previous movement settles. Remove obsolete listeners on unmount. If the trigger disappears, the host identifies a meaningful focus destination.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U09A-A | Open from the keyboard, navigate by prefix, select once and inspect normal-speed opening and closing. | One enabled ID reaches the host. The active text and focus remain legible in intermediate frames. | The final screenshot looks correct while a translucent panel reveals overlapping text as it opens. |
| U09A-B | Reverse quickly, dismiss with Escape and Tab in separate runs, then repeat with reduced motion. | The final layer is unambiguous. Web follows document order. The native reference may return to the trigger and continue on the next Tab. Dismissal emits zero actions. | An invisible panel still receives keys, focus loops indefinitely, or reduced motion skips focus restoration. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I09-navigate-and-dismiss/intent.md)
