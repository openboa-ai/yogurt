# J2 · Review and recover a Meatball decision

Scenario specification, revision 1. A person finds one pending decision, inspects its exact consequence and later learns the outcome after a disconnect.

[I11 · Find an item and recover from no matches](../../intents/patterns/I11-find-records/intent.md) · [I08 · Submit only the value or action I intended](../../intents/controls/I08-act-and-enter-values/intent.md) · [I09 · Move through choices and return to the right place](../../intents/controls/I09-navigate-and-dismiss/intent.md) · [I10 · Recognize progress and recover from a failed task](../../intents/controls/I10-understand-feedback/intent.md) · [I13 · Review the consequence before committing](../../intents/patterns/I13-review-a-decision/intent.md) · [I14 · Learn what happened to the original request](../../intents/patterns/I14-track-a-request/intent.md) · [I02 · Know what happened and what to do next](../../intents/language/I02-write-in-context/intent.md) · [I18 · Judge a component while it is moving](../../intents/quality/I18-review-interaction-quality/intent.md)

| Step | Required observation | Reject this substitute |
| --- | --- | --- |
| Find the intended item and open it. | Stable project and record match the intended decision. | A similar display label is the only join. |
| Review scope and revision. Cancel once, reopen and confirm once. | The callback ledger contains one allowed choice at the displayed revision. | The confirmation screen itself sends an action. |
| Disconnect after dispatch and reopen the original receipt. | The person sees uncertainty and can check the same request until an authoritative result exists. | A second request is silently submitted. |

Meatball owns authorization, domain decisions and receipt facts. The component review compares the visible result, input model and host ledger.

[Design portfolio](../../README.md)
