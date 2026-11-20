# How projects use yogurt

A team can ask “How does someone review this decision?” and find a screen pattern, its building blocks, English wording, failure behavior and a way to check the result. A project can use the same material whether its implementer is a designer, an engineer or an agent. [Open the working playbook](https://yogurt-theta.vercel.app/playbook.html)

## A product brief goes in. A screen can be built from the answer.

1. The product owner identifies the person, their task, the facts the product can observe and the effect of each available action.
2. A person selects a pattern in the guide or an agent reads its stable ID. Each entry supplies anatomy, component references, state and recovery rules, copy guidance, keyboard behavior, target availability and observable acceptance cases.
3. The client maps its own projection and commands to those slots. Browsing a screen reads data. An explicit permitted action is what asks the product to make a change.
4. Build with the adapter supported for that target. Exercise the same scene with a realistic fixture, a failure and recovery. Store the product-specific result with the product’s intent.

A decision flow can use `pattern.review-decision` followed by `pattern.track-request`. The host supplies the decision scope, exact revision, permitted alternatives and original receipt. Yogurt determines how the consequence, pending state and recovery read on screen. A record view can use `pattern.inspect-record` with its authorized projection, coverage and as-of time. When permission is withdrawn the screen clears cached values. When an authorized record is stale, its original timestamp stays visible. [Consumer journeys](engineering/adoption/U19D-guide-and-evaluate-skills/journeys.md)

The [design handbook](index.html) and [canonical portfolio](README.md) connect these decisions to feature and engineering specifications. Read the [visual direction](design-direction.md) and [component foundation](component-foundation.md) before selecting a new runtime dependency.

## Keep one owner for each source

| Responsibility | Edit here | What consumes it |
| --- | --- | --- |
| Brand and language | [Design sources](../design/README.md), [approved terms](../design/content/terms.json), [numbered palette](../design/tokens/brand.json) and [UI roles](../design/tokens/ui.json) | The guide, SDK, brand CSS and Native theme |
| Design contracts | [Catalog](../catalog/README.md) and the [paired design records](README.md) | The SDK, pattern lookup, guide and plugin |
| Public rendering | [Web and Native adapters](../packages/README.md), [composition recipes](../packages/recipes/README.md) and [styles](../design/styles/) | Product apps, the guide and examples |
| Guide presentation | [Guide sources](../apps/guide/README.md), its browser runtime and the design records | Hosted and offline guide, including the generated handbook |
| Product examples | [Examples](../examples/README.md) | The playbook, developers and design review |
| Installation and agent workflows | [Consumer CLI](../bin/yogurt.mjs), [agent plugin](../plugins/README.md), [installed design entry](../DESIGN.md) | Products and their agents |
| Verification | [Checks](../checks/README.md), [evals](../checks/evals/README.md) and the maintainers’ [evaluation skill](../.agents/skills/yogurt-evaluate/SKILL.md) | CI and Yogurt maintainers |
| Build and release | [Maintainer entry points](../scripts/README.md) and [release records](releases/README.md) | Maintainers and pinned SDK consumers |

The SDK build writes `packages/web/dist/` and `registry/` from the renderer sources and component catalog. Update the source and regenerate the output together. The guide owns its HTML sources in `apps/guide/pages/` and its browser scripts in `apps/guide/runtime/`. The site build keeps the existing routes. The guide generator writes standalone galleries to `apps/guide/generated/`, and the SDK includes them for offline use. The SDK [install guide](using-yogurt.md) and [plugin instructions](../plugins/yogurt/README.md) describe the pins each product selects.

The [Web source layout](../packages/web/README.md#source-layout) separates foundations, controls, compositions and identity. Catalog IDs resolve to the implementation during the build. The [maintainer tools](../scripts/README.md) divide generation by output owner. The [hosted guide build](../apps/guide/README.md#hosting) stages the same site for hosted and offline use from the authored pages, generated pages and shared assets.

Use [AGENTS.md](../AGENTS.md) when working on Yogurt itself. An adopting project can generate a short instruction index from its own binding. [Scope and verification for the guide move](engineering/adoption/U19D-guide-and-evaluate-skills/source-boundaries/spec.md)

The original brand assets and copy have one editable owner. Each role color refers back to the common palette. A public token format or native theme can be generated from that source. The Design Tokens Community Group documents typed values and references for exchanging tokens across tools. [Format specification](https://www.designtokens.org/tr/2025.10/format/)

## Design the library from complete tasks

| During design, someone needs to choose… | Default decision to document |
| --- | --- |
| Which layer to start with | Start from a task pattern. Use components directly when the task genuinely differs. Tokens supply the shared appearance at either level. |
| Which action deserves emphasis | Give the decision one clear primary action. Use a named secondary action for a reversible alternative. |
| Inline feedback, a toast or a dialog | Keep actionable errors by their source. Use a toast for brief nonblocking feedback. Use a dialog when the person must make a consequential choice before continuing. |
| Which screen states to show | Derive the list from the product’s actual inputs. Distinguish empty, filtered, pending, denied, stale and unknown wherever those conditions have different consequences. |
| How far to follow the platform | Preserve the meaning, copy and recovery across targets. Let focus, menu presentation, back navigation and touch behavior follow the platform. |

Build forms and fields, navigation and overlays, collections and detail views, feedback, data visualization and agent conversations in the order working screens need them. A component entry should show when to choose it, its public inputs, real variants and interaction on each supported target. A pattern entry supplies hierarchy and the order in which people encounter those components.

## Give each design tool a job

Keep reference boards, generated alternatives and Stitch or Figma prototypes in exploration until an owner chooses a direction. Translate the chosen direction into tokens, named states and a working example. Where a Figma library is useful, publish matching variables and component variants together with their yogurt IDs. An agent can then resolve a frame or component name against the same version an engineer builds. Store the state fixtures beside each working adapter and render them in the guide. A motion rehearsal exercises that actual control. [Figma library publishing](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library) · [Storybook component stories](https://storybook.js.org/docs/writing-stories)

## Bind once per project

The proposed release manifest identifies a compatible version of the rules, tokens, adapter artifacts and notices, with immutable digests and per-target support. Record the accepted release once per consumer. A web-only project may derive that binding from its package lock if the guide, skill and checks can resolve the same manifest. A mixed-target project can declare surface paths in `yogurt.config.json` and generate a shared `yogurt.lock` for its builds and agent tools. Never maintain two independent version selections.

An intent refers to one or more pattern IDs. It keeps the project-owned state mapping, permission source, effect, and test case. The optional agent skill reads the installed version. A developer can use the same catalog and check without installing a plugin.

Build app clients on Vercel Native SDK by default. The [native stack decision](native-stack.md) describes the markup, typed host messages and first native fixture. Build web clients on the same React DOM/CSS adapter for Next.js and Vite. Support a deliberate WebView as a web surface and test its return to the native host. For native-rendered views, map the common contract to the Native SDK and its supported native-rendered controls. Check keyboard and accessibility on that renderer. One adopting team can upgrade independently of the others. Rehearse the changed screens before switching its pin and retain the preceding working release. [Native SDK](https://github.com/vercel-labs/native) · [Adoption and rollback](https://yogurt-theta.vercel.app/adoption.html#releases)

## Decide what can be enforced

- **When authoring**, read the selected pattern and the project’s available adapter. Use its implementation and terms. Report a gap where the implementation is missing. Visual judgment remains reviewable.
- **Before a release**, exercise token and export integrity, accessible names, keyboard access and focus return. Capture the opening, press, mid-transition, settled state and close at normal speed. Show the reduced-motion path too. A browser screenshot documents the browser renderer. A native claim needs a running native screen, its accessibility tree and a performance comparison on the target device. [Dialog keyboard behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **In consumer CI**, run repeatable checks against its accepted version and declared presentation sources. Check references, supported targets, token bindings and accessible behavior. An intentionally broken fixture should fail before a project makes a check required. Keep original artwork, user content and generated token files out of a source-color lint. The product owner decides what a state means and whether the resulting client is fit to serve.

## Improve the system from a real screen

Launch with a task each product already needs. The first pilot should show that a fresh implementer can find the right pattern, build the web version, identify a missing native capability and supply evidence against the product’s own facts. The guide should name each platform as it passes. Verify a pinned install and one rollback in both independent consumers before calling distribution ready.

A wrong business state goes to the product. A shared design gap goes to Yogurt with a minimal reproduction, the affected renderer and the expected experience. After Yogurt prepares a fix, each affected consumer replays the scene against the candidate and decides when to adopt it.
