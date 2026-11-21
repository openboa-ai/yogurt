# Select picker motion

Status: reviewed Web implementation scope under the owner-selected motion-led component foundation. Native rendering and visual approval remain separate.

## Intent and boundary

Apply the picker family's existing spring timing and subtle entrance treatment to the public single-choice Select while retaining its real native select and option elements. Its native form, focus, required, name, placeholder, disabled options, controlled and uncontrolled values, reset, multiple, listbox `size`, and callbacks stay unchanged. The host owns values and all effects. The standalone spring picker has a different controlled listbox contract, so matching geometry and motion roles must not replace native select semantics.

## Behavior and motion

Where the browser supports customizable native pickers, animate the opening panel's position, opacity, and small horizontal expansion with the existing picker-lift role and correct transform origin for above/below positioning. Transition option highlight surfaces using the existing picker-highlight role. Keep option text and selected state immediately readable while focus or selection changes; never postpone input callbacks or native dismissal for animation. Rapid close and reopen follows the current browser state. Keep the plain native fallback in unsupported browsers and the native listbox for `multiple` or `size > 1`.

Reduced motion and forced colors use immediate, readable final presentation with no panel or highlight animation. Do not add an ordinary decorative outline; preserve existing keyboard and forced-color focus treatments. No JavaScript animation observers or timers are added.

## Evidence

Exercise native single select opening above and below, keyboard selection and Escape, disabled options, controlled and uncontrolled values, form reset and submission, and `multiple`/`size` fallback. Inspect picker and option animation properties in both motion preferences, focus visibility and forced colors; compare narrow and wide rendered states in light and dark. The ordinary export, registry, installed Vite and Next hosts must retain their select contract. Native renderer claims require separate evidence.
