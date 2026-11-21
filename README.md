<img src="design/assets/projects/yogurt.svg" alt="Yogurt project mark" width="96">

<!-- starter:project -->
# yogurt

ships with live cultures
<!-- /starter:project -->

Yogurt is OpenBoa’s design system and UI SDK. It gives projects shared rules for color, type, motion and product language, plus components and screen patterns for React and Vercel Native SDK.

[Browse the design system](https://yogurt.openboa.ai/)

## Getting started

- **Design a screen** with the [design rules](DESIGN.md), [component gallery](https://yogurt.openboa.ai/components) and [product playbook](https://yogurt.openboa.ai/playbook).
- **Build a product** using a pinned SDK revision. Follow the [Web setup](docs/using-yogurt.md#web) or [Zig and Vercel Native setup](docs/using-yogurt.md#zig-and-vercel-native-sdk).
- **Use Yogurt with Codex** by installing the [Yogurt plugin](plugins/yogurt/README.md) and pointing it at the project's SDK pin.
- **Make something on brand** with the [identity guide](https://yogurt.openboa.ai/), [design tokens](https://yogurt.openboa.ai/system) and [artwork and emoji](design/assets/README.md).

From an existing product, install the SDK at the full GitHub commit you want to use.

```sh
npm install "git+https://github.com/openboa-ai/yogurt.git#<commit-sha>"
npx yogurt list
```

For a local archive, see [SDK installation](docs/using-yogurt.md#install-the-local-sdk).

## Repository structure

| Area | Responsibility |
| --- | --- |
| [Design sources](design/README.md) | Artwork, fonts, tokens and product language |
| [Catalog](catalog/README.md) | Shared component and pattern IDs, contracts and target bindings |
| [Packages](packages/README.md) | React, Native and editable composition recipes |
| [Guide](apps/guide/README.md) | Authored pages, interactive examples and generated galleries |
| [Plugins](plugins/README.md) | Installable agent workflows |
| [Examples](examples/README.md) | Complete screens and integration cases |
| [Checks](checks/README.md) | Runtime verification and [agent evaluations](checks/evals/README.md) |
| [Maintainer scripts](scripts/README.md) | Build, export and installed lookup entry points |

The [repository map](docs/repository.md#keep-one-owner-for-each-source) explains where to make a change and what each source generates. The [design records](docs/README.md) connect intents, decisions and verification.

## Development

Run these commands from the repository root.

```sh
npm ci
npm run build
npm run guide:dev
```

The guide uses React and Vite. To build and preview the hosted site locally:

```sh
npm run guide:build
npm run guide:preview
npm run check:ui
```

Use the [verification guide](checks/README.md) to test an installed SDK in an independent project. The generated component galleries can also be opened directly from `apps/guide/generated/`.

## Contributing

Follow [CONTRIBUTING.md](CONTRIBUTING.md) for the change and PR process, [AGENTS.md](AGENTS.md) for repository instructions, and [SECURITY.md](SECURITY.md) for security reporting. New repositories can use the [OpenBoa starter guide](docs/starter.md).
