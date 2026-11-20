# Design system rules

OpenBoa products share Yogurt tokens, basic components and common interaction behavior. Each product combines those parts for its tasks, information and actions.

## Required reuse

| Layer | Product requirement |
| --- | --- |
| Tokens | Use the shared token for color, typography, spacing, corner radius, elevation and motion wherever the design system defines the role. Bind light and dark to semantic roles. Use project values for data and layout constraints, such as a document's reading measure or the width needed for a project column. |
| Basic components | Use the supported Yogurt component for an interaction that already exists on the target. A button, field, tab, dialog or menu should keep the shared semantics, focus and states. Supply the product's labels, data, icons and callbacks through its public API. |
| Common behavior | Reuse the shared implementation when it has the same purpose and state contract. This includes drawer dismissal and focus return, selection, loading and accessible feedback. Product code supplies route selection, permissions and effects. |
| Product composition | Own the screen's layout, content hierarchy, navigation groups and available actions. Combine the shared parts to express the task. An editable preset is a starting point when a known composition fits. Its project-specific details stay in the product. |

When a role or state is missing, assemble the closest supported parts and record the gap. Extend the existing shared part when the missing behavior belongs to its contract. A new entry earns its place when it serves a distinct task or interaction.

## When a composition becomes shared

Review real examples from the projects that use the same function. Compare inputs, normal use, narrow layouts, keyboard operation and failure recovery. Extract the common input and behavior and keep project context in slots and callbacks. Supply an editable preset when the whole combination recurs. Test the shared result with its actual consuming examples and record which renderers support it.

Design review checks the reuse decision and the screen. Run `yogurt check` against the project's declared presentation paths. That command checks detectable source conventions such as the SDK pin, adapter, literal colors, palette references, typography and known component imports. Review identifies duplicated behavior and inaccessible combinations that require inspection of the screen and its implementation. [Consumer check](using-yogurt.md#check-a-consuming-project)

## Lessons applied in Yogurt

- The sidebar examples share collapse, modal dismissal and focus behavior. The project chooses a directory, agent roster or another composition using the same shell. A fixed sidebar would require each app to work around its fields and menu structure. [Sidebar composition](sidebar.md)
- A profile avatar and an agent silhouette convey different identities. The generic avatar's background covered the space around the agent's silhouette when they used the same style. Shared reuse must carry the same meaning as well as comparable geometry. [Workspace patterns](workspace-patterns.md)
- Two projects can have a source with the same local ID. The common project view preserves project scope and leaves authorization and selection with the host. [Workspace verification](engineering/controls/component-library/verification.md)

## Interface geometry

Use the spacing and corner scales in `design/tokens/brand.json` and give their applications named roles in `design/tokens/ui.json`. Use the generated CSS or Zig roles in the renderer. Match elevation to the UI layer. Use the low shadow for a raised control, the floating shadow for a picker and the panel shadow for a modal.

Stack independent rows with the stack gap and group neighboring controls with the inline gap. Use the tight gap for a label and its supporting content. Apply the layer inset to anchored menus, the panel inset to cards and the sheet inset to modal content. Use the inner radius for controls within another control, the control radius for fields and buttons, and the panel or sheet radius for the corresponding surface. Place icons and labels on a common centerline. Keep a control's hit area and the space it reserves stable while its state changes.

### Typography

Use Rethink Sans for interface text. Apply display and heading roles to titles, the action role to control labels and the body role to reading text. Use help and metadata roles for supporting information. Use the assigned tracking and line height to preserve hierarchy and readability in dense controls.
