# I03 design · Use one palette across the product

Parent: [originating intent, revision 2](intent.md). Review: NOT ACCEPTED. Design revision 2. [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Requirements

- **I03-U03A.** Keep hue families at one primitive level. All text, focus, state, series and artwork color roles resolve to one of those values. Preserve gray ramps through near-white and near-black. Keep the existing neutral.0 and neutral.1000 at #FCFCFC and #121212 in this revision.

**Constraint.** The foundation owner owns primitive IDs and role bindings. Keep neutral endpoints within the existing range. The brand owner selected the original symbol’s Ink blue, slate.750 (#175174), as the primary. Theme-specific controls resolve to a numbered primitive with readable contrast.

**Design alternative to rule out.** A separate chart or character palette copies a nearly identical hex. A dark theme switches the background but leaves muted text unreadable. A framework default silently replaces the primary color.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U03A · Resolve visual roles from one numbered palette](../../../engineering/foundations/U03A-resolve-palette-roles/spec.md) | `tokens/brand.json` | Token exporters, themes, artwork and data series | A foundation reviewer who resolves the token references and samples rendered foregrounds and backgrounds |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Render the same treatment over paper and ink, compare actual adjacent foreground and background values and inspect the provenance of each color. A missing primitive blocks a new export.

**End scene.** Inspect a light and a dark specimen, resolve every role to an existing primitive and read each state without recognizing its hue. One palette supplies all of the assets.

**Current sources and open decisions.** [brand.json](../../../../tokens/brand.json) · [tokens.css](../../../../styles/tokens.css) · [Color in context](https://yogurt-theta.vercel.app/system.html#color) · [Delivery status and owner decisions](../../../status.md)
