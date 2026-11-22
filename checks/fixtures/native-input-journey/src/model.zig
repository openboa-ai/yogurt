const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");
const canvas = sdk.canvas;

const Mode = enum { text, search };
pub const Msg = union(enum) {
    show_text, show_search, edit: canvas.TextInputEvent,
    clear, toggle, open_choices, dismiss, choose_personal, choose_team, toggle_dark,
};
pub const Model = struct {
    mode: Mode = .text,
    title: canvas.TextBuffer(256) = .{},
    search: canvas.TextBuffer(256) = .{},
    enabled: bool = true,
    choices_open: bool = false,
    team: bool = false,
    dark: bool = false,
    pub const view_unbound = .{ "mode", "title", "search", "team", "dark" };
    pub fn text_mode(m: *const Model) bool { return m.mode == .text; }
    pub fn search_mode(m: *const Model) bool { return m.mode == .search; }
    pub fn text_value(m: *const Model) []const u8 { return m.title.text(); }
    pub fn search_value(m: *const Model) []const u8 { return m.search.text(); }
    pub fn choice_value(m: *const Model) []const u8 { return if (m.team) "Team" else "Personal"; }
    pub fn appearance_label(m: *const Model) []const u8 { return if (m.dark) "Dark appearance" else "Light appearance"; }
};
pub fn update(m: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    switch (msg) {
        .show_text => m.mode = .text,
        .show_search => m.mode = .search,
        .edit => |event| switch (m.mode) {
            .text => m.title.apply(event),
            .search => m.search.apply(event),
        },
        .clear => m.search.clear(),
        .toggle => m.enabled = !m.enabled,
        .open_choices => m.choices_open = !m.choices_open,
        .dismiss => m.choices_open = false,
        .choose_personal => { m.team = false; m.choices_open = false; },
        .choose_team => { m.team = true; m.choices_open = false; },
        .toggle_dark => m.dark = !m.dark,
    }
}
pub fn tokens(m: *const Model) sdk.canvas.DesignTokens {
    return theme.theme(m.dark, .neutral, false, false);
}
