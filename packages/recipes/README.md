# Composition recipes

Each folder matches a [block ID](../../catalog/blocks.json). Its `web.tsx` file composes Yogurt's React components. Author Native layouts in `view.native.in` using shared spacing tokens. `npm run tokens` generates the `view.native` file that the installer copies into a product.

Use the [workspace patterns](../../docs/workspace-patterns.md) to select a recipe. The [installation guide](../../docs/using-yogurt.md#editable-blocks) shows how to add a recipe to a project. The product supplies its data, permissions and actions.
