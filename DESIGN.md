# Design with yogurt

Start with what a person came to do. Yogurt gives them familiar controls, language and feedback across OpenBoa products. Your product decides what information to show, what the person is allowed to do and what actually happened. [Why Yogurt exists](docs/design-system-rules.md#why-yogurt-exists) · [Brand contract](catalog/brand.json)

## Compose screens

1. Find the task in your pinned catalog. Read the control's use, companion parts, states and target support. Use its public default and pass the real labels, values and actions. For example, use a select to keep a chosen setting and an action menu to run a command. [Component inventory](catalog/components.json) · [Use the SDK](docs/using-yogurt.md)
2. Compose the screen from those parts. Use public slots for content and shared roles for spacing and type. An editable preset can supply a familiar arrangement. Keep the product's routing, permissions and effects in the host. [Sidebar composition](docs/sidebar.md) · [Editable blocks](catalog/blocks.json)
3. Exercise the result in context. For a card with an action menu, use the real label, open the menu by keyboard, dismiss it and check where focus returns. If the control fails, report its ID, pin, target, input and observed result to Yogurt. If the menu works and the wrong record opens, fix the host's callback. [Ownership and reuse](docs/design-system-rules.md#one-source-for-ui)

## Find the task

For desktop screens, start with the [screen composition guide](docs/screen-composition.md) and look up the chosen parts in the [component selection index](docs/component-composition.md).

| The person wants to… | Start here |
| --- | --- |
| Search a collection and return from a detail | `pattern.find-records` and the [collection browser recipe](docs/screen-composition.md#collections-and-detail) |
| Understand a record, its source and how current it is | `pattern.inspect-record` |
| Make a decision that changes something | `pattern.review-decision` |
| Find out what happened after a command was sent | `pattern.track-request` |
| Adjust preferences or save a group of changes | [Settings composition](docs/screen-composition.md#settings) |
| Read a conversation and respond in a workspace | [Conversation composition](docs/screen-composition.md#conversation-and-workspace) |

Run `node scripts/describe-pattern.mjs --list` from the installed SDK root. For example, `node scripts/describe-pattern.mjs pattern.review-decision web` returns the product inputs, parts, state rules, copy, keyboard behavior and acceptance examples. The selected target reports installed file availability alongside the documented support level. Record the chosen pattern IDs and the actual renderer evidence alongside the project's intent. [Pattern catalog](catalog/patterns.json)

## Carry the identity into a screen

- Use the Upright 9 company symbol and its B2 signature where the company signs a surface. The Rethink Sans variable font serves every text role (`heading: 520`, `ui: 500`, `body: 420`, `value: 540`, `wordmark: 700`), paired with `--boa-font-mono` for indices, identifiers, and telemetry. Keep the 700 wordmark for the company nameplate. The food marks identify projects. A named agent uses its own face and silhouette. [Company signature](design/assets/logo/openboa-lockup.svg)
- Build on Yogurt `0.2.0` **4-Tier Color Token Hierarchy** with flat tonal separation and **zero CSS gradients**:
  1. **Surface luminance ladder**: Default `neutral` Light (`#FFFFFF` `canvas`/`raised`/`input-surface`/`elevated`/`popover`, `#F4F4F1` `surface`/`field`, `#E5E5E0` `hover`/`backdrop`) and obsidian Dark (`#0A0A0D` `backdrop`/`surface`/`input-surface`, `#131317` `canvas`/`raised`, `#1D1D22` `elevated`/`popover`/`field`, `#2A2A30` `hover`), with complete `paper` and `mist` material overrides. Static cards and panels use flat luminance contrast plus `1px` hairlines with zero drop shadows; tight shadows appear only on floating transient layers (`Popover`, `ActionMenu`, `Select` popup, `Dialog`, `Sheet`, `Toast`).
  2. **4-level text & 5-level border hierarchies**: `--yg-text`, `--yg-muted`, `--yg-text-subtle`, `--yg-text-disabled`; `--yg-border-subtle` (hairlines), `--yg-border-chrome` (chrome frames), `--yg-border-control` (resting controls), `--yg-border-strong` (hover/emphasis ≥ 3:1), `--yg-border-indicator` (checkbox/radio ≥ 3:1).
  3. **Monochrome Ink + Fixed Logo Primary Ink Blue + Warm Terracotta secondary**: Use Monochrome Ink (`--yg-inverse` / `--yg-on-inverse`) for ordinary controls (`Button` neutral, `Switch`, `Checkbox`, `RadioGroup`, `Toggle`, `ToggleGroup`, `Tabs`, `Composer` Send, `Toast`). Lock **OpenBoa Ink Blue** (`slate.700` `#175174` fixed in both Light and Dark with `#FFFFFF` text) for filled brand primary CTAs (`tone="brand"`, `--yg-brand` / `--yg-action`), and use adaptive readable `--yg-brand-ink` / `--yg-focus-ring` (`slate.700` `#175174` light / luminous `slate.300` `#79B3D6` dark) for brand text, icons, badges, charts, progress fills, unread dots, and `:focus-visible` rings. Disabled filled buttons use opaque neutral step-down (`neutral.200` light / `neutral.800` dark + `--yg-text-disabled`, `opacity: 1`); Switch off tracks use `neutral.300` (`#C5C4BD`) light / `neutral.700` (`#2A2A30`) dark. Use muted **Warm Terracotta** (`terracotta.600` `#A64F3C` light / `terracotta.300` `#D88F7D` dark) strictly as a secondary accent (`--yg-accent`), never replacing Ink Blue.
  4. **Operational status signals**: Keep `success` (`green`), `warning` (`orange`), and `danger` (`red`) strictly separate from brand color. [Tokens](design/tokens/brand.json)
- Follow **even concentric geometry** (`{4, 6, 8, 12, 16, 20, 999}px`): `4px` inset, `6px` small/chip, `8px` control radius, `12px` menus and panels, `16px` cards/surfaces/popovers/sheets, `20px` feature/composer capsules, `999px` pills/buttons/tabs/toasts; `28px` compact, `32px` regular, `36px` comfortable, and `44px` spacious/touch control heights; `13px` UI body; and container widths (`360px` / `480px` / `720px` / `1024px`). CSS rules live inside five deterministic `@layer` buckets (`yg.tokens`, `yg.base`, `yg.components`, `yg.patterns`, `yg.utilities`) after `ui-sdk`, with unified `@ui-sdk/react` `Select` and `Popover` primitives across Chromium and WebKit. [UI roles and dimensions](design/tokens/ui.json)
- Keep a product screen quiet enough to read at a glance using the curated `0.2.0` catalog (87 components, 14 recipes). Place status badges inline beside titles, isolate trailing edges for actions or timestamps, match control heights on horizontal rows, keep actions intrinsic-width, frame focused panels in cards, and preserve a single leading reading edge. [Screen composition](docs/screen-composition.md)
- Write English product copy. Name the object and next action. A pending request can say “Request sent.” A verified result can name the effect. Keep the light touch for brand and project descriptions. Errors and permission messages should help someone recover. [Terms](design/content/terms.json)
- Use Yogurt's five canonical motion roles (`press`, `indicator`, `layer`, `expand`, `settle`) to explain changes of position or visibility. Respect reduced motion, suppress mount fly-in on active indicators, and keep the final state and keyboard focus legible. [Motion catalog](catalog/motion.json)

## Match the target

Build with the public React package in Next.js or Vite. A desktop app loads the same React UI in a WebView. [Native stack decision](docs/native-stack.md)

A Web CSS entry gives a class and semantic HTML. A web example gives a runnable local specimen. A guide example illustrates state choices with invented facts. A contract describes the intended behavior. The catalog records availability for each target. If the needed adapter is missing, record the gap and the proposed owner. A project may deliver a reviewed local implementation under its own name and evidence.

For a production dependency resolve the owning project’s accepted release and target. The SDK contains typed React exports. A production release requires the consuming project’s chosen pin and target checks. [Renderer evidence](docs/engineering/controls/component-library/verification.md)
