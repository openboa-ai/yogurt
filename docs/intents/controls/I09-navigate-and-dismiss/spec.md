# I09 design · Move through choices and return to the right place

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I09-U09A.** The trigger identifies the menu and its open state. Use a supported keyboard entry, arrow navigation and typeahead on targets that implement it. Escape returns focus. Tab provides a predictable way to leave. Record each target’s stepping behavior and anchor the moving surface to the trigger.
- **I09-U09B.** A modal has an accessible name, context, dismiss path and intentional initial focus. Constrain keyboard focus while open. A consequential action is explicit. A sheet can use the same decision contract on a compact target.
- **I09-U09C.** Tabs select a panel; links navigate to another location; segmented inputs select a value according to their role. Make the selected tab, heading and accessible panel agree. Secondary views retain meaningful labels.
- **I09-U09D.** Use a disclosure for an embedded section. A nonmodal popover may contain a related lightweight control. A tooltip supplies supplemental noninteractive text. Essential names and instructions remain visible or accessible without hovering.

**Constraint.** Yogurt owns choice of control and its interaction. The host identifies the target and its lifetime, permitted commands and fallback focus destination.

**Design alternative to rule out.** A menu masquerades as a persistent selection. A menu traps Tab like a modal. A modal closes but leaves keyboard focus behind a hidden panel.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U09A · Open, use and interrupt an action menu](../../../engineering/controls/U09A-operate-an-action-menu/spec.md) | `catalog/components/action-menu` | A row, toolbar or guide that exposes secondary commands | An interaction reviewer who compares the visible layer, accessibility tree and selection counter |
| [U09B · Resolve or cancel a modal prompt](../../../engineering/controls/U09B-dismiss-a-dialog/spec.md) | `catalog/components/dialog` | Confirmation flows and sheet presentations on constrained screens | A keyboard or assistive-technology tester observing focus and the host effect log |
| [U09C · Switch the active destination or view](../../../engineering/controls/U09C-change-a-view/spec.md) | `catalog/components/navigation` | Tabs, segmented view selectors and page-level navigation | A tester comparing destination, selection, focus and content after rapid switching |
| [U09D · Reveal related detail without taking over the task](../../../engineering/controls/U09D-reveal-related-detail/spec.md) | `catalog/components/disclosure` | Record rows, supporting information, popovers and contextual help | A reviewer operating the trigger and inspecting focus, expanded state and the revealed content |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Interrupt an opening transition, reopen it and remove the invoker in a separate case. Only one surface owns focus at a time. Return to the surviving invoker or the next meaningful host destination.

**End scene.** Navigate a secondary action menu, change a tab, then open and dismiss a confirmation. Keyboard and pointer users reach the same destinations and can tell which item or panel is active.

**Current sources and open decisions.** [Current web menu](../../../action-menu.md) · [Product playbook](https://yogurt-theta.vercel.app/playbook.html) · [patterns.json](../../../../catalog/patterns.json) · [Delivery status and owner decisions](../../../status.md)
