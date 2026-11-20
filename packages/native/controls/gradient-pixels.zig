const ui = @import("tokens.zig");
const std = @import("std");

pub const Tone = enum { neutral, brand, accent, success, warning, danger };
const width = 64;
const height = 24;
const Pixels = [width * height * 4]u8;

/// Generate once per palette change. The canvas scales the registered texture.
pub fn pixels(dark: bool, material: ui.Material, tone: Tone) Pixels {
    const roles = ui.roles(dark, material);
    const from = switch (tone) {
        .neutral => roles.field,
        .brand => roles.action_soft,
        .accent => roles.accent_soft,
        .success => roles.success_soft,
        .warning => roles.warning_soft,
        .danger => roles.danger_soft,
    };
    const to = if (tone == .accent) roles.action_soft else roles.surface;
    const first = [_]f32{ from.r, from.g, from.b };
    const last = [_]f32{ to.r, to.g, to.b };
    var image: Pixels = undefined;
    for (0..height) |y| {
        for (0..width) |x| {
            const t = (@as(f32, @floatFromInt(x)) + 0.4663 * @as(f32, @floatFromInt(y))) / ((width - 1) + 0.4663 * (height - 1));
            const offset = (width * y + x) * 4;
            for (first, last, 0..) |a, b, i| image[offset + i] = @intFromFloat(@round(255 * (a + (b - a) * t)));
            image[offset + 3] = 255;
        }
    }
    return image;
}
pub fn register(fx: anytype, id: u64, dark: bool, material: ui.Material, tone: Tone) !void {
    const image = pixels(dark, material, tone);
    try fx.registerImage(id, width, height, &image);
}
test "gradient endpoints use the installed light and dark palette" {
    const light = pixels(false, .neutral, .brand);
    const dark = pixels(true, .neutral, .brand);
    try std.testing.expectEqualSlices(u8, &.{ 239, 243, 246, 255 }, light[0..4]);
    try std.testing.expect(!std.mem.eql(u8, light[0..4], dark[0..4]));
}

test "register sends the complete palette texture to the host" {
    const Host = struct {
        called: bool = false,
        pub fn registerImage(self: *@This(), id: u64, w: usize, h: usize, rgba: []const u8) !void {
            try std.testing.expectEqual(@as(u64, 7), id);
            try std.testing.expectEqual(w * h * 4, rgba.len);
            self.called = true;
        }
    };
    var host = Host{};
    try register(&host, 7, true, .mist, .accent);
    try std.testing.expect(host.called);
}
