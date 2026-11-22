const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");

pub const Msg = union(enum) {
    toggle,
    choose_tab_one,
    choose_tab_two,
    choose_day,
    choose_week,
    select_sidebar_item: u32,
    open_dialog,
    dismiss,
};

pub const Model = struct {
    expanded: bool = false,
    tab_two: bool = false,
    week: bool = false,
    sidebar_id: u32 = 1,
    dialog_open: bool = false,
    first_id: u32 = 1,
    second_id: u32 = 2,

    pub fn tab_one(m: *const Model) bool { return !m.tab_two; }
    pub fn day(m: *const Model) bool { return !m.week; }
    pub fn first_selected(m: *const Model) bool { return m.sidebar_id == 1; }
    pub fn second_selected(m: *const Model) bool { return m.sidebar_id == 2; }
    pub fn tab_label(m: *const Model) []const u8 { return if (m.tab_two) "Tab: Activity" else "Tab: Overview"; }
    pub fn range_label(m: *const Model) []const u8 { return if (m.week) "Range: Week" else "Range: Day"; }
    pub fn sidebar_label(m: *const Model) []const u8 { return if (m.sidebar_id == 2) "Destination: Notes" else "Destination: Home"; }
};

pub fn update(m: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    switch (msg) {
        .toggle => m.expanded = !m.expanded,
        .choose_tab_one => m.tab_two = false,
        .choose_tab_two => m.tab_two = true,
        .choose_day => m.week = false,
        .choose_week => m.week = true,
        .select_sidebar_item => |id| if (id == 1 or id == 2) { m.sidebar_id = id; },
        .open_dialog => m.dialog_open = true,
        .dismiss => m.dialog_open = false,
    }
}

pub fn tokens(_: *const Model) sdk.canvas.DesignTokens {
    return theme.theme(false, .neutral, false, false);
}
