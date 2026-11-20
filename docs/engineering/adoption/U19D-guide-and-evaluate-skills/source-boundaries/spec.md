# Separate guide source from SDK and maintainer tooling

Follow the accepted [repository transition](../repository-transition.md) on merged base `78000ef`. A contributor should be able to find the editable source and verification command for each major area from the repository README.

## Ownership

- The guide owns browser-only scripts, its playbook data output and its page generators. Move those implementations into `apps/guide/`. Keep the repository's HTML entry pages and generated handbook at their current URLs. Existing Node generator commands forward to the new implementation. The standalone pages load classic scripts offline.
- The SDK owns public exports, Native copy paths, registry items, the installed catalog, and `bin/yogurt.mjs`. Keep those package paths and catalog IDs stable. The installed pattern lookup stays at its existing entry point.
- The agent plugin owns its workflows and pins the SDK through the adopting project. Evaluations and release evidence have separate entry points. Product examples and studies exercise these contracts from outside the renderer.
- Put entry READMEs at major source boundaries. Put detailed dependency and generated-file ownership in the [repository map](../../../../repository.md).

## Acceptance

- Follow the new README routes and regenerate the guide data and handbook using the documented commands.
- Open the existing guide pages directly from disk. Observe the system page interaction, playbook state, emoji search, and the interactive asset library without network requests.
- Compare packed SDKs from the base and candidate. The root README may change. Existing runtime files, IDs, and plugin paths stay byte-identical. Run the installed guidance check on the candidate.

## Web implementation and maintainer tooling

Group Web source by responsibility under `packages/web/src/`. Foundation owns the layout and language primitives. Controls own individual interactions and data displays. Patterns own compositions for a product task. Identity owns the marks, avatars and motion data. The generated root and individual entries remain the public import layer. Resolve catalog module names against the source layout during the build. Keep the catalog's module IDs and SDK export map stable.

Group repository build tooling by its outputs. SDK tooling builds the public distribution, brand tooling exports shared artwork and CSS, and agent tooling generates identity and motion data. Keep existing documented commands at their entry points. Keep generated artifacts, renderer sources, guide examples and evaluation fixtures independently discoverable.

Keep interactive catalog examples in `apps/guide/examples/` and build-only dependencies and generators in `apps/guide/tooling/`. The guide views consume the SDK's public package exports. The guide's private dependency scope applies only to its tools.

Regenerate Web JavaScript and declarations from the new source hierarchy. Remove stale declarations after a successful build and preserve public export names, types and installed paths. JavaScript chunks and internal declaration paths may be regenerated. Check the exports for all catalog components, compare generated registries and assets, and run the Web and installed-guidance checks. The earlier guide-only phase retains its byte-for-byte package check.

## Hosted guide

Serve the existing guide entry pages as a static site from the `openboa` Vercel team. The guide build copies its public pages, assets, runtime scripts and guide documents into `site/`. Vercel serves that directory using the repository's Other framework configuration. Link the `openboa-ai/yogurt` repository and assign `yogurt.openboa.ai` to the new Yogurt project. Use the team's normal authentication and domain checks.

Run the static build on the reviewed revision. Check navigation and assets at the generated root and verify the deployed homepage, component catalog and interactive routes on the intended hostname before recording live delivery.
