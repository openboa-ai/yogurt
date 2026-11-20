# Yogurt design records

[Use Yogurt on web and Zig](using-yogurt.md) · [Live components and brand tokens](../components.html)

Start with the visual direction when composing a screen. Start with a task intent when changing the shared system. Each promise has a paired design and one or more reviewable engineering changes. Product teams can use the current guide while proposed changes move through review.

The [Yogurt skills proposal](engineering/adoption/U19D-guide-and-evaluate-skills/spec.md) covers product decisions, implementation, review, GitHub feedback and evaluating skill quality and model cost.

[Read the design handbook in a browser](index.html) · [Art direction](design-direction.md) · [Component foundation](component-foundation.md) · [Default native stack](native-stack.md) · [Component inventory](components.md) · [Motion and craft](component-quality.md)

[Product intent](intent.md) · [Product specification](spec.md) · [Area owners](categories.md) · [Machine-readable portfolio](portfolio.json) · [Existing evidence and open decisions](status.md) · [Repository and distribution](repository.md)

The first component review covers a button, icon button, text field and switch. [Operate the scene](../examples/basic-controls/index.html) · [Read the four intent and spec pairs](engineering/controls/first-four/README.md)

## Brand expression

| Design area and intended outcome | Intent | Design | Engineering specifications |
| --- | --- | --- | --- |
| Company identity · Recognize who is signing a surface | [I01](intents/identity/I01-sign-a-surface/intent.md) | [Spec](intents/identity/I01-sign-a-surface/spec.md) | [U01A · Place the master on a company surface](engineering/identity/U01A-place-company-signature/spec.md) |
| Company identity · Recognize an OpenBoa screen in everyday use | [I21](intents/identity/I21-recognize-an-openboa-screen/intent.md) | [Spec](intents/identity/I21-recognize-an-openboa-screen/spec.md) | [U21A · Compose a recognizable product surface](engineering/identity/U21A-compose-a-product-surface/spec.md) |
| Language and naming · Know what happened and what to do next | [I02](intents/language/I02-write-in-context/intent.md) | [Spec](intents/language/I02-write-in-context/spec.md) | [U02A · Choose copy from the observed state](engineering/language/U02A-resolve-english-copy/spec.md) |
| Artwork and agents · Recognize the right artwork at message size | [I05](intents/artwork/I05-choose-recognizable-art/intent.md) | [Spec](intents/artwork/I05-choose-recognizable-art/spec.md) | [U05A · Preserve each food mark at small sizes](engineering/artwork/U05A-export-project-marks/spec.md) · [U05B · Resolve an icon or emoji to its intended drawing](engineering/artwork/U05B-select-original-glyphs/spec.md) |
| Artwork and agents · Recognize an agent before it moves | [I06](intents/artwork/I06-recognize-an-agent/intent.md) | [Spec](intents/artwork/I06-recognize-an-agent/spec.md) | [U06A · Assign a stable, visually fitted agent identity](engineering/artwork/U06A-fit-agent-identities/spec.md) · [U06B · Express activity with the eyes](engineering/artwork/U06B-express-agent-state/spec.md) |

## System foundations

| Design area and intended outcome | Intent | Design | Engineering specifications |
| --- | --- | --- | --- |
| Design foundations · Use one palette across the product | [I03](intents/foundations/I03-choose-system-colors/intent.md) | [Spec](intents/foundations/I03-choose-system-colors/spec.md) | [U03A · Resolve visual roles from one numbered palette](engineering/foundations/U03A-resolve-palette-roles/spec.md) |
| Design foundations · Read and operate the same layout at different sizes | [I04](intents/foundations/I04-read-at-any-size/intent.md) | [Spec](intents/foundations/I04-read-at-any-size/spec.md) | [U04A · Lay out text, spacing and operable controls](engineering/foundations/U04A-compose-responsive-type/spec.md) |
| Data visualization · Read a value and understand its coverage | [I07](intents/data-visualization/I07-read-a-series/intent.md) | [Spec](intents/data-visualization/I07-read-a-series/spec.md) | [U07A · Present a plot and its textual equivalent](engineering/data-visualization/U07A-encode-observed-values/spec.md) |

## Product interface

| Design area and intended outcome | Intent | Design | Engineering specifications |
| --- | --- | --- | --- |
| Components · Submit only the value or action I intended | [I08](intents/controls/I08-act-and-enter-values/intent.md) | [Spec](intents/controls/I08-act-and-enter-values/spec.md) | [U08A · Activate one named action](engineering/controls/U08A-activate-an-action/spec.md) · [U08B · Edit and validate a labeled value](engineering/controls/U08B-edit-labeled-values/spec.md) · [U08C · Choose the intended value from a long list](engineering/controls/U08C-choose-a-search-result/spec.md) |
| Components · Move through choices and return to the right place | [I09](intents/controls/I09-navigate-and-dismiss/intent.md) | [Spec](intents/controls/I09-navigate-and-dismiss/spec.md) | [U09A · Open, use and interrupt an action menu](engineering/controls/U09A-operate-an-action-menu/spec.md) · [U09B · Resolve or cancel a modal prompt](engineering/controls/U09B-dismiss-a-dialog/spec.md) · [U09C · Switch the active destination or view](engineering/controls/U09C-change-a-view/spec.md) · [U09D · Reveal related detail without taking over the task](engineering/controls/U09D-reveal-related-detail/spec.md) |
| Components · Recognize progress and recover from a failed task | [I10](intents/controls/I10-understand-feedback/intent.md) | [Spec](intents/controls/I10-understand-feedback/spec.md) | [U10A · Present feedback that matches the observed task](engineering/controls/U10A-show-task-feedback/spec.md) |
| Product patterns · Find an item and recover from no matches | [I11](intents/patterns/I11-find-records/intent.md) | [Spec](intents/patterns/I11-find-records/spec.md) | [U11A · Find and reset an authorized collection](engineering/patterns/U11A-restore-collection-context/spec.md) |
| Product patterns · Inspect only what is available about this record | [I12](intents/patterns/I12-inspect-a-record/intent.md) | [Spec](intents/patterns/I12-inspect-a-record/spec.md) | [U12A · Render one authorized record projection](engineering/patterns/U12A-show-authorized-facts/spec.md) |
| Product patterns · Review the consequence before committing | [I13](intents/patterns/I13-review-a-decision/intent.md) | [Spec](intents/patterns/I13-review-a-decision/spec.md) | [U13A · Present and confirm the scoped choice](engineering/patterns/U13A-confirm-current-decision/spec.md) |
| Product patterns · Learn what happened to the original request | [I14](intents/patterns/I14-track-a-request/intent.md) | [Spec](intents/patterns/I14-track-a-request/spec.md) | [U14A · Track the original request through uncertainty](engineering/patterns/U14A-reconcile-original-receipt/spec.md) |
| Product patterns · Follow an agent response as it arrives | [I20](intents/patterns/I20-follow-an-agent-response/intent.md) | [Spec](intents/patterns/I20-follow-an-agent-response/spec.md) | [U20A · Follow a partial agent reply without losing place](engineering/patterns/U20A-present-streamed-replies/spec.md) |

## System delivery

| Design area and intended outcome | Intent | Design | Engineering specifications |
| --- | --- | --- | --- |
| Platform adapters · Use the same web component in each web host | [I15](intents/renderers/I15-use-the-web-adapter/intent.md) | [Spec](intents/renderers/I15-use-the-web-adapter/spec.md) | [U15A · Evaluate the headless web behavior behind one control](engineering/renderers/U15A-qualify-web-behavior/spec.md) · [U15B · Expose one web entry across supported hosts](engineering/renderers/U15B-export-web-controls/spec.md) |
| Platform adapters · Operate the same task through native controls | [I16](intents/renderers/I16-use-native-controls/intent.md) | [Spec](intents/renderers/I16-use-native-controls/spec.md) | [U16A · Map shared behavior to a native control](engineering/renderers/U16A-map-native-controls/spec.md) |
| Guide and authoring · Find the same answer as a designer, engineer or agent | [I17](intents/guidance/I17-find-design-guidance/intent.md) | [Spec](intents/guidance/I17-find-design-guidance/spec.md) | [U17A · Resolve a task to design guidance on the pinned version](engineering/guidance/U17A-index-design-guidance/spec.md) |
| Interaction quality · Judge a component while it is moving | [I18](intents/quality/I18-review-interaction-quality/intent.md) | [Spec](intents/quality/I18-review-interaction-quality/spec.md) | [U18A · Review craft and correctness on a real transition](engineering/quality/U18A-rehearse-a-transition/spec.md) |
| Consumer adoption · Adopt and roll back the shared system per project | [I19](intents/adoption/I19-adopt-a-release/intent.md) | [Spec](intents/adoption/I19-adopt-a-release/spec.md) | [U19A · Resolve and roll back a project pin](engineering/adoption/U19A-pin-a-release/spec.md) · [U19B · Detect a consumer violation and return it to its owner](engineering/adoption/U19B-check-consumer-use/spec.md) · [U19C · Distribute an inspectable product recipe](engineering/adoption/U19C-distribute-pattern-recipes/spec.md) |

## Maintain the browser edition

The Markdown files and portfolio are the editable design sources. Install the pinned generator with `npm --prefix apps/guide/tooling ci` and regenerate the handbook with `npm --prefix apps/guide/tooling run build:handbook`. The generated reader works directly from disk. [Guide source](../apps/guide/README.md)

## Journeys

- [J1 · Recognize the same company across surfaces](journeys/J1/README.md)
- [J2 · Review a decision and recover its result](journeys/J2/README.md)
- [J3 · Read a partially observed record](journeys/J3/README.md)
- [J4 · Adopt a shared component and roll back](journeys/J4/README.md)
- [J5 · Follow an agent across a roster and a reply](journeys/J5/README.md)
