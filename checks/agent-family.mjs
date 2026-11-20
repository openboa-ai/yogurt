import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { agentShapes, agentVariants } from "../packages/web/src/identity/agent-family-data.ts";
import { tracks } from "../packages/web/src/identity/avatar-pose-data.ts";

const read = (name) => JSON.parse(readFileSync(new URL("../assets/agents/" + name, import.meta.url), "utf8"));
const { eyeMarks } = read("avatar-motion.json");
const { shapes, eyes, viewBox } = read("silhouettes.json");

function closedOutline(commands) {
  const samples = [];
  for (const [verb, x, y, endX, endY] of commands) {
    if (verb === "Q") {
      const [startX, startY] = samples.at(-1);
      for (let i = 1; i <= 8; i += 1) {
        const t = i / 8;
        const u = 1 - t;
        samples.push([u * u * startX + 2 * t * u * x + t * t * endX, u * u * startY + 2 * t * u * y + t * t * endY]);
      }
    } else if (verb !== "Z") {
      samples.push([x, y]);
    }
  }
  return samples;
}

const marks = {
  round: Array.from({ length: 24 }, (_, index) => {
    const angle = index * Math.PI / 12;
    return [Math.cos(angle), Math.sin(angle)];
  }),
  cross: closedOutline(eyeMarks.cross),
  smile: closedOutline(eyeMarks.smile),
};

function matrix([x, y, angle, width, height]) {
  const sin = Math.sin(angle * Math.PI / 180);
  const cos = Math.cos(angle * Math.PI / 180);
  return [cos * width, sin * width, -sin * height, cos * height, x, y];
}

function fitsOutline(outline, body, fit) {
  const [slide, lift, tilt] = fit;
  const [x, y, angle, width, height] = body;
  const [a, b, c, d, tx, ty] = matrix([x * slide, y * lift, angle * tilt, width, height]);
  const [left, top, w, h] = viewBox;
  const cx = left + w / 2;
  const cy = top + h / 2;
  return outline.every(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const px = cx + a * dx + c * dy + tx;
    const py = cy + b * dx + d * dy + ty;
    return px >= left && px <= left + w && py >= top && py <= top + h;
  });
}

// Bucket edges by y so containment checks visit only nearby edges.
function scanEdges(outline) {
  const rows = Array.from({ length: 120 }, () => []);
  for (let i = 0; i < outline.length; i += 1) {
    const [ax, ay] = outline[i];
    const [bx, by] = outline[(i + 1) % outline.length];
    if (ay === by) continue;
    for (let row = Math.floor(Math.min(ay, by)); row <= Math.floor(Math.max(ay, by)); row += 1) {
      rows[row + 5].push([ax, ay, bx, by]);
    }
  }
  return rows;
}

function inside(rows, x, y) {
  let contained = false;
  for (const [ax, ay, bx, by] of rows[Math.floor(y) + 5] ?? []) {
    if ((ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay)) contained = !contained;
  }
  return contained;
}

function fitsEye(rows, shape, eye, side, mark) {
  if (eye[4] <= 0) return true;
  const [x, y, angle, width, height] = eye;
  const [cx, cy] = shape.center;
  const [a, b, c, d, tx, ty] = matrix([
    cx + side * eyes.offsetX + x * shape.fit[3], cy + y * shape.fit[4],
    angle, width * eyes.radius, height * eyes.radius,
  ]);
  return marks[mark].every(([u, v]) => inside(rows, a * u + c * v + tx, b * u + d * v + ty));
}

const failures = [];
let tested = 0;
const sourceIds = shapes.flatMap(({file, positions}) => positions.map((side) => file.replace(".svg", "") + "-" + side));
assert.deepEqual(Object.keys(agentVariants), sourceIds);
for (const [id, variant] of Object.entries(agentVariants)) {
  const shape = agentShapes[variant.shape];
  const outline = [...variant.path.matchAll(/[ML](-?[\d.]+)\s+(-?[\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)]);
  const rows = scanEdges(outline);
  for (const [size, profile] of Object.entries(tracks[shape.motion])) {
    for (const [state, clip] of Object.entries(profile)) {
      const { frames } = clip;
      let violation;
      for (let step = 1; step < frames.length && !violation; step += 1) {
        const [fromTime, from] = frames[step - 1];
        const [toTime, to] = frames[step];
        for (let i = 0; i <= 8; i += 1) {
          tested += 1;
          const progress = i / 8;
          const eased = progress * progress * (3 - 2 * progress);
          const time = fromTime + (toTime - fromTime) * progress;
          const [body, left, right] = from.map((part, j) => part.map((value, k) => value + (to[j][k] - value) * eased));
          const mark = time < clip.markAt ? "round" : clip.mark;
          const bodyFits = fitsOutline(outline, body, shape.fit);
          const eyesFit = fitsEye(rows, shape, left, -1, mark) && fitsEye(rows, shape, right, 1, mark);
          if (!bodyFits || !eyesFit) {
            violation = [id, size, state, time, bodyFits ? "eyes" : "body"];
            break;
          }
        }
      }
      if (violation) failures.push(violation);
    }
  }
}
assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
console.log(JSON.stringify({ silhouettes: shapes.length, variants: sourceIds.length, sizes: [24, 96], states: 6, sampledPoses: tested }));
