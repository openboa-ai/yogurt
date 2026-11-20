# U08A · Activate one named action

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I08 design r2](../../../intents/controls/I08-act-and-enter-values/spec.md) · criterion `I08-U08A`. Parent specification SHA-256 `6663e9731fe491d44a8f34684208f1e065498cc15e5dadd0cb1393833ef9ff3a`.

## Decision and ownership

Button, icon button and action groups share visible pressed, focus, pending and unavailable states. An icon-only action has an explicit accessible name. The host chooses the single primary consequence in context.

**Proposed writer.** Components maintainer, `catalog/components/actions`. **Consumer.** Forms, toolbar actions and primary commands. **Independent verifier.** A keyboard and pointer tester observing the host callback counter. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given a label, permission, busy state and callback, one completed activation emits one intent to the host. A pressed pointer that leaves and cancels has no effect. Pending preserves the action’s width and accessible meaning.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** Rendering, focusing, pressing Escape or interacting with an unavailable action may not start a command. An async callback settling cannot stand in for a domain receipt.

## Failure and compatibility

Handle keyboard-generated clicks through the same activation path. Repeated input while a host action is pending does not duplicate the in-flight intent. Recover focus when the host reports failure.

**First design review.** [Button](../first-four/button/spec.md) and [Icon button](../first-four/icon-button/spec.md) supply individual intent, geometry, transitions and failure cases, with one [joined study](../first-four/README.md).

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U08A-A | Activate with Enter, Space and a pointer in separate reset fixtures while counting callbacks. | Each completed action emits once. The resting and pending labels occupy a stable slot. | A screen reader says the right words but Enter emits two callbacks. |
| U08A-B | Press, cancel, then activate a deliberately slow action twice and reject its promise. | Cancellation emits zero; one pending intent reaches the host. The action returns to a reachable recovery state. | The second press creates another request or the button becomes permanently disabled. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I08-act-and-enter-values/intent.md)
