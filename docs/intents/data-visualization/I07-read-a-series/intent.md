# I07 · Read a value and understand its coverage

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the data visualization maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Read a partial Sourdough record](../../../journeys/J3/README.md).

## Need

A person checking a trend wants to distinguish a measured zero, a missing reading and older data. A second person using a screen reader needs the same answer.

## Success and counterexample

**Success.** Given one zero, one missing interval and a stamped observation, the chart and its accessible table agree on the value, unit, gap and observation time.

**Convincing failure.** A continuous line silently bridges the gap, an empty cell becomes zero or a green mark is the only way to identify a series.

## Limits

The client owns measures, units, authorization, coverage and time. Yogurt owns the encoding, text equivalent, legend and layout. Chart roles use the shared palette.

[notch-positions.csv](../../../../assets/charts/notch-positions.csv) · [notch-positions.svg](../../../../assets/charts/notch-positions.svg) · [Source library](https://yogurt-theta.vercel.app/library.html) · [brand.json](../../../../tokens/brand.json)
