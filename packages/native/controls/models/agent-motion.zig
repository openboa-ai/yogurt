const std = @import("std");
const data = @import("agent-motion-data.zig");

pub const State = data.State;
pub const Agent = data.Agent;
pub const label = data.label;

/// After updating the current pose, use this to decide whether another tick is needed.
pub fn isAnimating(state: State, elapsed_ms: u64, reduced_motion: bool) bool {
    const clip = data.clip(state);
    return !reduced_motion and clip.duration_ms > 0 and (clip.repeat or elapsed_ms < clip.duration_ms);
}

/// Sample the current state without creating timers or scheduling effects.
/// Pass elapsed milliseconds since this instance entered the state.
pub fn frameIndex(state: State, elapsed_ms: u64, reduced_motion: bool) u8 {
    if (reduced_motion) return data.neutral_pose;
    const clip = data.clip(state);
    if (clip.duration_ms == 0) return clip.frames[0].pose;

    const position = if (clip.repeat)
        elapsed_ms % clip.duration_ms
    else
        @min(elapsed_ms, clip.duration_ms);
    var index = clip.frames.len;
    while (index > 0) {
        index -= 1;
        const frame = clip.frames[index];
        if (frame.at_ms <= position) return frame.pose;
    }
    return data.neutral_pose;
}

/// The next visible change, including a possible loop boundary. Long held
/// poses and reduced motion need no regular redraws.
pub fn nextFrameDelay(state: State, elapsed_ms: u64, reduced_motion: bool) ?u32 {
    if (!isAnimating(state, elapsed_ms, reduced_motion)) return null;
    const clip = data.clip(state);
    const position: u32 = @intCast(if (clip.repeat) elapsed_ms % clip.duration_ms else elapsed_ms);
    for (clip.frames) |frame| {
        if (frame.at_ms > position) return frame.at_ms - position;
    }
    if (!clip.repeat or clip.frames.len < 2) return null;
    const last_pose = clip.frames[clip.frames.len - 1].pose;
    if (last_pose != clip.frames[0].pose) return clip.duration_ms - position;
    return clip.duration_ms - position + clip.frames[1].at_ms;
}

pub const Prepared = struct {
    agent: Agent,
    image_id: u64,
    current_pose: u8,

    /// Replace the pixels in this agent's existing registry slot when its pose changes.
    /// A failed registration leaves the last displayed pose available.
    pub fn update(
        self: *Prepared,
        fx: anytype,
        state: State,
        elapsed_ms: u64,
        reduced_motion: bool,
    ) !u64 {
        const pose = frameIndex(state, elapsed_ms, reduced_motion);
        if (pose != self.current_pose) {
            _ = try fx.registerImageBytes(self.image_id, data.bytes(self.agent, pose));
            self.current_pose = pose;
        }
        return self.image_id;
    }
};

/// Reserve one caller-owned image ID and register the neutral pose.
/// If images are unsupported, the host can retain its existing static avatar.
pub fn prepare(fx: anytype, agent: Agent, image_id: u64) !Prepared {
    _ = try fx.registerImageBytes(image_id, data.bytes(agent, data.neutral_pose));
    return .{ .agent = agent, .image_id = image_id, .current_pose = data.neutral_pose };
}

test "presence samples preserve a loop boundary and settle one-shot states" {
    const testing = std.testing;
    const neutral = frameIndex(.ready, 0, false);
    try testing.expectEqual(neutral, frameIndex(.ready, 5100, false));
    try testing.expect(frameIndex(.ready, 1480, false) != neutral);
    try testing.expect(isAnimating(.ready, 0, false));
    try testing.expect(!isAnimating(.ready, 0, true));
    try testing.expect(nextFrameDelay(.ready, 0, false).? > 600);
    try testing.expect(nextFrameDelay(.ready, 5099, false).? > 600);
    try testing.expectEqual(@as(?u32, null), nextFrameDelay(.ready, 0, true));
    try testing.expectEqual(@as(?u32, null), nextFrameDelay(.done, 900, false));
    try testing.expectEqual(frameIndex(.working, 0, false), frameIndex(.working, 3100, false));
    try testing.expect(frameIndex(.working, 288, false) != frameIndex(.working, 850, false));
    try testing.expect(frameIndex(.done, 330, false) != neutral);
    try testing.expect(frameIndex(.ready, 1480, false) != frameIndex(.ready, 900, false));
    try testing.expect(frameIndex(.working, 1750, false) != frameIndex(.working, 1380, false));
    try testing.expect(isAnimating(.done, 819, false));
    try testing.expect(!isAnimating(.done, 820, false));
    try testing.expect(isAnimating(.working, std.math.maxInt(u64), false));
    try testing.expect(!isAnimating(.working, 0, true));
    for ([_]State{ .thinking, .waiting, .blocked, .done }) |state| {
        const clip = data.clip(state);
        try testing.expectEqual(clip.frames[clip.frames.len - 1].pose, frameIndex(state, std.math.maxInt(u64), false));
    }
    for (std.enums.values(State)) |state| {
        try testing.expectEqual(neutral, frameIndex(state, 90, true));
    }
    try testing.expectEqualStrings("Waiting for you", label(.waiting));
}

test "each agent reuses one image ID and can retry a failed update" {
    const testing = std.testing;
    const Registry = struct {
        count: usize = 0,
        last_id: ?u64 = null,
        fail: bool = false,

        pub fn registerImageBytes(self: *@This(), id: u64, encoded: []const u8) !void {
            try testing.expectEqualSlices(u8, "\x89PNG\r\n\x1a\n", encoded[0..8]);
            if (self.last_id) |previous| try testing.expectEqual(previous, id);
            if (self.fail) return error.RegistryUnavailable;
            self.last_id = id;
            self.count += 1;
        }
    };
    for (std.enums.values(Agent)) |agent| {
        var registry: Registry = .{};
        var prepared = try prepare(&registry, agent, 42);
        try testing.expectEqual(@as(u64, 42), try prepared.update(&registry, .ready, 0, false));
        try testing.expectEqual(@as(usize, 1), registry.count);
        const initial_pose = prepared.current_pose;
        registry.fail = true;
        try testing.expectError(error.RegistryUnavailable, prepared.update(&registry, .working, 288, false));
        try testing.expectEqual(initial_pose, prepared.current_pose);
        registry.fail = false;
        try testing.expectEqual(@as(u64, 42), try prepared.update(&registry, .working, 288, false));
        _ = try prepared.update(&registry, .working, 288, false);
        try testing.expectEqual(@as(usize, 2), registry.count);
        _ = try prepared.update(&registry, .working, 288, true);
        try testing.expectEqual(initial_pose, prepared.current_pose);
        try testing.expectEqual(@as(usize, 3), registry.count);
    }
}
