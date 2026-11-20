# I20 design · Follow an agent response as it arrives

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Follow an agent across a roster and a reply](../../../journeys/J5/README.md).

## Requirements

- **I20-U20A.** Identify speaker and reply with stable keys. Distinguish streaming, interrupted, completed and unavailable replies in English. Use a restrained activity indication and avoid announcing each token.

**Constraint.** The host owns agent and message identity, order, capability, retention and effects of stop or retry. The pattern owns transcript layout, status, reading order and user-controlled following.

**Design alternative to rule out.** An eye movement implies the task succeeded. A stale chunk appears under another agent, or a screen reader announces the entire growing paragraph on every token.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U20A · Follow a partial agent reply without losing place](../../../engineering/patterns/U20A-present-streamed-replies/spec.md) | `catalog/patterns/agent-response` | Conversational surfaces and task transcripts | A reader observing the message fixture, scroll position, accessible announcements and host action log |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

While reading an older turn, receive a new chunk. Keep the reading position, offer a return to the latest update and prevent a late chunk or decorative avatar from changing the reported outcome.

**End scene.** Stream two parts for one reply, stop at an authorized boundary and reopen it. The visible transcript preserves exactly the confirmed text and names the state of the remaining reply.

**Current sources and open decisions.** [eye-motion.json](../../../../assets/agents/eye-motion.json) · [terms.json](../../../../content/terms.json) · [Agent motion](https://yogurt-theta.vercel.app/library.html#motion) · [Repository blueprint](../../../repository.md) · [Delivery status and owner decisions](../../../status.md)
