# I14 design · Learn what happened to the original request

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I14-U14A.** Display distinct sent, unknown, confirmed and rejected states with the source request ID or an authorized reference. The available recovery on uncertain delivery is a lookup when the host permits it.

**Constraint.** Bind pattern.track-request to an existing host-owned receipt, status and lookup permission. Yogurt never creates business commands or new tracking IDs.

**Design alternative to rule out.** An automatic retry creates a second decision. A success animation claims the task completed because a request was accepted for processing.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U14A · Track the original request through uncertainty](../../../engineering/patterns/U14A-reconcile-original-receipt/spec.md) | `catalog/patterns/track-request` | Decision receipts and client command histories | A reader of the independent command ledger, receipt history and rendered state |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Deliver an out-of-order status, restore connectivity and inspect the original receipt again. Only matching authoritative evidence changes the visible outcome.

**End scene.** Reopen the same request and reconcile its stable receipt. Sent, unknown, confirmed and rejected each show only the action and facts justified by the source.

**Current sources and open decisions.** [patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](../../../../playbook.html) · [Delivery status and owner decisions](../../../status.md)
