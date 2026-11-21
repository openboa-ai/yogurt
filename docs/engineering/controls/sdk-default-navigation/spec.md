# SDK navigation indicator

## Intent and authority

The owner requested simpler navigation motion using the SDK directly. Replace the custom selection-marker measurement and spring behavior for web tabs and segmented controls with the SDK indicators, preserving Yogurt's existing colors and geometry.

## Contract and boundaries

Selection remains controlled by the host. Keep existing labels, disabled handling, keyboard behavior, panels, callback names, and current palette. Indicators are decorative and cannot delay or change selection. Avoid additional runtime dependencies, timers, network access, or native changes. Reduced motion must not animate selection.

## Evidence

Verify selected and disabled options, pointer and keyboard selection, long labels, resizing, right-to-left layout, light and dark appearances, and reduced motion in the component gallery. Confirm Vite and Next.js builds use the same component exports. Compare the selection indicator position after changing options and resizing. A successful build alone does not establish visual or interaction correctness.

## Action menu follow-up

The owner requested removal of the Action Menu's separate spring animation while retaining its settled expanding and anchored appearances. Preserve the SDK popover, host callback, enabled-item navigation, keyboard opening and dismissal, outside dismissal, focus restoration, and reduced-motion usability. Opening or closing must immediately expose the correct interactive state without a separate animation loop. Verify both presentations with pointer and keyboard, including disabled choices, Escape, Tab, focus return, and rapid reversal.

## Range and password follow-up

The owner requested immediate SDK-style state changes in ordinary UI. Preserve the range's controlled values, pointer capture, keyboard operations, tooltip positioning, size and colors, and preserve password input and visibility controls. Remove spring frames and staggered timers without changing callbacks or adding effects. Verify values and keyboard/pointer input, tooltip bounds on resize, password score display, and reduced motion.
