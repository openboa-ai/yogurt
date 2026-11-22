import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

test("the Native build uses a patched copy and propagates a build failure", t => {
  const root = scratch(t);
  const source = join(root, "sdk");
  const path = join(root, "bin");
  mkdirSync(source);
  mkdirSync(path);
  writeFileSync(join(source, "build.zig"), "");
  writeFileSync(join(path, "git"), '#!/bin/sh\n[ "$1" = apply ] && [ -f "$2" ] && touch patched\n', { mode: 0o755 });
  writeFileSync(join(path, "native"), `#!/bin/sh
if [ "$1" = --version ]; then echo "native 0.11.1"; exit 0; fi
[ -f "$NATIVE_SDK_PATH/patched" ] && [ "$NATIVE_SDK_PATH" != "$ORIGINAL_SDK" ] || exit 90
printf '%s' "$NATIVE_SDK_PATH" > "$FRAMEWORK_RECORD"
exit 17
`, { mode: 0o755 });
  const record = join(root, "framework-used");
  const result = spawnSync(process.execPath, [join(kit, "bin/yogurt.mjs"), "native", "build", root], {
    env: {
      ...process.env, PATH: path + ":" + process.env.PATH,
      NATIVE_SDK_PATH: source, ORIGINAL_SDK: source, FRAMEWORK_RECORD: record,
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 17, result.stderr);
  assert(!existsSync(join(source, "patched")));
  assert(!existsSync(read(record)));
});

test("owned Native builds recover after a killed owner and preserve external edits", { timeout: 15000 }, async t => {
  const root = scratch(t);
  const sdk = join(root, "sdk");
  const tools = join(root, "tools");
  mkdirSync(sdk);
  mkdirSync(tools);
  writeFileSync(join(sdk, "build.zig"), "pub fn build(b: *std.Build) void {}");
  writeFileSync(join(root, "build.zig"), "");
  const manifest = join(root, "build.zig.zon");
  const original = '.{ .dependencies = .{ .native_sdk = .{ .path = "sdk" } } }\n';
  writeFileSync(manifest, original);
  writeFileSync(join(tools, "git"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  writeFileSync(join(tools, "native"), `#!/usr/bin/env node
if (process.argv[2] === "--version") console.log("native 0.11.1");
else if (process.env.STARTED) {
  require("node:fs").writeFileSync(process.env.STARTED, "");
  setInterval(() => {}, 1000);
} else process.exit(Number(process.env.NATIVE_EXIT || 0));
`, { mode: 0o755 });
  const cli = join(kit, "bin/yogurt.mjs");
  const env = { ...process.env, PATH: tools + ":" + process.env.PATH, NATIVE_SDK_PATH: sdk };
  const call = (verb, extra) => spawnSync(process.execPath, [cli, "native", verb, root], {
    env: { ...env, ...extra }, encoding: "utf8",
  });

  assert.equal(call("build", { NATIVE_EXIT: "17" }).status, 17);
  assert.equal(read(manifest), original);
  assert.match(call("build").stderr, /did not load the patched native_sdk/);
  assert.equal(read(manifest), original);

  const started = join(root, "started");
  const owner = spawn(process.execPath, [cli, "native", "build", root], {
    env: { ...env, STARTED: started }, stdio: "ignore",
  });
  t.after(() => owner.kill("SIGTERM"));
  for (let attempt = 0; !existsSync(started) && attempt < 200; attempt++) await delay(20);
  assert(existsSync(started));
  const bound = read(manifest);
  assert.notEqual(bound, original);
  assert.match(call("build").stderr, /already exists|acquired the app lock/);
  assert.match(call("recover").stderr, /still has a running process/);
  const stopped = once(owner, "close");
  owner.kill("SIGKILL");
  await stopped;
  const state = join(root, ".yogurt-native-build");
  assert.equal(read(join(state, "original.zon")), original);
  assert.equal(read(manifest), bound);

  const edited = bound + "// Product edit\n";
  writeFileSync(manifest, edited);
  let attempt;
  for (let i = 0; i < 100; i++) {
    attempt = call("recover");
    if (!attempt.stderr.includes("running process")) break;
    await delay(30);
  }
  assert.match(attempt.stderr, /was changed/);
  assert.equal(read(manifest), edited);
  assert.equal(read(join(state, "original.zon")), original);

  writeFileSync(manifest, bound);
  assert.equal(call("recover").status, 0);
  assert.equal(read(manifest), original);
  assert(!existsSync(state));
});
