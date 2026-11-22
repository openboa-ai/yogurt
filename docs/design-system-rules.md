# Design system rules

OpenBoa products share Yogurt tokens, basic components and common interaction behavior. Each product combines those parts for its tasks, information and actions.

## One source for UI

This rule starts inside Yogurt. The guide, Studio, templates and examples are consumers of the same public components that products and agents install.

| What changes | Where to change it |
| --- | --- |
| A shared color, type, spacing, shape or motion value | Edit the palette and primitives in `design/tokens/brand.json` or the component roles in `design/tokens/ui.json`. Run `npm run tokens` to generate the CSS and Zig outputs together. |
| How a control looks, responds or moves in any state | Edit React in `packages/web/src` and its shared stylesheet in `design/styles`. For Native, edit markup in `packages/native/src/templates` or the catalog's typed Zig renderer in `packages/native/controls`. Vite and Next.js use the same web export. The component ID, guidance and default typed Native entry live in `catalog/components.json`. |
| How shared controls work together | Edit the reusable composition in `packages/recipes` when it is shared. A screen supplies its own content, layout, state and callbacks. |

Native controls and blocks use `@{role}` references for layout spacing in their authoring templates. Generation resolves these to SDK markup. Edit each block in `packages/recipes/<id>/view.native.in`. The corresponding `view.native` and `controls/items` files are distribution outputs.

A component preview imports the public entry for its target. Render focused, open, selected, disabled and loading states through that entry's inputs and events. When the preview needs a missing state or motion, add it to the shared component first. A compatibility entry keeps its existing API. The installer, guide and agent instructions identify the same default for new consumers.

Verify a shared fix at its public entry in a consumer and exercise the same interaction in the affected example. Record which renderer and state were exercised. A guide-only check covers that guide.

The Vite development guide watches the token sources. The Native guide launcher regenerates the platform outputs before choosing a cached build. `npm run check:tokens` compares both targets with the source without writing files. `node --test checks/design-sources.mjs` changes a token in a disposable copy and checks the guide's component imports. When an integration exposes a defect, keep the regression check with the lowest layer that owns the decision.

## Required reuse

| Layer | Product requirement |
| --- | --- |
| Tokens | Use the shared token for color, typography, spacing, corner radius, elevation and motion wherever the design system defines the role. Bind light and dark to semantic roles. Use project values for data and layout constraints, such as a document's reading measure or the width needed for a project column. |
| Basic components | Use the supported Yogurt component for an interaction that already exists on the target. A button, field, tab, dialog or menu should keep the shared semantics, focus and states. Supply the product's labels, data, icons and callbacks through its public API. |
| Common behavior | Reuse the shared implementation when it has the same purpose and state contract. This includes drawer dismissal and focus return, selection, loading and accessible feedback. Product code supplies route selection, permissions and effects. |
| Product composition | Own the screen's layout, content hierarchy, navigation groups and available actions. Combine the shared parts to express the task. An editable preset is a starting point when a known composition fits. Its project-specific details stay in the product. |

When a role or state is missing, assemble the closest supported parts and record the gap. Extend the existing shared part when the missing behavior belongs to its contract. A new entry earns its place when it serves a distinct task or interaction.

Use a component typography role for copy, fields, labels, actions and values. Web and Native share Rethink Sans, role sizes, natural tracking and line heights. Apply the action face to action labels and the body face to other text. Use the metadata role for compact context and the badge role for single-line indicators. Keep brand and wordmark typography separate from interface roles.

## Choosing and combining controls

The installed component catalog stores each reviewed control's `guidance` with its stable ID. It identifies an appropriate use, companion controls, an unsuitable use and states to check. The component guide presents the same guidance. Resolve the relevant IDs through the Yogurt skill's installed SDK lookup to retrieve the guidance alongside public imports or Native templates. The task pattern catalog describes complete workflows and their host-owned inputs.

Guidance is being added as components are reviewed. An entry without it is a documented coverage gap. Inspect the current component contract and target support before composing with it. An entry's guidance does not by itself qualify its renderer or grant an agent access to product data.

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

Use the [desktop composition draft](screen-composition.md) for shell, layout and action defaults, and the [component selection index](component-composition.md) to choose parts and editable recipes by purpose.
