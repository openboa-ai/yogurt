# Desktop screen composition

Design draft for review. Use this guide to choose a Yogurt composition before styling a screen. Use the [component selection index](component-composition.md) for individual controls and the installed catalog for exact imports, properties and renderer support.

## Start from the task

Write one sentence specifying the person, the object and the action or information they came for. List the facts needed before they act. Decide which information stays visible, what should open on demand and which state survives a route change. Choose the shell and then compose its regions with existing parts.

| Task | Start with | Add only when the task needs it |
| --- | --- | --- |
| Read an introduction, guide or settings section | One reading column with PageHeader, section headings and Stack. | Add in-page links when the document has distinct sections people revisit. |
| Find a component, record or conversation | SidebarLayout, grouped destination items and one selected detail. | Add search for a long directory. Use a resizable pane only when people need to compare two substantial surfaces simultaneously. |
| Monitor or compare records | PageHeader, a filter region, then List or DataTable. | Add metrics or charts when they answer a named question. Put large sets of commands behind an ActionMenu. |
| Work with an agent | Persistent task or agent navigation, a transcript, a composer and readable activity near the relevant turn. | Open the inspector, outputs or execution trace when requested. Surface human decisions in the task that owns them. |
| Review and commit a consequential action | Keep the exact object and consequence together. Use ConfirmDialog with explicit alternatives and observed result feedback. | Use an existing decision or receipt recipe when it fits. Add a sheet when the person needs additional context before acting. |

## Shell, navigation and panes

A desktop shell can have three regions. The leading rail changes the current destination. The main pane carries the task. A trailing inspector describes the current selection. Each product owns its window chrome, destination hierarchy, route state and data.

- **Global destinations.** Use NavigationList or grouped NavigationMenu for addressable destinations. A small site index can use a flat row. Keep the product mark linked to home, the selected destination visible and global controls in a separate trailing slot. Use Navbar for a nested screen's back action. Use Menubar for desktop commands such as File or Edit. See [navigation selection](component-composition.md#navigation-and-window-layout).
- **Local navigation.** Use Tabs for distinct panels of the same object and SegmentedControl for one mode of the same surface. Use Breadcrumb when ancestors are meaningful routes. Preserve the selection on reload when it represents an addressable destination, and on return from a temporary layer when it represents local state.
- **Pane behavior.** Keep an independent scroll region only where a user benefits from keeping another pane visible. Keep headers and controls associated with their own scroll region. A resizable split needs meaningful minimum widths and keyboard operation. As width falls, reveal the inspector on demand, then move the directory into a drawer or preceding route when the task pane needs the space. Preserve selection, draft, scroll and focus where they belong.
- **One reading edge per pane.** Align the label or title, detail, controls and content to the pane's content edge. Align icons and text by their appropriate centerline or baseline. Give repeated rows stable leading, content and trailing slots. Indent child destinations under their parent.

## Type, density and surfaces

Use Rethink Sans and one page title per active screen. Apply display to the page name, heading to sections, body to reading text, action to controls and help or meta to supporting information. A featured brand intro may enlarge the title and include a project mark. Use tabular figures for numeric comparisons. Allow text to wrap before shrinking its assigned role.

| Relationship | Existing role | Design value |
| --- | --- | --- |
| Label and tightly related secondary text | tight gap | 4 |
| Control and label or closely related detail | control gap | 6 |
| Neighboring controls in one group | inline gap | 8 |
| Items in an ordinary stack | stack gap | 12 |
| Header details and a distinct action group | panel gap | 16 |
| Peer sections of a screen | section gap | 24 |
| Padding inside an ordinary card | panel inset | 18 |

Values are design pixels on Web and refer to the equivalent role when mapped to Native. Read the [UI bindings](../design/tokens/ui.json) rather than copying values into product styles. Choose regular control density by default; use compact for a genuinely dense desktop toolbar and the touch target for touch contexts. Keep related controls the same size. Use whitespace to group, a surface for independent content or a distinct interaction, and a divider where it clarifies a real boundary. Use neutral surfaces for canvas, focus, hover and selection by default. Use semantic palette roles for brand emphasis or meaningful signals. Keep focus visible and supply readable status text.

## Actions and overlays

| Situation | Composition rule |
| --- | --- |
| One clear next step | Give at most one action in the active group filled emphasis. Put it beside the content or facts it affects. Use a verb and object when committing a change. |
| Several alternatives | Use ButtonGroup for related actions and attach the group to the owning region. Use soft emphasis for a visible alternative and quiet emphasis for supporting actions. In an English confirm or edit group, put Cancel or Back before the filled commit. Preserve reading and focus order when the group wraps. Use initial safe focus for destructive confirmation. |
| Navigation and field state | A Link changes destination, a Button invokes an action, and a toggle or selector represents a value. An icon-only action needs an accessible name. Offer visible access to functions that also have shortcuts or context-menu entries. |
| Submission in a scrollable flow | Put commit actions after their inputs. Use BottomAction when the person would otherwise lose the action during scrolling. Check keyboard and focus behavior as well as the unobstructed final field. |
| Small anchored choice or contextual action | Use a select or combobox to choose a value, ActionMenu for related commands and Popover for small associated content. Anchor to the trigger. Keep supplemental hover content available through focus and another path where needed. |
| Blocking decision or substantial subtask | Use Dialog for a focused interruption and Sheet or Drawer for temporary detail that needs more space. Restore focus on dismissal and preserve the parent task. Keep pending and observed results distinct and keep retry attached to its failure. |

## Desktop recipes

| Screen | Composition and state to preserve | Acceptance |
| --- | --- | --- |
| Project workspace | SidebarLayout and grouped project destinations → task pane → optional inspector. Host owns the project, selected task, scope and unread state. | Switch projects, reopen a deep link, and resize or hide the inspector without losing the selected task or shifting its reading edge. |
| Agent conversation | AgentRow with identity and readable state → Transcript and Message → anchored Composer. Activity and Trace open near the relevant turn. Put structured output in the appropriate list, facts or table. | An interrupted stream leaves a readable partial result. Scrolling up stays put during streaming. The reader can return to newest, identify a blocker and perform recovery without guessing from motion. |
| Record collection | PageHeader → SearchField or FilterBar → ListRow or DataTable → selected details with RecordFacts. | Search, filter and clear independently. An empty filtered set, denied access and a failed read are distinct. Preserve query and selection across temporary detail. |
| Decision review | Context and observed revision → consequences → safe cancellation and explicit confirmation → Receipt or Result. | Cancel sends zero commits; a repeated activation creates at most one request. An unknown outcome keeps the original receipt available. |
| Settings | PageHeader and grouped fields. Separate immediate preferences from changes that require Save. | Changing an immediate preference affects only that setting. An invalid draft keeps input and reveals the local error and recovery. |
| Review and inspection | Main work and metadata stay in context. Use a secondary pane or Sheet for artifacts and run steps. Pair summaries with the original detail. | Switch between overview and evidence without losing the selected item. Distinguish loading, unavailable and inspected states. |

## Put the guidance to work

1. Resolve the task and renderer against the pinned SDK. Start with a matching editable block when its states and host inputs fit. Compose supported parts otherwise.
2. Keep route data, object fields, availability, commands and copy in the host. Use the component's public slots and props to preserve focus, motion, feedback and accessibility.
3. Extend a shared part when the missing slot or behavior belongs to its recurring purpose. Keep a one-off product layout local. When the same task repeats across products, promote its proven composition to an editable recipe and add a catalog entry.
4. Apply a new token only where an existing role cannot express the same relationship across consuming parts. Capture the mismatch on two related screens before introducing another role.

Vite and Next.js use the same Web API. Vercel Native expresses the same intent through its supported controls, theme roles and focus behavior. For example, use the installed `yg-top` and `yg-button-group` templates where supported. An installed entry proves availability of code. Verify appearance and interaction in the actual renderer before calling the experiences equivalent.

## Document and review a composition

Start each guide with the task and a complete diagram or example showing required and optional regions. Follow with selection rules, variants and their triggers, allowed slots and host inputs, then states and recovery. End with keyboard and focus behavior, long text, narrow widths, dark appearance, reduced motion and support by renderer. For an atomic control, keep only the sections that affect how it is used.

Compare two peer screens at normal desktop size and a narrow desktop window. Verify the reading edge, role assignments, focus order and return, action emphasis, loading and empty or error states, and the stability of adjacent content during transitions. Use actual labels and realistic data. Record the component IDs, renderer and states exercised. A static capture can show hierarchy and geometry. Keyboard, focus, changes and recovery need an interaction check.

## Apply this to the Yogurt guide

- **Shared header.** Use a persistent shell with a home link, addressable section destinations and the theme action in its own slot. The same destination order carries into a compact menu.
- **Brand home.** Project mark beside the Yogurt title, followed by the slogan and the description. Group entry links next to the introduction. Continue into the existing OpenBoa story.
- **Foundations and design sources.** Share one content width and title rhythm, then use in-page navigation, readable sections and named asset links.
- **Component catalog and detail.** Use a searchable grouped directory, PageHeader, one live preview, and guidance in purpose → anatomy → variants → states → platform order. Show supported motion where the control is used.
- **Project use.** Organize installation and verified recipes by renderer. Route old standalone demo addresses to the relevant supported guidance.
