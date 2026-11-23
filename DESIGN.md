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

- Use the Upright 9 company symbol and its B2 signature where the company signs a surface. The Rethink Sans family serves every text role. Keep the outlined 760 wordmark for the company nameplate. The food marks identify projects. A named agent uses its own face and silhouette. [Company signature](design/assets/logo/openboa-lockup.svg)
- Use neutral fills and ink for ordinary controls, hover, and selection containers. Use color to identify data, mark a threshold, or confirm a change of state. Give each state a word, mark, or position that carries its meaning. Choose the Upright 9 symbol’s Ink blue, `slate.750` (#175174), when a major action needs brand emphasis. Take hue and lightness from the single numbered palette shared by UI, charts, emoji, and agents. [Tokens](design/tokens/brand.json)
- Keep a product screen quiet enough to read at a glance. Give one consequence the primary action, keep supporting facts near the decision and put secondary detail behind a disclosure when it can wait. Use the existing control and touch dimensions. [UI roles and dimensions](design/tokens/ui.json)
- Write English product copy. Name the object and next action. A pending request can say “Request sent.” A verified result can name the effect. Keep the light touch for brand and project descriptions. Errors and permission messages should help someone recover. [Terms](design/content/terms.json)
- Use a short transition to explain a change of position or visibility. Respect reduced motion and keep the final state and focus legible. [Motion catalog](catalog/motion.json)

## Match the target

Build with the public React package in Next.js or Vite. A desktop app loads the same React UI in a WebView. [Native stack decision](docs/native-stack.md)

A Web CSS entry gives a class and semantic HTML. A web example gives a runnable local specimen. A guide example illustrates state choices with invented facts. A contract describes the intended behavior. The catalog records availability for each target. If the needed adapter is missing, record the gap and the proposed owner. A project may deliver a reviewed local implementation under its own name and evidence.

For a production dependency resolve the owning project’s accepted release and target. The SDK contains typed React exports. A production release requires the consuming project’s chosen pin and target checks. [Renderer evidence](docs/engineering/controls/component-library/verification.md)
