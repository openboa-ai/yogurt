# I08 · Submit only the value or action I intended

Status: DRAFT, revision 2. Decision owner: OpenBoa design-system owner with the components maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

A person using a form needs to enter a value, choose an option and know when an action is available. The host must receive an intentional edit or activation once.

## Success and counterexample

**Success.** Type into a named field, correct a validation error, then activate a labeled action with a keyboard. Observe the exact value and one callback. Repeating input while pending cannot submit a second command.

**Convincing failure.** A placeholder disappears with the only field label. A button changes width at the first spinner frame or fires from both keydown and click.

The [first four component intents](../../../engineering/controls/first-four/README.md) separate an explicit save, a local clear, a draft edit and an immediate preference. Each can be judged against the saved record.

## Limits

Yogurt owns control semantics and callbacks. The client owns validation rules, submission, authorization and idempotency. New control families require a real product case.

[patterns.json](../../../../catalog/patterns.json) · [Controls](../../../../system.html#controls) · [components.css](../../../../styles/components.css)
