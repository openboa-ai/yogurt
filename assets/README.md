# Brand assets

This directory owns the editable artwork and redistributable files used by products and the guide.

- [Company signature](logo/openboa-lockup.svg) pairs the Upright 9 symbol with the outlined Rethink Sans 760 wordmark. Its ink blue comes from `slate.750` in the [numbered palette](../tokens/brand.json). See the [logo rules](../index.html#logo) and [weight study](../examples/signature/index.html).
- [Project marks](projects/emoji.json) take their colors from the same palette. Change the paths or token names in this file and run `node scripts/export-emoji.mjs` to update the SVGs. Chat PNGs use a transparent 128 × 128 canvas.
- [Agent artwork](agents/) includes silhouettes and motion source. The [asset library](../library.html) displays the editable resources.
- [Emoji](emoji/README.md) contains the artwork, searchable inventory and credits.
- [Rethink Sans v1.001](fonts/rethink-sans/) includes the font files and the [SIL Open Font License](fonts/rethink-sans/OFL.txt). Keep the notice with redistributed fonts. [Font source](https://github.com/hans-thiessen/Rethink-Sans/tree/20d5980cd14ce827e82d7fc58d758f7cc5086c91)

Edit the [palette](../tokens/brand.json) and [UI roles](../tokens/ui.json) at their source. Regenerate the brand CSS with `node scripts/export-css.mjs` and rebuild the SDK for Web and Native bindings. [Approved product language](../content/terms.json) lives alongside the design sources.
