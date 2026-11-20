# Yogurt repository transition

Use the stable intent and change IDs in the design portfolio to connect ownership, requirements and observed evidence. The product owns its task and release decision. Yogurt owns the common presentation contract and what its pinned distribution supplies. [Intent](intent.md) · [Specification](spec.md)

## Source and distribution map

| Responsibility | Current source | Distribution and decision |
| --- | --- | --- |
| Brand, tokens and voice | `assets/`, `tokens/`, `content/terms.json`, `DESIGN.md` and the design rules | Keep assets and rules at their current public paths. The guide and installed kit read the same revision. Preserve original artwork and notices. |
| Pattern and component IDs | `catalog/patterns.json`, `catalog/components.json`, `catalog/blocks.json` and `scripts/describe-pattern.mjs` | Include the pattern catalog and lookup in the installed SDK. Keep authored pattern advice distinct from exported component support. A supported component is resolved from the installed component manifest and entry files. A guide or pattern contract records what is described. |
| Renderer sources | `packages/web/`, `packages/native/`, `blocks/` and source styles | Preserve web imports and the Native copy/install layout. Next.js and Vite use the same React adapter. The Native host owns the Zig state and effects. |
| Generated and packaged output | `dist/`, registry entries, generated galleries and the files in the SDK tarball | Keep build output at the public package paths. List generation inputs and build command beside the existing maintainer instructions. Verify output from the actual pack, then verify again through the pinned Git transport. |
| Human guide and samples | `apps/guide/`, `docs/` and `examples/` | Keep published navigation stable. Mark evidence by revision and renderer. Package the guide entry and rule references needed by consumers. Keep original examples with the guide. |
| Agent workflow | `plugins/yogurt/` and `.agents/plugins/` | Distribute the four consumer skills through an independently pinned plugin with a compatible installed SDK. Keep `skills/yogurt-ui/` as a forwarding page for earlier guide links. |
| Qualification and ownership | `checks/`, `evals/`, `.agents/skills/yogurt-evaluate/` and the owning [case catalog](evalset.json) | Keep runner and fixture logic with the Yogurt maintainer workflow. Keep run artifacts private and record reviewable summaries by candidate. |

The existing local tarball and Git pilot pin `95a3028012d8b8eb9f0a8f52e0850fe370768fea` both contain `DESIGN.md` and the consumer CLI. Inspection of the installed package in both fixture consumers returned the same version and Git commit. Both omit `catalog/patterns.json`, `scripts/describe-pattern.mjs`, `docs/native-stack.md`, and the existing skill. Both contain the web Button entry and the Native Button template. The source pattern catalog also has support statements from its contract stage alongside SDK bindings. Report installed entries, pattern-level documentation and runtime evidence independently. Presence of a binding alone proves availability of its files.

The existing `0.1.0-local.15` archive has SHA-256 `520b8a60ac18941e816ab46bafbff5f94e2e4ff84688650c9229fef4e3ea36a1`. Reading its published guide and archive member list resolves seven of 17 direct relative file targets. This count checks file presence. Candidate verification also follows anchors used by the guide and runs the installed lookup.

## Installed guidance contract

Retain `node scripts/describe-pattern.mjs --list` and `node scripts/describe-pattern.mjs <pattern-id> [web|native]` within the package. Resolve the catalog against the script's installed location. Preserve the current pattern IDs, JSON output fields, and the existing CLI commands `check`, `list` and `add`. Print an actionable diagnostic and exit nonzero if the file is missing, the format is unsupported, or a requested pattern cannot be resolved. Local invocation uses the selected files without any network request.

Include the pattern catalog, native stack decision and lookup script in the distribution. Check every relative link in the installed `DESIGN.md`. Include missing consumer reference pages or point the consumer entry to an equivalent local installed reference. Maintain a single authored source for each rule. Keep web imports and installed Native paths independent of the agent plugin. Check the result through the pack and a Git installation pinned to its exact commit.

### Package contents and verification

There are two documentation surfaces. Keep `DESIGN.md` as the offline entry included in the SDK. Its required reading covers the brand catalog, design rules, pattern and component catalogs, terms, usage and Native stack. Link to those files by paths relative to the installed guide. Use installed catalog entries for component lookup on each target. Put browsing links for the full research, examples and design portfolio at the source repository entry. Keep the local gallery and experimental assets available to repository readers.

Audit the required documentation by following each relative reference from the installed entry. For every local link in that reading path, check the exact case-sensitive file name and any explicit fragment. Use the package contents as the root and reject paths outside the package. For a source-only reference in a required reading page, move the navigation to the source guide or name its exact source location without making it an installed dependency. Exercise existing examples already included in the package when they form part of the web or Native adoption instructions.

The baseline inventory found 181 reachable source files absent from the archive when recursively following local Markdown, HTML and stylesheet references from `DESIGN.md`. Those files total 7,914,222 uncompressed bytes in the current source. This includes gallery, research and artwork sources. Use a bounded offline reading path with the required references above. Measure the packed bytes of the resulting candidate and retain the inventory diff.

For a target-specific pattern lookup, preserve the existing design support text. Validate declared web subpaths against the installed export map and resolved entry files. Resolve declared Native paths under the installed SDK and verify their files exist. Report file availability separately from the design catalog's support statement and from verified runtime behavior. The current pattern catalog has ten declared Native bindings whose component support text still says `planned`. Neither field alone answers whether a consumer can use that entry. The package test records all three observations when Native runtime evidence is available.

| Acceptance case | Required observation |
| --- | --- |
| Installed-only lookup | From a clean project outside the author checkout, list the installed IDs and resolve the review and record patterns for web and Native. Confirm that each declared installed entry resolves in that package. Record contract-only entries separately. |
| Offline reading path | Follow the required docs from the packed and Git-installed `DESIGN.md`. Relative links and anchors resolve in the SDK. Repeat with the source checkout unavailable. |
| Missing or malformed catalog | Remove the catalog from a disposable copy or substitute an incompatible format version. Lookup fails with the missing path or detected version and no fallback to another install. |
| Unknown ID or target | Invoke the packaged CLI with a nonexistent pattern and with a renderer outside its supported options. Both return usage guidance without partial success. |
| Independent pins | Keep two disposable consumers on the previous baseline, then install the candidate in one. Confirm the second consumer still sees its previous package and that the first can restore its original pin and evidence. |

## Reviewable delivery order

1. **Make installed guidance discoverable.** Implement the installed guidance contract above. Use the same install contract for Git and the package archive.
2. **Run the consumer journeys.** Build independent synthetic fixtures using the current controls and self-contained scenario data. Exercise a full journey first, then the second from a separately pinned consumer. Run the existing consumer check as well as renderer-specific assertions. Verify that switching and rolling back one consumer leaves the other pin and guidance intact.
3. **Distribute and measure skills.** Publish an installable plugin candidate from the compatible SDK revision. Evaluate discovery and output against the baseline with the fixture tree isolated from grader files. Select the scope of each skill from the observed decision and output boundaries. Implement the project-delegated issue path with the validated destination and test it using the simulated tracker.
4. **Consolidate duplicate entry points.** Use the map above and search for existing consumers of each path. Move or remove duplicate sources one area per change, updating the catalog and links together. Preserve the old public entry through a forwarding path if the entry still has an external consumer. Run the installed-package checks and compare the independent pins before accepting the move.

### Skill entry consolidation

Make the plugin the maintained entry for UI design, implementation, review and feedback. The repository guide, guidance intent and generated handbook link to the plugin instructions. Keep a forward link from the previous source skill path for people following an earlier guide. The forward page should direct readers to install the plugin, without presenting a second discoverable skill body.

Freeze the prior skill as an evaluation input from its recorded revision before replacing the active copy. Baseline attempts still receive its original instructions, while consumers that pin an earlier commit keep that commit's original files. Keep the baseline outside the plugin inventory and SDK archive. An incomplete baseline fails fixture preparation and must not silently substitute the current skill.

Verify source links and regenerate the handbook from its Markdown inputs. Compare the packed SDK inventory before and after the skill move and confirm that no installed guide, catalog ID or public import changed. Exercise plugin discovery and the baseline evaluation fixture from separate roots. The standalone plugin and SDK keep their own pins.

### Handbook build ownership

Keep the handbook generator, template and pinned Markdown renderer together in `apps/guide/`. Generate `docs/index.html` from the same Markdown and portfolio inputs and preserve its existing anchors. The older source script forwards to the generator and retains the optional local renderer argument. Install the build dependency from the guide's own lock so a fresh source checkout can regenerate the handbook independently of the runtime SDK and the plugin. Verify both entry points produce identical output with the locked renderer. Verify that the source move keeps the verified SDK archive and plugin snapshot byte-identical.

Keep the common archive-install fixture under `checks/fixtures/`. The installed plugin check, model evaluation and decision replay use it for the same offline install and digest verification. Keep the model sandbox policy and probes under `evals/`. Exercise the installed plugin and replay a retained decision after moving the fixture. A damaged archive fails before the fixture creates an npm lock.

Before opening the source-import PR, reconcile the candidate with the verified default branch and run its diff, naming and hygiene checks. Normalize trailing whitespace reported by those checks in the initial source import. Preserve notice text, font bytes and rendered output. Keep equivalent generated files reproducible and compare the repacked SDK with the verified installation before exercising it again.

For each change, the evidence records the base, candidate, previous SDK and plugin revisions, test entry point, renderer and result. A Git install candidate is ready for product adoption after the recipient can obtain and exercise the pinned revision. Product rollout belongs to each product owner.
