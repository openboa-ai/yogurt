# Design guide

This directory owns the design guide, interactive examples, page generators and browser scripts. Open the root pages directly from disk.

| Guide | Source and purpose |
| --- | --- |
| [Brand](../../index.html), [system](../../system.html) and [artwork library](../../library.html) | Read the brand rules and interact with design resources. Classic browser scripts live in [runtime](runtime/). |
| [Component gallery](../../components.html) and [agent family](../../agents.html) | Render the React library in the offline guide. The gallery generator bundles the [examples](examples/) and styles from this directory. |
| [Product playbook](../../playbook.html) | Explore tasks and their states. The generator reads the [pattern catalog](../../catalog/patterns.json) and [project scenarios](../../examples/project-use/scenarios.json). It writes `runtime/playbook-data.js`. |
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

Run `node apps/guide/tooling/build-site.mjs` from the repository root to create the static site in `site/`. The [Vercel configuration](../../vercel.json) serves the same output from the project's Git integration. The custom domain for the guide is `yogurt.openboa.ai`.

[U17A · Resolve a task to design guidance on the pinned version](../../docs/engineering/guidance/U17A-index-design-guidance/spec.md) · [Design portfolio](../../docs/README.md)
