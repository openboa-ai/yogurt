# U17A · Resolve a task to design guidance on the pinned version

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I17 design r1](../../../intents/guidance/I17-find-design-guidance/spec.md) · criterion `I17-U17A`. Parent specification SHA-256 `d15b8e666fec46aaa427aacc4cab57b4b47185305f3125023a00aeb0d04aa4ff`.

## Decision and ownership

Index each stable component or pattern by task, parts, permitted inputs, states, copy, keyboard behavior, recovery, evidence and target availability. The guide and agent entry reference one catalog. A future Figma component may map its name/variant to the same ID.

**Proposed writer.** Guide and authoring maintainer, `catalog`. **Consumer.** The web guide, DESIGN.md, local lookup, optional skill and future design-tool mapping. **Independent verifier.** A fresh designer or agent given only a product brief, a kit revision and a target. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

A reader starts with a task and target, resolves its pattern, then receives a concrete binding if it exists or an explicit design-only entry. A platform listing must distinguish documentation, example, qualified package and observed consumer adoption.

**Predecessors.** No engineering predecessor.

**Denied case.** A guide snippet cannot imply a production export. An optional skill cannot grant authority, download a newer design, or turn user-provided copy into a system instruction.

## Failure and compatibility

If a target is missing or an ID was retired, show its status and a supported replacement when one exists. A stale offline pin stays coherent with its own docs and surfaces drift explicitly.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U17A-A | Give fresh readers Sourdough partial records and a Meatball lost acknowledgement without pattern names. | Both locate the correct task, product-owned facts, actual target entry or gap, and the recovery case. | A plausible custom component is invented because an example was mistaken for a package. |
| U17A-B | Look up a missing native binding and an unknown pattern while offline. | The reader can distinguish a known design with an unavailable renderer from a genuinely unknown ID. | Both lookups silently return an unrelated web example. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/guidance/I17-find-design-guidance/intent.md)
