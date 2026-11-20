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
        .metrics = .{ .control_height_sm = ui.size_compact, .control_height = ui.size_regular, .control_height_lg = ui.size_touch, .button_inset_sm = ui.inset_compact, .button_inset = ui.inset_regular, .button_inset_lg = ui.inset_roomy },
        .typography = .{ .font_id = font_id, .mono_font_id = font_id, .button_font_id = button_font_id, .body_size = ui.body_type, .label_size = ui.help_type, .button_size = ui.action_type, .heading_size = ui.heading_type, .title_size = ui.heading_type },
        .motion = .{ .fast_ms = ui.press_ms, .normal_ms = ui.travel_ms, .slow_ms = ui.panel_ms },
        .controls = .{
            .switch_control = .{ .background = r.off, .active_background = r.inverse, .foreground = r.thumb, .active_foreground = r.on_inverse },
            .button_primary = .{ .background = r.inverse, .hover_background = r.inverse_hover, .pressed_background = r.inverse_press, .foreground = r.on_inverse, .radius = ui.radius_control, .disabled_background = r.hover, .disabled_foreground = r.muted },
            .button_secondary = .{ .background = r.field, .foreground = r.text, .hover_background = r.hover, .radius = ui.radius_control, .stroke_width = 0 },
            .input = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
            .text_field = .{ .background = r.field, .foreground = r.text, .radius = ui.radius_control, .stroke_width = 0 },
        },
    });
    if (high_contrast) {
        result.colors.text_muted = r.text;
        result.controls.button_secondary.stroke_width = 1;
        result.controls.text_field.stroke_width = 1;
    }
    if (reduced_motion) result.motion = canvas.MotionTokens.reduced();
    return result;
}
