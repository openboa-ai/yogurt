# Icon button

Draft design r2 · parent [clear this draft](intent.md) · [U08A](../../U08A-activate-an-action/spec.md). Proposed item `@yogurt/icon-button`. Public inputs are a glyph, accessible action name, availability and activation callback. The host decides the destination after an action removes its own trigger.

**Form.** Center an 18 px icon box in a 32 × 32 px pointer target, 44 × 44 px on touch. Use the existing close glyph geometry. Keep the neutral resting face quiet and bring in a soft 6 px corner surface on hover or focus. Reserve the trailing slot when the glyph disappears so text and field width stay still.

**State and input.** Expose a button named “Clear view name”. The glyph is decorative to assistive technology. Rest → pressed → cleared uses the ordinary button activation path. Hide the clear action for an empty value. Return focus to the labeled input on activation. A canceled pointer press retains the value. The web entry in a form defaults to a non-submit button.

**Acceptance.** A keyboard reviewer tabs from the field to the named icon and presses Space. Observe one edit to the empty string, zero save requests and focus in the input. Its empty tab order skips the hidden icon. On touch, a tap inside the target and outside the painted lines must still clear it. Place focus outside the fixture and confirm the page never pulls it back.

**Implementation handoff.** A native accessibility inspector must expose the spoken action name and one actionable element. Consumers can swap the glyph within the approved icon set and name its actual effect.
