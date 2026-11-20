# U12A · Render one authorized record projection

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I12 design r1](../../../intents/patterns/I12-inspect-a-record/spec.md) · criterion `I12-U12A`. Parent specification SHA-256 `c01648aac6d1a60cb889be7301a0f917696f68637484208b34af142f38b7b83b`.

## Decision and ownership

Show subject, source, observed time, coverage and units together. Distinguish unavailable, partial, stale, denied and withdrawn states. Reserve value slots for facts actually supplied.

**Proposed writer.** Product patterns maintainer, `catalog/patterns/inspect-record`. **Consumer.** Sourdough Board Client and other read-only detail views. **Independent verifier.** A reader comparing visible and accessible facts with a revisioned fixture. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

The input binds subject, authorized scope, projection revision and as-of timestamp. Opening reads that projection. A permitted refresh asks the host for a read of that same subject.

**Predecessors.** [U10A](../../controls/U10A-show-task-feedback/spec.md)

**Denied case.** The component cannot infer access from a cached value, issue a business command, label an unknown balance as zero or represent a new shell load as a fresh observation.

## Failure and compatibility

Access loss clears affected data and chart/table alternatives before displaying further subject content. Late responses for the previous account, subject or scope cannot repopulate it.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U12A-A | Open an authorized stale fixture with missing coverage. | The source fixture matches every visible value, displayed original as-of time and explicitly missing field. | The page looks current because the UI substituted the render time. |
| U12A-B | Revoke access and deliver the old read after the next subject opens. | A reviewer finds no previous facts in visible DOM, accessibility output or state-derived tooltips. No write was sent. | Removing the card visually leaves the old values in an accessible description. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/patterns/I12-inspect-a-record/intent.md)
