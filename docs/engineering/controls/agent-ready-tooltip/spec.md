# Agent-ready tooltip: web implementation

## Accepted scope

The owner approved replacing component behavior with the existing design and motion retained. This slice covers the Web tooltip and installed entry. Native rendering and product agent authorization remain separate.

## Contract

- Preserve the public render-function child API, persistent tooltip ID and description relationship, hover and keyboard-focus activation, pointer-leave and blur dismissal, Escape and focus retention. Keep the content mounted and hidden when inactive.
- Preserve current placement, typography, size, motion, responsive behavior and reduced-motion behavior without introducing an ordinary outline. Showing a tooltip must never take focus from its trigger.
- Use shared inline popup state while retaining the existing activation adapter. Rendering does not create a bridge. An explicitly configured host can inspect an open tooltip and request supported state changes under its own policy.

## Evidence

Compare narrow and wide closed and open guide captures. Exercise pointer and keyboard activation, Escape, blur, focus retention, tooltip relationships and allowed and refused agent operations in installed Vite and Next.js consumers. Run affected component and motion checks. Native and complete frame comparisons are separate evidence.
