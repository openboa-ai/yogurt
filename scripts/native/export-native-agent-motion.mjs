import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[3] ?? resolve(here, "../.."));
const output = resolve(process.argv[4] ?? source, "packages/native/controls/models");
const { default: sharp } = await import(
  process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : "sharp"
);
const read = (path) => readFileSync(resolve(source, path), "utf8");
const motion = JSON.parse(read("assets/agents/presence-motion.json"));
const easing = JSON.parse(read("tokens/ui.json")).easing.settle;
const easingValues = easing.match(/^cubic-bezier\((.+)\)$/)?.[1].split(",").map(Number);
if (easingValues?.length !== 4 || !easingValues.every(Number.isFinite)) {
  throw Error("The shared settle easing must be a cubic-bezier curve.");
}

const identities = ["kai", "sol"];
const states = ["ready", "thinking", "working", "waiting", "blocked", "done"];
const idle = [0, 0, 1, 1, 1];
const sampleIntervalMs = 32;
const pixelSize = 128;

function bezier(a, b, t) {
  return 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
}

function ease(progress) {
  if (progress <= 0 || progress >= 1) return progress;
  const [x1, y1, x2, y2] = easingValues;
  let left = 0;
  let right = 1;
  for (let step = 0; step < 18; step++) {
    const middle = (left + right) / 2;
    if (bezier(x1, x2, middle) < progress) left = middle;
    else right = middle;
  }
  return bezier(y1, y2, (left + right) / 2);
}

const poses = [];
const poseIds = new Map();
function poseIndex(values) {
  const pose = values.map((value) => Number(value.toFixed(3)));
  const key = pose.join(",");
  if (!poseIds.has(key)) {
    poseIds.set(key, poses.length);
    poses.push(pose);
  }
  return poseIds.get(key);
}
const idleIndex = poseIndex(idle);

function sampleTrack(state) {
  const { durationMs, repeat, frames } = motion[state];
  if (
    !Number.isSafeInteger(durationMs) || durationMs < 0 || durationMs > 10_000 ||
    typeof repeat !== "boolean" || !Array.isArray(frames) ||
    frames[0]?.[0] !== 0 || frames.at(-1)?.[0] !== 100 ||
    frames.some((frame, index) =>
      frame.length !== 6 || !frame.every(Number.isFinite) ||
      frame.slice(3).some((value) => value < 0) || (index > 0 && frame[0] <= frames[index - 1][0])
    )
  ) throw Error("Invalid motion track: " + state);
  if (!durationMs) return [{ ms: 0, index: poseIndex(frames[0].slice(1)) }];

  const exact = new Map(frames.map((frame) => [Math.round((frame[0] * durationMs) / 100), frame]));
  const times = new Set(exact.keys());
  for (let ms = sampleIntervalMs; ms < durationMs; ms += sampleIntervalMs) {
    times.add(ms);
  }

  return [...times].sort((a, b) => a - b).map((ms) => {
    if (exact.has(ms)) return { ms, index: poseIndex(exact.get(ms).slice(1)) };
    const at = (100 * ms) / durationMs;
    const rightIndex = frames.findIndex((frame) => frame[0] >= at);
    const left = frames[rightIndex - 1];
    const right = frames[rightIndex];
    const weight = ease((at - left[0]) / (right[0] - left[0]));
    const pose = left.slice(1).map((value, index) => value + (right[index + 1] - value) * weight);
    return { ms, index: poseIndex(pose) };
  }).filter((sample, index, all) => index === 0 || sample.index !== all[index - 1].index);
}

if (Object.keys(motion).length !== states.length || states.some((state) => !motion[state])) {
  throw Error("Expected the six published presence states.");
}
const clips = Object.fromEntries(states.map((state) => [state, sampleTrack(state)]));
if (poses.length > 256) throw Error("Frame index exceeds its byte representation.");
const chunks = [];
const ranges = {};
let byteOffset = 0;
mkdirSync(output, { recursive: true });

for (const agent of identities) {
  const master = read("assets/agents/" + agent + ".svg");
  const eyeGroup = master.match(/<g id="eyes"[^>]*>[\s\S]*?<\/g>/)?.[0];
  const eyeCenters = [...(eyeGroup ?? "").matchAll(/<circle[^>]* cx="([\d.]+)" cy="([\d.]+)"/g)]
    .map(([, x, y]) => [Number(x), Number(y)]);
  if (!eyeGroup || eyeCenters.length !== 2 || eyeCenters[0][1] !== eyeCenters[1][1]) {
    throw Error("Expected two horizontal eyes in the " + agent + " master.");
  }
  ranges[agent] = [];
  for (const [x, y, left, right, width] of poses) {
    let index = 0;
    const eyes = eyeGroup.replace(/<circle\b/g, (tag) => {
      const [cx, cy] = eyeCenters[index];
      const height = index++ === 0 ? left : right;
      const transform = "translate(" + cx + " " + cy + ") scale(" + width + " " + height +
        ") translate(" + -cx + " " + -cy + ")";
      return tag + ' transform="' + transform + '"';
    }).replace('id="eyes"', 'id="eyes" transform="translate(' + x + " " + y + ')"');
    const svg = master.replace(eyeGroup, eyes);
    const png = await sharp(Buffer.from(svg), { density: 256 }).resize(pixelSize, pixelSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }).png({ compressionLevel: 9 }).toBuffer();
    ranges[agent].push([byteOffset, png.length]);
    chunks.push(png);
    byteOffset += png.length;
  }
}

const zig = [
  "// Generated by scripts/export-native-agent-motion.mjs.",
  "// Motion comes from assets/agents/presence-motion.json and tokens/ui.json.",
  "pub const State = enum { " + states.join(", ") + " };",
  "pub const Agent = enum { " + identities.join(", ") + " };",
  "pub const neutral_pose: u8 = " + idleIndex + ";",
  "pub const pose_count: usize = " + poses.length + ";",
  "pub const Frame = struct { at_ms: u32, pose: u8 };",
  "pub const Clip = struct { duration_ms: u32, repeat: bool, frames: []const Frame };",
  "const Range = struct { offset: usize, length: usize };",
  "",
  "pub fn clip(state: State) Clip {",
  "    return switch (state) {",
  ...states.map((state) => "        ." + state + " => .{ .duration_ms = " +
    motion[state].durationMs + ", .repeat = " + motion[state].repeat +
    ", .frames = &" + state + " },"),
  "    };",
  "}",
  "",
  "pub fn label(state: State) []const u8 {",
  "    return switch (state) {",
  ...states.map((state) => "        ." + state + " => " + JSON.stringify(motion[state].label) + ","),
  "    };",
  "}",
  "",
  "pub fn bytes(agent: Agent, pose: u8) []const u8 {",
  "    const range = switch (agent) {",
  ...identities.map((agent) => "        ." + agent + " => " + agent + "[pose],"),
  "    };",
  '    const atlas = @embedFile("agent-motion.bin");',
  "    return atlas[range.offset..][0..range.length];",
  "}",
  "",
  ...states.flatMap((state) => [
    "const " + state + " = [_]Frame{",
    ...clips[state].map(({ms, index}) => "    .{ .at_ms = " + ms + ", .pose = " + index + " },"),
    "};",
  ]),
  "",
  ...identities.flatMap((agent) => [
    "const " + agent + " = [_]Range{",
    ...ranges[agent].map(([offset, length]) => "    .{ .offset = " + offset + ", .length = " + length + " },"),
    "};",
  ]),
];
writeFileSync(resolve(output, "agent-motion.bin"), Buffer.concat(chunks));
writeFileSync(resolve(output, "agent-motion-data.zig"), zig.join("\n") + "\n");
console.log(`${poses.length} poses per agent, ${byteOffset} encoded bytes across both agents`);
