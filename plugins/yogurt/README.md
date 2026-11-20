# Yogurt plugin

Choose an immutable Git revision of this repository for the Codex marketplace. Install the Yogurt plugin from that revision. The repository's marketplace lives under `.agents/plugins`. Retain that revision and the SDK pin as a working pair before upgrading. The [compatibility list](compatibility.json) records the SDK versions and pattern catalog formats exercised with this plugin.

```sh
codex plugin marketplace add openboa-ai/yogurt --ref <plugin-commit>
codex plugin add yogurt@openboa-yogurt
```

Use a commit that contains the marketplace and plugin. For a local candidate, point the marketplace at the candidate checkout.

Give a skill the root of the adopting project and its target. For an npm web app, install the locked SDK and provide `yogurt.config.json`. Resolving the context checks the project and installed npm locks and uses Node's actual import resolution. For a Native-only app, declare the SDK root and version in `nativeSdk` in that same config. Set its revision to the full Git commit of a clean checkout. For an extracted archive, use `sha256:<archive-digest>` and declare the relative archive path. The resolver verifies the archive and the guidance inputs before returning the installed paths.

Use `yogurt-ui` for a design decision, `yogurt-build` for implementation, `yogurt-review` for observed results and `yogurt-feedback` for triage or filing. Codex displays them under the `yogurt:` plugin namespace. Each entry resolves the project's own kit. Keep separately pinned consumers in separate project roots.

For an installed-resource diagnostic, run `node <plugin-root>/bin/resolve-sdk.mjs <project-root> <web|native> --inspect`. It reports the validated version and revision, available guidance paths, missing paths and compatibility status. Use `web` to inspect files from an npm pin. Use `native` to inspect a declared Native installation. Runtime behavior needs evidence from the rendered application.

Look up selected patterns and components together from the consumer root.

```sh
node <plugin-root>/bin/resolve-sdk.mjs . web --lookup pattern.review-decision pattern.track-request
```

The result includes the pinned version, state checks, public imports and exact declaration files. Small declaration modules are included once. A null declaration body points to a file you can read when you need its props. For a Native pin, change `web` to `native` to get the installed templates and their copy commands.

Run the resolver with `--agent-guide` in place of `--lookup` to print the pinned instruction index. Add that section to the project's own `AGENTS.md` to make rules, patterns and common bindings available during ordinary UI work. Run it again after changing the SDK pin. The command prints the section for review and does not edit repository files.

## Issue routing

The product may set the `product` and `sdk` keys under `issueRouting` in `yogurt.config.json`. Each value is an `owner/repository` on GitHub.com. An unbound workflow provides a draft.

To delegate filing, the operator of the reporting host creates `~/.config/openboa/yogurt/issue-delegations.json` in a directory private to their OS account. The file is private to the same account. Set up one authoritative reporting host per route. Each entry in the `delegations` array supplies the absolute canonical `project` root, `repository` name, numeric `repositoryId`, GitHub `actor` login and `operation` equal to `create_issue`. Keep this policy and its ledger outside consumer checkouts. Use an account whose credentials and host policy are protected by the host. The broker uses the authenticated GitHub CLI and verifies the actor and repository before writing.

The project config selects a route. The host policy grants authority. Use the same host ledger for workers that can create issues for that route. A lost result remains pending until the original issue can be reconciled. The reporting return value provides the draft, a confirmed issue link, or the pending status. [Issue inputs](skills/yogurt-feedback/references/issue-report.md)
