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

Use dedicated controls where the action has its own lifecycle: copying reports the clipboard result, a confirmation holds or slides before committing, quantity changes are controlled by the caller, and a save action exposes pending, success and error. These controls keep their own typed behavior instead of overloading a generic click. Surface all of them in the library guide with working local examples, then make their distribution and renderer coverage explicit.

The default switch uses a 52 × 32 px track with a 26 px thumb and a 3 px inset. Preserve controlled and uncontrolled use, keyboard activation and immediate state callbacks. The native template retains its existing native switch until its rendering is separately qualified.

Text fields, search fields and single-choice select controls use the same compact, regular, comfortable, spacious and touch height roles as actions. Their labels, validation, input attributes, controlled values and accessible descriptions remain attached to the actual input. The regular size remains the default. Select preserves the native `size` and `multiple` attributes separately from the visual `controlSize` choice. Each size is demonstrated and tested at narrow and wide widths.
