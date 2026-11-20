# U07A · Present a plot and its textual equivalent

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I07 design r1](../../../intents/data-visualization/I07-read-a-series/spec.md) · criterion `I07-U07A`. Parent specification SHA-256 `5383cd41d47c829f6e4e2c21aa5d070005b50ce30bb63c4b10323f7eb968b1da`.

## Decision and ownership

Use the same observation records for the graphic and table. Carry units, precision, as-of time and coverage. Provide non-color distinction for series and a reading order for the accompanying values.

**Proposed writer.** Data visualization maintainer, `design/assets/charts`. **Consumer.** Chart primitives, table alternatives and detail views. **Independent verifier.** A data reviewer who reads the source fixture and both rendered representations. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Map authorized series and domain to a suitable plot or legible table. Draw zero only for an observed numeric zero. Break or explicitly annotate a gap and show the relevant unit at the point of reading.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** The renderer cannot interpolate unknown facts as measured values, change a denominator or expose a hidden series through a legend or accessible description.

## Failure and compatibility

Duplicate readings refer to the source’s observation identity. Revisions replace only their corresponding data. When access narrows, remove affected series and table values together.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U07A-A | Supply a zero, a missing interval and a late observed value; inspect both themes and the table. | A reader can identify all three, their unit and the original timestamp from either representation. | The table says missing while the chart draws a zero or a continuous trend. |
| U07A-B | Withdraw permission for one series while its prior revision is being rendered. | Axis labels, tooltip, series and table no longer reveal the withdrawn data. | The line disappears but a tooltip or accessible row retains the value. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/data-visualization/I07-read-a-series/intent.md)
