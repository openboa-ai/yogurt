const std = @import("std");
const app = @import("main.zig");
const model = @import("model.zig");
const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");
const ui = @import("yogurt/tokens.zig");
test "current state chooses the same ink and metrics used by the web kit" {
    inline for (.{ false, true }) |dark| {
        inline for (.{ ui.Material.neutral, ui.Material.paper, ui.Material.mist }) |material| {
            const t = theme.theme(dark, material, false, false);
            const expected = ui.roles(dark, material);
            try std.testing.expectEqual(expected.inverse, t.controls.button_primary.background.?);
            try std.testing.expectEqual(expected.inverse_hover, t.controls.button_primary.hover_background.?);
            try std.testing.expectEqual(expected.field, t.controls.button_secondary.background.?);
            try std.testing.expectEqual(expected.inverse, t.controls.switch_control.active_background.?);
            try std.testing.expectEqual(expected.canvas, t.colors.background);
            try std.testing.expectEqual(ui.size_regular, t.metrics.control_height);
            try std.testing.expectEqual(ui.radius_control, t.controls.button_primary.radius.?);
            try std.testing.expectEqual(theme.font_id, t.typography.font_id);
        }
    }
    try std.testing.expectEqual(@as(u32, 0), theme.theme(false, .neutral, true, true).motion.fast_ms);
}
test "save, undo, display and appearance use typed messages" {
    var m = app.initialModel();
    var fx: sdk.Effects(app.Msg) = .{ .allocator = std.testing.allocator };
    model.update(&m, .activate, &fx);
    try std.testing.expectEqualStrings("View saved.", m.save_status());
    model.update(&m, .undo, &fx);
    try std.testing.expect(!m.saved);
    model.update(&m, .toggle, &fx);
    try std.testing.expect(!m.dates);
    model.update(&m, .toggle_dark, &fx);
    try std.testing.expect(m.dark);
    model.update(&m, .change_material, &fx);
    try std.testing.expectEqual(ui.Material.paper, m.material);
}
