# Native switch foundation

Status: draft for review. This specification does not authorize an implementation change until its mechanism and acceptance evidence are reviewed. The current Native switch remains in place in the meantime.

## Intent and boundary

Align the installed Native switch with the selected shared switch design while retaining the existing `yg-switch` template, its `label` and `checked` inputs, its `toggle` host message, and host ownership of state and effects. The component represents an immediate binary setting; it must not infer or perform a product operation. Native SDK 0.11.1 and Zig 0.16.0 on macOS are the first qualification target. Other targets require separate observation.

The shared design specifies a 52 × 32 px track, a 26 px thumb, a 3 px inset and a label row with at least a 44 px interaction target. The generated Native dimension constants are inputs to the adapter, not proof of the rendered track. The existing 32 × 19 widget is a measured baseline; its renderer limits track height separately from widget frame size. A change to width and height alone must not be accepted as a matching control.

## Design decision to resolve before implementation

Inspect the pinned SDK's rendering, theming, accessible control and animation facilities. Select and document an approach that either uses its native switch with demonstrably sufficient geometry and motion control, or supplies a custom presentation while preserving an actual accessible switch, checked state, focus and input behavior. Explain how generated token values reach the rendering code without maintaining a second independent set of dimensions. If the SDK cannot satisfy the requirements, record the exact unsupported capability and retain the existing template rather than claiming parity.

The design must avoid a duplicate activation when either the row or the switch is pressed. The host remains the source of truth: one activation requests one transition, and the visible state reflects the value it supplies. A declined host change returns to the confirmed value. Disabled behavior must prevent activation if it is exposed; do not silently expand the existing public template contract without reviewing compatibility.

## Motion and accessibility

The selected Web motion profile is a shared input. Define how the Native renderer consumes the duration and curve, handles a reverse during movement and applies reduced-motion changes mid-transition. Merely generating a duration constant does not establish curve parity. Under reduced motion the control settles immediately without losing its checked state or accessible name. Pointer, keyboard and assistive technology must expose a named switch with the correct on/off state and a visible focus treatment; standard appearance uses no decorative outline.

## Acceptance evidence

1. Install the component from the packaged SDK into a fresh isolated Native host. Run strict markup and typed widget construction against the pinned SDK; record versions and distinguish these from a rendered result.
2. Capture actual macOS rendering in light and dark, at narrow and wide available widths, both checked and unchecked. Measure the track, thumb, inset and minimum interactive row in the rendered output and compare them with the shared roles. Record whether the selected SDK mechanism can meet each measurement.
3. Exercise track, label, keyboard and accessible control activation. Observe host message counts and values, including controlled state, a host refusal, rapid reversal, and disabled state if supplied. Verify a single activation results in at most one host message and no unrelated effects.
4. Capture intermediate transition frames and timing in both directions, including interruption, reversal and a change to reduced motion while moving. Compare to the selected Web behavior and explicitly report any unsupported property.
5. Verify package installation, stable template inputs and host binding, generated-token consistency, and affected consumer tests. Report independent visual review, real device or OS accessibility verification, and performance measurements separately; do not infer them from construction tests or a nonblank frame.

## Lifecycle and recovery

First paint uses the host's checked value without an unsolicited action. Removing a control or interrupting its transition must cancel or retire its animation work without altering host state. A preference change updates presentation without producing a toggle. Failure to meet the actual rendered or behavioral criteria leaves this slice unqualified and must not mark the Native catalog complete.
