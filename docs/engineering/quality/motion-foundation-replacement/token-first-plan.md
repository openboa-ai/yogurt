# Token-first component and motion redesign

Status: owner-selected implementation plan. Component and renderer completion is recorded separately.

## Outcome

Make the interactive motion examples the quality floor for the entire Yogurt library. Derive a coherent design language from their observed geometry, typography, surfaces, state changes and motion, then apply that language to every public component and composition. The numbered palette and Rethink Sans family remain the approved inputs; type sizes, weights, line heights, tracking, space, sizes, radii, elevations and motion are in scope for reassessment. Everyday surfaces remain predominantly neutral, ordinary containers do not gain perimeter outlines, and color has an identifiable purpose.

This is a full-library design and behavior replacement. An example supplies evidence for a related task, not a requirement that every component reproduce its decoration or animation. A new visual or motion choice must be testable in the actual context in which it is used.

## Current implementation boundaries

- `design/tokens/brand.json` contains palette and primitive values. `design/tokens/ui.json` defines semantic roles and some component geometry; `scripts/sdk/ui-tokens.mjs` generates CSS and Zig outputs.
- Motion is split between duration/easing roles, sampled CSS profiles and behavior-specific spring parameters. Examples and components may also contain fixed values. The existing generated Zig values do not establish Native rendering or motion parity.
- The current inventory contains 125 component entries and 78 retained Web motion examples. Inventory counts and gallery rendering do not establish visual approval, runtime coverage or completion. Some Web interactions use the shared behavior runtime; Native is a separate renderer.
- The first input-group and motion-profile changes have Web fixture evidence. Their full visual review and Native qualification remain open, and the overall token redesign continues across the other families.

## Architecture to design and qualify

1. **Primitive values.** Maintain the numbered palette, neutral scale, one font family and a small, intentional set of dimensional and typographic values. Record units and permitted ranges. A primitive describes a value without embedding a product task.
2. **Semantic roles.** Define reusable surface, ink, spacing, control, typography, shape and elevation roles according to relationships and state. Light, dark and supported materials resolve through the same role names. Explicit focus, disabled, invalid and forced-color rules keep states distinguishable without relying on color alone.
3. **Component roles.** Map component-family geometry and state roles to semantic or primitive values. A component-specific role is appropriate when the measurement reflects a real component contract; it must not become a duplicate value for every component. A component may use several shared roles and, where necessary, a documented local value with a reason.
4. **Motion profiles.** Define a shared vocabulary by behavior: press and release, surface change, anchored entrance and exit, selection travel, value change, progress, feedback and interruption. A profile describes its timing or spring parameters, supported properties and fallback. Choreography such as stagger, delayed dismissal or multi-part sequencing remains explicit; one duration cannot stand in for the entire interaction. Define an immediate or stable reduced-motion outcome for every profile.
5. **Renderer outputs.** Generate versioned Web token output and Native-consumable values from the canonical source. Represent units, rounding and fallback deliberately. If a Native API cannot express a sampled curve, gesture or geometry, record a renderer-specific adaptation and its observed result instead of claiming equivalence. Do not introduce React DOM dependencies into a Native artifact.

The exact schema, names, values and grouping remain candidates until measured examples across several families justify them. Avoid both unrestricted one-off tokens and a single oversized profile forced onto unrelated interactions. Preserve compatibility aliases or provide an explicit migration when existing public tokens change.

## Work sequence

### 1. Measure the baseline

- Inventory every motion example and public component, their normal export, editable registry entry, guide example and renderer availability. Group related tasks: actions, fields and choices, navigation and layers, feedback and progress, collections and data, conversation and agent surfaces, and compositions.
- Capture representative resting, focus, active, transition, interrupted, error and settled states at desktop and narrow widths in both appearances. Record dimensions, layout relationships, text metrics, surfaces and colors, plus timing, displacement, easing, choreography and reduced-motion behavior.
- Identify which values recur, which differ for a functional reason and which are accidental. Measure real content and hit targets, not just boxes. Record an explicit match, adaptation or missing exemplar for each component.
- Review the gallery and shared package sources together so an isolated demo is not mistaken for a reusable component.

Deliverable: an evidence-backed family matrix with a named owner, current state and source of each measured value. Link visual verification to the exact candidate revision and state that was observed.

### 2. Establish the token foundation

- Reconcile current palette, type, geometry, motion and semantic roles with the matrix. Keep the approved font family and existing palette; change their usage or other typography values when warranted by measurement. Do not proliferate arbitrary color or motion roles.
- Design one canonical schema for primitive, semantic, component and motion roles. Specify references, units, constraints, theme fallback, platform support, naming, deprecation and versioning. Generate both target outputs deterministically and validate missing references, cycles, invalid units and incompatible fallback values.
- Resolve conflicts with a documented decision: compare contexts and evidence, update a shared role if both should change, use a component role for a real exception, or preserve a local value with a removal condition. When changing a shared role, enumerate every affected component and rerun the relevant visual and behavior checks.
- Provide a human-readable token guide and machine-readable metadata for consumers and agents. Document which roles are required, how to compose them, and when an exception should become a proposed system change.

Gate: source, generated outputs, fallback and initial measurements agree; representative combinations have been reviewed at actual sizes. Unresolved platform or design choices remain visible instead of being silently assigned values.

### 3. Prove the foundation in representative families

Implement a small set spanning different relationships, for example an action, an input with an adjacent action, a selection control and an anchored menu. Each uses the new tokens, existing public contract where practical, and the shared behavior runtime where appropriate. Apply the source example's motion structure and adapt it to the task; preserve intermediate frames, reversal, focus, cancellation and reduced-motion outcomes.

Show the resulting live guide and a comparison of reference-quality examples and ordinary component use to the owner. Update the token proposal when inconsistencies emerge. Do not expand the rollout based solely on a screenshot or a component-count check.

### 4. Replace every component and composition

- Roll out family by family through the normal public entry, editable registry, guide, motion examples and reusable compositions. Where a motion example duplicates an existing control, share an implementation when their contracts genuinely match; otherwise share the appropriate design and motion roles while keeping distinct behaviors.
- Use `@ui-sdk/core` and its React bindings for compatible Web interaction semantics. Preserve controlled and uncontrolled values, accessible names, native form and callback contracts, focus and lifecycle behavior. Noninteractive primitives do not need an artificial agent action. An unsupported primitive stays an explicit gap until an adapter is qualified.
- Keep data, validation, permissions, side effects and confirmation decisions with the consuming host. A rendered component alone must not create an agent bridge or authorize a product operation. Verify both the individual action result and the observed host state.
- Build Native controls with the selected Native SDK and shared values through a renderer-specific adapter. The JavaScript Web runtime is not assumed to run in Zig. Qualify each supported native behavior, appearance and motion on an identified target; record real limitations rather than substituting Web screenshots.
- Update guide pages and project-level compositions to use the replaced controls, not a second copy of their behavior. Retain stable IDs and document compatibility changes or migration paths.

Gate: every inventory row has an explicit result for design, interaction, motion, accessibility, package/registry, guide, Web hosts and applicable Native targets. A gap is not converted to a pass because a related demo works.

### 5. Qualify agents, delivery and ongoing changes

- Give agents the installed token and component map, exact imports, composition rules, accessible behavior, platform support and verification workflow. Split skills by decision and task; host policies govern agent exposure and actions.
- Evaluate with deterministic checks and model-driven tasks. Keep development examples separate from held-out cases; cover choosing existing components, applying tokens, building a composition, testing interactions, recognizing unsupported targets and proposing a system improvement. Measure outcome, token usage, elapsed time and model profile; report actual cost only when a receipt exists. Set promotion thresholds and a call budget before running comparisons.
- Run package builds, catalog and registry checks, Vite and Next.js installed-consumer fixtures, keyboard and pointer behavior, form/reset and host-state tests, light/dark and narrow/wide visuals, forced colors, reduced motion and interrupted/reversed interactions. Compare motion with intermediate as well as final frames and test the actual production build.
- For Native, record the SDK/toolchain, OS, device, executable and accessible state. Compare supported behavior, sizes and motion with the same token intent. Measure startup, memory and frame/input response against an explicitly named baseline before making performance claims.
- Publish a reviewable interactive preview before merge. Keep the PR draft while any required family, renderer, visual approval or validation remains open. Merge and release are separate outcomes, not consequences of a local build passing.

## Change loop and completion rule

For each family: measure → propose token and component mapping → implement → compare and interact → diagnose → change the shared token or record a justified exception → rerun the affected families → update guidance and inventory. A token decision is revisitable when a later family reveals a genuine mismatch; requalification follows the dependency graph.

The work is complete only when the complete inventory has been reviewed, required components and compositions are implemented and verified on their claimed targets, agent evaluation meets its predetermined criteria, the owner has had the requested hands-on preview, and remaining unsupported capabilities are resolved or explicitly excluded by an owner decision.
