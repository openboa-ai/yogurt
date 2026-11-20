# Component craft and motion

A person should be able to see what their input did, where the interface moved and when it is ready for the next action.

| Interaction | What to verify |
| --- | --- |
| Select | Keep the trigger value, selected option and accessible state in sync. |
| Segmented control | After rapid changes, match the visible indicator and content to the last selected key. |
| Pending action | Preserve the label footprint and reflect the result the host actually reports. |

## Review the frames a person actually sees

| Moment | Look for | Reject the candidate when |
| --- | --- | --- |
| At rest and on focus | One readable action, an accessible name, predictable target and visible focus on both surfaces. | The name changes on focus or the only visible focus treatment disappears into its surroundings. |
| Press and release | Feedback begins at the control under input. The label stays readable. A canceled press has a distinct outcome. | Text loses contrast, size jumps or an action fires before cancellation is known. |
| First and middle frames | The menu is anchored, readable over the underlying page, and moves in the direction that explains its arrival. | A surface flashes, text shows through, clipped content becomes clickable, or a selection indicator points at a different state. |
| Interruption | Repeat input as the transition starts, reverse halfway, then pick a different destination. | An obsolete animation or async result wins, a hidden layer takes focus, or the host sees duplicate actions. |
| Settled and dismissed | Check focus, access tree, state and event count. Watch exit at normal speed, including deliberately immediate dismissal. | A clean final screenshot hides a wrong callback or leaves the keyboard in a removed element. |
| Reduced motion and reflow | Repeat with reduced motion, a narrow or enlarged view and a long label. Keep stable on-screen and spoken meaning. | The state depends on movement or color, text clips or reducing motion removes feedback. |

Measure normal-text contrast against the actual background (4.5:1 for ordinary text, 3:1 for qualifying large text). Inspect non-text contrast where a visual boundary or state cue is required. Capture the adjacent colors actually present, including pressed or intermediate frames. Use native accessibility inspection on a native renderer. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) · [WAI-ARIA interaction patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)

## What a component review contains

1. Name the kit revision, current behavior, candidate, renderer, input device and interaction. List the supported states for this component. A checkbox and a receipt do not have identical state lists.
2. Watch a normal-speed capture from real input to settled state and return. Keep a frame strip of rest, press, first change, midpoint, settle and dismissal plus the reduced-motion replay. For a static element, capture actual sizes, contrast, semantics and reflow instead.
3. Record the selected identity, focus destination and callback count beside the film. For native, include an installed screen and the OS accessibility hierarchy. For a performance claim, include a same-device baseline and the measurements.
4. Write the visible defect or the exact observed result. Repeat the identical input after a repair. A new artifact or a different renderer needs its own result.

The current action-menu sample has a recorded four-pixel, 140 ms opening and immediate dismissal. Its pressed label measured 14.47:1 in the recorded fixture. It supplies an example with a film and frame strip. The broader bar above includes rapid reversals, alternate themes and separate native observation, each subject to its own review. [Web interaction](../examples/project-use/menu-rehearsal.webm) · [Frames](../examples/project-use/menu-frames.png) · [Change spec](engineering/quality/U18A-rehearse-a-transition/spec.md)
