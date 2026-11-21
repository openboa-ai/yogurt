# Design guide

This directory owns the [authored pages](pages/), interactive examples, page generators and browser scripts. Build the site before opening the guide locally.

| Guide | Source and purpose |
| --- | --- |
| [Brand](https://yogurt.openboa.ai/), [system](https://yogurt.openboa.ai/system) and [artwork library](https://yogurt.openboa.ai/library) | Read the brand rules and interact with design resources. Classic browser scripts live in [runtime](runtime/). |
| [Component gallery](generated/components.html) and [agent family](generated/agents.html) | Render the React library in the offline guide. The gallery generator bundles the [examples](examples/) with styles from this directory and the shared design sources. |
| [Product playbook](https://yogurt.openboa.ai/playbook) | Explore tasks and their states. The generator reads the [pattern catalog](../../catalog/patterns.json) and [project scenarios](../../examples/project-use/scenarios.json). It writes `runtime/playbook-data.js`. |
| [Design handbook](../../docs/index.html) | Read the [Markdown design records](../../docs/README.md) in one offline document. |

From the Yogurt repository root, install the guide's build dependency and regenerate the handbook from the [design records](../../docs/README.md).

```sh
npm --prefix apps/guide/tooling ci
npm --prefix apps/guide/tooling run build:handbook
```

From the repository root, install the SDK development dependencies with `npm ci` before bundling the galleries.

```sh
node apps/guide/tooling/export-playbook.mjs
npm run gallery
npm run gallery:agents
```

The handbook generator writes `docs/index.html`. The guide consumes the shared [catalog](../../catalog/README.md) and [renderer sources](../../packages/README.md).

## Hosting

Run `npm run guide:dev` from the repository root for the Vite development server. Run `npm run guide:build` followed by `npm run guide:preview` to build and serve the production site locally. The [Vercel configuration](../../vercel.json) builds the same output. The published guide uses extensionless paths such as `/components/button` and `/motion/checkbox-list`; previously shared HTML links remain available. Open `generated/components.html` and the other files in `generated/` directly for the offline galleries.

[U17A · Resolve a task to design guidance on the pinned version](../../docs/engineering/guidance/U17A-index-design-guidance/spec.md) · [Design portfolio](../../docs/README.md)

## Component motion comparison

Generate the offline comparison with `node apps/guide/tooling/build-ui-gallery.mjs --motion-comparison`. Run `node checks/web-motion-comparison.cjs` from the repository root to exercise interrupted input, keyboard selection and touch drag. The review can follow the system appearance or switch between light and dark.

## Motion pattern review

Run `node apps/guide/tooling/build-ui-gallery.mjs --motion-patterns` after the SDK build to regenerate the offline gallery. The hosted gallery is available at `/motion`. Use search or a section link to find an interaction, and use the appearance control to compare surfaces.

The reusable Web patterns are available from `@openboa/yogurt/motion-patterns` with `@openboa/yogurt/styles.css`. The additional studies are gallery examples. Run `node checks/web-motion-patterns.cjs` to exercise the gallery, alignment and representative interactions.

Build the three interactive product workflows with `node apps/guide/tooling/build-ui-gallery.mjs --workflows` after the SDK build. The offline file is `generated/workflows.html`. Each workflow links to the actual component examples it uses.
