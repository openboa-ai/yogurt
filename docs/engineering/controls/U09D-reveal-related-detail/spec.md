# U09D · Reveal related detail without taking over the task

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I09 design r1](../../../intents/controls/I09-navigate-and-dismiss/spec.md) · criterion `I09-U09D`. Parent specification SHA-256 `f2a5574f5e73bb24ba2a924991ef2f0e365a1cc15e2ace08f18d178f511aaf73`.

## Decision and ownership

Use a disclosure for an embedded section. A nonmodal popover may contain a related lightweight control. A tooltip supplies supplemental noninteractive text. Essential names and instructions remain visible or accessible without hovering.

**Proposed writer.** Components maintainer, `catalog/components/disclosure`. **Consumer.** Record rows, supporting information, popovers and contextual help. **Independent verifier.** A reviewer operating the trigger and inspecting focus, expanded state and the revealed content. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

The host provides the permitted detail and a labeled trigger. Expansion toggles the related region, updates its state and preserves a sensible focus path. An interactive popover declares dismissal and its fallback destination.

**Predecessors.** [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** Opening detail may not trigger a domain command, expose unauthorized facts, or place interactive controls inside a tooltip. A tooltip is not a substitute for a required field label.

## Failure and compatibility

Collapsing while focus is inside moves it to the surviving trigger or a meaningful host destination. Withdrawing inputs removes the detail. Reopening never replays the last contained action.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U09D-A | Expand a record row, enter its detail and collapse it by keyboard. | The correct region, state and focus are observable; no command is sent. | The disclosure icon rotates but the accessible content stays collapsed. |
| U09D-B | Open a popover with a control, revoke the underlying fact and repeat with touch-only input. | Revoked content disappears, focus remains reachable and an essential instruction is available without hover. | A hidden node or tooltip still exposes the prior fact. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I09-navigate-and-dismiss/intent.md)
