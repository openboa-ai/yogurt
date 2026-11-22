const std = @import("std");
const canvas = @import("native_sdk").canvas;
const tokens = @import("tokens.zig");

/// A host owns the target. The tween carries only the currently painted value.
pub const Tween = struct {
    value: f32 = 0,
    from: f32 = 0,
    target: f32 = 0,
    start_ns: u64 = 0,
    duration_ms: u32 = 0,
    curve: [4]f32 = tokens.settle_curve,

    pub fn snap(self: *Tween, value: f32) void {
        self.* = .{ .value = value, .from = value, .target = value };
    }

    pub fn active(self: Tween) bool {
        return self.duration_ms != 0;
    }

    pub fn retarget(self: *Tween, target: f32, now_ns: u64, duration_ms: u32, curve: [4]f32) void {
        if (duration_ms == 0 or self.value == target) {
            self.snap(target);
            return;
        }
        self.* = .{
            .value = self.value,
            .from = self.value,
            .target = target,
            .start_ns = now_ns,
            .duration_ms = duration_ms,
            .curve = curve,
        };
    }

    pub fn advance(self: *Tween, now_ns: u64) void {
        if (!self.active()) return;
        const duration_ns = @as(u64, self.duration_ms) * std.time.ns_per_ms;
        const elapsed = now_ns -| self.start_ns;
        if (elapsed >= duration_ns) {
            self.snap(self.target);
            return;
        }
        const fraction = @as(f32, @floatFromInt(elapsed)) / @as(f32, @floatFromInt(duration_ns));
        self.value = self.from + (self.target - self.from) * easing(self.curve, fraction);
    }
};

fn bezier(p1: f32, p2: f32, t: f32) f32 {
    const u = 1 - t;
    return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

fn easing(curve: [4]f32, fraction: f32) f32 {
    var lo: f32 = 0;
    var hi: f32 = 1;
    for (0..16) |_| {
        const t = (lo + hi) * 0.5;
        if (bezier(curve[0], curve[2], t) < fraction) lo = t else hi = t;
    }
    return bezier(curve[1], curve[3], (lo + hi) * 0.5);
}

pub fn progressView(comptime Msg: type, ui: *canvas.Ui(Msg), label: []const u8, detail: []const u8, target: f32, visible_value: f32) canvas.Ui(Msg).Node {
    return ui.column(.{ .gap = tokens.gap_tight }, .{
        ui.row(.{ .cross = .center }, .{
            ui.text(.{ .grow = 1 }, label),
            ui.text(.{ .size = .sm, .style_tokens = .{ .foreground = .text_muted } }, detail),
        }),
        ui.el(.progress, .{
            .height = tokens.gap_tight,
            .value = visible_value,
            .semantics = .{ .label = label, .value = target },
        }, .{}),
    });
}

pub fn surfaceOptions(comptime Msg: type, label: []const u8, dismiss: Msg, x: f32, y: f32, opacity: f32) canvas.Ui(Msg).ElementOptions {
    return .{
        .on_dismiss = dismiss,
        .semantics = .{ .label = label },
        .transform = canvas.Affine.translate(x, y),
        .opacity = @max(0.001, opacity),
    };
}

test "motion settles exactly and reverses from the last painted value" {
    var motion: Tween = .{};
    motion.retarget(1, 0, tokens.travel_ms, tokens.settle_curve);
    motion.advance(50 * std.time.ns_per_ms);
    const visible = motion.value;
    try std.testing.expect(visible > 0 and visible < 1);
    motion.retarget(0, 50 * std.time.ns_per_ms, tokens.travel_ms, tokens.settle_curve);
    try std.testing.expectEqual(visible, motion.value);
    motion.advance(270 * std.time.ns_per_ms);
    try std.testing.expectEqual(@as(f32, 0), motion.value);
    try std.testing.expect(!motion.active());
    motion.retarget(1, 0, 0, tokens.arrive_curve);
    try std.testing.expectEqual(@as(f32, 1), motion.value);
    try std.testing.expect(!motion.active());
}
