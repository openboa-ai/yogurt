# U06B · Express activity with the eyes

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I06 design r1](../../../intents/artwork/I06-recognize-an-agent/spec.md) · criterion `I06-U06B`. Parent specification SHA-256 `0970fe984d88d8ec112fb075e840f4384b4d9a832b19fa539fa4e1c8cc55ede8`.

## Decision and ownership

Use the two eyes as one subtle gesture tied to an observed state. Keep the outline, notch and resting identity fixed. Reduced motion conveys the same activity through text and a stable face.

**Proposed writer.** Artwork and agents maintainer, `assets/agents/eye-motion.json`. **Consumer.** Agent rows, detail views and conversation attribution. **Independent verifier.** A motion reviewer viewing the same named agent at roster and detail sizes. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given an assigned agent, previous state, new host-reported state and motion preference, move both eyes together and update the adjacent state text. Kai’s ready/working study is a reference for amplitude.

**Predecessors.** [U06A](../U06A-fit-agent-identities/spec.md)

**Denied case.** An idle timer cannot imply work started or completed. Do not use gaze alone to announce a consequential status or replay it for every unrelated row update.

## Failure and compatibility

A quick reversal settles to the latest valid state. Reopening a roster renders the current state directly. A missing or erased state remains unknown until the host reports it.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U06B-A | Toggle ready to working and back while tracking the outline and eyes. | The silhouette never shifts and both eyes settle together at the current state. | An old animation finishes late and leaves working eyes under a ready label. |
| U06B-B | Enable reduced motion and read the same row at small size. | The state text remains accurate, the face is recognizable and the eyes stay still. | Removing movement also removes the only indication of activity. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/artwork/I06-recognize-an-agent/intent.md)
