# Guide runtime verification

The guide's Vite development server and production preview rendered the component and motion catalogs at 320 and 1440 pixels. Browser checks exercised direct entry, reload, legacy hashes, unknown IDs and browser history. The existing web checks passed, including 78 motion-gallery interactions. The SDK also built in isolated Vite 8.3.8 and Next.js 16.4.6 consumer projects using a packed SDK archive.

These checks cover local browsers and consumer builds. They do not qualify the native runtime or establish a deployed production result.

The shared-shell follow-up passed in Vite development and production preview at 320 and 1440 pixels. The browser retained the same masthead node across main routes and back/forward navigation, preserved appearance across reload, resolved legacy OTP and motion links, and exercised palette switching, emoji selection, playbook state and agent playback. Existing component-guide navigation and workflow interaction checks also passed.
