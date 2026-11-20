# Workspace patterns

Agent workspaces keep the current teammate, conversation and computer state in view. Project workspaces keep a project's chats, sources and decisions together. Both use the same controls, with the original OpenBoa silhouette for agents and the product's own mark for projects.

[Sidebar compositions](sidebar.md) supply shared panel behavior with editable agent and project examples.

## Browse the patterns

| Task | Yogurt entries | Behavior to try |
| --- | --- | --- |
| Find a teammate | [AgentWorkspace](../apps/guide/generated/components.html#agent-workspace), [AgentRow](../apps/guide/generated/components.html#agent-row), [AgentAvatar](../apps/guide/generated/components.html#agent-avatar) | Search the roster, recover from no matches, change agents and return to the original draft. The silhouette has a transparent surround. |
| Set an agent's role and scope | [AgentProfile](../apps/guide/generated/components.html#agent-profile), [ProjectSettings](../apps/guide/generated/components.html#project-settings) | Compare the two original silhouettes, edit the working instructions or memory scope, then save or discard the same agent's draft. |
| Check an agent's work | [RuntimePanel](../apps/guide/generated/components.html#runtime-panel), [AgentWorkspace](../apps/guide/generated/components.html#agent-workspace) | Inspect availability, watch, request control, return it or recover from a lost connection through host-provided actions. |
| Work in a project | [ProjectWorkspace](../apps/guide/generated/components.html#project-workspace), [ThreadRow](../apps/guide/generated/components.html#thread-row) | Switch projects and browse each project's chats, sources and instructions. A draft and the context of selected sources follow their owning project. |
| Start or continue a conversation | [Composer](../apps/guide/generated/components.html#composer), [VoiceControl](../apps/guide/generated/components.html#voice-control), [Message](../apps/guide/generated/components.html#message), [WorkEvent](../apps/guide/generated/components.html#work-event), [Transcript](../apps/guide/generated/components.html#transcript) | Add or remove a source, choose an available tool, send or stop. The thread can carry artifacts, activity, handoffs and local review controls. |
| Find a source or delivered result | [ArtifactLibrary](../apps/guide/generated/components.html#artifact-library), [ResourceRow](../apps/guide/generated/components.html#resource-row), [Attachment](../apps/guide/generated/components.html#attachment) | Search typed entries, filter, pin, open a preview and clear the filter. Unavailable preview contents are described in words. |
| Review work that needs a person | [AttentionInbox](../apps/guide/generated/components.html#attention-inbox), [DecisionReview](../apps/guide/generated/components.html#decision-review), [Receipt](../apps/guide/generated/components.html#receipt) | Filter unread and attention items. Read the reviewed revision, cancel or explicitly approve, then find the matching receipt. |
| Manage routines and connected capabilities | [OperationsLibrary](../apps/guide/generated/components.html#operations-library), [RoutineRow](../apps/guide/generated/components.html#routine-row), [RunInspector](../apps/guide/generated/components.html#run-inspector) | Inspect a skill, connection or schedule. Open a run's steps and result. Retry or cancel when enabled by the host. |
| Share a project | [ProjectAccess](../apps/guide/generated/components.html#project-access), [ConfirmDialog](../apps/guide/generated/components.html#confirm-dialog) | Inspect roles, request an invite and confirm a member removal against the current revision. |

## Host responsibilities

The patterns use the shared Yogurt tokens. The gallery exercises local drafts and typed sample states. Full template marketplaces, organization charts, publishing, account enrollment, connector credential screens, live calls and computer streaming depend on product-specific service contracts. The consumer supplies the state, authorization and result behind each available action. A hosted product may show additional signed-in screens and entitlements. [Install the patterns](using-yogurt.md#editable-blocks) · [Target evidence](engineering/controls/component-library/verification.md)
