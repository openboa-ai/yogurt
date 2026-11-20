# I12 design · Inspect only what is available about this record

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Read a partial Sourdough record](../../../journeys/J3/README.md).

## Requirements

- **I12-U12A.** Show subject, source, observed time, coverage and units together. Distinguish unavailable, partial, stale, denied and withdrawn states. Reserve value slots for facts actually supplied.

**Constraint.** Bind pattern.inspect-record to the product’s authorized projection. The product owns credentials, access, revision and coverage. The pattern reads facts and offers only supported recovery.

**Design alternative to rule out.** A refreshed shell gives older values a new timestamp, “unknown” becomes zero, or a previous account’s detail remains visible after an access switch.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U12A · Render one authorized record projection](../../../engineering/patterns/U12A-show-authorized-facts/spec.md) | `catalog/patterns/inspect-record` | Sourdough Board Client and other read-only detail views | A reader comparing visible and accessible facts with a revisioned fixture |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Switch between two subjects sharing a display name, revoke the first and deliver its response late. Verify that screen, table and accessible text belong to the current authorized subject.

**End scene.** A stale, authorized record shows its original as-of time and missing fields. Revocation immediately clears its facts from the detail and accessibility tree.

**Current sources and open decisions.** [patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](https://yogurt-theta.vercel.app/playbook.html) · [Delivery status and owner decisions](../../../status.md)
