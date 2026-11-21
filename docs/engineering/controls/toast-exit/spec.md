# Toast stack exit

Status: reviewed implementation scope for the owner-selected motion-led component foundation replacement. This narrow Web follow-up does not establish Native renderer support or visual approval.

## Intent and boundary

Give a notification removed from `ToastStack` a brief exit consistent with the existing toast arrival and shared motion roles. Keep the current `items`, `onDismiss` and `label` public properties and individual `Toast` contract. The host owns the list, stable unique item IDs, message content and removal decisions. Calling `onDismiss` requests removal once; do not start the exit or change host data merely because the callback was invoked. Start an exit only after the host stops supplying that ID. No timer performs a product or service effect.

An exiting visual is a transient presentation of the removed item, not an active notification: it cannot be activated, focused or announced again. Remove it after the exit finishes. Do not introduce a general notification manager, portal, notification history, new public properties or a new independent design language.

## Lifecycle and accessibility

- Keep active entries in host order. Handle concurrent removals independently. A removed entry exits at most once; pending exit cleanup cannot remove another active item.
- If an ID returns while its exit is in progress, cancel or supersede the stale exit and show exactly one active entry with the latest host message and action. Do not leave duplicate IDs, stale callbacks, duplicate announcements or a delayed removal capable of removing the returned entry. An ID that appears again after its exit has completed is a new active entry. Simultaneous duplicate IDs in host input remain outside this contract.
- If focus is in an entry that the host removes, do not leave focus in a hidden or inert subtree. Move it to a remaining dismissal control or the stack region only if it is still inside the removed entry; do not steal focus that has already moved elsewhere. Preserve an accessible label for any fallback target. An entry removed while focus is elsewhere must not change focus.
- Active messages retain their existing status announcement behavior. The exiting visual is hidden from accessibility APIs and interaction before or as it exits, without repeating the live announcement. Do not suppress an actual newly supplied message.
- With reduced motion, remove the visual promptly without a motion delay. If the preference changes while an exit is underway, finish cleanup promptly. Unmounting the stack cancels outstanding listeners, timers and animation work without callbacks or state updates after unmount.
- The final appearance and motion should use existing shared values where they express the same role; do not add a token solely for an isolated value. Keep the normal surface borderless and retain visible focus and forced-color behavior.

## Acceptance evidence

1. In a Web consumer, a dismissal callback that leaves `items` unchanged keeps the toast visible and actionable; host removal produces one exit and then removes the visual. Multiple removals and separate dismissal requests retain their own IDs.
2. Remove and immediately re-add the same ID with changed text before the exit finishes. Verify exactly one active toast with the new text, one current callback, no stale removal after the old exit duration, and no duplicate status announcements. Repeat with rapid consecutive changes.
3. Remove a focused toast, a toast while focus is elsewhere, and the last toast. Verify focus never remains in an inaccessible subtree and is not stolen from elsewhere. Exercise keyboard and screen reader semantics and check visible focus in normal and forced-color modes.
4. Verify reduced motion before removal and switched on during exit; neither leaves a lingering visual. Unmount during an exit and confirm no late callback, error or update. Exercise normal and reduced motion at narrow and wide sizes in both appearances, including interruption and long message wrapping.
5. Check ordinary package export, editable entry and guide against the same contract. Capture the observed before/exit/after frames for owner review. Report Web fixture, installed host and Native runtime evidence separately; do not call Native qualified without actual target observations.
