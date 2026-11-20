# I18 design · Judge a component while it is moving

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Adopt a shared component and roll back](../../../journeys/J4/README.md).

## Requirements

- **I18-U18A.** Verify motion and feedback for each control family. Watch press, opening or state change, interruption, settling and dismissal. Declare deliberately immediate behavior. Verify accessible meaning and reduced motion separately.

**Constraint.** The design owner judges visual craft. Accessibility and event correctness are independently observable. Each renderer earns its own support.

**Design alternative to rule out.** A beautiful rest frame hides a flashing label, a stray focus ring or duplicated commands. Every control inherits a spring regardless of its purpose.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U18A · Review craft and correctness on a real transition](../../../engineering/quality/U18A-rehearse-a-transition/spec.md) | `checks/interaction` | All component and pattern maintainers claiming target support | A design reviewer watches normal-speed footage and a separate observer checks semantics and callback results |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Watch the settled scene first, replay the transition at normal speed, then inspect press, first change, midpoint, settle and dismissal. A failed frame or incorrect state identifies the affected renderer and exact revision.

**End scene.** Operate the real control at normal speed, reverse it while in flight, change input mode and repeat with reduced motion. Use the film, intermediate frames, focus and callback record to judge the exact build.

**Current sources and open decisions.** [Component craft and motion](../../../component-quality.md) · [Current web menu](../../../action-menu.md) · [menu-rehearsal.webm](../../../../examples/project-use/menu-rehearsal.webm) · [menu-frames.png](../../../../examples/project-use/menu-frames.png) · [Delivery status and owner decisions](../../../status.md)
