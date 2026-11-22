// Host scaffold and license: examples/native-ui/LICENSE.native-sdk.
const std = @import("std");
const runner = @import("runner");
const native_sdk = @import("native_sdk");

pub const panic = std.debug.FullPanic(native_sdk.debug.capturePanic);

const canvas = native_sdk.canvas;
const geometry = native_sdk.geometry;

const canvas_label = "main-canvas";
const window_width: f32 = 480;
const window_height: f32 = 480;

const app_permissions = [_][]const u8{ native_sdk.security.permission_command, native_sdk.security.permission_view };
const shell_views = [_]native_sdk.ShellView{
    .{ .label = canvas_label, .kind = .gpu_surface, .fill = true, .role = "OTP consumer", .accessibility_label = "OTP consumer", .gpu_backend = .metal, .gpu_pixel_format = .bgra8_unorm, .gpu_present_mode = .timer, .gpu_alpha_mode = .@"opaque", .gpu_color_space = .srgb, .gpu_vsync = true },
};
const shell_windows = [_]native_sdk.ShellWindow{.{
    .label = "main",
    .title = "Yogurt",
    .width = window_width,
    .height = window_height,
    .views = &shell_views,
}};
const shell_scene: native_sdk.ShellConfig = .{ .windows = &shell_windows };

const otp = @import("yogurt/precision-inputs.zig");
pub const Model = struct { editor: otp.CodeEditor = .{} };
pub const Msg = union(enum) { edit: canvas.TextInputEvent, other };
const Ui = canvas.Ui(Msg);
fn view(ui: *Ui, m: *const Model) Ui.Node {
    return ui.column(.{ .gap = 12 }, .{
        ui.button(.{ .on_press = .other }, "Before"),
        otp.codeView(Msg, ui, &m.editor, "Verification code", "Enter six digits", Ui.inputMsg(.edit)),
        ui.button(.{ .on_press = .other }, "After"),
    });
}
fn update(m: *Model, msg: Msg, _: *native_sdk.Effects(Msg)) void {
    switch (msg) { .edit => |event| otp.editCode(&m.editor, event), .other => {} }
}
const YogurtApp = native_sdk.UiApp(Model, Msg);

pub fn initialModel() Model {
    return .{};
}

pub fn main(init: std.process.Init) !void {
    // The app struct (and any real Model) is multi-MB: `create`
    // heap-allocates and constructs everything in place, so neither
    // ever rides the stack. Mutate `app_state.model` through the
    // pointer before running if boot state is not the default.
    const app_state = try YogurtApp.create(std.heap.page_allocator, .{
        .name = "consumer",
        .scene = shell_scene,
        .canvas_label = canvas_label,
        .update_fx = update,
        .view = view,
        .fonts = &.{ .{ .id = @import("yogurt/theme.zig").font_id, .name = "Rethink Sans", .ttf = @embedFile("yogurt/rethink-sans.ttf") }, .{ .id = @import("yogurt/theme.zig").button_font_id, .name = "Rethink Sans Medium", .ttf = @embedFile("yogurt/rethink-sans-medium.ttf") } },
    });
    defer app_state.destroy();
    app_state.model = initialModel();

    try runner.runWithOptions(app_state.app(), .{
        .app_name = "consumer",
        .window_title = "Yogurt",
        .bundle_id = "dev.openboa.yogurt.preview",
        .icon_path = "assets/icon.png",
        .default_frame = geometry.RectF.init(0, 0, window_width, window_height),
        .js_window_api = false,
        .security = .{
            .permissions = &app_permissions,
            .navigation = .{ .allowed_origins = &.{ "zero://inline", "zero://app" } },
        },
    }, init);
}
