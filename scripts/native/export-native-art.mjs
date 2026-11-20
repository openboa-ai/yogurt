import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { default: sharp } = await import(
  process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : "sharp"
);
const output = "packages/native/controls/art";
mkdirSync(output, { recursive: true });
const assets = {
  openboa: "design/assets/logo/upright-9.svg",
  meatball: "design/assets/projects/meatball.svg",
  sourdough: "design/assets/projects/sourdough.svg",
  yogurt: "design/assets/projects/yogurt.svg",
  kai_ready: "design/assets/agents/kai.svg",
  sol_ready: "design/assets/agents/sol.svg",
  kai_working: "design/assets/agents/kai.svg",
  sol_working: "design/assets/agents/sol.svg",
};
const motion = JSON.parse(readFileSync("design/assets/agents/eye-motion.json", "utf8"))
  .states.working.eyeTranslation;
for (const [name, source] of Object.entries(assets)) {
  let svg = readFileSync(source, "utf8");
  if (name.endsWith("_working"))
    svg = svg.replace(
      'id="eyes"',
      'id="eyes" transform="translate(' + motion.join(" ") + ')"',
    );
  await sharp(Buffer.from(svg), { density: 256 })
    .resize(128, 128, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(output + "/" + name + ".png");
}
const zig = [
  "// Generated from the OpenBoa project and agent masters.",
  "pub const Art = enum { " + Object.keys(assets).join(", ") + " };",
  "pub fn bytes(art: Art) []const u8 {",
  "    return switch (art) {",
  ...Object.keys(assets).map(
    (n) => "        ." + n + ' => @embedFile("art/' + n + '.png"),',
  ),
  "    };",
  "}",
  "pub fn register(fx: anytype, id: u64, art: Art) !void {",
  "    _ = try fx.registerImageBytes(id, bytes(art));",
  "}",
];
writeFileSync("packages/native/controls/art.zig", zig.join("\n") + "\n");
