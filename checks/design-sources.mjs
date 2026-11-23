import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { checkProject } from "../bin/check-project.mjs";
import { validateAgentNames } from "../scripts/agents/agent-names.mjs";
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

test("agent name data covers the fitted avatar combinations", async () => {
  validateAgentNames();
  const { default: identities } = await import("@openboa/yogurt/agent-names", { with: { type: "json" } });
  assert.deepEqual(identities, json("design/content/agent-names.json"));
  assert.equal(identities.length, 1170);
});

test("a token edit reaches the React stylesheet and checking never overwrites a stale output", t => {
  generateTokens({ check: true });
  const root = scratch(t);
  const sources = json("catalog/brand.json").sources;
  for (const path of ["catalog/brand.json", sources.primitives, sources.roles, "design/styles/tokens.css", "design/styles/ui-tokens.css"]) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    copyFileSync(join(kit, path), join(root, path));
  }
  const ui = json(sources.roles);
  const gap = dimension(json(sources.primitives), ui.geometry, "gap-stack") + 3;
  ui.geometry["gap-stack"] = gap;
  writeFileSync(join(root, sources.roles), JSON.stringify(ui));
  const css = join(root, "design/styles/ui-tokens.css");
  const before = read(css);
  assert.throws(() => generateTokens({ root, check: true }), /Stale output: .*ui-tokens\.css/);
  assert.equal(read(css), before);
  generateTokens({ root });
  assert(read(css).includes(`--yg-gap-stack: ${gap}px;`));
  generateTokens({ root, check: true });
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

test("the React installer and project check use the public entries", t => {
  const consumer = scratch(t);
  const config = {surfaces: {desktop: {target: "web", root: "src"}}};
  writeFileSync(join(consumer, "yogurt.config.json"), JSON.stringify(config));
  const cli = join(kit, "bin/yogurt.mjs");
  execFileSync(process.execPath, [cli, "add", "input-otp", "--dir", consumer]);
  assert.match(checkProject(consumer, kit), /1 declared surfaces/);
  config.surfaces.desktop.target = "native";
  writeFileSync(join(consumer, "yogurt.config.json"), JSON.stringify(config));
  assert.throws(() => checkProject(consumer, kit), /Invalid surface desktop/);
});
