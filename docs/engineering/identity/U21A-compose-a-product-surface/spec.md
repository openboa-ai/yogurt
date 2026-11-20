# U21A · Compose a recognizable product surface

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I21 design r2](../../../intents/identity/I21-recognize-an-openboa-screen/spec.md) · criterion `I21-U21A`. Parent specification SHA-256 `d44ecf2df89f36a85cc8e5f59a037372f50b73a2dd3719a4d4cc673f80dbc167`.

## Decision and ownership

Use a paper or ink plane, soft geometry, a strong reading edge and Rethink Sans throughout. Let type, spacing and alignment carry hierarchy; reserve the richest color and the contour detail for the entity or decision that merits it.

**Proposed writer.** Company identity maintainer, `docs/design-direction.md`. **Consumer.** Brand editors and the designers of brand, operational and agent surfaces. **Independent verifier.** A designer comparing three unbranded screen crops at normal size and enlarged text. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given a task, owning identity, its most important fact and available action, lay out the title, object, supporting evidence and action in reading order. Choose brand, operational or conversational density from the documented examples.

**Predecessors.** [U01A](../U01A-place-company-signature/spec.md) · [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** Do not put a notch in every button or card, place a mascot in front of a consequential decision, turn all statuses into colored pills, or give every section its own container. Product art cannot replace readable state.

## Failure and compatibility

At narrow sizes stack the existing reading sequence and allow labels to wrap. With color or artwork suppressed, preserve the task and action. The primary on paper is the symbol’s slate.750. The dark-surface treatment keeps readable contrast with the same hue family.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U21A-A | Compare a decision inbox, read-only record and agent transcript in light and dark. Mask each masthead. | The same type rhythm, alignment, shapes and quiet surfaces are recognizable. The reviewer can still name each screen’s distinct primary task. | All three look similar because they repeat the same dashboard card grid. |
| U21A-B | Remove color cues, enlarge the text and narrow to 320 CSS px. | Consequences, timestamps and action labels remain legible and reachable in a sensible order. | A badge color or decorative icon is the only remaining sign of an important state. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/identity/I21-recognize-an-openboa-screen/intent.md)
