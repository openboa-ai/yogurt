const std = @import("std");

pub const Mode = enum { number, alphabet, private };
pub const Key = struct { id: u32, title: []const u8, disabled: bool = false };
pub const Layout = struct {
    cells: [48]Key = undefined,
    len: usize = 0,
    columns: usize,
    pub fn keys(self: *const Layout) []const Key {
        return self.cells[0..self.len];
    }
    fn add(self: *Layout, key: Key) void {
        self.cells[self.len] = key;
        self.len += 1;
    }
};
/// Supply four fresh random words when opening private entry. No entered value is stored here.
pub fn layout(mode: Mode, uppercase: bool, random: [4]u32) Layout {
    const rows = if (uppercase) [_][]const u8{ "1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM" } else [_][]const u8{ "1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm" };
    var result = Layout{ .columns = if (mode == .number) 3 else if (mode == .private) 11 else 10 };
    if (mode == .number) {
        for (rows[0], 0..) |ch, i| result.add(.{ .id = ch, .title = rows[0][i..][0..1] });
        return result;
    }
    for (rows, 0..) |row, index| {
        if (mode == .alphabet and index == 0) continue;
        const gap = if (mode == .private) random[index] % (row.len + 1) else row.len;
        var pos: usize = 0;
        for (0..result.columns) |col| {
            if ((mode == .private and col == gap) or pos == row.len) {
                result.add(.{ .id = 0x80000000 + @as(u32, @intCast(result.len)), .title = "", .disabled = true });
            } else {
                result.add(.{ .id = row[pos], .title = row[pos..][0..1] });
                pos += 1;
            }
        }
    }
    return result;
}
test "private layouts retain every alphanumeric key and change spacer positions" {
    const a = layout(.private, false, .{ 0, 1, 2, 3 });
    const b = layout(.private, false, .{ 2, 3, 4, 5 });
    var enabled: usize = 0;
    for (a.keys()) |k| {
        if (!k.disabled) enabled += 1;
    }
    try std.testing.expectEqual(@as(usize, 36), enabled);
    try std.testing.expect(a.cells[0].disabled and !b.cells[0].disabled);
    try std.testing.expectEqual(@as(usize, 10), layout(.number, false, .{ 0, 0, 0, 0 }).len);
}
