import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const archive = resolve(process.argv[2] ?? "");
const root = mkdtempSync(join(tmpdir(), "yogurt-native-guidance-"));
const kit = join(root, "sdk");
const localArchive = join(root, "sdk.tgz");
const resolver = fileURLToPath(new URL("../plugins/yogurt/bin/resolve-sdk.mjs", import.meta.url));
try {
  mkdirSync(kit);
  copyFileSync(archive, localArchive);
  execFileSync("tar", ["-xzf", localArchive, "-C", kit, "--strip-components=1"]);
  const manifest = JSON.parse(readFileSync(join(kit, "package.json"), "utf8"));
  const revision = "sha256:" + createHash("sha256").update(readFileSync(localArchive)).digest("hex");
  writeFileSync(join(root, "yogurt.config.json"), JSON.stringify({nativeSdk: {root: "sdk", archive: "sdk.tgz", revision, version: manifest.version}}));
  const lookup = () => spawnSync(process.execPath, [resolver, root, "native", "--lookup", "select", "combobox", "accordion"], {encoding: "utf8"});
  const result = lookup();
  assert.equal(result.status, 0, result.stderr);
  const entries = JSON.parse(result.stdout).components;
  assert.match(entries.find(item => item.id === "select").guidance.useWhen, /short/);
  assert.match(entries.find(item => item.id === "combobox").guidance.useWhen, /searchable/);
  const inventory = JSON.parse(readFileSync(join(kit, "catalog/components.json"), "utf8"));
  assert.deepEqual(entries.find(item => item.id === "accordion").guidance, inventory.find(item => item.id === "accordion").guidance ?? null);
  const catalog = join(kit, "catalog/components.json");
  writeFileSync(catalog, readFileSync(catalog, "utf8") + "\n");
  const tampered = lookup();
  assert.equal(tampered.status, 1);
  assert.match(tampered.stderr, /differs from its archive at catalog\/components\.json/);
  console.log("Native guidance lookup and catalog integrity verified.");
} finally {
  rmSync(root, {recursive: true, force: true});
}
