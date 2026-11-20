# U10A · Present feedback that matches the observed task

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I10 design r1](../../../intents/controls/I10-understand-feedback/spec.md) · criterion `I10-U10A`. Parent specification SHA-256 `aaa1c1e72ecd9b1f5236452e7a920340dc7b31b4ecef45fe051799ac4a85b1f6`.

## Decision and ownership

Use field errors near their source, persistent results when the task is blocked and brief notifications for nonblocking events. Skeletons reserve useful geometry. Label indeterminate progress and include a denominator for known progress.

**Proposed writer.** Components maintainer, `catalog/components/feedback`. **Consumer.** Inline validation, task results, status messages and progress displays. **Independent verifier.** A tester observing the visible result, accessible announcements and recovery callback. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given an observation type, correlation ID, description and supported recovery, transition from loading or ready to an accurate result. Announce a meaningful transition once. Recovery invokes the supplied callback.

**Predecessors.** [U02A](../../language/U02A-resolve-english-copy/spec.md) · [U03A](../../foundations/U03A-resolve-palette-roles/spec.md)

**Denied case.** A toast may not be the only home for a blocking error. Displaying a result cannot confirm a domain mutation for which the client has no receipt.

## Failure and compatibility

Ignore stale responses. Preserve the last authorized context only when the product permits it and clearly labels its age. When authorization ends, clear the context and related accessible text.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U10A-A | Render empty, filtered, failed and recovered fixtures, including a keyboard retry. | Each has the appropriate cause and next action. Announcements match the visible state once. | All four use the same friendly illustration and “Nothing here yet.” |
| U10A-B | Deliver an earlier failed event after a later success and repeat a progress update. | The current result remains stable. Duplicate progress does not create repeated announcements. | An obsolete error returns focus to a retry button after success. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I10-understand-feedback/intent.md)
