# U14A · Track the original request through uncertainty

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I14 design r1](../../../intents/patterns/I14-track-a-request/spec.md) · criterion `I14-U14A`. Parent specification SHA-256 `e205860c75f7a81e1fb8088a342713ee6fb4e33b036055c63fede4d9a05bd205`.

## Decision and ownership

Display distinct sent, unknown, confirmed and rejected states with the source request ID or an authorized reference. The available recovery on uncertain delivery is a lookup when the host permits it.

**Proposed writer.** Product patterns maintainer, `catalog/patterns/track-request`. **Consumer.** Decision receipts and client command histories. **Independent verifier.** A reader of the independent command ledger, receipt history and rendered state. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Bind display to the original host request, subject and admissible state revision. Reopening or refreshing reads the same receipt. A matching authoritative result can update the visible outcome.

**Predecessors.** [U02A](../../language/U02A-resolve-english-copy/spec.md) · [U10A](../../controls/U10A-show-task-feedback/spec.md)

**Denied case.** A timeout is never proof of failure. A check-status action cannot generate a fresh business command. A different subject’s receipt cannot be joined by label or time alone.

## Failure and compatibility

Ignore older receipts and correlate after remount. If access or the correlation key is unavailable, make the uncertainty explicit and stop the lookup at the permitted boundary.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U14A-A | Send once, lose the acknowledgement, reopen and return the matching authoritative outcome. | One command exists throughout. The identifier and final UI match the original receipt. | A completed animation or second submission supplies the success state. |
| U14A-B | Deliver a receipt with another subject or revision; disable lookup permission. | The foreign result is ignored and the unavailable recovery cannot be invoked. | The UI resolves “Done” because the unrelated request has a similar description. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/patterns/I14-track-a-request/intent.md)
