# SDK-default motion

The owner selected a minimal presentation on Web and Native and asked to remove decorative custom component motion in favor of the Vercel Native SDK's default behavior. This decision supersedes conflicting component-motion requirements in the earlier motion foundation and component library specifications. Preserve Yogurt's existing appearance and layout wherever the SDK permits, including the approved colors, typeface, component identities, data, callbacks and accessibility.

Decorative component motion settles immediately in its final visible state. Feedback required to communicate pending work remains visible. Do not delay user input or state changes; preserve keyboard, pointer, reduced-motion and interruption behavior. Preserve existing agent animations, expressions, silhouettes, status labels and animation options. Native uses supported SDK behavior and does not claim web motion parity without runtime evidence.

Expanded card content and its visual state appear immediately when its native disclosure opens; closing and rapid toggles must not leave content hidden or introduce delayed updates.
Statistic card values and chart points reflect the current supplied data immediately, including rapid updates and non-finite chart inputs.

Apply the decision across component styles and JavaScript-driven motion, while retaining non-motion styling. Verify representative controls and composed views at their resting and changed states, including loading, rapid interaction and reduced motion; check that no content stays hidden or waits for a removed animation. Validate Web builds and the Native integration separately and show the owner a preview before merge.
