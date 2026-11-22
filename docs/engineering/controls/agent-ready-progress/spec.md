# Agent-ready progress: web implementation

## Accepted scope

The owner approved replacing component behavior while retaining existing design and motion. This slice covers the Web progress control and installed entry. Native rendering and product authorization remain separate.

## Contract

- Preserve the public label, optional value, maximum normalization, clamping, percentage text, indeterminate state, one native accessible progress element and existing import. An unknown value must never appear as zero or a completed result.
- Preserve the existing track, fill, size, timing, directionality, indeterminate sweep, forced colors and reduced-motion behavior. Do not add an ordinary outline.
- Use shared progress semantics while retaining the native element and Yogurt presentation. Rendering does not create an agent bridge or authorize effects; the host owns data and disclosure.

## Evidence

Compare narrow and wide captures for determinate, complete and indeterminate states. Exercise bounded values, invalid maximum, accessible labeling and values, reduced motion and the installed entry in Vite and Next.js consumers. Run catalog and affected motion checks. Native rendering and complete frame comparisons remain separate evidence.
