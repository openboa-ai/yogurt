# U15B · Expose one web entry across supported hosts

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I15 design r1](../../../intents/renderers/I15-use-the-web-adapter/spec.md) · criterion `I15-U15B`. Parent specification SHA-256 `58479ef486024a552ea589a18679b853ae26bbf7e85010a0e17b1d24271e00d8`.

## Decision and ownership

Expose yogurt-owned component entry points with typed states and token styles. Keep DOM-safe server output and minimal client islands. Fonts and artwork are individually reachable resources. Record web-view support against a named host.

**Proposed writer.** Platform adapters maintainer, `packages/web`. **Consumer.** Next.js, Vite and explicitly embedded web views. **Independent verifier.** An implementer installing the candidate in each clean, independently observed host fixture. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

A consuming screen imports a supported component from the pinned artifact. Server rendering emits stable names and IDs; hydration attaches behavior once. Unmount releases handlers and portal content.

**Predecessors.** [U15A](../U15A-qualify-web-behavior/spec.md)

**Denied case.** Do not make Next.js or Vite the foundation of the design contract. Loading a button may not eagerly import the emoji inventory or native adapter. Host bridges require explicit, product-owned navigation and effects.

## Failure and compatibility

Track build/import compatibility by host. On unsupported host capability surface the gap. Roll back to the previous compatible export; preserve the current standalone HTML/CSS example during migration.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U15B-A | Install the same candidate in Next.js and Vite; hydrate or mount, navigate away and back, and select once. | Both emit the same one event, preserve names and focus, have no hydration errors and load no unused asset catalog. | A sample imports local source that is absent from the candidate package. |
| U15B-B | Open the same control in the declared WebView, dismiss it, then return to the native host. | Back/focus ownership and actual WebView version are recorded with one control action. | A desktop browser fixture supplies the embedded-host support badge. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/renderers/I15-use-the-web-adapter/intent.md)
