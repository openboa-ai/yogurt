# I15 design · Use the same web component in each web host

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Requirements

- **I15-U15A.** The first candidate is @ui-sdk/react over @ui-sdk/core inside the web adapter. Pin the exact pair under test. The public yogurt contract owns the parts, labels, tokens, event and focus result. One primitive owns focus and key handling per rendered control.
- **I15-U15B.** Expose yogurt-owned component entry points with typed states and token styles. Keep DOM-safe server output and minimal client islands. Fonts and artwork are individually reachable resources. Record web-view support against a named host.

**Constraint.** Yogurt owns the proposed web adapter and exported styles. Host routing, embedding, navigation and authority live with the consumer. Support is recorded per host.

**Design alternative to rule out.** A demo depends on a browser global during server rendering. A remount registers two listeners. Importing a button downloads the whole emoji catalog.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U15A · Evaluate the headless web behavior behind one control](../../../engineering/renderers/U15A-qualify-web-behavior/spec.md) | `packages/web/qualification` | Web adapter maintainers comparing behavior providers | A web reviewer running the same bounded fixture against the existing menu and the candidate |
| [U15B · Expose one web entry across supported hosts](../../../engineering/renderers/U15B-export-web-controls/spec.md) | `packages/web` | Next.js, Vite and explicitly embedded web views | An implementer installing the candidate in each clean, independently observed host fixture |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Install only declared artifacts in each fixture and use the shipped entry. Record first render, hydration or remount, keyboard focus and the actual assets requested.

**End scene.** Render the same fixture in Next.js with server rendering, a Vite client and a supported embedded web view. Navigate away and back, activate once and compare name, layout and event count.

**Current sources and open decisions.** [Repository blueprint](../../../repository.md) · [Current web menu](../../../action-menu.md) · [components.css](../../../../design/styles/components.css) · [Project binding](https://yogurt-theta.vercel.app/adoption.html#setup) · [Component foundation](../../../component-foundation.md) · [Delivery status and owner decisions](../../../status.md)
