# Native conversation layout

Status: reviewed follow-up to the component library scope.

Conversation content must remain readable in a constrained width: message text, detail and summary text wrap rather than silently truncating. The transcript and agent conversation reserve a usable scroll viewport in an unconstrained host, expand with their parent when space is available, and retain their existing slots, labels and host-owned actions. The composer keeps its editable text and existing callbacks, with the send or stop action aligned at the trailing end of the tool row. Use the shared Native surface and tokens and keep agent artwork and motion unchanged.

Acceptance: compile the shared templates and workspace recipe with the pinned Native SDK. In a real Native host check long messages, a constrained viewport with scrollable conversation, and composer input and action placement. Record unsupported interactions separately; building alone does not establish visual or runtime parity.
