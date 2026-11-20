# U05B · Resolve an icon or emoji to its intended drawing

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I05 design r1](../../../intents/artwork/I05-choose-recognizable-art/spec.md) · criterion `I05-U05B`. Parent specification SHA-256 `df5c94ee0746fab7b492a9b30aff5ca5b410af59aa0b954f4dc1cebb2d8af0c0`.

## Decision and ownership

Functional icons carry one action and can use the bundled icon family. Emoji identify a drawing by its full sequence. The existing 3,831-entry repertoire has 104 eligible expression faces with bright yellow and soft peach finishes.

**Proposed writer.** Artwork and agents maintainer, `assets/emoji`. **Consumer.** Message galleries, accessible controls and local asset exporters. **Independent verifier.** A reader finding a drawing by name or sequence and identifying it at actual display size. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Input an intended role, sequence or icon name, finish and size. For emoji return the matching editable drawing and display asset with its label. For a functional control, give the control an accessible name and hide a redundant decorative glyph.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md)

**Denied case.** Never replace a Unicode skin modifier with an optional face finish or collapse a joined sequence into its first code point. The food masters remain separately owned.

## Failure and compatibility

Unknown IDs or unavailable finishes disclose the gap. An available base drawing can be chosen explicitly. Existing full IDs, notices and download links must continue to resolve across a compatible change.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U05B-A | Retrieve an eligible face in both finishes and a separate modified or joined sequence. | Face geometry matches across finishes and the separate sequence resolves to its own original SVG and PNG. | The visible drawing comes from the wrong sequence while its filename appears valid. |
| U05B-B | Compare the glyph on both surfaces at 16, 24 and 32 px and navigate a labeled search control. | The intended object or action reads at size and its accessible name appears once. | A duplicated icon title is announced or only the enlarged drawing is identifiable. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/artwork/I05-choose-recognizable-art/intent.md)
