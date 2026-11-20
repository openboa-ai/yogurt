# U09B · Resolve or cancel a modal prompt

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I09 design r1](../../../intents/controls/I09-navigate-and-dismiss/spec.md) · criterion `I09-U09B`. Parent specification SHA-256 `f2a5574f5e73bb24ba2a924991ef2f0e365a1cc15e2ace08f18d178f511aaf73`.

## Decision and ownership

A modal has an accessible name, context, dismiss path and intentional initial focus. Constrain keyboard focus while open. A consequential action is explicit. A sheet can use the same decision contract on a compact target.

**Proposed writer.** Components maintainer, `catalog/components/dialog`. **Consumer.** Confirmation flows and sheet presentations on constrained screens. **Independent verifier.** A keyboard or assistive-technology tester observing focus and the host effect log. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

The host provides a decision revision, alternatives and fallback destination. Opening displays the facts. Cancel closes it. Confirm reports the selected current choice once, and the host decides the domain effect.

**Predecessors.** [U04A](../../foundations/U04A-compose-responsive-type/spec.md) · [U08A](../U08A-activate-an-action/spec.md)

**Denied case.** Opening, outside dismissal or platform back cannot submit confirmation. A hidden background item cannot receive interactive focus while the modal owns it.

## Failure and compatibility

On revision change invalidate the prior confirmation. If the invoker was removed, move focus to the documented surviving destination. Restore page scrolling after interruption and unmount.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U09B-A | Open at keyboard focus, tab through the modal, cancel, then confirm in a new fixture. | Background controls are unreachable while open. Cancel emits zero and explicit confirmation reports one choice. | The layer looks modal but focus traverses the obscured page. |
| U09B-B | Replace the record while the prompt is open and remove its original trigger. | The old decision cannot be confirmed, scrolling recovers and focus lands on a named surviving element. | An earlier confirmation applies to a new record or leaves focus on the document root. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I09-navigate-and-dismiss/intent.md)
