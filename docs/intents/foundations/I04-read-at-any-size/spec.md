# I04 design · Read and operate the same layout at different sizes

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Recognize the same company across surfaces](../../../journeys/J1/README.md).

## Requirements

- **I04-U04A.** Use Rethink Sans with the existing heading 525, body 425 and UI 550 as the baseline. The wordmark’s 760 stays scoped to its artwork. Use the actual type, line, space, radius, stroke and control tokens.

**Constraint.** Rethink Sans is the only authored family. The 760 outline belongs to the wordmark. The client owns any locale or platform fallback needed for user-supplied characters.

**Design alternative to rule out.** A second typeface or a squashed font makes the screenshot fit. An ellipsis hides the only differing suffix on two actions. The visible button is larger than its actual clickable region.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U04A · Lay out text, spacing and operable controls](../../../engineering/foundations/U04A-compose-responsive-type/spec.md) | `tokens/brand.json` | Responsive screens, chart labels and native text styles | A reviewer operating a narrow viewport and enlarged text with keyboard and touch |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Test a long owner name and a three-digit value in the same row. Let them wrap or reflow with the action still available. Verify the hit area separately from the visual size.

**End scene.** Read a long English label at 320 CSS px and with enlarged text. Reach the same action by keyboard and touch, with a visible focus indicator and a stable reading order.

**Current sources and open decisions.** [brand.json](../../../../tokens/brand.json) · [OFL.txt](../../../../assets/fonts/rethink-sans/OFL.txt) · [Type scale](https://yogurt-theta.vercel.app/system.html#type) · [Dimensions](https://yogurt-theta.vercel.app/system.html#dimensions) · [Delivery status and owner decisions](../../../status.md)
