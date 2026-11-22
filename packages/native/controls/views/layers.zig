const canvas = @import("native_sdk").canvas;
const motion = @import("../interface-motion.zig");
const tokens = @import("../tokens.zig");

pub fn dialogView(comptime Msg: type, ui: *canvas.Ui(Msg), title: []const u8, dismiss: Msg, phase: f32, content: canvas.Ui(Msg).Node) canvas.Ui(Msg).Node {
    return panel(Msg, ui, false, title, dismiss, phase, content);
}

pub fn sheetView(comptime Msg: type, ui: *canvas.Ui(Msg), title: []const u8, dismiss: Msg, phase: f32, content: canvas.Ui(Msg).Node) canvas.Ui(Msg).Node {
    return panel(Msg, ui, true, title, dismiss, phase, content);
}

fn panel(comptime Msg: type, ui: *canvas.Ui(Msg), sheet: bool, title: []const u8, dismiss: Msg, phase: f32, content: canvas.Ui(Msg).Node) canvas.Ui(Msg).Node {
    const offset = (if (sheet) tokens.gap_panel else tokens.gap_inline) * (1 - phase);
    var options = motion.surfaceOptions(Msg, title, dismiss, if (sheet) offset else 0, if (sheet) 0 else offset, phase);
    options.width = tokens.dialog_width;
    options.padding = tokens.inset_sheet;
    return ui.el(if (sheet) .sheet else .dialog, options, .{
        ui.column(.{ .gap = tokens.gap_stack }, .{
            ui.row(.{ .gap = tokens.gap_inline, .cross = .center }, .{
                ui.text(.{ .size = .heading, .grow = 1, .wrap = true }, title),
                ui.button(.{ .variant = .ghost, .size = .icon, .icon = "x", .semantics = .{ .label = "Close" }, .on_press = dismiss }, ""),
            }),
            content,
        }),
    });
}

pub fn Trigger(comptime Msg: type) type {
    return struct { label: []const u8, open: Msg, dismiss: Msg, expanded: bool, phase: f32 = 1 };
}

pub fn menuItem(comptime Msg: type, ui: *canvas.Ui(Msg), label: []const u8, select: Msg) canvas.Ui(Msg).Node {
    return ui.el(.menu_item, .{ .height = tokens.menu_row, .text = label, .on_press = select }, .{});
}

pub fn actionMenuView(comptime Msg: type, ui: *canvas.Ui(Msg), trigger: Trigger(Msg), items: anytype) canvas.Ui(Msg).Node {
    return anchored(Msg, ui, true, trigger, items);
}

pub fn popoverView(comptime Msg: type, ui: *canvas.Ui(Msg), trigger: Trigger(Msg), content: canvas.Ui(Msg).Node) canvas.Ui(Msg).Node {
    return anchored(Msg, ui, false, trigger, .{content});
}

fn anchored(comptime Msg: type, ui: *canvas.Ui(Msg), menu: bool, trigger: Trigger(Msg), children: anytype) canvas.Ui(Msg).Node {
    var popup = motion.surfaceOptions(Msg, trigger.label, trigger.dismiss, 0, -tokens.layer_shift * (1 - trigger.phase), trigger.phase);
    popup.anchor = .below;
    popup.anchor_offset = tokens.offset_layer;
    popup.padding = if (menu) tokens.inset_layer else tokens.inset_regular;
    popup.width = if (menu) tokens.anchored_menu_min_width else 0;
    return ui.row(.{ .main = .start }, .{
        ui.stack(.{}, .{
            ui.button(.{ .variant = .secondary, .icon = if (menu) "chevron-down" else "", .icon_placement = .trailing, .on_press = trigger.open }, trigger.label),
            if (trigger.expanded) ui.el(if (menu) .dropdown_menu else .popover, popup, children) else ui.column(.{}, .{}),
        }),
    });
}
