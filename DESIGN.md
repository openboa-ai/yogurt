# Design with yogurt

Read the [brand contract](catalog/brand.json) for the canonical artwork, English vocabulary, palette and role sources. Use the same [component entry](docs/using-yogurt.md) in web and Zig product intents.

Start with the thing a person came to do. A project supplies the facts and actions it can actually support. Yogurt supplies the layout, wording, interaction and evidence for presenting them. The installed guide, catalogs and examples travel with the same SDK pin. [Design rules](docs/design-system-rules.md) · [Component and target inventory](catalog/components.json)

## Compose screens

Start with shared Yogurt tokens and basic components. Combine them in the project to suit its tasks, information and navigation. The project owns its content, route state and actions.

Use an editable preset when a common combination fits. An installed preset stays in the project, imports the same basic components and can be adapted alongside the other project views.

When several projects arrive at the same behavior, compare their inputs, states and recovery paths. Lift the common behavior into a shared component or preset when it supports the real uses in each project. Keep workspace-specific facts and actions with their owner. [Sidebar composition](docs/sidebar.md) · [Editable blocks](catalog/blocks.json)

## Find the task

| The person wants to… | Open this pattern |
| --- | --- |
| Find one item in a collection | `pattern.find-records` |
| Understand a record, its source and how current it is | `pattern.inspect-record` |
| Make a decision that changes something | `pattern.review-decision` |
| Find out what happened after a command was sent | `pattern.track-request` |

Run `node scripts/describe-pattern.mjs --list` from the installed SDK root. For example, `node scripts/describe-pattern.mjs pattern.review-decision web` returns the product inputs, parts, state rules, copy, keyboard behavior and acceptance examples. The selected target reports installed file availability alongside the documented support level. Record the chosen pattern IDs and the actual renderer evidence alongside the project's intent. [Pattern catalog](catalog/patterns.json)

## Carry the identity into a screen

- Use the Upright 9 company symbol and its B2 signature where the company signs a surface. The Rethink Sans family serves every text role. Keep the outlined 760 wordmark for the company nameplate. The food marks identify projects. A named agent uses its own face and silhouette. [Company signature](design/assets/logo/openboa-lockup.svg)
- Use neutral fills and ink for ordinary controls, hover, and selection containers. Use color to identify data, mark a threshold, or confirm a change of state. Give each state a word, mark, or position that carries its meaning. Choose the Upright 9 symbol’s Ink blue, `slate.750` (#175174), when a major action needs brand emphasis. Take hue and lightness from the single numbered palette shared by UI, charts, emoji, and agents. [Tokens](design/tokens/brand.json)
- Keep a product screen quiet enough to read at a glance. Give one consequence the primary action, keep supporting facts near the decision and put secondary detail behind a disclosure when it can wait. Use the existing control and touch dimensions. [UI roles and dimensions](design/tokens/ui.json)
- Write English product copy. Name the object and next action. A pending request can say “Request sent.” A verified result can name the effect. Keep the light touch for brand and project descriptions. Errors and permission messages should help someone recover. [Terms](design/content/terms.json)
- Use a short transition to explain a change of position or visibility. Respect reduced motion and keep the final state and focus legible. [Motion catalog](catalog/motion.json)

## Match the target

Start an app client on Vercel Native SDK, the selected default. Use Next.js or Vite for a web surface and declare any embedded WebView explicitly. [Native stack decision](docs/native-stack.md)

A Web CSS entry gives a class and semantic HTML. A web example gives a runnable local specimen. A guide example illustrates state choices with invented facts. A contract describes the intended behavior. The catalog records availability for each target. If the needed adapter is missing, record the gap and the proposed owner. A project may deliver a reviewed local implementation under its own name and evidence.

For a production dependency resolve the owning project’s accepted release and target. The SDK contains typed web exports and native templates. A production release requires the consuming project’s chosen pin and target checks. [Renderer evidence](docs/engineering/controls/component-library/verification.md)
