# U16A · Map shared behavior to a native control

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I16 design r1](../../../intents/renderers/I16-use-native-controls/spec.md) · criterion `I16-U16A`. Parent specification SHA-256 `a1aecb3c9fedfdc2124f4d884c5541f2d01a289e07634baae0984025e6f19cbf`.

## Decision and ownership

Use the selected Vercel Native SDK as the default app runtime. Bind shared values and control states to Native markup or SDK-supported native views. Preserve the host’s typed messages and native accessibility conventions. Qualify each capability on the actual target.

**Proposed writer.** Platform adapters maintainer, `packages/native`. **Consumer.** An installed client using Vercel Native. **Independent verifier.** A native reviewer operating the installed process with accessibility tools on a named OS and device. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Start with the same menu or decision fixture used on the web, without depending on a web implementation. Map a native item selection to one stable product-supplied action ID. Record SDK pin, OS, device and release build. Compare the SDK reference app and yogurt on repeated matched trials of cold start, peak memory, frame delay and input-to-visible response.

**Predecessors.** [U03A](../../foundations/U03A-resolve-palette-roles/spec.md) · [U04A](../../foundations/U04A-compose-responsive-type/spec.md) · [U09A](../../controls/U09A-operate-an-action-menu/spec.md)

**Denied case.** React DOM, @ui-sdk/core and the shadcn installer belong to web tooling. An embedded web recording cannot qualify an SDK-rendered control. A missing platform capability remains a named gap. Performance claims include device, build mode, fixture, trial count and baseline.

## Failure and compatibility

Handle suspension or unmount without replaying an action. On resume read the host’s current state. Agree a budget from the measured device baseline before proposing support and report regressions against that budget.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U16A-A | Open and dismiss the installed native control, navigate by keyboard and screen reader, then repeat with reduced motion. | The OS tree, focus and actual screen agree with the shared task; the candidate measurement is comparable to the device baseline. | A WebView recording is labeled as an OS control or a single timing sample is called a performance guarantee. |
| U16A-B | Suspend during a pending operation, resume with a new revision and an unsupported optional control. | One original action persists, the latest permitted projection is displayed and the missing capability is declared. | A native-looking fallback silently resubmits or claims the missing control is supported. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/renderers/I16-use-native-controls/intent.md)
