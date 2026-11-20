# U03A · Resolve visual roles from one numbered palette

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I03 design r2](../../../intents/foundations/I03-choose-system-colors/spec.md) · criterion `I03-U03A`. Parent specification SHA-256 `a70bdf6e44531c56df6c3aa58c76c912d0f1ed2fe5362f7edc367a88bf4a4ce3`.

## Decision and ownership

Keep hue families at one primitive level. All text, focus, state, series and artwork color roles resolve to one of those values. Preserve gray ramps through near-white and near-black. Keep the existing neutral.0 and neutral.1000 at #FCFCFC and #121212 in this revision.

**Proposed writer.** Design foundations maintainer, `tokens/brand.json`. **Consumer.** Token exporters, themes, artwork and data series. **Independent verifier.** A foundation reviewer who resolves the token references and samples rendered foregrounds and backgrounds. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Input is a numbered primitive ID, role, theme and foreground/background use. Resolve both ends from the same token revision. Compare actual pairs, including selected, disabled and outlined controls where meaningful.

**Predecessors.** No engineering predecessor.

**Denied case.** A new arbitrary hex, dangling alias, cycle or separately maintained semantic palette cannot enter a release. The brand primary resolves to the approved symbol color, slate.750. Substituting a framework default fails this design.

## Failure and compatibility

Preserve published IDs or accompany a rename with a migration and compatible rollback. An invalid role leaves the prior export intact and identifies the unresolved ID.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U03A-A | Resolve the light and dark status samples and a project fill, then sample the normal-size state label. | All values trace to one numbered registry. The label reaches 4.5:1 on both surfaces and has a text cue. | A role resolves to a copied literal that only happens to give the same screenshot. |
| U03A-B | Introduce a nonexistent primitive and a reference cycle in two isolated copies. | Both candidates fail with a named reference and the preceding valid artifact remains usable. | A missing value silently becomes black, white or a renderer-specific color. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/foundations/I03-choose-system-colors/intent.md)
