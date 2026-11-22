# Design catalog

This directory owns stable IDs and the metadata that the SDK, guide, plugin and validation tools share.

| File | Responsibility |
| --- | --- |
| [Components](components.json) | Public IDs, guidance and target bindings. A Native `nativeView` selects the module and function for a typed control. Other entries use their installed markup. |
| [Patterns](patterns.json) | Jobs, screen states, component relationships and recovery |
| [Blocks](blocks.json) | Reusable compositions and their install targets |
| [Brand](brand.json) | Identity rules and references to canonical artwork and vocabulary |
| [Motion](motion.json) | Interaction treatments and motion references |

Renderer code lives in [packages](../packages/README.md). Run `node scripts/describe-pattern.mjs --list` from the repository or installed SDK root. Verify catalog and export changes with `npm run check:ui`.
