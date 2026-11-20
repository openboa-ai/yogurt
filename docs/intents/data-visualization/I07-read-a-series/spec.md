# I07 design · Read a value and understand its coverage

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Read a partial Sourdough record](../../../journeys/J3/README.md).

## Requirements

- **I07-U07A.** Use the same observation records for the graphic and table. Carry units, precision, as-of time and coverage. Provide non-color distinction for series and a reading order for the accompanying values.

**Constraint.** The client owns measures, units, authorization, coverage and time. Yogurt owns the encoding, text equivalent, legend and layout. Chart roles use the shared palette.

**Design alternative to rule out.** A continuous line silently bridges the gap, an empty cell becomes zero or a green mark is the only way to identify a series.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U07A · Present a plot and its textual equivalent](../../../engineering/data-visualization/U07A-encode-observed-values/spec.md) | `assets/charts` | Chart primitives, table alternatives and detail views | A data reviewer who reads the source fixture and both rendered representations |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Switch surface and narrow the viewport. Compare each plotted observation with the table supplied from the same input. Clearing a revoked series must clear its textual and graphical forms together.

**End scene.** Given one zero, one missing interval and a stamped observation, the chart and its accessible table agree on the value, unit, gap and observation time.

**Current sources and open decisions.** [notch-positions.csv](../../../../assets/charts/notch-positions.csv) · [notch-positions.svg](../../../../assets/charts/notch-positions.svg) · [Source library](https://yogurt-theta.vercel.app/library.html) · [brand.json](../../../../tokens/brand.json) · [Delivery status and owner decisions](../../../status.md)
