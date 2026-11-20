# Zig adapter

Use `yogurt add <id> --target native` to install a markup template, its Zig source entry, the theme and fonts. Pass the same material, appearance and semantic roles as the web. The host owns its typed model, user preferences and effects. [Installation](../../docs/using-yogurt.md) · [Running macOS example](../../examples/native-ui/README.md) · [Target evidence](../../docs/engineering/controls/component-library/verification.md)

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
