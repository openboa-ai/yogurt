# Four controls in one saved view

The owner selected the 8 px shape and approved extending this review. The [component library record](../component-library/spec.md) pins the four reviewed source digests. The comparison below preserves the original trial.

Design review · revision 2. Button proportions come first. Compare 6, 8 and 10 px corners at the same size, then use the chosen shape in the saved view. Eight is the starting proposal. A person opens a saved Sourdough view, edits its name and decides whether to show record dates. The on-screen list makes the difference between an unsaved edit and an immediate preference visible. Sourdough is an illustrative fixture here. The review opens with “Weekly notes” saved and “Weekly review” in the editor. [Open the working study](../../../../examples/basic-controls/index.html)

| Component | What the person can do | Design records |
| --- | --- | --- |
| Button | Save the name once, see the result, and retry a failed save. | [Intent](button/intent.md) · [Spec](button/spec.md) |
| Icon button | Clear the draft in one movement and continue typing at the same place. | [Intent](icon-button/intent.md) · [Spec](icon-button/spec.md) |
| Text field | Know what is being edited and correct it without losing the draft. | [Intent](text-field/intent.md) · [Spec](text-field/spec.md) |
| Switch | Change the date display now and see which records it affects. | [Intent](switch/intent.md) · [Spec](switch/spec.md) |

The records refine [I08](../../../intents/controls/I08-act-and-enter-values/spec.md), [U08A](../U08A-activate-an-action/spec.md) and [U08B](../U08B-edit-labeled-values/spec.md). The system owner reviews the four controls together. Each spec identifies the observer, a failure that would reject the design and the next renderer-specific proof.

## What the four share

- **Identity.** Use Rethink Sans throughout. Put OpenBoa’s original ink blue, `slate.750` (#175174), on the principal action, focus and the active switch on paper. Use `slate.200` on ink with `slate.950` lettering on the active fill. The company mark keeps its own master color. The loaf identifies Sourdough. Ordinary controls keep their edges quiet.
- **Type.** One family. A primary action uses Rethink Sans 14/20 at 500. A section title uses 20/28 at 525, a row or field uses 14/20, supporting text uses 13/18 and metadata uses 12/16. Editable touch text uses 16/24.
- **Proportion.** Button and field align on a 36 px desktop height. The label gets 12 px at each end. The corner trial changes only radius. An 8 px corner leaves 20 px of straight edge on a 36 px high action. Touch actions and the field have at least 44 px of effective height.
- **Grouping.** Use one reading edge. Join companion actions with an 8 px gap, leave 4 px from a label to its own supporting text, and 16–24 px between tasks. Related rows sit together on a single surface. Sight lines, aligned text and whitespace separate the work. Reserve the visible outline for keyboard focus, invalid input or user-requested high contrast.
- **Movement.** A press moves the label 1 px over 80 ms. The switch follows the last input over 160 ms with a single ease-out. Reduced motion shows the final state immediately. Motion timings are Yogurt design proposals.

## Proposed token bindings

The names below describe the contract a renderer must expose. Every color resolves to an existing numbered primitive. Paper and ink are the two appearances of the same control.

| Role | Paper | Ink |
| --- | --- | --- |
| Brand primary | `slate.750` | `slate.750` |
| Surface / adjacent saved view | `neutral.0` / `gray-green.50` | `neutral.950` / `neutral.900` |
| Text / secondary text | `gray-green.950` / `gray-green.700` | `neutral.50` / `neutral.300` |
| Primary action and switch on / foreground | `slate.750` / `gray-green.50` | `slate.200` / `slate.950` |
| Primary hover / press | `slate.800` / `slate.900` | `slate.100` / `slate.300` |
| Focus / field fill | `slate.750` / `neutral.100` | `slate.200` / `neutral.850` |
| Switch off / thumb | `neutral.600` / `neutral.0` | `neutral.500` / `neutral.975` |
| Inactive action surface | `neutral.100` | `neutral.800` |
| Validation text and outline | `coral.700` | `coral.200` |

The saved view title, its row text and the actual timestamp provide working examples of the type hierarchy above. Check ordinary text at 4.5:1 or higher. An essential control edge, focus indicator or thumb needs at least 3:1 against its adjacent surface. These color and type roles are specified here for later package implementation. [Numbered primitives](../../../../design/tokens/brand.json)

## A product can take one control

The proposed web interface lets a team choose one item such as `@yogurt/text-field` from a version-bound shadcn-compatible registry. A `registry:ui` item places a small, editable entry under the project’s component alias. That entry imports one public primitive from the same pinned Yogurt release. The local file owns composition, labels and callbacks. Yogurt owns the primitive, typography, tokens and interaction contract. Each of the four specs gives its proposed item and inputs. These names are design examples for the future registry. [Registry item format](https://ui.shadcn.com/docs/registry/registry-item-json) · [Yogurt recipe contract](../../adoption/U19C-distribute-pattern-recipes/spec.md)

For the eventual web acceptance, add just the field in clean Vite and Next.js fixtures at the same release, render the visible label, and inspect both the generated files and built CSS. A customized wrapper must survive a later update. An unpinned or missing primitive must surface a diagnostic. For Vercel Native SDK the consumer selects the same component contract and uses a target-native adapter. A compiled native control must demonstrate the same name, effect and recovery on the named OS. The web recipe is specific to the web renderer. Each product owns its data, commands and release. [Native stack](../../../native-stack.md) · [Web qualification](../../renderers/U15B-export-web-controls/spec.md)

## Review at actual size

1. Look at the idle screen at 390 px and on a desktop. Find the editable value, its action and the saved result without consulting a legend. Judge the curve at the end of the action, the clear icon’s weight, and how much air separates naming from the date preference.
2. Clear the field, try to save it, enter a valid name and save twice quickly. The field recovers focus, the name appears once in the saved view, and the adjacent controls stay still. Type a second name during saving. The second draft must survive the first response.
3. Toggle dates rapidly and watch the thumb reverse from its current position. Keep the record titles and current name together. Repeat with keyboard, reduced motion and the dark palette. Use the [failed-save fixture](../../../../examples/basic-controls/index.html?save=fails-once) to inspect retry in place.

Reviewing these proportions is the next decision. An accepted revision will name the initial implementation slice and renderer. The full family inventory and later joins remain in the [component inventory](../../../components.md).

## Observed in the design study

At 320, 390, 736 and 1280 CSS px the study retained its reading order, including a long view name and 200% text. The desktop action measured 36 px high with 14 px type at 500 and 12 px insets, and all three corners produced the same button width. The touch fixture measured 44 px. The primary label contrast was 7.99:1 on paper and 9.41:1 on ink. A double activation produced one simulated save. The draft survived rejection and an edit made during an earlier save. The switch reversed mid-transition and reached the latest value with or without motion. [Watch the rehearsal](../../../../examples/basic-controls/rehearsal.webm)

The first visual decision remains the button corner. Consumer installation and Vercel Native SDK qualification follow acceptance of the relevant spec.
