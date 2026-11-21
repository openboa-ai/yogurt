import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

if (!process.argv[2]) throw Error("Pass a packed Yogurt archive.");
const originalArchive = resolve(process.argv[2]);
const root = mkdtempSync(join(tmpdir(), "yogurt-motion-native-"));
const resolver = fileURLToPath(new URL("../plugins/yogurt/bin/resolve-sdk.mjs", import.meta.url));
const project = join(root, "consumer");
const kit = join(project, "sdk");
const archive = join(project, "sdk.tgz");
const motionPath = join(kit, "catalog/motion-components.json");
const run = (...ids) => spawnSync(process.execPath, [resolver, project, "native", "--lookup", ...ids], { encoding: "utf8" });
const configure = () => {
  const version = JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).version;
  const revision = "sha256:" + createHash("sha256").update(readFileSync(archive)).digest("hex");
  writeFileSync(join(project, "yogurt.config.json"), JSON.stringify({nativeSdk: {root:"sdk", archive:"sdk.tgz", revision, version}}));
};
try {
  mkdirSync(kit, {recursive:true});
  copyFileSync(originalArchive, archive);
  execFileSync("tar", ["-xzf", archive, "-C", kit, "--strip-components=1"]);
  configure();
  const original = readFileSync(motionPath);
  let result = run("button");
  assert.equal(result.status, 0, result.stderr);
  result = run("motion-task-list");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unavailable for Native/);

  writeFileSync(motionPath, Buffer.concat([original, Buffer.from("\n")]));
  result = run("button");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /differs from its archive at catalog\/motion-components\.json/);
  unlinkSync(motionPath);
  result = run("button");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /differs from its archive at catalog\/motion-components\.json/);
  writeFileSync(motionPath, original);

  // Repack a synthetic older archive without the optional catalog.
  const staging = join(root, "legacy");
  mkdirSync(staging);
  execFileSync("tar", ["-xzf", originalArchive, "-C", staging]);
  unlinkSync(join(staging, "package/catalog/motion-components.json"));
  execFileSync("tar", ["-czf", archive, "-C", staging, "package"]);
  unlinkSync(motionPath);
  configure();
  result = run("button");
  assert.equal(result.status, 0, result.stderr);
  result = run("motion-task-list");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown installed pattern or component/);
  writeFileSync(motionPath, original);
  result = run("button");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /differs from its archive at catalog\/motion-components\.json/);
  console.log("Native unavailable state, archive tampering and legacy catalog compatibility verified.");
} finally {
  rmSync(root, {recursive:true, force:true});
}
