# U19C · Distribute an inspectable product recipe

Design: DRAFT, revision 2. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I19 design r2](../../../intents/adoption/I19-adopt-a-release/spec.md) · criterion `I19-U19C`. Parent specification SHA-256 `aa50f641ee0c98d71364e168f94d0ccba66d358c719dbb5cf8af38622325d873`.

## Decision and ownership

Use a shadcn-compatible registry item for a single named web control or an optional screen or form composition. An individual item exposes a locally importable entry backed by a pinned Yogurt primitive. Composed recipes can refer to stable pattern IDs. Keep shared behavior and tokens at their owned package entries.

**Proposed writer.** Consumer adoption maintainer, `releases/registry`. **Consumer.** Products choosing the optional shadcn-compatible distribution route. **Independent verifier.** A recipient inspecting a candidate recipe and the resulting diff in a clean fixture. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

A team chooses a named recipe from an immutable yogurt release, previews its files and dependency diff, and accepts local ownership of the composition. An existing route or file may be changed only through that project’s review.

**Predecessors.** [U15B](../../renderers/U15B-export-web-controls/spec.md) · [U19A](../U19A-pin-a-release/spec.md)

**Denied case.** Never overwrite user edits, copy a global theme, install a second primitive engine for the same control, or use a moving registry URL to bypass the accepted version.

## Failure and compatibility

On a conflicting path show the proposed changes before applying them. Updating the adapter does not regenerate a customized recipe. A clean project can remove the local recipe while retaining the installed primitives.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U19C-A | Add one text-field entry to clean Vite and Next.js fixture projects at the same pin, then stage a decision-screen recipe separately. | The diff is reproducible, imports the yogurt entry and lists local editable slots and upstream-owned parts. | The recipe vendors the button implementation, leaving two editable sources of truth. |
| U19C-B | Edit the generated composition and present a new recipe at the same destination. | The conflict and migration are visible. The existing project file survives until its owner accepts a change. | A dependency refresh silently overwrites the local screen. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/adoption/I19-adopt-a-release/intent.md)
