# Component selection index

Design draft for review. Use stable IDs below to resolve the exact Web or Native entry in the installed catalog. Read [desktop screen composition](screen-composition.md) first for shell, typography, gaps and action order. Each row explains a choice or combination. The catalog owns the API, individual usage guidance, and renderer availability.

## Layout and foundations

| IDs | How to combine them |
| --- | --- |
| `yogurt`, `direction` | Scope one compatible theme at the product surface. Let the reading direction govern placement, text and directional icons. Avoid mirroring content that carries an absolute direction. |
| `text`, `heading`, `post` | Assign hierarchy before size. A heading introduces a section; text supplies its copy. Put sustained reading in a measured column with Post rather than shrinking it to control-label type. |
| `stack`, `inline`, `grid` | Use Stack for a vertical sequence, Inline for neighboring items that may wrap, and Grid for peer items that need common columns. Preserve reading and focus order as the layout reflows. |
| `surface`, `card`, `divider` | A Surface establishes a plane, a Card groups a standalone object, and a Divider clarifies a boundary. Use one grouping treatment for the same boundary. |
| `scroll-area`, `resizable` | Give ScrollArea a bounded pane. Choose Resizable when changing the relative space helps the task. Make resize and navigation available by keyboard and preserve the selected item across resize. |
| `aspect-ratio`, `asset`, `icon` | Reserve a known ratio for media. Use Asset for artwork and Icon for a control or recognized signal. Keep supplemental icons out of the accessible name when a label already supplies it. |
| `gradient`, `elevation`, `kbd` | Use Gradient for a needed visual transition and Elevation for actual layering. Kbd identifies a real available shortcut next to the action it duplicates. |

## Actions and overlays

| IDs | How to combine them |
| --- | --- |
| `button`, `icon-button`, `button-group`, `bottom-action` | Use a labeled Button by default. Use IconButton for a familiar, named action in a compact toolbar. Use ButtonGroup for actions affecting the same object and BottomAction for a persistent commit in a scrollable flow. |
| `toggle`, `toggle-group` | Represent persistent pressed states with Toggle and related pressed choices with ToggleGroup. Choose SegmentedControl for one active view mode. |
| `disclosure-row`, `accordion` | A DisclosureRow hides one detail beside its owner. Accordion groups peer expandable sections and can manage whether several stay open. |
| `action-menu`, `context-menu`, `command` | ActionMenu groups secondary commands at an explicit trigger. ContextMenu duplicates common actions for pointer or keyboard convenience. Command searches named commands or destinations across a broader scope. Keep confirmable effects behind their normal confirmation. |
| `popover`, `tooltip`, `hover-card` | Popover provides a small interactive layer. Tooltip supplies brief auxiliary text. HoverCard gives a richer preview that users can also reach through focus or a visible link. |
| `dialog`, `sheet`, `drawer` | Dialog interrupts for a bounded response. Sheet provides a temporary side workspace; Drawer represents a temporary sliding surface suited to its target. Preserve content, dismissal and focus restoration across presentations. |
| `confirm-dialog`, `receipt` | Confirm the precise effect and current object before sending. Track the original submission with Receipt and keep uncertain outcomes visible until resolved. |

## Input and settings

| IDs | How to combine them |
| --- | --- |
| `form`, `field`, `label`, `help-text`, `field-error` | Form owns submit. Each Field keeps a label, control, guidance and local error together. Present the error at the field and keep drafts on correction. |
| `text-field`, `textarea`, `search-field` | Use one line for a short value, multiline for prose and SearchField for query plus clear. Search filters an explicit scope and keeps the query discoverable. |
| `input-group`, `split-text-field`, `input-otp` | Attach a unit or adjacent action with InputGroup. Use SplitTextField for independent labeled parts of one value. Use InputOTP for one code with an editable read order and paste support. |
| `select`, `combobox`, `radio-group` | Use Select for a short stable list, Combobox when finding an option needs search, and RadioGroup when alternatives should be visible and compared. Maintain one selected value. |
| `checkbox`, `switch`, `agreement` | Use Checkbox for independent membership or a draft boolean, Switch for an immediate binary setting, and Agreement for named consent choices. Preserve partial and unavailable states where applicable. |
| `slider`, `numeric-spinner`, `rating` | Use Slider to adjust a bounded range; pair with an exact input if precision matters. Use NumericSpinner for stepwise numeric edits and Rating for an ordinal evaluation with named scores. |
| `keypad`, `calendar`, `date-picker`, `questionnaire` | Use Keypad for focused numeric entry, Calendar to expose a date grid, DatePicker to enter a date inline or in a layer, and Questionnaire for a sequence of questions with progress and return. |

## Navigation and window layout

| IDs | How to combine them |
| --- | --- |
| `link`, `navigation-list`, `navigation-menu` | Link has an actual destination. NavigationList groups peer routes and marks the current route. NavigationMenu groups several routes under categories when grouping improves discovery. |
| `navbar`, `breadcrumb`, `menubar` | Navbar provides back navigation in a nested screen. Breadcrumb shows addressable ancestors. Menubar groups desktop commands. Keep project identity and product-wide destination links in the persistent shell. |
| `sidebar-layout`, `sidebar` | Use SidebarLayout for a shared application frame, with its SidebarContent, group, submenu and item parts as appropriate. Use Sidebar for a simple expandable directory. Maintain the same active destination across full, rail and compact modes. |
| `tabs`, `segmented-control` | Panels of the same object go in Tabs. Modes of one surface go in SegmentedControl. Route navigation uses links and an active destination. |
| `pagination`, `carousel`, `stepper` | Pagination advances collection pages with stable filters. Carousel moves through a finite content set with visible controls. Stepper communicates ordered task progress. Each keeps position apparent. |

## Page and collection anatomy

| IDs | How to combine them |
| --- | --- |
| `top`, `list-header`, `list-footer` | PageHeader establishes the page title and context. ListHeader and ListFooter belong to a collection and keep collection actions near their scope. |
| `filter-bar`, `count`, `empty-result` | Apply filters to one collection, show its result count, and explain whether it is empty or simply has no matches. Offer the relevant recovery. |
| `list`, `list-row`, `selection-list`, `grid-list` | Use a list for ordered scanning, ListRow for aligned anatomy and SelectionList for choosing rows. Use GridList when comparable tiles benefit from two-dimensional layout. Keep secondary row actions accessible without hover. |

## Feedback and data

| IDs | How to combine them |
| --- | --- |
| `badge`, `status`, `highlight` | Badge tags or counts, Status describes an observed condition, and Highlight marks relevant text in place. Keep meaning legible without color. |
| `skeleton`, `spinner`, `progress` | A Skeleton reserves the known geometry of incoming content. Spinner indicates ongoing work when quantity is unknown. Progress shows measured advancement or states that the measure is indeterminate. |
| `notice`, `result`, `bottom-info` | Put Notice next to an affected task, Result at a meaningful outcome, and BottomInfo where supporting context naturally follows the main content. Name the available next action. |
| `toast`, `toast-stack` | Use Toast for transient, non-blocking feedback. Use ToastStack for coordinated notices across events. Put critical failure or required action back into the task's persistent region. |
| `record-facts`, `amount-top` | Use RecordFacts for interpretable labels and values with source context. Use AmountTop for a quantity that needs primary reading weight and a unit. Unknown values stay explicit. |
| `table`, `table-row`, `data-table` | Use Table and TableRow for aligned facts. Use DataTable when users need collection operations such as sorting or selection. Keep filter and pagination state explicit. |
| `chart`, `bar-chart`, `legend` | Chart serves an observable relationship and BarChart compares values from a common basis. Use a Legend when series cannot be labeled directly. Pair visual data with readable values or an equivalent description. |

## Identity, conversation and workspaces

| IDs | How to combine them |
| --- | --- |
| `project-mark`, `avatar`, `agent-avatar`, `gaze` | Identify a project, person or agent with its matching artwork. Gaze can express agent state. Keep the name and readable state available regardless of artwork or motion. |
| `message`, `bubble`, `transcript`, `reading-anchor` | Message identifies the author and content, Bubble is a presentation within the exchange, Transcript owns the reading sequence and ReadingAnchor returns to the newest item on demand. |
| `activity`, `marker`, `trace`, `code-block`, `attachment` | Show readable activity near its object, markers for meaningful transcript boundaries, and Trace for inspectable observed steps. Render code and attachments as named artifacts with appropriate copy, open or download actions. |
| `agent-row`, `thread-row`, `resource-row` | AgentRow identifies a persistent agent and its state, ThreadRow identifies a conversation, and ResourceRow identifies an artifact or resource. Align state, timestamp and trailing actions within each type. |
| `runtime-panel`, `work-event`, `routine-row` | RuntimePanel shows current execution context on demand. WorkEvent represents one observed occurrence. RoutineRow represents a standing schedule or trigger. A scheduled action and its last result are distinct facts. |
| `composer`, `voice-control` | Keep the draft and submit lifecycle in Composer. VoiceControl represents its own recording state and explicit stop action. Keep attachments, approval state and any pending response visible in context. |

## Interactive Web patterns

Use these when the specialized interaction is part of the task. Keep the surrounding layout and copy roles shared. The [motion catalog](../catalog/motion-components.json) owns support and the stable import path. Verify interruption, keyboard input and reduced motion where the effect conveys state.

| IDs | When to choose them |
| --- | --- |
| `motion-mention-picker`, `motion-ghost-suggestion`, `motion-prompt-box`, `motion-letter-limit` | Choose a mention for explicit insertion, a ghost suggestion for optional completion, PromptBox for a bounded prompt and LetterLimit when remaining room affects editing. Preserve the draft and caret. |
| `motion-file-drop` | Pair drag and drop with a picker. Report selection, upload progress and the actual result separately. |
| `motion-focus-picker`, `motion-plan-switch`, `motion-spring-dropdown` | Use these for named focus modes, plan choices or a compact anchored choice respectively. Keep selection confirmation separate from billing or other committed changes. |
| `motion-morph-tooltip`, `motion-morph-tooltip-bar`, `motion-command-button` | The tooltip patterns disclose hints near tools, while CommandButton opens executable choices. The same purpose must remain available with keyboard focus. |
| `motion-storage-meter`, `motion-stat-card`, `motion-activity-island` | Use a storage meter for a measured capacity, a stat card for a labeled metric and activity disclosure for changing work. Keep the numeric or textual meaning present throughout motion. |
| `motion-loading-success-button`, `motion-copy-button`, `motion-hold-button`, `motion-slide-confirm`, `motion-cart-button` | Use dedicated controls when their state and action differ from Button. Check success only after the observed effect, provide operable alternatives to gesture-only confirmation and respect quantity limits. |
| `motion-streaming-reply`, `motion-thinking-indicator`, `motion-task-list` | Stream content only as it arrives, indicate thinking as a distinct state and list observable task progress with named recovery. Avoid layout jumps or losing position during updates. |
| `motion-expand-card`, `motion-fan-cards`, `motion-profile-card` | Expand an object in place, fan a small related set or preview a person respectively. Keep the accessible reading order and a predictable return path. |
| `motion-range-slider`, `motion-detent-dial`, `motion-password-strength`, `motion-checkbox-list` | Use a range for two bounds, a dial for discrete steps, strength for measured password guidance and a checkbox list for independent choices. Keep values and feedback readable without relying on position or color alone. |

## Editable screen recipes

Choose from the [block catalog](../catalog/blocks.json). A recipe is an editable starting point. Keep shared control behavior and supply the selected object's actual data, access and effects from the product.

| IDs | When to start with them |
| --- | --- |
| `project-settings`, `project-access` | Use settings for preferences and editable configuration. Use access for roles and permissions with explicit effects. |
| `collection-browser`, `artifact-library` | Use the collection browser for finding a record and viewing its details. Use the artifact library for finding and inspecting outputs. |
| `decision-review`, `attention-inbox` | Review one decision when its object and consequence are known. Use an inbox when several tasks need a person's attention and each has its own recovery path. |
| `conversation-panel`, `agent-workspace`, `agent-profile` | Use the conversation for exchange, the workspace for continuing agent work, and the profile for identity and settings. |
| `project-workspace`, `operations-library`, `run-inspector` | Use the project workspace for scoped work, the operations library for events and routines, and the run inspector for evidence about one execution. |
| `agent-sidebar`, `project-sidebar` | Choose the sidebar by what the user is switching between. Keep scope and active destination visible at every size. |
