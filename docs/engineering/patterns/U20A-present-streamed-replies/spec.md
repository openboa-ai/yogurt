# U20A · Follow a partial agent reply without losing place

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I20 design r1](../../../intents/patterns/I20-follow-an-agent-response/spec.md) · criterion `I20-U20A`. Parent specification SHA-256 `02756b81f1b2e189242919d65c543851489a62996111cfa22110b475631399ac`.

## Decision and ownership

Identify speaker and reply with stable keys. Distinguish streaming, interrupted, completed and unavailable replies in English. Use a restrained activity indication and avoid announcing each token.

**Proposed writer.** Product patterns maintainer, `catalog/patterns/agent-response`. **Consumer.** Conversational surfaces and task transcripts. **Independent verifier.** A reader observing the message fixture, scroll position, accessible announcements and host action log. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given an authorized message ID, ordered fragments, generation and supported controls, display only the current reply in reading order. Stay anchored for a person reading older content. A labeled action can return to the latest update.

**Predecessors.** [U10A](../../controls/U10A-show-task-feedback/spec.md)

**Denied case.** Yogurt cannot infer completion from inactivity, create a retry in place of an uncertain reply, or interpret animation as evidence about agent work. A stop action exists only when supported.

## Failure and compatibility

Ignore duplicated or out-of-scope fragments, render an interrupted reply as partial and resume from the same source when allowed. If access ends, remove that content including accessible text.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U20A-A | Read an older turn while a current reply receives two fragments and a completion. | The reading position stays put, one meaningful completed status is available, and returning to latest shows the exact confirmed text. | Incoming tokens yank the reader down or flood the screen reader. |
| U20A-B | Interrupt, replay a fragment, deliver a late fragment from another agent and then revoke access. | No duplicate or foreign text appears and revoked content is cleared. Any stop/retry action count matches the host ledger. | A late chunk is attached by display name to the wrong speaker. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/patterns/I20-follow-an-agent-response/intent.md)
