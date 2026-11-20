# I16 · Operate the same task through native controls

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the platform adapters maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Need

An OpenBoa client team builds on Vercel Native SDK, the selected default application stack. It needs a native surface that uses real input, focus and accessibility while retaining the vocabulary and recovery of the shared task.

## Success and counterexample

**Success.** On a named OS/device, open the installed build, navigate with native controls and complete the same fixture. Compare the accessible state and measured interaction with a baseline on that device.

**Convincing failure.** A browser recording is presented as native evidence, or a WebView silently replaces the target control when the SDK lacks a capability.

## Limits

Vercel Native SDK (vercel-labs/native) is the selected default stack for OpenBoa app clients. The adapter owner owns SDK mapping, version qualification and per-OS support. The consumer owns its model, effects and host navigation. A deliberately embedded WebView follows the web contract.

[Default native stack](../../../native-stack.md) · [Repository blueprint](../../../repository.md) · [Adoption guide](../../../../adoption.html) · [brand.json](../../../../tokens/brand.json)
