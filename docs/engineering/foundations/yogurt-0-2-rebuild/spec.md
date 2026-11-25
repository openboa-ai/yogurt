# Yogurt 0.2.0 · Design System Foundations and Core Component Rebuild

Design: ACCEPTED, revision 4 (Unified 231-Color Palette, Full-Pill Tactile Geometry, 3-Pane Bot Roster Studio & P0/P1 Component/Recipe Parity). Implementation: COMPLETE. Evidence for this change: 2× DPR Light and Dark audit sheets across all 87 core components, 14 editable recipes, live interactive overlay states, Sourdough Studio, and Guide; `check:tokens`, `check:ui` (87 components, 14 recipes, 672 contrast checks, 19 vocabulary entries), `design-sources.mjs` (4/4), `check:agents` (15 silhouettes, 45 variants, 6 states, 102,870 poses), and Playwright runtime/rubric verification gates passed.

## 1. Intent and Scope

Yogurt (`@openboa/yogurt`) is OpenBoa's single-source design system for browser and desktop WebView interfaces. Revision `0.2.0` rebuilds the foundation layer, cascade architecture, and production core components so that OpenBoa applications and agents compose coherent interfaces directly from public Yogurt primitives without per-screen CSS overrides.

Work proceeds in five verified phases:

- **Phase 0**: Clean baseline from `origin/main` (`7a35cde4`), dependency audit of `@ui-sdk/react@0.1.0-beta.13`, `Sourdough Studio`, and maintained recipes, and acceptance of this specification.
- **Phase 1 (Visual Review Gate)**: Token system (`brand.json`, `ui.json`, generators), CSS 5-layer `@layer` architecture, layout/focus/button-state fixes, and rebuild of the Core 20 components with Light and Dark multi-state visual audit verification.
- **Phase 2**: Rebuild of the remaining production core components, single-backend consolidation (`Popover`, removing `@openai/apps-sdk-ui`), and `0.2.0` catalog rationalization.
- **Phase 3**: Re-composition of maintained recipes and `Sourdough Studio` on `0.2.0` primitives and unified placement grammar.
- **Phase 4**: Guide redesign, skill/rule documentation sync, and automated Chromium + WebKit quality gates.
- **Phase 5 (Precision Cockpit & Color Token Hierarchy Rebuild)**: Rebuilt 4-tier color token hierarchy (crisp alabaster Light / deep carbon Dark luminance ladder, luminous calibrated Ink Blue primary brand signal, muted warm terracotta secondary accent retiring orphaned `indigo`, 4-level text and border hierarchies), zero CSS gradients, zero static card/panel drop shadows (floating transient layers only), tighter desktop precision density (`28/32/36/44px` controls, `7/10/12px` radii, `13px` UI body, `--boa-font-mono`), elevated component optical craft (`36×20px` switch, `16px` checkbox/radio/slider thumb, borderless/whisper-soft sentence-case badges, concentric menu/segment radii), segmented `Progress`, indexed `Trace`, context-chip `Composer`, 4-pane `Sourdough Studio` cockpit, and updated `/tokens` documentation.

## 2. Dependency and Primitive Audit

Verified against installed `@ui-sdk/react@0.1.0-beta.13`:

- Available headless behavior entries used by Yogurt core: `./button`, `./input`, `./textarea`, `./select`, `./combobox`, `./switch`, `./checkbox`, `./radio`, `./otp-input`, `./toggle`, `./tabs`, `./segmented-control`, `./menu`, `./popover`, `./dialog`, `./drawer`, `./slider`, `./progress`, `./accordion`, `./tooltip`, `./scroll-area`, `./field`, `./label`.
- Maintained `Sourdough Studio` (`apps/guide/examples/studio/`) consumes 49 public Yogurt symbols; maintained recipes (`packages/recipes/`) consume 65 public Yogurt symbols. All symbols remain supported across the phased transition without breaking builds during Phase 1.

## 3. Token System Contract

### 3.1 Warm Neutral Default Surface Ramp

The default `neutral` material uses a subtle warm neutral ramp with **no pure `#FFFFFF`** and **no heavy yellow cast**:

| Role | Light (`[0]`) | Dark (`[1]`) | Purpose |
| --- | --- | --- | --- |
| `raised` | `#FCFBFA` (`neutral.0`) | `#24221F` (`neutral.875`) | Cards, menus, popovers, active segmented pill |
| `canvas` | `#FAF9F7` (`neutral.25`) | `#161513` (`neutral.975`) | Primary page and workspace background |
| `surface` | `#F3F2EF` (`neutral.50`) | `#1D1C19` (`neutral.900`) | Secondary regions, recessed tracks, sidebars |
| `field` | `#ECEAE6` (`neutral.100`) | `#2B2925` (`neutral.850`) | Soft buttons, resting subtle fills, dark inputs |
| `hover` | `#E3E0DA` (`neutral.150`) | `#373530` (`neutral.800`) | Hover fills and pressed track surfaces |
| `text` | `#1C1B18` (`neutral.950`) | `#F2F0EC` (`neutral.75`) | Primary foreground text |
| `muted` | `#57544E` (`neutral.700`) | `#ACA89F` (`neutral.350`) | Secondary labels, help text, metadata |
| `inverse` | `#1C1B18` (`neutral.950`) | `#F2F0EC` (`neutral.75`) | Primary neutral buttons, active checks/switches/progress |
| `on-inverse` | `#FAF9F7` (`neutral.25`) | `#161513` (`neutral.975`) | Foreground on `inverse` |
| `thumb` | `#FCFBFA` (`neutral.0`) | `#F2F0EC` (`neutral.75`) | Switch and slider thumb fill |
| `off` | `#6B6760` (`neutral.600`) | `#7A756D` (`neutral.550`) | Off-state tracks and disabled indicators |

`materials.paper` and `materials.mist` override the complete surface, text, inverse, thumb, off, and border role set so no material leaks neutral tokens into elevated surfaces or borders.

### 3.2 Warm Ink Monochrome + Ink Blue Brand Accent

- **Ordinary controls** (`Button` neutral, `Switch`, `Checkbox`, `RadioGroup`, `Slider`, `Progress`, `Tabs`) use Warm Ink (`--yg-inverse` / `--yg-on-inverse`). The dark forest green fill on `Switch` is retired.
- **Ink Blue (`slate.750` `#175174`)** is reserved strictly for brand primary CTAs (`tone="brand"`), the unified `:focus-visible` ring (`--yg-focus-ring`), and unread/attention indicators.
- `slate.800` (`#134361`) and `slate.900` (`#0E354E`) preserve hue saturation on hover and press instead of desaturating into muddy gray-blue. In dark appearance, `--yg-action` resolves to a bright, legible slate step (`slate.300` or `slate.200`) with dark `--yg-on-action` (`slate.950`) achieving ≥ 4.5:1 contrast.

### 3.3 Semantic Status Roles and Tokenized Borders

- Semantic status roles (`danger`, `on-danger`, `danger-soft`, `success`, `success-soft`, `warning`, `warning-soft`, `accent`, `accent-soft`) use real chromatic hues from `brand.json` (`red`, `green`, `orange`, `slate`/`indigo`) with verified ≥ 4.5:1 contrast on both soft fills and canvas/surface/field backgrounds in Light and Dark modes.
- Tokenized border roles replace scattered `color-mix()` literals:
  - `--yg-border-subtle`: hairline separation for cards, rows, and dividers.
  - `--yg-border-control`: crisp resting boundary for inputs, selects, checkboxes, radios, OTP cells, and outlined surfaces, meeting WCAG 1.4.11 non-text contrast (≥ 3:1 against canvas/raised/surface or ≥ 3:1 against its adjacent surface).
  - `--yg-border-strong`: active, hovered, or emphasized control boundary (≥ 3:1 against canvas/surface/field in both Light and Dark).
  - `--yg-focus-ring`: single unified focus outline color (`slate.750` light / `slate.300` dark, ≥ 3:1 against canvas, surface, raised, and field).

### 3.4 Soft-Precision Typography, Radii, Density, Containers, and Motion

- **Type family**: `Rethink Sans` variable font.
- **Role weights**: `heading: 590`, `ui: 520`, `body: 430`, `value: 640`, `wordmark: 760`.
- **Role tracking**: `heading: -0.02em`, `label: -0.008em`, `body: -0.006em`, `meta: 0.004em`, `display: -0.028em`, `value: -0.024em`. Generated as `--yg-tracking-<role>` tokens alongside `--yg-font-<role>`.
- **Radii**: `inset: 4px`, `small: 6px`, `control: 9px`, `menu: 12px`, `panel: 16px`, `card: 16px`, `surface: 16px`, `popover: 12px`, `sheet: 20px`, `round: 999px`.
- **Control heights**: `compact: 32px`, `height: 36px` (regular), `comfort: 40px`, `touch: 44px`, `spacious: 48px`, `featured: 52px`.
- **Container tokens**: `compact: 360px`, `narrow: 480px`, `medium: 720px`, `wide: 1024px` (`--boa-container-*`, `--yg-container-*`).
- **System motion roles (5 canonical roles)**:
  - `press` (tactile button/control press and spring release)
  - `indicator` (tab underline, segmented pill, active selection highlight)
  - `layer` (menus, selects, popovers, dialogs, tooltips)
  - `expand` (disclosures, accordions, row reveal)
  - `settle` (switches, checkboxes, progress, ambient state transitions)

## 4. CSS 5-Layer `@layer` Architecture

`design/styles/ui.css` declares the cascade order at line 1:

```css
@layer ui-sdk, yg.tokens, yg.base, yg.components, yg.patterns, yg.utilities;
```

- `yg.tokens`: Generated `tokens.css` and `ui-tokens.css` inside `@layer yg.tokens`.
- `yg.base`: Font faces, `.yg-root`, resets, typography defaults, layout primitives (`.yg-stack`, `.yg-inline`, `.yg-grid`, `.yg-surface`, `.yg-divider`), and the **single unified `:focus-visible` ring** (`outline: 2px solid var(--yg-focus-ring); outline-offset: 2px`). No interactive component suppresses `:focus-visible` with `outline: none` unless an explicit equivalent focus ring is rendered on its wrapper (`:focus-within`).
- `yg.components`: Core component styles, never overridden by later base declarations.
- `yg.patterns`: Extended workspace, editorial, and motion pattern rules.
- `yg.utilities`: High-priority explicit utility/state overrides (e.g., density, alignment, reduced motion, forced colors).

### Layout & Interaction Invariants

- `.yg-stack` uses `display: flex; flex-direction: column;` with configurable `align?: "stretch" | "start" | "center" | "end"`. Direct inline controls (`Button`, `ActionMenu`, `Badge`, `SegmentedControl`, `Status`) do not stretch to 100% width by default inside `.yg-stack`.
- Disabled `Button` hierarchy:
  - `emphasis="quiet"`: remains transparent background with muted ink.
  - `emphasis="filled"`: retains its tone silhouette (`--yg-button-fill` / `--yg-button-ink`) at reduced opacity (`0.42`), preserving visual distinction between primary and secondary actions.
  - `emphasis="soft"`: retains `var(--yg-button-soft)` tint at reduced opacity (`0.48`).
- Active press on enabled `Button`: `scale: 0.98` on `:active` with spring release via `--yg-motion-press` (never clobbered by base `transition` rules).

## 5. Phase 1 Core 20 Component Contracts

1. **Foundations**: `Yogurt`, `Text`, `Heading`, `Stack` (flex column, `align`), `Inline` (`align`, `justify`, `wrap`), `Grid`, `Surface` (`density?: "compact" | "regular" | "spacious"`, `variant?: "surface" | "raised" | "canvas" | "outlined"`), `Divider`, `Icon` (including `more` icon).
2. **Actions & Forms**:
   - `Button`, `IconButton`, `ButtonGroup`.
   - `Field` (`layout?: "vertical" | "horizontal" | "responsive"` using `@container`), `FieldGroup`, `FormRow`.
   - `TextField`, `SearchField`.
   - `Select`: Custom `@ui-sdk/react/select` dropdown rendering identically in Chromium and WebKit (retiring Chromium-only `appearance: base-select`), accepting `size?: ControlSize` (with `controlSize` compatibility alias), `onValueChange` (with `onChange` compatibility), `placeholder`, `disabled`, `name`.
   - `Switch`: Warm Ink ON fill, `presentation?: "row" | "inset"` with working hover state, unified `:focus-visible` ring (5px inner dot removed).
   - `Checkbox`, `RadioGroup`: Crisp resting control borders (`--yg-border-control`), Warm Ink checked state, unified `:focus-visible` ring.
   - `InputOTP`: Crisp bordered cells (`--yg-border-control`), clear active/focus ring (`--yg-focus-ring`), verified confirmation state.
3. **Navigation, Layers, Lists, Feedback**:
   - `Tabs`: `presentation?: "underline" | "pill" | "dock"` defaulting to `"underline"`, unified `:focus-visible` ring.
   - `SegmentedControl`: Recessed track (`--yg-surface` with `--yg-border-subtle`), elevated active pill (`--yg-raised` with subtle lift shadow), zero initial-mount `(0, 0)` fly-in (`data-activation-direction="none"` suppresses transition on first placement), unified `:focus-visible` ring.
   - `ActionMenu`: Supports `selectionIndicator?: "leading" | "none"`, item `checked?: boolean`, `tone?: "neutral" | "danger"`, `separatorBefore?: boolean`, and `triggerVariant?: "button" | "more"` for low-emphasis `...` icon triggers.
   - `Card`: Flexible optional `title?`, `variant?: "raised" | "outlined" | "subtle"`, `headerAction?`, `action?` footer, working `density?: "compact" | "regular" | "spacious"`.
   - `List`, `ListRow`: Supports `inlineMeta?`, `value?`, `actions?`, `separator?`, `@container` narrow reflow, and sibling focus stops (interactive row activation never nests buttons inside buttons).
   - `Badge`: Pure Yogurt implementation (zero `@openai/apps-sdk-ui` dependency), supporting all `Tone` values and optional `variant?: "soft" | "outline"`.

## 6. Phase 2 Curated `0.2.0` Catalog and API Contracts

- **Package & Dependencies**: Bumped to `@openboa/yogurt@0.2.0-local.1`. `@openai/apps-sdk-ui` is completely removed from `package.json`, `package-lock.json`, `vite.config.mjs`, `build-ui.mjs`, and `build-ui-gallery.mjs`.
- **Curated `0.2.0` Catalog (87 entries)**: 38 consumer/mobile and redundant leftovers (`bottom-action`, `drawer`, `legend`, `gaze`, `activity`, `reading-anchor`, `aspect-ratio`, `direction`, `gradient`, `elevation`, `kbd`, `post`, `list-footer`, `bottom-info`, `highlight`, `toast-stack`, `amount-top`, `bar-chart`, `bubble`, `attachment`, `marker`, `input-group`, `split-text-field`, `numeric-spinner`, `rating`, `agreement`, `keypad`, `form`, `hover-card`, `command`, `menubar`, `navigation-menu`, `carousel`, `stepper`, `resizable`, `date-picker`, `questionnaire`, `table-row`) and showcase aliases (`FocusPicker`, `PlanSwitch`, `MorphTooltip`) are pruned from `catalog/components.json`, `catalog/motion.json`, and `registry/`. The 5 experimental motion toys (`CartButton`, `HoldButton`, `SlideConfirm`, `LoadingSuccessButton`, `ProfileCard`) are removed from root `packages/web/src/index.ts` (remaining available under `@openboa/yogurt/motion-patterns`), while `CopyButton` stays in root exports. All 87 retained entries cover the Phase 1+2 production core plus the exact symbols required by `Sourdough Studio`, maintained recipes, and the Yogurt guide.
- **Unified `Popover`**: Single implementation on `@ui-sdk/react/popover` supporting `{ label, trigger?, open?, defaultOpen?, onOpenChange?, side?, align?, sideOffset?, className?, children }` while preserving backward compatibility for `{ label, children }`. `DatePicker` migrated off Radix `Popover`.
- **Upgraded Phase 2 Controls**:
  - `Toggle`: resting `--yg-border-control` border and `--yg-input-surface` fill (never invisible floating text), Warm Ink pressed fill, `size?: ControlSize`.
  - `Slider`: Warm Ink track fill, crisp `--yg-thumb` thumb with Warm Ink rim, unified `:focus-visible` ring (replacing inner dot / `outline: none`).
  - `SelectionList`: `selectAllLabel?: string` master checkbox with indeterminate state.
  - `DataTable`: `kind?: "identity" | "text" | "numeric" | "role" | "actions"` and `align?: "start" | "end"` inside a `0.2.0` bordered card container with subtle row hairlines.
  - `Composer`: `resize: none`, elevated tactile surface (`--yg-raised` + `--yg-border-control` + `--yg-lift-shadow`), Ink Blue brand `Send` CTA (`sendTone?: "brand" | "neutral"`), `Cmd/Ctrl+Enter` submit.
  - `WorkEvent`, `RoutineRow`, `ThreadRow`: status badges placed inline beside titles; trailing edge strictly isolated for actions or timestamps.

## 7. Phase 3 Core Recipes and `Sourdough Studio` Grammar

- **`ProjectAccess`**: Framed `Card` + `FormRow` invite bar (`Email` + `Role` + `Invite` `tone="brand"`) + `List`/`ListRow` member rows (`Avatar` + inline `Owner` badge + matching-height role `Select` + `...` `ActionMenu` with `Copy member ID` and `Remove` opening `ConfirmDialog`) + companion `DataTable(Member | Role | Actions)` comparison in the guide.
- **`ProjectSettings` & `AgentProfile`**: Both framed in `Card` + `FieldGroup` with unified right-aligned footer `[Discard (quiet)] [Save changes / Save profile (filled brand)]`.
- **`OperationsLibrary` & `AttentionInbox`**: Status badges (`Scheduled`, `Needs attention`, `Waiting`, `Unread`) inline beside titles; trailing edge strictly for actions; underline `Tabs` default.
- **`ConversationPanel`**: Adopts Yogurt `<Composer>`.
- **`DecisionReview`, `CollectionBrowser`, `RunInspector`, `ArtifactLibrary`, `AgentWorkspace`, `ProjectWorkspace`**: Framed cards, intrinsic right-aligned actions, ID search in `CollectionBrowser`, `ListRow` `current` in `RunInspector`, sculpted unified 2-pane `AgentWorkspace` with soft compact `Computer` button.
- **`Sourdough Studio`**: Framed 3-pane desktop shell with hairline dividers, elevated active agent card, compact toolbar/search density, Ink Blue `Send` CTA, and aligned Settings/Tasks/Customers views.

## 8. Phase 5 Precision Cockpit & Color Token Hierarchy Contract

### 8.1 Rebuilt 4-Tier Color Token Hierarchy

1. **Tier 1 · Surface Luminance Ladder** (strictly monotonic separation across `neutral`, `paper`, and `mist`, eliminating duplicate steps; crisp alabaster Light + deep carbon Dark):
   - `canvas` (`neutral.50` `#F6F6F4` / `neutral.975` `#0B0B0D`), `surface` (`neutral.25` `#FAFAFA` / `neutral.950` `#0F0F11`), `raised` (`neutral.0` `#FFFFFF` / `neutral.900` `#131316`), `elevated` (`neutral.0` / `neutral.875` `#18181C`), `field` (`neutral.100` `#EFEFED` / `neutral.850` `#1F1F24`), `hover` (`neutral.150` `#E8E8E4` / `neutral.800` `#26262B`), `popover` (`neutral.0` / `neutral.875`).
2. **Tier 2 · 4-Level Text Hierarchy**:
   - `text` (`neutral.950` / `neutral.50`), `muted` (`neutral.600` / `neutral.350`), `text-subtle` (`neutral.500` / `neutral.500`), `text-disabled` (`neutral.350` / `neutral.600`). `text` and `muted` maintain ≥ 4.5:1 across all surface tiers.
3. **Tier 3 · 4-Level Border Hierarchy**:
   - `border-subtle` (`neutral.150` / `neutral.850`) for hairline dividers and static panel frames.
   - `border-control` (`neutral.200` / `neutral.800`) for resting inputs, selects, and subtle control edges (darkening to `border-strong` on hover).
   - `border-strong` (`neutral.500` / `neutral.400`, ≥ 3:1) for hovered/active control emphasis.
   - `border-indicator` (`neutral.500` / `neutral.400`, ≥ 3:1) for checkbox, radio, and indicator resting boundaries.
4. **Tier 4 · Semantic Color Sets** (complete `solid`, `hover`, `press`, `on-*`, `*-soft`, `*-soft-hover`, `*-border`):
   - **Monochrome Ink (`inverse`)**: default interactive chrome (`#0F0F11` Light / `#F3F3F0` Dark).
   - **Primary Brand OpenBoa Ink Blue (`brand` / `action`)**: `slate.750` `#175174` Light / luminous calibrated `slate.300` `#79B3D6` Dark (`slate.900` `#12212C` dark soft fill; `slate.950` `#081824` dark foreground).
   - **Secondary Warm Terracotta (`accent`)**: calibrated `coral.600` Light (≥ 4.5:1 across all light surfaces) / `coral.300` `#DF8B72` Dark (`coral.900` `#261814` dark soft fill). Retires orphaned `indigo` from `--yg-accent`.
   - **Operational Signals**: strictly separate from brand — `success` (`green`), `warning` (`orange`), `danger` (`red`), each with `*-border` and verified ≥ 4.5:1 contrast.

### 8.2 Zero Gradients, Flat Tonal Architecture, and Precision Density

- **Zero CSS gradients**: `design/styles/*.css` contains zero `linear-gradient` or `radial-gradient` declarations.
- **Shadow discipline**: Static cards, lists, tables, composers, and workspace panes use flat tonal luminance contrast plus `1px solid var(--yg-border-subtle)` with `box-shadow: none`. Tight shadows appear strictly on floating transient layers (`Popover`, `ActionMenu`, `Select` popup, `Dialog`, `Sheet`, `Toast`) and tiny optical thumb edges (`Switch`, `Slider`).
- **Precision density & typography**: `--boa-font-mono` token added; role weights (`heading: 620`, `ui: 530`, `body: 430`, `value: 640`, `wordmark: 760`), tighter tracking (`body: -0.006`, `label: -0.012`, `heading: -0.028`, `display: -0.032`, `meta: 0.04`, `value: -0.024`), precision radii (`inset: 4px`, `small: 5px`, `control: 7px`, `menu/panel/surface/card/popover: 10px`, `sheet/feature: 12px`), compact control heights (`compact: 28px`, `regular: 32px`, `row: 34px`, `comfort: 36px`, `touch: 44px`, `spacious: 44px`, `featured: 46px`), tighter UI scale (`ui/interface: 13px`, `help: 12px`, `caption: 11px`, `card-title: 15px`, `section: 20px`, `title: 28px`, `headline: 34px`).
- **Optical component craft**:
  - `Switch`: `36×20px` track, `16px` thumb, `2px` concentric inset.
  - `Checkbox` & `Radio`: `16×16px` indicator (`4.5px` checkbox radius), `1px` `--yg-border-indicator` resting edge, `1.75px` optical checkmark.
  - `Slider`: `16px` circular thumb (`1.5px` rim) on `3px` flat track.
  - `Badge` & `Status`: borderless/whisper-soft fills, `20–22px` height, `11.5px` sentence-case labels, `5.5px` status dots.
  - `SegmentedControl` & `Popover`/`ActionMenu`/`Select`: strict concentric corner math (`10px` menu − `4px` inset = `6px` option; `8px` segment track − `2.5px` inset = `5.5px` active pill), `28px` menu rows, Ink Blue checkmark.

### 8.3 Glass-Box Primitives and 4-Pane `Sourdough Studio` Cockpit

- `Progress`: adds `presentation?: "bar" | "segmented"`. `"bar"` renders a clean `4px` flat track; `"segmented"` renders a 16-cell flat telemetry bar (completed cells in `--yg-inverse`, leading active cell in `--yg-action`, remaining cells in `--yg-field`).
- `Trace`: renders structured indexed execution rows (`01`, `02`, `03` in `--boa-font-mono`, title, optional `latency`, flat status `<Badge>`, hairline dividers, zero native `<details>` markers).
- `Composer`: supports optional `contextChips`, `header`, and `shortcutHint` inside a tight hairline frame with Ink Blue focus halo and zero static drop shadow.
- `Sourdough Studio`: 4-pane precision cockpit on desktop viewports (`184px` compact Nav Rail + `226px` Thread Column with `Run quota` segmented meter + Main Execution Stream with `42px` header, `Review gate` status, `Stream | Trace | Diff` segmented switcher, structured `Trace`, `Source verification gate` card with left Ink Blue rule, segmented meter, and `Hold REG-04` / `Approve brief` actions, context-chip `Composer` + `254px` Live `Context & state` inspector open on wide desktop and collapsible at narrower widths).

### 8.4 Revision 4 · Unified 231-Color Palette, Tactile Pill Geometry, 3-Pane Studio & Core/Recipe Parity

- **Unified `21 × 11 = 231`-color palette (`50..950`)**: Complete gap-free scales across `neutral`, `paper`, `mist`, and all chromatic families in `design/tokens/brand.json`.
- **Fixed OpenBoa Ink Blue primary**: `--yg-brand` and `--yg-action` lock to OpenBoa's logo primary `#175174` (`slate.700`, `--yg-on-brand: #FFFFFF`, `8.4:1`) across both Light and Dark appearances, while `--yg-brand-ink` / `--yg-action-ink` / `--yg-focus-ring` adapt to `slate.300` in Dark for readable strokes, text accents, chart lines, and focus rings.
- **Even concentric radius scale & tactile geometry**: Enforced `{4, 6, 8, 12, 16, 20, 999}px` scale (`check-ui.mjs`), full-pill (`999px`) interactive buttons, icon buttons, search fields, toggles, toggle groups, segmented controls, pill tabs (default `Tabs` presentation), badges (with automatic `6px` semantic dot excluding pure counts), toasts, and circular calendar day selectors; `16px` shadowless static cards; `20px` floating capsule `Composer` with inline attachment pills and circular `+` / `↑` controls; `38×22px` borderless `Switch` with distinct `neutral.300 / neutral.700` off track; opaque neutral disabled filled buttons (`neutral.200 / neutral.800`).
- **Typography & live agent identity**: Preserves `Rethink Sans` (lightweight weights `heading 520 / body 420 / ui 500 / value 540`) and the full animated `AgentAvatar` family (15 silhouettes, 45 variants, 6 WAAPI presence states).
- **3-pane Bot Roster `Sourdough Studio`**: Consolidates the dual-sidebar 4-pane layout into a focused 3-pane desktop workspace (`268px` Bot Roster + Workspace sidebar with live animated `Kai`, `Sol`, and `Noa` rows · wide central execution stream with `Stream | Trace | Diff`, calm `Source verification gate`, and floating capsule `Composer` · collapsible `310px` `Kai's computer` inspector drawer) built exclusively from public Yogurt primitives.
- **Core component & 14-recipe parity**: Light resting inputs, active sidebar items, `Notice`, `CodeBlock` (monospace), `GridList` cells, `Navbar`, and Studio-promoted `RecordFacts` render on clean raised white (`#FFFFFF`) surfaces against warm stone (`#F4F4F1`) stages; `Combobox` adds a trailing chevron; `Table` scopes header tint strictly to `thead th, th[scope="col"]`; `Chart` renders in `--yg-brand-ink` with full short-series x-axis ticks and a clean pill summary; `AgentRow`, `WorkEvent`, `RoutineRow`, `RuntimePanel`, `RunInspector` (`@container` 2-column split + brand `Retry run`), `ProjectSettings`, `ProjectAccess`, `ProjectWorkspace`, `AttentionInbox`, and `ArtifactLibrary` align visually with Studio.

## 9. Verification and Acceptance Criteria

| Criterion | Verification | Target |
| --- | --- | --- |
| **Token Integrity & Contrast** | `npm run tokens && npm run check:tokens && npm run check:ui` | Strict luminance monotonicity across `neutral`, `paper`, `mist`, `slate`, `coral`; all Light & Dark text pairs reach ≥ 4.5:1; `border-indicator`, `border-strong`, `focus-ring`, `off`, and `thumb` on `off` reach ≥ 3:1 non-text contrast; zero `@openai/apps-sdk-ui` imports. |
| **Zero Gradients** | Static CSS check on `design/styles/*.css` | Zero `linear-gradient` or `radial-gradient` declarations in `design/styles/*.css`. |
| **Build & Source Boundaries** | `npm run build && npm run gallery && npm run guide:build && node --test checks/design-sources.mjs` | Zero TypeScript/esbuild/Vite errors; all source boundary tests pass. |
| **Cross-Engine Behavior** | `npm run check:web` (Chromium + WebKit) | 100% pass across all geometry, motion, accessibility, and hosted guide checks. |
| **Reference Privacy** | `reference_guard.py staged` | Zero external reference names or provenance in repository files. |
| **Phase 5 Visual Review** | 2× DPR 1440px Light & Dark captures | Visual verification of Studio 4-pane cockpit, Component Beauty Specimen Sheet, Core Recipes, and `/tokens` 4-tier hierarchy. |
