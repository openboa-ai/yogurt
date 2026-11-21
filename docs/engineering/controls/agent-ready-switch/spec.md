# Agent-ready switch: web implementation

## Accepted scope

The owner approved replacement of all components while preserving their existing appearance and motion. This slice covers the Web switch, its existing examples and installed entry. It does not claim a native renderer replacement or a product agent bridge.

## Contract

- Use the shared unstyled behavior provider and keep the existing label, supporting text, ID, form name and value, controlled and uncontrolled state, disabled and required state, focus and blur callbacks and public import.
- Preserve the existing track and thumb geometry, colors, thumb travel and interruption-safe stretch animation. Reduced motion must not run the stretch. Ordinary surfaces keep their current border treatment and keyboard focus remains visible.
- Preserve label activation and native form submission and reset. The host receives each confirmed change once. Disabled controls do not change value or call the host.
- Allow an explicitly connected consumer bridge to observe and set the actual switch through the same provider instance. Rendering the control must not create or authorize a bridge. The product owns permission, data and effects.

## Evidence

Capture the existing switch at narrow and wide widths, compare the resting and settled states and sample the stretch. Exercise pointer, keyboard, controlled and uncontrolled state, form submission and reset, rapid reversal, disabled, forced colors and reduced motion. In installed Vite and Next.js fixtures exercise bridge discovery and allowed and denied switch actions. Run affected gallery interaction checks. Keep Native evidence separate.
