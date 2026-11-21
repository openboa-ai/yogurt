# Agent-ready popover: web implementation

## Accepted scope

The owner approved replacing component behavior with the existing visual design and motion retained. This slice covers the Web popover and installed export. Native and product agent authorization remain separately scoped.

## Contract

- Preserve the label, trigger and region relationship, existing public properties, opening and dismissal behavior, keyboard Escape, focus placement and restoration, and closing when focus moves outside. Do not trap the rest of the page or change the host's content lifetime.
- Keep the current anchor, stacking, size, alignment, responsive behavior, transitions and reduced-motion behavior. Do not add an ordinary outline or clip the panel.
- Use the shared behavior provider without creating an agent bridge during rendering. When a host explicitly connects a bridge, it can discover an open popover and request its supported state change under host permission. Products own data, access and effects.

## Evidence

Capture narrow and wide guide states before and after. Exercise pointer and keyboard opening, Escape and outside dismissal, focus transitions, content visibility and an allowed and refused agent action against the installed Vite and Next.js consumers. Run affected catalog and motion checks. Native behavior and complete animation-frame parity remain separate.
