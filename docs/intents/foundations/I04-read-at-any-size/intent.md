# I04 · Read and operate the same layout at different sizes

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the design foundations maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Need

A reader switches from a pointer-driven desktop window to a narrow touch screen or increases text size. Labels, facts and actions must stay legible and reachable.

## Success and counterexample

**Success.** Read a long English label at 320 CSS px and with enlarged text. Reach the same action by keyboard and touch, with a visible focus indicator and a stable reading order.

**Convincing failure.** A second typeface or a squashed font makes the screenshot fit. An ellipsis hides the only differing suffix on two actions. The visible button is larger than its actual clickable region.

## Limits

Rethink Sans is the only authored family. The 760 outline belongs to the wordmark. The client owns any locale or platform fallback needed for user-supplied characters.

[brand.json](../../../../tokens/brand.json) · [OFL.txt](../../../../assets/fonts/rethink-sans/OFL.txt) · [Type scale](../../../../system.html#type) · [Dimensions](../../../../system.html#dimensions)
