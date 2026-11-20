# Button

Draft design r2 · parent [save the name](intent.md) · [U08A](../../U08A-activate-an-action/spec.md). Proposed item `@yogurt/button`. Public inputs are a visible label, emphasis, availability, pending state and an activation callback. The product owns the save operation.

**Form.** Give the single primary action a 36 px minimum desktop height, 12 px of horizontal padding and 14/20 Rethink Sans 500. Start with an 8 px corner. Compare 6, 8 and 10 px using the same label, font, height and padding. The chosen radius must be recorded explicitly before implementation. At coarse pointer use at least 44 px. Let multi-line labels increase the height. Reserve the larger of the resting and pending label widths. Use the [shared light and dark roles](../README.md).

**State and input.** Rest → pressed → activated → pending → confirmed or failed. Pointer release inside, Enter or Space each use the host’s single activation path. Press then release outside cancels. Disabled actions expose their availability. While pending the control keeps keyboard focus and blocks additional activation. Keep “Saving…” until the host settles. Show “Name saved” only for a confirmed change. A failed save keeps the draft and presents the same reachable action. A clean draft presents an unavailable save.

**Acceptance.** A keyboard and pointer reviewer measures the button box at rest and while pending. Width drift is at most 1 CSS px. One activation produces one callback, a canceled press zero and repeated activation while pending zero additional callbacks. Reject once and retry. The saved title changes once on success. On an edit made during a pending request the earlier result can update the saved title and must leave the newer draft intact.

**Implementation handoff.** Expose the same contract to an individual web recipe and a typed native action. A native observer must check focus, accessibility name, callback count and control size in the installed build. The browser drawing is the visual proposal.
