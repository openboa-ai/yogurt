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

## Button family

The everyday action has filled, soft and quiet emphasis, compact, regular, comfortable, spacious and touch sizes, and neutral, brand and danger tones. The height roles resolve to 30, 36, 40, 48 and 44 px respectively and are shared across renderers. A control-radius shape is the default for standard actions. A pill shape is available for the compact copy, quantity and prominent action language. Icon actions keep an accessible name and their own hit area. Pending state retains its accessible label and blocks repeated activation.

Use dedicated controls where the action has its own lifecycle: copying reports the clipboard result, a confirmation holds or slides before committing, quantity changes are controlled by the caller, and a save action exposes pending, success and error. These controls keep their own typed behavior instead of overloading a generic click. Keep the basic button page focused on button variants and sizes; link to the dedicated interactive examples by purpose, and make distribution and renderer coverage explicit.

The default switch uses a 52 × 32 px track with a 26 px thumb and a 3 px inset. Preserve controlled and uncontrolled use, keyboard activation and immediate state callbacks. The native template retains its existing native switch until its rendering is separately qualified.

Text fields, search fields and single-choice select controls use the same compact, regular, comfortable, spacious and touch height roles as actions. Their labels, validation, input attributes, controlled values and accessible descriptions remain attached to the actual input. The regular size remains the default. Select preserves the native `size` and `multiple` attributes separately from the visual `controlSize` choice. Each size is demonstrated and tested at narrow and wide widths.

Cards use a shared 24 px corner and 18 px regular inset. Compact and spacious density choices use 12 px and 24 px insets without changing the caller's content or action. The ordinary card and the existing metric and profile cards consume these same roles. Cards remain fluid in their container and do not gain a perimeter outline.

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
