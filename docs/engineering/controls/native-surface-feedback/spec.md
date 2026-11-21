# Native surfaces and feedback

Status: reviewed implementation scope under the owner-selected component foundation. These Native templates apply existing neutral design roles and preserve their current host-owned data and actions. Web results do not establish Native visual or platform parity.

## Contract

Keep the existing component IDs, template arguments, slots and action messages. The card uses the regular 18-point inset and 12-point content gap, with muted supporting text. The list row retains one host-owned activation and readable supporting text. The status is a compact neutral label with a small visual indicator instead of a full-width bar. The toast uses an inverse neutral surface with a legible message and an independently named dismiss control. No component invents a product result or dismisses itself.

Use Native's supported geometry and theme color roles; do not introduce a second palette or decorative border. This is a Native presentation slice, not a claim that motion, accessibility, or all host renderers match Web.

## Evidence

Build and validate the installed templates using the pinned SDK. Verify ordinary card content, list activation and toast dismissal reach the host once. Observe light and dark surfaces, readable text and narrow layout separately from typed/markup checks; report untested motion and assistive technology accurately.
