"use client";

// packages/web/src/foundation/spring-motion.ts
function spring(position, stiffness, damping) {
  return { position, velocity: 0, target: position, stiffness, damping };
}
function snap(s, position) {
  s.position = s.target = position;
  s.velocity = 0;
}
function advanceSprings(springs, elapsed) {
  const delta = Math.min(Math.max(0, elapsed), 1 / 30) / 4;
  let moving = false;
  for (const s of springs) {
    if (Math.abs(s.position - s.target) < 1e-3 && Math.abs(s.velocity) < 1e-3) {
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
function playSprings(springs, paint) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let last = performance.now();
  function step(time) {
    const moving = advanceSprings(springs, (time - last) / 1e3);
    last = time;
    paint();
    frame = moving ? requestAnimationFrame(step) : 0;
  }
  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    springs.forEach((state) => snap(state, state.target));
    paint();
  }
  function change() {
    if (preference.matches) settle();
  }
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

export {
  spring,
  snap,
  advanceSprings,
  playSprings
};
