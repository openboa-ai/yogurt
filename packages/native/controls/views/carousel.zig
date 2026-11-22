const canvas = @import("native_sdk").canvas;
const tokens = @import("../tokens.zig");

pub fn Options(comptime Msg: type) type {
    return struct {
        label: []const u8,
        position: []const u8,
        previous: ?Msg,
        next: ?Msg,
        backwards: bool = false,
        phase: f32 = 1,
    };
}

pub fn carouselView(comptime Msg: type, ui: *canvas.Ui(Msg), options: Options(Msg), slide: canvas.Ui(Msg).Node) canvas.Ui(Msg).Node {
    const start: f32 = if (options.backwards) -tokens.gap_panel else tokens.gap_panel;
    return ui.column(.{ .gap = tokens.gap_stack, .semantics = .{ .label = options.label } }, .{
        ui.column(.{
            .opacity = @max(0.001, options.phase),
            .transform = canvas.Affine.translate(start * (1 - options.phase), 0),
        }, .{slide}),
        ui.row(.{ .gap = tokens.gap_tight, .cross = .center }, .{
            ui.text(.{}, options.position),
            ui.spacer(1),
            ui.button(.{ .variant = .ghost, .size = .icon, .icon = "chevron-left", .semantics = .{ .label = "Previous slide" },
                .on_press = options.previous, .disabled = options.previous == null }, ""),
            ui.button(.{ .variant = .ghost, .size = .icon, .icon = "chevron-right", .semantics = .{ .label = "Next slide" },
                .on_press = options.next, .disabled = options.next == null }, ""),
            ui.spacer(1),
        }),
    });
}
