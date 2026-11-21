# Native input journey fixture

Status: reviewed fixture scope under the Native SDK-default and component library decisions.

Build a local macOS-only host using the installed Yogurt templates, SDK controls, fonts and Yogurt theme. The host owns three independent text buffers and displays one text, search or OTP input at a time, because the current templates share the `edit` message. Switching modes must preserve each value. Search clear affects search only; OTP submission is local feedback, not authentication. A switch requests one host state change, and a choice menu opens, selects or dismisses using local state. Appearance toggling changes the same theme. The open choice menu must remain interactive when it overlaps another control. Display the host-selected value separately so the runtime snapshot can distinguish a model update from an inaccessible trigger value. No network, service or product data is involved.

Confirm real keyboard input, selection and paste, clear, OTP submit, pointer and keyboard switch operation, menu selection and dismissal, mode switching, light/dark and narrow window layout in an installed Native host. Capture the actual window and record SDK and build revision. Template compilation or a model test alone is not runtime, accessibility or visual evidence. Do not claim pixel or motion parity.
