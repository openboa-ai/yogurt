# Use Yogurt in a product

Start at the [component library and brand reference](../apps/guide/generated/components.html). Each entry has one stable name, an English purpose, an interactive web example, an individual React export and an editable Vercel Native markup template. A project owns its data, navigation and effects.

## Install the local SDK

Run `npm ci && npm run build && npm pack` at the Yogurt root to produce the archive for the version in `package.json`. Install that file in a consuming project using its relative path. The package has React and React DOM 19.2 and the pinned UI SDK core and React adapter as web peers. A Zig-only project can extract the tarball and invoke its Node CLI during setup. Its app binary has no JavaScript dependency.

```sh
npm install ./vendor/openboa-yogurt-0.1.0-local.16.tgz
npx yogurt list
npx yogurt add button --target web
```

Read `node_modules/@openboa/yogurt/DESIGN.md` and run `node node_modules/@openboa/yogurt/scripts/describe-pattern.mjs --list` to discover stable pattern IDs in a Node consumer. A Native-only consumer uses the same paths relative to its selected SDK directory.

## Web

Load the stylesheet once at the app entry and scope the UI with `Yogurt`. Use individual entry points or the locally installed wrapper under `src/components/ui`. Fonts travel with the package. The host chooses an appearance or follows the OS with `auto`.

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

Reusable Web motion components are listed in the installed `catalog/motion-components.json` and demonstrated in the motion guide. For example, resolve `motion-task-list` or install its import wrapper with `npx yogurt add motion-task-list --target web`, then import `TaskList` from `@openboa/yogurt/motion-patterns`. These entries currently have no Native implementation. Their registry files are editable import wrappers; the implementation stays in the pinned package.

### Control sizes and action shapes

Web `Button`, `TextField` and `SearchField` accept the same size names: `compact`, `regular`, `comfortable`, `spacious` and `touch`, corresponding to 30, 36, 40, 48 and 44 px. Use `controlSize` for the same visual choices on `Select`; its native `size` attribute retains its HTML meaning. Regular is the default. Choose the size for the context and provide at least a 44 px target for touch. Buttons support `shape="rounded"` and `shape="pill"`; filled, soft and quiet describe emphasis rather than size. The component guide demonstrates each option.

Copy, quantity adjustment, hold confirmation, slide confirmation and loading results have dedicated web controls exported from the package root. They keep their own state and event contracts. Their individual registry entries and corresponding native implementations are not yet available. Generated Zig dimensions do not establish native visual or behavioral parity.

Web cards accept `density="compact"`, `"regular"` or `"spacious"`. The insets are 12, 18 and 24 px, with a shared 24 px corner. Choose the inset for the content and surrounding space; a density does not change the card's purpose or action.

An `AgentAvatar` uses the host’s `ready`, `thinking`, `working`, `waiting`, `blocked` or `done` state. Pass the state to roster and conversation components through `AgentSummary`. Keep a readable status label next to active work, and use `animated={false}` for archived portraits outside the Message component. Message keeps its portraits still by default. AgentAvatar follows the system motion preference and uses a still version of the current expression when motion is reduced. [Motion and component behavior](motion.md)

## Zig and Vercel Native SDK

The same ID installs an editable markup template, a Zig source entry, the shared theme, English words and Rethink Sans. The installer writes under `src/yogurt`. Use the installed template from your Native view.

```sh
npx yogurt add button --target native
npx yogurt add switch --target native
```

```xml
<import src="yogurt/items/button.native"/>
<column gap="8">
  <use template="yg-button" label="Save view"/>
</column>
```

Include `@import("yogurt/button.zig").file` in `UiApp.Options.markup.sources`. The template emits `activate`. The host's typed `Msg` and `update` own the result. The [runnable native example](../examples/native-ui/README.md) registers the font, installs the theme and shows the complete initialization. Collections, receipt IDs and chart observations come from the host. ProjectMark, AgentAvatar and Gaze install the original artwork. Call `art.register(fx, id, .kai_ready)` for a static pose. [Drive the same six presence states in Zig](../packages/native/README.md#agent-presence). The chart template accepts a contiguous series. For missing observations, supply separate contiguous runs and the accessible reading table. [Per-target evidence](engineering/controls/component-library/verification.md)

## Brand, words and tokens

| Need | Canonical source | Consumer entry |
| --- | --- | --- |
| Company signature, project marks, agent identity, English tone | [Brand rules](../catalog/brand.json) and the [identity guide](../DESIGN.md#carry-the-identity-into-a-screen) | `@openboa/yogurt/brand` |
| Approved product language and repository descriptions | [Terms](../design/content/terms.json) | `@openboa/yogurt/terms`, React `words`, Zig `words.zig` |
| Numbered colors, one type family, size and spacing primitives | [Brand tokens](../design/tokens/brand.json) | `@openboa/yogurt/palette` |
| Paired light/dark surface and action roles, dimensions and motion | [UI bindings](../design/tokens/ui.json) | `@openboa/yogurt/tokens`, generated CSS and Zig |
| Names, purpose and recipes | [Component inventory](../catalog/components.json) and [task patterns](../catalog/patterns.json) | Single-component import or local source installation |

Keep all colors on the same numbered palette. Neutral is the approved default. Paper shifts the surroundings warmer and Mist cooler. All three preserve the primary action role and brand master. Shared dimensions are generated from the UI bindings; use the component's documented roles rather than local copies of measurements. A new role needs a real use and a legible light/dark pair. Add it here and regenerate both targets. [Shared token rules](design-system-rules.md#one-source-for-ui)

The web Button, Checkbox, RadioGroup, Switch, TextField, SearchField, Textarea, SegmentedControl, Tabs, Toggle, ToggleGroup, Dialog, Sheet, Drawer, Popover, Accordion, Progress, SplitTextField and Rating use the UI SDK behavior runtime with Yogurt's own presentation. An application that explicitly connects an agent must resolve its bridge and these controls to the same installed UI SDK core. Yogurt does not start a bridge or grant actions by rendering a component. The host owns access and effects. Other entries continue to use their existing behavior implementations while replacement is in progress. The built package retains third-party notices.

Web ActionMenu uses shared inline popup and button behaviors with a Yogurt keyboard adapter. Web Tooltip uses shared inline popup state with a Yogurt activation adapter. Web InputOTP uses shared input behavior with an explicit secret mark and retains the Yogurt numeric and cursor adapter. NumericSpinner uses shared buttons with the existing Yogurt quantity adapter. InputGroup uses shared input behavior for text-like fields and retains a native adapter for specialized input types. Complete shared menu, tooltip, one-time-code and numeric behaviors and specialized input integration remain in progress.

### Connect an agent to web controls

Create a bridge only in the browser, when the host has decided who can receive its results. The action policy is required. This example refuses every action until the host supplies its own policy.

```tsx
import { createYogurtAgent } from "@openboa/yogurt/agent";

const agent = createYogurtAgent({ allow: () => false });
const controls = agent.snapshot();
```

The action policy controls requested changes; it does not filter snapshots or queries. The host must choose what information is exposed and handle any confirmation marks. An action's result does not authorize or confirm a product operation. A successful request (`ok: true`) can contain a refused step (`result: false`); inspect each returned step and the observed host state, including partial results, before reporting an outcome. Importing the entry does not create a bridge or register browser tools. Native agent integration is not supplied by this Web entry.

## Check a consuming project

Follow the [design system rules](design-system-rules.md) for mandatory reuse, project composition and promotion of shared patterns.

Commit a `yogurt.config.json` in the project and run `yogurt check` in its CI. A mixed host can declare `{"surfaces":{"site":{"target":"web","root":"apps/site/src"},"app":{"target":"native","root":"apps/app/src"}},"version":"0.1.0-local.16"}`. The command reads only declared presentation directories, checks for the corresponding adapter, known imports and numbered colors, and reports direct vendor imports, literal color declarations and other typefaces with a source location. It leaves the source untouched. Review copy meaning, interaction and product-specific outcomes in the host fixture.


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
npx yogurt add project-settings --target native
```

Web writes the editable component under `src/components/blocks`. The matching shadcn registry item is `registry/project-settings.json`. Native installs the composition and its shared markup under `src/yogurt/items`. Register `@import("yogurt/project-settings.zig").sources` and use `<use template="yg-project-settings"/>`. The installed markup names each host field and typed message. The host binds persistence, filtering, permission checks, receipt lookup and sending as appropriate. Reinstalling the same entry preserves your edits.

[Workspace patterns](workspace-patterns.md) adds eight blocks for the agent profile and roster, project home and access, artifact library, attention inbox, operations and run history. Install any of their IDs on either target. The consumer connects its own authorized models, preview media and service actions.

[Compose a project sidebar](sidebar.md) from shared navigation parts.

## Controls with platform-specific presentation

Select uses a real form field. Chrome 157 and macOS WKWebView 27 render its anchored option list with Yogurt’s colors, type and dimensions. Engines without customizable select support use their system picker. Multiple and list-style selects keep platform listbox semantics. Native hosts can use `yg-select-picker` with an expanded flag, selected menu items and an explicit dismiss handler.

Web Calendar and DatePicker accept local `YYYY-MM-DD` values, including optional minimum and maximum. Native installs `models/calendar.zig` alongside either entry. Use `Month.init(year, month)`, `offset(delta)` and `days(selected, earliest, latest)` to populate the view. Numeric keys use `YYYYMMDD`. Empty cells have distinct disabled IDs.

The keypad emits individual actions. Private mode inserts random spacers on opening. A host owns masking, credential handling, confirmation and clearing. The native `models/keypad.zig` builds number, alphabet and private layouts and accepts four fresh random words per private session. Its enabled key IDs are character codes. For Gradient, call `gradient-pixels.register(fx, id, dark, material, tone)` once per palette change and bind that image ID. Release the registered image when its host exits.

[Verification](engineering/controls/component-library/verification.md)


## Agent variants

Choose a stable variant ID and an optional shared color token. The default fill comes from the original silhouette. Use the app's agent name as the accessible label when available. The behavior works through the same avatar component as Kai and Sol. Use `getAgentFamily()` from the same entry point to list registered variants and color tokens.

```tsx
import { AgentAvatar } from "@openboa/yogurt/agent-avatar";

<AgentAvatar agent="round-star-right" state="thinking" size={24} color="blue.300" />
```

For the Native canvas, after installing `agent-avatar`, use `Playback.initVariant(.round_star_right, 24, .thinking, now_ms)`. Set `playback.color = .blue_300` to use the same token. Keep the `Playback` instance per avatar, and pass the current host state and reduced-motion preference to its drawing call.

[Agent family gallery](../apps/guide/generated/agents.html) · [Motion](motion.md#agent-family)
