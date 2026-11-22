# Agent-ready tabs: web implementation

## Accepted scope

The owner approved replacing component behavior while keeping the existing design and motion. This slice covers the Web tabs, pill and dock presentations, examples and installed entry. Native behavior and product agent authorization remain separately scoped.

## Contract

- Retain the current public properties, controlled selection and first-enabled fallback for an invalid or disabled value. A disabled option must not activate. If no option is enabled there is no selected tab.
- Preserve the tab list and panel relationships, panel content lifetime and keyboard navigation: arrow keys wrap among enabled options, Home and End reach the first and last enabled options, and selection follows focus. Report each intended change once to the host.
- Keep the existing track, focus treatment, measured marker, icon and label behavior, animation timing, responsive geometry and reduced-motion behavior in both presentations. Rapid reversals and resizing leave the marker on the selected tab.
- Use the shared behavior provider without creating an agent bridge during rendering. An explicitly configured host can discover and change the selected tab through the same provider runtime; product data and permission decisions remain with the host.
- Adapt keyboard navigation at the Yogurt boundary so disabled options are skipped and wrapping matches the existing control, including repeated selection callbacks. Keep provider selection and agent actions connected to the same controlled value.

## Evidence

Compare narrow and wide resting and settled captures against the prior guide for each presentation. Exercise pointer, keyboard wrapping, Home and End, disabled and missing selections, tab-to-panel relationships, content persistence, marker position, reversal, resizing and reduced motion. Verify allowed and refused actions against controlled state and callback counts in installed Vite and Next.js consumers. Run the existing motion gallery checks. Native and live product behavior are separate evidence.
