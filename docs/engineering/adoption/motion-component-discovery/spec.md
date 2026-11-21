# Discover reusable motion components

Status: reviewed implementation scope under the owner-selected motion-led component foundation replacement. This adoption slice exposes existing Web components for discovery; it does not replace the component library, establish Native parity, approve visual quality or publish a release.

## Intent and ownership

People and agents need to find the actual reusable implementations behind interactive examples, understand their purpose and import the installed version. Maintain one installed catalog as the source for IDs, names, usage and renderer availability. Derive the guide, lookup and distribution entries from that catalog instead of independently maintaining lists. Preserve existing public components, task-pattern IDs, blocks, paths, callbacks and styles. The host owns data, effects and product decisions. A demonstration or installed entry does not authorize a service action.

This slice covers exactly the existing named Web exports of `@openboa/yogurt/motion-patterns` listed below. It does not claim that other gallery examples are reusable components, convert those examples, or add unimplemented Native components. Names and public import paths remain compatible.

| ID | Named Web export |
| --- | --- |
| `motion-mention-picker` | `MentionPicker` |
| `motion-file-drop` | `FileDrop` |
| `motion-focus-picker` | `FocusPicker` |
| `motion-plan-switch` | `PlanSwitch` |
| `motion-letter-limit` | `LetterLimit` |
| `motion-morph-tooltip` | `MorphTooltip` |
| `motion-spring-dropdown` | `SpringDropdown` |
| `motion-command-button` | `CommandButton` |
| `motion-morph-tooltip-bar` | `MorphTooltipBar` |
| `motion-storage-meter` | `StorageMeter` |
| `motion-activity-island` | `ActivityIsland` |
| `motion-loading-success-button` | `LoadingSuccessButton` |
| `motion-copy-button` | `CopyButton` |
| `motion-streaming-reply` | `StreamingReply` |
| `motion-ghost-suggestion` | `GhostSuggestion` |
| `motion-prompt-box` | `PromptBox` |
| `motion-thinking-indicator` | `ThinkingIndicator` |
| `motion-expand-card` | `ExpandCard` |
| `motion-fan-cards` | `FanCards` |
| `motion-stat-card` | `StatCard` |
| `motion-profile-card` | `ProfileCard` |
| `motion-range-slider` | `RangeSlider` |
| `motion-password-strength` | `PasswordStrength` |
| `motion-checkbox-list` | `CheckboxList` |
| `motion-detent-dial` | `DetentDial` |
| `motion-hold-button` | `HoldButton` |
| `motion-slide-confirm` | `SlideConfirm` |
| `motion-task-list` | `TaskList` |
| `motion-cart-button` | `CartButton` |

## Catalog and contracts

Add `catalog/motion-components.json` to the installed package as the single metadata source. Each record has the stable ID above; the exact named export; `@openboa/yogurt/motion-patterns` as the Web public entry; a short purpose, unsuitable use and checks derived from the actual component contract; and separate Web and Native availability. Web availability means the named export and types are present in the package, not that every host or visual state is qualified. Native is explicitly unavailable for these entries until an actual Native implementation and evidence exist. Do not infer Native support from Web presence or generated Zig tokens.

Validate uniqueness within this catalog and across component, block and task-pattern IDs; do not silently choose one when IDs conflict. Fail on missing export names, wrong entry, unknown renderer values or invalid metadata. Prevent unsafe file paths and untrusted catalog values from producing executable imports or writing outside the consumer project. Keep the published third-party notices generated for shipped code.

The plugin resolver accepts an explicitly requested motion ID in addition to existing component and task IDs. Resolve the actual installed, pinned SDK, verify the declared Web entry and corresponding installed declarations, and return the exact usable named import and available guidance. Resolve only requested IDs; do not read all declaration text into every request. A Native lookup of a Web-only ID reports it unavailable without returning a template or fabricating parity. Unknown IDs and invalid catalogs fail clearly; existing lookup response fields and prior task/component behavior remain compatible. The skills use this same lookup and retain the host's authority boundary.

For an older compatible SDK without the new catalog, existing component/task resolution continues. An explicit new motion ID is reported unavailable for that installed version. For Native archive installs, check presence and contents of this catalog against the pinned archive before trusting it: reject a changed, missing or extra extracted catalog where it differs from the archive. A missing catalog in both the older archive and its extraction is a supported legacy case. Maintain the established immutable pin and compatibility checks; do not substitute a moving path or an unverified local copy.

## Distribution and guide

Extend the existing registry generator and `yogurt list/add` from the same catalog. Generate a Web registry entry per ID that re-exports the named component from its actual shared Web entry. This is an editable import wrapper, not an independently editable copy of the component implementation. Existing modified destinations are never overwritten. A Native add for these IDs returns a clear unsupported result before writing files; do not emit a blank template or modify existing component/block entries. Preserve the installed-package requirement and existing file/notice distribution.

The motion guide and installed usage guide expose the actual name, import, purpose and renderer availability for these 29 entries using the same metadata. Examples which already use a basic public component should continue to point to that component. Gallery-only interactions remain explicitly separate until they have an independently reviewed public contract. Do not reclassify all demonstrations as shipped components or change their visuals as part of discovery.

## Acceptance evidence

1. Build and pack the candidate. Verify the packed catalog contains the exact 29 IDs and named exports above, no collisions or fabricated Native support, and retained third-party notices. Check generated registry entries and declarations against the real built public entry.
2. Install the archive into clean Vite and Next.js consumers. Resolve representative simple and composed IDs, compile their exact returned imports and types, render them using the packaged stylesheet, and exercise at least one normal, interruption and reduced-motion interaction where applicable. Report each observed host separately; a successful import does not establish all 29 components' visual quality.
3. Exercise CLI list and Web add and inspect the generated registry wrapper against the pinned SDK. Verify that an edited destination survives a repeat add, the Native request writes nothing, invalid names fail without partial writes, and existing component/block installs remain unchanged.
4. Exercise the agent resolver against an installed package: exact requested imports and relevant guidance, duplicate/collision rejection, unknown ID, Web-only Native refusal, missing declarations and absent catalog in an older compatible package. Verify archive content mismatches fail closed, including an extra catalog in an old extraction. Validate affected skills and distinguish deterministic checks from any model-driven evaluation.
5. Inspect guide discovery for a component from this catalog, an ordinary component and a gallery-only example. Confirm displayed availability and import statements come from the installed source and do not promise Native or complete qualification. Preview the guide before merge; record actual test and visual evidence independently.
