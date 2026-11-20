# I19 · Adopt and roll back the shared system per project

Status: DRAFT, revision 2. Decision owner: OpenBoa design-system owner with the consumer adoption maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Need

A team needs one reproducible yogurt version across tools, a check that catches rule violations and a safe way to receive an upstream fix without waiting on another project.

## Success and counterexample

**Success.** Two independent fixture consumers resolve their own pins. Upgrade one, reject a deliberately broken fixture and roll back to the former version while the other remains reproducible.

**Convincing failure.** A skill implicitly pulls latest, developers must have Meatball to render UI, or CI turns green for a product that never ran the affected task.

## Limits

Each OpenBoa product UI is intended to use a pinned Yogurt release. The Yogurt owner owns compatibility. Each product owner operates its own pin, adoption and required UI checks. Future Meatball enrollment is independent of being a consumer.

[Release design](https://yogurt-theta.vercel.app/adoption.html#releases) · [Repository blueprint](../../../repository.md) · [Product fixtures](../../../../examples/project-use/scenarios.json)
