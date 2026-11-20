# U08B · Edit and validate a labeled value

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I08 design r2](../../../intents/controls/I08-act-and-enter-values/spec.md) · criterion `I08-U08B`. Parent specification SHA-256 `6663e9731fe491d44a8f34684208f1e065498cc15e5dadd0cb1393833ef9ff3a`.

## Decision and ownership

Specify text, search, textarea and select fields plus checkbox, radio and switch. Use radio for an exclusive set, checkbox for independent choices, and switch for an immediate setting. Keep a persistent label and associate help and errors.

**Proposed writer.** Components maintainer, `catalog/components/fields`. **Consumer.** Forms, search, filters and short single or multiple choices. **Independent verifier.** A field tester comparing the source model, keyboard order and accessible descriptions. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

The host supplies a stable field ID, type, controlled value, constraints, error and change callback. Edits preserve entered text until the host accepts a different value. Selection reports its real key even when labels coincide.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** A placeholder cannot be the sole label. Unknown options are never coerced to the first valid value. Date, number and complex picker inputs use a separately qualified use case and value model.

## Failure and compatibility

Preserve safe input through validation and only expose the latest validation result. Replacing an option list or receiving an out-of-order error cannot silently commit a different value.

**First design review.** [Text field](../first-four/text-field/spec.md) and [Switch](../first-four/switch/spec.md) supply individual intent, geometry, transitions and failure cases, with one [joined study](../first-four/README.md).

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U08B-A | Submit a labeled empty field, enter a valid value and select the second of two similarly named choices. | The error is associated with that field, the corrected value persists and the chosen stable key reaches the host. | The visible label is correct but the first matching text is submitted. |
| U08B-B | Replace available choices while the old one is selected and respond to an older validation request. | The field shows the unresolved choice or prompts reselection. Older results do not overwrite the current state. | The form silently selects an unseen option or revives a stale error. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I08-act-and-enter-values/intent.md)
