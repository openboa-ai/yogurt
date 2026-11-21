const sdk = @import("native_sdk");
const canvas = sdk.canvas;
const vector = @import("yogurt/models/agent-vector.zig");

pub const side = 96;
pub const image_id: u32 = 2101;

// Rasterize the same vector playback used by the agent component into one
// small transparent image. The image registry copies these pixels.
pub fn render(playback: vector.Playback, now_ms: u64, reduced_motion: bool, pixels: *[side * side * 4]u8) !void {
    const drawing = playback.draw(now_ms, reduced_motion, 0, 0, side, .{ 1, 2, 3 });
    var commands: [32]canvas.RenderCommand = undefined;
    var batches: [32]canvas.RenderBatch = undefined;
    var resources: [32]canvas.RenderResource = undefined;
    var cache_entries: [32]canvas.RenderResourceCacheEntry = undefined;
    var cache_actions: [32]canvas.RenderResourceCacheAction = undefined;
    var glyphs: [0]canvas.GlyphAtlasEntry = .{};
    var changes: [32]canvas.DiffChange = undefined;
    const frame = try drawing.displayList().framePlan(null, .{
        .surface_size = sdk.geometry.SizeF.init(side, side),
    }, .{
        .render_commands = &commands,
        .render_batches = &batches,
        .resources = &resources,
        .resource_cache_entries = &cache_entries,
        .resource_cache_actions = &cache_actions,
        .glyph_atlas_entries = &glyphs,
        .changes = &changes,
    });
    const surface = try canvas.ReferenceRenderSurface.init(side, side, pixels);
    try surface.renderPass(frame.renderPass(), canvas.Color.rgba8(0, 0, 0, 0));
}
