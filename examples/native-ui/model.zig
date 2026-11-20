const sdk = @import("native_sdk");
const yogurt = @import("yogurt/theme.zig");
pub const Msg = union(enum) { activate, undo, toggle, toggle_dark, change_material };
pub const Model = struct {
    saved: bool = false,
    dates: bool = true,
    dark: bool = false,
    material: yogurt.Material = .neutral,
    pub const view_unbound = .{ "saved", "material" };
    pub fn save_status(m: *const Model) []const u8 {
        return if (m.saved) "View saved." else "Ready to save.";
    }
    pub fn material_name(m: *const Model) []const u8 {
        return switch (m.material) {
            .neutral => "Neutral surface",
            .paper => "Paper surface",
            .mist => "Mist surface",
        };
    }
};
pub fn update(m: *Model, msg: Msg, _: *sdk.Effects(Msg)) void {
    switch (msg) {
        .activate => m.saved = true,
        .undo => m.saved = false,
        .toggle => m.dates = !m.dates,
        .toggle_dark => m.dark = !m.dark,
        .change_material => m.material = switch (m.material) {
            .neutral => .paper,
            .paper => .mist,
            .mist => .neutral,
        },
    }
}
pub fn tokens(m: *const Model) sdk.canvas.DesignTokens {
    return yogurt.theme(m.dark, m.material, false, false);
}
