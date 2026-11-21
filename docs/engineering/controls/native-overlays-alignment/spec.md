# Native overlay alignment

Status: reviewed corrective scope under the accepted component library and motion foundation. This change aligns Native presentation without changing host data or claiming complete cross-renderer parity.

Dialog, sheet, drawer and popover keep their existing template names, arguments, slots and dismiss/open messages. Use the shared 24-point sheet inset and 12-point popover inset once per surface, with the existing 12-point stack gap. Preserve the existing SDK modal, input, focus and animation behavior; do not add an outline in normal appearance or introduce an automatic action. Accordion and tooltip keep their existing native controls and contracts.

Build and validate all templates with the pinned Native SDK, then inspect an installed fixture for reachable controls and correct inset at narrow and regular window sizes. Report actual rendering and motion evidence separately from compilation and retain any unverified Native differences.
