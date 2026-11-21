import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] ?? "");
const resolver = fileURLToPath(new URL("../plugins/yogurt/bin/resolve-sdk.mjs", import.meta.url));
const result = spawnSync(process.execPath, [resolver, project, "web", "--lookup", "pattern.review-decision", "pattern.track-request"], { encoding: "utf8" });
assert.equal(result.status, 0, result.stderr);
const lookup = JSON.parse(result.stdout);
const status = lookup.components.find(item => item.id === "status");
const outcome = lookup.components.find(item => item.id === "result");
assert.equal(status.types, outcome.types);
assert.equal(status.importStatement, 'import { Status } from "@openboa/yogurt/status";');
assert.equal(outcome.importStatement, 'import { Result } from "@openboa/yogurt/result";');
for (const item of lookup.components) {
  assert.equal(item.importStatement, `import { ${item.names.join(", ")} } from ${JSON.stringify(item.entry)};`);
}
const verify = `for (const item of JSON.parse(process.argv[1])) { const actual = await import(item.entry); for (const name of item.names) if (!(name in actual)) throw Error(item.entry + " does not export " + name); }`;
const imported = spawnSync(process.execPath, ["--input-type=module", "-e", verify, JSON.stringify(lookup.components)], { cwd: project, encoding: "utf8" });
assert.equal(imported.status, 0, imported.stderr);
const missing = spawnSync(process.execPath, [resolver, project, "web", "--lookup", "unknown-control"], { encoding: "utf8" });
assert.equal(missing.status, 1);
assert.match(missing.stderr, /Unknown installed pattern or component/);
console.log(`Verified ${lookup.components.length} installed Web import statements.`);
