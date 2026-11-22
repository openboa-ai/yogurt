const std = @import("std");
const sdk = @import("native_sdk");
const gallery = @import("gallery-generated.zig");
const app = @import("main.zig");
const agent_preview = @import("agent-preview.zig");
const agent_vector = @import("yogurt/models/agent-vector.zig");

test "agent preview uses transparent and changing approved poses" {
    var first: [agent_preview.side * agent_preview.side * 4]u8 = undefined;
    var next: [agent_preview.side * agent_preview.side * 4]u8 = undefined;
    const playback = agent_vector.Playback.init(.kai, 72, .working, 0);
    try agent_preview.render(playback, 0, false, &first);
    try agent_preview.render(playback, 1200, false, &next);
    try std.testing.expectEqual(@as(u8, 0), first[3]);
    var has_visible_pixel = false;
    var index: usize = 3;
    while (index < first.len) : (index += 4) {
        if (first[index] > 0) { has_visible_pixel = true; break; }
    }
    try std.testing.expect(has_visible_pixel);
    try std.testing.expect(!std.mem.eql(u8, &first, &next));
}

test "agent controls respect reduced motion and preserve it on navigation" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "agent-avatar")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    app.update(&model, .{ .agent_set_state = 2 }, &effects);
    try std.testing.expectEqual(agent_vector.State.working, model.agent_pending.?);
    app.update(&model, .{ .agent_set_kind = 1 }, &effects);
    try std.testing.expectEqual(agent_vector.Agent.sol, model.agent_kind);
    try std.testing.expectEqual(agent_vector.State.working, model.agent_pending.?);
    app.update(&model, .{ .agent_reduce_motion = true }, &effects);
    try std.testing.expect(model.agent_reduced_motion);
    app.update(&model, .{ .gallery_select = 0 }, &effects);
    try std.testing.expect(model.agent_reduced_motion);
}

test "agent compositions keep independent identities and avoid substitute images" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "agent-workspace")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    try std.testing.expectEqualStrings("Kai", model.agents[0].title);
    try std.testing.expectEqualStrings("Sol", model.agents[1].title);
    app.update(&model, .{ .select_agent = 2 }, &effects);
    try std.testing.expectEqualStrings("Sol", model.agent_name);
    try std.testing.expect(model.agents[1].selected);
    try std.testing.expectEqual(@as(u32, 0), model.agent_image);
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "agent-profile")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    app.update(&model, .pick_profile_sol, &effects);
    try std.testing.expect(model.profile_sol);
    try std.testing.expectEqual(@as(u32, 0), model.profile_image);
}

test "catalog list and fixture state stay bounded" {
    try std.testing.expect(gallery.component_ids.len > 0);
    try std.testing.expect(gallery.block_ids.len > 0);
    try std.testing.expectEqual(gallery.component_ids.len + gallery.block_ids.len, gallery.names.len);
    try std.testing.expectEqual(gallery.names.len, gallery.ids.len);
    for (gallery.component_ids, 0..) |id, index| try std.testing.expectEqualStrings(id, gallery.ids[index]);
    for (gallery.block_ids, 0..) |id, index| try std.testing.expectEqualStrings(id, gallery.ids[gallery.component_ids.len + index]);
    for (gallery.ids, 0..) |id, index| for (gallery.ids[index + 1 ..]) |later| try std.testing.expect(!std.mem.eql(u8, id, later));
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    model.project_picture = 2001;
    model.sourdough_picture = 2002;
    model.meatball_picture = 0;
    model.project_missing = false;
    model.sourdough_missing = false;
    model.meatball_missing = true;
    app.update(&model, .gallery_appearance, &effects);
    app.update(&model, .toggle, &effects);
    try std.testing.expect(!model.enabled);
    const last: u32 = @intCast(gallery.names.len - 1);
    app.update(&model, .{ .gallery_select = last }, &effects);
    try std.testing.expectEqual(last, model.gallery_selected);
    try std.testing.expectEqual(@as(u32, 2001), model.project_picture);
    try std.testing.expectEqual(@as(u32, 2002), model.sourdough_picture);
    try std.testing.expectEqualStrings(gallery.project_sidebar_title, model.project_name);
    try std.testing.expectEqual(@as(u32, 0), model.project_image);
    try std.testing.expectEqual(@as(u32, 0), model.meatball_picture);
    try std.testing.expect(!model.project_missing);
    try std.testing.expect(!model.sourdough_missing);
    try std.testing.expect(model.meatball_missing);
    try std.testing.expect(model.gallery_dark);
    try std.testing.expect(model.enabled);
    app.update(&model, .{ .gallery_select = last + 1 }, &effects);
    try std.testing.expectEqual(last, model.gallery_selected);
    app.update(&model, .gallery_next, &effects);
    try std.testing.expectEqual(last, model.gallery_selected);
    app.update(&model, .toggle, &effects);
    app.update(&model, .gallery_previous, &effects);
    try std.testing.expectEqual(last - 1, model.gallery_selected);
    try std.testing.expect(model.enabled);
    app.update(&model, .{ .gallery_select = 0 }, &effects);
    app.update(&model, .gallery_previous, &effects);
    try std.testing.expectEqual(@as(u32, 0), model.gallery_selected);
}

test "fixture controls update bounded local state" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    app.update(&model, .increment, &effects);
    try std.testing.expectEqualStrings("1", model.gallery_count_text);
    try std.testing.expect(!model.at_first);
    app.update(&model, .increment, &effects);
    app.update(&model, .increment, &effects);
    try std.testing.expectEqualStrings("2", model.gallery_count_text);
    try std.testing.expect(model.at_last);
    app.update(&model, .decrement, &effects);
    try std.testing.expectEqualStrings("1", model.gallery_count_text);
    app.update(&model, .{ .gallery_select = 1 }, &effects);
    app.update(&model, .next_page, &effects);
    try std.testing.expectEqualStrings("2 of 2", model.gallery_page_text);
    try std.testing.expect(model.gallery_page_two);
    try std.testing.expectEqualStrings("December 2026", model.month_label);
    try std.testing.expectEqual(@as(usize, 31), model.days.len);
    app.update(&model, .previous_page, &effects);
    try std.testing.expectEqualStrings("1 of 2", model.gallery_page_text);
    try std.testing.expectEqual(@as(usize, 30), model.days.len);
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "select")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    app.update(&model, .open_choices, &effects);
    try std.testing.expect(model.gallery_picker_open);
    app.update(&model, .{ .choose = 2 }, &effects);
    try std.testing.expect(!model.gallery_picker_open);
    try std.testing.expectEqualStrings("Meatball", model.value);
    app.update(&model, .{ .edit_first = .{ .insert_text = "X" } }, &effects);
    app.update(&model, .{ .edit_last = .{ .insert_text = "Y" } }, &effects);
    try std.testing.expectEqualStrings("415X", model.first_value);
    try std.testing.expectEqualStrings("0182Y", model.last_value);
}

test "sample choices update and reset independently" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    app.update(&model, .{ .gallery_select_option = 2 }, &effects);
    try std.testing.expect(!model.gallery_first_selected);
    try std.testing.expect(model.gallery_second_selected);
    app.update(&model, .{ .gallery_select_option = 3 }, &effects);
    try std.testing.expect(model.gallery_second_selected);
    app.update(&model, .{ .gallery_toggle_option = 2 }, &effects);
    try std.testing.expect(model.gallery_first_checked);
    try std.testing.expect(model.gallery_second_checked);
    app.update(&model, .{ .gallery_toggle_option = 1 }, &effects);
    try std.testing.expect(!model.gallery_first_checked);
    try std.testing.expect(model.gallery_second_checked);
    app.update(&model, .{ .gallery_select = 0 }, &effects);
    try std.testing.expect(model.gallery_first_selected);
    try std.testing.expect(!model.gallery_second_selected);
    try std.testing.expect(model.gallery_first_checked);
    try std.testing.expect(!model.gallery_second_checked);
    app.update(&model, .toggle_sidebar_group, &effects);
    try std.testing.expect(!model.sidebar_group_open);
    app.update(&model, .toggle_sidebar_group, &effects);
    try std.testing.expect(model.sidebar_group_open);
    app.update(&model, .{ .select_sidebar_item = 2 }, &effects);
    try std.testing.expect(!model.sidebar_destinations[0].selected);
    try std.testing.expect(model.sidebar_destinations[1].selected);
}

test "dates, menu and text update local state" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "date-picker")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    try std.testing.expect(!model.is_open);
    app.update(&model, .open_choices, &effects);
    try std.testing.expect(model.is_open);
    app.update(&model, .{ .choose = 18 }, &effects);
    try std.testing.expectEqualStrings("Nov 18, 2026", model.gallery_date_value);
    try std.testing.expect(model.days[17].selected);
    try std.testing.expect(!model.is_open);
    app.update(&model, .next_page, &effects);
    try std.testing.expectEqual(@as(usize, 31), model.days.len);
    app.update(&model, .{ .choose = 31 }, &effects);
    try std.testing.expectEqualStrings("Dec 31, 2026", model.gallery_date_value);
    app.update(&model, .{ .edit = .{ .insert_text = "X" } }, &effects);
    app.update(&model, .clear, &effects);
    try std.testing.expectEqualStrings("", model.value);
    app.update(&model, .{ .open_menu = 1 }, &effects);
    try std.testing.expect(model.is_open);
    app.update(&model, .dismiss, &effects);
    try std.testing.expect(!model.is_open);
}

test "drawer requires a completed downward gesture past its threshold" {
    const surface = @import("yogurt/drawer-surface.zig");
    try std.testing.expect(!surface.shouldDismiss(.{ .y = 90 }));
    try std.testing.expect(!surface.shouldDismiss(.{ .phase = 1, .y = -90 }));
    try std.testing.expect(!surface.shouldDismiss(.{ .phase = 1, .y = 63 }));
    try std.testing.expect(!surface.shouldDismiss(.{ .phase = 2, .y = 90 }));
    try std.testing.expect(surface.shouldDismiss(.{ .phase = 1, .y = 64 }));
}

test "progress publishes its target while its fill is still at the prior value" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "progress")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    app.update(&model, .advance_progress, &effects);
    try std.testing.expectEqual(@as(f32, 0.4), model.gallery_progress_fraction);
    try std.testing.expectEqual(@as(f32, 0.2), model.interface_motion.value);
    const middle = model.interface_motion.start_ns + 80 * std.time.ns_per_ms;
    app.update(&model, .{ .interface_tick = middle }, &effects);
    try std.testing.expect(model.interface_motion.value > 0.2 and model.interface_motion.value < 0.4);
    app.update(&model, .{ .agent_reduce_motion = true }, &effects);
    try std.testing.expectEqual(model.gallery_progress_fraction, model.interface_motion.value);
    try std.testing.expect(!model.interface_motion.active());
}

test "taking over a returning drawer retains its current offset" {
    var model = app.initialModel();
    var effects: sdk.Effects(gallery.Msg) = .{ .allocator = std.testing.allocator };
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "drawer")) app.update(&model, .{ .gallery_select = @intCast(index) }, &effects);
    }
    app.update(&model, .open_choices, &effects);
    model.interface_motion.snap(0.5);
    app.update(&model, .{ .drawer_drag = .{ .phase = 0, .y = 6 } }, &effects);
    try std.testing.expectEqual(@as(f32, 14), model.drawer_distance);
    app.update(&model, .{ .drawer_drag = .{ .phase = 1, .y = 6 } }, &effects);
    try std.testing.expect(model.is_open);
    try std.testing.expect(model.interface_motion.active());
    model.interface_motion.value = 0.5;
    app.update(&model, .{ .drawer_drag = .{ .phase = 0, .y = 2 } }, &effects);
    try std.testing.expectEqual(@as(f32, 9), model.drawer_distance);
    try std.testing.expect(!model.interface_motion.active());
}

test "ordinary controls draw no perimeter across pointer states and retain keyboard focus" {
    const canvas = sdk.canvas;
    const kit_theme = @import("yogurt/theme.zig");
    const states = [_]canvas.WidgetState{
        .{}, .{ .hovered = true }, .{ .pressed = true }, .{ .selected = true }, .{ .disabled = true },
    };
    const variants = [_]canvas.WidgetVariant{ .default, .primary, .secondary, .outline, .ghost, .destructive };
    const Frame = sdk.geometry.RectF;
    for ([_]bool{ false, true }) |dark| {
        const tokens = kit_theme.theme(dark, .neutral, false, false);
        try std.testing.expectEqual(@as(f32, 0), tokens.colors.border.a);
        for (variants) |variant| {
            for (states) |state| {
                var commands: [32]canvas.CanvasCommand = undefined;
                var builder = canvas.Builder.init(&commands);
                try canvas.emitWidgetTree(&builder, .{
                    .id = 1, .kind = .button, .variant = variant, .state = state,
                    .frame = Frame.init(8, 8, 124, 36), .text = "Save view",
                }, tokens);
                for (builder.displayList().commands) |command| {
                    if (command == .stroke_rect) {
                        try std.testing.expect(command.stroke_rect.stroke.width == 0 or
                            command.stroke_rect.stroke.fill.color.a == 0);
                    }
                }
            }
        }
        var commands: [32]canvas.CanvasCommand = undefined;
        var builder = canvas.Builder.init(&commands);
        try canvas.emitWidgetTree(&builder, .{
            .id = 1, .kind = .button, .variant = .primary, .state = .{ .focused = true },
            .frame = Frame.init(8, 8, 124, 36), .text = "Save view",
        }, tokens);
        var found_focus = false;
        for (builder.displayList().commands) |command| {
            if (command == .stroke_rect and command.stroke_rect.stroke.width == tokens.stroke.focus) found_focus = true;
        }
        try std.testing.expect(found_focus);
    }
}
