const std = @import("std");
const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");

const Record = enum { a, b };
const Decision = struct { record: Record, revision: u32 };
const Receipt = struct { decision: Decision, id: []const u8 = "R-14" };

const Host = struct {
    request: ?Receipt = null,
    submissions: usize = 0,
    lookups: usize = 0,

    fn submit(host: *Host, decision: Decision) void {
        host.submissions += 1;
        host.request = .{ .decision = decision };
    }

    fn lookup(host: *Host, id: []const u8) ?u32 {
        const request = host.request orelse return null;
        if (!std.mem.eql(u8, id, request.id)) return null;
        host.lookups += 1;
        // The fixture reveals the effective result on the second read.
        return if (host.lookups >= 2) request.decision.revision + 1 else null;
    }
};

pub const Msg = union(enum) { select_a, select_b, close_record, open_choices, dismiss, confirm_current, lookup_original };

pub const Model = struct {
    selected: ?Record = null,
    open: bool = false,
    host: Host = .{},
    receipt: ?Receipt = null,
    effective_revision: ?u32 = null,

    pub fn show_list(m: *const Model) bool {
        return m.selected == null;
    }
    pub fn show_record(m: *const Model) bool {
        return m.selected != null;
    }
    pub fn brief_name(m: *const Model) []const u8 {
        return if (m.selected == .b) "Brief B" else "Brief A";
    }
    pub fn revision_name(m: *const Model) []const u8 {
        if (m.has_receipt() and m.effective_revision != null) return "Revision 10";
        return if (m.selected == .b) "Revision 9" else "Revision 7";
    }
    pub fn has_receipt(m: *const Model) bool {
        return if (m.receipt) |receipt| m.selected == receipt.decision.record else false;
    }
    pub fn can_submit(m: *const Model) bool {
        return m.selected != null and m.receipt == null;
    }
    pub fn dialog_open(m: *const Model) bool {
        return m.open;
    }
    pub fn unavailable(m: *const Model) bool {
        return !m.can_submit();
    }
    pub fn receipt_title(m: *const Model) []const u8 {
        return if (m.effective_revision != null) "Confirmed" else "Confirmation unavailable";
    }
    pub fn receipt_id(m: *const Model) []const u8 {
        return if (m.receipt) |receipt| receipt.id else "";
    }
    pub fn receipt_detail(m: *const Model) []const u8 {
        return if (m.effective_revision != null) "The brief was returned for revision." else "The connection closed before confirmation.";
    }
    pub fn progress_label(m: *const Model) []const u8 {
        return if (m.has_receipt() and m.effective_revision != null) "Review progress · 2 of 2" else "Review progress · 1 of 2";
    }
    pub fn progress_amount(m: *const Model) f32 {
        return if (m.has_receipt() and m.effective_revision != null) 1.0 else 0.5;
    }
    pub fn submission_label(m: *const Model) []const u8 {
        return if (m.host.submissions == 0) "Recorded commands: 0" else "Recorded commands: 1";
    }
};

fn apply(m: *Model, msg: Msg) void {
    switch (msg) {
        .select_a => m.selected = .a,
        .select_b => m.selected = .b,
        .close_record => {
            m.selected = null;
            m.open = false;
        },
        .open_choices => m.open = m.can_submit(),
        .dismiss => m.open = false,
        .confirm_current => {
            if (!m.open or !m.can_submit()) return;
            m.open = false;
            const selected = m.selected.?;
            const decision: Decision = .{ .record = selected, .revision = if (selected == .a) 7 else 9 };
            m.host.submit(decision);
            // The client has its original request ID but no effective result yet.
            m.receipt = .{ .decision = decision };
        },
        .lookup_original => {
            if (!m.has_receipt() or m.effective_revision != null) return;
            m.effective_revision = m.host.lookup(m.receipt_id());
        },
    }
}

pub fn update(m: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    apply(m, msg);
}

pub fn tokens(_: *const Model) sdk.canvas.DesignTokens {
    return theme.theme(false, .neutral, false, false);
}

test "cancel and recover the original decision" {
    var model: Model = .{};
    for ([_]Msg{ .select_a, .open_choices, .dismiss, .confirm_current }) |msg| apply(&model, msg);
    try std.testing.expectEqual(@as(usize, 0), model.host.submissions);
    for ([_]Msg{ .close_record, .select_b, .open_choices, .confirm_current, .confirm_current }) |msg| apply(&model, msg);
    try std.testing.expectEqual(@as(usize, 1), model.host.submissions);
    try std.testing.expectEqual(Decision{ .record = .b, .revision = 9 }, model.host.request.?.decision);
    try std.testing.expectEqual(@as(?u32, null), model.effective_revision);
    for ([_]Msg{ .close_record, .select_a, .lookup_original, .close_record, .select_b }) |msg| apply(&model, msg);
    try std.testing.expectEqual(@as(usize, 0), model.host.lookups);
    try std.testing.expectEqualStrings("R-14", model.receipt_id());
    apply(&model, .lookup_original);
    try std.testing.expectEqual(@as(?u32, null), model.effective_revision);
    apply(&model, .lookup_original);
    try std.testing.expectEqual(@as(?u32, 10), model.effective_revision);
    try std.testing.expectEqual(@as(usize, 1), model.host.submissions);
}
