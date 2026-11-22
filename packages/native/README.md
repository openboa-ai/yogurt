# Zig adapter

Use `yogurt add <id> --target native` to install a markup template, its Zig source entry, the theme and fonts. Pass the same material, appearance and semantic roles as the web. The host owns its typed model, user preferences and effects. [Installation](../../docs/using-yogurt.md) · [Running macOS example](../../examples/native-ui/README.md) · [Target evidence](../../docs/engineering/controls/component-library/verification.md)

The installer prints the entry to use. Author markup in `src/templates/*.native.in` and reference a layout token as `@{gap-stack}`. Run `npm run tokens` in the checkout to generate `controls/items/*.native` at their public import paths. `controls/views` holds the typed carousel and layer renderers. The component catalog selects the default for each ID. The Native guide installs those entries through the same code path as a product. It supplies sample content, callbacks and the clock.

`views/carousel.zig` accepts the current slide, its position label, available navigation actions and transition phase. `views/layers.zig` supplies the dialog, sheet, action menu and popover. Pass the panel content or menu items and the current presentation state. The host decides which action to perform.

## Interface motion

The Native installer includes `src/yogurt/interface-motion.zig` for animated surfaces and progress. Retain a `Tween` in the host model. Initialize it with `snap`, retarget it from the last displayed value after a state change, and call `advance` on presented frames while it is active. Use one monotonic clock for both calls. Snap to the target when motion is reduced or the view leaves. Use the shared `travel_ms`, `panel_ms`, `settle_curve` and `arrive_curve` from the Zig tokens.

`progressView` accepts the semantic value and the animated fill separately. `surfaceOptions` supplies translation and opacity to an SDK surface. `drawer-surface.zig` also exposes `present` for the same built-in drawer with those options. Existing markup keeps its arguments and immediate value semantics. The host continues to handle activation, dismissal, and the lifetime of each surface.

## Verification code and rating

### OTP focus on SDK 0.11.1

Set `NATIVE_SDK_PATH` to the original Native SDK 0.11.1 framework, then use the Yogurt package command in your app's build script and CI.

```sh
npx yogurt add input-otp --target native
npx yogurt native build .
```

The build command copies the framework, applies the bundled patch automatically and builds against that copy. It removes the temporary framework when the command exits. The original SDK remains available for other projects. Use `yogurt native dev .`, `yogurt native test .` or `yogurt native check . --strict` for the corresponding Native commands. Compiling the public OTP renderer against an unpatched framework reports an error with the build command to use.

Existing apps with a copied typed OTP use `npx yogurt upgrade-otp . /path/to/previous-yogurt`. Provide the exact previous kit release used for the installed source. The command preserves edits that merge cleanly. If changes overlap, it writes `precision-inputs.zig.merge` for review and leaves the installed source intact.

Use `npx yogurt native package .` for macOS releases. It builds against the patched framework and passes that binary to the packager. Put this command in the app's release job. Projects with custom packaging can package the output of `yogurt native build .` directly.

Installing `input-otp` or `rating` also installs `src/yogurt/precision-inputs.zig`. Use `codeView` with a persistent `CodeEditor` and forward its input events to `editCode`. The editor accepts six digits and the host owns verification. Use `ratingView` with the host's current score and a typed selection callback. Register the rating icons once at application startup with `registerRatingIcons`. Existing markup templates retain their original call signatures.

## Drawer

The installed Zig drawer view adds a drag handle to the same lower-edge surface. Pass a typed dismissal message and a drag message carrying `drawer-surface.zig`'s `Drag` record. Forward the SDK canvas event through `withTravel` while the drawer is open to keep the displacement from pointer down. Pass the typed drag message to `shouldDismiss` and close on a true result. Existing markup consumers can continue to use the close action and Escape.

## Agent presence

For a visible avatar in a Vercel Native GPU canvas, install `agent-avatar` and retain one `Playback` per avatar. The shared poses move the body and both eyes with affine transforms. Every pose uses the original body path and one eye outline shared by both eyes. Each update supplies at most three path fills with stable host IDs and zero encoded frames.

```zig
const agent_vector = @import("yogurt/models/agent-vector.zig");

// Set up a 96-point portrait. Store playback in the host.
var playback = agent_vector.Playback.init(.kai, 96, .ready, now_ms);

// Inside the host, after receiving an updated status:
playback.setState(.working, now_ms, reduced_motion);
const portrait = playback.draw(
    now_ms, reduced_motion, 0, 0, 96, .{ body_id, left_eye_id, right_eye_id },
);
_ = try runtime.setCanvasDisplayList(window_id, canvas_label, portrait.displayList());
```

This example uses a dedicated `.gpu_surface` canvas. For a shared canvas, append `portrait.displayList().commands` to the host's scene command buffer before submitting it. The adapter restores the incoming transform. Schedule `playback.nextFrameDelay(now_ms, visible, reduced_motion)` only while an update is needed. Use a monotonic clock that stops for suspended views. Draw once on initial render, state changes and preference changes. Keep the status label in the host UI. Reduced motion uses an authored body and eye pose for the current state and requires no timer. A completed pose needs no recurring timer. A size of 32 points or less uses restrained roster movement.

The `Playback.draw` entry selects the eye outline for the current frame. The three-transform `drawing` entry remains available for callers supplying their own poses with round eyes.

### Existing image ID templates

The agent avatar template takes a registered `image_id`. Register the animated avatar once when you enter the visible roster or conversation. Give it a unique, host-owned image ID and retain its prepared value in the model.

```zig
const agent_motion = @import("yogurt/models/agent-motion.zig");

// In the host's update handler, reserve image_id for this avatar.
var avatar = try agent_motion.prepare(fx, .kai, image_id);
model.avatar_image = try avatar.update(fx, .working, elapsed_ms, reduced_motion);
model.avatar_status = agent_motion.label(.working);
```

Retain `avatar` across updates. Reset `elapsed_ms` when the host observes a new presence state. Ready includes a sparse glance and blink. Working repeats a stronger scan. The remaining states reach a held pose. Use the reduced-motion or static image branch for archived portraits. Use the same state label with reduced motion. The frame sequence uses the published times, shared settle curve and transparent masters.

The host chooses the update cadence and respects its motion preference. After updating the visible pose, `agent_motion.isAnimating(state, elapsed_ms, reduced_motion)` reports whether another tick is needed. Use `nextFrameDelay` to schedule the next changing pose and skip held frames. Keep updates scoped to visible avatars. Each prepared avatar updates a single registry slot. Release the reserved ID with `fx.unregisterImage(image_id)` after removing the corresponding view. Static `art.register` remains available when timed updates or image replacement are unavailable.

Use `node scripts/export-native-agent-motion.mjs [sharp entry]` to regenerate the encoded frames and Zig table from the published presence source. The script uses Sharp through the same renderer path as the static Native art export.


For one of the 45 fitted variants, use `Playback.initVariant(.round_star_right, 24, .ready, now_ms)`. The optional `color` field takes a shared token such as `.blue_300`. The timeline and pose selection follow the same lifecycle.
