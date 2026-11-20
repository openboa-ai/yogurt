const std = @import("std");
const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");

const Reading = struct { id: u32, time: []const u8, value: ?f32 };
const Row = struct { id: u32, time: []const u8, value: []const u8 };
const observations = [_]Reading{
    .{ .id = 9, .time = "09:00", .value = 0 },
    .{ .id = 10, .time = "10:00", .value = null },
    .{ .id = 11, .time = "11:00", .value = 0.16 },
};
const chart_samples = blk: {
    var values: [observations.len]f32 = undefined;
    for (observations, 0..) |reading, i| values[i] = reading.value orelse std.math.nan(f32);
    break :blk values;
};
const table_rows = blk: {
    var values: [observations.len]Row = undefined;
    for (observations, 0..) |reading, i| {
        values[i] = .{
            .id = reading.id,
            .time = reading.time,
            .value = if (reading.value) |value| std.fmt.comptimePrint("{d}", .{value}) else "No reading",
        };
    }
    break :blk values;
};

const Projection = struct {
    samples: []const f32 = &chart_samples,
    rows: []const Row = &table_rows,
};

pub const Msg = union(enum) { open_readings, withdraw_access };

pub const Model = struct {
    projection: ?Projection = .{},
    open: bool = false,

    pub fn can_read(model: *const Model) bool {
        return model.projection != null;
    }
    pub fn show_readings(model: *const Model) bool {
        return model.can_read() and model.open;
    }
    pub fn samples(model: *const Model) []const f32 {
        return if (model.projection) |projection| projection.samples else &.{};
    }
    pub fn reading_rows(model: *const Model) []const Row {
        return if (model.projection) |projection| projection.rows else &.{};
    }
};

fn apply(model: *Model, msg: Msg) void {
    switch (msg) {
        .open_readings => model.open = model.can_read(),
        .withdraw_access => {
            model.projection = null;
            model.open = false;
        },
    }
}

pub fn update(model: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    apply(model, msg);
}

pub fn tokens(_: *const Model) sdk.canvas.DesignTokens {
    return theme.theme(false, .neutral, false, false);
}

test "an observed zero and a gap are distinct until access is withdrawn" {
    var model: Model = .{};
    try std.testing.expectEqual(@as(f32, 0), model.samples()[0]);
    try std.testing.expect(std.math.isNan(model.samples()[1]));
    try std.testing.expectEqual(@as(f32, 0.16), model.samples()[2]);
    try std.testing.expectEqualStrings("0", model.reading_rows()[0].value);
    try std.testing.expectEqualStrings("No reading", model.reading_rows()[1].value);
    try std.testing.expectEqualStrings("0.16", model.reading_rows()[2].value);
    apply(&model, .open_readings);
    try std.testing.expect(model.show_readings());
    apply(&model, .withdraw_access);
    apply(&model, .open_readings);
    try std.testing.expect(!model.show_readings());
    try std.testing.expectEqual(@as(usize, 0), model.samples().len);
    try std.testing.expectEqual(@as(usize, 0), model.reading_rows().len);
}
