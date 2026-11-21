import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw Error("Pass an isolated installed Web consumer path.");
const kit = join(project, "node_modules/@openboa/yogurt");
const resolver = fileURLToPath(new URL("../plugins/yogurt/bin/resolve-sdk.mjs", import.meta.url));
const cli = join(kit, "bin/yogurt.mjs");
const catalog = join(kit, "catalog/motion-components.json");
const original = readFileSync(catalog, "utf8");
const items = JSON.parse(original).components;
assert.equal(items.length, 29);
const call = (...args) => spawnSync(process.execPath, args, { cwd: project, encoding: "utf8" });
const lookup = (...ids) => call(resolver, project, "web", "--lookup", ...ids);
try {
  const result = lookup(...items.map(item => item.id));
  assert.equal(result.status, 0, result.stderr);
  const entries = JSON.parse(result.stdout).components;
  assert.equal(entries.length, 29);
  for (const item of items) {
    const found = entries.find(entry => entry.id === item.id);
    assert.equal(found.importStatement, `import { ${item.name} } from "@openboa/yogurt/motion-patterns";`);
    assert.deepEqual(found.guidance, item.guidance);
  }
  const imported = call("--input-type=module", "-e", `const m = await import('@openboa/yogurt/motion-patterns'); for (const n of JSON.parse(process.argv[1])) if (!(n in m)) throw Error(n)`, JSON.stringify(items.map(item => item.name)));
  assert.equal(imported.status, 0, imported.stderr);
  const list = call(cli, "list");
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /motion-task-list/);
  const installed = call(cli, "add", "motion-task-list", "--target", "web", "--dir", project);
  assert.equal(installed.status, 0, installed.stderr);
  const destination = join(project, "src/components/ui/motion-task-list.tsx");
  assert.match(readFileSync(destination, "utf8"), /export \{ TaskList \} from "@openboa\/yogurt\/motion-patterns"/);
  writeFileSync(destination, "// consumer edit\n");
  const conflict = call(cli, "add", "motion-task-list", "--target", "web", "--dir", project);
  assert.notEqual(conflict.status, 0);
  assert.equal(readFileSync(destination, "utf8"), "// consumer edit\n");
  const native = call(cli, "add", "motion-task-list", "--target", "native", "--dir", project);
  assert.notEqual(native.status, 0);
  assert.match(native.stderr, /not available for Native/);
  assert.equal(existsSync(join(project, "src/yogurt/motion-task-list.zig")), false);
  const duplicate = JSON.parse(original); duplicate.components.push(duplicate.components[0]);
  writeFileSync(catalog, JSON.stringify(duplicate));
  assert.notEqual(lookup("motion-task-list").status, 0);
  writeFileSync(catalog, original);
  renameSync(catalog, catalog + ".legacy-test");
  try {
    assert.equal(lookup("button").status, 0);
    assert.notEqual(lookup("motion-task-list").status, 0);
  } finally { renameSync(catalog + ".legacy-test", catalog); }
  console.log("Installed Web motion discovery, wrappers, conflicts and legacy lookup verified.");
} finally { writeFileSync(catalog, original); }
