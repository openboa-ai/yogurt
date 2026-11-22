# Toast swipe gesture

Status: reviewed implementation scope under the owner-selected motion-led component replacement. The existing `toast-exit` and `toast-stack-motion` contracts continue to govern host ownership, focus, announcement, stacking, removal and cleanup. This slice adds an optional gesture; it does not establish Native support or visual approval.

## Intent and contract

Allow a host to opt into horizontal swipe dismissal of the existing `ToastStack` while retaining the ordinary accessible dismissal action. The host retains its ordered `items` and exclusively decides removal. On a completed sufficiently long or fast horizontal gesture, request `onDismiss(id)` once; if the host keeps the ID, the notice returns to its rest position and stays fully actionable. No animation or timer changes the host list or produces another effect. A confirmed host removal uses the existing exit lifecycle.

The default list and stacked variants preserve their existing API and behavior unless swipe is explicitly enabled. The motion guide uses the ordinary stack with the opt-in and preserves add, expand, explicit dismissal, partial drag return and swipe dismissal. Use nested gesture and stack/exit layers so transforms never overwrite each other.

Accept only the primary pointer and primary mouse button. Decide horizontal versus vertical intent after a six-pixel threshold; preserve vertical scrolling. Request dismissal after 100 px of travel, or a matching-direction release velocity above .11 px/ms. Do not begin gestures from buttons, links, form controls, editable content or a visually obscured notice. Capture the pointer only after horizontal intent. A short drag, `pointercancel`, lost capture or unmount never requests dismissal and returns to rest. No duplicate request may arise from pointer-up followed by lost capture. Starting a new drag during return takes the current position and cancels the old animation. Keep the existing close button and keyboard contract; swipe must not be required for access.

Use a bounded, interruption-safe spring return, with no repeated React state updates per animation frame. In reduced motion the gesture remains functional but returns immediately on release or cancellation. A preference change during return settles the notice without dismissing it. Cleanup cancels animation work and prevents late callbacks. During a host-confirmed exit, the gesture becomes inert, and returning the same ID follows the existing re-add lifecycle.

## Evidence required

1. Exercise short, long and fast swipes in each direction, vertical drags, pointer cancellation, lost capture, repeated swipes, dragging from an action, and unmount; verify exactly one requested ID only for committed horizontal gestures. A host that rejects the request retains the item at rest and can request again.
2. Confirm host removal, rapid re-addition with updated content, simultaneous entries, compact and expanded stacks, regular list, keyboard close and focus recovery preserve the existing contracts. Verify a hidden layer cannot be dragged.
3. Observe normal and reduced motion, including switching preference during return, at 320 and 1440 CSS px. Check return motion, interruption, wrapping and no clipping. Use actual rendered frames separately from automated geometry checks.
4. Exercise the ordinary export, editable entry and motion guide with the same implementation and re-run the existing toast exit and stack tests. Report installed Vite, Next.js and Native evidence separately.
