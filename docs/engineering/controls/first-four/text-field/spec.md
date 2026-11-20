# Text field

Draft design r2 · parent [edit a name](intent.md) · [U08B](../../U08B-edit-labeled-values/spec.md). Proposed item `@yogurt/text-field`. Public inputs are field ID, persistent label, string value, change callback, optional trailing action, description, invalid state and availability. The host keeps the draft and saved value as separate fields.

**Form.** Place the 14/20 label at the reading edge. Use a 36 px desktop field with 12 px leading inset, 8 px corners, 14/20 editable text at 400, and a trailing icon with its own target. The field and Save button align on the same baseline with an 8 px gap. Use 16/24 editable text and a 44 px target on touch. The field has a quiet surface fill. Keyboard focus adds a visible 2 px ring, an error adds an inline message, and high-contrast mode exposes the input boundary.

**State and input.** Empty, populated, focused, invalid and corrected states share one label. Typing, paste and composition update the draft. An IME confirmation must not submit a partial name. On an empty or whitespace-only submission show “Enter a view name.”, associate the message with the input, mark it invalid and move focus there. A nonempty correction removes the error. Only an explicit save commits the current candidate. A host denial preserves editable text and leaves retry reachable. Empty-on-clear alone does not raise an error.

**Acceptance.** A reviewer compares the input’s accessible name and visible label across every state, then types with the keyboard, clears, submits and corrects it. The validation text is visible and programmatically associated. On 320 px and with enlarged text the next control stays usable. The value survives a rejected save. A response for draft A never overwrites draft B or moves its caret.

**Implementation handoff.** Use native single-line editing semantics on each target. Verify actual composition, selection, caret and platform text scaling on an installed native host before claiming support there.
