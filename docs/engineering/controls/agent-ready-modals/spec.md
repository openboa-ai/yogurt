# Agent-ready modals: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving existing design and motion. This slice covers the Web dialog, sheet and drawer and their installed exports. Native rendering and product agent authorization remain separate.

## Contract

- Preserve controlled open and close behavior, title and optional description, mounted content lifetime, public properties and exports. Escape, outside click, close button and drawer swipe each notify the host once. Keep native modal layering, focus containment, restoration and background inertness.
- Keep the current open and backdrop animations, dimensions, placement, spacing, drag response and reduced-motion behavior in all three variants. The modal must remain usable at narrow widths and preserve native top-layer behavior above application overlays.
- Use the shared behavior provider to expose its supported dialog state to an explicitly connected host. Mounting or opening a modal does not create a bridge or grant permission. The consuming application owns all effects.

## Evidence

Compare narrow and wide screenshots in closed, open and settled states for each variant. Exercise Escape, outside click, close action, focus trapping and restoration, nested modal layering, drag threshold, mounted form state, reduced motion and resizing. Test an installed Vite and Next.js consumer with allowed and refused agent interactions and callback counts. Run affected component, workspace and motion checks. Native and live products are separate evidence.
