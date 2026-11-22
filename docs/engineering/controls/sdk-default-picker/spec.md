# Default picker interaction

Status: reviewed follow-up under the SDK-default motion decision.

Keep the controlled picker, its Radix selection and open-state handling, label, trigger, option markers, selected check and positioning. Render the settled open and selected appearance immediately rather than scheduling springs or delaying dismissal. The host retains value ownership and receives one request for each selection. Keep focus restoration, keyboard navigation, Escape dismissal, pointer selection and reduced-motion behavior. No timer, animation frame or observer is required for decorative motion.

Verify opening, selecting, Escape, keyboard navigation, controlled updates and focus restoration at narrow and wide widths under default and reduced motion. Check that all options and the selected check are visible immediately and the popup is not left mounted after dismissal. Source changes and actual browser verification are separate evidence.
