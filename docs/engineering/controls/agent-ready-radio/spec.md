# Agent-ready radio group: web implementation

## Accepted scope

The owner approved replacing component behavior while keeping the existing design and motion. This slice covers the Web radio group and its installed entry. Native behavior and product agent authorization remain separate.

## Contract

- Preserve the controlled value, label and legend, option labels, group and option disabled states, field name, callback and public import. Keep native form submission and focus behavior. Disabled options never become selected.
- Preserve the existing radio geometry, checked appearance, spacing, contrast and focus treatment without adding ordinary outlines. Keyboard selection and wrapping must skip disabled options and produce the same host callback behavior.
- Use the shared behavior provider with the existing Yogurt presentation. Rendering never creates an agent bridge. An explicitly configured host can inspect and set the selection through the same runtime and must control access and effects.

## Evidence

Compare narrow and wide guide captures before and after. In installed Vite and Next.js fixtures exercise pointer, keyboard, form submission, disabled group and option, selected and unselected states, allowed and refused agent actions and callback counts. Run affected catalog and interaction checks. Native rendering, complete motion frames and live product effects remain separate.
