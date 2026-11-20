# Default application stack

The [Zig example](../examples/native-ui/README.md) consumes the installed button and switch, and registers Rethink Sans. [Current evidence](engineering/controls/component-library/verification.md)

**Platform decision.** OpenBoa app clients use Vercel Native SDK (`vercel-labs/native`) as their default stack. Start the first app component in the native adapter. The website and browser documents use the web adapter in Next.js or Vite. An embedded WebView is a deliberately declared web surface inside a native app. [Upstream repository](https://github.com/vercel-labs/native)

Native SDK compiles application logic and views into a native executable. Its model supports typed messages, state updates and effects. The SDK is experimental and its platform matrix describes different levels of support. The upstream release inspected for this design was v0.11.1. Record the exact supported release again when qualifying the first build. [Versioned release](https://github.com/vercel-labs/native/releases/tag/v0.11.1) · [App model](https://native-sdk.dev/docs/app-model) · [Platform support](https://native-sdk.dev/docs/platform-support)

## How a project uses it

| Boundary | In the first decision or record screen | Owner |
| --- | --- | --- |
| Shared input | A stable pattern ID fixes the required labels, state, typed values and recovery cases. The same token revision supplies palette, font files and dimensions. | Yogurt catalog and foundations |
| Native presentation | The adapter exposes a Native markup composition or supported SDK view for its documented parts. It translates a selection into a stable action ID and gives the operating system appropriate accessibility information. | Yogurt native adapter |
| Product model | The host provides the actual record, allowed choices, revision and receipt. Its typed update handles a message and its effect boundary determines whether anything is sent. Opening, navigating or canceling a choice only changes presentation. | Consuming client |
| Web presentation | The site's Next.js or Vite app renders the same task through the web adapter. A separately declared web view records its host navigation and return-to-native behavior. | Yogurt web adapter and embedding host |

Choose Native markup and SDK controls appropriate to the pinned version. Keep React DOM dependencies, Tailwind and registry installers out of the native artifact. Bundle the needed Rethink Sans resources and selected assets. Resolve the primitive palette once at build time for the target; a button should not import the emoji collection. [Component authoring](https://native-sdk.dev/docs/building-components) · [Component catalog](https://native-sdk.dev/docs/components)

## First control on a native target

Take a button, icon button, text field or switch after its design revision is accepted. Start with the named action to measure its resting size, single activation, focus, pending state and retry against an SDK-native baseline. A product’s typed handler supplies the result. The native choice and test cases are written into that component’s implementation plan. [Component library](../catalog/components.json)

## Later overlay fixture

Use a secondary-action menu on a revisioned item. The input contains a stable action key, label, availability and destination for focus after dismissal. Open it, choose once, dismiss without choosing, repeat quickly and unmount while open. Check that the selection reaches the host once and dismissal never emits an action. Run it with a keyboard, pointer, reduced motion and the OS accessibility inspector.

The SDK’s versioned menu example documents a specific Tab sequence. The first Tab can dismiss to the trigger and the next advances through ordinary controls. The existing Yogurt DOM specimen continues through document order on dismissal. Each target should make leaving predictable and keep a hidden menu out of the focus path. Record the actual sequence on the installed target. [Native menu example at v0.11.1](https://github.com/vercel-labs/native/tree/v0.11.1/examples/menu-policy)

## What earns platform support

Start with a named desktop OS and device. Compare a small SDK-native baseline and the Yogurt fixture with identical content, build mode, window, display refresh rate and input sequence. Record cold start to usable UI, peak resident memory, input to first visible response, frame times and dropped frames under repeated interaction. Include trial counts and distributions. Agree tolerances against that named baseline before evaluating the candidate. Pair the trace with an actual screen recording, accessible state, focus sequence and callback count. Qualify another OS or mobile surface on its own supported host configuration. [Native testing](https://native-sdk.dev/docs/testing)

The native package, qualified OS targets and measured performance each need their own delivery record. The current kit includes source assets, tokens and an offline web example. [Renderer evidence](engineering/controls/component-library/verification.md)
