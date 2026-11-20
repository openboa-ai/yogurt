# J3 · Read a partial Sourdough record

Scenario specification, revision 1. A Board Client reader inspects a stale but authorized record on a small display and then switches scope.

[I12 · Inspect only what is available about this record](../../intents/patterns/I12-inspect-a-record/intent.md) · [I07 · Read a value and understand its coverage](../../intents/data-visualization/I07-read-a-series/intent.md) · [I10 · Recognize progress and recover from a failed task](../../intents/controls/I10-understand-feedback/intent.md) · [I03 · Use one palette across the product](../../intents/foundations/I03-choose-system-colors/intent.md) · [I04 · Read and operate the same layout at different sizes](../../intents/foundations/I04-read-at-any-size/intent.md)

| Step | Required observation | Reject this substitute |
| --- | --- | --- |
| Read the subject, unit and as-of time. | Every displayed fact matches the authorized projection. | The page load time poses as the observation time. |
| Open a value with partial coverage and inspect the accessible text. | A missing observation stays distinct from zero in both representations. | The empty chart fills a gap with a fresh-looking trend. |
| Withdraw access, open another subject and finish the old read late. | Old facts leave both the screen and accessible tree. The current subject stays intact. | A hidden tooltip retains the prior values. |

Sourdough owns every read and access decision. An unavailable recovery stays unavailable when the source cannot identify or authorize the subject.

[Design portfolio](../../README.md)
