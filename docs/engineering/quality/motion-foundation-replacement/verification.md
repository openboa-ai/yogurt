# Foundation replacement verification

The replacement is in progress. The inventory is not a completion claim.

## Current web slice

- The button guide exercises five sizes and both shapes, with separate links to copy, quantity, hold, slide and loading actions. Automated browser checks cover the sizes and action changes at 320 and 1440 px.
- The text-field, search and select guides exercise five sizes at the same widths. The check reads each label, measures its control and enters or selects a value. It also checks search clearing and native multiple selection.
- The web card guide exercises three density choices. A browser check verifies the shared corner, each inset, the absence of a visible border and containment at both widths.
- The default tab presentation, segmented selection and switch are exercised in the guide with pointer or keyboard input. The segmented marker settles on the selected item and the keyboard focus remains visible without a perimeter outline in ordinary colors.
- Browser checks exercise the shared slider dimensions and keyboard and pointer input, checkbox dimensions, form behavior and forced colors, star selection and reduced motion, and the quantity control's range bounds at narrow and wide widths. The checklist, star rating, quantity and single-value slider specimens use the same SDK components. Layers, attachments and carousel slides no longer add ordinary inset perimeter lines. The single slider still needs a full interaction and visual comparison.
- List-row height, gap and activation are exercised at narrow and wide widths; matching checklist dimensions use the same generated roles.
- Guide search and category navigation use shared controls and are exercised at narrow and wide widths.
- The first consistency pass aligns workspace rows, input surfaces, sidebar states, the composer, attachment progress and accordion feedback with existing shared roles. Browser checks cover narrow and wide layouts, attachment progress values and focus, pagination boundaries and keyboard use, and tooltip focus, interruption, viewport edges and reduced motion. The tooltip and composer were viewed locally; owner visual review and animation-frame comparison remain open.
- The existing web gallery interaction suite exercises 78 examples at 320, 768 and 1440 px. It detects runtime failures, but it is not evidence of complete visual equivalence for all component states.
- The token generator produces CSS and Zig dimensions from the shared source. A generated value does not establish a native rendering or interaction.

## Still required

Each catalog item remains pending until its entry point, editable distribution, guide, required states and supported renderers are checked. Native controls, including the fixed-size switch and the expanded button and field choices, have not been rebuilt or observed for this revision. Individual registry entries and native implementations for the dedicated motion actions are also outstanding. Type, spacing and components outside the current web slice still need replacement and review.
