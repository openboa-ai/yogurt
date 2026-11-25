# Composing a screen

Start with a real task and representative content. Identify what someone must recognize first, which facts they need to decide, and what action is available in the current state. Make a quick layout with that content before choosing controls. Use the project's installed Yogurt patterns and tokens to implement the layout.

Open `docs/screen-composition.md` in the pinned SDK for the desktop layout and action defaults, then use `docs/component-composition.md` to select component IDs or an editable recipe. If the pin predates those guides, use its design rules and component catalog. Resolve the selected IDs for the target before proposing imports or templates.

| User task | Start with | Check the layout at a smaller window |
| --- | --- | --- |
| Read or complete one focused task | Use one reading column. Place the main action next to the facts or input it acts on. | Keep the reading order and the relationship between the action and its subject. |
| Switch among several ongoing tasks | Give the task list and selected task distinct areas. Preserve the selected item when the user inspects a result or switches tasks. | Show one pane at a time when side-by-side reading becomes cramped. Preserve selection, scroll position and the return path as appropriate. |
| Compare several similar items | Align comparable values and labels. Choose a list or table when repeated rows carry the same kinds of information. | Keep the fields required for comparison available. Allow local table scrolling when the comparison needs two dimensions. |
| Check on ongoing work | Show identity and current state at a glance. Keep work that needs attention visible. Open evidence, logs or extra controls from the task they belong to. | Keep the state understandable at row size. Pair expressive motion with a readable status and preserve the route back to the task. |
| Review a result and recover from a failure | Keep the affected object, observed outcome and available recovery together. Give the next actionable step suitable emphasis. | Exercise cancellation, pending confirmation or a return to the task. Verify that surrounding context and focus survive in the relevant state. |

## From outline to layout

1. Use the first heading to orient the reader. Give each subsequent heading a job. Differentiate titles, body, metadata and actions through typography and placement. Place a timestamp beside the information it qualifies.
2. Use shared reading edges and spacing to group related elements. Give items within a group less space than the gap to the next group. Use a surface when the group has a distinct role or needs interaction affordance. Check the rhythm at the density the task actually needs.
3. Write with real labels and realistic values. Check long names, empty and partial data, and competing states. Keep a genuinely unavailable action secondary to the available recovery. Repeat status or source information only where a second point of use needs it.
4. When layouts compete, sketch both with the same content and work through the same task. Choose based on what someone can find, understand and do at the intended size. Carry the chosen reading and focus order into the narrow layout.

## Yogurt 0.2.0 foundation tokens and primitives

- **4-tier surface, text and border hierarchy (zero gradients, zero static shadows)**: Alabaster Light (`#F6F6F4` `canvas` / `#FAFAFA` `surface` / `#FFFFFF` `raised`) and deep carbon Dark (`#0B0B0D` `canvas` / `#0F0F11` `surface` / `#131316` `raised` / `#18181C` `elevated`/`popover`), with complete `paper` and `mist` overrides; 4 text levels (`--yg-text`, `--yg-muted`, `--yg-text-subtle`, `--yg-text-disabled`) and 4 border tiers (`--yg-border-subtle`, `--yg-border-control`, `--yg-border-strong`, `--yg-border-indicator`).
- **Monochrome Ink + Fixed Logo Primary Ink Blue + Warm Terracotta secondary**: Ordinary controls use Monochrome Ink (`--yg-inverse` / `--yg-on-inverse`). Lock OpenBoa Ink Blue (`slate.700` `#175174` fixed in Light and Dark with `#FFFFFF` ink) for filled `tone="brand"` primary CTAs (`--yg-brand` / `--yg-action`), and use adaptive `--yg-brand-ink` / `--yg-focus-ring` (`slate.700` `#175174` light / luminous `slate.300` `#79B3D6` dark) for brand text, links, icons, badges, and `:focus-visible` rings. Keep muted Warm Terracotta (`terracotta.600` `#A64F3C` light / `terracotta.300` `#D88F7D` dark) strictly secondary (`--yg-accent`), and operational signals (`success`, `warning`, `danger`) strictly separate from brand.
- **5-layer CSS `@layer` & Precision Cockpit geometry**: `@layer ui-sdk, yg.tokens, yg.base, yg.components, yg.patterns, yg.utilities;`; radii `7px` / `10px` / `12px` / `999px` (concentric menu/segment math); control heights `28px` / `32px` / `36px` / `44px`; `13px` UI body + `--boa-font-mono`; five motion roles (`press`, `indicator`, `layer`, `expand`, `settle`); unified `@ui-sdk/react` `Select` and `Popover`; segmented `Progress`, indexed `Trace`, context-chip `Composer`; curated 87-component `0.2.0` catalog.

## Six spatial placement grammar criteria

1. **Inline status proximity**: Place calm sentence-case status badges (`Owner`, `Scheduled`, `Unread`, `Needs attention`, `Waiting`) inline beside titles rather than floating on the trailing edge.
2. **Trailing action isolation**: Reserve the trailing edge strictly for interactive controls (`Select`, `ActionMenu` `...`, `Button`) or single comparable timestamps/values.
3. **Control baseline and height parity**: Match control heights (`28px`/`32px`/`36px`/`44px`) and bottom-align horizontal form rows (`FormRow`, invite bars, toolbars).
4. **Intrinsic action sizing**: Keep actions inside vertical stacks and card footers intrinsic-width (never stretched to 100%), with right-aligned `[Discard (quiet)] [Primary (filled brand)]` footer grouping.
5. **Framed hierarchy and material containment**: Center focused panels (`ProjectAccess`, `ProjectSettings`, `AgentProfile`, `DecisionReview`, `OperationsLibrary`, `AttentionInbox`, `CollectionBrowser`, `RunInspector`) inside flat framed `Card` surfaces (`--yg-container-medium`, zero static shadow), while full-width multi-pane workspaces (`AgentWorkspace`, `ProjectWorkspace`, `Sourdough Studio`) span the viewport with hairline dividers.
6. **Single reading edge and focus continuity**: Align titles, labels, rows, and primary content to one leading edge per pane; verify visible Ink Blue `:focus-visible` outlines, sibling focus stops, zero mount fly-in on `Tabs`/`SegmentedControl`, and focus return on dismissal.

## Review the result

On a real screen, ask a reviewer where they would look first, which facts belong together and what they would do next. Then operate the interaction at desktop (`1440px`) and narrow (`390px`) widths in both Light and Dark appearances across `neutral`, `paper`, and `mist` materials. Inspect keyboard focus (`:focus-visible` ring), control borders (`--yg-border-control`), disabled button hierarchy, text wrapping, contrast, zero horizontal overflow, and state after closing or recovering. Watch motion at normal speed and exercise reduced motion separately when motion carries a state. Record the screen, width, state and visible evidence behind the decision. Where the evidence is a still image, limit findings to what is visible in it.
