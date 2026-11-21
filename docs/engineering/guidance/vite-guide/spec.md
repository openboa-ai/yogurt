# Yogurt web guide runtime

The owner selected React and Vite for the Yogurt website, React with Next.js or Vite for consuming web projects, and Native SDK for native applications. The guide is a static Vite application deployed on Vercel. The web component package and design tokens remain independent of the consuming web host. Native uses its own adapter and is qualified separately.

## Routes and compatibility

The component catalog uses `/components` and `/components/<component-id>`. The motion catalog uses `/motion` and `/motion/<pattern-id>`. Static guide sections use extensionless paths such as `/system`, `/workflows` and `/agents`. The root remains the brand introduction. Valid deep links must work on direct entry, refresh, back and forward. Unknown component and pattern IDs must not silently display a different item under the unknown URL.

Existing `components.html#<id>` and `motion-patterns.html#<id>` links remain usable, including in the packaged offline guide. The online guide converts navigation to the extensionless canonical routes. Legacy static files needed by previously published URLs remain available. Keep asset paths correct at a nested route and do not rewrite API, asset or unrelated paths to an app shell.

## Build and boundaries

The normal development server and online interactive guide build use Vite with React. Existing static guide documents and offline packaged examples remain part of the build; no server-side rendering, database, runtime service or production data is required. The SDK build and its individual imports stay independent of Vite and Next.js. Source changes must reach the deployed artifact through the Vercel build, and no credentials or local absolute paths belong in the output.

## Acceptance

Build from the locked dependencies. Exercise direct routes, navigation, reload, back/forward and legacy hashes at desktop and narrow widths, and verify unknown routes. Verify interactive specimens, local offline documents and static assets remain available. Run the existing component and gallery checks. Validate the package with representative Vite and Next.js consumers separately; a build or token export alone is not native-runtime evidence. Share the running guide before updating the draft preview. No merge or production deployment is authorized by this specification.
