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

Run `npm run guide:dev` from the repository root for the Vite development server. Run `npm run guide:build` followed by `npm run guide:preview` to build and serve the production site locally. The [Vercel configuration](../../vercel.json) builds the same output. The published guide uses extensionless paths such as `/components/button` and `/components/motion-checkbox-list`; previously shared HTML links remain available. The hosted routes share a single React shell and appearance preference. The published artwork, typography and story are available from Brand; original editable sources are available from Design sources. With the preview running on port 5273, run `node checks/web-guide-shell.cjs` to exercise the common navigation and direct links. Open `generated/components.html` and the other files in `generated/` directly for the offline galleries.

[U17A · Resolve a task to design guidance on the pinned version](../../docs/engineering/guidance/U17A-index-design-guidance/spec.md) · [Design portfolio](../../docs/README.md)

## Component motion comparison

Generate the offline comparison with `node apps/guide/tooling/build-ui-gallery.mjs --motion-comparison`. Run `node checks/web-motion-comparison.cjs` from the repository root to exercise interrupted input, keyboard selection and touch drag. The review can follow the system appearance or switch between light and dark.

## Motion pattern review

Run `node apps/guide/tooling/build-ui-gallery.mjs --motion-patterns` after the SDK build to regenerate the offline gallery. Installable patterns with examples appear under Interactive patterns in the component catalog. Former motion URLs lead to the matching component or the component index.

The reusable Web patterns are available from `@openboa/yogurt/motion-patterns` with `@openboa/yogurt/styles.css`. The additional studies are gallery examples. Run `node checks/web-motion-patterns.cjs` to exercise the gallery, alignment and representative interactions.

The hosted workflow address leads to the product playbook. Build the three offline product workflows with `node apps/guide/tooling/build-ui-gallery.mjs --workflows` after the SDK build. The offline file is `generated/workflows.html`. Each workflow links to the actual component examples it uses.

## Templates and examples

Open `/templates` to build and reset a small composition with the installed UI. The directory also includes desktop navigation, account forms, a release dashboard and typography and chart studies. Open `/examples/sourdough` for a complete research workspace demonstration with sample data, independent agent threads and a source inspector. The previews exercise local interactions and introduce no product service. With the guide running, `node checks/web-template-gallery.cjs` checks the example routes and representative interactions.

The hosted routes compose the public Yogurt package. Put guide-specific layout in the owning React route and use shared components for the controls, typography and navigation. Offline pages and their styles are separate exports. Shared UI sources checks this boundary in required CI.
