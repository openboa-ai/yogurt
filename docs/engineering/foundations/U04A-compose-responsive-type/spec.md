# U04A · Lay out text, spacing and operable controls

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I04 design r1](../../../intents/foundations/I04-read-at-any-size/spec.md) · criterion `I04-U04A`. Parent specification SHA-256 `11003260c4b48180ef71c9c25dfbc416a5fdca71e3c689d8b82628b5f2afa615`.

## Decision and ownership

Use Rethink Sans with the existing heading 525, body 425 and UI 550 as the baseline. The wordmark’s 760 stays scoped to its artwork. Use the actual type, line, space, radius, stroke and control tokens.

**Proposed writer.** Design foundations maintainer, `design/tokens/brand.json`. **Consumer.** Responsive screens, chart labels and native text styles. **Independent verifier.** A reviewer operating a narrow viewport and enlarged text with keyboard and touch. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given a text role, available width, input modality and scale, allow labels to wrap, keep their reading order and expose the control’s true hit area. The current control is 40 units high with a 44-unit touch target.

**Predecessors.** No engineering predecessor.

**Denied case.** Do not shrink the body type to conceal overflow, convert body text into outlines or introduce a second authored family. A clipped action label cannot be the only way to identify a choice.

## Failure and compatibility

On font failure, show readable system fallback while preserving semantics. Preserve the font license in redistributable output. Reflowing the layout preserves focused control identity and does not activate it.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U04A-A | At 320 CSS px and desktop at 200% zoom, read two long labels and tab through them. | Both actions can be distinguished and reached. Content reflows without horizontal scrolling of the whole view. | Keyboard focus reaches a clipped action that cannot be identified visually. |
| U04A-B | Switch to touch and inspect the hit region of a compact control; temporarily withhold the bundled font. | Touch still has its intended target and the accessible name and action survive the font failure. | Only the inner glyph is clickable or the label vanishes during font loading. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/foundations/I04-read-at-any-size/intent.md)
