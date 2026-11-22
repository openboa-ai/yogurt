# Native tooltip trigger

The owner requested that the Native tooltip attach to a caller-supplied control instead of rendering a permanently visible hint. This change is limited to the Native tooltip template and its catalog and guide examples.

Keep the `yg-tooltip` template name and `label` argument. The caller supplies one accessible trigger in the default slot; place it and the anchored, noninteractive tooltip in the same SDK stack. Let the SDK manage hover, keyboard focus and dismissal. The label is supplemental text and must not be the only accessible name or essential instruction. Do not invoke a domain action to display the tooltip.

This changes the previous label-only rendering contract: old callers without a trigger must add a slot to display a useful tooltip; the template does not supply an implicit control. The Native template does not promise custom placement, delays or touch-only discovery. Callers must make essential information available without hover.

Acceptance evidence: the Native catalog and guide supply a harmless named button as the trigger. Build the catalog against the pinned SDK and verify the control is visible without a permanent tooltip; verify hover and keyboard focus reveal the hint and pointer exit, blur and Escape dismiss it without activating the trigger. Record any platform or accessibility limitations separately; an SDK source inspection alone does not establish host behavior.
