# U13A · Present and confirm the scoped choice

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I13 design r1](../../../intents/patterns/I13-review-a-decision/spec.md) · criterion `I13-U13A`. Parent specification SHA-256 `64896a0ceb6a7213199d58f846621abda0f06c8aa3ca35dca8814dc8f27bca4b`.

## Decision and ownership

Display the target, revision, consequence, alternatives and cancellation before a consequential request. Give the committing control a verb and object. Separate opening the review from sending its answer.

**Proposed writer.** Product patterns maintainer, `catalog/patterns/review-decision`. **Consumer.** Meatball decision review and other host-authorized decisions. **Independent verifier.** A fixture observer with two similar records and a host command ledger. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

The host provides scope, exact subject/revision and allowed choice. Only explicit confirmation emits that tuple once. Hand any returned request identifier to the host’s tracking view.

**Predecessors.** [U09B](../../controls/U09B-dismiss-a-dialog/spec.md) · [U10A](../../controls/U10A-show-task-feedback/spec.md)

**Denied case.** A stale, missing or unauthorized revision cannot emit the decision callback. Yogurt cannot widen the scope, supply a missing choice or execute the effect itself.

## Failure and compatibility

If the underlying decision changes, dismiss or re-present the updated consequences. A lost acknowledgement after dispatch goes to the original request path rather than repeating the confirmation.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U13A-A | Compare records with matching short names, cancel A, then explicitly confirm B at the displayed revision. | The ledger contains exactly one entry for B and none for A. The UI reports only the observed stage. | The screen confirms B but the ledger records A or two submissions. |
| U13A-B | Change the revision between opening and confirmation, then remove permission. | No stale or denied response reaches the host. The reason and available recovery are legible. | A disabled-looking control still calls the original callback. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/patterns/I13-review-a-decision/intent.md)
