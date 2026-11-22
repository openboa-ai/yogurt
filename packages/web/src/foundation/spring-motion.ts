export type Spring = { position: number; velocity: number; target: number; stiffness: number; damping: number };

export function spring(position: number, stiffness: number, damping: number): Spring {
  return {position, velocity: 0, target: position, stiffness, damping};
}

export function snap(s: Spring, position: number) {
  s.position = s.target = position;
  s.velocity = 0;
}

export function advanceSprings(springs: readonly Spring[], elapsed: number): boolean {
  const delta = Math.min(Math.max(0, elapsed), 1 / 30) / 4;
  let moving = false;
  for (const s of springs) {
    if (Math.abs(s.position - s.target) < .001 && Math.abs(s.velocity) < .001) {
      snap(s, s.target);
      continue;
    }
    for (let sample = 0; sample < 4; sample++) {
      const acceleration = s.stiffness * (s.target - s.position) - s.damping * s.velocity;
      s.velocity += acceleration * delta;
      s.position += s.velocity * delta;
    }
    moving = true;
  }
  return moving;
}

export function playSprings(springs: readonly Spring[], paint: () => void): () => void {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let last = performance.now();
  function step(time: number) {
    const moving = advanceSprings(springs, (time - last) / 1000);
    last = time;
    paint();
    frame = moving ? requestAnimationFrame(step) : 0;
  }
  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    springs.forEach(state => snap(state, state.target));
    paint();
  }
  function change() { if (preference.matches) settle(); }
  if (preference.matches) settle();
  else {
    paint();
    frame = requestAnimationFrame(step);
  }
  preference.addEventListener("change", change);
  return () => {
    cancelAnimationFrame(frame);
    preference.removeEventListener("change", change);
  };
}
