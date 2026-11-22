const std = @import("std");
const sdk = @import("native_sdk");
const runner = @import("runner");
const gallery = @import("gallery-generated.zig");
const navigation = @import("navigation.zig");
const workspace_fixtures = @import("workspace-fixtures.zig");
const motion = @import("yogurt/interface-motion.zig");
const drawer_surface = @import("yogurt/drawer-surface.zig");
const layout_tokens = @import("yogurt/tokens.zig");
const precision = @import("yogurt/precision-inputs.zig");
const theme = @import("yogurt/theme.zig");
const agent_vector = @import("yogurt/models/agent-vector.zig");
const agent_preview = @import("agent-preview.zig");
const canvas = sdk.canvas;

pub const panic = std.debug.FullPanic(sdk.debug.capturePanic);
pub const Model = gallery.Model;
pub const Msg = gallery.Msg;
pub const AppUi = gallery.Ui;
const app_name = "yogurt-native-guide";
const title = "Yogurt components";
const permissions = [_][]const u8{ sdk.security.permission_command, sdk.security.permission_view };
const views = [_]sdk.ShellView{.{ .label = "main-canvas", .kind = .gpu_surface, .fill = true,
    .role = title, .accessibility_label = title, .gpu_backend = .metal, .gpu_pixel_format = .bgra8_unorm,
    .gpu_present_mode = .timer, .gpu_alpha_mode = .@"opaque", .gpu_color_space = .srgb, .gpu_vsync = true }};
const windows = [_]sdk.ShellWindow{.{ .label = "main", .title = title, .width = 900, .height = 650, .views = &views }};

pub fn initialModel() Model {
    var model: Model = .{};
    for (gallery.ids, 0..) |id, index| {
        if (std.mem.eql(u8, id, "button")) {
            model.gallery_selected = @intCast(index);
            break;
        }
    }
    return model;
}

fn registerProjectMark(m: *Model, fx: *sdk.Effects(Msg)) void {
    if (fx.registerImageBytes(2000, @embedFile("yogurt-guide-openboa.png"))) |_| {
        m.brand_picture = 2000;
    } else |_| { m.brand_picture = 0; }
    if (fx.registerImageBytes(2001, @embedFile("yogurt-guide-yogurt.png"))) |_| {
        m.project_picture = 2001;
        m.project_missing = false;
    } else |_| { m.project_picture = 0; m.project_missing = true; }
    if (fx.registerImageBytes(2002, @embedFile("yogurt-guide-sourdough.png"))) |_| {
        m.sourdough_picture = 2002;
        m.project_image = 2002;
        m.sourdough_missing = false;
    } else |_| { m.sourdough_picture = 0; m.project_image = 0; m.sourdough_missing = true; }
    if (fx.registerImageBytes(2003, @embedFile("yogurt-guide-meatball.png"))) |_| {
        m.meatball_picture = 2003;
        m.meatball_missing = false;
    } else |_| { m.meatball_picture = 0; m.meatball_missing = true; }
}

fn syncCount(m: *Model) void {
    m.gallery_count_text = switch (m.gallery_count) { 0 => "0", 1 => "1", else => "2" };
    m.at_first = m.gallery_count == 0;
    m.at_last = m.gallery_count == 2;
}

fn syncPage(m: *Model) void {
    m.gallery_page_one = m.gallery_page == 0;
    m.gallery_page_two = !m.gallery_page_one;
    m.gallery_page_text = if (m.gallery_page_one) "1 of 2" else "2 of 2";
    m.month_label = if (m.gallery_page_one) "November 2026" else "December 2026";
    m.days = if (m.gallery_page_one) &gallery.november_days else &gallery.december_days;
    m.at_first = m.gallery_page_one;
    m.at_last = m.gallery_page_two;
}

fn changePage(m: *Model, page: u8) void {
    m.gallery_page = page;
    syncPage(m);
    if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "carousel")) {
        animateEntrance(m, layout_tokens.travel_ms);
    }
    m.gallery_status = "Sample page changed; dates are illustrative";
}

fn syncSidebar(m: *Model) void {
    const is_agent = std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar");
    const is_project = std.mem.eql(u8, gallery.ids[m.gallery_selected], "project-sidebar");
    const rows = if (is_project) m.gallery_project_destinations[0..] else if (is_agent) m.gallery_agent_choices[0..] else m.gallery_sidebar_choices[0..];
    var count: usize = 0;
    for (rows) |row| {
        if (std.ascii.findIgnoreCase(row.title, m.sidebar_query) == null) continue;
        m.gallery_sidebar_filtered[count] = row;
        count += 1;
    }
    if (m.gallery_sidebar_added and std.ascii.findIgnoreCase("New sample view", m.sidebar_query) != null) {
        m.gallery_sidebar_filtered[count] = .{ .id = if (is_project) 5 else 3, .title = "New sample view", .selected = m.gallery_sidebar_new_selected };
        count += 1;
    }
    m.sidebar_destinations = m.gallery_sidebar_filtered[0..count];
}

fn syncComposerAttachments(m: *Model) void {
    var count: usize = 0;
    for (m.gallery_choices, m.gallery_composer_mask) |choice, shown| {
        if (!shown) continue;
        m.gallery_composer_visible[count] = choice;
        count += 1;
    }
    m.composer_attachments = m.gallery_composer_visible[0..count];
}

fn selectComponent(m: *Model, index: u32) void {
    if (index >= gallery.names.len) return;
    const dark = m.gallery_dark;
    const reduced_motion = m.agent_reduced_motion;
    const show_list = m.gallery_list_open;
    const brand_picture = m.brand_picture;
    const project_picture = m.project_picture;
    const sourdough_picture = m.sourdough_picture;
    const meatball_picture = m.meatball_picture;
    const project_missing = m.project_missing;
    const sourdough_missing = m.sourdough_missing;
    const meatball_missing = m.meatball_missing;
    m.* = .{};
    m.agent_reduced_motion = reduced_motion;
    m.brand_picture = brand_picture;
    m.project_picture = project_picture;
    m.sourdough_picture = sourdough_picture;
    m.project_image = sourdough_picture;
    m.meatball_picture = meatball_picture;
    m.project_missing = project_missing;
    m.sourdough_missing = sourdough_missing;
    m.meatball_missing = meatball_missing;
    m.gallery_selected = index;
    m.interface_motion.snap(m.gallery_progress_fraction);
    const id = gallery.ids[index];
    if (std.mem.eql(u8, id, "project-sidebar")) {
        m.project_name = gallery.project_sidebar_title;
        m.project_image = meatball_picture;
        syncSidebar(m);
    }
    if (std.mem.eql(u8, id, "composer")) {
        m.gallery_editor.clear();
        m.value = m.gallery_editor.text();
        m.gallery_composer_mask = .{ true, false };
        for (&m.gallery_choices, gallery.composer_attachments_names) |*item, name| item.title = name;
        syncComposerAttachments(m);
    }
    if (std.mem.eql(u8, id, "stepper")) {
        m.gallery_choices[0].title = "Prepare";
        m.gallery_choices[1].title = "Review";
        m.gallery_choices[0].detail = "Draft the release notes";
        m.gallery_choices[1].detail = "Check the final changes";
        m.choices = &m.gallery_choices;
    }
    m.gallery_list_open = show_list;
    m.gallery_dark = dark;
    if (std.mem.eql(u8, id, "dialog") or std.mem.eql(u8, id, "drawer") or std.mem.eql(u8, id, "sheet")) {
        m.gallery_editor = @TypeOf(m.gallery_editor).init(gallery.edit_view_value);
        m.value = m.gallery_editor.text();
    }
    if (std.mem.eql(u8, id, "field-error")) {
        m.gallery_editor.clear();
        m.value = m.gallery_editor.text();
    }
    if (isAgentComposition(m)) {
        m.picture = 0;
        m.agent_image = 0;
        m.profile_image = 0;
        m.agents = &m.gallery_agent_choices;
        if (std.mem.eql(u8, id, "agent-sidebar")) m.sidebar_destinations = &m.gallery_agent_choices;
    }
    if (std.mem.eql(u8, id, "hover-card")) m.enabled = false;
    if (std.mem.eql(u8, id, "action-menu") or std.mem.eql(u8, id, "context-menu") or
        std.mem.eql(u8, id, "menubar") or std.mem.eql(u8, id, "date-picker") or
        std.mem.eql(u8, id, "dialog") or std.mem.eql(u8, id, "drawer") or std.mem.eql(u8, id, "sheet") or
        std.mem.eql(u8, id, "confirm-dialog") or std.mem.eql(u8, id, "decision-review") or
        std.mem.eql(u8, id, "sidebar-layout") or std.mem.eql(u8, id, "hover-card") or
        std.mem.eql(u8, id, "toast") or std.mem.eql(u8, id, "popover")) m.is_open = false;
}

fn isAgentSpecimen(m: *const Model) bool {
    const id = gallery.ids[m.gallery_selected];
    return std.mem.eql(u8, id, "agent-avatar") or std.mem.eql(u8, id, "gaze");
}

fn isAgentComposition(m: *const Model) bool {
    const id = gallery.ids[m.gallery_selected];
    return std.mem.eql(u8, id, "agent-row") or std.mem.eql(u8, id, "agent-sidebar") or std.mem.eql(u8, id, "agent-workspace") or std.mem.eql(u8, id, "agent-profile");
}

fn agentFrame(m: *const Model, frame: sdk.GpuFrame) ?Msg {
    const composition = isAgentComposition(m);
    if (!isAgentSpecimen(m) and !composition) return null;
    const now_ms = frame.timestamp_ns / std.time.ns_per_ms;
    if (now_ms < m.agent_next_ms and (!composition or now_ms < m.agent_sol_next_ms)) return null;
    return .{ .agent_tick = now_ms };
}

fn agentAppearance(appearance: sdk.platform.Appearance) ?Msg {
    return .{ .agent_reduce_motion = appearance.reduce_motion };
}

fn interfaceFrame(m: *const Model, frame: sdk.GpuFrame) ?Msg {
    if (m.interface_motion.active()) return .{ .interface_tick = sdk.monotonicNanoseconds() };
    return agentFrame(m, frame);
}

fn drawerOffset(m: *const Model) f32 {
    if (m.drawer_dragging) return m.drawer_distance;
    const distance = if (m.drawer_distance > 0) m.drawer_distance else layout_tokens.gap_panel;
    return distance * (1 - m.interface_motion.value);
}

fn animateEntrance(m: *Model, duration_ms: u32) void {
    m.interface_motion.snap(0);
    m.interface_motion.retarget(1, sdk.monotonicNanoseconds(), duration(m, duration_ms), layout_tokens.arrive_curve);
}

fn duration(m: *const Model, normal: u32) u32 {
    return if (m.agent_reduced_motion) 0 else normal;
}

pub fn update(m: *Model, msg: Msg, fx: *sdk.Effects(Msg)) void {
    if (workspace_fixtures.apply(m, msg)) return;
    switch (msg) {
        .interface_tick => |now| m.interface_motion.advance(now),
        .agent_tick => |now_ms| {
            if (isAgentComposition(m)) {
                const size: f32 = if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar")) 24 else 40;
                const multiple_agents = !std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-row");
                if (m.agent_playback == null) m.agent_playback = agent_vector.Playback.init(.kai, size, if (multiple_agents) .ready else .waiting, now_ms);
                if (multiple_agents and m.agent_sol_playback == null) m.agent_sol_playback = agent_vector.Playback.init(.sol, size, .working, now_ms);
                if (!multiple_agents) m.agent_sol_next_ms = std.math.maxInt(u64);
                var pixels: [agent_preview.side * agent_preview.side * 4]u8 = undefined;
                if (now_ms >= m.agent_next_ms) {
                    const playback = m.agent_playback.?;
                    if (agent_preview.render(playback, now_ms, m.agent_reduced_motion, &pixels)) {
                        if (fx.registerImage(agent_preview.image_id, agent_preview.side, agent_preview.side, &pixels)) {
                            m.agent_kai_picture = agent_preview.image_id;
                            m.gallery_agent_choices[0].image_id = agent_preview.image_id;
                            m.agent_kai_error = false;
                            m.agent_next_ms = if (playback.nextFrameDelay(now_ms, true, m.agent_reduced_motion)) |delay| now_ms +| delay else std.math.maxInt(u64);
                        } else |_| { m.agent_kai_error = true; m.agent_next_ms = now_ms +| 500; }
                    } else |_| { m.agent_kai_error = true; m.agent_next_ms = now_ms +| 500; }
                }
                if (multiple_agents and now_ms >= m.agent_sol_next_ms) {
                    const playback = m.agent_sol_playback.?;
                    if (agent_preview.render(playback, now_ms, m.agent_reduced_motion, &pixels)) {
                        if (fx.registerImage(agent_preview.image_id + 1, agent_preview.side, agent_preview.side, &pixels)) {
                            m.agent_sol_picture = agent_preview.image_id + 1;
                            m.gallery_agent_choices[1].image_id = agent_preview.image_id + 1;
                            m.agent_sol_error = false;
                            m.agent_sol_next_ms = if (playback.nextFrameDelay(now_ms, true, m.agent_reduced_motion)) |delay| now_ms +| delay else std.math.maxInt(u64);
                        } else |_| { m.agent_sol_error = true; m.agent_sol_next_ms = now_ms +| 500; }
                    } else |_| { m.agent_sol_error = true; m.agent_sol_next_ms = now_ms +| 500; }
                }
                m.picture = m.agent_kai_picture;
                m.agent_image = if (m.gallery_agent_choices[1].selected) m.agent_sol_picture else m.agent_kai_picture;
                m.profile_image = if (m.profile_sol) m.agent_sol_picture else m.agent_kai_picture;
                m.agent_error = m.agent_kai_error or m.agent_sol_error;
                if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar")) syncSidebar(m);
                return;
            }
            if (!isAgentSpecimen(m)) return;
            if (m.agent_playback == null) m.agent_playback = agent_vector.Playback.init(m.agent_kind, 72, .ready, now_ms);
            if (m.agent_pending) |pending| {
                m.agent_playback.?.setState(pending, now_ms, m.agent_reduced_motion);
                m.agent_pending = null;
            }
            const playback = m.agent_playback.?;
            var pixels: [agent_preview.side * agent_preview.side * 4]u8 = undefined;
            agent_preview.render(playback, now_ms, m.agent_reduced_motion, &pixels) catch {
                m.agent_error = true; m.agent_next_ms = now_ms +| 500; return;
            };
            fx.registerImage(agent_preview.image_id, agent_preview.side, agent_preview.side, &pixels) catch {
                m.agent_error = true; m.agent_next_ms = now_ms +| 500; return;
            };
            m.picture = agent_preview.image_id;
            m.agent_error = false;
            m.agent_next_ms = if (playback.nextFrameDelay(now_ms, true, m.agent_reduced_motion)) |delay| now_ms +| delay else std.math.maxInt(u64);
        },
        .agent_set_state => |choice| {
            if (!isAgentSpecimen(m)) return;
            const state: agent_vector.State = switch (choice) {
                0 => .ready, 1 => .thinking, 2 => .working, 3 => .waiting, 4 => .blocked, 5 => .done, else => return,
            };
            m.agent_pending = state;
            m.agent_next_ms = 0;
        },
        .agent_set_kind => |choice| {
            if (!isAgentSpecimen(m) or choice > 1) return;
            const state = if (m.agent_pending) |pending| pending else if (m.agent_playback) |playback| playback.state else .ready;
            m.agent_kind = if (choice == 0) .kai else .sol;
            m.agent_label = if (choice == 0) "Kai" else "Sol";
            m.agent_playback = null;
            m.agent_pending = state;
            m.agent_next_ms = 0;
        },
        .agent_reduce_motion => |reduced| {
            m.agent_reduced_motion = reduced;
            if (reduced) m.interface_motion.snap(m.interface_motion.target);
            m.agent_next_ms = 0;
            m.agent_sol_next_ms = 0;
        },
        .gallery_select => |index| selectComponent(m, index),
        .gallery_previous => if (m.gallery_selected > 0) selectComponent(m, m.gallery_selected - 1),
        .gallery_next => if (m.gallery_selected + 1 < gallery.names.len) selectComponent(m, m.gallery_selected + 1),
        .gallery_list => m.gallery_list_open = !m.gallery_list_open,
        .gallery_appearance => m.gallery_dark = !m.gallery_dark,
        .gallery_close_detail => m.gallery_detail_title = "",
        .drawer_drag => |drag| {
            switch (@as(canvas.WidgetDragPhase, @enumFromInt(drag.phase))) {
                .change => {
                    if (!m.drawer_dragging) m.drawer_drag_origin = drawerOffset(m);
                    m.interface_motion.snap(1);
                    m.drawer_distance = @max(0, m.drawer_drag_origin + drag.y);
                    m.drawer_dragging = true;
                },
                .end, .cancel => {
                    const was_dragging = m.drawer_dragging;
                    m.drawer_dragging = false;
                    if (drawer_surface.shouldDismiss(drag)) {
                        m.is_open = false;
                        m.interface_motion.snap(1);
                        m.gallery_status = "Closed";
                    } else if (was_dragging and m.drawer_distance > 0) {
                        m.interface_motion.snap(0);
                        m.interface_motion.retarget(1, sdk.monotonicNanoseconds(), duration(m, layout_tokens.travel_ms), layout_tokens.settle_curve);
                    }
                },
            }
        },
        .gallery_menu => |choice| {
            m.is_open = false;
            if (isSmallSurface(gallery.ids[m.gallery_selected])) m.interface_motion.snap(1);
            m.gallery_status = switch (choice) {
                1 => "Renaming view.",
                2 => "View duplicated.",
                3 => "View archived.",
                else => "",
            };
        },
        .gallery_toggle_chart => m.gallery_chart_open = !m.gallery_chart_open,
        .advance_progress => {
            m.gallery_progress_count = if (m.gallery_progress_count >= 5) 0 else m.gallery_progress_count + 1;
            m.gallery_progress_fraction = @as(f32, @floatFromInt(m.gallery_progress_count)) / 5;
            m.interface_motion.retarget(m.gallery_progress_fraction, sdk.monotonicNanoseconds(), duration(m, layout_tokens.travel_ms), layout_tokens.settle_curve);
            m.gallery_progress_full = m.gallery_progress_count == 5;
            m.gallery_progress_label = gallery.percentages[m.gallery_progress_count * 20];
        },
        .gallery_select_option => |id| {
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "segmented-control")) {
                if (id < 1 or id > 3) return;
                m.gallery_first_selected = id == 1;
                m.gallery_second_selected = id == 2;
                m.gallery_third_selected = id == 3;
                return;
            }
            if (id != 1 and id != 2) return;
            m.gallery_first_selected = id == 1;
            m.gallery_second_selected = id == 2;
            const is_radio = std.mem.eql(u8, gallery.ids[m.gallery_selected], "radio-group");
            m.gallery_status = if (is_radio)
                (if (id == 1) "Daily selected" else "Weekly selected")
            else
                (if (id == 1) "Overview selected" else "Activity selected");
        },
        .gallery_toggle_option => |id| {
            if (id == 1) {
                m.gallery_first_checked = !m.gallery_first_checked;
                m.gallery_status = if (m.gallery_first_checked) "Weekly digest selected" else "Weekly digest cleared";
            } else if (id == 2) {
                m.gallery_second_checked = !m.gallery_second_checked;
                m.gallery_status = if (m.gallery_second_checked) "Product updates selected" else "Product updates cleared";
            }
        },
        .toggle => {
            m.enabled = !m.enabled;
            m.is_open = m.enabled;
            m.gallery_status = "setting changed";
        },
        .open_choices => {
            const is_picker = std.mem.eql(u8, gallery.ids[m.gallery_selected], "select");
            const next = if (is_picker) !m.gallery_picker_open else !m.is_open;
            m.gallery_picker_open = next;
            m.is_open = next;
            m.enabled = next;
            m.gallery_status = if (next) "Options opened" else "Options closed";
            const id = gallery.ids[m.gallery_selected];
            if (isEditLayer(id)) {
                m.drawer_distance = 0;
                m.drawer_drag_origin = 0;
                m.drawer_dragging = false;
                m.interface_motion.snap(1);
                if (next) animateEntrance(m, layout_tokens.panel_ms);
            } else if (isSmallSurface(id)) {
                m.interface_motion.snap(1);
                if (next) animateEntrance(m, layout_tokens.layer_ms);
            }
        },
        .open_menu => { m.is_open = true; m.gallery_status = "Menu opened"; },
        .select_agent => |id| {
            if (!isAgentComposition(m) or id == 0 or id > 2) return;
            m.gallery_agent_row_selected = true;
            m.gallery_agent_choices[0].selected = id == 1;
            m.gallery_agent_choices[1].selected = id == 2;
            m.agent_name = if (id == 1) "Kai" else "Sol";
            m.agent_status = if (id == 1) "Ready" else "Working";
            m.agent_image = if (id == 1) m.agent_kai_picture else m.agent_sol_picture;
            m.gallery_status = if (id == 1) "Kai selected" else "Sol selected";
        },
        .pick_profile_kai => { m.profile_kai = true; m.profile_sol = false; m.profile_image = m.agent_kai_picture; },
        .pick_profile_sol => { m.profile_kai = false; m.profile_sol = true; m.profile_image = m.agent_sol_picture; },
        .toggle_sidebar_resources => m.gallery_sidebar_resources_open = !m.gallery_sidebar_resources_open,
        .toggle_project_sidebar => m.gallery_sidebar_visible = !m.gallery_sidebar_visible,
        .toggle_sidebar_group => {
            m.sidebar_group_open = !m.sidebar_group_open;
            m.gallery_status = if (m.sidebar_group_open) "Project views expanded" else "Project views collapsed";
        },
        .select_sidebar_item => |id| {
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "project-sidebar")) {
                const count = m.gallery_project_destinations.len;
                if (id == 0 or id > count + @intFromBool(m.gallery_sidebar_added)) return;
                for (&m.gallery_project_destinations) |*row| row.selected = row.id == id;
                m.gallery_sidebar_new_selected = id > count;
                m.gallery_sidebar_active = if (m.gallery_sidebar_new_selected) "New sample view" else m.gallery_project_destinations[id - 1].title;
                syncSidebar(m);
                m.gallery_status = m.gallery_sidebar_active;
                return;
            }
            if (id == 0 or id > 3 or (id == 3 and !m.gallery_sidebar_added)) return;
            m.gallery_sidebar_new_selected = id == 3;
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar")) {
                m.gallery_agent_choices[0].selected = id == 1;
                m.gallery_agent_choices[1].selected = id == 2;
                syncSidebar(m);
                m.gallery_status = switch (id) { 1 => "Kai selected", 2 => "Sol selected", else => "New sample view selected" };
                return;
            }
            m.gallery_sidebar_choices[0].selected = id == 1;
            m.gallery_sidebar_choices[1].selected = id == 2;
            syncSidebar(m);
            m.gallery_status = switch (id) { 1 => "Overview selected", 2 => "Reviews selected", else => "New sample view selected" };
        },
        .toggle_all => {
            m.all_checked = !m.all_checked;
            for (&m.gallery_choices) |*choice| choice.selected = m.all_checked and !choice.disabled;
            m.choices = &m.gallery_choices;
        },
        .confirm_current => {
            m.is_open = false;
            m.gallery_status = "Choice confirmed in this example.";
        },
        .close_sidebar => m.is_open = false,
        .navigate => {
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "navbar")) {
                workspace_fixtures.detail(m, "Overview", "You returned to the sample parent view.");
            } else workspace_fixtures.detail(m, "Record details", "The sample record is ready to review.");
        },
        .add_sidebar_item => {
            m.gallery_sidebar_added = true;
            m.gallery_sidebar_query.clear();
            m.sidebar_query = "";
            syncSidebar(m);
            m.gallery_status = "Sample view added";
        },
        .dismiss => { if (isEditLayer(gallery.ids[m.gallery_selected]) or isSmallSurface(gallery.ids[m.gallery_selected])) m.interface_motion.snap(1); m.gallery_picker_open = false; m.is_open = false; m.enabled = false; m.gallery_status = "state updated"; },
        .choose => |id| {
            const selected_id = gallery.ids[m.gallery_selected];
            if (std.mem.eql(u8, selected_id, "agreement")) {
                if (id == 0 or id > m.gallery_choices.len) return;
                const choice = &m.gallery_choices[id - 1];
                if (choice.disabled) return;
                choice.selected = !choice.selected;
                m.all_checked = true;
                for (m.gallery_choices) |item| {
                    if (!item.disabled and !item.selected) m.all_checked = false;
                }
                m.choices = &m.gallery_choices;
                return;
            }
            if (std.mem.eql(u8, selected_id, "rating")) {
                if (id >= 1 and id <= 5) m.rating_score = id;
                return;
            }
            if (std.mem.eql(u8, selected_id, "calendar") or std.mem.eql(u8, selected_id, "date-picker")) {
                const count: usize = if (m.gallery_page_one) 30 else 31;
                if (id == 0 or id > count) return;
                m.gallery_days = gallery.december_days;
                m.gallery_days[id - 1].selected = true;
                m.days = m.gallery_days[0..count];
                m.gallery_date_value = if (m.gallery_page_one) gallery.november_labels[id - 1] else gallery.december_labels[id - 1];
                if (std.mem.eql(u8, selected_id, "date-picker")) m.is_open = false;
                m.gallery_status = m.gallery_date_value;
                return;
            }
            if (std.mem.eql(u8, selected_id, "toggle-group")) {
                if (id == 0 or id > 2) return;
                m.gallery_choices[0].selected = id == 1;
                m.gallery_choices[1].selected = id == 2;
                m.choices = &m.gallery_choices;
                m.gallery_status = if (id == 1) "Yogurt selected" else "Meatball selected";
                return;
            }
            if (id == 0 or id > 2) return;
            m.gallery_choices[0].selected = id == 1;
            m.gallery_choices[1].selected = id == 2;
            m.choices = &m.gallery_choices;
            m.gallery_editor = canvas.TextBuffer(1024).init(if (id == 1) "Yogurt" else "Meatball");
            m.value = m.gallery_editor.text();
            m.gallery_picker_open = false;
            m.is_open = false;
            m.enabled = false;
            m.gallery_status = "state updated";
        },
        .search_sidebar => |event| {
            m.gallery_sidebar_query.apply(event);
            m.sidebar_query = m.gallery_sidebar_query.text();
            syncSidebar(m);
            m.gallery_status = if (m.sidebar_destinations.len == 0) "No matching views" else "Ready";
        },
        .draft_changed => |event| {
            m.gallery_editor.apply(event);
            m.value = m.gallery_editor.text();
            const id = gallery.ids[m.gallery_selected];
            if (std.mem.eql(u8, id, "agent-workspace")) m.agent_draft = m.value;
            if (std.mem.eql(u8, id, "project-workspace")) m.project_draft = m.value;
            m.composer_send_disabled = std.mem.trim(u8, m.value, " \t\r\n").len == 0 and m.composer_attachments.len == 0;
        },
        .remove_attachment => |id| {
            if (id < 1 or id > m.gallery_composer_mask.len) return;
            m.gallery_composer_mask[id - 1] = false;
            syncComposerAttachments(m);
            m.composer_send_disabled = std.mem.trim(u8, m.value, " \t\r\n").len == 0 and m.composer_attachments.len == 0;
            m.gallery_status = "Sample attachment removed";
        },
        .choose_attachment => {
            if (std.mem.indexOfScalar(bool, &m.gallery_composer_mask, false)) |index| {
                m.gallery_composer_mask[index] = true;
                syncComposerAttachments(m);
                m.composer_send_disabled = false;
                m.gallery_status = "Sample attachment added";
            } else m.gallery_status = "Both sample attachments are present";
        },
        .choose_tool => {
            m.gallery_tool_selected = !m.gallery_tool_selected;
            m.gallery_status = if (m.gallery_tool_selected) "Review tool selected" else "Review tool cleared";
        },
        .send_message => {
            if (m.composer_pending or m.composer_send_disabled) return;
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "composer")) {
                m.gallery_editor.clear();
                m.value = m.gallery_editor.text();
                m.gallery_composer_mask = .{ false, false };
                syncComposerAttachments(m);
                m.composer_send_disabled = true;
                m.gallery_status = "Draft sent";
                return;
            }
            m.composer_pending = true;
            m.gallery_status = "Preparing a sample reply";
        },
        .stop_response => {
            m.composer_pending = false;
            m.gallery_status = "Sample reply stopped";
        },
        .adjust => |value| {
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "resizable")) {
                m.fraction = std.math.clamp(value, 0.15, 0.85);
                return;
            }
            m.amount = std.math.clamp(value, 0, 1);
            m.gallery_slider_label = gallery.percentages[@intFromFloat(@round(m.amount * 100))];
            m.gallery_status = "value changed";
        },
        .edit => |event| {
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "input-otp")) {
                precision.editCode(&m.code_editor, event);
                return;
            }
            m.gallery_editor.apply(event);
            m.value = m.gallery_editor.text();
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "field-error"))
                m.enabled = std.mem.trim(u8, m.value, " \t").len == 0;
            m.gallery_status = if (m.gallery_editor.truncated) "text limit reached" else "text changed";
        },
        .edit_first => |event| {
            m.gallery_first_editor.apply(event);
            m.first_value = m.gallery_first_editor.text();
            m.gallery_status = if (m.gallery_first_editor.truncated) "text limit reached" else "text changed";
        },
        .edit_last => |event| {
            m.gallery_last_editor.apply(event);
            m.last_value = m.gallery_last_editor.text();
            m.gallery_status = if (m.gallery_last_editor.truncated) "text limit reached" else "text changed";
        },
        .increment => if (m.gallery_count < 2) { m.gallery_count += 1; syncCount(m); m.gallery_status = "quantity changed"; },
        .decrement => if (m.gallery_count > 0) { m.gallery_count -= 1; syncCount(m); m.gallery_status = "quantity changed"; },
        .next_page => if (m.gallery_page < 1) { changePage(m, 1); },
        .previous_page => if (m.gallery_page > 0) { changePage(m, 0); },
        .clear => { m.gallery_editor.clear(); m.value = m.gallery_editor.text(); m.gallery_status = "text cleared"; },
        .activate => {
            const id = gallery.ids[m.gallery_selected];
            if (std.mem.eql(u8, id, "dialog") or std.mem.eql(u8, id, "drawer") or std.mem.eql(u8, id, "sheet")) {
                m.is_open = false;
                m.interface_motion.snap(1);
                m.gallery_status = gallery.edit_view_saved;
            } else if (std.mem.eql(u8, id, "form")) {
                m.gallery_status = if (std.mem.trim(u8, m.value, " \t").len > 0) "Sample view saved" else "Enter a view name";
            } else if (std.mem.eql(u8, id, "stepper")) {
                m.gallery_choices[0].selected = !m.gallery_choices[0].selected;
                m.gallery_choices[1].selected = !m.gallery_choices[0].selected;
                m.choices = &m.gallery_choices;
            } else {
                m.gallery_status = "Action received locally; no external effect";
            }
        },
        else => m.gallery_status = "This action is not implemented in this guide",
    }
}

pub fn tokens(m: *const Model) canvas.DesignTokens {
    return theme.theme(m.gallery_dark, .neutral, false, m.agent_reduced_motion);
}

fn chooseRating(score: u32) Msg {
    return .{ .choose = score };
}

fn isEditLayer(id: []const u8) bool {
    return std.mem.eql(u8, id, "dialog") or std.mem.eql(u8, id, "drawer") or std.mem.eql(u8, id, "sheet");
}

fn editLayer(ui: *AppUi, m: *const Model, id: []const u8) AppUi.Node {
    const drawer = std.mem.eql(u8, id, "drawer");
    const sheet = std.mem.eql(u8, id, "sheet");
    const phase = m.interface_motion.value;
    const returning = drawer and m.drawer_distance > 0;
    const offset = if (drawer) drawerOffset(m) else
        (if (sheet) layout_tokens.gap_panel else layout_tokens.gap_inline) * (1 - phase);
    const fields = ui.column(.{ .gap = layout_tokens.gap_stack }, .{
        ui.column(.{ .gap = 6 }, .{
            ui.text(.{ .size = .sm }, gallery.edit_view_label),
            ui.textField(.{ .text = m.value, .semantics = .{ .label = gallery.edit_view_label }, .on_input = AppUi.inputMsg(.edit) }),
        }),
        ui.button(.{ .variant = .primary, .on_press = .activate }, gallery.edit_view_submit),
    });
    if (drawer) {
        const presentation = motion.surfaceOptions(Msg, gallery.edit_view_title, .dismiss, 0, offset, if (returning or m.drawer_dragging) 1 else phase);
        return drawer_surface.present(Msg, ui, gallery.edit_view_title, .dismiss, .{ .drawer_drag = .{} }, fields, presentation);
    }
    var options = motion.surfaceOptions(Msg, gallery.edit_view_title, .dismiss, if (sheet) offset else 0, if (sheet) 0 else offset, phase);
    options.width = 400;
    options.padding = layout_tokens.inset_sheet;
    return ui.el(if (sheet) .sheet else .dialog, options, .{
        ui.column(.{ .gap = layout_tokens.gap_stack }, .{
            ui.row(.{ .gap = layout_tokens.gap_inline, .cross = .center }, .{
                ui.text(.{ .size = .heading, .grow = 1, .wrap = true }, gallery.edit_view_title),
                ui.button(.{ .variant = .ghost, .size = .icon, .icon = "x", .semantics = .{ .label = "Close" }, .on_press = .dismiss }, ""),
            }),
            fields,
        }),
    });
}

fn isSmallSurface(id: []const u8) bool {
    return std.mem.eql(u8, id, "action-menu") or std.mem.eql(u8, id, "popover") or std.mem.eql(u8, id, "toast");
}

fn smallSurface(ui: *AppUi, m: *const Model, id: []const u8) AppUi.Node {
    const phase = m.interface_motion.value;
    const distance = 1 - phase;
    if (std.mem.eql(u8, id, "toast")) {
        if (!m.is_open) return ui.button(.{ .variant = .secondary, .on_press = .open_choices }, "Save view");
        return ui.column(.{ .opacity = @max(0.001, phase),
            .transform = canvas.Affine.translate(0, layout_tokens.gap_inline * distance) }, .{gallery.specimen(ui, m)});
    }
    const menu = std.mem.eql(u8, id, "action-menu");
    const label = if (menu) gallery.action_menu_label else gallery.popover_label;
    var popup = motion.surfaceOptions(Msg, label, .dismiss, 0, -layout_tokens.layer_shift * distance, phase);
    popup.anchor = .below;
    popup.anchor_offset = layout_tokens.offset_layer;
    popup.padding = if (menu) layout_tokens.inset_layer else layout_tokens.inset_regular;
    popup.width = if (menu) layout_tokens.anchored_menu_min_width else 0;
    return ui.row(.{ .main = .start }, .{
        ui.stack(.{}, .{
            ui.button(.{ .variant = .secondary, .icon = if (menu) "chevron-down" else "", .icon_placement = .trailing,
                .on_press = .open_choices }, label),
            if (!m.is_open) ui.column(.{}, .{}) else if (menu) ui.el(.dropdown_menu, popup, .{
                ui.el(.menu_item, .{ .height = layout_tokens.menu_row, .text = gallery.action_menu_items[0], .on_press = .{ .gallery_menu = 1 } }, .{}),
                ui.el(.menu_item, .{ .height = layout_tokens.menu_row, .text = gallery.action_menu_items[1], .on_press = .{ .gallery_menu = 2 } }, .{}),
                ui.el(.menu_item, .{ .height = layout_tokens.menu_row, .text = gallery.action_menu_items[2], .on_press = .{ .gallery_menu = 3 } }, .{}),
            }) else ui.el(.popover, popup, .{ui.text(.{ .wrap = true }, gallery.popover_body)}),
        }),
    });
}

fn carouselView(ui: *AppUi, m: *const Model) AppUi.Node {
    const phase = m.interface_motion.value;
    const start: f32 = if (m.gallery_page_one) -layout_tokens.gap_panel else layout_tokens.gap_panel;
    return ui.column(.{ .gap = layout_tokens.gap_stack }, .{
        ui.text(.{ .opacity = if (m.interface_motion.active()) @max(0.001, phase) else 1,
            .transform = canvas.Affine.translate(if (m.interface_motion.active()) start * (1 - phase) else 0, 0) },
            if (m.gallery_page_one) "First sample" else "Second sample"),
        ui.row(.{ .gap = layout_tokens.gap_tight, .cross = .center }, .{
            ui.text(.{}, m.gallery_page_text),
            ui.spacer(1),
            ui.button(.{ .variant = .ghost, .size = .icon, .icon = "chevron-left", .semantics = .{ .label = "Previous slide" },
                .on_press = .previous_page, .disabled = m.at_first }, ""),
            ui.button(.{ .variant = .ghost, .size = .icon, .icon = "chevron-right", .semantics = .{ .label = "Next slide" },
                .on_press = .next_page, .disabled = m.at_last }, ""),
            ui.spacer(1),
        }),
    });
}

fn specimen(ui: *AppUi, m: *const Model, id: []const u8) AppUi.Node {
    if (isSmallSurface(id)) return smallSurface(ui, m, id);
    if (std.mem.eql(u8, id, "carousel")) return carouselView(ui, m);
    if (isEditLayer(id)) {
        return ui.column(.{ .cross = .start }, .{
            ui.button(.{ .variant = .secondary, .on_press = .open_choices }, gallery.edit_view_title),
            if (m.is_open) editLayer(ui, m, id) else ui.column(.{}, .{}),
        });
    }
    if (std.mem.eql(u8, id, "progress")) {
        return ui.column(.{ .gap = layout_tokens.gap_stack }, .{
            motion.progressView(Msg, ui, gallery.progress_label, m.gallery_progress_label, m.gallery_progress_fraction, m.interface_motion.value),
            ui.row(.{ .main = .start }, .{ui.button(.{ .variant = .secondary, .on_press = .advance_progress },
                if (m.gallery_progress_full) gallery.progress_reset else gallery.progress_next)}),
        });
    }
    if (std.mem.eql(u8, id, "input-otp"))
        return precision.codeView(Msg, ui, &m.code_editor, "Verification code", "Enter the six digits from your email.", AppUi.inputMsg(.edit));
    if (std.mem.eql(u8, id, "rating"))
        return precision.ratingView(Msg, ui, "How was the review?", m.rating_score, m.gallery_dark, chooseRating);
    return gallery.specimen(ui, m);
}

pub fn rootView(ui: *AppUi, m: *const Model) AppUi.Node {
    const index: usize = if (m.gallery_selected < gallery.names.len) m.gallery_selected else 0;
    const animated_agent = isAgentSpecimen(m);
    const agent_composition = isAgentComposition(m);
    const selected_agent_state: agent_vector.State = if (m.agent_pending) |pending| pending else if (m.agent_playback) |playback| playback.state else .ready;
    const has_agent = !animated_agent and !agent_composition and std.mem.startsWith(u8, gallery.ids[index], "agent-");
    const layout = gallery.preview_layouts[index];
    const preview = ui.scroll(.{ .grow = 1, .semantics = .{ .label = "Component preview" } }, .{
        ui.column(.{ .padding = 24, .gap = 20 }, .{
            ui.column(.{ .gap = 6 }, .{
                ui.text(.{ .size = .sm, .style_tokens = .{ .foreground = .text_muted } }, gallery.families[index]),
                ui.text(.{ .size = .display }, gallery.names[index]),
                ui.text(.{ .wrap = true }, gallery.descriptions[index]),
            }),
            if (has_agent) ui.text(.{}, "Animation unavailable") else ui.column(.{}, .{}),
            if ((animated_agent or agent_composition) and m.agent_error) ui.text(.{}, "Animation unavailable") else ui.column(.{}, .{}),
            ui.text(.{ .size = .sm }, "Preview"),
            ui.stack(.{ .style = .{ .radius = layout_tokens.radius_sheet }, .style_tokens = .{ .background = .surface } }, .{
                ui.column(.{ .height = layout_tokens.specimen_min_height }, .{}),
                ui.row(.{
                    .padding = if (layout == .wide) layout_tokens.specimen_wide_inset else layout_tokens.specimen_inset,
                    .main = .center,
                    .cross = .center,
                }, .{
                    ui.column(.{
                        .grow = 1,
                        .max_width = if (layout == .wide) 0 else layout_tokens.specimen_content_width,
                        .cross = if (layout == .compact) .center else .stretch,
                    }, .{specimen(ui, m, gallery.ids[index])}),
                }),
            }),
            if (animated_agent) ui.column(.{ .gap = 8 }, .{
                ui.row(.{ .gap = 8 }, .{
                    ui.button(.{ .on_press = .{ .agent_set_kind = 0 }, .variant = if (m.agent_kind == .kai) .primary else .secondary }, "Kai"),
                    ui.button(.{ .on_press = .{ .agent_set_kind = 1 }, .variant = if (m.agent_kind == .sol) .primary else .secondary }, "Sol"),
                }),
                ui.row(.{ .gap = 8 }, .{
                    ui.button(.{ .on_press = .{ .agent_set_state = 0 }, .variant = if (selected_agent_state == .ready) .primary else .secondary }, "Ready"),
                    ui.button(.{ .on_press = .{ .agent_set_state = 1 }, .variant = if (selected_agent_state == .thinking) .primary else .secondary }, "Thinking"),
                    ui.button(.{ .on_press = .{ .agent_set_state = 2 }, .variant = if (selected_agent_state == .working) .primary else .secondary }, "Working"),
                }),
                ui.row(.{ .gap = 8 }, .{
                    ui.button(.{ .on_press = .{ .agent_set_state = 3 }, .variant = if (selected_agent_state == .waiting) .primary else .secondary }, "Waiting"),
                    ui.button(.{ .on_press = .{ .agent_set_state = 4 }, .variant = if (selected_agent_state == .blocked) .primary else .secondary }, "Blocked"),
                    ui.button(.{ .on_press = .{ .agent_set_state = 5 }, .variant = if (selected_agent_state == .done) .primary else .secondary }, "Finished"),
                }),
            }) else ui.column(.{}, .{}),
            if (m.gallery_detail_title.len > 0) ui.column(.{ .gap = 8, .padding = 16, .style_tokens = .{ .background = .surface, .radius = .lg } }, .{
                ui.text(.{ .size = .heading }, m.gallery_detail_title),
                ui.text(.{ .wrap = true }, m.gallery_detail_body),
                ui.button(.{ .on_press = .gallery_close_detail, .variant = .ghost }, "Close details"),
            }) else ui.column(.{}, .{}),
            if (std.mem.eql(u8, m.gallery_status, "Ready")) ui.column(.{}, .{}) else ui.text(.{ .wrap = true }, m.gallery_status),
            ui.row(.{ .gap = 8 }, .{
                ui.button(.{ .on_press = .gallery_previous, .disabled = index == 0, .variant = .secondary }, "Previous"),
                ui.button(.{ .on_press = .gallery_next, .disabled = index + 1 >= gallery.names.len, .variant = .secondary }, "Next"),
            }),
        }),
    });
    const body = if (m.gallery_list_open) ui.row(.{ .grow = 1, .gap = 24 }, .{
        navigation.sidebar(ui, m),
        preview,
    }) else preview;
    return ui.column(.{ .grow = 1, .style_tokens = .{ .background = .background } }, .{
        ui.row(.{ .padding = 16, .gap = 12, .cross = .center, .style_tokens = .{ .background = .background } }, .{
            if (m.brand_picture != 0) ui.image(.{ .width = 28, .height = 28, .image = m.brand_picture, .semantics = .{ .label = "OpenBoa" } }) else ui.column(.{}, .{}),
            ui.text(.{ .size = .heading }, "Yogurt"),
            ui.text(.{}, "Components"),
            ui.button(.{ .on_press = .gallery_list, .variant = .ghost }, if (m.gallery_list_open) "Hide list" else "Show list"),
            ui.button(.{ .on_press = .gallery_appearance, .variant = .secondary }, "Change appearance"),
        }),
        body,
    });
}

const GuideApp = sdk.UiApp(Model, Msg);

fn guideEvent(context: *anyopaque, runtime: *sdk.Runtime, event: sdk.Event) anyerror!void {
    const app: *GuideApp = @ptrCast(@alignCast(context));
    const drawer_open = app.model.is_open and std.mem.eql(u8, gallery.ids[app.model.gallery_selected], "drawer");
    try app.app().event(runtime, if (drawer_open) drawer_surface.withTravel(event) else event);
}

pub fn main(init: std.process.Init) !void {
    precision.registerRatingIcons();
    const app = try GuideApp.create(std.heap.page_allocator, .{
        .name = app_name, .scene = .{ .windows = &windows }, .canvas_label = "main-canvas",
        .init_fx = registerProjectMark, .update_fx = update, .tokens_fn = tokens, .view = rootView, .on_frame = interfaceFrame, .on_appearance = agentAppearance,
        .fonts = &.{
            .{ .id = theme.font_id, .name = "Rethink Sans", .ttf = @embedFile("yogurt/rethink-sans.ttf") },
            .{ .id = theme.button_font_id, .name = "Rethink Sans Medium", .ttf = @embedFile("yogurt/rethink-sans-medium.ttf") },
        },
    });
    defer app.destroy();
    app.model = initialModel();
    var native_app = app.app();
    native_app.event_fn = guideEvent;
    try runner.runWithOptions(native_app, .{
        .app_name = app_name, .window_title = title, .bundle_id = "dev.openboa.yogurt.native-guide",
        .icon_path = "assets/icon.png", .default_frame = sdk.geometry.RectF.init(0, 0, 900, 650),
        .js_window_api = false,
        .security = .{ .permissions = &permissions, .navigation = .{ .allowed_origins = &.{ "zero://inline", "zero://app" } } },
    }, init);
}

test { _ = @import("gallery-tests.zig"); }
