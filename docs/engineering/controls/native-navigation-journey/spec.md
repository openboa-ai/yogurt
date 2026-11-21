# Native navigation interaction fixture

The owner requested a small runnable Native screen to inspect Yogurt controls in an actual host. Compose existing accordion, disclosure row, tabs, segmented control, sidebar and dialog templates. The host owns selection, open states and callbacks. Clicking a control changes only local fixture state; it sends no network requests and performs no external effects. Do not alter component contracts or agent motion.

Verify on macOS with the pinned SDK by installing the named templates into an isolated fixture, building with automation, opening each disclosure, selecting both tab and segment choices, changing the sidebar destination, and opening and dismissing the dialog. Capture visible before/after states and check the model's status labels. Record actual build and screen evidence separately; source alone is not runtime validation.

The owner requested borderless selected tabs and segments after inspecting the Native screen. Use a neutral selection fill and no ordinary selection stroke, while retaining the SDK keyboard focus ring and high-contrast affordance. Verify both selections in light and dark appearances, plus keyboard focus and high contrast on a running host.
