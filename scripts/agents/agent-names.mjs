import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));

export function generateAgentNames({ check = false } = {}) {
  const { shapes } = read("design/assets/agents/silhouettes.json");
  const { colors } = read("design/assets/agents/animation-fits.json");
  const unmatched = new Set(shapes.flatMap(({ file, positions }) =>
    positions.flatMap(position => colors.map(color => `${file.replace(/\.svg$/, "")}-${position}/${color}`))));
  const identities = read("design/content/agent-names.json");
  const usedNames = new Set(["kai", "sol"]);
  for (const { name, variant, color } of identities) {
    if (!/^[A-Z][a-z]{2,4}$/.test(name) || usedNames.has(name.toLowerCase())) {
      throw new Error(`Invalid or repeated agent name: ${name}`);
    }
    if (!unmatched.delete(`${variant}/${color}`)) {
      throw new Error(`Unknown or repeated avatar combination: ${variant}/${color}`);
    }
    usedNames.add(name.toLowerCase());
  }
  if (unmatched.size || identities.length < 1170) {
    throw new Error(`Missing avatar combinations: ${[...unmatched].join(", ")}`);
  }

  const content = [
    "// Generated from design/content/agent-names.json.",
    "pub const Identity = struct { name: []const u8, variant: []const u8, color: []const u8 };",
    "pub const identities = [_]Identity{",
    ...identities.map(({ name, variant, color }) =>
      `    .{ .name = "${name}", .variant = "${variant}", .color = "${color}" },`),
    "};",
    "",
  ].join("\n");
  const file = new URL("packages/native/controls/agent-names.zig", root);
  if (check) {
    if (readFileSync(file, "utf8") !== content) throw new Error("Stale Native agent name table.");
  } else {
    writeFileSync(file, content);
  }
}
