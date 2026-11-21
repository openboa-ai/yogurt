# Native switch foundation

Status: draft for review. This specification does not authorize an implementation change until its mechanism and acceptance evidence are reviewed. The current Native switch remains in place in the meantime.

## Intent and boundary

Align the installed Native switch with the selected shared switch design while retaining the existing `yg-switch` template, its `label` and `checked` inputs, its `toggle` host message, and host ownership of state and effects. The component represents an immediate binary setting; it must not infer or perform a product operation. Native SDK 0.11.1 and Zig 0.16.0 on macOS are the first qualification target. Other targets require separate observation.

The shared design specifies a 52 × 32 px track, a 26 px thumb, a 3 px inset and a label row with at least a 44 px interaction target. The generated Native dimension constants are inputs to the adapter, not proof of the rendered track. The existing 32 × 19 widget is a measured baseline; its renderer limits track height separately from widget frame size. A change to width and height alone must not be accepted as a matching control.

## Design decision to resolve before implementation

Inspect the pinned SDK's rendering, theming, accessible control and animation facilities. Select and document an approach that either uses its native switch with demonstrably sufficient geometry and motion control, or supplies a custom presentation while preserving an actual accessible switch, checked state, focus and input behavior. Explain how generated token values reach the rendering code without maintaining a second independent set of dimensions. If the SDK cannot satisfy the requirements, record the exact unsupported capability and retain the existing template rather than claiming parity.

The design must avoid a duplicate activation when either the row or the switch is pressed. The host remains the source of truth: one activation requests one transition, and the visible state reflects the value it supplies. A declined host change returns to the confirmed value. Disabled behavior must prevent activation if it is exposed; do not silently expand the existing public template contract without reviewing compatibility.

### Investigation for the pinned renderer

The default renderer uses a height-capped track and a separately computed thumb. Increasing the widget frame alone does not establish the requested geometry. Its optional geometry policy can provide a track and two thumb rectangles, but is selected through the theme and also participates in the geometry and metrics of other controls. It therefore requires a complete compatible delegation path and regression checks for unrelated controls; installing a toggle-only handler as the global policy is not an acceptable isolated change. The renderer also has a separate command policy path. The interaction between those paths, the generated token inputs and the animation implementation must be established before selecting either as the adapter mechanism.

In one observed 480 × 320 window, the sample has content below the available height, including the appearance control. Any fixture used for acceptance must expose every required control at the tested viewport, including narrow or short windows; a nonblank canvas is insufficient evidence of usable layout. The fixture may use scrolling or a larger window for different checks, but must record the actual viewport and must not hide an unreachable control.

### Candidate implementation boundary

The preferred candidate is a scoped SDK capability for the existing semantic switch: let its control-specific geometry consume the generated track width, track height, thumb size and inset, and let its transition consume the generated switch duration and sampled curve. The semantic node, checked value, focus and host message remain owned by the existing control. The track, both end positions, travel and hit-test/accessibility bounds must be derived from the same geometry. If the current SDK cannot express that scope, the capability must be provided by an independently reviewed, pinned SDK change before this adapter claims parity. This is a proposal for review, not a statement that the current SDK already exposes that API.

Do not install a global geometry or drawing policy merely to change one switch. In the examined runtime, the `UiApp` stamps the app-level geometry policy over values returned by `tokens_fn`; the same policy is consulted by other controls, text, layout and metrics. The TypeScript host also reserves its own policy wiring. A full, version-matched delegate could be explored only if it preserves every unmodified operation, rejects unsupported versions and passes unrelated-control, text, layout, focus and rendering regressions. A toggle-only policy, a silent fallback when policy dispatch fails, and a global style change are not acceptable.

Do not independently draw a visual switch over a hidden native control unless a separate reviewed experiment proves a single accessible switch node, correct checked value and focus bounds, unobstructed input, no duplicate action, synchronized clipping and resizing, and correct motion. The runtime currently exposes a switch in its widget semantics; its macOS projection maps that role to a checkbox role. Actual accessibility names, value, action and VoiceOver behavior therefore require platform inspection rather than inference from the widget snapshot.

The current switch transition uses the view-wide fast duration, which the existing theme sets to 110 ms; it does not read the generated 490 ms switch duration. Changing that shared fast duration or easing would affect other users of the same motion role. Its runtime animates the retained thumb command for direct pointer or keyboard activation. The separate row press in the current template is not the switch-target path and needs explicit parity testing. A replacement animation is installed from a full-travel endpoint rather than demonstrably sampling the current visible position; prove interruption continuity with actual intermediate frames before relying on it. The available spring progress is clamped to the 0–1 range, while the selected sampled curve includes overshoot; setting the spring enum alone cannot reproduce that curve.

The proposed SDK capability must sample and retarget the currently displayed thumb on reversal, handle a refused or delayed host update without reporting a false state, retire animation work when hidden or removed, and settle immediately when reduced motion becomes active. Keep the work bounded to an active visible control and its dirty region, with a defined static fallback if an animation slot cannot be allocated. Pass generated values as data; do not duplicate literal geometry or hand-maintained curve samples in the adapter.

Before implementation admission, demonstrate a small isolated proof using the existing accessible switch, then compare it with an unchanged mixed-control fixture under the pinned SDK. Verify geometry at normal and high scale, the exact sampled curve and interruption at several times, pressed row versus track dispatch, host rejection, dynamic reduced motion, focus and macOS accessibility projection. Measure frame times, peak memory and input-to-first-response against the unchanged fixture with a named build, device, trial count and explicit thresholds. Source inspection and successful fixture construction are not substitutes for those observations.

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
