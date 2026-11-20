# I13 · Review the consequence before committing

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the product patterns maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

A Meatball user sees a decision requiring their action. They need to know the affected item, revision, consequence and alternatives before sending a response.

## Success and counterexample

**Success.** Inspect two similarly named decisions, cancel one review, then confirm an authorized revision. Only that exact target produces one host request, and the UI shows it as sent.

**Convincing failure.** Opening a dialog sends a command. An optimistic success replaces a receipt. A stale revision silently reuses a previously valid choice.

## Limits

Bind pattern.review-decision to caller-supplied actor scope, project, record, revision and choices. Only the product can authorize or execute the action.

[patterns.json](../../../../catalog/patterns.json) · [Product fixtures](../../../../examples/project-use/scenarios.json) · [Product playbook](https://yogurt-theta.vercel.app/playbook.html)
