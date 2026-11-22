// Typed fixture fields for the workspace templates. Hosts own these states and effects.
export const workspaceArgs = {
  item_id: "{entry_id}",
  selected: "{enabled}",
  disabled: "{unavailable}",
  unread: "{enabled}",
  pinned: "{enabled}",
  can_pin: "{enabled}",
  can_review: "{enabled}",
  can_edit: "{enabled}",
  can_run: "{enabled}",
  pending: "{pending}",
};

export const workspaceSlots = {
  "runtime-panel": '<image label="Computer preview" image="{picture}" width="240" height="135"/>',
  "work-event": '<text>Scope: launch review</text>',
  "sidebar-layout": '<use template="yg-sidebar-panel" label="Projects"><use template="yg-sidebar-group" label="Work"><use template="yg-sidebar-items"><use template="yg-sidebar-destination" label="Review" item_id="{entry_id}" selected="{enabled}"><text>Review</text></use></use></use></use><column grow="1" gap="8"><text>Project review</text><button variant="secondary" on-press="open_choices">Show project navigation</button><if test="{is_open}"><use template="yg-sidebar-drawer" label="Projects"><text>Project navigation</text></use></if></column>',
};

export const workspaceChoiceFields = [
  'summary: []const u8 = "Ready"',
  "image_id: u32 = 1",
  "unread: bool = false",
  "pinned: bool = false",
  "can_pin: bool = true",
  "can_review: bool = true",
  "can_edit: bool = true",
  "can_run: bool = true",
  "pending: bool = false",
  "is_event: bool = false",
].join(", ");

const available = [
  "access_can_confirm", "access_can_invite", "agent_available", "agents_available",
  "artifact_can_download", "artifact_has_results", "artifact_preview_open",
  "attention_all_active", "attention_has_results", "can_add_project_source",
  "can_confirm_attention", "can_edit_project_instructions", "can_share_project",
  "can_start_project_chat", "composer_can_attach", "composer_can_choose_tool",
  "composer_can_stop", "operations_has_results", "operations_routines_active",
  "project_available", "project_chats_active", "project_composer_visible",
  "project_sources_available", "project_threads_available", "projects_available",
  "runtime_available", "runtime_can_take_control", "runtime_can_watch",
  "runtime_panel_open", "runtime_preview_visible", "voice_can_mute", "voice_can_start",
  "profile_kai", "run_has_details", "run_has_steps", "run_has_result", "run_can_retry",
  "sidebar_group_open", "sidebar_can_add",
];
const inactive = [
  "access_outcome_visible", "access_pending", "access_review_open",
  "artifact_filters_open", "artifact_loading", "attention_outcome_visible",
  "attention_pending", "attention_required_active", "attention_review_open",
  "attention_unread_active", "composer_pending", "composer_send_disabled",
  "operations_connections_active", "operations_error", "operations_loading",
  "operations_skills_active", "project_instructions_active", "project_picker_open",
  "project_sources_active", "runtime_can_retry", "runtime_has_control",
  "runtime_pending", "show_agent_roster", "voice_active", "voice_muted",
  "voice_pending", "workspace_compact",
  "profile_sol", "profile_scope_open", "profile_locked", "profile_pending", "profile_save_disabled",
  "profile_discard_disabled", "profile_has_error", "run_loading", "run_can_cancel", "run_pending",
];
const text = {
  access_confirm_label: "Confirm access change",
  access_outcome: "Access updated",
  access_review_detail: "Change Mara's role from editor to viewer.",
  access_review_title: "Review access",
  access_scope: "Meatball",
  agent_draft: "Where should I review the notes?",
  agent_name: "Kai",
  agent_query: "",
  agent_status: "Review ready",
  artifact_filter: "All artifacts",
  artifact_preview_detail: "This draft contains meeting notes.",
  artifact_preview_title: "Meeting notes",
  artifact_query: "",
  attention_action_label: "Approve",
  attention_outcome: "Approval recorded",
  attention_review_detail: "Review the draft before sending.",
  attention_review_title: "Release review",
  operations_query: "",
  project_draft: "Summarize the review notes.",
  project_instructions: "Keep a record of decisions.",
  project_name: "Sourdough",
  project_picker_query: "",
  project_query: "",
  runtime_status: "Read-only preview",
  profile_name: "Kai",
  profile_scope: "This agent",
  profile_instructions: "Review the release notes.",
  profile_error: "The profile could not be saved.",
  run_title: "Weekly review",
  run_summary: "Read the current project notes.",
  run_status: "Ready",
  run_result: "Two decisions need review.",
  sidebar_query: "",
};
const ids = [
  "access_review_id", "agent_image", "artifact_preview_id", "attention_review_id",
  "entry_id", "project_image", "runtime_image",
  "profile_image", "current_run_id",
];
const collections = [
  "access_members", "agent_events", "agents", "artifact_filters", "artifacts",
  "attention_events", "composer_attachments", "operations", "project_sources",
  "project_threads", "projects",
  "profile_scopes", "runs",
  "sidebar_destinations",
];

export const workspaceModelFields = [
  ...available.map((name) => `${name}: bool = true`),
  ...inactive.map((name) => `${name}: bool = false`),
  ...Object.entries(text).map(([name, label]) => `${name}: []const u8 = "${label}"`),
  ...ids.map((name) => `${name}: u32 = 1`),
  ...collections.map((name) => `${name}: []const Choice = &sample`),
].join(", ");

const emptyActions = [
  "add_project_source", "choose_attachment", "choose_tool", "clear_agent_search",
  "clear_artifact_filters", "clear_operations_query", "clear_project_picker_query",
  "clear_project_query", "close_access_review", "close_artifact_filters",
  "close_artifact_preview", "close_attention_review", "close_project_picker",
  "close_runtime_panel", "close_runtime_preview", "edit_project_instructions",
  "end_voice", "open_artifact_filters", "open_project_picker", "open_runtime_panel",
  "open_runtime_preview", "request_runtime_control", "retry_operations",
  "retry_runtime_preview", "return_runtime_control", "send_message", "share_project",
  "show_agent_roster_action", "show_attention_all", "show_attention_required",
  "show_attention_unread", "show_connections", "show_project_chats",
  "show_project_instructions", "show_project_sources", "show_routines", "show_skills",
  "start_project_chat", "start_project_invite", "start_voice", "stop_response",
  "toggle_voice_mute",
  "pick_profile_kai", "pick_profile_sol", "open_profile_scope", "close_profile_scope",
  "save_profile", "discard_profile",
  "close_sidebar", "add_sidebar_item", "toggle_sidebar_group",
];
const idActions = [
  "confirm_attention", "confirm_member_access", "download_artifact", "edit_routine",
  "open_operation", "open_resource", "open_routine", "open_thread", "remove_attachment",
  "review_event", "review_member_access", "run_routine", "select_agent",
  "select_artifact_filter", "select_project", "toggle_resource_pin",
  "pick_profile_scope", "open_run", "retry_run", "cancel_run",
  "select_sidebar_item",
];
const textActions = [
  "change_agent_search", "change_artifact_query", "change_operations_query",
  "change_project_picker_query", "change_project_query", "draft_changed",
  "edit_profile_name", "edit_profile_instructions",
  "search_sidebar",
];
export const workspaceActionFields = [
  ...emptyActions,
  ...idActions.map((name) => `${name}: u32`),
  ...textActions.map((name) => `${name}: canvas.TextInputEvent`),
].join(", ");
