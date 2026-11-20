import { readFileSync, writeFileSync } from "node:fs";

const read = (name) => readFileSync(name, "utf8");
const { clips, compact, expressions, eyeMarks, rosterMax, transitionMs, easing } = JSON.parse(read("design/assets/agents/avatar-motion.json"));
const states = Object.keys(JSON.parse(read("design/assets/agents/presence-motion.json")));
if (states.some((state) => !clips[state]) || Object.keys(clips).length !== states.length ||
    easing.join(",") !== "0.333333,0,0.666667,1") {
  throw Error("Expected all avatar states and the shared smoothstep curve");
}
const agents = {
  kai: { detail: 1, roster: 0.80 },
  sol: { detail: 0.86, roster: 0.73 },
};
const round = (value) => Number(value.toFixed(5));

function transformPose([, lookX, lookY, leftLid, rightLid, eyeWidth, turn, roll, weight, stretch, travel = 0], gain, { sideways = 1, vertical = 1 }, yawSquash) {
  const yaw = turn * gain;
  const depth = Math.abs(yaw);
  const faceX = gain * lookX + 6.4 * yaw;
  const faceY = gain * lookY;
  return [
    [(3.2 * yaw + gain * travel) * sideways, gain * weight * vertical, gain * roll, 1 - yawSquash * depth, 1 + gain * (stretch - 1)],
    [faceX + 3.4 * depth, faceY - 1.6 * yaw, 2.8 * yaw, eyeWidth * (1 + 0.29 * yaw), leftLid],
    [faceX - 3.4 * depth, faceY + 1.6 * yaw, 2.8 * yaw, eyeWidth * (1 - 0.29 * yaw), rightLid],
  ].map((transform) => transform.map(round));
}

function expressionFrames(state, frames, eyeScale) {
  const expression = expressions[state];
  if (!expression) return frames;
  const { rest, keys, follow, initial = 0 } = expression;
  const authored = new Set(frames.map(([time]) => time));
  if (rest.length !== 2 || rest.some(values => values.length !== 5 || !values.every(Number.isFinite) ||
      values[3] < 0 || values[4] < 0) ||
      keys.some(([time, blend, ...rise], index) => !authored.has(time) || blend < 0 || blend > 1 ||
        (index > 0 && time <= keys[index - 1][0]) || !rise.every(Number.isFinite))) {
    throw Error("Invalid face expression for " + state);
  }

  let next = 0;
  const points = [[0, initial], ...keys];
  return frames.map(([time, [body, left, right]]) => {
    while (next + 1 < points.length && points[next + 1][0] <= time) next += 1;
    const [start, from, ...rise] = points[next];
    const end = points[next + 1];
    const t = end ? (time - start) / (end[0] - start) : 0;
    const amount = from + ((end?.[1] ?? from) - from) * t;
    const eyes = [left, right].map((eye, index) => {
      const [x, y, turn, width, height] = rest[index];
      const lift = (rise[index] ?? 0) + ((end?.[2 + index] ?? 0) - (rise[index] ?? 0)) * t;
      const target = follow
        ? [x + eye[0], y + eye[1], turn + eye[2], width * eye[3], height * eye[4]]
        : [x, y + lift, turn, width, height];
      return target.map((value, field) => {
        const mixed = eye[field] + (value - eye[field]) * amount;
        return round(field >= 3 ? mixed * eyeScale[field - 3] : mixed);
      });
    });
    return [time, [body, ...eyes]];
  });
}

const output = {};
for (const [agent, gains] of Object.entries(agents)) {
  output[agent] = {};
  for (const [size, gain] of Object.entries(gains)) {
    output[agent][size] = Object.fromEntries(states.map((state) => {
      const { duration, loop, poses, stillAt, mark = "round", markAt = 0, yawSquash = 0.13 } = clips[state];
      if (!Number.isInteger(duration) || duration <= transitionMs || typeof loop !== "boolean" ||
          !Number.isFinite(yawSquash) || yawSquash < 0 || yawSquash >= 1 ||
          poses[0][0] !== 0 || poses.at(-1)[0] !== duration ||
          poses.some((pose, index) => (pose.length !== 10 && pose.length !== 11) || !pose.every(Number.isFinite) ||
            (index > 0 && pose[0] <= poses[index - 1][0]) ||
            pose[3] < 0 || pose[4] < 0 || pose[5] <= 0 || Math.abs(pose[6]) > 1 || pose[9] <= 0)) throw Error("Invalid avatar poses for " + state);
      const fit = size === "roster" ? compact[state] ?? {} : {};
      const base = poses.map((pose) => [pose[0], transformPose(pose, gain, fit, yawSquash)]);
      const frames = expressionFrames(state, base, fit.eyes ?? [1, 1]);
      const still = frames.findIndex(([time]) => time === stillAt);
      if (still < 0) throw Error("Missing authored still for " + state);
      const markIndex = frames.findIndex(([time]) => time === markAt);
      if (mark !== "round" && (!Object.hasOwn(eyeMarks, mark) || loop || markIndex < 1 ||
          markAt < transitionMs || still < markIndex ||
          JSON.stringify(frames[markIndex - 1][1]) === JSON.stringify(frames[markIndex][1]))) {
        throw Error("Invalid eye shape change for " + state);
      }
      for (const [time, [, left, right]] of frames) {
        const centerDistance = 26 + right[0] - left[0];
        const combinedRadius = 2.45 * (Math.max(left[3], left[4]) + Math.max(right[3], right[4]));
        if (centerDistance <= combinedRadius) throw Error(`Overlapping eyes in ${state} at ${time} ms`);
      }
      if (loop && JSON.stringify(frames[0][1]) !== JSON.stringify(frames.at(-1)[1]))
        throw Error("Avatar loop seam differs for " + state);
      return [state, { duration, loop, still, mark, markAt, frames }];
    }));
  }
}

const trackLines = ["export const tracks = {"];
for (const [agent, sizes] of Object.entries(output)) {
  trackLines.push("  " + agent + ": {");
  for (const [size, records] of Object.entries(sizes)) {
    trackLines.push("    " + size + ": {");
    for (const [state, { duration, loop, still, mark, markAt, frames }] of Object.entries(records)) {
      trackLines.push("      " + state + ": { duration: " + duration + ", loop: " + loop + ", still: " + still + ", mark: " + JSON.stringify(mark) + ", markAt: " + markAt + ", frames: [");
      for (const frame of frames) trackLines.push("        " + JSON.stringify(frame) + ",");
      trackLines.push("      ] },");
    }
    trackLines.push("    },");
  }
  trackLines.push("  },");
}
trackLines.push("} as const;");

const pathVerbs = { M: ["move_to", 2], L: ["line_to", 2], Q: ["quad_to", 4], Z: ["close", 0] };
for (const [name, commands] of Object.entries(eyeMarks)) {
  if (commands[0]?.[0] !== "M" || commands.at(-1)?.[0] !== "Z" ||
      commands.some(([verb, ...points]) => !Object.hasOwn(pathVerbs, verb) ||
        points.length !== pathVerbs[verb][1] || points.some(value => !Number.isFinite(value) || Math.abs(value) > 1))) {
    throw Error("Invalid outline for " + name);
  }
}
const svgMarks = Object.fromEntries(Object.entries(eyeMarks).map(([name, commands]) =>
  [name, commands.map(([verb, ...points]) => verb + points.join(" ")).join(" ")]));
const types = [
  "// Generated from design/assets/agents/avatar-motion.json. See scripts/agents/avatar-motion.mjs.",
  "export type Transform = readonly [number, number, number, number, number];",
  "export type Pose = readonly [Transform, Transform, Transform];",
  "export const eyeMarks = " + JSON.stringify(svgMarks, null, 2) + " as const;",
  'export type EyeMark = "round" | keyof typeof eyeMarks;',
  "export type MotionClip = { duration: number; loop: boolean; still: number; mark: EyeMark; markAt: number; frames: ReadonlyArray<readonly [number, Pose]> };",
  "export const rosterMax = " + rosterMax + ";",
  "export const transitionMs = " + transitionMs + ";",
  "export const easing = " + JSON.stringify("cubic-bezier(" + easing.join(",") + ")") + ";",
  ...trackLines,
];
writeFileSync("packages/web/src/identity/avatar-pose-data.ts", types.join("\n") + "\n");

const colors = (value) => [0, 2, 4].map((index) => parseInt(value.slice(1 + index, 3 + index), 16)).join(", ");
const zig = [
  "// Generated from the original SVG masters and avatar-motion.json.",
  'const canvas = @import("native_sdk").canvas;',
  "pub const Agent = enum { " + Object.keys(agents).join(", ") + " };",
  "pub const EyeMark = enum { round, " + Object.keys(eyeMarks).join(", ") + " };",
  "pub const State = enum { " + states.join(", ") + " };",
  "pub const roster_max: f32 = " + rosterMax + ";",
  "pub const transition_ms: u64 = " + transitionMs + ";",
  "pub const Transform = [5]f32;",
  "pub const Pose = [3]Transform;",
  "pub const Frame = struct { at: u32, pose: Pose };",
  "pub const Clip = struct { duration: u32, loop: bool, still: usize, mark: EyeMark, mark_at: u32, frames: []const Frame };",
  "pub const Art = struct { path: []const canvas.PathElement, fill: canvas.Color, ink: canvas.Color, center_x: f32, center_y: f32 };",
  "",
  "pub fn get(agent: Agent, roster: bool, state: State) Clip {",
  "    const table = switch (agent) {",
  ...Object.keys(agents).map((agent) => "        ." + agent + " => if (roster) &" + agent + "_roster else &" + agent + "_detail,"),
  "    };",
  "    return table[@intFromEnum(state)];",
  "}",
  "",
  "pub fn art(agent: Agent) Art {",
  "    return switch (agent) {",
];

const paths = [];
for (const agent of Object.keys(agents)) {
  const master = read("design/assets/agents/" + agent + ".svg");
  const [, id, fill] = master.match(/<use href="#([^"]+)" fill="([^"]+)"/);
  const [, path] = master.match(new RegExp('<path id="' + id + '" d="([^"]+)"'));
  const [, ink, cx, cy] = master.match(/<g id="eyes" fill="([^"]+)">\s*<circle cx="([^"]+)" cy="([^"]+)"/);
  const words = [...path.matchAll(/([ML])(-?[\d.]+)\s+(-?[\d.]+)|Z/g)];
  if (words.map((match) => match[0]).join("") !== path) throw Error("Unsupported outline format for " + agent);
  zig.push("        ." + agent + " => .{ .path = &" + agent + "_outline, .fill = canvas.Color.rgb8(" +
    colors(fill) + "), .ink = canvas.Color.rgb8(" + colors(ink) + "), .center_x = " + (Number(cx) + 13) +
    ", .center_y = " + cy + " },");
  paths.push("const " + agent + "_outline = [_]canvas.PathElement{");
  for (const [, verb, x, y] of words) {
    paths.push(verb
      ? "    .{ .verb = ." + (verb === "M" ? "move_to" : "line_to") +
        ", .points = .{ .{ .x = " + x + ", .y = " + y + " }, .{}, .{} } },"
      : "    .{ .verb = .close },");
  }
  paths.push("};");
}
zig.push("    };", "}", "", ...paths);
for (const [name, commands] of Object.entries(eyeMarks)) {
  zig.push("", "pub const eye_" + name + " = [_]canvas.PathElement{");
  for (const [verb, ...points] of commands) {
    const pair = offset => points.length > offset
      ? ".{ .x = " + points[offset] + ", .y = " + points[offset + 1] + " }"
      : ".{}";
    zig.push("    .{ .verb = ." + pathVerbs[verb][0] +
      (points.length ? ", .points = .{ " + [0, 2, 4].map(pair).join(", ") + " }" : "") + " },");
  }
  zig.push("};");
}
const zigPose = (pose) => ".{ " + pose.map(transform => ".{ " + transform.join(", ") + " }").join(", ") + " }";

for (const [agent, sizes] of Object.entries(output)) {
  for (const [size, records] of Object.entries(sizes)) {
    zig.push("", "const " + agent + "_" + size + " = [_]Clip{");
    for (const [state, { duration, loop, still, mark, markAt, frames }] of Object.entries(records)) {
      zig.push("    // " + state, "    .{ .duration = " + duration + ", .loop = " + loop + ", .still = " + still + ", .mark = ." + mark + ", .mark_at = " + markAt + ", .frames = &.{");
      for (const [at, pose] of frames) {
        zig.push("        .{ .at = " + at + ", .pose = " + zigPose(pose) + " },");
      }
      zig.push("    } },");
    }
    zig.push("};");
  }
}
writeFileSync("packages/native/controls/models/avatar-pose-data.zig", zig.join("\n") + "\n");
