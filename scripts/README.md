# Tool entry points

Run these from the repository root.

| Need | Entry point |
| --- | --- |
| Build the Web SDK and registry | `npm run build` |
| Regenerate or verify shared web and Native token outputs | `npm run tokens` or `npm run check:tokens` |
| Verify the SDK and catalog | `npm run check:ui` |
| Resolve an installed task pattern | `node scripts/describe-pattern.mjs --list` |
| Export brand CSS and project emoji | `node scripts/export-css.mjs` and `node scripts/export-emoji.mjs` |
| Regenerate offline guide pages and data | [Guide build commands](../apps/guide/README.md) |

Browser scripts and their page generators live with the [guide](../apps/guide/README.md). The previous gallery, playbook and handbook generator commands forward to that source. The [consumer CLI](../bin/yogurt.mjs) owns install and check commands.

The implementations live beside other tools that own the same output.

| Directory | Outputs |
| --- | --- |
| [Tokens](tokens/) | Palette CSS, component CSS variables and Native Zig roles derived from the design sources |
| [SDK](sdk/) | Web distribution, registry and vocabulary bindings |
| [Brand](brand/) | Brand exports, food marks and the emoji library |
| [Agents](agents/) | Web silhouettes, presence parameters and avatar tracks |
| [Native](native/) | Native image assets and motion frames |
