# Guide runtime verification

The guide's Vite development server and production preview rendered the component and motion catalogs at 320 and 1440 pixels. Browser checks exercised direct entry, reload, legacy hashes, unknown IDs and browser history. The existing web checks passed, including 78 motion-gallery interactions. The SDK also built in isolated Vite 8.3.8 and Next.js 16.4.6 consumer projects using a packed SDK archive.

These checks cover local browsers and consumer builds. They do not qualify the native runtime or establish a deployed production result.

The shared-shell follow-up passed in Vite development and production preview at 320 and 1440 pixels. The browser retained the same masthead node across main routes and back/forward navigation, preserved appearance across reload, resolved legacy OTP and motion links, and exercised palette switching, emoji selection, playbook state and agent playback. Existing component-guide navigation and workflow interaction checks also passed.

## Template and workspace observations

The initial gallery pass rendered 30 template or study routes at 390 and 1440 pixels. The browser changed a preset and reset it, validated a sample account form, filtered a dashboard register, dismissed a navigation dialog with Escape, and exercised the Sourdough review, inspector and simulated reply.

- A directory toggle inside the PageHeader title shifted it away from the description and preview. The gallery now places the toggle in the preview toolbar, so the title, lede and preview share the same edge.
- The workspace makes it possible to keep the transcript available while inspecting source facts. The inspector uses the existing workspace layout and returns to its trigger when closed. The composer and transcript remain tied to the chosen agent.
- The transcript displays its reading anchor even before there is material below the current reading position. A follow-up should verify when the affordance is useful and define its focus behavior before changing the shared component.
- The chart study uses the available line and bar APIs. Filled areas, stacked series and percentage stacks would require a separate chart contract and data accessibility evidence.
- Generated composition code demonstrates the card, presentation options and action group. The demo's sample data and task state remain host inputs.

## Hosted guide composition

The production Vite build used the same Yogurt masthead across all hosted route families. The selected destination retained its surface treatment without an underline at 320, 900 and 1440 pixels. Old handbook, control, wordmark and task-state URLs opened the matching React page. The browser exercised color selection, roster search and recovery, project emoji contour, agent playback, emoji search and artwork variants, the playbook menu and profile actions.

The component sweep opened all 168 hosted component and block routes at 320 pixels in dark appearance and 1440 pixels in light appearance. It checked the specimen, the guide title, horizontal overflow, the masthead treatment and browser errors. The interactive template check passed all 64 compositions at 390 and 1440 pixels. Shared UI sources checks the source boundary and runs the hosted shell test against a production Vite build.

## Brand book and reference guide

The built guide opened the home, asset anchors, foundations, component detail, templates, design sources, project setup, playbook, emoji, agents, and Studio at 390 and 1440 pixels. The desktop and mobile captures showed the original project artwork, a shared reading edge, and flat brand documentation with source downloads. The Upright 9 download returned its SVG from the built site.

The palette presented all 267 tokens in 22 hue families at once. Pointer selection, directional keys, and copying the selected CSS variable worked in light and dark appearances. At narrow width, the shade columns scrolled inside the palette while the hue names stayed visible and the page retained its width.
