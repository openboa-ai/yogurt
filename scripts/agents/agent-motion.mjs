import { readFileSync, writeFileSync } from "node:fs";

const states = JSON.parse(readFileSync("assets/agents/presence-motion.json", "utf8"));
const labels = Object.fromEntries(
  Object.entries(states).map(([state, motion]) => [state, motion.label]),
);
const loops = Object.keys(states).filter((state) => states[state].repeat);
writeFileSync(
  "packages/web/src/identity/agent-motion-data.ts",
  "// Generated from assets/agents/presence-motion.json.\n" +
    "export const agentPresenceLabels = " + JSON.stringify(labels, null, 2) + " as const;\n" +
    "export const loopingGazes = " + JSON.stringify(loops) + " as const;\n",
);
const rules = [
  "/* Generated from assets/agents/presence-motion.json. */",
  ".yg-eye { transform-box: fill-box; transform-origin: center; }",
];
function writeTrack(selector, track, {durationMs, repeat, frames}, transform) {
  rules.push(
    selector + " {",
    "  animation: " + track + " " + durationMs + "ms var(--yg-settle, ease-out) " +
      (repeat ? "infinite" : "both") + ";",
    "}",
    "@keyframes " + track + " {",
    ...frames.map((pose) => "  " + pose[0] + "% { transform: " + transform(pose) + "; }"),
    "}",
  );
}
for (const [state, motion] of Object.entries(states)) {
  if (!motion.durationMs) continue;
  const eyes = '.yg-eyes[data-gaze="' + state + '"]:where(:not([data-static]))';
  writeTrack(eyes, "yg-gaze-" + state, motion, ([, x, y]) => "translate(" + x + "px, " + y + "px)");
  for (const [name, child, index] of [["left", "first", 3], ["right", "last", 4]]) {
    writeTrack(eyes + " > .yg-eye:where(:" + child + "-child)", "yg-lid-" + state + "-" + name, motion,
      (pose) => "scale(" + pose[5] + ", " + pose[index] + ")");
  }
}
rules.push(
  ".yg-eyes[data-offscreen], .yg-eyes[data-offscreen] > .yg-eye { animation-play-state: paused; }",
  ".yg-message .yg-eyes[data-gaze], .yg-message .yg-eyes[data-gaze] > .yg-eye { animation: none; }",
  "@media (prefers-reduced-motion: reduce) {",
  "  .yg-eyes[data-gaze], .yg-eyes[data-gaze] > .yg-eye { animation: none; }",
  "}",
);
writeFileSync("styles/ui-agent-motion.css", rules.join("\n") + "\n");
