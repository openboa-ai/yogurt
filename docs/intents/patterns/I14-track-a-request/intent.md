# I14 · Learn what happened to the original request

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the product patterns maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

Someone sends a decision and the connection drops. They need to distinguish a lost acknowledgement from a failed action without submitting it again.

## Success and counterexample

**Success.** Reopen the same request and reconcile its stable receipt. Sent, unknown, confirmed and rejected each show only the action and facts justified by the source.

**Convincing failure.** An automatic retry creates a second decision. A success animation claims the task completed because a request was accepted for processing.

## Limits

Bind pattern.track-request to an existing host-owned receipt, status and lookup permission. Yogurt never creates business commands or new tracking IDs.

[patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](../../../../playbook.html)
