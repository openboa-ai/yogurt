# U02A · Choose copy from the observed state

Design: DRAFT, revision 1. Implementation: NOT ADMITTED. Evidence for this change: NOT_RUN.

Parent: [I02 design r1](../../../intents/language/I02-write-in-context/spec.md) · criterion `I02-U02A`. Parent specification SHA-256 `02311e93b202e14e71ed124bb42cfac567067d15aa7495f84423aca46e685194`.

## Decision and ownership

Keep the company line “Every limit has a shelf life.”, the **OpenBoa** (**Boa** = *Business of Agents*) name origin in brand and approach contexts, and the three maintained repository descriptions in their intended contexts. UI copy names the object, condition and supported next action.

**Proposed writer.** Language and naming maintainer, `design/content/terms.json`. **Consumer.** Brand writers and any client presenting an action or result. **Independent verifier.** A product editor given the state fixture and the final screen, without the proposed wording. The OpenBoa design-system owner decides acceptance of this change. Product-owned facts and effects stay with the source named in the intent.

## Contract

Accept a context, actor-facing object, host observation and available recovery. Choose the term or phrase for that context. A send acknowledgement may justify “Request sent”; completion needs a verified result.

**Predecessors.** No engineering predecessor.

**Denied case.** An editor cannot turn an uncertain receipt into success or a permission message into an instruction to bypass access. Food wordplay belongs where it carries meaning in the introduction or description.

## Failure and compatibility

Keep stable term IDs when editing language. An unknown state falls back to an honest description and a permitted next step. Reopen an affected example before replacing a public line.

## Independent acceptance

| Criterion | Setup and action | Expected observation | Convincing failure |
| --- | --- | --- | --- |
| U02A-A | Read the home line and project descriptions, then review a sent request beside a confirmed one. | The home and repository copy retain their chosen wordplay. The two product states describe different facts. | Both states say “Done” because the button completed its animation. |
| U02A-B | Remove lookup permission from the uncertain-receipt fixture. | The message explains what is known and includes only the recovery still available. | The screen offers a recovery action the product has denied. |

Collect the observations above against the exact candidate and target. Record the reviewer, revision and outstanding results in a review or verification record when they exist. [Current evidence and open decisions](../../../status.md) · [Originating need](../../../intents/language/I02-write-in-context/intent.md)
