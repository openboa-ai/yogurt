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
