# I05 design · Recognize the right artwork at message size

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Requirements

- **I05-U05A.** Use the current yogurt cup, scored sourdough and freestanding peppered meatball. Each has one fitted, transparent cut into its exterior contour. Token names in the editable source are authoritative.
- **I05-U05B.** Functional icons carry one action and can use the bundled icon family. Emoji identify a drawing by its full sequence. The existing 3,831-entry repertoire has 104 eligible expression faces with bright yellow and soft peach finishes.

**Constraint.** The original project masters, single contour notch and accepted face finishes are selected. The art owner curates additional drawings. The functional icon owner specifies semantics and accessible labels.

**Design alternative to rule out.** The meatball grows a stick, a background-colored patch poses as the notch, or a general emoji silently drops a skin modifier when exported.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U05A · Preserve each food mark at small sizes](../../../engineering/artwork/U05A-export-project-marks/spec.md) | `design/assets/projects` | Project headers, chat messages and release notes | An illustrator checking exported marks at 16, 24 and 32 px on both system surfaces |
| [U05B · Resolve an icon or emoji to its intended drawing](../../../engineering/artwork/U05B-select-original-glyphs/spec.md) | `design/assets/emoji` | Message galleries, accessible controls and local asset exporters | A reader finding a drawing by name or sequence and identifying it at actual display size |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Review crops on both surfaces, then export an emoji with a joined sequence. Compare its identity, contour and color with the SVG and confirm that a labeled icon is announced once.

**End scene.** At 16, 24 and 32 px a reader distinguishes the yogurt cup, scored loaf and peppered meatball. A search by name or full Unicode sequence returns the matching original drawing and accessible name.

**Current sources and open decisions.** [emoji.json](../../../../design/assets/projects/emoji.json) · [README.md](../../../../design/assets/emoji/README.md) · [catalog.json](../../../../design/assets/emoji/catalog.json) · [Project emoji](https://yogurt-theta.vercel.app/library.html#emoji) · [search.svg](../../../../design/assets/icons/search.svg) · [Delivery status and owner decisions](../../../status.md)
