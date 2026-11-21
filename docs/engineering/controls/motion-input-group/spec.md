# Motion-led input group: Web slice

## Scope and decision

The owner selected the motion examples as the quality floor for component design and behavior. This slice applies the expressive input's featured height, rounded surface, inset, focus material and surface transition to the public Web input group. Compact, regular, comfortable, spacious and touch sizes remain available for denser contexts. The motion example's glyph animation and submission sequence are not implied by an arbitrary field; the host supplies its own action and outcome. Native support is a separate qualification.

## Contract

- Generate shared featured-field geometry and a named focus-surface motion profile from the canonical token source. The profile has a duration, fallback easing and sampled spring easing; the web output uses the supported easing, while Native receives the duration only and does not claim a rendered animation. The example and the group consume the same generated roles.
- The default group uses the featured height and card radius, an eight-pixel gap, a sixteen-pixel start inset, ten-pixel end inset, eight-pixel block inset and a quiet surface. Focus transitions to the hover material using the shared focus-surface profile. Reduced motion settles without a transition. Normal appearance adds no perimeter line; keyboard and forced-color focus remain identifiable.
- The optional size selects the existing compact, regular, comfortable, spacious or touch height and control radius. Leading and trailing content remains vertically centered; an actual adjacent button is independently operable and must not submit or focus the input implicitly.
- Preserve labels, help and error associations, input attributes, form behavior, controlled and uncontrolled values, event handlers, disabled and readonly state. The component does not submit or call a service on its own. The host owns data and effects.
- Use the shared input and group behavior for supported text-like fields, including callers with selection callbacks. Specialized input types and non-scalar values retain their native adapter until independently qualified. Do not silently alter their behavior. A connected agent is consumer-owned and requires an explicit policy. Enforce native maximum length for agent changes; an action that is rejected must not update host state. Secrets must not be exposed through snapshots.

## Evidence

Verify featured and compact geometry, focus and settled surfaces, responsive layout and motion reduction. In installed Vite and Next.js consumers exercise ordinary typing, controlled host callbacks, labels and descriptions, form data, allowed and denied agent actions, maximum-length rejection, sensitive input redaction, a trailing action and specialized native fallbacks. Record actual captured states and maintain separate Native, independent visual review and motion-frame evidence.
