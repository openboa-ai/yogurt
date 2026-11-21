const std = @import("std");
const sdk = @import("native_sdk");
const runner = @import("runner");
const gallery = @import("gallery-generated.zig");
const navigation = @import("navigation.zig");
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
    m.gallery_list_open = show_list;
    m.gallery_dark = dark;
    const id = gallery.ids[index];
    if (isAgentComposition(m)) {
        m.picture = 0;
        m.agent_image = 0;
        m.profile_image = 0;
        m.agents = &m.gallery_agent_choices;
        if (std.mem.eql(u8, id, "agent-sidebar")) m.sidebar_destinations = &m.gallery_agent_choices;
    }
    if (std.mem.eql(u8, id, "input-otp")) { m.gallery_editor.clear(); m.value = m.gallery_editor.text(); }
    if (std.mem.eql(u8, id, "action-menu") or std.mem.eql(u8, id, "context-menu") or
        std.mem.eql(u8, id, "menubar") or std.mem.eql(u8, id, "date-picker")) m.is_open = false;
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

pub fn update(m: *Model, msg: Msg, fx: *sdk.Effects(Msg)) void {
    switch (msg) {
        .agent_tick => |now_ms| {
            if (isAgentComposition(m)) {
                const size: f32 = if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar")) 24 else 40;
                const multiple_agents = !std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-row");
                if (m.agent_playback == null) m.agent_playback = agent_vector.Playback.init(.kai, size, .ready, now_ms);
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
            m.agent_next_ms = 0;
            m.agent_sol_next_ms = 0;
        },
        .gallery_select => |index| selectComponent(m, index),
        .gallery_previous => if (m.gallery_selected > 0) selectComponent(m, m.gallery_selected - 1),
        .gallery_next => if (m.gallery_selected + 1 < gallery.names.len) selectComponent(m, m.gallery_selected + 1),
        .gallery_list => m.gallery_list_open = !m.gallery_list_open,
        .gallery_appearance => m.gallery_dark = !m.gallery_dark,
        .gallery_select_option => |id| {
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
        },
        .open_menu => { m.is_open = true; m.gallery_status = "Menu opened"; },
        .select_agent => |id| {
            if (!isAgentComposition(m) or id == 0 or id > 2) return;
            m.gallery_agent_choices[0].selected = id == 1;
            m.gallery_agent_choices[1].selected = id == 2;
            m.agent_name = if (id == 1) "Kai" else "Sol";
            m.agent_status = if (id == 1) "Ready" else "Working";
            m.agent_image = if (id == 1) m.agent_kai_picture else m.agent_sol_picture;
            m.gallery_status = if (id == 1) "Kai selected" else "Sol selected";
        },
        .pick_profile_kai => { m.profile_kai = true; m.profile_sol = false; m.profile_image = m.agent_kai_picture; },
        .pick_profile_sol => { m.profile_kai = false; m.profile_sol = true; m.profile_image = m.agent_sol_picture; },
        .toggle_sidebar_group => {
            m.sidebar_group_open = !m.sidebar_group_open;
            m.gallery_status = if (m.sidebar_group_open) "Project views expanded" else "Project views collapsed";
        },
        .select_sidebar_item => |id| {
            if (id == 0 or id > 2) return;
            if (std.mem.eql(u8, gallery.ids[m.gallery_selected], "agent-sidebar")) {
                m.gallery_agent_choices[0].selected = id == 1;
                m.gallery_agent_choices[1].selected = id == 2;
                m.sidebar_destinations = &m.gallery_agent_choices;
                m.gallery_status = if (id == 1) "Kai selected" else "Sol selected";
                return;
            }
            m.gallery_sidebar_choices[0].selected = id == 1;
            m.gallery_sidebar_choices[1].selected = id == 2;
            m.sidebar_destinations = &m.gallery_sidebar_choices;
            m.gallery_status = if (id == 1) "Overview selected" else "Reviews selected";
        },
        .dismiss => { m.gallery_picker_open = false; m.is_open = false; m.enabled = false; m.gallery_status = "state updated"; },
        .choose => |id| {
            const selected_id = gallery.ids[m.gallery_selected];
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
        .adjust => |value| { m.amount = std.math.clamp(value, 0, 1); m.gallery_status = "value changed"; },
        .edit => |event| {
            m.gallery_editor.apply(event);
            m.value = m.gallery_editor.text();
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
        .next_page => if (m.gallery_page < 1) { m.gallery_page += 1; syncPage(m); m.gallery_status = "Sample page changed; dates are illustrative"; },
        .previous_page => if (m.gallery_page > 0) { m.gallery_page -= 1; syncPage(m); m.gallery_status = "Sample page changed; dates are illustrative"; },
        .clear => { m.gallery_editor.clear(); m.value = m.gallery_editor.text(); m.gallery_status = "text cleared"; },
        .activate => m.gallery_status = "Action received locally; no external effect",
        else => m.gallery_status = "This action is not implemented in this guide",
    }
}

pub fn tokens(m: *const Model) canvas.DesignTokens {
    return theme.theme(m.gallery_dark, .neutral, false, m.agent_reduced_motion);
}

fn previewWidth(id: []const u8) f32 {
    const wide = [_][]const u8{ "chart", "bar-chart", "table", "data-table", "table-row", "data-grid", "grid-list" };
    for (wide) |item| if (std.mem.eql(u8, id, item)) return 560;
    const compact = [_][]const u8{ "button", "icon-button", "toggle", "switch", "checkbox", "radio", "badge" };
    for (compact) |item| if (std.mem.eql(u8, id, item)) return 240;
    return 360;
}

fn compactPreview(id: []const u8) bool {
    const compact = [_][]const u8{ "button", "icon-button", "toggle", "switch", "checkbox", "radio", "badge", "project-mark", "icon", "avatar", "agent-avatar", "gaze" };
    for (compact) |item| if (std.mem.eql(u8, id, item)) return true;
    return false;
}

pub fn rootView(ui: *AppUi, m: *const Model) AppUi.Node {
    const index: usize = if (m.gallery_selected < gallery.names.len) m.gallery_selected else 0;
    const animated_agent = isAgentSpecimen(m);
    const agent_composition = isAgentComposition(m);
    const selected_agent_state: agent_vector.State = if (m.agent_pending) |pending| pending else if (m.agent_playback) |playback| playback.state else .ready;
    const has_agent = !animated_agent and !agent_composition and std.mem.startsWith(u8, gallery.ids[index], "agent-");
    const compact = compactPreview(gallery.ids[index]);
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
            ui.stack(.{ .style_tokens = .{ .background = .surface, .radius = .xl } }, .{
                ui.column(.{ .height = 200 }, .{}),
                ui.row(.{ .padding = 24, .height = if (compact) 200 else 0, .main = .center, .cross = .center }, .{
                    ui.column(.{ .grow = 1, .max_width = previewWidth(gallery.ids[index]), .cross = if (compact) .center else .stretch }, .{
                        gallery.specimen(ui, m),
                    }),
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

pub fn main(init: std.process.Init) !void {
    const App = sdk.UiApp(Model, Msg);
    const app = try App.create(std.heap.page_allocator, .{
        .name = app_name, .scene = .{ .windows = &windows }, .canvas_label = "main-canvas",
        .init_fx = registerProjectMark, .update_fx = update, .tokens_fn = tokens, .view = rootView, .on_frame = agentFrame, .on_appearance = agentAppearance,
        .fonts = &.{
            .{ .id = theme.font_id, .name = "Rethink Sans", .ttf = @embedFile("yogurt/rethink-sans.ttf") },
            .{ .id = theme.button_font_id, .name = "Rethink Sans Medium", .ttf = @embedFile("yogurt/rethink-sans-medium.ttf") },
        },
    });
    defer app.destroy();
    app.model = initialModel();
    try runner.runWithOptions(app.app(), .{
        .app_name = app_name, .window_title = title, .bundle_id = "dev.openboa.yogurt.native-guide",
        .icon_path = "assets/icon.png", .default_frame = sdk.geometry.RectF.init(0, 0, 900, 650),
        .js_window_api = false,
        .security = .{ .permissions = &permissions, .navigation = .{ .allowed_origins = &.{ "zero://inline", "zero://app" } } },
    }, init);
}

test { _ = @import("gallery-tests.zig"); }
