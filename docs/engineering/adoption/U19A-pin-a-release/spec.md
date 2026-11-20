# U19A · Resolve and roll back a project pin

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I19 design r2](../../../intents/adoption/I19-adopt-a-release/spec.md) · criterion `I19-U19A`. Parent specification SHA-256 `aa50f641ee0c98d71364e168f94d0ccba66d358c719dbb5cf8af38622325d873`.

## Decision and ownership

One accepted version resolves design rules, catalog, tokens, compatible adapter exports and notices. A web-only consumer may use its package lock; a mixed-target manifest may bind multiple outputs to one release selection.

**Proposed writer.** Consumer adoption maintainer, `releases`. **Consumer.** The maintainer of each independent consuming product. **Independent verifier.** A second project maintainer reproducing installs from the previous and candidate pins. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given a known prior pin and candidate digest, verify artifacts, install the candidate in one fixture and rehearse the declared task. The product owner controls switching its accepted version. Other projects keep their own pins.

**Predecessors.** [U17A](../../guidance/U17A-index-design-guidance/spec.md)

**Denied case.** Installing yogurt cannot enroll a project in Meatball, change a consumer lock without its owner, publish a package or fetch latest during a build. Existing project domain effects remain outside yogurt.

## Failure and compatibility

An incomplete download, mismatched digest or unsupported target keeps the previous working selection. Replaying a candidate check is harmless. Roll back all linked outputs together and rerun the old fixture.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U19A-A | Hold two consumers on the prior release, upgrade one, reopen their guides and run both fixtures. | Each project resolves the chosen rules and matching adapter, and the second project stays on its original revision. | A shared global skill silently upgrades both projects. |
| U19A-B | Corrupt one candidate artifact, then restore the previously accepted pin. | The failed candidate cannot become active and the former fixture reproduces with its original assets and contract. | The UI rolls back but the catalog or authoring skill still serves the newer contract. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/adoption/I19-adopt-a-release/intent.md)
