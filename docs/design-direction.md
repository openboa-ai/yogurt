# OpenBoa product art direction

The [approved control basis](engineering/controls/component-library/spec.md) and [live library](../apps/guide/generated/components.html) apply this direction to web and native product work.

Design revision 2. The system should feel clear enough to use at once and human enough to remember. Someone reviewing a decision should see what is at stake before they notice the styling. The character can have the opposite role in an agent roster, where recognizing an individual is the job. [Company guide](https://yogurt-theta.vercel.app/index.html) · [Surface composition spec](engineering/identity/U21A-compose-a-product-surface/spec.md)

## What carries the identity

| Choice | Use it on a real surface | Check it at actual size |
| --- | --- | --- |
| A flat paper or ink surface | Set one reading edge for related facts. Use shared alignment, whitespace and a quiet second surface to distinguish successive records. Introduce a separate plane when content overlays or groups a genuinely separate task. | Hide the logo. The person should still find the object, its condition and the next step in reading order. |
| Rounded geometry with a deliberate cut | Keep the Upright 9 dimples for the company and a single fitted cut in the contour of a project or agent mark. Use an 8 px corner on a 36 px regular control. Use a 20 px card, an 18 px floating menu, and a 24 px sheet. Keep the 44 px minimum for touch controls. The switch keeps a capsule track to convey thumb travel. | The mark reads as a silhouette on either surface. An ordinary button should read immediately as a button. |
| One family, distinct voices at size | Use Rethink Sans throughout. Action and row labels use 560, headings use 620, and supporting text uses 450. The outlined B2 company nameplate uses 760. Reading text is 16/24, interface body is 14/20, and action labels are 14/20. Editors use 15/22, compact actions use 13/18, and key metrics use 34/40 at weight 650. Use tabular figures where people compare values. | Read an actual action label and its consequence together. The label is clear, the paragraph has breathing room, and numbers stay aligned while a result changes. |
| Color in small, intentional areas | Paper, ink and subtle rules carry most of the screen. Use one visually dominant action within a decision. Label state in words. Color in a project mark or a named agent can be more expressive because it identifies a subject. | Remove hue. An action, selection, warning and missing value remain distinguishable. Both themes resolve colors from the same numbered palette. |
| Space as grouping | Use 4–6 px within a label group, 8–10 px between related controls, and 24 px between sections. Use an 18 px inset in cards and 6 px inside anchored menus. | A person can tell which help, error or action belongs to which item at 320 px and at increased text size. |
| Movement from a cause | A pressed control responds at its point of contact. An anchored menu emerges from the trigger, an indicator follows a selection, and a busy label holds its space. End the movement when the new relationship is clear. | Watch the first frame, interrupt the movement and read the final state. With reduced motion, the same control and outcome remain apparent. |

OpenBoa’s primary color is the Upright 9 symbol’s Ink blue, `slate.750` (#175174). Use the exact color for a main action on paper and a contrast-tested lighter slate on ink. The shared palette has room for colorful art without requiring colorful chrome. [Token source](../design/tokens/brand.json) · [Signature study](../examples/signature/index.html)

## Three surfaces, three first reads

| Surface | First read | Composition | Where expression belongs |
| --- | --- | --- | --- |
| Company introduction | “Every limit has a shelf life.” | Place the B2 signature and give the headline a generous reading measure. Follow with the short About explanation. | The wordplay and distinctive mark carry the character. [Company copy](https://yogurt-theta.vercel.app/index.html#identity) |
| Meatball decision | The object and consequence of the choice | Lead with the decision. Put project, revision and consequence next to it. Place the explicit action after those facts and leave cancellation easy to find. | The small peppered food mark identifies the project. Use direct confirmation and recovery language. [Review pattern](intents/patterns/I13-review-a-decision/spec.md) |
| Sourdough record | The value, unit and time observed | Place the value and unit on one reading line. Group source, time and coverage below. Put missing facts in words and show only an available action. | The scored loaf identifies the owner. A stale or unknown value has a text treatment with its date or reason. [Inspection pattern](intents/patterns/I12-inspect-a-record/spec.md) |

A named agent can own the first reading position in a roster or transcript. Give it the established fitted silhouette, eyes and name, on a transparent surround. The contour and its cut stay visible at row size. The state text stays beside it. The rest of that screen follows the same type and spacing as a decision or record. [Agent identity](intents/artwork/I06-recognize-an-agent/spec.md) · [Agent response](intents/patterns/I20-follow-an-agent-response/spec.md)

## How to review a new composition

Open the normal state, one difficult state and one narrow layout. Read them without the masthead, then without hue. Name the person’s task, the most important object or fact and the next available action. Restore the artwork and check that it identifies the right entity. Operate the control at normal speed before discussing its resting appearance. A visually plausible page can still present the wrong project, hide a consequence or celebrate an unknown result. [Interaction quality](component-quality.md) · [Design records](README.md)
