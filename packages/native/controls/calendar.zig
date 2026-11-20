const std = @import("std");

pub const Day = struct {
    id: u32,
    title: []const u8,
    selected: bool = false,
    disabled: bool = false,
};

/// Year-month-day as YYYYMMDD. Bounds and selection use this same civil key.
pub const Month = struct {
    year: u16,
    month: u8,

    pub fn init(year: u16, month: u8) ?Month {
        if (year < 1 or year > 9999 or month < 1 or month > 12) return null;
        return .{ .year = year, .month = month };
    }

    pub fn offset(self: Month, delta: i32) ?Month {
        const index = (@as(i64, self.year) - 1) * 12 + self.month - 1 + delta;
        if (index < 0 or index >= 9999 * 12) return null;
        return .{ .year = @intCast(@divTrunc(index, 12) + 1), .month = @intCast(@mod(index, 12) + 1) };
    }

    pub fn days(self: Month, selected: ?u32, earliest: ?u32, latest: ?u32) [42]Day {
        const labels = [_][]const u8{ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31" };
        const offsets = [_]u8{ 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4 };
        const y: u32 = @as(u32, self.year) - @intFromBool(self.month < 3);
        const start = (y + y / 4 - y / 100 + y / 400 + offsets[self.month - 1] + 1) % 7;
        const leap = self.year % 4 == 0 and (self.year % 100 != 0 or self.year % 400 == 0);
        const counts = [_]u8{ 31, if (leap) 29 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
        var cells: [42]Day = undefined;
        for (0..cells.len) |i| {
            if (i < start or i >= start + counts[self.month - 1]) {
                cells[i] = .{ .id = 0x80000000 + @as(u32, @intCast(i)), .title = "", .disabled = true };
            } else {
                const day: u32 = @intCast(i - start + 1);
                const key = @as(u32, self.year) * 10000 + @as(u32, self.month) * 100 + day;
                cells[i] = .{ .id = key, .title = labels[day - 1], .selected = selected == key, .disabled = key < (earliest orelse 0) or key > (latest orelse 99991231) };
            }
        }
        return cells;
    }
};
test "civil bounds, leap centuries and month navigation" {
    const leap = Month.init(2024, 2).?;
    const cells = leap.days(20240229, 20240202, 20240229);
    try std.testing.expect(cells[4].disabled and cells[4].id == 20240201);
    try std.testing.expect(cells[32].selected and cells[32].id == 20240229);
    try std.testing.expect(cells[33].disabled);
    try std.testing.expect(Month.init(1900, 2).?.days(null, null, null)[32].disabled);
    try std.testing.expectEqual(Month.init(2027, 1).?, Month.init(2026, 12).?.offset(1).?);
    try std.testing.expect(Month.init(1, 1).?.offset(-1) == null);
}
