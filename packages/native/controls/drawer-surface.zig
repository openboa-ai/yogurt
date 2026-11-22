const sdk = @import("native_sdk");
const canvas = sdk.canvas;
const tokens = @import("tokens.zig");

pub const Drag = struct {
    sourceId: u32 = 1,
    phase: u8 = 0,
    x: f32 = 0,
    y: f32 = 0,
    viewWidth: f32 = 0,
    viewHeight: f32 = 0,
};

/// Carry the captured distance into the typed drag message for the drawer grip.
pub fn withTravel(event: sdk.Event) sdk.Event {
    if (event != .canvas_widget_drag) return event;
    var drag = event.canvas_widget_drag;
    for (drag.route) |entry| {
        if (entry.kind == .drawer) {
            drag.drag.point.y = drag.drag.delta.dy;
            return .{ .canvas_widget_drag = drag };
        }
    }
    return event;
}

pub fn shouldDismiss(drag: Drag) bool {
    return drag.phase == @intFromEnum(canvas.WidgetDragPhase.end) and drag.y >= tokens.drawer_dismiss_distance;
}

pub fn view(
    comptime Msg: type,
    ui: *canvas.Ui(Msg),
    title: []const u8,
    dismiss: Msg,
    drag: Msg,
    body: canvas.Ui(Msg).Node,
) canvas.Ui(Msg).Node {
    return present(Msg, ui, title, dismiss, drag, body, .{ .on_dismiss = dismiss, .semantics = .{ .label = title } });
}

pub fn present(
    comptime Msg: type,
    ui: *canvas.Ui(Msg),
    title: []const u8,
    dismiss: Msg,
    drag: Msg,
    body: canvas.Ui(Msg).Node,
    options: canvas.Ui(Msg).ElementOptions,
) canvas.Ui(Msg).Node {
    var outer = options;
    outer.padding = 0;
    return ui.el(.drawer, outer, .{
        ui.stack(.{}, .{
            ui.row(.{ .padding = tokens.inset_sheet, .main = .center }, .{
                ui.column(.{ .grow = 1, .max_width = tokens.drawer_content_width, .gap = tokens.gap_stack }, .{
                    ui.row(.{ .gap = 8, .cross = .center }, .{
                        ui.text(.{ .size = .heading, .grow = 1, .wrap = true }, title),
                        ui.button(.{ .variant = .ghost, .size = .icon, .icon = "x", .semantics = .{ .label = "Close" }, .on_press = dismiss }, ""),
                    }),
                    body,
                }),
            }),
            ui.row(.{ .main = .center }, .{
                ui.row(.{
                    .width = tokens.drawer_grip_target,
                    .height = tokens.inset_sheet,
                    .main = .center,
                    .cross = .center,
                    .on_drag = drag,
                    .style = .{ .quiet_hover = true },
                    .semantics = .{ .label = "Drawer handle" },
                }, .{
                    ui.column(.{ .width = 32, .height = 4, .style_tokens = .{ .background = .text_muted, .radius = .md } }, .{}),
                }),
            }),
        }),
    });
}
