function webTokens(ui, types, palette) {
  const { lineHeightScale, tracking } = ui.typeMetrics;
  const variable = (p) => "var(--boa-color-" + p.replace(".", "-") + ")";
  function roleRules(roles) {
    return Object.entries(roles).map(([key, pair]) => {
      pair.forEach(palette);
      return (
        "  --yg-" + key + ": light-dark(" + pair.map(variable).join(", ") + ");"
      );
    });
  }
  const css = [
    "/* Generated from design/tokens/brand.json and design/tokens/ui.json. */",
    ".yg-root {",
    ...roleRules(ui.roles),
  ];
  for (const [k, v] of Object.entries(ui.geometry))
    css.push(
      "  --yg-" +
        k +
        ": " +
        (typeof v === "number"
          ? v + "px"
          : "var(--boa-" + v.replace(".", "-") + ")") +
        ";",
    );
  for (const [k, v] of Object.entries(ui.opacity))
    css.push(`  --yg-${k}: ${v}%;`);
  for (const [k, v] of Object.entries(ui.motion))
    css.push("  --yg-" + k + ": " + v + "ms;");
  for (const [role, curve] of Object.entries(ui.easing))
    css.push("  --yg-" + role + ": " + curve + ";");
  for (const [role, profile] of Object.entries(ui.motionProfiles ?? {})) {
    if (!Number.isSafeInteger(profile.duration) || profile.duration <= 0 ||
        !Object.hasOwn(ui.easing, profile.fallback) || !Array.isArray(profile.samples) ||
        profile.samples.length < 2 || profile.samples.some(value => !Number.isFinite(value))) {
      throw Error("Invalid motion profile " + role);
    }
    css.push(`  --yg-motion-${role}: ${profile.duration}ms var(--yg-${profile.fallback});`);
  }
  for (const [name, layers] of Object.entries(ui.elevation)) {
    const shadows = layers.map(([y, blur, opacity]) =>
      "0 " + y + "px " + blur + "px color-mix(in srgb, " +
        variable("neutral.1000") + " " + opacity + "%, transparent)"
    );
    css.push("  --yg-" + name + "-shadow: " + shadows.join(", ") + ";");
  }
  css.push(`  --yg-type-leading: ${lineHeightScale};`, `  --yg-type-tracking: ${tracking}em;`);
  for (const { role, size, lineHeight, weight } of types) {
    css.push(
      `  --yg-type-${role}-size: ${size / 16}rem;`,
      `  --yg-type-${role}-line: ${lineHeight / 16}rem;`,
      `  --yg-font-${role}: ${weight} var(--yg-type-${role}-size)/var(--yg-type-${role}-line) var(--boa-font-family);`,
    );
  }
  css.push("}");
  css.push("@supports (animation-timing-function: linear(0, 1)) {", "  .yg-root {");
  for (const [role, profile] of Object.entries(ui.motionProfiles ?? {}))
    css.push(`    --yg-motion-${role}: ${profile.duration}ms linear(${profile.samples.join(", ")});`);
  css.push("  }", "}");
  for (const [m, roles] of Object.entries(ui.materials))
    css.push('.yg-root[data-material="' + m + '"] {', ...roleRules(roles), "}");
  return css.join("\n") + "\n";
}

export function uiTokens(brand, ui) {
  const find = (obj, path) =>
    path.split(".").reduce((value, key) => value?.[key], obj);
  function palette(path) {
    const color = find(brand.color, path);
    if (!color) throw Error("Unknown palette reference " + path);
    return color;
  }
  const { lineHeightScale, lineHeightRoles } = ui.typeMetrics;
  const types = Object.entries(ui.types).map(([role, [sizeKey, weightKey]]) => ({
    role,
    size: brand.type.size[sizeKey],
    lineHeight: brand.type.lineHeight[lineHeightRoles[role]] ?? brand.type.size[sizeKey] * lineHeightScale,
    weight: brand.type.weight[weightKey] ?? brand.type.roleWeight[weightKey],
  }));
  return webTokens(ui, types, palette);
}
