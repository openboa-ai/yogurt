import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateTokens } from "../tokens/generate.mjs";
const root = new URL("../..", import.meta.url);
process.chdir(fileURLToPath(root));
generateTokens({ check: true });
const json = (p) => JSON.parse(readFileSync(p, "utf8"));
const manifest = json("catalog/brand.json"),
  base = json(manifest.sources.primitives),
  ui = json(manifest.sources.roles),
  catalog = json(manifest.sources.components),
  terms = json(manifest.sources.words).terms;
const webTokens = readFileSync("design/styles/ui-tokens.css", "utf8");
const { lineHeightScale, lineHeightRoles, tracking, trackingRoles = {} } = ui.typeMetrics;
assert.equal(lineHeightScale, 1.25);
assert(Number.isFinite(tracking), "tracking must be finite");
assert(webTokens.includes(`--yg-type-tracking: ${tracking}em;`));
for (const [role, [sizeKey, weightKey]] of Object.entries(ui.types)) {
  const size = base.type.size[sizeKey];
  const lineHeightRole = lineHeightRoles[role];
  if (lineHeightRole) assert(Object.hasOwn(base.type.lineHeight, lineHeightRole), role);
  const lineHeight = lineHeightRole ? base.type.lineHeight[lineHeightRole] : size * lineHeightScale;
  const weight = base.type.roleWeight[weightKey] ?? base.type.weight[weightKey];
  const trackingKey = trackingRoles[role] ?? "body";
  assert(Number.isFinite(size) && lineHeight >= size, role);
  assert(["ui", "body", "heading", "value"].includes(weightKey), role);
  assert(Object.hasOwn(base.type.tracking, trackingKey), role);
  assert(webTokens.includes(`--yg-type-${role}-size: ${size / 16}rem;`), role);
  assert(webTokens.includes(`--yg-type-${role}-line: ${lineHeight / 16}rem;`), role);
  assert(webTokens.includes(`--yg-tracking-${role}: var(--boa-tracking-${trackingKey});`), role);
  assert(webTokens.includes(`--yg-font-${role}: ${weight} var(--yg-type-${role}-size)/var(--yg-type-${role}-line) var(--boa-font-family);`), role);
}
for (const [name, profile] of Object.entries(ui.motionProfiles ?? {})) {
  assert(Number.isSafeInteger(profile.duration) && profile.duration > 0, name);
  assert(Object.hasOwn(ui.easing, profile.fallback), name);
  assert(Array.isArray(profile.samples) && profile.samples.length >= 2 && profile.samples.every(Number.isFinite), name);
  assert(webTokens.includes(`--yg-motion-${name}: ${profile.duration}ms var(--yg-${profile.fallback});`), name);
  assert(webTokens.includes(`--yg-motion-${name}: ${profile.duration}ms linear(${profile.samples.join(", ")});`), name);
}
for (const path of [
  ...Object.values(manifest.sources),
  ...["symbol", "lockup", "wordmark"].map((k) => manifest.signature[k]),
])
  assert(existsSync(path), path);
function parseHex(key) {
  const [family, step] = key.split(".");
  const hex = base.color[family]?.[step];
  assert.match(hex ?? "", /^#[\da-f]{6}$/i, key);
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}
function resolveColorSpec(spec) {
  if (typeof spec === "string") {
    const [r, g, b] = parseHex(spec);
    return { r, g, b, alpha: 1 };
  }
  assert(spec && typeof spec === "object" && typeof spec.token === "string" && typeof spec.alpha === "number", String(spec));
  const [r, g, b] = parseHex(spec.token);
  return { r, g, b, alpha: spec.alpha };
}
function srgbChannelToLin(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function lumaFromRgb(r, g, b) {
  return 0.2126 * srgbChannelToLin(r) + 0.7152 * srgbChannelToLin(g) + 0.0722 * srgbChannelToLin(b);
}
function luma(spec) {
  const { r, g, b, alpha } = resolveColorSpec(spec);
  assert.equal(alpha, 1, "expected opaque color for standalone luma");
  return lumaFromRgb(r, g, b);
}
function contrast(fgSpec, bgSpec) {
  const fg = resolveColorSpec(fgSpec);
  const bg = resolveColorSpec(bgSpec);
  assert.equal(bg.alpha, 1, "expected opaque background color");
  const r = fg.r * fg.alpha + bg.r * (1 - fg.alpha);
  const g = fg.g * fg.alpha + bg.g * (1 - fg.alpha);
  const b = fg.b * fg.alpha + bg.b * (1 - fg.alpha);
  const x = lumaFromRgb(r, g, b),
    y = lumaFromRgb(bg.r, bg.g, bg.b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
assert(!Object.hasOwn(base.color, "gray-green"), "legacy gray-green ramp must be removed");
assert(!Object.hasOwn(base.color, "coral"), "legacy coral ramp must be replaced by terracotta");

// 1. Uniform Mathematical Color Grid Guards (ALL 21 families share exact 11 steps)
const EXPECTED_NEUTRAL_FAMILIES = ["neutral", "paper", "mist"];
const EXPECTED_CHROMATIC_FAMILIES = [
  "slate", "blue", "indigo", "violet", "purple", "magenta", "rose", "red",
  "terracotta", "orange", "ochre", "yellow", "lime", "green", "sage", "teal", "cyan", "earth",
];
const EXPECTED_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

assert.deepEqual(
  Object.keys(base.color),
  [...EXPECTED_NEUTRAL_FAMILIES, ...EXPECTED_CHROMATIC_FAMILIES],
  "brand.json color families must match the 3 neutral + 18 chromatic families",
);
for (const family of Object.keys(base.color)) {
  const keys = Object.keys(base.color[family]).sort((a, b) => Number(a) - Number(b));
  assert.deepEqual(keys, EXPECTED_STEPS, `color family ${family} must share exact 11 uniform steps`);
  for (const step of keys) {
    assert(keys.includes(String(1000 - Number(step))), `color family ${family} step ${step} must have palindromic twin ${1000 - Number(step)}`);
  }
}

// 2. Fixed OpenBoa Logo Primary (#175174) & Terracotta Secondary Guards
assert.equal(base.color.slate["700"], "#175174", "OpenBoa logo primary #175174 must live at slate.700");
assert.equal(base.color.terracotta["600"], "#A64F3C", "canonical Light terracotta.600");
assert.equal(base.color.terracotta["300"], "#D88F7D", "canonical Dark terracotta.300");
assert.deepEqual(ui.roles.brand, ["slate.700", "slate.700"], "--yg-brand must lock to slate.700 (#175174) in Light and Dark");
assert.deepEqual(ui.roles.action, ["slate.700", "slate.700"], "--yg-action must lock to slate.700 (#175174) in Light and Dark");
assert.deepEqual(ui.roles["on-brand"], ["neutral.50", "neutral.50"], "--yg-on-brand must be neutral.50 (#FFFFFF) in Light and Dark");
assert.deepEqual(ui.roles["on-action"], ["neutral.50", "neutral.50"], "--yg-on-action must be neutral.50 (#FFFFFF) in Light and Dark");
assert.deepEqual(ui.roles["brand-ink"], ["slate.700", "slate.300"], "--yg-brand-ink must adapt slate.700 / slate.300");
assert.deepEqual(ui.roles["action-ink"], ["slate.700", "slate.300"], "--yg-action-ink must adapt slate.700 / slate.300");
assert.deepEqual(ui.roles["focus-ring"], ["slate.700", "slate.300"], "--yg-focus-ring must adapt slate.700 / slate.300");
assert.deepEqual(ui.roles.accent, ["terracotta.600", "terracotta.300"], "canonical Light/Dark terracotta accent");

// 3. Strict Luminance Monotonicity across ALL 21 families
for (const hue of Object.keys(base.color)) {
  const steps = Object.keys(base.color[hue]).map(Number).sort((a, b) => a - b);
  for (let i = 1; i < steps.length; i++) {
    assert(
      luma(`${hue}.${steps[i]}`) < luma(`${hue}.${steps[i - 1]}`),
      `palette monotonicity failed: ${hue}.${steps[i - 1]} -> ${hue}.${steps[i]}`,
    );
  }
}

// 4. Mathematical Integer Grid Guards for Space, Radius, Control & Typography
assert.deepEqual(
  Object.values(base.space),
  [2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  "space scale must adhere strictly to the 2/4px grid (retiring 14 & 18)",
);
for (const [k, v] of Object.entries(base.space)) {
  assert(Number.isSafeInteger(v) && String(v) === k, `space.${k} must be an integer matching its key`);
}
for (const [k, v] of Object.entries(base.radius)) {
  assert(Number.isSafeInteger(v), `radius.${k} must be an integer`);
  if (k === "round") assert.equal(v, 999, "radius.round must be 999");
  else assert([4, 6, 8, 12, 16, 20].includes(v), `radius.${k} (${v}) must be on the even concentric grid [4, 6, 8, 12, 16, 20]`);
}
for (const [k, v] of Object.entries(base.control)) {
  assert(Number.isSafeInteger(v) && v % 2 === 0, `control.${k} (${v}) must be an even integer`);
  if (k === "glyph") assert.equal(v, 16, "control.glyph must be 16");
  else assert([28, 32, 36, 44].includes(v), `control.${k} (${v}) must be on the 4px control grid [28, 32, 36, 44]`);
}
for (const [k, v] of Object.entries(base.type.size)) {
  assert(Number.isSafeInteger(v), `type.size.${k} (${v}) must be a clean integer`);
}
for (const [k, v] of Object.entries(base.type.lineHeight)) {
  assert(Number.isSafeInteger(v), `type.lineHeight.${k} (${v}) must be a clean integer`);
}

let pairs = 0;
for (const [materialName, over] of [["neutral", {}], ...Object.entries(ui.materials)]) {
  const roles = { ...ui.roles, ...over };
  for (const pair of Object.values(roles)) pair.forEach(resolveColorSpec);
  // Light surface polarity: backdrop < surface <= surface-inspector <= surface-list < canvas == raised == input-surface
  assert(
    luma(roles.backdrop[0]) < luma(roles.surface[0]) &&
      luma(roles.surface[0]) <= luma(roles["surface-inspector"][0]) &&
      luma(roles["surface-inspector"][0]) <= luma(roles["surface-list"][0]) &&
      luma(roles["surface-list"][0]) < luma(roles.canvas[0]) &&
      luma(roles.canvas[0]) === luma(roles.raised[0]) &&
      luma(roles.canvas[0]) === luma(roles["input-surface"][0]) &&
      luma(roles.hover[0]) < luma(roles.field[0]),
    `light surface polarity failed for ${materialName}`,
  );
  // Dark surface polarity: backdrop <= surface <= input-surface <= surface-list <= surface-inspector < raised <= canvas < popover <= field < hover
  assert(
    luma(roles.backdrop[1]) <= luma(roles.surface[1]) &&
      luma(roles.surface[1]) <= luma(roles["input-surface"][1]) &&
      luma(roles["input-surface"][1]) <= luma(roles["surface-list"][1]) &&
      luma(roles["surface-list"][1]) <= luma(roles["surface-inspector"][1]) &&
      luma(roles["surface-inspector"][1]) < luma(roles.raised[1]) &&
      luma(roles.raised[1]) <= luma(roles.canvas[1]) &&
      luma(roles.canvas[1]) < luma(roles.popover[1]) &&
      luma(roles.popover[1]) <= luma(roles.field[1]) &&
      luma(roles.field[1]) < luma(roles.hover[1]),
    `dark surface polarity failed for ${materialName}`,
  );
  for (const [fg, bg] of [
    ["text", "backdrop"],
    ["text", "canvas"],
    ["text", "surface"],
    ["text", "surface-inspector"],
    ["text", "surface-list"],
    ["text", "raised"],
    ["text", "input-surface"],
    ["text", "elevated"],
    ["text", "field"],
    ["text", "hover"],
    ["text", "popover"],
    ["muted", "backdrop"],
    ["muted", "canvas"],
    ["muted", "surface"],
    ["muted", "surface-inspector"],
    ["muted", "surface-list"],
    ["muted", "raised"],
    ["muted", "input-surface"],
    ["muted", "elevated"],
    ["muted", "field"],
    ["muted", "hover"],
    ["text-subtle", "surface"],
    ["text-subtle", "surface-inspector"],
    ["text-subtle", "surface-list"],
    ["text-subtle", "canvas"],
    ["text-subtle", "raised"],
    ["text-subtle", "input-surface"],
    ["text-subtle", "field"],
    ["on-inverse", "inverse"],
    ["on-inverse", "inverse-hover"],
    ["on-inverse", "inverse-press"],
    ["on-brand", "brand"],
    ["on-brand", "brand-press"],
    ["on-brand", "brand-hover"],
    ["brand-ink", "brand-soft"],
    ["brand-ink", "canvas"],
    ["brand-ink", "surface"],
    ["brand-ink", "raised"],
    ["brand-ink", "input-surface"],
    ["brand-ink", "field"],
    ["on-action", "action"],
    ["on-action", "action-press"],
    ["on-action", "action-hover"],
    ["action-ink", "action-soft"],
    ["action-ink", "canvas"],
    ["action-ink", "surface"],
    ["action-ink", "raised"],
    ["action-ink", "field"],
    ["on-accent", "accent"],
    ["on-accent", "accent-hover"],
    ["on-accent", "accent-press"],
    ["accent", "accent-soft"],
    ["accent", "canvas"],
    ["accent", "surface"],
    ["accent", "raised"],
    ["accent", "field"],
    ["on-danger", "danger"],
    ["on-danger", "danger-hover"],
    ["on-danger", "danger-press"],
    ["danger", "danger-soft"],
    ["danger", "canvas"],
    ["danger", "surface"],
    ["danger", "raised"],
    ["danger", "field"],
    ["on-success", "success"],
    ["success", "success-soft"],
    ["success", "canvas"],
    ["success", "surface"],
    ["success", "raised"],
    ["on-warning", "warning"],
    ["warning", "warning-soft"],
    ["warning", "canvas"],
    ["warning", "surface"],
    ["warning", "raised"],
    ["on-signal-positive", "signal-positive"],
    ["signal-positive", "signal-positive-soft"],
    ["signal-warning", "canvas"],
    ["signal-warning", "surface"],
    ["signal-warning", "field"],
    ["signal-limit", "canvas"],
    ["signal-limit", "surface"],
    ["signal-limit", "field"],
    ["signal-rating", "surface"],
  ]) {
    for (let i = 0; i < 2; i++) {
      const ratio = contrast(roles[fg][i], roles[bg][i]);
      assert(
        ratio >= 4.5,
        [materialName, fg, bg, i, ratio.toFixed(2), JSON.stringify(roles[fg]), JSON.stringify(roles[bg])].join(" "),
      );
      pairs++;
    }
  }
  for (const [fg, bg] of [
    ["border-control", "surface"],
    ["border-control", "surface-inspector"],
    ["border-control", "surface-list"],
    ["border-control", "canvas"],
    ["border-control", "raised"],
    ["border-control", "input-surface"],
    ["border-control", "field"],
    ["border-indicator", "backdrop"],
    ["border-indicator", "canvas"],
    ["border-indicator", "raised"],
    ["border-indicator", "surface"],
    ["border-indicator", "input-surface"],
    ["border-indicator", "field"],
    ["border-indicator", "hover"],
    ["border-strong", "backdrop"],
    ["border-strong", "canvas"],
    ["border-strong", "raised"],
    ["border-strong", "surface"],
    ["border-strong", "input-surface"],
    ["border-strong", "field"],
    ["border-strong", "hover"],
    ["focus-ring", "canvas"],
    ["focus-ring", "raised"],
    ["focus-ring", "surface"],
    ["focus-ring", "input-surface"],
    ["focus-ring", "field"],
    ["off", "canvas"],
    ["off", "raised"],
    ["thumb", "off"],
  ]) {
    for (let i = 0; i < 2; i++) {
      const ratio = contrast(roles[fg][i], roles[bg][i]);
      assert(
        ratio >= 3,
        ["non-text", materialName, fg, bg, i, ratio.toFixed(2), JSON.stringify(roles[fg]), JSON.stringify(roles[bg])].join(" "),
      );
      pairs++;
    }
  }
}
// Design stylesheets: 100% @layer encapsulation, 0 gradients, 0 dead or undefined --boa-* tokens
const styleFiles = readdirSync("design/styles").filter((f) => f.endsWith(".css"));
const definedBoaVars = new Set();
const styleContents = styleFiles.map((file) => {
  const css = readFileSync("design/styles/" + file, "utf8");
  for (const m of css.matchAll(/(--boa-[a-z0-9-]+)\s*:/gi)) definedBoaVars.add(m[1]);
  return [file, css];
});
for (const [file, css] of styleContents) {
  assert(css.includes("@layer"), `design/styles/${file} must declare @layer`);
  assert(!/(?:linear|radial|conic)-gradient\s*\(/i.test(css), `design/styles/${file} must not use CSS gradients`);
  assert(!/(?:gray-green|--boa-field|--boa-ink|#f2f2ed|--radix-popper)/i.test(css), `design/styles/${file} contains removed legacy token`);
  assert(!/border-radius:\s*(?:4\.5|5|5\.5|7|9|10|11|14|22|26)px/i.test(css), `design/styles/${file} contains off-scale border-radius`);
  for (const m of css.matchAll(/var\(\s*(--boa-[a-z0-9-]+)\b/gi)) {
    assert(definedBoaVars.has(m[1]), `design/styles/${file} references undefined token ${m[1]}`);
  }
}
assert(
  !readFileSync("design/styles/ui.css", "utf8").includes('.yg-button[data-tone="accent"]'),
  "Button must not expose Terracotta accent filled tone",
);
assert.equal(new Set(terms.map((t) => t.id)).size, terms.length);
assert.equal(new Set(catalog.map((e) => e.id)).size, catalog.length);
const componentIds = new Set(catalog.map((entry) => entry.id));
for (const entry of catalog) {
  if (!entry.guidance) continue;
  const { useWhen, combineWith, avoid, verify } = entry.guidance;
  assert(typeof useWhen === "string" && useWhen.trim(), entry.id);
  assert(typeof avoid === "string" && avoid.trim(), entry.id);
  assert(Array.isArray(combineWith) && combineWith.every(id => componentIds.has(id) && id !== entry.id), entry.id);
  assert(Array.isArray(verify) && verify.length > 0 && verify.every(state => typeof state === "string" && state.trim()), entry.id);
}
const blocks = json("catalog/blocks.json");
const motion = json("catalog/motion.json");
const motionComponents = json("catalog/motion-components.json");
assert.equal(motionComponents.formatVersion, 1);
const motionIds = new Set([...componentIds, ...blocks.map(item => item.id), ...json("catalog/patterns.json").patterns.map(item => item.id)]);
const exportedMotion = await import(new URL("packages/web/dist/motion-patterns.js", root).href);
const exportNames = Object.keys(exportedMotion).sort();
assert.deepEqual(motionComponents.components.map(item => item.name).sort(), exportNames);
for (const item of motionComponents.components) {
  assert.match(item.id, /^motion-[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(!motionIds.has(item.id), item.id);
  motionIds.add(item.id);
  assert.equal(item.entry, "@openboa/yogurt/motion-patterns");
  assert.equal(item.web, "available");
  assert(item.guidance.useWhen.trim() && item.guidance.avoid.trim() && item.guidance.verify.length, item.id);
  assert.equal(typeof exportedMotion[item.name], "function", item.id);
  const individual = await import("@openboa/yogurt/" + item.id);
  assert.equal(individual[item.name], exportedMotion[item.name], item.id);
  const entry = json("registry/" + item.id + ".json");
  assert.equal(entry.files[0].content, `"use client";\n\nexport { ${item.name} } from "@openboa/yogurt/${item.id}";\n`);
}
assert.deepEqual(
  motion.map(({ id }) => id),
  [...catalog, ...blocks].map(({ id }) => id),
);
const motionRoles = new Set(["Still", "Press", "Field", "Selection", "Layer", "Direct", "Outcome", "Presence", "Composition"]);
for (const entry of motion) {
  assert(entry.treatment.trim().length > 0, entry.id);
  assert(motionRoles.has(entry.role), entry.id);
  assert.deepEqual(Object.keys(entry).sort(), ["id", "role", "treatment"]);
}
for (const block of blocks) {
  assert(!componentIds.has(block.id), block.id);
  for (const id of [...block.components])
    assert(componentIds.has(id), id);
  const entry = json("registry/" + block.id + ".json");
  assert.equal(entry.type, "registry:block");
  assert.equal(
    entry.files[0].content,
    readFileSync("packages/recipes/" + block.id + "/web.tsx", "utf8"),
  );
}
for (const { id, name, exports = [] } of catalog) {
  assert(existsSync("packages/web/dist/entries/" + id + ".js"));
  assert(existsSync("packages/web/dist/entries/" + id + ".d.ts"));
  assert(
    json("registry/" + id + ".json").files[0].content.includes(
      "@openboa/yogurt/" + id,
    ),
  );
  const entry = await import(new URL("packages/web/dist/entries/" + id + ".js", root).href);
  for (const symbol of [name, ...exports])
    assert.equal(typeof entry[symbol], "function", id + " / " + symbol);
}
assert(
  !readFileSync("packages/web/src/controls/feedback.tsx", "utf8").includes(
    "@openai/apps-sdk-ui",
  ),
  "Badge must not depend on @openai/apps-sdk-ui",
);
assert(
  !readFileSync("packages/web/dist/THIRD-PARTY-NOTICES.txt", "utf8").includes(
    "@openai/apps-sdk-ui",
  ),
  "Built bundle must not include @openai/apps-sdk-ui",
);
console.log(
  catalog.length +
    " React components, " +
    blocks.length +
    " editable blocks, " +
    pairs +
    " appearance/material contrast checks and " +
    terms.length +
    " vocabulary entries passed.",
);
