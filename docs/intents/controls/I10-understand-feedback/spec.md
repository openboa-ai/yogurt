# I10 design · Recognize progress and recover from a failed task

Parent: [originating intent, revision 1](intent.md). Review: NOT ACCEPTED. Design revision 1. [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Requirements

- **I10-U10A.** Use field errors near their source, persistent results when the task is blocked and brief notifications for nonblocking events. Skeletons reserve useful geometry. Label indeterminate progress and include a denominator for known progress.

**Constraint.** The product owns progress facts and whether a retry is safe. Yogurt owns placement, announcements and text hierarchy. Motion must not imply confirmation.

**Design alternative to rule out.** A spinner lasts forever after failure. A toast is the only place to learn how to recover. An indeterminate request presents a precise completion percentage.

## Changes and joins

| Change and contract | Proposed writer boundary | Consumer | Independent observer |
| --- | --- | --- | --- |
| [U10A · Present feedback that matches the observed task](../../../engineering/controls/U10A-show-task-feedback/spec.md) | `catalog/components/feedback` | Inline validation, task results, status messages and progress displays | A tester observing the visible result, accessible announcements and recovery callback |

The change specifications identify their individual predecessors. The scene below checks their joined behavior.

## Integrated acceptance

Run a failure between loading and success. Sample the visible text and spoken status, then recover. An earlier response cannot overwrite a newer state.

**End scene.** Display loading, filtered-empty, failed and recovered views from a controlled fixture. A reader can name the current condition and use the appropriate recovery without losing context.

**Current sources and open decisions.** [Working task states](../../../../patterns/task-states.html) · [Component inventory](../../../../system.html#catalog) · [patterns.json](../../../../catalog/patterns.json) · [Delivery status and owner decisions](../../../status.md)
