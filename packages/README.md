# SDK adapters

The adapters render the shared [component IDs](../catalog/README.md) with the same design tokens and language.

- [Web](web/README.md) owns the React component source. The root SDK build generates JavaScript and declarations under `web/dist/`.
- [Native](native/README.md) owns editable Vercel Native markup, typed Zig bindings and native support files under `native/controls/`.
- [Composition recipes](recipes/README.md) provide reusable screen blocks with Web and Native entries. [Install and adapt them](../docs/using-yogurt.md#editable-blocks) in the product.

The consumer supplies its data, permissions and effects. Start with the [installation guide](../docs/using-yogurt.md) and exercise the appropriate [renderer checks](../checks/README.md).
