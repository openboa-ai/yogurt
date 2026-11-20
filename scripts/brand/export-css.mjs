import { readFile, writeFile } from "node:fs/promises";

const source = new URL("../../design/tokens/brand.json", import.meta.url);
const destination = new URL("../../design/styles/tokens.css", import.meta.url);
const { color, type, space, radius, stroke, control } = JSON.parse(await readFile(source, "utf8"));

function declarations(group, values, unit = "") {
  return Object.entries(values).map(([name, value]) =>
    `  --boa-${group}-${name}: ${value}${unit};`
  );
}

const stylesheet = [
  "/* Generated from design/tokens/brand.json by scripts/brand/export-css.mjs. */",
  ":root {",
  `  --boa-palette-hues: ${Object.keys(color).join(" ")};`,
  `  --boa-spacing-steps: ${Object.keys(space).join(" ")};`,
  `  --boa-palette-steps: ${[...new Set(Object.values(color).flatMap(Object.keys))].map(Number).sort((a, b) => a - b).join(" ")};`,
  ...Object.entries(color).flatMap(([hue, steps]) => declarations(`color-${hue}`, steps)),
  `  --boa-font-family: ${JSON.stringify(type.family)}, system-ui, sans-serif;`,
  ...declarations("weight", type.weight),
  ...declarations("role-weight", type.roleWeight),
  ...declarations("size", type.size, "px"),
  ...declarations("line-height", type.lineHeight, "px"),
  ...declarations("space", space, "px"),
  ...declarations("radius", radius, "px"),
  ...declarations("stroke", stroke, "px"),
  ...declarations("control", control, "px"),
  "}",
  "",
].join("\n");

await writeFile(destination, stylesheet);
