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
    .{ .label = canvas_label, .kind = .gpu_surface, .fill = true, .role = "Yogurt SDK consumer", .accessibility_label = "Yogurt SDK consumer", .gpu_backend = .metal, .gpu_pixel_format = .bgra8_unorm, .gpu_present_mode = .timer, .gpu_alpha_mode = .@"opaque", .gpu_color_space = .srgb, .gpu_vsync = true },
};
const shell_windows = [_]native_sdk.ShellWindow{.{
    .label = "main",
    .title = "Yogurt",
    .width = window_width,
    .height = window_height,
    .views = &shell_views,
}};
const shell_scene: native_sdk.ShellConfig = .{ .windows = &shell_windows };

const inputs = @import("yogurt/precision-inputs.zig");
const layers = @import("yogurt/views/layers.zig");

pub const Model = struct {
    editor: inputs.CodeEditor = .{},
    rating: u32 = 0,
    save_count: u32 = 0,
    confirming: bool = false,
};
pub const Msg = union(enum) {
    edit: canvas.TextInputEvent,
    rate: u32,
    review,
    cancel,
    save,
    other,
};
const Ui = canvas.Ui(Msg);

fn rate(score: u32) Msg {
    return .{ .rate = score };
}

fn ratingLabel(score: u32) []const u8 {
    return switch (score) {
        1 => "Rating: 1 of 5",
        2 => "Rating: 2 of 5",
        3 => "Rating: 3 of 5",
        4 => "Rating: 4 of 5",
        5 => "Rating: 5 of 5",
        else => "No rating selected",
    };
}

fn view(ui: *Ui, m: *const Model) Ui.Node {
    return ui.column(.{ .gap = 12 }, .{
        ui.button(.{ .on_press = .other }, "Before"),
        inputs.codeView(Msg, ui, &m.editor, "Verification code", "Enter six digits", Ui.inputMsg(.edit)),
        ui.button(.{ .on_press = .other }, "After"),
        inputs.ratingView(Msg, ui, "Experience rating", m.rating, false, rate),
        ui.text(.{}, ratingLabel(m.rating)),
        ui.text(.{}, switch (m.save_count) {
            0 => "Rating not saved",
            1 => "Rating saved once",
            else => "Rating saved more than once",
        }),
        ui.button(.{ .on_press = .review, .disabled = m.rating == 0 }, "Review rating"),
        if (m.confirming)
            layers.dialogView(Msg, ui, "Save rating?", .cancel, 1, ui.column(.{ .gap = 8 }, .{
                ui.text(.{}, ratingLabel(m.rating)),
                ui.button(.{ .on_press = .save }, "Save rating"),
            }))
        else
            ui.column(.{}, .{}),
    });
}

fn update(m: *Model, msg: Msg, _: *native_sdk.Effects(Msg)) void {
    switch (msg) {
        .edit => |event| inputs.editCode(&m.editor, event),
        .rate => |score| m.rating = score,
        .review => m.confirming = true,
        .cancel => m.confirming = false,
        .save => {
            m.save_count += 1;
            m.confirming = false;
        },
        .other => {},
    }
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
    inputs.registerRatingIcons();
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
