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

## Motion improvement · comparison phase

The owner authorized a first comparison of Button, Select, Segmented control and Carousel, followed by expansion across the component and recipe catalog and a fresh review of all six agent performances. Track the program in [issue #6](https://github.com/openboa-ai/yogurt/issues/6). The outcomes for this phase are a runnable Web comparison, recorded interaction checks and an owner choice of motion treatment.

| Scene | Candidate behavior | Acceptance evidence |
| --- | --- | --- |
| Button | Immediate surface press and a modest inset. Keep label bounds steady. Reveal the result in the action after the host reports it, while keeping the action footprint fixed. | Press, release outside, one activation, pending, success and failure with a stable target. |
| Select | Open the opaque picker outward from its field with a short directional offset and expansion on supporting browsers. Keep native picker semantics. | Open at both viewport edges. Escape and reopen while entering. Confirm the selected option, trigger value and restored focus. |
| Segmented control | Set the selection immediately and let the visual marker settle toward it. | During A → C → B, keep marker continuity and settle under B while its content and accessible value already agree. |
| Carousel | Follow direct horizontal manipulation. Add depth between incoming and outgoing cards during travel. Preserve vertical scroll. Commit on release beyond the threshold, and restore on cancel. Buttons retain focus and keyboard operation. | Observe the dragged position, direction reversal, snap-back and one-step commit. Expose only the current slide to focus and accessibility. |

Use the existing catalog exports and shared tokens. The comparison scopes the candidate treatment to the guide. Deliver the review via a branch preview. Check first, intermediate and settled frames in a browser, reduced motion, light and dark, and a narrow viewport. Record the host and the tested states. Native validation and signed-off component motion enter later slices after the owner selects the comparison. The existing I18 gate applies to a production quality claim.

## Motion improvement · library rollout

The owner accepted the comparison's motion strength and requested the full library treatment and centered carousel navigation. Apply the approved press, picker, selection and card movement to the shared Web implementation. Move the pager buttons as a centered pair independently of the status label. Connect each catalog entry to the shared treatment its behavior uses. Stationary reading elements retain stable geometry during adjacent changes.

Use quick surface feedback for input and editing. A picker enters with directional travel and keeps hit areas at their actual size for every frame. Give anchored layers clear origins and opaque text. A presented dialog may settle on entry and leave the top layer on a short exit where supported. Dismissal must release input and restore focus immediately. Selection, list and composition transitions follow the latest identity without replaying unrelated siblings. Progress, notifications and result treatments follow the supplied state. Reduced motion keeps interaction and meaning while removing animated travel and repeats.

Retune the six authored presence clips together. Preserve two eyes, the original silhouettes, the public state IDs and the shared Web and Zig pose source. Review roster and detail sizes. Record browser, compiled Native and installed Native observations independently.

The verification slice covers every gallery entry for rendering and representative independent motion on press, choice, layering, direct manipulation, status, workspaces and presence. Keep SDK exports stable and retain the original focus and callback contracts.
