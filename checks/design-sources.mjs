import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { generateTokens } from "../scripts/tokens/generate.mjs";
import { dimension } from "../scripts/tokens/dimension.mjs";

const kit = fileURLToPath(new URL("../", import.meta.url));
const read = path => readFileSync(path, "utf8");
const json = path => JSON.parse(read(join(kit, path)));
function scratch(t) {
  const dir = mkdtempSync(join(tmpdir(), "yogurt-source-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("a token edit reaches both renderers and checking never overwrites a stale output", t => {
  generateTokens({ check: true });
  const root = scratch(t);
  const sources = json("catalog/brand.json").sources;
  const template = "packages/native/src/templates/carousel.native.in";
  const control = "packages/native/controls/items/carousel.native";
  const recipe = "packages/recipes/collection-browser/view.native";
  for (const path of ["catalog/brand.json", sources.primitives, sources.roles, "design/styles/tokens.css", "design/styles/ui-tokens.css", "packages/native/controls/tokens.zig", template, control, recipe, recipe + ".in"]) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    copyFileSync(join(kit, path), join(root, path));
  }
  writeFileSync(join(root, sources.components), JSON.stringify([{ id: "carousel" }]));
  writeFileSync(join(root, "catalog/blocks.json"), JSON.stringify([{ id: "collection-browser" }]));
  const ui = json(sources.roles);
  const gap = dimension(json(sources.primitives), ui.geometry, "gap-stack") + 3;
  ui.geometry["gap-stack"] = gap;
  writeFileSync(join(root, sources.roles), JSON.stringify(ui));
  const native = join(root, "packages/native/controls/tokens.zig");
  const before = read(native);
  assert.throws(() => generateTokens({ root, check: true }), /Stale output: .*ui-tokens\.css.*tokens\.zig/);
  assert.equal(read(native), before);
  generateTokens({ root });
  assert(read(join(root, "design/styles/ui-tokens.css")).includes(`--yg-gap-stack: ${gap}px;`));
  assert(read(native).includes(`pub const gap_stack: f32 = ${gap};`));
  assert(read(join(root, control)).includes(`gap="${gap}"`));
  assert(read(join(root, recipe)).includes(`gap="${gap}"`));
  generateTokens({ root, check: true });
  writeFileSync(join(root, template), read(join(root, template)).replace("@{gap-stack}", "21"));
  assert.throws(() => generateTokens({ root, check: true }), /Bind the layout spacing/);
});

test("the Native guide embeds the installed controls and recipes and calls the public typed views", t => {
  const host = scratch(t);
  mkdirSync(join(host, "src"));
  writeFileSync(join(host, "app.json"), "{}");
  writeFileSync(join(host, ".yogurt-guide-host"), "yogurt-native-guide");
  execFileSync(process.execPath, [join(kit, "apps/native-guide/scripts/prepare.mjs"), host]);
  const gallery = read(join(host, "src/gallery-generated.zig"));
  const app = read(join(host, "src/main.zig"));
  const components = json("catalog/components.json");
  const blocks = json("catalog/blocks.json");
  for (const item of [...components, ...blocks]) {
    const template = item.id + ".native";
    const source = item.native ? `packages/recipes/${item.id}/view.native` : `packages/native/controls/items/${template}`;
    if (item.nativeMarkup === false) {
      assert(!existsSync(join(host, "src/yogurt/items", template)), item.id);
    } else {
      assert.equal(read(join(host, "src/yogurt/items", template)), read(join(kit, source)));
      assert(gallery.includes(`@embedFile("yogurt/items/${template}")`), item.id);
    }
    assert(!existsSync(join(host, "src/yogurt-catalog-test", template)), item.id);
    if (item.nativeView) {
      const { module, symbol } = item.nativeView;
      const name = item.id.replaceAll("-", "_");
      assert(gallery.includes(`pub const ${name} = @import("yogurt/${module}").${symbol};`), item.id);
      assert(app.includes(`gallery.Views.${name}(`), item.id);
    }
  }
});

test("the hosted Vite guide composes Yogurt instead of embedding a separate UI", () => {
  const roots = ["apps/guide/vite", "apps/guide/examples"];
  const offlineOnly = /^(?:motion-extra-(?:cards|controls|gestures|utilities)|spring-field)\.tsx$/;
  const files = roots.flatMap(root => readdirSync(join(kit, root), { recursive: true })
    .filter(path => typeof path === "string" && /\.tsx?$/.test(path) && !offlineOnly.test(path))
    .map(path => join(root, path)));
  files.push("apps/guide/agent-family.tsx", "apps/guide/ui-catalog.tsx", "apps/guide/brand-tokens.tsx");
  for (const path of files) {
    const source = read(join(kit, path));
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|\.html\?raw|(?:from|import)\s+["'][^"']*\/runtime\//,
      path + " embeds an offline page");
    assert.doesNotMatch(source, /<(?:button|input|select|textarea|a|details|h[1-6]|p)(?=[\s>])/,
      path + " should use the matching public Yogurt component");
  }
});
