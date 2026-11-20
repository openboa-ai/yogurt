# Run the Zig saved view

Use a macOS host with Zig 0.16.0 and Vercel Native SDK 0.11.1. Create a fresh `native init saved-view --template zig-core` app. Install the Yogurt package or call the kit's local `bin/yogurt.mjs`. From the app, run `yogurt add button --target native` and `yogurt add switch --target native`.

Copy this directory's `app.json` into the fresh scaffold and `app.native`, `model.zig`, `main.zig` and `tests.zig` into its `src` directory. Keep the scaffold's icon. Run `native test .`, `native check . --strict` and `native dev .`. The example is local. Save and Undo update memory. Change surface cycles Neutral, Paper and Mist.

`theme.zig` accepts appearance, material, high contrast and reduced motion. Pass the product’s observed accessibility preferences. The sample exposes explicit appearance controls for visual comparison. It registers the bundled variable face and a static 500 instance of the same Rethink Sans master for button labels. The font retains its OFL notice.

For the full template smoke test, run the kit's `node checks/native-catalog.mjs /path/to/isolated/scaffold`, add `test { _ = @import("yogurt-catalog-test/all.zig"); }` to that scaffold's tests and rerun `native test`. Each test instantiates one installed template with a typed model and builds its actual widget tree. [SDK stack](../../docs/native-stack.md) · [Evidence](../../docs/engineering/controls/component-library/verification.md)

The example entry point adapts the Vercel Native SDK Zig starter to the Yogurt model, theme, fonts and installed components. The starter license is included in [LICENSE.native-sdk](LICENSE.native-sdk).
