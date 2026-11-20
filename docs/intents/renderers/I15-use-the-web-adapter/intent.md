# I15 · Use the same web component in each web host

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the platform adapters maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Need

Teams using Next.js, Vite and a web view need one accessible import and the same observable behavior despite different boot and focus lifecycles.

## Success and counterexample

**Success.** Render the same fixture in Next.js with server rendering, a Vite client and a supported embedded web view. Navigate away and back, activate once and compare name, layout and event count.

**Convincing failure.** A demo depends on a browser global during server rendering. A remount registers two listeners. Importing a button downloads the whole emoji catalog.

## Limits

Yogurt owns the proposed web adapter and exported styles. Host routing, embedding, navigation and authority live with the consumer. Support is recorded per host.

[Repository blueprint](../../../repository.md) · [Current web menu](../../../action-menu.md) · [components.css](../../../../styles/components.css) · [Project binding](https://yogurt-theta.vercel.app/adoption.html#setup) · [Component foundation](../../../component-foundation.md)
