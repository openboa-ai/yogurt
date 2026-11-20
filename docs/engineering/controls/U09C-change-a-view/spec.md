# U09C · Switch the active destination or view

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I09 design r1](../../../intents/controls/I09-navigate-and-dismiss/spec.md) · criterion `I09-U09C`. Parent specification SHA-256 `f2a5574f5e73bb24ba2a924991ef2f0e365a1cc15e2ace08f18d178f511aaf73`.

## Decision and ownership

Tabs select a panel; links navigate to another location; segmented inputs select a value according to their role. Make the selected tab, heading and accessible panel agree. Secondary views retain meaningful labels.

**Proposed writer.** Components maintainer, `catalog/components/navigation`. **Consumer.** Tabs, segmented view selectors and page-level navigation. **Independent verifier.** A tester comparing destination, selection, focus and content after rapid switching. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Given stable view IDs, selected key and availability, choose a destination by its proper interaction model. Use manual activation when fetching a panel would delay keyboard traversal. Define where Back returns for navigation.

**Predecessors.** [U04A](../../foundations/U04A-compose-responsive-type/spec.md)

**Denied case.** A tab switch may not trigger a product command. Do not apply tab semantics to a row of unrelated links or let a sliding highlight become the only indication of selection.

## Failure and compatibility

After a rapid reversal, pointer and key selection settle on the latest allowed view. Restore or safely replace a removed tab by its ID. Ignore late content from previous views.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U09C-A | Change Month to Week to Day quickly and inspect focus, selected name and visible content. | The last requested Day view wins in the indicator, panel and accessible selection. | The capsule settles under Day while the panel still reports a previous range. |
| U09C-B | Remove the selected view and repeat using keyboard and reduced motion. | A valid destination receives focus and its content is identifiable without travel. | The active item is invisible or an old response changes the selected panel. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/controls/I09-navigate-and-dismiss/intent.md)
