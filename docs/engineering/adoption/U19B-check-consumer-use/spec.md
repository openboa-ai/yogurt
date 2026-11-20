# U19B · Detect a consumer violation and return it to its owner

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I19 design r2](../../../intents/adoption/I19-adopt-a-release/spec.md) · criterion `I19-U19B`. Parent specification SHA-256 `aa50f641ee0c98d71364e168f94d0ccba66d358c719dbb5cf8af38622325d873`.

## Decision and ownership

Run deterministic checks on declared presentation sources for token references, supported exports, accessible names and state coverage. Keep artwork sources, generated token output and user content out of source-style lint.

**Proposed writer.** Consumer adoption maintainer, `checks/consumer`. **Consumer.** Consumer CI and maintainers reporting a shared design issue. **Independent verifier.** An independent integrator running one known-good fixture and intentional failures. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Input is a consumer pin, declared surfaces and its task fixture. Identify the exact rule, file/control and observed behavior. A business-state mismatch returns to its product; a shared behavior bug carries a minimal yogurt reproduction.

**Predecessors.** [U17A](../../guidance/U17A-index-design-guidance/spec.md) · [U18A](../../quality/U18A-rehearse-a-transition/spec.md) · [U19A](../U19A-pin-a-release/spec.md)

**Denied case.** The checker cannot rewrite a project, approve an exception, infer product permission or claim release based on lint alone. Required CI is a consumer-owned setting.

## Failure and compatibility

A broken or missing required check must report its actual state. Retest a shared fix on a candidate pin and retain the prior one until the consumer accepts the upgrade.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U19B-A | Run a valid fixture, then add an arbitrary source color and remove a necessary accessible label. | The expected cases fail with actionable locations; unchanged original artwork is excluded. | The report passes because it searched generated CSS while skipping the actual consuming surface. |
| U19B-B | Reproduce shared focus loss and a wrong product permission in separate fixtures. | The former returns to the adapter owner and the latter to the product. A rerun is tied to its exact pin. | Fixing focus is reported as independently verifying the product permission. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/adoption/I19-adopt-a-release/intent.md)
