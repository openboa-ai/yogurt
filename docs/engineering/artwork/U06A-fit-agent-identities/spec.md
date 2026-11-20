# U06A · Assign a stable, visually fitted agent identity

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I06 design r1](../../../intents/artwork/I06-recognize-an-agent/spec.md) · criterion `I06-U06A`. Parent specification SHA-256 `0970fe984d88d8ec112fb075e840f4384b4d9a832b19fa539fa4e1c8cc55ede8`.

## Decision and ownership

Keep the 15 distinct rounded silhouettes, Kai’s pinched upper notch and Sol’s shallow lower notch. Each permitted position has a hand-fitted path. Merge visually redundant options before counting them.

**Proposed writer.** Artwork and agents maintainer, `design/assets/agents/silhouettes.json`. **Consumer.** Rosters and agent detail surfaces. **Independent verifier.** An art reviewer using the actual roster and a registry reader resolving saved assignments. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

An existing identity resolves to its saved silhouette, fitted position and shared fill token. A new identity may select only a reviewed tuple. Persist a stable tuple or stable asset key with a version and a visible name.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md)

**Denied case.** An arbitrary rotation, square corner, extra notch or all-sides Cartesian product cannot create a valid identity. A name or color alone is insufficient to certify a distinguishable drawing.

## Failure and compatibility

A returning ID keeps its assignment when new shapes arrive. If a source tuple is missing, show the agent name and mark the asset gap. An unreviewed candidate is excluded from the usable count.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U06A-A | Enumerate the 45 fitted pairs and compare candidate fills on both surfaces at roster size. | Report separate counts for proposed and visually accepted tuples. A claim of 1,000+ requires at least 1,000 distinct accepted tuples. | Multiplying pairs by 23 is the entire evidence for 1,035 approved identities. |
| U06A-B | Reload two saved agents after adding another candidate and force one tuple lookup to fail. | Assignments that resolve keep their names and geometry. The unresolved name remains identifiable. | A retry silently rerolls a different silhouette under a returning name. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/artwork/I06-recognize-an-agent/intent.md)
