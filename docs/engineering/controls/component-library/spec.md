# Component library · local implementation, revision 1

The owner selected the first-four proportions and asked to carry the design through the entire [component inventory](../../../components.md), with OpenBoa's color and geometry tokens. This accepts the visual basis and authorizes a local SDK and gallery. New variants are locally implemented design choices available for inspection. Publication and adoption belong to the owner and consuming products.

| Accepted basis | Revision 2 SHA-256 |
| --- | --- |
| Button, 8 px corner | 1874c39adf964f3afa634aa8d379c83024f159fc2bd577b5c8f58ae2f024d113 |
| Icon button | d8fb4e1ce832a3e9b802f6b0480fec0685992f0c99502aadb1ba9e11c9709b6b |
| Text field | 60b5d22de8edb35e37c3fba91e9575d3b1016e50ed5b5c055336ffe84a75f123 |
| Switch | 0fa8591537c90fa1f0f3c2b1a3694111219f2a73425efee005b9d716229abffa |

The follow-up selects the existing OpenAI Apps SDK UI implementations for matching web parts. Bind those parts to owned palette and geometry aliases. Add only missing primitives such as supporting type, duration and switch geometry. Keep the source palette intact.

## Scope and evidence

| Requirement | Implementation and observation |
| --- | --- |
| 1. One token source | Resolve component roles into existing numbered palette colors. Neutral is the default for control fills, hover, and ordinary selection. Reserve Ink blue for major actions that request the brand tone. Validate both appearances and the contrast of alternate surface treatments. Rethink Sans, 14/20 action labels, 36 px regular height, 8 px corners and 44 px touch are the center of the scale. |
| 2. Basic components first | Implement the ten named families. Export typed components, controlled inputs and stable IDs. Baseline and practical variants share the same control. Instantiate every public catalog entry in the working gallery. |
| 3. Variation by function | Move between compact, regular and touch sizes, filled, soft and quiet emphasis, and the existing Neutral, Paper and Mist surfaces. Preserve keyboard focus, accessible names, state and semantic color across changes. Check field errors, no matches, canceled decisions, interrupted requests and original receipt lookup. |
| 4. Reusable distribution | Package only component code, styles, relevant assets, notices and tokens. Supply a local read-only check of declared consumer surfaces, editable individual registry entries, the same import to Next.js and Vite and renderer-specific evidence. Keep third-party code and original brand masters identifiable. |
| 5. Default native host | Bind shared token values and component states where Vercel Native SDK supports them. Record actual runtime, toolchain, target and gaps separately. Never infer native support from a React capture. |
| 6. Direct review | Show real components with working keyboard, pointer, light/dark and touch behavior. Use minimal, English-only copy, task-sized group gaps and shared surfaces. Exercise production bundle, focus, reduced motion and narrow width. |

Data comes from the consumer. Display and dismissal generate no external effects. An explicit command invokes only the supplied callback. A composition retains the host's original ID, current revision and response generation. Keep the saved-view study, stable catalog IDs and prior standalone kit working. Verification belongs in [the local evidence record](verification.md).

### Native code field focus and shared source checks

Keep the six-cell Native code field borderless on pointer and keyboard focus, with only the first cell filled while the field is empty and focused, restoring its resting fill on blur. Keep its public entry, accessible label and digit editing contract. Verify click, Tab and typing in the running guide using the installed control. The Required CI aggregate must fail when Shared UI sources fails, is skipped or is cancelled.

Yogurt supplies the typed OTP, tokens and installer. The consumer owns the Native SDK pin, Zig build graph and release workflow. The OTP requires an SDK with the empty focus cell paint capability and reports the missing capability at compile time.

The macOS OTP consumer declares the exact Native CLI version and source patch in its own package manager lock. The package manager materializes that SDK during dependency installation. The app's Zig dependency points to the installed framework. The same SDK is used for standard Native development, build and packaging commands. None of those commands uses Yogurt to replace the SDK dependency or alter the app's manifest.

Required CI exercises a fresh package install, the typed OTP in a running development app, and a packaged app built with the app-owned Zig dependency. Focus verification compares the resting, click, Tab and blur captures. Verify that the app's declared SDK dependency and its source files stay unchanged during the build, and that the Yogurt archive contains the component and its tokens.

The packaged Native guide links to an immutable revision of the app-owned OTP SDK setup and gives a runnable first-install example. The consumer check executes that setup from the packed guide in a fresh directory, then verifies the standard Native development and release paths. The application owns the downloaded pin and the resulting SDK.

### Select when open

The owner reported that the opened Select looks out of place. Apply requirements 1–3 and 6 to the option list in the web SDK, component gallery and brand guide. Align option text to the field value, match the field width, and leave a 4 px gap. Use an opaque material surface, a quiet active row and a trailing ink-blue check for the current value. Keep the field and rows at least 44 px tall on touch screens. The list can open above a field near the bottom of a viewport and scroll through longer choices.

Keep the existing select element and its form contract. Opening, navigating and canceling preserve the committed value. Choosing an enabled option updates the consumer. Exercise pointer, keyboard, disabled options, form reset, light and dark materials, and mobile width in the built distribution.

### Public component coverage

Give each supported component a stable Yogurt ID and named variants where appropriate. Yogurt owns the implementation, terminology, token roles and examples. Keep component imports and the ten original static patterns available.

The guide, Studio, templates and consuming apps exercise the public renderer for each component on their target. The catalog identifies the default when a Native component also ships compatible markup. The installer and agent lookup must point to that same entry. The Native guide takes its components from the same installation path as a fresh consumer and supplies its own fixture data. Preserve existing imports, edited consumer files and retry behavior. Verify the installed entries against the guide and check that web and Native token outputs reproduce from the design sources.

Author Native control templates together under `packages/native/src/templates` and each block's template with the recipe. Bind component gaps, padding and anchor distances to shared roles or primitives. The build resolves these references into the numeric markup required by the SDK at its existing public paths. Migration preserves every published template byte for the current token values. A spacing change must update the web variables, Zig constants and affected installed markup in one generation pass.

Calendar values represent local civil dates. A quantity is an integer bounded by the host. OTP and keypad input remain local to the host, with no submission until an explicit action. The default private keypad obscures displayed characters and uses a per-session randomized layout. App authorization and credential processing stay with the host. A questionnaire emits responses keyed by the host's question and choice IDs. A trace displays host-supplied events. Menus, calendar navigation, split panes, dialogs and accordions retain their keyboard and dismissal conventions. Accessible inputs and configurable primitives supply their own state or typed change events. Measure the actual opened surfaces.

Each named component has a working gallery example, individual import, editable registry entry and native binding. Verify all Yogurt catalog entries resolve, install from the local package, exercise interactive groups, render every entry in light and dark at desktop and mobile widths, and instantiate native templates against the pinned SDK. Identify host-owned interaction and runtime evidence explicitly.

Give an edge drawer and a semantic table their own entries. A drawer opens from the lower edge, allows a deliberate downward drag and remains dismissible with its close action and Escape. A short or canceled drag returns to rest. A data table adds column sorting to the semantic table, preserves row identities and keeps missing observations last in either direction. Native uses the SDK drawer and table primitives. Its host owns row ordering.

### Editable compositions

The owner also requested ready-made combinations following the individual components. Supply four common tasks from the existing settings, collection, decision and conversation intents. A block installs editable composition source for the chosen platform. Its shared parts come from the same package pin. The website operates that source with local example data. A consuming host supplies saved values, authorization, submission, messages and results. Test dismissal, empty and pending states, the installed source, repeat installs and conflict preservation.

[OpenAI Apps SDK UI](https://github.com/openai/apps-sdk-ui) · [Registry item schema](https://ui.shadcn.com/schema/registry-item.json)

## Agent and project workspaces · local follow-up, revision 2

The owner requested an unframed agent silhouette and coverage for agent-first and project-first workflows. Retain stable component IDs, existing consumers and OpenBoa's artwork, type and palette. Give a named agent's silhouette its own transparent presentation. Profile avatars can still use a circular crop. Use the same silhouette in lists, messages and the selected agent header. Keep the existing gaze states.

Native transcript follow-up: the scroll container takes the available height rather than collapsing to zero. Preserve the caller's label and message slot, and permit the host to constrain the available viewport. Verify visible message content in a flexible parent and scrolling with content taller than a constrained viewport.

Native sidebar follow-up: the project and agent lists reserve a visible minimum while growing with the host, rather than collapsing their scroll viewport. Nest project destinations inside their disclosure heading, preserve the existing messages and slots, and verify both the visible default list and overflow scrolling.

Native navigation follow-up: show the sidebar disclosure direction and indent destinations under their parent. Navigation-menu entries align to the start and retain their existing activation and disabled data without requiring new host fields.

Native data and feedback follow-up: keep the neutral notice surface, icon and insets consistent with the shared roles, and allow descriptive text in records, results, charts and lists to wrap rather than disappear at narrow widths. Preserve existing data, messages and slots.

Native agent avatar and gaze accept an optional square size, defaulting to the existing 48 points. The guide may use 72 points for its primary sample while smaller roster uses remain available. Preserve the image ID, label and original motion data.

Native typography resolves the existing display-size token as well as the body, action and heading tokens, so a display text uses the same 40 px scale as the web guide.

| Surface | Required behavior |
| --- | --- |
| Agent workspace | Search the roster and select a stable agent ID. Show a named current agent, recent context, unread and attention states. Keep a usable reading pane with optional computer status and inspector. Expose watch, request control and return only through explicit host callbacks. At narrow widths provide a way to reopen the roster and close the inspector. |
| Project workspace | Show the project's own mark, title and list of threads. Scope tabs, filtering, sources and contextual instructions to the selected project. Include collection search, typed resources, actionable empty states and available sharing controls. |
| Conversation | Compose a draft with the host's selected attachments and tools. Deliver send and stop on explicit activation. Render host-provided task, handoff, draft review, resource and voice states alongside text. Announce meaningful state changes in words. |
| Operations and results | Read and filter attention items, routine rows, capability entries and artifacts. Show next occurrence, outcome, connection and access states. Give actionable previews and feedback for role review, approvals and delivery where the host supplies them. |

All fixtures are local and reversible. The consumer provides authorized projections, stable resource IDs, confirmation and effect results. Changing navigation only changes the view. Scope selection and draft state to their owning agent or project. With revoked access or a missing selection show only available records and remove the inaccessible view. The kit neither captures microphone input nor opens a terminal, accepts credentials, calls a computer or sends messages to services. Components and blocks expose key actions through named callback or typed Native bindings. Original layouts and artwork carry OpenBoa's own visual identity. This pass establishes structure, static states and behavior. Motion design follows separately.

Identify the rendered output of each new entry at desktop and narrow widths, in light and dark. Exercise roster search, empty recovery, agent switching, project-scoped tabs, filters, attachment removal and saving a draft. Verify that approving an action, editing a schedule and requesting control only report the explicit user intent. Maintain package and registry distribution and verify Native markup and widget construction where supported. Report presentation, callback and native-device evidence at their observed scope.

## Composable project sidebars · local follow-up, revision 3

The owner requested a shared sidebar that each project can compose from independently usable parts. A layout owns the responsive shell, desktop presentation and mobile dismissal. Its header, scrollable content, footer, groups, submenus, item actions and toggle are independently chosen by the consumer. Keep existing `Sidebar({ label, links, current })` consumers working.

- Use a start or end edge, an inset or flat panel, and optionally a desktop icon rail with legible access to every destination. A consumer can control desktop collapse. A narrow layout uses a dismissible modal drawer and retains the observed desktop setting when width changes.
- Keep links navigable, distinguish separate item actions, label each group and expose active identity through `aria-current` on the active destination. Use plain links and buttons for ordinary navigation. Section and submenu disclosure uses keyboard-operable buttons. Collapsing the rail preserves group intent on return. Opening the drawer never changes the route.
- Return focus to the opener when dismissing with Escape, a backdrop or the close action. Selecting a destination can close the drawer. Persistent search, selected records, permissions and navigation data belong to the host. These choices carry no service effects.
- Ship two editable compositions with project or agent markup, host search and actions, active state and a narrow alternative. Use OpenBoa artwork and tokens. Native uses typed markup and host-controlled visibility. Exercise wide, rail, right edge, narrow modal, nesting, controlled state, and old props. Verify installed entry points and actual keyboard and pointer behavior.

### Workspace row and conversation presentation

A sidebar item can render a single truncated description beneath its label. The destination name remains the button or link name and the full description is available separately. Rail mode retains its single identity label. Message supports sent and received treatments and an optional action region. Secondary actions remain visible with touch and keyboard focus. Transcript supports an opt-in reading anchor that appears after the reader scrolls away and returns focus to the reading region when used. Existing callers retain their default presentation and reading-anchor behavior. Verify these options through the installed web package, including compact navigation and reduced motion.

## Motion and visual craft · local follow-up, revision 4

The owner requested six distinguishable agent states and a motion review for each component. Review every catalog entry for a useful response to input or state. Apply continuous or transitional motion where it explains real behavior. Static reading, geometry and artwork retain stable content. The agent workspace and project workspace exercise these treatment decisions.

The host reports ready, thinking, working, waiting, blocked and done. Use the original open silhouettes with a fixed outline and motion confined to the eyes. A state label must remain available. A ready agent stays still. Only active work repeats. Offscreen work can suspend visible frame updates without affecting the host state. Waiting, blocked and completion settle to a readable pose without implying another task or advancing the host state. Reduced motion uses a stable pose. Match both identities at roster and conversation scale. Native hosts can use the same authored keyframe sequence with transparent frames registered into one owned image slot and their own elapsed time.

Share colors, easing, press, selection and layer values. Feedback begins under the initiating input. Do not delay real focus, selection, close, data or callback state for an animation. A quick reversal settles to the latest input. Menus and drawers appear from their opening edge, dismiss with focus recovery and keep the existing anchor contract. Pending actions keep the saved label footprint for their supported copy. Streamed replies retain reading position and separate current state from old replies. Reduced motion retains all information and eliminates travel, repeated decorative movement and tweening.

Record the Yogurt treatment and target scope for each component. Exercise the two compositions, active input, rapid interruption, cancellation, keyboard focus, direct manipulation and reduced motion. Retain screenshots or frame samples of real states and test archived artifacts, the installed package, the web renderers and typed native frame selection. Native system animation belongs to each consuming runtime. [Motion guidance](../../../motion.md)

## Expressive agent eyes · local follow-up, revision 5

Make the Yogurt faces more active with gaze shifts, deliberate blinks and fully closed eyes. Keep state mapping, playback visibility and motion preferences explicit.

Keep each silhouette, dimple, palette and eye spacing fixed. A live ready agent can blink and glance occasionally. Working has a clear scanning rhythm. Other states use a short gesture and hold a recognizable pose. A finished agent can hold its eyes closed briefly and reopen. A transcript can explicitly render a static portrait. Repeating states pause when they are offscreen. The system motion preference presents centered open eyes and preserves the state label.

Use one set of authored frames for web and Zig. Verify a fully closed frame and visible positional change in both live loops, held and released completion, an opt-out for old messages, the fixed outline at small and large sizes, the OS motion preference and native frame selection.

## Eye and body acting · local follow-up, revision 6

Kai and Sol use eye-led 2D motion and retain their artwork and colors. A turn couples an early gaze with a later body response, a narrower far eye and a wider near eye. The same flat path carries the notch throughout. Both avatars have a restrained version for roster sizes. The six host states and their text labels keep their existing meaning.

Use authored 2D poses to drive the original outline and two eye shapes. The web renderer can hand pose interpolation to the browser, pause outside the visible view, and blend state changes from the displayed pose. Archived portraits and the motion preference retain the neutral face. Rapid status changes and interruption preserve the current pose and the newest label. The views perform no service effects.

The Zig canvas adapter uses the same poses and original path to produce drawing commands. Live pose updates use affine transforms and keep each path stable. The host owns visibility, reduced motion, the clock and the submission of display commands. Existing image ID consumers retain their static art and compatible image playback API.

Acceptance requires actual frames at roster and detail sizes, stable outer bounds and transparent artwork, a gaze that leads the body, opposite turns with different near and far eye sizes, a held finish blink, continuity under rapid changes, and a still fallback. Cross-check representative Web and Zig poses, execute vector drawing with the pinned SDK, and compare local static and active rendering evidence before describing performance or device support.

### Revision 6 follow-up · Longer state performances

The owner confirmed the current visual direction and asked for longer, less simple animation. Keep the same six host states, artwork, size profiles, motion preference, renderer bindings and uninterrupted current-pose transitions. Each state needs a recognizable beginning, development and rest. Build those beats with gaze targets, eye opening, small shifts in weight and well-placed holds. The state label changes immediately. An animation never delays or advances the host state.

| State | Performance |
| --- | --- |
| Ready | Two small checks separated by an unhurried hold. Blink once, return to the centered original pose and leave several seconds of stillness. |
| Thinking | Recall with an upward glance, hold while considering it, then lift slightly as the gaze resolves to its final point. |
| Working | Scan, blink, read a lower line in short steps and make one last check before the next cycle. |
| Waiting | Turn toward the expected input, hold an attentive pose, briefly check back and settle. |
| Blocked | Draw back, check the other side and lower the eyes before accepting the held pose. |
| Finished | Anticipate a small nod, hold a closed-eye moment at the bottom and release to neutral. |

Let one-shot clips develop for roughly two to four seconds, then stop requesting updates at their final pose. Leave the repeating clips enough time for distinct beats and still intervals. Cap full-size body roll at 6.2 degrees and vertical offset at 3.2 view-box units in either direction. Maintain shared numeric poses for web and Zig, with static archived portraits and no timeline when reduced motion is enabled. Verify each clip at 96 and 24, timed changes in all six states, interrupted late poses, quiet tails and Native frame scheduling. The gallery sequence must leave enough time to see each performance.

### Revision 6 follow-up · Expressions formed by the eyes

The owner asked for immediately distinguishable expressions carried by animation. Keep the original silhouettes and colors. Transform the eyes themselves within the shared avatar timeline. Retain the host's six state labels and the current outer dimensions. Use no emoji or thought bubbles in this treatment.

The face always has two separate eyes. Ready uses the original pair. Thinking makes an alternating upward glance. Working reshapes the eyes into horizontal ovals that follow the reading scan. Waiting stretches the eyes upright, blinks, and keeps its attentive pose. Blocked recoils and lets both eyes lower into an uneven squint. Finished nods with both lids narrowed and opens into a softer gaze. Each state interruption starts from the visible eye and body transforms.

Use the same generated geometry and poses on web and Zig. Keep an expressive still pose with reduced motion and the original face in archived portraits. Preserve the three-transform Zig interface and the existing path budget. Verify both eyes remain separate, their motion is interruptible, the outer bounds stay stable, and the intended gestures render at 96 and 24.

The owner then requested more assertive body motion in the same expressions. Allow full-size body roll up to 11 degrees and vertical displacement up to 5.4 view-box units on an accent. Coordinate the motion with the eyes. Thinking lifts after looking up, Working leads with the eyes and follows with a wider turn, Waiting leans in, Blocked recoils and sinks, and Finished compresses into the nod before the eyes open again. Keep Ready quiet and preserve the restrained roster gain. Confirm the whole silhouette stays inside its original viewport throughout the clips.

### Revision 6 follow-up · Readable state rhythm and held posture

The owner approved improving the six gestures after a label-free comparison found that they shared the same early sideways tilt and nearly identical late faces. The silhouette, separate two-eye structure, status vocabulary, 112 ms handoff and outer dimensions remain the avatar contract.

| State | First response | Continuing cue |
| --- | --- | --- |
| Ready | Centered body and forward eyes | Quiet blink and still, symmetric baseline |
| Thinking | Eyes look up before the body lengthens | Higher gaze and tall, upright posture |
| Working | Sideways eye motion leads the body | Repeated passes across a reading line. A forward-leaning pose remains through the loop seam. |
| Waiting | Short lift and a forward gaze | Upright eyes at one target. A blink returns to the same posture. |
| Blocked | Short flinch, followed by a quick downward stop | Compressed silhouette and low gaze remain until the state changes |
| Finished | Quick dip and release | Small raised lean and eased eyelids remain after the nod |

Give compact faces enough eye area to survive at 24 px. Preserve readable status text, the static original for archival portraits, and offscreen suspension. Reduced motion presents a representative authored pose for each state, with no timeline updates. Web and Zig use the same selected frame. No symbols or service effects are introduced.

Verify the first half second, representative movement and late view at 96 and 24 px with labels hidden. Verify the working loop seam, waiting gaze before and after its blink, blocked and finished settling, interrupted handoff, the reduced-motion pose and separation of the two eyes. Confirm the stronger small-size gestures still stay in the original bounds. Frame comparison supports a design judgment. User recognition accuracy requires a separate human study.

### Revision 6 follow-up · Separate eye shapes and contrasting gestures

The owner requested more easily distinguished states, including a Finished bounce and two separate X-shaped eyes in Blocked. The owner retained the current Blocked body drop. Keep its numeric body trajectory and held pose. Change the eyes in the narrowing phase at impact, then hold both X shapes low in the face. Finished makes two short spring jumps of different heights, landing between them and settling with two smiling eyelids. Thinking looks upward with a slower asymmetrical expression. Working follows a reading line with short sideways dashes. Waiting opens its eyes and looks from side to side. Ready stays quiet with a soft double blink.

Use shared outline data for the new eye shapes and shape transition times. Reuse the avatar's body and two eye drawing slots. Keep the original three-transform canvas entry for callers that supply their own round poses, and support authored shapes through Playback. Retain the base art, viewport, state labels, reduced-motion stills, archived portraits, and suspension. There are no images to decode or service effects. Confirm two distinct jumps and intervening landing, an unchanged Blocked body path, separate X eyes at 24 and 96 px, a smooth status interruption, and bounded visual motion.

The owner asked for Waiting for you to visibly search for the person. Keep the open, high posture and alternate a left look, right look and front-facing hold in one slow repeating search. Use longer holds and higher, wider eyes than the Working scan. Confirm the gaze travels to both sides, stays readable at 24 px, and resumes at the same pose across a loop seam.

The owner asked for Thinking to look up while the body makes a small orbit, and for Working to feel busier with more open, rounded eyes. Use a high, slow gaze and an asymmetrical upper eye posture in Thinking. Use several short saccades and line resets with rounder eyes in Working. Finished is a clearly upbeat reaction. The higher jump and the smaller rebound both show the smiling pair, with a visible launch, landing and release.

At roster size, increase the eye area and amplify the useful axis for each gesture. Working travels farther sideways, Thinking uses a wider small orbit, Waiting uses taller eyes, and Finished uses greater vertical travel. The Blocked body trajectory is unchanged at both sizes. Check 24 CSS px at a one-pixel device scale alongside the detail size.

### Revision 6 follow-up · Distinguish thinking, working and searching

The owner found Thinking, Working and Waiting for you too similar. Use distinct posture, eye shape and timing throughout those three states, including their 24 px roster render and selected still pose.

- Thinking traces a slow upper orbit. A raised, open eye and a lower half-lid hold an asymmetric upward expression after the movement.
- Working stays low with open, round eyes. It makes fast horizontal reading steps, followed by a short drop when returning to a new line. The body follows sideways with little roll and retains an active reading pose through the seam.
- Waiting for you holds two tall eyes and turns its whole body toward each side. Keep each look long enough to read as checking for someone, then look forward before repeating.

Preserve the original artwork, two separate eyes, gesture definitions for Ready, Blocked and Finished, state vocabulary, and the same renderer and transition contract. Confirm the three silhouettes stay within the viewport. Compare their motion and posture concurrently at actual roster size, plus detail and reduced-motion checks. Use the same avatar implementation in the comparison.

### Revision 6 follow-up · Distinct focus, searching and celebration

The owner requested a Thinking turn in place. Keep the body on a fixed vertical axis. Squeeze its width in the side views and reopen it as the back and front pass through. Let the eyes travel to the right edge, narrow out of sight as the body turns, then return from the left. Both eyes use rounded lids and remain distinct on either side of the turn. Finish with a high, slightly asymmetric gaze. Waiting for you keeps the original eye poses, blink and transition speeds. Translate the whole body farther to each side and tilt it in that direction while its eyes seek. Finished retains its two jumps and uses two constant-width, round-ended eyelids with a slight mirrored tilt and the same stroke weight as the Blocked X eyes. The rounded eyes close into the jump, and the smile opens gradually from the closed frame. Both arches lift at the two peaks and settle at the landing without thinning.

Extend all six performances. Ready makes a quiet second check much later in its loop. Thinking considers another point before the turn, then pauses and narrows its eyes in concentration as it settles. Working keeps its original fast steps and adds one more low reading pass before rejoining the loop. Waiting extends the held looks on both sides and the time spent facing forward while keeping the original transition lengths. Blocked keeps the first droop and X eyes, then sinks again slowly and settles into the same low pose. Finished keeps two jumps and adds a small, smiling sway before it settles.

Preserve the shared artwork, two eye slots, state names, outer dimensions, canvas entry points, current-pose transitions and reduced-motion stills. Host status changes still interrupt a performance immediately. Compare the previous and revised expressions for Kai and Sol at 24 and 96 px. Verify a centered Thinking turn, eyes hidden as the back comes into view and eyes reappearing from the left, a larger Waiting sweep with opposite tilts and matching gaze, and a closed transition into the Finished arches and the same eye stroke weight at both peaks and the landing. Sample the bounds and cross-check the Web and pinned Zig render paths from the shared source.

### Revision 6 follow-up · Animate the agent family

The owner selected the local.14 performances and requested them for the complete existing agent family. Apply the six shared timelines to all 45 fitted outlines across 15 silhouettes. Derive stable variants from the source SVG and notch position. Keep the approved Kai and Sol geometry, durations, eye paths, playback and existing entry points byte-equivalent where their data is generated. Fit body travel, tilt and gaze range per silhouette. Color choices reuse shared palette tokens without allocating more timelines or changing geometry.

Use the same registry and fitted transforms to render React and the typed Zig canvas. The host supplies identity, state and time. Preserve reduced-motion stills, archived artwork, interrupted transitions and visibility behavior. Validate only registered shapes and notch positions, and keep the core components usable without network or encoded frames. Publish no identity assignments. Keep palette permutations as candidates until their visual distinguishability is reviewed.

Acceptance enumerates each of the 45 source outlines and exercises the six states at 24 and 96 px. Check interpolated outlines and both visible eye outlines for containment. Inspect the family in an interactive grid and verify the original two agents against local.14. Verify native rendering with stable path IDs and web behavior on narrow and wide screens.

The Native HoverCard keeps its trigger reachable when expanded. Anchor the content below the trigger and route outside dismissal through the existing toggle message. Verify that the trigger can open and close the card.
