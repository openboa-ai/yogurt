const std = @import("std");
const canvas = @import("native_sdk").canvas;
const data = @import("avatar-pose-data.zig");
const family = @import("agent-family-data.zig");

pub const Agent = data.Agent;
pub const State = data.State;
pub const EyeMark = data.EyeMark;
pub const Pose = data.Pose;
pub const Variant = family.Variant;
pub const Color = family.Color;
pub const neutral: Pose = .{.{ 0, 0, 0, 1, 1 }} ** 3;

pub const Playback = struct {
    agent: Agent,
    roster: bool,
    state: State,
    started_ms: u64,
    entry_pose: ?Pose = null,
    entry_mark: EyeMark = .round,
    variant: ?Variant = null,
    color: ?Color = null,

    // Use a monotonic, host-owned clock. Freeze it while the view is suspended.
    pub fn init(agent: Agent, size: f32, state: State, now_ms: u64) Playback {
        return .{ .agent = agent, .roster = size <= data.roster_max, .state = state, .started_ms = now_ms };
    }

    pub fn initVariant(variant: Variant, size: f32, state: State, now_ms: u64) Playback {
        var playback = init(family.geometry(variant).motion, size, state, now_ms);
        playback.variant = variant;
        return playback;
    }

    fn fitPose(self: Playback, value: Pose) Pose {
        const variant = self.variant orelse return value;
        const slide, const lift, const tilt, const gaze_x, const gaze_y = family.geometry(variant).fit;
        var result = value;
        result[0][0] *= slide;
        result[0][1] *= lift;
        result[0][2] *= tilt;
        for (result[1..]) |*eye_transform| {
            eye_transform[0] *= gaze_x;
            eye_transform[1] *= gaze_y;
        }
        return result;
    }

    pub fn setState(self: *Playback, state: State, now_ms: u64, reduced_motion: bool) void {
        if (state == self.state) return;
        self.entry_pose = if (reduced_motion) null else self.pose(now_ms, false);
        self.entry_mark = if (reduced_motion) .round else self.mark(now_ms, false);
        self.state = state;
        self.started_ms = now_ms;
    }

    pub fn pose(self: Playback, now_ms: u64, reduced_motion: bool) Pose {
        const clip = data.get(self.agent, self.roster, self.state);
        if (reduced_motion) return self.fitPose(clip.frames[clip.still].pose);
        const elapsed = now_ms -| self.started_ms;
        if (self.entry_pose) |entry| {
            if (elapsed < data.transition_ms) {
                return interpolate(entry, self.fitPose(sample(clip, data.transition_ms)), fraction(elapsed, data.transition_ms));
            }
        }
        return self.fitPose(sample(clip, clipTime(clip, elapsed)));
    }

    pub fn mark(self: Playback, now_ms: u64, reduced_motion: bool) EyeMark {
        const clip = data.get(self.agent, self.roster, self.state);
        if (reduced_motion) return clip.mark;
        const elapsed = now_ms -| self.started_ms;
        if (self.entry_pose != null and elapsed < data.transition_ms) return self.entry_mark;
        return if (clipTime(clip, elapsed) >= clip.mark_at) clip.mark else .round;
    }

    pub fn draw(self: Playback, now_ms: u64, reduced_motion: bool, x: f32, y: f32, size: f32, ids: [3]u64) Drawing {
        var art = if (self.variant) |variant| family.geometry(variant).art else data.art(self.agent);
        if (self.color) |color| art.fill = family.color(color);
        return drawPose(art, self.pose(now_ms, reduced_motion), self.mark(now_ms, reduced_motion), x, y, size, ids);
    }

    pub fn nextFrameDelay(self: Playback, now_ms: u64, visible: bool, reduced_motion: bool) ?u64 {
        if (!visible or reduced_motion) return null;
        const elapsed = now_ms -| self.started_ms;
        const clip = data.get(self.agent, self.roster, self.state);
        const step: u64 = if (self.roster) 33 else 16;
        if (self.entry_pose != null and elapsed < data.transition_ms) {
            return @min(step, data.transition_ms - elapsed);
        }
        const local = clipTime(clip, elapsed);
        if (local == clip.duration) return null;
        for (clip.frames[0 .. clip.frames.len - 1], clip.frames[1..]) |start, end| {
            if (end.at <= local or std.meta.eql(start.pose, end.pose)) continue;
            if (start.at > local) return start.at - local + 1;
            return @min(step, end.at - local);
        }
        if (clip.loop) {
            for (clip.frames[0 .. clip.frames.len - 1], clip.frames[1..]) |start, end| {
                if (!std.meta.eql(start.pose, end.pose)) return clip.duration - local + start.at + 1;
            }
        }
        return null;
    }
};

fn clipTime(clip: data.Clip, elapsed: u64) u64 {
    return if (clip.loop) elapsed % clip.duration else @min(elapsed, clip.duration);
}

fn fraction(part: u64, whole: u64) f32 {
    return @as(f32, @floatFromInt(part)) / @as(f32, @floatFromInt(whole));
}

fn sample(clip: data.Clip, at: u64) Pose {
    var previous = clip.frames[0];
    for (clip.frames[1..]) |next| {
        if (next.at >= at) {
            return interpolate(previous.pose, next.pose, fraction(at - previous.at, next.at - previous.at));
        }
        previous = next;
    }
    return previous.pose;
}

fn interpolate(from: Pose, to: Pose, t: f32) Pose {
    const blend = t * t * (3 - 2 * t);
    var result: Pose = undefined;
    for (&result, from, to) |*part, first, last| {
        for (part, first, last) |*field, a, b| field.* = a + (b - a) * blend;
    }
    return result;
}

const round = 0.55228475;
const eye = [_]canvas.PathElement{
    .{ .verb = .move_to, .points = .{ .{ .x = 1 }, .{}, .{} } },
    .{ .verb = .cubic_to, .points = .{ .{ .x = 1, .y = round }, .{ .x = round, .y = 1 }, .{ .y = 1 } } },
    .{ .verb = .cubic_to, .points = .{ .{ .x = -round, .y = 1 }, .{ .x = -1, .y = round }, .{ .x = -1 } } },
    .{ .verb = .cubic_to, .points = .{ .{ .x = -1, .y = -round }, .{ .x = -round, .y = -1 }, .{ .y = -1 } } },
    .{ .verb = .cubic_to, .points = .{ .{ .x = round, .y = -1 }, .{ .x = 1, .y = -round }, .{ .x = 1 } } },
    .{ .verb = .close },
};

pub const Drawing = struct {
    commands: [9]canvas.CanvasCommand = undefined,
    len: usize = 0,

    pub fn displayList(self: *const Drawing) canvas.DisplayList {
        return .{ .commands = self.commands[0..self.len] };
    }

    fn push(self: *Drawing, command: canvas.CanvasCommand) void {
        self.commands[self.len] = command;
        self.len += 1;
    }
};

fn affine(transform: data.Transform) canvas.Affine {
    const x, const y, const degrees, const sx, const sy = transform;
    const radians = degrees * (std.math.pi / 180.0);
    const cosine = @cos(radians);
    const sine = @sin(radians);
    return .{ .a = cosine * sx, .b = sine * sx, .c = -sine * sy, .d = cosine * sy, .tx = x, .ty = y };
}

// Keep the returned Drawing alive while borrowing its commands. Use stable, unique IDs
// in body/left/right order. Geometry is shared across every pose and instance.
pub fn drawing(agent: Agent, pose: Pose, x: f32, y: f32, size: f32, ids: [3]u64) Drawing {
    return drawPose(data.art(agent), pose, .round, x, y, size, ids);
}

fn drawPose(art: data.Art, pose: Pose, mark: EyeMark, x: f32, y: f32, size: f32, ids: [3]u64) Drawing {
    var result: Drawing = .{};
    if (!std.math.isFinite(size) or !std.math.isFinite(x) or !std.math.isFinite(y) or size <= 0) return result;
    const unit = size / 116;
    const translate = canvas.Affine.translate;
    const scale = canvas.Affine.scale;
    const base = translate(x + 8 * unit, y + 5 * unit).multiply(scale(unit, unit));
    const body = base.multiply(translate(50, 53)).multiply(affine(pose[0])).multiply(translate(-50, -53));
    var restore = body.inverse() orelse return result;
    // Include the avatar slot in the SDK damage bounds as its paths are in SVG coordinates.
    result.push(.{ .push_clip = .{ .rect = .{ .x = x, .y = y, .width = size, .height = size } } });
    result.push(.{ .transform = body });
    result.push(.{ .fill_path = .{ .id = ids[0], .elements = art.path, .fill = .{ .color = art.fill } } });
    const eye_path: []const canvas.PathElement = switch (mark) {
        .round => &eye,
        .cross => &data.eye_cross,
        .smile => &data.eye_smile,
    };
    for ([_]f32{ -13, 13 }, pose[1..], ids[1..]) |offset, transform, id| {
        if (transform[4] <= 0) continue;
        const shape = body.multiply(translate(art.center_x + offset, art.center_y)).multiply(affine(transform)).multiply(scale(2.45, 2.45));
        const undo = shape.inverse() orelse continue;
        result.push(.{ .transform = restore.multiply(shape) });
        result.push(.{ .fill_path = .{ .id = id, .elements = eye_path, .fill = .{ .color = art.ink } } });
        restore = undo;
    }
    result.push(.{ .transform = restore });
    result.push(.pop_clip);
    return result;
}
