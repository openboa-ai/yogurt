function declarations(group, values, unit = "") {
  return Object.entries(values).map(([name, value]) =>
    `  --boa-${group}-${name}: ${value}${unit};`
  );
}

export function brandCss({ color, type, space, radius, stroke, control }) {
  return [
    "/* Generated from design/tokens/brand.json by scripts/tokens/brand.mjs. */",
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
    ...declarations("tracking", type.tracking, "em"),
    ...declarations("space", space, "px"),
    ...declarations("radius", radius, "px"),
    ...declarations("stroke", stroke, "px"),
    ...declarations("control", control, "px"),
    "}",
    "",
  ].join("\n");
}
