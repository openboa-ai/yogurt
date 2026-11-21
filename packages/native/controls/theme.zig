const canvas = @import("native_sdk").canvas;
const ui = @import("tokens.zig");
pub const button_font_id = canvas.min_registered_font_id + 1;
pub const Material = ui.Material;
pub const font_id = canvas.min_registered_font_id;

pub fn theme(dark: bool, material: Material, high_contrast: bool, reduced_motion: bool) canvas.DesignTokens {
    const scheme: canvas.ColorScheme = if (dark) .dark else .light;
    const r = ui.roles(dark, material);
    var result = canvas.DesignTokens.themeWithOverrides(.{ .color_scheme = scheme }, .{
        .colors = .{ .background = r.canvas, .surface = r.surface, .surface_subtle = r.field, .surface_pressed = r.hover, .text = r.text, .text_muted = r.muted, .accent = r.inverse, .accent_text = r.on_inverse, .focus_ring = r.text, .destructive = r.danger, .success = r.success, .warning = r.warning, .border = r.off },
        .radius = .{ .sm = ui.radius_small, .md = ui.radius_control, .lg = ui.radius_panel },
        .metrics = .{ .control_height_sm = ui.size_compact, .control_height = ui.size_regular, .control_height_lg = ui.size_touch, .button_inset_sm = ui.inset_compact, .button_inset = ui.inset_regular, .button_inset_lg = ui.inset_roomy, .spinner_period_ms = ui.busy_ms },
        .typography = .{ .font_id = font_id, .mono_font_id = font_id, .button_font_id = button_font_id, .body_size = ui.body_type, .label_size = ui.help_type, .button_size = ui.action_type, .heading_size = ui.heading_type, .title_size = ui.heading_type, .display_size = ui.display_type },
        .motion = .{ .fast_ms = ui.press_ms, .normal_ms = ui.travel_ms, .slow_ms = ui.panel_ms },
        .controls = .{
            .card = .{ .background = if (dark) r.surface else r.canvas, .radius = ui.card_corner, .stroke_width = 0 },
            .panel = .{ .radius = ui.radius_panel, .stroke_width = 0 },
            .popover = .{ .radius = ui.radius_popover, .stroke_width = 0 },
            .menu_surface = .{ .radius = ui.radius_menu, .stroke_width = 0 },
            .dropdown_menu = .{ .radius = ui.radius_menu, .stroke_width = 0 },
            .dialog = .{ .radius = ui.radius_sheet },
            .drawer = .{ .radius = ui.radius_sheet },
            .sheet = .{ .radius = ui.radius_sheet },
            .switch_control = .{ .background = r.off, .active_background = r.signal_positive, .foreground = r.thumb, .active_foreground = r.on_signal_positive },
            .progress = .{ .background = r.field, .active_background = r.inverse },
            .badge = .{ .background = r.field, .foreground = r.muted, .radius = ui.radius_small, .stroke_width = 0 },
            .skeleton = .{ .radius = ui.radius_small },
            .separator = .{ .background = r.hover },
            .segmented_control = .{ .active_background = r.hover, .radius = ui.segment_track_radius, .stroke_width = 0 },
            .button_primary = .{ .background = r.inverse, .hover_background = r.inverse_hover, .pressed_background = r.inverse_press, .foreground = r.on_inverse, .radius = ui.radius_control, .disabled_background = r.field, .disabled_foreground = r.muted },
            .button_secondary = .{ .background = r.field, .foreground = r.text, .hover_background = r.hover, .radius = ui.radius_control, .stroke_width = 0 },
            .input = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
            .text_field = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
            .textarea = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
            .search_field = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
            .select = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
        },
    });
    if (high_contrast) {
        result.colors.text_muted = r.text;
        result.controls.badge.foreground = r.text;
        result.controls.segmented_control.stroke_width = 1;
        result.controls.card.stroke_width = 1;
        result.controls.panel.stroke_width = 1;
        result.controls.popover.stroke_width = 1;
        result.controls.menu_surface.stroke_width = 1;
        result.controls.dropdown_menu.stroke_width = 1;
        result.controls.button_secondary.stroke_width = 1;
        result.controls.text_field.stroke_width = 1;
        result.controls.input.stroke_width = 1;
        result.controls.textarea.stroke_width = 1;
        result.controls.search_field.stroke_width = 1;
        result.controls.select.stroke_width = 1;
    }
    if (reduced_motion) result.motion = canvas.MotionTokens.reduced();
    return result;
}

test "shared surfaces and inputs follow token roles in each appearance" {
    const std = @import("std");
    inline for (.{ false, true }) |dark| {
        inline for (.{ Material.neutral, Material.paper, Material.mist }) |material| {
            const actual = theme(dark, material, false, false);
            const colors = ui.roles(dark, material);
            try std.testing.expectEqual(ui.display_type, actual.typography.display_size);
            try std.testing.expectEqual(if (dark) colors.surface else colors.canvas, actual.controls.card.background.?);
            try std.testing.expectEqual(ui.card_corner, actual.controls.card.radius.?);
            try std.testing.expectEqual(@as(f32, 0), actual.controls.card.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 0), actual.controls.panel.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 0), actual.controls.popover.stroke_width.?);
            try std.testing.expectEqual(ui.radius_sheet, actual.controls.dialog.radius.?);
            try std.testing.expectEqual(colors.field, actual.controls.textarea.background.?);
            try std.testing.expectEqual(colors.field, actual.controls.search_field.background.?);
            try std.testing.expectEqual(colors.field, actual.controls.select.background.?);
            const contrast = theme(dark, material, true, false);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.card.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.panel.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.popover.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.textarea.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.search_field.stroke_width.?);
            try std.testing.expectEqual(@as(f32, 1), contrast.controls.select.stroke_width.?);
        }
    }
}
