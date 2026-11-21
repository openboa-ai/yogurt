const sdk = @import("native_sdk");
const theme = @import("yogurt/theme.zig");
const canvas = sdk.canvas;

const Mode = enum { text, search, otp };
pub const Msg = union(enum) {
    show_text, show_search, show_otp, edit: canvas.TextInputEvent,
    clear, activate, toggle, open_choices, dismiss, choose_personal, choose_team, toggle_dark,
};
pub const Model = struct {
    mode: Mode = .text,
    title: canvas.TextBuffer(256) = .{},
    search: canvas.TextBuffer(256) = .{},
    otp: canvas.TextBuffer(64) = .{},
    enabled: bool = true,
    choices_open: bool = false,
    team: bool = false,
    dark: bool = false,
    submitted: bool = false,
    pub const view_unbound = .{ "mode", "title", "search", "otp", "team", "dark", "submitted" };
    pub fn text_mode(m: *const Model) bool { return m.mode == .text; }
    pub fn search_mode(m: *const Model) bool { return m.mode == .search; }
    pub fn otp_mode(m: *const Model) bool { return m.mode == .otp; }
    pub fn text_value(m: *const Model) []const u8 { return m.title.text(); }
    pub fn search_value(m: *const Model) []const u8 { return m.search.text(); }
    pub fn otp_value(m: *const Model) []const u8 { return m.otp.text(); }
    pub fn otp_status(m: *const Model) []const u8 { return if (m.submitted) "Code submitted locally" else "Press Enter to submit locally"; }
    pub fn choice_value(m: *const Model) []const u8 { return if (m.team) "Team" else "Personal"; }
    pub fn appearance_label(m: *const Model) []const u8 { return if (m.dark) "Dark appearance" else "Light appearance"; }
};
pub fn update(m: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    switch (msg) {
        .show_text => m.mode = .text,
        .show_search => m.mode = .search,
        .show_otp => m.mode = .otp,
        .edit => |event| switch (m.mode) {
            .text => m.title.apply(event),
            .search => m.search.apply(event),
            .otp => { m.otp.apply(event); m.submitted = false; },
        },
        .clear => m.search.clear(),
        .activate => if (m.mode == .otp) { m.submitted = true; },
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
