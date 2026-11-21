import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = new URL("../..", import.meta.url);
process.chdir(fileURLToPath(root));
const json = (p) => JSON.parse(readFileSync(p, "utf8"));
const manifest = json("catalog/brand.json"),
  base = json(manifest.sources.primitives),
  ui = json(manifest.sources.roles),
  catalog = json(manifest.sources.components),
  terms = json(manifest.sources.words).terms;
const webTokens = readFileSync("design/styles/ui-tokens.css", "utf8");
const nativeTokens = readFileSync("packages/native/controls/tokens.zig", "utf8");
for (const [name, profile] of Object.entries(ui.motionProfiles ?? {})) {
  assert(Number.isSafeInteger(profile.duration) && profile.duration > 0, name);
  assert(Object.hasOwn(ui.easing, profile.fallback), name);
  assert(Array.isArray(profile.samples) && profile.samples.length >= 2 && profile.samples.every(Number.isFinite), name);
  assert(webTokens.includes(`--yg-motion-${name}: ${profile.duration}ms var(--yg-${profile.fallback});`), name);
  assert(webTokens.includes(`--yg-motion-${name}: ${profile.duration}ms linear(${profile.samples.join(", ")});`), name);
  assert(nativeTokens.includes(`pub const ${name.replaceAll("-", "_")}_ms: u32 = ${profile.duration};`), name);
}
for (const path of [
  ...Object.values(manifest.sources),
  ...["symbol", "lockup", "wordmark"].map((k) => manifest.signature[k]),
])
  assert(existsSync(path), path);
function rgb(key) {
  const [family, step] = key.split(".");
  const hex = base.color[family]?.[step];
  assert.match(hex ?? "", /^#[\da-f]{6}$/i, key);
  return [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
}
function luma(key) {
  const x = rgb(key);
  return 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2];
}
function contrast(a, b) {
  const x = luma(a),
    y = luma(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
let pairs = 0;
for (const over of [{}, ...Object.values(ui.materials)]) {
  const roles = { ...ui.roles, ...over };
  for (const pair of Object.values(roles)) pair.forEach(rgb);
  for (const [fg, bg] of [
    ["text", "canvas"],
    ["text", "field"],
    ["muted", "surface"],
    ["muted", "field"],
    ["on-action", "action"],
    ["on-action", "action-press"],
    ["on-action", "action-hover"],
    ["action", "action-soft"],
    ["danger", "danger-soft"],
    ["success", "success-soft"],
    ["warning", "warning-soft"],
    ["accent", "accent-soft"],
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
      assert(
        contrast(roles[fg][i], roles[bg][i]) >= 4.5,
        [fg, bg, i, roles[fg], roles[bg]].join(" "),
      );
      pairs++;
    }
  }
}
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
  assert.equal(item.native, "unavailable");
  assert(item.guidance.useWhen.trim() && item.guidance.avoid.trim() && item.guidance.verify.length, item.id);
  assert.equal(typeof exportedMotion[item.name], "function", item.id);
  const entry = json("registry/" + item.id + ".json");
  assert.equal(entry.files[0].content, `"use client";\n\nexport { ${item.name} } from "${item.entry}";\n`);
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
  for (const id of [...block.components, ...block.native])
    assert(componentIds.has(id), id);
  const entry = json("registry/" + block.id + ".json");
  assert.equal(entry.type, "registry:block");
  assert.equal(
    entry.files[0].content,
    readFileSync("packages/recipes/" + block.id + "/web.tsx", "utf8"),
  );
  const native = readFileSync("packages/recipes/" + block.id + "/view.native", "utf8");
  assert.deepEqual(
    [...native.matchAll(/<import src="([^"]+)\.native"/g)]
      .map((match) => match[1])
      .sort(),
    [...block.native].sort(),
  );
}
for (const { id, name, exports = [] } of catalog) {
  assert(existsSync("packages/web/dist/entries/" + id + ".js"));
  assert(existsSync("packages/web/dist/entries/" + id + ".d.ts"));
  assert(existsSync("packages/native/controls/items/" + id + ".native"));
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
  readFileSync("packages/web/dist/THIRD-PARTY-NOTICES.txt", "utf8").includes(
    "Copyright 2025 OpenAI",
  ),
);
console.log(
  catalog.length +
    " paired components, " +
    blocks.length +
    " editable blocks, " +
    pairs +
    " appearance/material contrast checks and " +
    terms.length +
    " vocabulary entries passed.",
);
