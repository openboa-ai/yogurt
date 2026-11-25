# Yogurt product specification

Draft revision 2. Paired with the [product intent](intent.md). This design describes what a team can use today and how the system should grow into distributable client libraries.

## The product boundary

| Observable outcome | Owning design | Independent witness |
| --- | --- | --- |
| Recognize the company, a project and an agent, and read the right tone for the occasion. | [Brand signature](intents/identity/I01-sign-a-surface/spec.md), [voice](intents/language/I02-write-in-context/spec.md), [art direction](intents/identity/I21-recognize-an-openboa-screen/spec.md) | A reader identifies all three entities in the introduction, project header and roster, including a narrow screen. |
| Compose a legible, purposeful interface from one numbered palette and type family. | [Colors](intents/foundations/I03-choose-system-colors/spec.md), [layout](intents/foundations/I04-read-at-any-size/spec.md), [component inventory](components.md) | Someone completes an action by keyboard and touch on both surfaces. Actual values and controls resolve to the same kit. |
| Turn a task into a complete screen, including unavailable, interrupted and recovered states. | [Decision journey](journeys/J2/README.md), [record journey](journeys/J3/README.md), [agent response](journeys/J5/README.md) | Product fixture, visible state, accessible output and command ledger agree. |
| Reuse the same React UI in a browser or desktop WebView. | [React presentation](engineering/renderers/react-ui/spec.md) | An independent observer operates the declared host and records the actual renderer and version. |
| Discover, validate, pin and roll back the same design across tools. | [Guidance](intents/guidance/I17-find-design-guidance/spec.md), [quality](intents/quality/I18-review-interaction-quality/spec.md), [adoption](intents/adoption/I19-adopt-a-release/spec.md) | Two independently pinned consumers can prove their own task and restore the previous release. |

## Default app stack

Vite and Next.js use the shared React components. A desktop shell loads the same UI in its WebView. Each host supplies its own data and effects. [Presentation stack](native-stack.md)

## First reviewable slice

The owner selected the 8 px corners in the [first-four study](engineering/controls/first-four/README.md) and authorized extending its type, spacing and interaction to the full inventory. The [component library specification](engineering/controls/component-library/spec.md) records the original component contracts. Use the [SDK gallery](../apps/guide/generated/components.html) to inspect the implementation. The original Upright 9 ink blue, slate.700, anchors the UI.

## Ownership, failures and delivery

Yogurt supplies visual roles, words, interaction contracts, React components and examples. Products decide permission, truth, scope, command execution and their own release. An interrupted consumer upgrade keeps the prior selection. A stale record or unknown command outcome follows its owning task contract. Evidence names the browser or app shell that ran the UI.

The complete scope and acceptance witnesses are indexed in the [design portfolio](README.md). [Current evidence](status.md) identifies the previous working material and decisions still requiring a finished implementation and independent result.
