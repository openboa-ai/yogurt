# U08C · Choose the intended value from a long list

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I08 design r2](../../../intents/controls/I08-act-and-enter-values/spec.md) · criterion `I08-U08C`. Parent specification SHA-256 `6663e9731fe491d44a8f34684208f1e065498cc15e5dadd0cb1393833ef9ff3a`.

## Decision and ownership

A combobox edits or filters a value and exposes a related suggestion list. Typed text, active suggestion and committed value are separate states. Choosing a command and choosing a value have different host effects.

**Proposed writer.** Components maintainer, `catalog/components/combobox`. **Consumer.** Searchable option pickers in forms and filters. **Independent verifier.** A keyboard and screen-reader tester who knows the option IDs in the fixture. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given a visible label, query generation, stable option IDs and an allowed value model, announce the current list. Arrows move the active option, Enter commits an allowed current item and Escape dismisses.

**Predecessors.** [U08B](../U08B-edit-labeled-values/spec.md)

**Denied case.** Typing a query or highlighting a suggestion cannot commit it. A stale match or display-name collision cannot select another ID. Command-palette composition needs an explicit command boundary.

## Failure and compatibility

On a late results page, discard the obsolete generation. On dismissal restore the committed value according to the documented free-text or restricted-choice model. Keep focus recoverable if the active option disappears.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U08C-A | Type, highlight by keyboard, Escape, then choose the second of two repeated labels in a fresh query. | Dismissal commits nothing. The later explicit selection reports the intended stable ID once. | The highlighted item was already committed before Enter. |
| U08C-B | Replace the results while a prior query resolves, and inspect the active option with reduced motion. | No stale suggestion can be committed; the current active state and list are identified by the accessibility tree. | An invisible active descendant refers to the previous list. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I08-act-and-enter-values/intent.md)
