# I16 design · Operate the same task through native controls

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Requirements

- **I16-U16A.** Use the selected Vercel Native SDK as the default app runtime. Bind shared values and control states to Native markup or SDK-supported native views. Preserve the host’s typed messages and native accessibility conventions. Qualify each capability on the actual target.

**Constraint.** Vercel Native SDK (vercel-labs/native) is the selected default stack for OpenBoa app clients. The adapter owner owns SDK mapping, version qualification and per-OS support. The consumer owns its model, effects and host navigation. A deliberately embedded WebView follows the web contract.

**Design alternative to rule out.** A browser recording is presented as native evidence, or a WebView silently replaces the target control when the SDK lacks a capability.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U16A · Map shared behavior to a native control](../../../engineering/renderers/U16A-map-native-controls/spec.md) | `packages/native` | An installed client using Vercel Native | A native reviewer operating the installed process with accessibility tools on a named OS and device |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Exercise focus return, reduced motion and unmount during an active request in a native process. Declare a gap for any unsupported control and request specific evidence before expanding support.

**End scene.** On a named OS/device, open the installed build, navigate with native controls and complete the same fixture. Compare the accessible state and measured interaction with a baseline on that device.

**Current sources and open decisions.** [Default native stack](../../../native-stack.md) · [Repository blueprint](../../../repository.md) · [Adoption guide](https://yogurt-theta.vercel.app/adoption.html) · [brand.json](../../../../design/tokens/brand.json) · [Delivery status and owner decisions](../../../status.md)
