const std = @import("std");
const gallery = @import("gallery-generated.zig");
const Model = gallery.Model;
const Msg = gallery.Msg;

fn matches(query: []const u8) bool {
    return std.ascii.findIgnoreCase("Yogurt", query) != null or
        std.ascii.findIgnoreCase("Meatball", query) != null or
        std.ascii.findIgnoreCase("Sourdough", query) != null;
}

fn chooseTab(m: *Model, tab: u2) void {
    m.project_chats_active = tab == 0;
    m.project_sources_active = tab == 1;
    m.project_instructions_active = tab == 2;
}

fn chooseOperations(m: *Model, tab: u2) void {
    m.operations_routines_active = tab == 0;
    m.operations_connections_active = tab == 1;
    m.operations_skills_active = tab == 2;
}

fn chooseAttention(m: *Model, tab: u2) void {
    m.attention_all_active = tab == 0;
    m.attention_unread_active = tab == 1;
    m.attention_required_active = tab == 2;
    m.attention_has_results = tab != 1;
}

pub fn detail(m: *Model, title: []const u8, body: []const u8) void {
    m.gallery_detail_title = title;
    m.gallery_detail_body = body;
}

pub fn apply(m: *Model, msg: Msg) bool {
    switch (msg) {
        .lookup_original => detail(m, "Original request", "Archive the sample record after review."),
        .jump_to_latest => m.gallery_status = "Latest sample activity",
        .copy => m.gallery_status = "Sample copy acknowledged",
        .dismiss_item => |id| {
            if (id == 0 or id > m.gallery_notification_mask.len) return true;
            m.gallery_notification_mask[id - 1] = false;
            var count: usize = 0;
            for (m.gallery_choices, m.gallery_notification_mask) |choice, shown| {
                if (!shown) continue;
                m.gallery_notification_rows[count] = choice;
                count += 1;
            }
            m.notifications = m.gallery_notification_rows[0..count];
            m.gallery_status = if (count == 0) "No sample notifications" else "Notification dismissed";
        },
        .open_runtime_panel => m.runtime_panel_open = true,
        .close_runtime_panel => m.runtime_panel_open = false,
        .open_runtime_preview, .retry_runtime_preview => {
            m.runtime_preview_visible = true;
            m.runtime_status = "Read-only preview";
        },
        .close_runtime_preview => m.runtime_preview_visible = false,
        .request_runtime_control => {
            m.runtime_has_control = true;
            m.runtime_status = "Sample control active";
        },
        .return_runtime_control => {
            m.runtime_has_control = false;
            m.runtime_status = "Read-only preview";
        },
        .open_resource => |id| {
            if (id < 1 or id > 2) return true;
            m.artifact_preview_id = id;
            m.artifact_preview_title = m.gallery_choices[id - 1].title;
            m.artifact_preview_open = true;
            m.gallery_status = "Sample record opened";
        },
        .toggle_resource_pin => |id| {
            if (id < 1 or id > 2) return true;
            const choice = &m.gallery_choices[id - 1];
            choice.pinned = !choice.pinned;
            m.artifacts = &m.gallery_choices;
            m.project_sources = &m.gallery_choices;
            m.enabled = choice.pinned;
        },
        .open_thread => |id| {
            if (id < 1 or id > 2) return true;
            for (&m.gallery_choices, 1..) |*choice, index| {
                choice.selected = index == id;
                if (choice.selected) choice.unread = false;
            }
            m.project_threads = &m.gallery_choices;
            m.gallery_status = "Sample thread opened";
        },
        .review_event => |id| {
            m.attention_review_id = id;
            m.attention_review_open = true;
            m.attention_outcome_visible = false;
            m.gallery_status = "Reviewing the sample activity";
        },
        .open_routine => detail(m, "Routine details", "Review project notes every Monday."),
        .edit_routine => detail(m, "Sample schedule", "The next review is Monday at 9:00 AM."),
        .run_routine => m.gallery_status = "Sample routine completed",
        .start_voice => {
            m.voice_active = true;
            m.voice_muted = false;
            m.gallery_status = "Sample call active";
        },
        .toggle_voice_mute => {
            if (!m.voice_active) return true;
            m.voice_muted = !m.voice_muted;
            m.gallery_status = if (m.voice_muted) "Sample microphone muted" else "Sample microphone unmuted";
        },
        .end_voice => {
            m.voice_active = false;
            m.gallery_status = "Sample call ended";
        },
        .show_agent_roster_action => m.show_agent_roster = !m.show_agent_roster,
        .change_project_picker_query => |event| {
            m.gallery_picker_query.apply(event);
            m.project_picker_query = m.gallery_picker_query.text();
            m.projects_available = matches(m.project_picker_query);
        },
        .change_agent_search, .change_project_query,
        .change_operations_query, .change_artifact_query => |event| {
            m.gallery_workspace_query.apply(event);
            const query = m.gallery_workspace_query.text();
            switch (msg) {
                .change_agent_search => {
                    m.agent_query = query;
                    m.agents_available = std.ascii.findIgnoreCase("Kai Sol", query) != null;
                },
                .change_project_query => {
                    m.project_query = query;
                    m.project_threads_available = matches(query);
                    m.project_sources_available = matches(query);
                },
                .change_operations_query => { m.operations_query = query; m.operations_has_results = matches(query); },
                .change_artifact_query => { m.artifact_query = query; m.artifact_has_results = matches(query); },
                else => unreachable,
            }
        },
        .clear_agent_search => { m.gallery_workspace_query.clear(); m.agent_query = ""; m.agents_available = true; },
        .clear_project_picker_query => { m.gallery_picker_query.clear(); m.project_picker_query = ""; m.projects_available = true; },
        .clear_project_query => { m.gallery_workspace_query.clear(); m.project_query = ""; m.project_threads_available = true; m.project_sources_available = true; },
        .clear_operations_query => { m.gallery_workspace_query.clear(); m.operations_query = ""; m.operations_has_results = true; },
        .clear_artifact_filters => { m.gallery_workspace_query.clear(); m.artifact_query = ""; m.artifact_filter = "All artifacts"; m.artifact_has_results = true; },
        .open_project_picker => m.project_picker_open = true,
        .close_project_picker => m.project_picker_open = false,
        .select_project => |id| {
            if (id < 1 or id > 2) return true;
            m.project_name = m.gallery_choices[id - 1].title;
            m.project_image = if (id == 1) m.project_picture else m.meatball_picture;
            m.project_picker_open = false;
        },
        .show_project_chats => chooseTab(m, 0),
        .show_project_sources => chooseTab(m, 1),
        .show_project_instructions => chooseTab(m, 2),
        .share_project => detail(m, "Sample sharing", "This example is visible only in the guide."),
        .start_project_chat => {
            m.project_composer_visible = true;
            m.gallery_editor.clear();
            m.project_draft = "";
        },
        .add_project_source => detail(m, "Sample source", "Review notes are available in the project sources."),
        .edit_project_instructions => detail(m, "Working instructions", m.project_instructions),
        .show_routines => chooseOperations(m, 0),
        .show_connections => chooseOperations(m, 1),
        .show_skills => chooseOperations(m, 2),
        .open_operation => |id| {
            if (id < 1 or id > 2) return true;
            detail(m, m.gallery_choices[id - 1].title, "Inspect the sample operation in this collection.");
        },
        .retry_operations => { m.operations_error = false; m.operations_loading = false; },
        .show_attention_all => chooseAttention(m, 0),
        .show_attention_unread => chooseAttention(m, 1),
        .show_attention_required => chooseAttention(m, 2),
        .close_attention_review => m.attention_review_open = false,
        .confirm_attention => |id| {
            if (!m.attention_review_open or id != m.attention_review_id) return true;
            m.attention_review_open = false;
            m.attention_outcome_visible = true;
        },
        .open_artifact_filters => m.artifact_filters_open = true,
        .close_artifact_filters => m.artifact_filters_open = false,
        .select_artifact_filter => |id| {
            if (id < 1 or id > 2) return true;
            m.artifact_filter = m.gallery_choices[id - 1].title;
            m.artifact_filters_open = false;
        },
        .close_artifact_preview => m.artifact_preview_open = false,
        .download_artifact => m.gallery_status = "Sample download acknowledged",
        .start_project_invite => detail(m, "Invite preview", "A real workspace would let you choose a person and their role."),
        .review_member_access => |id| {
            m.access_review_id = id;
            m.access_review_open = true;
            m.access_outcome_visible = false;
        },
        .close_access_review => m.access_review_open = false,
        .confirm_member_access => |id| {
            if (!m.access_review_open or id != m.access_review_id) return true;
            m.access_review_open = false;
            m.access_outcome_visible = true;
        },
        .open_profile_scope => m.profile_scope_open = true,
        .close_profile_scope => m.profile_scope_open = false,
        .pick_profile_scope => |id| {
            if (id < 1 or id > 2) return true;
            m.profile_scope = m.gallery_choices[id - 1].title;
            m.profile_scope_open = false;
        },
        .edit_profile_name => |event| {
            m.gallery_profile_name.apply(event);
            m.profile_name = m.gallery_profile_name.text();
        },
        .edit_profile_instructions => |event| {
            m.gallery_profile_instructions.apply(event);
            m.profile_instructions = m.gallery_profile_instructions.text();
        },
        .save_profile => {
            m.profile_has_error = std.mem.trim(u8, m.profile_name, " \t\r\n").len == 0;
            if (!m.profile_has_error) m.gallery_status = "Sample profile saved";
        },
        .discard_profile => {
            m.profile_name = "Kai";
            m.profile_instructions = "Review the release notes.";
            m.gallery_profile_name = @TypeOf(m.gallery_profile_name).init(m.profile_name);
            m.gallery_profile_instructions = @TypeOf(m.gallery_profile_instructions).init(m.profile_instructions);
            m.profile_has_error = false;
            m.gallery_status = "Sample profile changes discarded";
        },
        .open_run => |id| {
            if (id < 1 or id > 2) return true;
            m.current_run_id = id;
            m.run_title = m.gallery_choices[id - 1].title;
            m.run_has_details = true;
            m.run_status = "Ready";
        },
        .retry_run => |id| {
            if (id != m.current_run_id) return true;
            m.run_status = "Sample run queued";
            m.run_can_cancel = true;
            m.run_can_retry = false;
        },
        .cancel_run => |id| {
            if (id != m.current_run_id) return true;
            m.run_status = "Sample run cancelled";
            m.run_can_cancel = false;
            m.run_can_retry = true;
        },
        else => return false,
    }
    return true;
}
