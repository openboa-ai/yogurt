# Design and delivery status

The [SDK gallery](../apps/guide/generated/components.html), [installation guide](using-yogurt.md) and [target evidence](engineering/controls/component-library/verification.md) describe the current local implementation. The earlier pilot rows below retain their original scope.

The portfolio contains draft designs with individual revision numbers. The source includes earlier brand work, editable assets and a web pilot. The engineering records describe intended future evidence. A table entry, catalog ID, prerequisite or draft design is insufficient for changing a consumer or making a runtime support claim.

| Subject | Current local evidence | Next observation for the wider claim |
| --- | --- | --- |
| Company and voice | Upright 9, B2 master and outlined 760 wordmark, Rethink Sans, approved English company and repository wording. | Review an actual consumer surface at its shipping size. The owner selected the original symbol’s Ink blue, slate.750 (#175174), as OpenBoa’s primary color. [Brand guide](https://yogurt-theta.vercel.app/index.html) |
| Assets | Fifteen agent silhouettes with 45 animated notch variants, Kai and Sol references, three project marks, and a catalog of 3,831 general emoji with 104 optional peach face finishes. [Family gallery](../apps/guide/generated/agents.html) | Curate the distinguishable fill combinations and inspect roster-size pairs before counting 1,000+ usable identities. [Source library](https://yogurt-theta.vercel.app/library.html) · [Emoji](../design/assets/emoji/README.md) |
| Foundations | One numbered palette, Rethink Sans, three neutral materials and light/dark role bindings generate the CSS used by React. | Observe additional browser engines and consuming apps. [Brand contract](../catalog/brand.json) |
| Patterns and component entries | 125 SDK components and 14 editable blocks. Workspace patterns cover the agent, project, conversation, results and operation surfaces. | Test product-specific effects, authorization and receipts at adoption. [Gallery](../apps/guide/generated/components.html) · [Workspace patterns](workspace-patterns.md) |
| Motion | An actual local web-menu recording, a six-frame strip and an alternate reduced-motion path. The sample uses an immediate dismissal. | Review remaining dark, interruption and target cases under the new standard. [Menu](action-menu.md) · [Quality benchmark](component-quality.md) |
| Renderer and distribution | Individually importable React entries from one package. Browser and desktop WebView consumers use these entries. | Verify the packaged desktop shell, physical mobile input and each production consumer. [Verification](engineering/controls/component-library/verification.md) |

## First-four design record

[Four basic controls](engineering/controls/first-four/README.md) each have a draft intent and spec. A [working browser study](../examples/basic-controls/index.html) lets the owner judge the four together. The local study uses an in-memory saved view and a simulated save. The SDK evidence record now covers the tested web hosts, registry and native fixture.

## Moving a change forward

1. Find the intent and paired design, then identify the engineering criterion in [portfolio.json](portfolio.json). Trace its predecessor changes and any accepted, reusable evidence.
2. Review the exact design content and record the decision and digest. Scope the implementation plan to the actual base, writer, target and failure/recovery case before editing runtime code.
3. Verify on the stated target, record the candidate and independent observation, and update support only for the cases that passed. A consumer upgrade has its own pin, fixture and recipient result.

The owner selected the 8 px control on November 20. The local SDK implements that basis. Product installation and publication are separate decisions. The first slice is described in the [product specification](spec.md). A later Meatball project descriptor is an independent adoption decision.
