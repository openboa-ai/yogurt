# Motion-led component foundation replacement

The owner selected the interactive motion gallery as the design baseline for the entire component library and asked to replace the existing foundation and guide. This work covers every catalog component, shared token, editable block and its published entry point. Palette values and the Rethink Sans family remain the approved brand inputs. Font sizes, weights, spacing, surfaces, shapes and motion may change to match the selected examples.

A matching specimen supplies the resting geometry, interactive states and transitions for its component. A specimen with no exact counterpart supplies the related family's visual language and measured roles. Shared repeated values belong in the canonical token source and are generated to web CSS and Zig. Component-specific geometry stays with the component. Avoid visible box outlines in ordinary appearance. Maintain a recognizable keyboard focus and forced-color states.

Each replacement must work through the ordinary package export, editable registry and guide, as well as in composed screens. Keep public component IDs, existing props, accessible names, native form behavior and callbacks compatible unless a change is explicitly selected. Product data and effects remain with the host. Reduced motion, keyboard, touch, interruption and rapid reversal remain usable. A fixture performs no service effect.

## Delivery sequence

1. Inventory each catalog entry against an interactive specimen or its nearest design family. Capture rest, active and recovery states before changing its family. Record actual findings rather than inferring approval from an interactive test.
2. Define the measured shared roles in the canonical token source. Generate and validate web and Zig outputs from that source. Preserve the distinction between a generated native token and an observed native rendering.
3. Replace matched components at their existing entry points. Then design the unmatched components using those same roles, and replace their implementations. Remove redundant gallery-only approximations when the shared control covers them.
4. Rebuild guide examples, editable entries and compositions from the replaced primitives. Compare desktop and narrow layouts in both appearances, with pointer and keyboard interactions, interruption and reduced motion. Review representative rendered frames with the owner before the draft preview is updated.
5. Verify package exports, registry generation, all affected web components and the native adapter. Report actual host/device evidence independently. The work is incomplete while any catalog family or required renderer remains unverified.

The first reviewable slice replaces the default tabs and segmented control with their selected moving-indicator geometry, lifts OTP geometry into generated design tokens, and adopts the selected switch geometry. The default tab contract still exposes every supplied tab and panel, keyboard selection, disabled states and existing dock presentation. Narrow tab lists scroll horizontally when their labels cannot fit. Segmented controls preserve controlled selection, disabled options and keyboard access; their indicator remains within the track on narrow screens.

Segmented options use an 8 px minimum inline inset and a 2 px gap between options. Keep the moving indicator aligned to the selected option across dynamic sizes, keyboard changes and narrow containers.

## Button family

The everyday action has filled, soft and quiet emphasis, compact, regular, comfortable, spacious and touch sizes, and neutral, brand and danger tones. The height roles resolve to 30, 36, 40, 48 and 44 px respectively and are shared across renderers. A control-radius shape is the default for standard actions. A pill shape is available for the compact copy, quantity and prominent action language. Icon actions keep an accessible name and their own hit area. Pending state retains its accessible label and blocks repeated activation.

Use dedicated controls where the action has its own lifecycle: copying reports the clipboard result, a confirmation holds or slides before committing, quantity changes are controlled by the caller, and a save action exposes pending, success and error. These controls keep their own typed behavior instead of overloading a generic click. Keep the basic button page focused on button variants and sizes; link to the dedicated interactive examples by purpose, and make distribution and renderer coverage explicit.

The default switch uses a 52 × 32 px track with a 26 px thumb and a 3 px inset. Preserve controlled and uncontrolled use, keyboard activation and immediate state callbacks. The native template retains its existing native switch until its rendering is separately qualified.

Text fields, search fields and single-choice select controls use the same compact, regular, comfortable, spacious and touch height roles as actions. Their labels, validation, input attributes, controlled values and accessible descriptions remain attached to the actual input. The regular size remains the default. Select preserves the native `size` and `multiple` attributes separately from the visual `controlSize` choice. Each size is demonstrated and tested at narrow and wide widths.

Textarea may show an optional inline completion using the same presentation and motion as the completion specimen. A matching suffix is offered only at an unselected end-of-text caret; Tab or right arrow accepts it without interrupting IME composition, disabled or read-only inputs, or a caller-cancelled key event. Preserve controlled and uncontrolled input, native change and selection callbacks, maxLength, form submission, focus, error and help descriptions. Explain the available action accessibly, keep decorative text hidden from assistive technology, and settle immediately with reduced motion. The specimen and the public entry share the same implementation rather than maintaining separate behavior.

Cards use a shared 24 px corner and 18 px regular inset. Compact and spacious density choices use 16 px and 24 px insets without changing the caller's content or action. The ordinary card and the existing metric and profile cards consume these same roles. Cards remain fluid in their container and do not gain a perimeter outline.

The single-value slider shares the motion specimen's four-pixel track and 28 px circular thumb, with a 44 px interaction area. Its filled section follows the controlled value and reading direction. The card presentation uses the same slider in the interactive example, including the floating formatted value. Preserve its native input, min, max, step, disabled state, keyboard behavior and accessible value text; forced colors retain platform control appearance.

The basic checkbox and checklist use one 24 px mark and 8 px corner. The checkmark draws in after selection and the control responds to a press. Use a filled surface instead of an ordinary perimeter border, preserve checked and indeterminate states, form name and value, and keep a 44 px pointer target and visible keyboard and forced-color focus. The checklist preserves its independent selection and completion text.

An editable rating uses the same five-star interaction as the interactive rating: pointer preview, sequential fill and spring response. Preserve the configurable maximum, radio group, accessible names, keyboard selection and read-only text contract; reduce motion when requested. The interactive example uses the shared implementation, including its optional status and clear affordance.

The numeric spinner has two circular 40 px actions, a fixed-width rolling value and a borderless card surface. Preserve its label, disabled and range boundaries, integer stepping, callback and live value announcement. Optional supporting text and action names allow a host to describe the controlled value. A value change rolls in the direction of the change and settles immediately under reduced motion. The gallery uses this same component.

### Numeric spinner width correction

The fixed value viewport must accommodate the rendered text for the instance's `min`, `max`, current value and the prior value during a transition; 40 px is not a sufficient universal width for the public range. Use visually hidden, accessibility-hidden text in the same grid and font to size the viewport by the actual rendered values, with the existing width as a minimum. Keep the width stable throughout an ordinary transition within the declared bounds, including a rapid reversal and a host rerender. If a host supplies an out-of-range value or changes the bounds, accommodate the affected visible values without clipping and preserve controlled behavior. A character count alone is not evidence that glyphs fit.

Maintain both action buttons, their accessible names and bounds, keyboard activation, announcements and reduced-motion behavior. At narrow widths, the label and actions must not overlap or enlarge the page; when the value and actions cannot fit in one row, provide an accessible way to reach and read all of them without silently clipping a value. Preserve the ordinary compact two-digit appearance. Qualify the actual packaged component with positive and negative values of different lengths, range updates and rapid reversals at 320 and 1440 px, plus reduced motion, keyboard and forced colors. Capture the rendered result separately from arithmetic or text measurements.

Layered menus, attachments and carousel slides use surface contrast or elevation for their ordinary boundary instead of an inset perimeter line. Retain forced-color and keyboard-focus indicators.

List rows use a 48 px minimum height and 12 px content gap. Their text, leading and trailing slots remain flexible and wrap when needed; links and actions retain their original behavior and current state. Noninteractive rows do not become buttons.

The component guide and motion index use the shared search field, links and action controls for navigation. Preserve search, Enter-to-select, category disclosure, focus, links and narrow-screen access. The guide may supply layout-specific styling, but must not duplicate interactive control behavior.

## Shared geometry and composition calibration

Apply the approved component-first replacement to the default controls and live compositions. Align regular icon actions, fields and non-featured choice controls on a 36 px height. Give segmented options a 12 px inline inset and a 4 px gap, superseding the earlier 8 px and 2 px calibration. Keep segmented labels operable as the available width shrinks. Use a flatter 16 px card and composer corner and keep a distinct corner for large overlay surfaces. Compact card padding remains 16 px. Keep the palette, font family, agent artwork and agent motion. Distinct interaction surfaces such as tabs, modal dialogs and sliding confirmations retain their own purpose and geometry where needed.

Shared selection, anchored menus and disclosures keep their current semantics and immediate callbacks. Restore localized enter and selection feedback, with no motion dependency for interaction and a stationary reduced-motion state. Test keyboard dismissal, focus restoration and repeated selection with unchanged public props. Validate the generated CSS and Zig dimensions and the live guide in both appearances. Keep table text and numeric columns aligned under long content, and keep chart point size stable as the plot grows. A generated native token reports geometry only.

### Component state review

Review each published component on its actual guide route in regular and compact viewports. Exercise available controls with meaningful input, activation and dismissal; identify presentation-only specimens separately. Compare direct transitions, interrupted states and reduced motion across actionable families. Use fixture-only inputs and inspect their visual outcomes for clipping, contrast, alignment and stable layout before showing the interactive candidate for review.

Anchored action menus, custom selects, flyouts and option lists share a 12 px menu corner, the standard row size and a 6 px inset. Distinguish the floating plane from its selected or focused row with the palette and use the compact surface role for shorter commands. Keep side-aware entry within 4 px of the final position. Noninteractive tooltips use a shorter dismissal than arrival. Use a 16 px grouped surface corner, a 20 px modal corner, and a 16/22 title with a 4 px description gap for grouped cards. The same operations and focus recovery remain available when transitions are disabled.

### Cross-renderer visual alignment

Compare the paired catalog in its existing guides. Align resting, selected, disabled and open appearances using shared control dimensions, spacing, colors and shape. Use one subdued track and raised neutral selection for segmented choices, a borderless 400-point regular dialog with a 20-point corner over a dimmed canvas, and the SDK's standard 44 by 24 switch track on both renderers. Keep label hit areas, focus, states, installed markup arguments and existing motion behavior. Use common theme roles wherever the Native SDK exposes them and report renderer-specific geometry that remains. Evaluate the paired catalog in aggregate, then inspect representative control states and composed blocks in both renderers.

### Matched component states

Use the current web component as the visual target. Align Native label placement, intrinsic sizes, type hierarchy, surface treatment and action order using the installed SDK controls. Where the SDK cannot preserve an existing control's geometry and interaction together, adopt its supported geometry on the web after checking both renderers. Compare identical example content and state before reporting equivalence. Preserve public component IDs, existing host contracts and keyboard actions. This scope covers presentation and guide fixtures.

### Equal presentation across the catalog

Keep the browser rendering as the starting point for each component. Reuse one specimen layout inventory so frames, available widths and data are comparable across adapters. Keep the native implementation on the SDK's authored controls. Use the best supported Native treatment as the shared presentation when an SDK boundary prevents matching the browser. Verify each supported route in the catalog, including the published composition blocks, and distinguish observed final states from available or unexercised states.

Draw the same drawer grip and retain both the close action and the drag threshold. The Native gesture may use the SDK dismissal lifecycle and measures from pointer down and keeps the drawer open if the drag is short or cancelled. Keep existing markup consumers compatible. An empty one-time code has six equivalent neutral slots. Provide visible keyboard focus and show the next digit position consistently on an incomplete code. Keep one editable field, sanitized digits, and host-owned confirmation.

The Native font bundle uses static instances of the approved body and action weights from the same variable font used by the web. Retain the variable master and the installed filenames. Compare text, control sizing and clipping after regenerating the instances.

Use the display size for desktop catalog titles and preserve the compact title size on narrow web pages. Bind Native composer input, card titles and agent metadata to the equivalent web size roles. Check the rendered titles and text bounds independently from font weight and line height.

### Shared component typography

Use Rethink Sans in both adapters. Text and the controls that use the SDK text face use the body instance. Actions that use the SDK button face use the action instance. Resolve shared role size, weight, leading and tracking from the UI tokens. Use the SDK's proportional line height and natural tracking for shared copy. The 12-point metadata role reserves the 13-point line box because the SDK lays it out as a scaled span within compact text. Keep the wide and narrow catalog title sizes, touch input legibility and independent brand typography.

Apply the shared roles to component and catalog text, including state-dependent labels, fields, cards, dialogs and composed specimens. Preserve content, accessibility and interactions, including agent animation. Verify token generation for both adapters, compare text and line bounds on actual web and Native specimens and exercise the catalog for layout regressions. Present the branch preview for approval before merge.

### Web motion baseline restoration

Restore Web transitions before comparing Native. Reuse the existing motion profiles on shared controls and their guide and composition consumers. Preserve settled geometry, colors, type, agent playback, public properties, synchronous state and callbacks. Animate from the current visual state for reversible controls. During direct manipulation, follow the pointer and settle on release or cancellation. Exit effects must not keep dismissed controls active or delay focus restoration. Reduced motion removes travel and cycling while retaining visible state and focus. Verify live frames, interruption, keyboard, narrow layouts and composed routes before publishing the branch preview. Native tuning follows observed Web behavior in a later change.
