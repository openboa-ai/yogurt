const std = @import("std");
const canvas = @import("native_sdk").canvas;
const tokens = @import("tokens.zig");

const transparent = canvas.Color.rgba8(0, 0, 0, 0);
const star_path = "<path d=\"M12 3 L14.8 8.8 L21.2 9.7 L16.6 14.2 L17.7 20.6 L12 17.6 L6.3 20.6 L7.4 14.2 L2.8 9.7 L9.2 8.8 Z\"/>";
const star_outline = canvas.svg_icon.parseComptime("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linejoin=\"round\">" ++ star_path ++ "</svg>");
const star_fill = canvas.svg_icon.parseComptime("<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linejoin=\"round\">" ++ star_path ++ "</svg>");
const icons = [_]canvas.icons.Entry{
    .{ .name = "yogurt-rating-outline", .icon = &star_outline },
    .{ .name = "yogurt-rating-fill", .icon = &star_fill },
};

pub fn registerRatingIcons() void {
    canvas.icons.registerAppIcons(&icons);
}

pub const CodeEditor = canvas.TextBuffer(6);

pub fn editCode(editor: *CodeEditor, event: canvas.TextInputEvent) void {
    switch (event) {
        .insert_text => |input| {
            var digits: [6]u8 = undefined;
            var count: usize = 0;
            for (input) |byte| {
                if (!std.ascii.isDigit(byte)) continue;
                digits[count] = byte;
                count += 1;
                if (count == digits.len) break;
            }
            if (count != 0) editor.apply(.{ .insert_text = digits[0..count] });
        },
        .set_composition, .commit_composition, .cancel_composition => {},
        else => editor.apply(event),
    }
}

pub fn codeView(comptime Msg: type, ui: *canvas.Ui(Msg), editor: *const CodeEditor, title: []const u8, help: []const u8, on_input: canvas.Ui(Msg).InputMsgFn) canvas.Ui(Msg).Node {
    const value = editor.text();
    var slots: [6]canvas.Ui(Msg).Node = undefined;
    const active_slot: ?usize = if (value.len > 0 and value.len < slots.len) @min(editor.selection.focus, slots.len - 1) else null;
    for (&slots, 0..) |*slot, index| {
        const digit = if (index < value.len) value[index .. index + 1] else "";
        slot.* = ui.column(.{
            .grow = 1,
            .max_width = tokens.otp_slot_width,
            .height = tokens.otp_slot_height,
            .main = .center,
            .style = .{ .radius = tokens.otp_slot_radius },
            .style_tokens = .{ .background = if (active_slot == index) .surface_pressed else .surface_subtle },
        }, .{ui.text(.{ .size = .heading, .text_alignment = .center }, digit)});
    }
    return ui.column(.{ .gap = 6, .max_width = tokens.otp_control_max_width }, .{
        ui.text(.{ .size = .sm }, title),
        ui.stack(.{}, .{
            ui.row(.{ .gap = tokens.otp_slot_gap }, @as([]const canvas.Ui(Msg).Node, &slots)),
            ui.textField(.{
                .height = tokens.otp_slot_height,
                .text = value,
                .semantics = .{ .label = title },
                .style = .{
                    .background = transparent,
                    .foreground = transparent,
                    .border = transparent,
                    .stroke_width = 0,
                    .radius = tokens.otp_slot_radius,
                },
                .on_input = on_input,
            }),
        }),
        ui.text(.{ .size = .sm, .wrap = true, .style_tokens = .{ .foreground = .text_muted } }, help),
    });
}

pub fn ratingView(comptime Msg: type, ui: *canvas.Ui(Msg), title: []const u8, selected: u32, dark: bool, comptime select: fn (u32) Msg) canvas.Ui(Msg).Node {
    const colors = tokens.roles(dark, .neutral);
    const labels = [_][]const u8{ "1 of 5", "2 of 5", "3 of 5", "4 of 5", "5 of 5" };
    var stars: [5]canvas.Ui(Msg).Node = undefined;
    var radios: [5]canvas.Ui(Msg).Node = undefined;
    for (labels, 0..) |label, index| {
        const score: u32 = @intCast(index + 1);
        const filled = score <= selected;
        stars[index] = ui.row(.{ .width = tokens.size_touch, .height = tokens.size_touch, .main = .center, .cross = .center }, .{
            ui.appIcon(.{ .width = 28, .height = 28, .style = .{ .foreground = if (filled) colors.signal_rating else colors.muted } }, if (filled) "yogurt-rating-fill" else "yogurt-rating-outline"),
        });
        radios[index] = ui.el(.radio, .{
            .width = tokens.size_touch,
            .height = tokens.size_touch,
            .checked = score == selected,
            .semantics = .{ .label = label },
            .style = .{ .background = transparent, .border = transparent, .accent = transparent, .stroke_width = 0 },
            .on_toggle = select(score),
        }, .{});
    }
    return ui.column(.{ .gap = 6 }, .{
        ui.text(.{ .size = .sm }, title),
        ui.stack(.{}, .{
            ui.row(.{ .gap = tokens.gap_tight }, @as([]const canvas.Ui(Msg).Node, &stars)),
            ui.el(.radio_group, .{ .gap = tokens.gap_tight, .semantics = .{ .label = title } }, @as([]const canvas.Ui(Msg).Node, &radios)),
        }),
    });
}
