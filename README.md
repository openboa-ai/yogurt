<img src="design/assets/projects/yogurt.svg" alt="Yogurt project mark" width="96">

<!-- starter:project -->
# yogurt

ships with live cultures
<!-- /starter:project -->

Yogurt is OpenBoa’s design system and UI SDK, with shared design tokens, artwork, product language, and components for web and native apps.

[Browse the design system](https://yogurt.openboa.ai/)

## Getting started

- **Design a screen** with the [consumer guide](DESIGN.md), [component gallery](https://yogurt.openboa.ai/components) and [product playbook](https://yogurt.openboa.ai/playbook).
- **Find where a shared fix belongs** in the [design system rules and source map](docs/design-system-rules.md#why-yogurt-exists).
- **Build a product** with the [SDK and Codex skills](#use-yogurt-in-your-app).
- **Make something on brand** with the [identity guide](https://yogurt.openboa.ai/), [design tokens](https://yogurt.openboa.ai/system) and [artwork and emoji](https://github.com/openboa-ai/yogurt/blob/main/design/assets/README.md).

## Use Yogurt in your app

In the app's root README, document the SDK source and pin, installation for the targets the app supports, and the matching Codex plugin pin and commands. Keep the README current when either pin changes. [Copy a README example](docs/using-yogurt.md#document-yogurt-in-your-project-readme)

### Install the SDK

For Vite and Next.js, install a reviewed Git commit with built package files and keep the dependency lock in the app repository.

```sh
npm install "git+https://github.com/openboa-ai/yogurt.git#<reviewed-sdk-commit>"
npx --no-install yogurt list
```

For a Zig-only Native app, place the [reviewed SDK archive](docs/using-yogurt.md#install-the-local-sdk) at `vendor/yogurt.tgz`. Unpack it and record its SHA-256 in the app's Yogurt configuration. The app pins its Native framework separately. [Native configuration](docs/using-yogurt.md#zig-and-vercel-native-sdk)

```sh
mkdir -p vendor/yogurt
tar -xzf vendor/yogurt.tgz --strip-components=1 -C vendor/yogurt
shasum -a 256 vendor/yogurt.tgz
node vendor/yogurt/bin/yogurt.mjs list
```

### Install the Codex skills

Use the marketplace commit reviewed with the app's SDK pin. The plugin installs the Yogurt skills for design, implementation, review and feedback. [Plugin setup](docs/using-yogurt.md#set-up-an-agent)

```sh
codex plugin marketplace add openboa-ai/yogurt --ref "<reviewed-plugin-commit>"
codex plugin add yogurt@openboa-yogurt
```

Ask `yogurt-build` to implement a screen by describing the task and target. Follow the [first-screen guide](docs/using-yogurt.md#first-screen) to configure and verify the app.

## Repository structure

| Area | Responsibility |
| --- | --- |
| [Design sources](https://github.com/openboa-ai/yogurt/blob/main/design/README.md) | Artwork, fonts, tokens and product language |
| [Catalog](https://github.com/openboa-ai/yogurt/blob/main/catalog/README.md) | Shared component and pattern IDs, contracts and target bindings |
| [Packages](https://github.com/openboa-ai/yogurt/blob/main/packages/README.md) | React, Native and editable composition recipes |
| [Web guide](https://github.com/openboa-ai/yogurt/blob/main/apps/guide/README.md) | Authored pages, interactive examples and generated galleries |
| `apps/native-guide` | Local macOS component browser for development and inspection |
| [Plugins](https://github.com/openboa-ai/yogurt/blob/main/plugins/README.md) | Installable agent workflows |
| [Examples](https://github.com/openboa-ai/yogurt/blob/main/examples/README.md) | Complete screens and integration cases |
| [Checks](https://github.com/openboa-ai/yogurt/blob/main/checks/README.md) | Runtime verification and [agent evaluations](https://github.com/openboa-ai/yogurt/blob/main/checks/evals/README.md) |
| [Maintainer scripts](https://github.com/openboa-ai/yogurt/blob/main/scripts/README.md) | Build, export and installed lookup entry points |

The [repository map](https://github.com/openboa-ai/yogurt/blob/main/docs/repository.md#keep-one-owner-for-each-source) explains where to make a change and what each source generates. The [design records](https://github.com/openboa-ai/yogurt/blob/main/docs/README.md) connect intents, decisions and verification.

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

To inspect the Native components in a macOS app, install the pinned Native SDK and Zig versions, then run:

```sh
node apps/native-guide/scripts/run.mjs
```

See the [Native setup](docs/using-yogurt.md#zig-and-vercel-native-sdk) for prerequisites and current coverage.

Use the [verification guide](https://github.com/openboa-ai/yogurt/blob/main/checks/README.md) to test an installed SDK in an independent project. The generated component galleries can also be opened directly from `apps/guide/generated/`.

## Contributing

Follow [CONTRIBUTING.md](https://github.com/openboa-ai/yogurt/blob/main/CONTRIBUTING.md) for the change and PR process, [AGENTS.md](https://github.com/openboa-ai/yogurt/blob/main/AGENTS.md) for repository instructions, and [SECURITY.md](https://github.com/openboa-ai/yogurt/blob/main/SECURITY.md) for security reporting. New repositories can use the [OpenBoa starter guide](https://github.com/openboa-ai/yogurt/blob/main/docs/starter.md).
