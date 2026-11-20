# I19 design · Adopt and roll back the shared system per project

Parent: [originating intent, revision 2](intent.md). Review: NOT ACCEPTED. Design revision 2. [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Requirements

- **I19-U19A.** One accepted version resolves design rules, catalog, tokens, compatible adapter exports and notices. A web-only consumer may use its package lock; a mixed-target manifest may bind multiple outputs to one release selection.
- **I19-U19B.** Run deterministic checks on declared presentation sources for token references, supported exports, accessible names and state coverage. Keep artwork sources, generated token output and user content out of source-style lint.
- **I19-U19C.** Offer each named web control as a shadcn-compatible registry item. A screen or form may compose those entries and refer to stable pattern IDs. Each entry imports its pinned Yogurt primitive. Keep shared behavior and tokens at their owned package entries.

**Constraint.** Each OpenBoa product UI is intended to use a pinned Yogurt release. The Yogurt owner owns compatibility. Each product owner operates its own pin, adoption and required UI checks. Future Meatball enrollment is independent of being a consumer.

**Design alternative to rule out.** A skill implicitly pulls latest, developers must have Meatball to render UI, or CI turns green for a product that never ran the affected task.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U19A · Resolve and roll back a project pin](../../../engineering/adoption/U19A-pin-a-release/spec.md) | `releases` | The maintainer of each independent consuming product | A second project maintainer reproducing installs from the previous and candidate pins |
| [U19B · Detect a consumer violation and return it to its owner](../../../engineering/adoption/U19B-check-consumer-use/spec.md) | `checks/consumer` | Consumer CI and maintainers reporting a shared design issue | An independent integrator running one known-good fixture and intentional failures |
| [U19C · Distribute an inspectable product recipe](../../../engineering/adoption/U19C-distribute-pattern-recipes/spec.md) | `releases/registry` | Products choosing the optional shadcn-compatible distribution route | A recipient inspecting a candidate recipe and the resulting diff in a clean fixture |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Report a shared presentation issue from one fixture, reproduce in yogurt, then retest the candidate and previous pin. A change in domain meaning stays with the product owner.

**End scene.** Two independent fixture consumers resolve their own pins. Upgrade one, reject a deliberately broken fixture and roll back to the former version while the other remains reproducible.

**Current sources and open decisions.** [Release design](../../../../adoption.html#releases) · [Repository blueprint](../../../repository.md) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Delivery status and owner decisions](../../../status.md)
