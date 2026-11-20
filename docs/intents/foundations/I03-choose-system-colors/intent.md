# I03 · Use one palette across the product

Status: DRAFT, revision 2. Decision owner: OpenBoa design-system owner with the design foundations maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Need

A theme author needs a color for a status, chart series and agent. A designer should be able to trace all three to the same numbered hue and lightness system.

## Success and counterexample

**Success.** Inspect a light and a dark specimen, resolve every role to an existing primitive and read each state without recognizing its hue. One palette supplies all of the assets.

**Convincing failure.** A separate chart or character palette copies a nearly identical hex. A dark theme switches the background but leaves muted text unreadable. A framework default silently replaces the primary color.

## Limits

The foundation owner owns primitive IDs and role bindings. Keep neutral endpoints within the existing range. The brand owner selected the original symbol’s Ink blue, slate.750 (#175174), as the primary. Theme-specific controls resolve to a numbered primitive with readable contrast.

[brand.json](../../../../design/tokens/brand.json) · [tokens.css](../../../../design/styles/tokens.css) · [Color in context](https://yogurt-theta.vercel.app/system.html#color)
