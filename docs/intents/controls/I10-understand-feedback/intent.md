# I10 · Recognize progress and recover from a failed task

Status: DRAFT, revision 1. Decision owner: OpenBoa design-system owner with the components maintainer. Source: [product intent, revision 1](../../../intent.md). [Paired specification](spec.md) · [Review and recover a Meatball decision](../../../journeys/J2/README.md).

## Need

A person sees a page load, update or fail. They need to know whether they can wait, retry, fix a field or read a completed result.

## Success and counterexample

**Success.** Display loading, filtered-empty, failed and recovered views from a controlled fixture. A reader can name the current condition and use the appropriate recovery without losing context.

**Convincing failure.** A spinner lasts forever after failure. A toast is the only place to learn how to recover. An indeterminate request presents a precise completion percentage.

## Limits

The product owns progress facts and whether a retry is safe. Yogurt owns placement, announcements and text hierarchy. Motion must not imply confirmation.

[Working task states](../../../../patterns/task-states.html) · [Component inventory](../../../../system.html#catalog) · [patterns.json](../../../../catalog/patterns.json)
