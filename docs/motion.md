# Motion

Use motion to make input, changes and current work legible. The [component motion catalog](../catalog/motion.json) records the intended treatment for each component and editable block. Check [renderer evidence](engineering/controls/component-library/verification.md) for observed behavior.

| Interaction | Yogurt treatment |
| --- | --- |
| Press and result | Keep the target and label steady. Show pending and success when the host reports them. |
| Direct manipulation | Keep the visible value coupled to the pointer or keyboard input. Apply settling after release. |
| Choice and navigation | Change displayed content and accessible selection together. A rapid reversal follows the latest input. |
| Layers | Reveal the surface at its anchor. Set focus when it opens and restore focus when it closes. |
| Conversation | Preserve draft and scroll position. Use text to report the host's current state. |
| Reduced motion | Keep meaning, focus and input feedback available with travel and repeated animation removed. |

## Eye and body motion

The current avatar uses [six authored clips](../design/assets/agents/avatar-motion.json) for its body and two eyes. Direction, posture and rhythm distinguish the states.

| State | Timing and gesture |
| --- | --- |
| Ready | An 11.16-second loop holds its stance, gives a soft double blink, then checks one side and later the other. |
| Thinking | Over 5.64 seconds the eyes pause overhead, travel to the right edge, disappear during a centered turn, and return from the left. A brief squint leads into a slightly asymmetric upward look. |
| Working | In a 6.16-second loop the round eyes read in quick passes with short resets to the start of each line. The body stays low and close to level as it follows the eyes across. |
| Waiting | In a 6.42-second loop the wide-open eyes lead the body as it slides and leans to the left and then to the right. Each side holds for just over a second before the character blinks and looks ahead. |
| Blocked | Over 4.32 seconds a short flinch gives way to a droop, followed by a slower second sink and a long hold. The two X eyes appear during the first drop and stay low. |
| Finished | Over 4.27 seconds a taller spring and a smaller rebound share a distinct landing between them. A closed-eye frame leads into two rounded arches with the stroke weight of the Blocked eyes. The arches rise at both peaks and move with the sway at the same weight. |

Waiting uses the widest roll and Thinking holds the highest gaze. Blocked settles low, and Finished compresses at the launch and landing of each jump. Kai moves slightly more than Sol. Both have a restrained scale at 32 points and below. A state change blends for 112 ms from the pose already displayed. Reduced motion holds a representative body and face pose and preserves the state label. The original open pair is used for archived portraits.

The web implementation interpolates the shared poses. The Zig renderer samples the same authored poses and reuses stable path data.

## Agent family

[Open the family gallery](../apps/guide/generated/agents.html) to play the same six performances across fifteen silhouettes and forty-five fitted notches. Select a silhouette to see all of its notch placements at 96 px. The roster renders every placement at 24 px. The shared palette provides 26 fill options with at least 4.5:1 eye contrast.

The [SVG inventory](../design/assets/agents/silhouettes.json) defines each outline and its eye center. [Animation fits](../design/assets/agents/animation-fits.json) set travel, tilt and gaze ranges for each silhouette. The fit reuses the same durations, motion curves, eye outlines and phase boundaries across notch positions and colors. Kai and Sol keep their existing authored profiles.

Use a registered shape-and-notch ID such as `round-star-right`. The 1,170 geometry and color combinations are renderable candidates. An identity counts toward assignment only after the palette review confirms it is distinguishable at roster size.
