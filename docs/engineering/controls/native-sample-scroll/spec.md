# Native sample viewport recovery

Status: reviewed implementation scope. This scope covers the local saved-view sample only. It does not change the Native switch, shared components or their support claims.

## Intent and contract

The sample must keep its existing saved-view content and actions reachable when its window is shorter than the content. Place the existing content in a native vertical scroll container, preserving its order, names, visual materials, model, callbacks and host-owned state. Scrolling is presentation only: it cannot send, save, undo or toggle anything. Do not duplicate any controls or introduce external services. Keep the installed button and switch imports intact.

The content must remain reachable at an observed 480 × 320 viewport and at a normal taller viewport. At a short height, scrolling must reveal the appearance switch and final surface label without clipping their targets; at a taller height, the initial presentation should stay composed. Pointer scrolling and keyboard navigation must be usable. Scroll position remains local presentation state and must not change when a toggle is activated. Resizing to a larger or smaller window must not remove controls or reset the model.

The sample manifest currently requests 480 × 480 while the Zig runner declares 480 × 400. Align the declared initial size at 480 × 480 for clarity, without assuming that declaration determines the actual frame. Record the actual observed viewport separately, and retain resizability. Do not change the switch geometry or claim renderer, motion, accessibility or device parity from this fixture fix.

## Verification

1. Install the existing button and switch into a fresh isolated Native 0.11.1 / Zig 0.16.0 macOS fixture; run typed model tests, strict markup validation and an automation-enabled ReleaseFast build.
2. Run the fixture and record the actual viewport. At 480 × 320, capture the initial and scrolled states, verify the appearance control and final text can be reached and used, and verify Save, Undo and Record dates operate once each without scrolling triggering a model action. Repeat in a taller viewport.
3. Exercise scroll with pointer and keyboard, check accessible names and focus, and confirm content and host state remain present when resized while scrolled. If the automation or runtime does not support a check, report it as unverified rather than infer success.
4. Keep the preceding Native switch geometry and motion qualification open; report this sample correction separately from component support and performance.
