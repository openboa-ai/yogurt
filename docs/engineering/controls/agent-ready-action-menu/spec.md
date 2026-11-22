# Agent-ready action menu: web implementation

## Accepted scope

The owner approved replacing component behavior while preserving design and motion. This slice covers the Web action menu, its anchored and expanding presentations, and installed entry. Native rendering and product agent authorization remain separately scoped.

## Contract

- Preserve the public label, item values and disabled behavior, selection callback, open and close behavior, trigger focus restoration, outside and focus-leave dismissal, arrow navigation, Home and End, typeahead, Escape and Tab. Disabled actions never invoke the host.
- Preserve each presentation's existing alignment, item layout, glyph, dimensions, spring choreography, interruption behavior and reduced-motion treatment. The expanding presentation keeps its mounted closed structure needed for the spring's reversal.
- Use the shared inline popup and button behaviors while retaining the existing menu keyboard adapter and spring. Rendering never creates an agent bridge; an explicitly configured host can inspect and change supported menu state and invoke an allowed item under its policy. Products own action authorization and effects.

## Evidence

Compare narrow and wide closed and opened captures and exercise spring opening, interruption, reversal and reduced motion. Test keyboard, focus, disabled actions, selection, dismissal and allowed and refused agent state changes in installed Vite and Next.js consumers. Run affected catalog and motion checks. Native and complete frame-by-frame parity remain separately unqualified.
