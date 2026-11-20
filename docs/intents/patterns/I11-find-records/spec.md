# I11 design · Find an item and recover from no matches

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I11-U11A.** Compose a labeled search, optional filters, result count, navigable rows and a recovery result. Define empty source, no matches, loading, error, retry and restored content where supplied.

**Constraint.** Bind pattern.find-records to the product’s authorized projection and stable IDs. Search and reset are view changes. Row actions belong to their own product contracts.

**Design alternative to rule out.** “No items yet” appears while a query is in flight, or clearing filters empties the underlying collection.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U11A · Find and reset an authorized collection](../../../engineering/patterns/U11A-restore-collection-context/spec.md) | `catalog/patterns/find-records` | Rosters, decisions and other searchable projections | A fixture reader checking IDs, result count, focus and the host mutation log |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Begin with an authorized result, stage two out-of-order queries, reset, and confirm that the visible collection and keyboard focus follow the final query.

**End scene.** Search for a known ID, apply a conflicting filter, then clear filters. The correct record, count, empty explanation and focus destination appear in order.

**Current sources and open decisions.** [patterns.json](../../../../catalog/patterns.json) · [Working roster](../../../../system.html#components) · [Working task states](../../../../patterns/task-states.html) · [Delivery status and owner decisions](../../../status.md)
