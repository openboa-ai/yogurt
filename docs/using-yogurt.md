# Use Yogurt in a product

Find the control by what the person wants to do. Its stable catalog ID identifies the supported public entry for the project's SDK pin and target. The product supplies data, navigation and effects. [Design a screen](../DESIGN.md) · [Component catalog](../catalog/components.json) · [Component gallery](../apps/guide/generated/components.html)

## First screen

1. Obtain the [reviewed SDK archive](#install-the-local-sdk) and follow the setup for [Vite or Next.js](#web). Commit the project configuration and the dependency lock.
2. If an agent will build the screen, [set up the Yogurt plugin](#set-up-an-agent) in the consuming project.
3. Give the agent a task, target and intended result. For example, “Build a desktop screen to find records by name or ID, open a detail, and return with the same search and selection. Make an unmatched search recoverable.”
4. Choose a [task pattern](../DESIGN.md#find-the-task) and a [worked composition](screen-composition.md#worked-compositions). Resolve the public SDK entries for the pinned target and connect the app’s actual data and actions.
5. Run the [consumer checks](#check-a-consuming-project). Open the app, complete the task, exercise its recovery case and check where focus returns.

## Document Yogurt in your project README

Every app that adopts Yogurt must have a `UI development with Yogurt` section in its root `README.md`. Include the supported targets, the exact SDK and plugin pins, where the SDK comes from, and the commands a teammate runs from a fresh checkout. Link to the app's `yogurt.config.json` and include the command for checking its installed SDK. Update the README with changes to either pin or the installation path.

Copy the example below and replace the placeholders with the app's actual pins and paths. Adapt the SDK commands to the app's package manager and keep the steps for each supported target.

````markdown
## UI development with Yogurt

This app uses Yogurt's shared components, tokens and composition rules. Its [Yogurt configuration](yogurt.config.json) declares the UI surfaces.

### Install the UI SDK

For Web, the dependency lock pins `@openboa/yogurt` to `<reviewed-sdk-commit-or-archive>`.

```sh
npm ci
npx --no-install yogurt check
```

### Install the Codex skills

```sh
codex plugin marketplace add openboa-ai/yogurt --ref "<reviewed-plugin-commit>"
codex plugin add yogurt@openboa-yogurt
```

Ask `yogurt-build` to implement a screen by stating what someone needs to do and which app surface it belongs to.
````

For a Web SDK backed by a local archive, include how to obtain that exact archive before running the app's dependency install.

## Install the local SDK

Run `npm ci && npm run build && npm pack` at the Yogurt root to produce the archive for the version in `package.json`. Install that file in a consuming project using its relative path. In text-only repositories, add `vendor/*.tgz` to `.gitignore` instead of committing the binary archive and document the exact `npm pack` step in the project's `README.md`. The package has React and React DOM 19.2 peers and includes the pinned UI SDK core and React adapter.

```sh
npm install ./vendor/openboa-yogurt-0.2.0-local.1.tgz
npx yogurt list
npx yogurt add button --target web
```

For a Web app with its presentation in `src`, add this to `yogurt.config.json`.

```json
{"surfaces":{"app":{"target":"web","root":"src"}}}
```

Read `node_modules/@openboa/yogurt/DESIGN.md` and run `node node_modules/@openboa/yogurt/scripts/describe-pattern.mjs --list` to discover stable pattern IDs in a Node consumer.

## Set up an agent

Use the marketplace revision that was reviewed with the project’s SDK pin. From the consumer root, install the plugin in Codex.

```sh
codex plugin marketplace add openboa-ai/yogurt --ref "<reviewed-plugin-commit>"
codex plugin add yogurt@openboa-yogurt
```

Use a commit that contains the marketplace and plugin. For an unreleased local candidate, use the candidate checkout path in place of the repository name and omit `--ref`. Run the installed plugin’s `bin/resolve-sdk.mjs` from the consumer root, passing `.` and `web`. Its `--inspect` option validates the declared SDK pin and reports missing files. Use the path of the plugin Codex installed, which is separate from the SDK package.

On a compatible install, `--agent-guide` prints a short section you can add to the consumer’s `AGENTS.md`. Regenerate it when the pin changes. A screen request can start directly with `yogurt-build`. Ask for `yogurt-ui` to make a design decision, `yogurt-review` to verify an existing screen, or `yogurt-feedback` to route a reproduced issue.

## Web

Load the stylesheet once at the app entry and scope the UI with `Yogurt`. For Vite import it in `src/main.tsx`. For the Next.js App Router import it in `app/layout.tsx` and put providers and interactive views behind a client boundary. In the Pages Router import it in `pages/_app.tsx`. Use individual entry points or the locally installed wrapper under `src/components/ui`. Fonts travel with the package. The host chooses an appearance or follows the OS with `auto`.

```tsx
import "@openboa/yogurt/styles.css";
import { Yogurt } from "@openboa/yogurt/yogurt";
import { Button } from "@openboa/yogurt/button";

export function SaveView({ onSave }: { onSave: () => void }) {
  return (
    <Yogurt appearance="auto" material="neutral">
      <Button onClick={onSave}>Save view</Button>
    </Yogurt>
  );
}
```

For shadcn CLI, supply the local file `registry/button.json` to `shadcn add` after installing the pinned package. The resulting editable entry imports the same library component. `npx yogurt add` is the dependency-light alternative and refuses to replace edited files. Install and pin a new version through the consuming project’s own review.

Reusable Web motion components are listed in the installed `catalog/motion-components.json` and demonstrated in the motion guide. For example, resolve `motion-task-list` or install its import wrapper with `npx yogurt add motion-task-list --target web`, then import `TaskList` from `@openboa/yogurt/motion-task-list`. Their registry files are editable import wrappers; the implementation stays in the pinned package.

### Control sizes and action shapes

Web `Button`, `TextField` and `SearchField` accept the same size names: `compact`, `regular`, `comfortable`, `spacious` and `touch`, corresponding to 28, 32, 36, 44 and 44 px. Use `controlSize` for the same visual choices on `Select`; its native `size` attribute retains its HTML meaning. Regular is the default. Choose the size for the context and provide at least a 44 px target for touch. Buttons support `shape="rounded"` and `shape="pill"`; filled, soft and quiet describe emphasis rather than size. The component guide demonstrates each option.

Resolve `motion-copy-button`, `motion-cart-button`, `motion-hold-button`, `motion-slide-confirm` and `motion-loading-success-button` for the reusable Web versions. Their registry entries install import wrappers.

Web cards accept `density="compact"`, `"regular"` or `"spacious"`. The insets are 12, 16 and 20 px, with a shared 16 px corner. Choose the inset for the content and surrounding space; a density does not change the card's purpose or action.

An `AgentAvatar` uses the host’s `ready`, `thinking`, `working`, `waiting`, `blocked` or `done` state. Pass the state to roster and conversation components through `AgentSummary`. Keep a readable status label next to active work, and use `animated={false}` for archived portraits outside the Message component. Message keeps its portraits still by default. AgentAvatar follows the system motion preference and uses a still version of the current expression when motion is reduced. [Motion and component behavior](motion.md)

## Brand, words and tokens

| Need | Canonical source | Consumer entry |
| --- | --- | --- |
| Company signature, project marks, agent identity, English tone | [Brand rules](../catalog/brand.json) and the [identity guide](../DESIGN.md#carry-the-identity-into-a-screen) | `@openboa/yogurt/brand` |
| Approved product language and repository descriptions | [Terms](../design/content/terms.json) | `@openboa/yogurt/terms`, React `words` |
| Numbered colors, one type family, size and spacing primitives | [Brand tokens](../design/tokens/brand.json) | `@openboa/yogurt/palette` |
| Paired light/dark surface and action roles, dimensions and motion | [UI bindings](../design/tokens/ui.json) | `@openboa/yogurt/tokens`, generated CSS |
| Names, purpose and recipes | [Component inventory](../catalog/components.json) and [task patterns](../catalog/patterns.json) | Single-component import or local source installation |

Keep all colors on the same numbered palette. Neutral is the approved default. Paper shifts the surroundings warmer and Mist cooler. All three preserve the primary action role and brand master. Shared dimensions are generated from the UI bindings; use the component's documented roles rather than local copies of measurements. A new role needs a real use and a legible light/dark pair. Add it here and regenerate both targets. [Shared token rules](design-system-rules.md#one-source-for-ui)

The web Button, Checkbox, RadioGroup, Switch, TextField, SearchField, Textarea, SegmentedControl, Tabs, Toggle, ToggleGroup, Dialog, Sheet, Drawer, Popover, Accordion, Progress, SplitTextField and Rating use the UI SDK behavior runtime with Yogurt's own presentation. An application that explicitly connects an agent must resolve its bridge and these controls to the same installed UI SDK core. Yogurt does not start a bridge or grant actions by rendering a component. The host owns access and effects. Other entries continue to use their existing behavior implementations while replacement is in progress. The built package retains third-party notices.

Web ActionMenu uses shared inline popup and button behaviors with a Yogurt keyboard adapter. Web Tooltip uses shared inline popup state with a Yogurt activation adapter. InputOTP uses the SDK’s OTP input with a secret mark and Yogurt’s slot appearance. NumericSpinner uses shared buttons with the existing Yogurt quantity adapter. InputGroup uses shared input behavior for text-like fields and retains a native adapter for specialized input types. Complete shared menu, tooltip and numeric behaviors and specialized input integration remain in progress.

### Connect an agent to web controls

Create a bridge only in the browser, when the host has decided who can receive its results. The action policy is required. This example refuses every action until the host supplies its own policy.

```tsx
import { createYogurtAgent } from "@openboa/yogurt/agent";

const agent = createYogurtAgent({ allow: () => false });
const controls = agent.snapshot();
```

The action policy controls requested changes; it does not filter snapshots or queries. The host must choose what information is exposed and handle any confirmation marks. An action's result does not authorize or confirm a product operation. A successful request (`ok: true`) can contain a refused step (`result: false`); inspect each returned step and the observed host state, including partial results, before reporting an outcome. Importing the entry does not create a bridge or register browser tools.

## Check a consuming project

Follow the [design system rules](design-system-rules.md) for mandatory reuse, project composition and promotion of shared patterns.

Commit a `yogurt.config.json` in the project and run `yogurt check` in its CI. A mixed host can declare `{"surfaces":{"site":{"target":"web","root":"apps/site/src"},"app":{"target":"web","root":"apps/app/src"}},"version":"0.2.0-local.1"}`. The command reads only declared presentation directories, checks for the corresponding adapter, known imports and numbered colors, and reports direct vendor imports, literal color declarations and other typefaces with a source location. It leaves the source untouched. Open the actual target to review copy, hierarchy and density at normal and narrow sizes. Operate the primary action and one recovery path by keyboard and pointer where supported. Record the observed result, including focus return and motion that affects the task.


## Editable blocks

A block is an optional preset for a recurring composition. Install or adapt one when it fits, or assemble a project view from the same tokens and components. The resulting source lives in the consuming project. Its types and component imports come from the installed Yogurt pin.

| Block | Inputs and outcomes |
| --- | --- |
| [Project settings](../registry/project-settings.json) | Bind saved and draft preferences. Saving sends the edited value. Discard restores the saved value. Pending and error come from the project. |
| [Collection browser](../registry/collection-browser.json) | Supply records with stable IDs. Search and include archived locally. Opening a result returns its original ID. |
| [Decision review](../registry/decision-review.json) | Supply facts, source time, revision and availability. Cancellation has no effect. Confirmation returns the reviewed ID and revision. |
| [Conversation panel](../registry/conversation-panel.json) | Bind messages, revision and a draft. Send emits text on explicit submission. A pending reply can expose a stop action. |

```sh
npx yogurt add project-settings --target web
```

Web writes the editable component under `src/components/blocks`. The matching shadcn registry item is `registry/project-settings.json`. The host binds persistence, filtering, permission checks, receipt lookup and sending as appropriate. Reinstalling the same entry preserves your edits.

[Workspace patterns](workspace-patterns.md) adds eight blocks for the agent profile and roster, project home and access, artifact library, attention inbox, operations and run history. Install any of their IDs on either target. The consumer connects its own authorized models, preview media and service actions.

[Compose a project sidebar](sidebar.md) from shared navigation parts.

## Controls with platform-specific presentation

Select uses a real form field. Chrome 157 and macOS WKWebView 27 render its anchored option list with Yogurt’s colors, type and dimensions. Engines without customizable select support use their system picker. Multiple and list-style selects keep platform listbox semantics.

Web Calendar and DatePicker accept local `YYYY-MM-DD` values, including optional minimum and maximum.

The keypad emits individual actions. Private mode inserts random spacers on opening. A host owns masking, credential handling, confirmation and clearing.

[Verification](engineering/controls/component-library/verification.md)


## Agent variants

Choose a stable variant ID and an optional shared color token. The default fill comes from the original silhouette. Use the app's agent name as the accessible label when available. The behavior works through the same avatar component as Kai and Sol. Use `getAgentFamily()` from the same entry point to list registered variants and color tokens.

```tsx
import { AgentAvatar } from "@openboa/yogurt/agent-avatar";

<AgentAvatar agent="round-star-right" state="thinking" size={24} color="blue.300" />
```

[Agent family gallery](../apps/guide/generated/agents.html) · [Motion](motion.md#agent-family)

## Agent name data

The SDK provides 1,170 short names. Each row has a `name`, fitted `variant` and palette `color`. Use a row as a suggested pairing or combine its name with an appearance chosen by the app. The app owns selection and uniqueness.

```js
import identities from "@openboa/yogurt/agent-names" with { type: "json" };
```



```zig
const identities = @import("yogurt/agent-names.zig").identities;
```
