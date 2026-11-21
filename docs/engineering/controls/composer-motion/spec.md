# Composer motion and shared prompt behavior

Status: reviewed implementation scope under the owner-selected motion-led component foundation replacement. This Web follow-up does not establish Native rendering or independent visual approval.

## Intent and ownership

Apply the established prompt editor's automatic growth and send/stop motion to the ordinary `Composer`, and keep the interactive `PromptBox` and normal component backed by the same implementation for the behavior they share. The result must remain a usable message composer with attachments, tools, labels and errors; the host retains the draft, attachment state, send/stop requests, tool effects and all product outcomes. A visual transition never initiates a request.

Preserve the existing public IDs, imports, props, labels, callback signatures and host-controlled values for `Composer` and `PromptBox`. An internal shared primitive or adapter may expose the differing arrangements needed by the two entries. Shared editor measurement, surface and action choreography must have one maintained implementation; avoid two independent copies that happen to use the same tokens. Do not introduce a second theme, perimeter border, new public data manager, service call or default product status message.

## Existing behavior to preserve

- `Composer` submits trimmed text and attachment IDs through `onSend` only when not pending and either text or an attachment is present, with every known upload complete. An empty draft, pending state or incomplete upload must not send. Removing or adding attachments and choosing a tool retain their current host callbacks and visibility rules. The host controls pending and decides when state changes.
- While pending, `Composer` exposes `onStop` only when provided; otherwise it keeps the pending action disabled. The textarea and attachment controls keep their existing availability. Clicking Stop must call `onStop` once and must never submit the form, including during rapid pending changes. Preserve the existing textarea Enter and Shift+Enter behavior; do not silently turn Enter into submit for this public component.
- `PromptBox` keeps its existing controlled `value`, `onChange`, `onSubmit`, `busy` and optional `onCancel` contract. Enter submits a nonempty, nonbusy prompt, Shift+Enter inserts a newline, and IME composition does not submit. During busy state, the action stops only when a cancellation callback exists; otherwise it is disabled. Its visible status remains scoped to that entry and must not be imposed as a claim about a host's generic pending state.
- The existing labels, errors and descriptions remain connected to the actual input. The editable registry, ordinary package entry, existing guide and standalone prompt example must resolve to the same maintained implementation, with compatibility for existing consuming applications.

## Visual and motion contract

Use the established neutral borderless surface, type, radius, editor and action roles. The editor grows and shrinks with actual wrapped content, up to a bounded height, then remains scrollable without clipping the caret. Preserve the normal composer's existing minimum of two visible rows and its manual resize capability unless a separately accepted change replaces that interaction; the compact prompt entry retains its one-line minimum and existing maximum. Attachments, error text, tool actions and the trailing send/stop action remain inside the available width without overlap at 320 px and wider. Do not force a fixed demonstration width on a consuming application.

Apply the shared editor and action motion profiles to changes in height and to the send/stop presentation, with a stable hit area and accessible action name throughout. Retarget from the current visible state when input or pending state reverses; do not queue stale transitions. If using separate semantic buttons, retain distinct DOM identity so the browser cannot submit when Stop is activated during a pending-to-ready transition. Surface focus must remain perceptible with keyboard, in both appearances and in forced colors. An action's visual change cannot imply a successful send, completion or cancellation.

Reduced motion settles the same visible, enabled and accessible states promptly, including when the preference changes during a transition. No observer or animation continues after unmount. Do not perform repeated synchronous layout work on every animation frame; cap work to actual content or container size changes. If a measurement API is unavailable, maintain an editable, readable textarea with normal scrolling and the existing submit/stop behavior.

## Acceptance evidence

1. Exercise real installed Vite and Next.js consumers with empty, text-only, attachment-only, incomplete upload, error, pending with Stop and pending without Stop states. Verify exactly one host callback for each requested action and none for blocked sends, including rapid send/stop reversal.
2. Compare the component and prompt entry at rest, during editor growth and shrink, and through send-to-stop-to-send at 320 and 1440 px in light and dark. Capture intermediate frames and narrow layouts with attachments and long text, not just final screenshots. Validate the action remains correctly aligned and text/caret stay visible at the height limit.
3. Verify controlled external value changes, emptying a draft, long unbroken input, multiline input, selection, IME composition, the existing Enter/Shift+Enter behavior for each entry, focus continuity and native form submission. Check that available attachment and tool callbacks stay correct when pending changes.
4. Check keyboard operation, accessible names and description/error associations, coarse-pointer target, forced colors, reduced motion enabled before and during movement, observer cleanup and mount/unmount. Confirm that an unavailable measurement API falls back without losing input or actions.
5. Validate the normal exports, editable registry output, guide and interactive prompt entry consume the shared implementation. Report local browser, installed-consumer, independent visual review and any Native evidence separately. The slice remains incomplete until the owner can inspect the interactive preview.
