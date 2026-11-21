# Pagination behavior migration

Status: draft for review. Implementation and verification: not admitted or run.

## Purpose and scope

Expose the shared pagination behavior to an explicitly connected agent while retaining the existing Yogurt control's public API and appearance. The scope is the Web `Pagination` component and its installed entry. The host supplies the current page, total pages and callback, and owns data, navigation, authorization and effects. Rendering a control does not create an agent connection. Native behavior and delivery remain separate.

## Proposed contract

- Keep the `page`, `pages`, `onPageChange` and `label` properties, the named navigation region, Previous and Next labels, polite current-page text and existing alignment, sizing and visual response. A page count below one renders nothing.
- Keep the control externally controlled. An ordinary supported request calls the host with the selected page; it does not fetch data or navigate. At the first and last page, the respective control remains an actual disabled button and cannot call the host.
- Adapt the shared pagination primitive to the existing markup and button semantics without adding visible page links or changing focus order. Supported pointer and keyboard actions work as before. An agent's allowed request calls the same host callback; a refused request has no callback or visible result.
- Page counts and selected pages can change while mounted. Preserve the host's stated page in the announcement and avoid claiming data has loaded from a pagination request. A rapid sequence must not advance optimistically beyond a controlled value the host has not accepted.
- Keep normal, focus-visible, forced-color and reduced-motion behavior. No ordinary perimeter outline is added. Maintain the existing package and editable-entry contracts.

## Questions for review before implementation

The existing implementation displays the supplied page verbatim even if it lies outside `1..pages`; the shared primitive's controller clamps writes to its valid range. Decide how to preserve the existing announcement and prevent any controller request from silently changing the host's value when the page or page count is invalid or changes during an outstanding action. Non-integer, non-finite and empty values also need an explicit compatibility decision. Boundary buttons are currently native-disabled while the primitive's documented boundary steps are focusable with `aria-disabled`; a render adapter must preserve the existing focus order and prevent activation, with the impact on agent access verified.

## Required evidence

Record review and the accepted revision before implementation. Exercise first, middle, last and empty page sets, controlled callback acceptance and refusal, dynamic page counts, rapid repeated input, pointer, keyboard, screen-reader labels and focus behavior. Test the resolved invalid-value contract and distinguish the host's callback from data loading or navigation. Check actual rendered normal and reduced-motion states at narrow and wide widths. Exercise the installed Web package in Vite and Next.js with an explicitly connected agent and its host policy, including denied requests. Verify the editable entry separately. Native rendering and actual device interaction are not established by Web evidence.
