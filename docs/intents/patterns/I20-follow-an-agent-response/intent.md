# I20 · Follow an agent response as it arrives

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the product patterns maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Follow an agent across a roster and a reply](../../../journeys/J5/README.md).

## Need

A person following a named agent needs to read partial output, interrupt when supported and understand whether the reply finished or lost its connection.

## Success and counterexample

**Success.** Stream two parts for one reply, stop at an authorized boundary and reopen it. The visible transcript preserves exactly the confirmed text and names the state of the remaining reply.

**Convincing failure.** An eye movement implies the task succeeded. A stale chunk appears under another agent, or a screen reader announces the entire growing paragraph on every token.

## Limits

The host owns agent and message identity, order, capability, retention and effects of stop or retry. The pattern owns transcript layout, status, reading order and user-controlled following.

[eye-motion.json](../../../../assets/agents/eye-motion.json) · [terms.json](../../../../content/terms.json) · [Agent motion](../../../../library.html#motion) · [Repository blueprint](../../../repository.md)
