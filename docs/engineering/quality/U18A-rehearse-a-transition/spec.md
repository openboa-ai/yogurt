# U18A · Review craft and correctness on a real transition

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I18 design r1](../../../intents/quality/I18-review-interaction-quality/spec.md) · criterion `I18-U18A`. Parent specification SHA-256 `2e665e954a5ac35f203b64c5b219d82b5d330cc5f2c833b0d7916059d17b9213`.

## Decision and ownership

Verify motion and feedback for each control family. Watch press, opening or state change, interruption, settling and dismissal. Declare deliberately immediate behavior. Verify accessible meaning and reduced motion separately.

**Proposed writer.** Interaction quality maintainer, `checks/interaction`. **Consumer.** All component and pattern maintainers claiming target support. **Independent verifier.** A design reviewer watches normal-speed footage and a separate observer checks semantics and callback results. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

For the exact candidate, identify a representative reference interaction and explain the useful behavior in one sentence. Capture normal speed, filmstrip, theme, viewport/device, focus/accessible states, event count and a reduced-motion replay.

**Predecessors.** No engineering predecessor.

**Denied case.** A single rest frame, imported reference code, elapsed milliseconds or a browser pass cannot qualify a different platform. The review must identify the part that moves, its origin and the observable final state.

## Failure and compatibility

On a failed frame preserve the clip and failing input, repair the owning implementation and repeat the same scene. A reference site going offline does not change the local contract or the recorded defect.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U18A-A | Open, reverse mid-transition, reopen and select once on each claimed input mode. | No flash, obstructed label, drifting anchor or extra event. The settled screen and accessible selection agree. The reviewer can inspect the actual recording. | The final screenshot passes while the pressed label becomes unreadable for two frames. |
| U18A-B | Replay with reduced motion, a narrow layout and the alternate surface. | State, announcement and focus remain correct without travel. Degraded or untested combinations keep an explicit status. | Switching off movement suppresses the state update or an opaque final panel flashes translucent. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/quality/I18-review-interaction-quality/intent.md)
