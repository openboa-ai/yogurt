const std = @import("std");
const runner = @import("runner");
const native_sdk = @import("native_sdk");
const core = @import("model.zig");
const theme = @import("yogurt/theme.zig");

pub const panic = std.debug.FullPanic(native_sdk.debug.capturePanic);
pub const Model = core.Model;
pub const Msg = core.Msg;
pub const AppUi = native_sdk.canvas.Ui(Msg);
pub const app_markup = @embedFile("app.native");

const canvas_label = "main-canvas";
const title = "Editorial review";
const app_name = "yogurt-decision-fixture";
const bundle_id = "dev.openboa.yogurt.decision-fixture";
const width: f32 = 680;
const height: f32 = 520;
const permissions = [_][]const u8{ native_sdk.security.permission_command, native_sdk.security.permission_view };
const views = [_]native_sdk.ShellView{.{
    .label = canvas_label,
    .kind = .gpu_surface,
    .fill = true,
    .role = title,
    .accessibility_label = title,
    .gpu_backend = .metal,
    .gpu_pixel_format = .bgra8_unorm,
    .gpu_present_mode = .timer,
    .gpu_alpha_mode = .@"opaque",
    .gpu_color_space = .srgb,
    .gpu_vsync = true,
}};
const windows = [_]native_sdk.ShellWindow{.{
    .label = "main",
    .title = title,
    .width = width,
    .height = height,
    .views = &views,
}};
const sources = [_]native_sdk.canvas.ui_markup.SourceFile{
    @import("yogurt/confirm-dialog.zig").file,
    @import("yogurt/record-facts.zig").file,
    @import("yogurt/progress.zig").file,
    @import("yogurt/receipt.zig").file,
};

pub fn initialModel() Model {
    return .{};
}

pub fn main(init: std.process.Init) !void {
    const App = native_sdk.UiApp(Model, Msg);
    const app = try App.create(std.heap.page_allocator, .{
        .name = app_name,
        .scene = .{ .windows = &windows },
        .canvas_label = canvas_label,
        .update_fx = core.update,
        .tokens_fn = core.tokens,
        .fonts = &.{
            .{ .id = theme.font_id, .name = "Rethink Sans", .ttf = @embedFile("yogurt/rethink-sans.ttf") },
            .{ .id = theme.button_font_id, .name = "Rethink Sans Medium", .ttf = @embedFile("yogurt/rethink-sans-medium.ttf") },
        },
        .markup = .{ .source = app_markup, .sources = &sources, .watch_path = "src/app.native", .io = init.io },
    });
    defer app.destroy();
    app.model = initialModel();
    try runner.runWithOptions(app.app(), .{
        .app_name = app_name,
        .window_title = title,
        .bundle_id = bundle_id,
        .icon_path = "assets/icon.png",
        .default_frame = native_sdk.geometry.RectF.init(0, 0, width, height),
        .js_window_api = false,
        .security = .{
            .permissions = &permissions,
            .navigation = .{ .allowed_origins = &.{ "zero://inline", "zero://app" } },
        },
    }, init);
}

test {
    _ = core;
}
