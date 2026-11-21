# Native component guide

Status: reviewed.

## Intent and boundaries

Provide a persistent, runnable macOS Native development guide in `apps/native-guide` for browsing the current Yogurt component catalog and interacting with its locally modeled examples. The application uses no account or network, stores no user data, and must not perform external product actions. It uses the shared Native controls, theme and Rethink Sans assets from the checkout; it does not change their public API or claim coverage of other platforms. The separate web guide is publicly available; this scope does not publish or distribute the Native guide.

## Behavior and construction

Keep the app's host, manifest, generation script and run instructions under its own directory. Generate typed markup imports from the current component and block inventories and template contracts, retaining IDs and diagnostics for missing templates, dependencies or arguments. Use the existing catalog generation and installation infrastructure rather than maintaining a second inventory. The app must support choosing a component, moving to adjacent entries, appearance switching, and scrolling in a small window. Provide real bounded sample state and controls for the host actions already implemented; identify unsupported items by availability beside the name instead of implying an operation occurred. Keep fixture and debug explanations out of the guide interface. Reset example state on navigation while retaining appearance. Inputs and sample actions exist only in the running app.

Keep the existing agent shapes and motion sources intact. Where this host cannot render or animate an agent, disclose the gap; do not substitute a static image and claim motion works. A scaffold or generated files must not overwrite a user's existing application: preparation runs in a fresh isolated SDK host and fails closed on invalid input. Preserve the SDK starter notice when distributing starter-derived code. No publication, installation into user applications, or external effects are included.

For the AgentAvatar and Gaze examples, use the approved vector playback and its unchanged poses, including Kai, Sol and all six selectable states. Render only the visible specimen into one reusable transparent image slot and schedule updates from the playback's next-frame delay. Respect the system reduced-motion setting with the authored still pose, and redraw once when the setting changes. Stop updates when another specimen is selected and preserve the last rendered image if registration fails; expose failure instead of representing an unavailable animation as successful. Use a centered 72-point specimen and identify the selected agent accessibly. Other agent compositions retain their explicit availability notice until connected.

The agent row, agent sidebar, workspace and profile examples use separate registered Kai and Sol image slots and independent approved playback states. Roster examples use Kai ready and Sol working, with the selected agent's own image in the workspace or profile. Do not substitute one agent's image for another when rendering fails. Respect reduced motion and stop scheduling after leaving these examples.

Register the bundled Yogurt, Sourdough and Meatball project marks as static images for their specimen, each with a distinct host-owned image ID and its own visible name. Registration runs once after the image service is available; report each unavailable mark if its decoding or registration fails, without substituting another image. Keep these IDs separate from agent image IDs and preserve each registration across specimen and appearance changes. Static project marks do not represent agent animation.

Tabs, segmented control and radio group examples expose multiple labeled choices with one selected option. The selection list exposes independently toggled checkboxes. Typed local actions update their visible state; navigation resets the examples. These examples do not imply any external change.

The verification-code example starts empty and displays the host's edited value, including pasted text, without implying a completed verification.

The project sidebar example expands and collapses its view group and reflects the selected destination locally. Its destinations describe project views rather than separate projects. Its project mark uses that project's registered image and reports no substitute if registration fails.

The guide follows the existing web component guide's canvas, identity, hierarchy, spacing and preview treatment using the shared Native theme. The header uses the supplied OpenBoa symbol. The component index groups items by family, showing the current family; choosing another family selects its first item. Indent each child and its selection surface past the family chevron and label. Compact specimens retain their content-sized controls and are centered in the preview in both axes. Larger specimens can grow beyond the preview's minimum height and must remain scrollable. Keep the three project marks undistorted and correctly labeled.

Gallery dialogs, drawers, sheets and confirmation layers start closed. Their triggers open them and their dismissal unmounts the layer so the component browser remains navigable. Toast dismissal restores its trigger. Agreement selection updates each checkbox and its group control.

## Acceptance evidence

Verify generation against the current catalog without silently missing entries; compile and launch with the project's pinned Native SDK and Zig versions. Exercise navigation, text input, selection and other modeled controls, both appearances and short window scrolling in the real application. Compare a compact action and all three project marks with the web guide in the actual Native window; inspect the marks after navigating away and back, and verify registration failure is visible. Distinguish compile and model tests from visual, interaction, accessibility and motion evidence. Record gaps rather than marking the entire catalog verified. Verify that agent sources are unchanged. Generated SDK scaffold files and dependencies are not committed.

Exercise the live agent specimen at each state, compare rendered poses and transitions with the shared playback, and confirm it stops updating on navigation and at settled poses. Inspect actual frames and report timing and resource usage separately from model tests.
