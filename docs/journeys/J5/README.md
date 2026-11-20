# J5 · Follow an agent across a roster and a reply

Scenario specification, revision 1. A person recognizes a known agent, reads older messages and receives an interrupted reply.

[I20 · Follow an agent response as it arrives](../../intents/patterns/I20-follow-an-agent-response/intent.md) · [I06 · Recognize an agent before it moves](../../intents/artwork/I06-recognize-an-agent/intent.md) · [I10 · Recognize progress and recover from a failed task](../../intents/controls/I10-understand-feedback/intent.md) · [I18 · Judge a component while it is moving](../../intents/quality/I18-review-interaction-quality/intent.md)

| Step | Required observation | Reject this substitute |
| --- | --- | --- |
| Open the returning agent from the roster. | The assigned mark and name agree with the transcript attribution. | The reply merely shares a fill color with the roster item. |
| Read older content while the current reply grows. | The current reading position holds and latest content remains reachable. | Automatically following every token moves the person away from the paragraph. |
| Interrupt the stream, then read it with reduced motion. | Confirmed text, interrupted state and available recovery agree with the actual event source. | A decorative state or silence is shown as a completed answer. |

The consumer owns message identity, stream state and stop authority. The shared pattern renders these and preserves meaningful reading order.

[Design portfolio](../../README.md)
