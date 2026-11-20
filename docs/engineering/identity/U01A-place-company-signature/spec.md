# U01A · Place the master on a company surface

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I01 design r2](../../../intents/identity/I01-sign-a-surface/spec.md) · criterion `I01-U01A`. Parent specification SHA-256 `73c90485eb2ce68cad797f52749b48dabbef567b01b68be08a02ae795e5a2306`.

## Decision and ownership

Keep the Upright 9 silhouette, the outlined Rethink Sans wordmark at 760 and the B2 relation: 80 symbol units to 60 cap-height units, an 18-unit gap and a 3-unit optical center adjustment.

**Proposed writer.** Company identity maintainer, `assets/logo`. **Consumer.** Website headers, release credits and company introductions. **Independent verifier.** A brand reviewer comparing the rendered header with the supplied master. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given company attribution, available width and surface, choose the supplied lockup or standalone symbol. Place the master once and give the company an accessible name. Consumer layout supplies the outer inset.

**Predecessors.** No engineering predecessor.

**Denied case.** A consumer cannot redraw the dimples, substitute live text inside the lockup, introduce letter or snake imagery, or substitute another hue for the approved symbol color.

## Failure and compatibility

A missing signature falls back to the company name in accessible text until the master is available. Preserve the existing master paths and compare replacements against the prior approved outline.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U01A-A | Place the source lockup in a 160 px header and next to a project credit. | The rendered geometry matches the master and both identities are understandable at normal size. | The bounding box is right but the symbol-to-cap ratio or wordmark weight changed. |
| U01A-B | Remove the image resource and inspect the header with assistive technology. | Company attribution is available once and remains separate from the named project. | Two company names are announced or the project becomes the company logo. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/identity/I01-sign-a-surface/intent.md)
