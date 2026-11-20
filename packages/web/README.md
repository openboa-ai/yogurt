# Web adapter

Each component has a typed `@openboa/yogurt/<id>` entry. Load `@openboa/yogurt/styles.css` once and wrap the application in `Yogurt`. The local shadcn items and Yogurt CLI install editable entries. [Installation](../../docs/using-yogurt.md) · [Catalog](../../apps/guide/generated/components.html)

## Source layout

| Path | Owns |
| --- | --- |
| `src/foundation/` | The Yogurt root, layout and type primitives, and generated English vocabulary |
| `src/controls/` | Individual actions, forms, navigation, overlays, feedback and data displays |
| `src/patterns/` | Task-level compositions such as workspace, review, collection and conversation surfaces |
| `src/identity/` | Project marks, agent avatars, motion playback and generated artwork data |
| `src/entries/` and `src/index.ts` | Generated source entry points derived from the component catalog |
| `dist/` | Generated imports and TypeScript declarations packaged by the root SDK manifest |

Run `npm run build` from the repository root after changing a source module. It regenerates the SDK entries, declarations and editable registry.
