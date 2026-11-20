# Switch

Draft design r2 · parent [change which dates I see](intent.md) · [U08B](../../U08B-edit-labeled-values/spec.md). Proposed item `@yogurt/switch`. Public inputs are a stable label, boolean checked value, optional description, availability and change callback. Use it for an immediate binary preference.

**Form.** A 32 × 19 px track leaves a 3 px inset around a 13 px thumb. Moving 13 px puts the thumb at the opposite inset. Keep the track the same size on touch and make the entire label row at least 44 px high. Give the row label the same type as the field label. Position and accessible checked state distinguish on from off. The right end of the track aligns with the group’s trailing edge.

**State and input.** Use a named switch with a boolean checked state. Space or label activation requests the opposite value once. The first paint shows the current value already at rest. The track reflects the applied value. The thumb reverses from its current position on a second input and settles within 160 ms of the last input. Reduced motion shows the endpoint immediately. The label stays “Record dates” in both states. A disabled switch ignores activation. If a remote host declines a change, restore the confirmed value and give a reason.

**Acceptance.** A keyboard and touch reviewer operates the label as well as the track. Compare checked state, thumb endpoint and every date cell at each release. A rapid off–on–off sequence ends off with no lingering transition. No activation submits the name. In reduced motion both endpoints differ by 13 px with zero programmed travel time.

**Implementation handoff.** The desktop web recipe and native adapter consume the same boolean contract. Record the platform switch or equivalent accessible role, spoken value and actual touch target on each shipping host.
