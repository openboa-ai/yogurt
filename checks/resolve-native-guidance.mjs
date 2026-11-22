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
  const inventory = JSON.parse(readFileSync(join(kit, "catalog/components.json"), "utf8"));
  const views = inventory.filter(item => item.nativeView);
  const lookup = () => spawnSync(process.execPath, [resolver, root, "native", "--lookup", "select", "combobox", "accordion", ...views.map(item => item.id)], {encoding: "utf8"});
  const result = lookup();
  assert.equal(result.status, 0, result.stderr);
  const entries = JSON.parse(result.stdout).components;
  assert.match(entries.find(item => item.id === "select").guidance.useWhen, /short/);
  assert.match(entries.find(item => item.id === "combobox").guidance.useWhen, /searchable/);
  assert.deepEqual(entries.find(item => item.id === "accordion").guidance, inventory.find(item => item.id === "accordion").guidance ?? null);
  assert.equal(entries.find(item => item.id === "input-otp")?.symbol, "codeView");
  assert.equal(entries.find(item => item.id === "input-otp")?.template, null);
  assert.equal(entries.find(item => item.id === "rating")?.symbol, "ratingView");
  for (const { id, nativeView } of views) {
    const item = entries.find(entry => entry.id === id);
    const consumer = join(root, "consumer");
    const output = execFileSync(process.execPath, [join(kit, "bin/yogurt.mjs"), "add", id, "--target", "native", "--dir", consumer], { encoding: "utf8" });
    assert(output.includes(item.importStatement), id);
    assert.equal(item.symbol, nativeView.symbol);
    assert.deepEqual(readFileSync(join(consumer, "src/yogurt", nativeView.module)), readFileSync(item.entry), id);
  }
  const installer = join(kit, "bin/install/native.mjs");
  const original = readFileSync(installer);
  writeFileSync(installer, Buffer.concat([original, Buffer.from("\n")]));
  assert.match(lookup().stderr, /differs from its archive at bin\/install\/native\.mjs/);
  writeFileSync(installer, original);
  const catalog = join(kit, "catalog/components.json");
  writeFileSync(catalog, readFileSync(catalog, "utf8") + "\n");
  const tampered = lookup();
  assert.equal(tampered.status, 1);
  assert.match(tampered.stderr, /differs from its archive at catalog\/components\.json/);
  console.log("Native guidance lookup and catalog integrity verified.");
} finally {
  rmSync(root, {recursive: true, force: true});
}
