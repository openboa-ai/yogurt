# U05A · Preserve each food mark at small sizes

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I05 design r1](../../../intents/artwork/I05-choose-recognizable-art/spec.md) · criterion `I05-U05A`. Parent specification SHA-256 `df5c94ee0746fab7b492a9b30aff5ca5b410af59aa0b954f4dc1cebb2d8af0c0`.

## Decision and ownership

Use the current yogurt cup, scored sourdough and freestanding peppered meatball. Each has one fitted, transparent cut into its exterior contour. Token names in the editable source are authoritative.

**Proposed writer.** Artwork and agents maintainer, `design/assets/projects`. **Consumer.** Project headers, chat messages and release notes. **Independent verifier.** An illustrator checking exported marks at 16, 24 and 32 px on both system surfaces. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Resolve the chosen project ID against its master, map each named primitive from the selected token revision and export SVG or transparent PNG for the target. Compare at native display size.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md)

**Denied case.** Never place a skewer on the meatball, turn the notch into a painted background-colored patch or substitute a project food mark as the company signature.

## Failure and compatibility

Re-exporting an unchanged master preserves its identity and transparent cut. A missing fill or unrecognized project ID must surface a clear missing asset without borrowing another project’s mark.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U05A-A | Overlay each size on paper and ink and compare the three project identities. | The substrate shows through the single cut and all three foods are distinguishable at message size. | A white patch matches the light surface but becomes a white dot on ink. |
| U05A-B | Request a missing project ID and re-export an unchanged known ID. | The missing request is explicit and the known project keeps its original silhouette. | The missing project silently receives the meatball or a generic agent face. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/artwork/I05-choose-recognizable-art/intent.md)
