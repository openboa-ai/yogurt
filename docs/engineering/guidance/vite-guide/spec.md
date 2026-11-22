# Yogurt web guide runtime

The owner selected React and Vite for the Yogurt website, React with Next.js or Vite for consuming web projects, and Native SDK for native applications. The guide is a static Vite application deployed on Vercel. The web component package and design tokens remain independent of the consuming web host. Native uses its own adapter and is qualified separately.

## Routes and compatibility

The component catalog uses `/components` and `/components/<component-id>`. Installable motion controls with examples appear in the component catalog. Former motion and comparison addresses resolve to the matching control or the component index. Former workflow addresses resolve to the product playbook. Static guide sections use extensionless paths such as `/system` and `/agents`. The root remains the brand introduction. Valid deep links must work on direct entry, refresh, back and forward. Unknown component and pattern IDs must not silently display a different item under the unknown URL.

Existing `components.html#<id>` and `motion-patterns.html#<id>` links remain usable, including in the packaged offline guide. The online guide converts navigation to the extensionless canonical routes. Legacy static files needed by previously published URLs remain available. Keep asset paths correct at a nested route and do not rewrite API, asset or unrelated paths to an app shell.

## Build and boundaries

The hosted guide uses one Vite entry and a persistent Yogurt shell for Brand, Design system, Components, Design sources and supporting guides. The Yogurt project mark identifies the guide in the masthead and browser tab. The home and README present “ships with live cultures” as the tagline, followed by a plain description of the OpenBoa design system and UI SDK. Keep the OpenBoa signature, shelf-life line, About copy and remaining brand story under the brand content. Keep existing example behavior, authoring sources, asset downloads and offline galleries. Route changes preserve the shared shell and support keyboard navigation, browser history, old URLs and direct links; the guide owns no product data or commands.

The normal development server and online interactive guide build use Vite with React. Existing static guide documents and offline packaged examples remain part of the build; no server-side rendering, database, runtime service or production data is required. The SDK build and its individual imports stay independent of Vite and Next.js. Source changes must reach the deployed artifact through the Vercel build, and no credentials or local absolute paths belong in the output.

The hosted Brand route composes the original Yogurt artwork, cover typography, section navigation, company signature, asset panels, resource links and disclosures using shared Yogurt components. Preserve the existing brand story and deep links. The masthead uses the shared section Navbar. Collapse it before links wrap, open a full-width list on compact screens, move focus into it when opened with the keyboard, and return focus on Escape. Keep shared page gutters and actions across hosted sections. Use the Yogurt project mark in the tab and keep the OpenBoa signature inside company content.

## Acceptance

Templates opens a continuous gallery of 64 live Yogurt compositions in two boards of 33 and 31 cards. The page scroll exposes every card directly, with multiple columns on wide screens and a single column on narrow screens. Keep each card interactive and independent. Earlier family, specimen and study addresses remain available for direct access. Earlier dashboard, navigation and account examples remain available through direct links. Examples opens an interactive Sourdough studio with conversations and channels, agent and thread management, tasks, workflow editing and approval, a schedule, usage, file previews, providers, a customer register, an extension catalog, help and settings. Keep the focused Sourdough research example at its existing URL. Studio changes are reversible session-local fixtures. Creation, uploads, execution, approvals, usage and connections simulate their UI state only. They must never request credentials, access hardware, connect to services, upload user data or execute a model, workflow or system action. Preview actions operate on local sample data, with no request to a product service. Keep the preview reviewable in a narrow window, through keyboard operation, and in both appearances.

The Studio app frame keeps navigation, the current work area and conversation input within the desktop viewport. Below the desktop breakpoint, the document scrolls, navigation uses the sidebar drawer and conversation inspection uses a sheet. Agent rows keep the name, current state and a short work preview together. Messages distinguish authored turns, surface message actions on focus or hover, and offer a jump to latest only when more content is below the reader. Switching an app view or thread keeps local state and uses a brief reveal. The workflow editor visually connects ordered steps and retains the selected step during editing. Panel, selection and message feedback honor reduced motion. Agent artwork and existing gaze animation remain independent of shell motion.

Use the shared Navbar with its NavigationList destinations, PageHeader, Button, ButtonGroup, Link and spacing roles in the hosted guide wherever their intent matches. Page titles use the display role and one reading edge. A group has one filled action at most. In reading and focus order, secondary actions precede the primary action, including when a row wraps. Links keep browser navigation; buttons invoke local actions. Document the same composition rules for Web and Native consumers and expose a live example on the system page. The branding introduction may use the larger featured title. Verify the rule against all hosted page families at narrow and wide widths, including action order, title hierarchy and spacing. Native implementation and visual verification remain a separate requirement.

Build from the locked dependencies. Exercise direct routes, navigation, reload, back/forward and legacy hashes at desktop and narrow widths, and verify unknown routes. Verify interactive specimens, local offline documents and static assets remain available. Run the existing component and gallery checks. Validate the package with representative Vite and Next.js consumers separately; a build or token export alone is not native-runtime evidence. Share the running guide before updating the draft preview. No merge or production deployment is authorized by this specification.

## Hosted route ownership

Every maintained guide route renders through the Vite React entry. Compose page layouts with the public Yogurt components and use their focus, selection and appearance behavior for controls. Token, artwork and example data may have guide-specific presentation, using Yogurt components for the surrounding controls. Offline source files remain available as exported artifacts. The hosted routes may not load their HTML, scripts or page styles.

Verify this boundary in Shared UI sources. Check the actual hosted menu after navigating through every top-level and supporting route, in both appearances. The current destination uses the NavigationList selection treatment. Exercise the palette, roster, artwork options, emoji picker and playbook in the hosted guide through their public controls, including direct links and a recovery path.

## Brand book and reference guide

The home identifies Yogurt as OpenBoa’s design system ahead of an expressive text-only title. The original Yogurt artwork has its own field on the cover. Other project marks belong in the smaller family examples. Preserve the company story and brand language. Continue into a restrained manual with readable section titles, logo previews, plain usage instructions, and downloads beside the relevant assets. Use the Yogurt mark in the shared masthead and browser tab. The manual keeps its anchors and the original artwork files.

Use one masthead and one reading rhythm for the reference pages. A component page presents purpose, live specimen, usage guidance, and installation in that order. The template gallery and Studio keep their interactive examples. Use typography and alignment to group information. Reserve raised surfaces for a specimen, a distinct task, or the artwork's intended background.

The palette shows every hue family in one matrix. Align existing lightness numbers across rows and leave unavailable steps empty. Use the shared RadioGroup selection behavior and swatch presentation. Keep the numeric and hexadecimal values available, and let a person copy the selected CSS variable. The family selector changes the selection without filtering the matrix. At narrow widths, scroll the matrix within its own labelled area while keeping the family labels visible.

Verify the title and artwork in the home, its direct download links, the reading and navigation order across reference pages, and the real controls in the palette, component library, templates and Studio. Exercise direct URLs, narrow layouts, both appearances, keyboard selection and clipboard feedback. Check the packaged Web output as well as the built guide.

## Composition calibration

Let previews own their surfaces. A gallery frame identifies the composition and provides space around it, while the components within it demonstrate their packaged geometry. Wide data and workspace previews receive the available width. Keep the two gallery boards and all 64 direct specimens.

In Studio, honor the same shared control and surface roles. The compact conversation layout keeps the transcript and composer reachable with shorter labels that retain their full accessible names, and an item hidden by a filter cannot remain the active target of its adjacent actions without an explicit visible selection. Search results and collections reflect the same fixture changes. Verify these examples without introducing product effects or moving them outside the local fixture boundary.

### Composed screen review

Keep all 64 templates in reading order and give each composition only the width its contents need. Chart cards share a row with other specimens when space allows; broad workspace and record layouts can span the board. Keep visible title, controls and content on a shared reading edge. In Studio, use the same surface and inset roles to distinguish navigation, the conversation list, the content pane and overlays. Content remains reachable at narrow widths, and view and inspector transitions honor reduced motion.

### Studio conversation framing

Use one Studio toolbar for the workspace and the active conversation. Keep the two navigation controls distinguishable by accessible name and preserve conversation actions and history. In a narrow frame, let the toolbar wrap into two groups without compressing the text or touch targets. The transcript, reply context, and composer share a reading width. Keep short transcripts close to the composer and allow long transcripts to scroll without losing the composer or the jump-to-latest action. Keep the inspector focus behavior and the existing fixture boundary.
