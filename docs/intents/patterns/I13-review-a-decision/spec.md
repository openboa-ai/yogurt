# I13 design · Review the consequence before committing

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I13-U13A.** Display the target, revision, consequence, alternatives and cancellation before a consequential request. Give the committing control a verb and object. Separate opening the review from sending its answer.

**Constraint.** Bind pattern.review-decision to caller-supplied actor scope, project, record, revision and choices. Only the product can authorize or execute the action.

**Design alternative to rule out.** Opening a dialog sends a command. An optimistic success replaces a receipt. A stale revision silently reuses a previously valid choice.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U13A · Present and confirm the scoped choice](../../../engineering/patterns/U13A-confirm-current-decision/spec.md) | `catalog/patterns/review-decision` | Meatball decision review and other host-authorized decisions | A fixture observer with two similar records and a host command ledger |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Change the revision while the decision is open. Clear the previous confirmation, preserve the explanation and let the person inspect the new evidence before another explicit action.

**End scene.** Inspect two similarly named decisions, cancel one review, then confirm an authorized revision. Only that exact target produces one host request, and the UI shows it as sent.

**Current sources and open decisions.** [patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](../../../../playbook.html) · [Delivery status and owner decisions](../../../status.md)
