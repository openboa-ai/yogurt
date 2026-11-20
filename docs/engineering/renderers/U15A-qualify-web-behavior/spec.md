# U15A · Evaluate the headless web behavior behind one control

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I15 design r1](../../../intents/renderers/I15-use-the-web-adapter/spec.md) · criterion `I15-U15A`. Parent specification SHA-256 `58479ef486024a552ea589a18679b853ae26bbf7e85010a0e17b1d24271e00d8`.

## Decision and ownership

The first candidate is @ui-sdk/react over @ui-sdk/core inside the web adapter. Pin the exact pair under test. The public yogurt contract owns the parts, labels, tokens, event and focus result. One primitive owns focus and key handling per rendered control.

**Proposed writer.** Platform adapters maintainer, `packages/web/qualification`. **Consumer.** Web adapter maintainers comparing behavior providers. **Independent verifier.** A web reviewer running the same bounded fixture against the existing menu and the candidate. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

From one action-menu fixture, run the existing DOM example and the candidate headless implementation with the same labels, CSS intent, cases and callback observer. Record React compatibility, SSR, requested bytes and keyboard behavior.

**Predecessors.** [U09A](../../controls/U09A-operate-an-action-menu/spec.md)

**Denied case.** Do not expose a vendor prop as a required consumer field, import the vendor’s default theme as brand identity, or stack two menu/focus implementations on one tree. A package export is not a qualification result.

## Failure and compatibility

The current example remains an independent reference while the provider is evaluated. If the beta fails a required case, preserve the fixture, evaluate another provider against it and record the chosen provider and pin.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U15A-A | Operate each fixture by keyboard, pointer and rapid close/reopen with normal and reduced motion. | The record compares actual focus, accessible names, action count, motion frames and version for both builds. | The candidate wins because its documentation promises accessibility. |
| U15A-B | Hydrate then remount, disable an item, and observe imported assets and runtime warnings. | The result identifies SSR, duplicate-handler and import cost separately. A required failure keeps that candidate unqualified. | A passing static screenshot or total app bundle is accepted as complete evidence. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/renderers/I15-use-the-web-adapter/intent.md)
