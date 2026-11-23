import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

export function animateSliderCues(container: HTMLElement) {
  const cues = Array.from(container.querySelectorAll<HTMLElement>("[data-tip]"));
  const springs = cues.map(() => spring(0, 260, 18));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let previous = 0;
  let initialized = false;
  let pixelsPerPercent = 0;
  let direction = 1;

  function paint() {
    cues.forEach((cue, index) => {
      const axis = springs[index];
      const offset = (axis.position - axis.target) * pixelsPerPercent * direction;
      cue.style.setProperty("--yg-tip-current", `${axis.position}%`);
      cue.style.setProperty("--yg-tip-lean", `${Math.max(-28, Math.min(28, offset * .9))}deg`);
    });
  }
  function step(time: number) {
    const moving = advanceSprings(springs, (time - previous) / 1000);
    previous = time;
    paint();
    frame = moving ? requestAnimationFrame(step) : 0;
  }
  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    springs.forEach(axis => snap(axis, axis.target));
    paint();
  }
  function preferenceChanged() {
    if (reduced.matches) settle();
  }
  reduced.addEventListener("change", preferenceChanged);

  return {
    measure() {
      pixelsPerPercent = container.clientWidth / 100;
      direction = getComputedStyle(container).direction === "rtl" ? -1 : 1;
    },
    move(start: number, end: number) {
      const targets = [start, end, (start + end) / 2];
      if (initialized && springs.every((axis, index) => axis.target === targets[index])) return;
      springs.forEach((axis, index) => { axis.target = targets[index]; });
      if (!initialized || reduced.matches) settle();
      else if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(step);
      }
      initialized = true;
    },
    dispose() {
      cancelAnimationFrame(frame);
      reduced.removeEventListener("change", preferenceChanged);
    },
  };
}
