# Native input journey

Use a fresh macOS Zig-core scaffold with Native SDK 0.11.1 and Zig 0.16.0. Install the Yogurt Native entries `text-field`, `search-field`, `select`, and `switch` into it with `yogurt add <entry> --target native`, then copy this fixture's `app.json` and `src` files into the scaffold. Keep the scaffold icon and license. Build with the existing Native tooling and run the resulting app.

Text, Search and Code select which host-owned text buffer receives the shared edit message. Values persist when switching modes. Clear affects only Search; pressing Enter on Code records local fixture feedback. Notifications is a local switch. Workspace exposes Personal and Team choices; Change appearance changes the Yogurt theme. No values leave the fixture.
