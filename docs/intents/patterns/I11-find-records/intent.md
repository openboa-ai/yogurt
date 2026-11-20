# I11 · Find an item and recover from no matches

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the product patterns maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

A person searches or filters a collection and needs to distinguish an empty collection from an overly narrow filter and from a failed load.

## Success and counterexample

**Success.** Search for a known ID, apply a conflicting filter, then clear filters. The correct record, count, empty explanation and focus destination appear in order.

**Convincing failure.** “No items yet” appears while a query is in flight, or clearing filters empties the underlying collection.

## Limits

Bind pattern.find-records to the product’s authorized projection and stable IDs. Search and reset are view changes. Row actions belong to their own product contracts.

[patterns.json](../../../../catalog/patterns.json) · [Working roster](https://yogurt-theta.vercel.app/system.html#components) · [Working task states](https://yogurt-theta.vercel.app/patterns/task-states.html)
