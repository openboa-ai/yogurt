# Guide runtime verification

The guide's Vite development server and production preview rendered the component and motion catalogs at 320 and 1440 pixels. Browser checks exercised direct entry, reload, legacy hashes, unknown IDs and browser history. The existing web checks passed, including 78 motion-gallery interactions. The SDK also built in isolated Vite 8.3.8 and Next.js 16.4.6 consumer projects using a packed SDK archive.

These checks cover local browsers and consumer builds. They do not qualify the native runtime or establish a deployed production result.
