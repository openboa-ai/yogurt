# Agent-ready segmented control: web implementation

## Accepted scope

The owner approved the behavior-provider transition with the existing design and motion preserved. This slice covers the Web segmented control, its motion example and installed entry. Native implementation and product agent authority remain separate.

## Contract

- Preserve the existing `Choices` props, label, controlled selected ID, disabled options and group, public entry and callback behavior. An activation of the selected option must not clear the selection. Keyboard selection respects disabled items and the existing non-wrapping boundary.
- Keep the existing Yogurt track, measured selection marker, focus treatment, visual timing, responsive geometry and reduced-motion behavior. Selection changes, rapid reversals and reflow leave the marker at the actual selected option.
- Use the shared provider for selection and keyboard behavior. Its state must reach the existing Yogurt presentation. An explicitly connected host bridge can discover and change the component through the same installed runtime. The host owns permissions and effects; rendering must not create a bridge.

## Evidence

Compare narrow and wide resting captures with the previous guide. Exercise pointer and keyboard selection, disabled items, no deselection, marker geometry, reversal and reduced motion. Verify an installed Vite and Next.js consumer can observe an allowed update and a refused update with the actual host value and callback count. Run the existing segmented and motion-gallery interaction checks. Native remains separately unqualified.
