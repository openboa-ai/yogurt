# Agent-ready button: web implementation

## Accepted scope

The owner approved the component replacement plan and preservation of existing design and motion. This revision covers the existing Web `Button` and its `IconButton` wrapper, their public package entries and the Web build dependency boundary. It does not claim completion of other controls, the native renderer, the full registry, agent tools, or the guide.

## Contract

- Keep the existing `ButtonProps` public contract, individual and root package imports, default `type="button"`, supplied `type`, forwarded ref, children, labels, custom attributes, class names, sizes, shapes, tones and emphasis.
- Preserve the current surface, spacing, typography, five size roles, focus, forced colors, press and pending motion. Pending and `aria-disabled` buttons must not invoke the caller. Native `disabled` must preserve ordinary form and focus semantics. A form submit must occur at most once per activation and never for a blocked action.
- Use the unstyled behavior provider for the underlying button while keeping the Yogurt markup and presentation under Yogurt control. Do not expose provider-specific props through the Yogurt API.
- A consuming application may explicitly connect its own agent. The installed Yogurt control and its consumer's bridge must resolve the same provider runtime. Importing or rendering Yogurt never starts a bridge, grants permissions, sends data or runs a product action. The host owns policy, identity, records, and effects.
- Make provider dependencies resolvable from a packed installation with a single compatible copy. Preserve React and Next.js client boundaries, the editable registry entry, and existing application imports. Include required dependency notices where bundled code is redistributed.

## Failure and lifecycle

Blocked, disabled, pending, unmounted and failed interactions do not trigger additional calls. An interrupted visual state must not change the caller's confirmed result. A bridge action refused by the host must not run the callback. The owner-selected existing reduced-motion and forced-color behaviors remain available.

## Evidence

1. Capture the existing guide at 320 and 1440 pixels and compare the same button states after replacement. Record any observable difference rather than treating a build as visual approval.
2. Browser-test all five sizes, shapes, pointer and keyboard activation, focus, form submit, disabled, pending and `aria-disabled`, including rerender and blocked repetitions.
3. Build and install an archive in separate Vite and Next.js consumers. Test hydration and the button's actual pointer, keyboard and form behaviors in a browser.
4. In an isolated Vite and Next.js fixture, explicitly create an agent bridge from the same provider installation; confirm discovery and an allowed action on the installed Yogurt button, and a refused action that never invokes its callback. The fixture has no external effects.
5. Rebuild the offline gallery and run the existing relevant checks. Share an interactive preview before updating the review branch. Native implementation and qualification are separate subsequent work.

## Review notes

The provider uses a shared runtime for component registration. Duplicating it between a bundled package and a consumer bridge would silently prevent discovery, so the installed dependency identity is a required acceptance check. Retain ordinary semantic buttons rather than equating agent discoverability with authorization.
