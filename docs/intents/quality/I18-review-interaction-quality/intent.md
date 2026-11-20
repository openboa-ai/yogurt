# I18 · Judge a component while it is moving

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the interaction quality maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Need

A reviewer deciding whether a control belongs in yogurt needs to see the press, change, interruption and recovery at actual speed. Still screenshots cannot show an extra action or a bad middle frame.

## Success and counterexample

**Success.** Operate the real control at normal speed, reverse it while in flight, change input mode and repeat with reduced motion. Use the film, intermediate frames, focus and callback record to judge the exact build.

**Convincing failure.** A beautiful rest frame hides a flashing label, a stray focus ring or duplicated commands. Every control inherits a spring regardless of its purpose.

## Limits

The design owner judges visual craft. Accessibility and event correctness are independently observable. Each renderer earns its own support.

[Component craft and motion](../../../component-quality.md) · [Current web menu](../../../action-menu.md) · [menu-rehearsal.webm](../../../../examples/project-use/menu-rehearsal.webm) · [menu-frames.png](../../../../examples/project-use/menu-frames.png)
