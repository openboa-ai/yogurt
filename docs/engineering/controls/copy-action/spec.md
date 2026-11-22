# Shared copy action

Status: reviewed Web implementation scope under the owner-selected motion-led component foundation. Native rendering and visual approval remain separate.

## Intent and boundary

Use the same copying action and result presentation in reusable content and its standalone entry. The host supplies the text and may provide an asynchronous copy operation; absent that callback, the action requests the browser clipboard. Copying starts only on direct activation and never runs because a value, render, focus, animation or theme changes. Preserve the existing `CodeBlock` and `CopyButton` props, labels and callbacks. Do not expose copied text through status messages, logging or additional DOM. The host owns its data and copy policy.

The action reports success only when the selected copy operation resolves; rejection or an unavailable clipboard reports failure with a retry action and a status message. It prevents repeated pending requests. When the value changes while a request is pending, invalidate the old result but keep the action pending until the outstanding operation settles. Clipboard and host effects cannot be cancelled: permitting a new write before the first settles could allow the older write to overwrite the newer one. Once it settles, restore an actionable state without reporting its stale result; the next activation uses the latest value. A handler identity change alone must not invalidate an in-flight request: ordinary parent renders commonly recreate inline callbacks. The active request retains its captured handler, and the next activation uses the latest handler. Unmount cancels timers and ignores late completions.

## Presentation and access

The standard action retains the existing compact rolling labels and icon, accessible name and status region. A quiet compact presentation allows use in content headers without a visible perimeter line. Preserve an identifiable keyboard focus indicator, operable button, long text handling and forced-color appearance. No layout shift or overflow may hide the action at 320 px. The selected presentation uses the existing motion roles, settles promptly with reduced motion, and retains readable result and error states independent of animation support. If `ResizeObserver` is unavailable, measure on state changes and window resize without preventing mount or operation.

The host must be able to copy again after failure or success. A completed success resets after a brief interval; cancellation, superseding inputs and unmount cancel stale timers. Preserve native button semantics and prevent form submission.

## Evidence

1. Exercise the standalone export and the composition with an injected successful, rejected and delayed copy operation, and with unavailable browser clipboard. Check exactly one request on activation, text captured at activation, named action, result announcement and retry.
2. Change text while pending and attempt a second activation before resolving or rejecting the prior request. The second effect must not start until the first settles; a stale result cannot alter the new status, and a later request uses the current text. Separately rerender with a new inline handler while pending: the active request remains pending, cannot be duplicated, and its result is reported; the next request uses the latest handler. Unmount during a pending request and ensure there is no late UI update or timer.
3. Verify keyboard activation, forced colors and reduced motion; compare narrow and wide light and dark layouts. Confirm no form submit or focus loss and the result remains readable for long localized host content. Exercise the no-`ResizeObserver` fallback across state changes and window resize.
4. Verify the ordinary package and editable entry, CodeBlock guide and standalone action use the same implementation. Report actual Web and Native observations separately. The slice remains incomplete until rendered motion and the owner's interactive preview have been reviewed.
