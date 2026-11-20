# I09 · Move through choices and return to the right place

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the components maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

A person needs a secondary command, a different view or a consequential confirmation. Each surface needs the appropriate focus model and a predictable way back.

## Success and counterexample

**Success.** Navigate a secondary action menu, change a tab, then open and dismiss a confirmation. Keyboard and pointer users reach the same destinations and can tell which item or panel is active.

**Convincing failure.** A menu masquerades as a persistent selection. A menu traps Tab like a modal. A modal closes but leaves keyboard focus behind a hidden panel.

## Limits

Yogurt owns choice of control and its interaction. The host identifies the target and its lifetime, permitted commands and fallback focus destination.

[Current web menu](../../../action-menu.md) · [Product playbook](https://yogurt-theta.vercel.app/playbook.html) · [patterns.json](../../../../catalog/patterns.json)
