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
const blocks = json("catalog/blocks.json");
const motion = json("catalog/motion.json");
assert.deepEqual(
  motion.map(({ id }) => id),
  [...catalog, ...blocks].map(({ id }) => id),
);
for (const entry of motion) {
  assert(entry.treatment.trim().length > 0, entry.id);
  assert.deepEqual(Object.keys(entry).sort(), ["id", "treatment"]);
}
for (const block of blocks) {
  assert(!componentIds.has(block.id), block.id);
  for (const id of [...block.components, ...block.native])
    assert(componentIds.has(id), id);
  const entry = json("registry/" + block.id + ".json");
  assert.equal(entry.type, "registry:block");
  assert.equal(
    entry.files[0].content,
    readFileSync("blocks/" + block.id + "/web.tsx", "utf8"),
  );
  const native = readFileSync("blocks/" + block.id + "/view.native", "utf8");
  assert.deepEqual(
    [...native.matchAll(/<import src="([^"]+)\.native"/g)]
      .map((match) => match[1])
      .sort(),
    [...block.native].sort(),
  );
}
for (const { id, name, exports = [] } of catalog) {
  assert(existsSync("dist/entries/" + id + ".js"));
  assert(existsSync("dist/entries/" + id + ".d.ts"));
  assert(existsSync("packages/native/controls/items/" + id + ".native"));
  assert(
    json("registry/" + id + ".json").files[0].content.includes(
      "@openboa/yogurt/" + id,
    ),
  );
  const entry = await import(new URL("dist/entries/" + id + ".js", root).href);
  for (const symbol of [name, ...exports])
    assert.equal(typeof entry[symbol], "function", id + " / " + symbol);
}
assert(
  readFileSync("dist/THIRD-PARTY-NOTICES.txt", "utf8").includes(
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
