const std = @import("std");
const gallery = @import("gallery-generated.zig");
const ui_tokens = @import("yogurt/tokens.zig");

/// The host owns the selected component; selecting a family selects its first item.
pub fn sidebar(ui: *gallery.Ui, model: *const gallery.Model) gallery.Ui.Node {
    if (gallery.names.len == 0) return ui.text(.{}, "No components");
    const selected: usize = if (model.gallery_selected < gallery.names.len) model.gallery_selected else 0;
    const current_family = gallery.families[selected];
    const rows = ui.arena.alloc(gallery.Ui.Node, gallery.names.len * 2) catch
        return ui.text(.{}, "Components unavailable");
    var count: usize = 0;
    for (gallery.families, 0..) |family, first| {
        var seen = false;
        for (gallery.families[0..first]) |prior| {
            if (std.mem.eql(u8, family, prior)) {
                seen = true;
                break;
            }
        }
        if (seen) continue;
        const expanded = std.mem.eql(u8, family, current_family);
        rows[count] = ui.listItem(.{
            .height = ui_tokens.size_compact,
            .on_press = .{ .gallery_select = @intCast(first) },
            .icon = if (expanded) "chevron-down" else "chevron-right",
        }, family);
        count += 1;
        if (!expanded) continue;
        for (gallery.families, 0..) |item_family, position| {
            if (!std.mem.eql(u8, family, item_family)) continue;
            rows[count] = ui.row(.{}, .{
                ui.column(.{ .width = 32 }, .{}),
                ui.listItem(.{
                    .height = ui_tokens.size_compact,
                    .grow = 1,
                    .on_press = .{ .gallery_select = @intCast(position) },
                    .selected = position == selected,
                }, gallery.names[position]),
            });
            count += 1;
        }
    }
    return ui.scroll(.{ .width = 224, .semantics = .{ .label = "Component list" } }, .{
        ui.column(.{ .padding = 12, .gap = 2 }, rows[0..count]),
    });
}
