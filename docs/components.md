# Component inventory

[Browse 125 components](../apps/guide/generated/components.html) · [Install an individual entry](using-yogurt.md) · [Current renderer evidence](engineering/controls/component-library/verification.md)

Choose the task pattern first, then the smallest control that carries the intended meaning. Each family below has an owning spec. Its exact implementation and per-target availability are tracked separately for the current kit. A platform may use a native presentation while preserving the same input, outcome and recovery.

| Family | Parts to design | Decision the consumer makes | Specification |
| --- | --- | --- | --- |
| Foundations and layout | Text, heading, icon, stack, inline group, divider, surface, grid, scroll region | Does this relationship need spacing, a reading edge, a distinct surface or a scroll region? | [Type and layout](engineering/foundations/U04A-compose-responsive-type/spec.md) · [Art direction](design-direction.md) |
| Actions | Text button, icon button, button group, loading and unavailable action | Name the action. Give one consequence primary emphasis and supply a genuine pending result. | [Action](engineering/controls/U08A-activate-an-action/spec.md) |
| Forms | Field, label, help, error, text input, search, textarea, select, combobox, checkbox, radio group and switch | Text or constrained choice? Independent choices or one selected value? Immediate setting or a draft awaiting submit? | [Labeled value](engineering/controls/U08B-edit-labeled-values/spec.md) · [Searchable choices](engineering/controls/U08C-choose-a-search-result/spec.md) |
| Navigation | Link, breadcrumb, tabs, segmented view, navigation list and paging | Use a destination for a route, a tab for a panel and a value control for selecting an input. | [View change](engineering/controls/U09C-change-a-view/spec.md) |
| Disclosure and overlays | Disclosure row, action menu, popover, modal dialog and adaptive sheet | Does the person need details, a secondary command, or a blocking decision? State the dismissal and focus destination. | [Menu](engineering/controls/U09A-operate-an-action-menu/spec.md) · [Dialog](engineering/controls/U09B-dismiss-a-dialog/spec.md) · [Disclosure and popover](engineering/controls/U09D-reveal-related-detail/spec.md) · [Existing disclosure](https://yogurt-theta.vercel.app/system.html#components) |
| Collections | Search and filter bar, count, navigable row, list, selection and empty result | Keep a stable row ID, recovery path and distinction between empty source and no matches. | [Find records](engineering/patterns/U11A-restore-collection-context/spec.md) |
| Feedback | Field error, status, inline notice, skeleton, progress, toast and full result | Choose persistence and announcement from the impact of the event. A blocked task needs a persistent recovery. | [Task feedback](engineering/controls/U10A-show-task-feedback/spec.md) |
| Display and data | Record facts, source and as-of time, data table, chart, legend and text equivalent | Expose units, coverage and missing readings honestly across visual and accessible representations. | [Observed values](engineering/data-visualization/U07A-encode-observed-values/spec.md) · [Record](engineering/patterns/U12A-show-authorized-facts/spec.md) |
| Decisions and receipts | Context, consequence, bounded choice, original receipt and recovery | A review may send an authorized action. Following the receipt reads the existing request. | [Decision](engineering/patterns/U13A-confirm-current-decision/spec.md) · [Receipt](engineering/patterns/U14A-reconcile-original-receipt/spec.md) |
| Identity and conversation | Project mark, agent avatar, gaze, message, activity, reading anchor and transcript | Identify the speaker, preserve reading position and display only observed reply state. | [Agent](intents/artwork/I06-recognize-an-agent/spec.md) · [Reply](engineering/patterns/U20A-present-streamed-replies/spec.md) |

## Find a component

Find an entry by its Yogurt name, ID or family. [Four editable blocks](using-yogurt.md#editable-blocks) build settings, collection, decision and conversation screens from those components.

## Accepted visual basis

Open [Four controls in one saved view](engineering/controls/first-four/README.md) for the Button, Icon button, Text field and Switch intent/spec pairs. Operate them together in the [working study](../examples/basic-controls/index.html). The table below describes the earlier kit’s implementation inventory.

## The original ten static patterns

| Stable component ID | What the product supplies | What to observe | Owning change |
| --- | --- | --- | --- |
| `button` | Label, availability, pending state and one callback | A completed activation fires once. A canceled press fires zero times. | [U08A](engineering/controls/U08A-activate-an-action/spec.md) |
| `search-field` | Label, query, reset and current result generation | The label persists during typing. Clearing restores the collection and focus. | [U08B](engineering/controls/U08B-edit-labeled-values/spec.md) · [U11A](engineering/patterns/U11A-restore-collection-context/spec.md) |
| `select` | Stable option IDs, labels and the current key | The selected value agrees with its label across filtering and option replacement. | [U08B](engineering/controls/U08B-edit-labeled-values/spec.md) |
| `disclosure-row` | Named summary and the permitted detail | Visible expansion, accessible state and return focus agree. | [U09D](engineering/controls/U09D-reveal-related-detail/spec.md) |
| `status` | Current observed condition and its subject | A word explains the condition on either surface and meaningful changes are announced once. | [U10A](engineering/controls/U10A-show-task-feedback/spec.md) |
| `result` | Cause, available recovery and the related request | Empty, filtered and failed conditions have distinct next steps. | [U10A](engineering/controls/U10A-show-task-feedback/spec.md) |
| `record-facts` | Subject, authorized facts, original time and coverage | The time stays with the observation. Revoked values leave visual and accessible views together. | [U12A](engineering/patterns/U12A-show-authorized-facts/spec.md) |
| `confirm-dialog` | Consequence, current revision, allowed choice and fallback focus | Cancel sends nothing. Explicit confirmation emits one valid tuple. | [U09B](engineering/controls/U09B-dismiss-a-dialog/spec.md) · [U13A](engineering/patterns/U13A-confirm-current-decision/spec.md) |
| `receipt` | Original request ID, authority to read it and its observed result | A lost acknowledgement stays uncertain. Looking it up creates zero new business requests. | [U14A](engineering/patterns/U14A-reconcile-original-receipt/spec.md) |
| `action-menu` | Trigger, permitted item IDs and host focus destination | Selection returns one ID, dismissal emits zero and the layer releases focus. | [U09A](engineering/controls/U09A-operate-an-action-menu/spec.md) · [U16A native](engineering/renderers/U16A-map-native-controls/spec.md) |

The [workspace patterns](workspace-patterns.md) compose the roster, project home, source library and operational views. [Components](../catalog/components.json) and [blocks](../catalog/blocks.json) record the complete SDK inventory. The [pattern catalog](../catalog/patterns.json) records support for the original static patterns.

## A publishable component entry

Describe its purpose and when to choose a neighboring control, the named anatomy and stable values, controlled/uncontrolled behavior where supported, keyboard and touch behavior, active/disabled/pending and interrupted states where meaningful, and how focus or source state recovers. Include English labels, light/dark token references, accessible output, a working example and evidence for each target claimed. Calendar uses local civil dates and named bounds. Command searches enabled actions by stable ID. Both have keyboard examples in the gallery.


[Current component support](status.md) · [Machine-readable task catalog](../catalog/patterns.json) · [Choosing the component foundation](component-foundation.md)
