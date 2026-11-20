import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync, execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [candidateConsumer, previousConsumer, archivePath, previousArchivePath] = process.argv.slice(2).map(path => resolve(path));
if (!candidateConsumer || !previousConsumer || !archivePath) {
  throw Error("Usage: node checks/plugin-sdk.mjs <candidate-npm-project> <previous-npm-project> <candidate-archive>");
}
const source = fileURLToPath(new URL("../plugins/yogurt", import.meta.url));
const root = mkdtempSync(join(tmpdir(), "yogurt-plugin-"));
const plugin = join(root, "plugin");
const resolver = join(plugin, "bin/resolve-sdk.mjs");

function result(project, target, ...options) {
  const run = spawnSync(process.execPath, [resolver, project, target, ...options], { cwd: project, encoding: "utf8" });
  if (run.error) throw run.error;
  return run;
}

function inspect(project, target) {
  const run = result(project, target, "--inspect");
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

function config(project, data) {
  writeFileSync(join(project, "yogurt.config.json"), JSON.stringify(data));
}

try {
  cpSync(source, plugin, { recursive: true });
  const manifest = JSON.parse(readFileSync(join(plugin, ".codex-plugin/plugin.json"), "utf8"));
  for (const name of ["yogurt-ui", "yogurt-build", "yogurt-review", "yogurt-feedback"]) {
    assert(existsSync(join(plugin, manifest.skills, name, "SKILL.md")), name);
  }

  const web = join(root, "web");
  cpSync(candidateConsumer, web, { recursive: true });
  config(web, { version: "0.1.0-local.16" });
  const installed = result(web, "web");
  assert.equal(installed.status, 0, installed.stderr);
  const observed = JSON.parse(installed.stdout);
  assert.equal(observed.version, "0.1.0-local.16");
  assert.equal(observed.formatVersion, 1);
  assert(observed.design.endsWith("/web/node_modules/@openboa/yogurt/DESIGN.md"));
  const ready = inspect(web, "web");
  assert.equal(ready.status, "compatible");
  assert.equal(ready.resources["DESIGN.md"], observed.design);
  assert.deepEqual(ready.missing, []);
  const webGuide = result(web, "web", "--agent-guide");
  assert.equal(webGuide.status, 0, webGuide.stderr);
  assert.match(webGuide.stdout, /node_modules\/@openboa\/yogurt\/DESIGN\.md/);
  assert.match(webGuide.stdout, /\bStatus\x60 \| \x60@openboa\/yogurt\/status\x60/);
  assert.match(webGuide.stdout, /yogurt-ui.*yogurt-build.*yogurt-review.*yogurt-feedback/);
  assert.doesNotMatch(webGuide.stdout, /@openboa\/yogurt\/feedback/);
  assert(!webGuide.stdout.includes(web));
  assert(!existsSync(join(web, "AGENTS.md")));
  console.log(`Pinned Web instruction index is ${Buffer.byteLength(webGuide.stdout)} bytes.`);
  const focused = result(web, "web", "--lookup", "pattern.review-decision", "pattern.track-request", "confirm-dialog");
  assert.equal(focused.status, 0, focused.stderr);
  const review = JSON.parse(focused.stdout);
  assert.equal(review.revision, observed.revision);
  assert.deepEqual(review.patterns.map(item => item.id), ["pattern.review-decision", "pattern.track-request"]);
  const dialog = review.components.find(item => item.id === "confirm-dialog");
  const receipt = review.components.find(item => item.id === "receipt");
  assert.equal(dialog.entry, "@openboa/yogurt/confirm-dialog");
  assert.deepEqual(dialog.names, ["ConfirmDialog"]);
  assert.equal(receipt.types, dialog.types);
  assert.match(review.declarations[dialog.types], /export declare function Receipt/);
  assert.equal(review.components.filter(item => item.id === "confirm-dialog").length, 1);
  assert(Object.values(review.declarations).reduce((total, body) => total + Buffer.byteLength(body ?? ""), 0) <= 4096);
  console.log(`Combined decision and receipt lookup emits ${Buffer.byteLength(focused.stdout)} bytes.`);
  const unknown = result(web, "web", "--lookup", "not-an-installed-component");
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /Unknown installed pattern or component/);
  const missingTypes = join(observed.kit, "dist/entries/receipt.d.ts");
  renameSync(missingTypes, missingTypes + ".disabled");
  const missing = result(web, "web", "--lookup", "receipt");
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /missing the types entry for @openboa\/yogurt\/receipt/);
  renameSync(missingTypes + ".disabled", missingTypes);

  const previous = join(root, "previous");
  cpSync(previousConsumer, previous, { recursive: true });
  config(previous, { version: "0.1.0-local.15" });
  const incompatible = result(previous, "web");
  assert.equal(incompatible.status, 1);
  assert.match(incompatible.stderr, /SDK 0\.1\.0-local\.15.*Supported pairs/);
  const incomplete = inspect(previous, "web");
  assert.equal(incomplete.version, "0.1.0-local.15");
  assert.equal(incomplete.status, "missing-resources");
  assert(incomplete.resources["DESIGN.md"].endsWith("/previous/node_modules/@openboa/yogurt/DESIGN.md"));
  assert(incomplete.missing.includes("catalog/patterns.json"));
  assert(incomplete.missing.includes("scripts/describe-pattern.mjs"));
  assert.equal(result(previous, "web", "--lookup", "button").status, 1);
  const npmLock = join(web, "node_modules/.package-lock.json");
  renameSync(npmLock, npmLock + ".disabled");
  assert.equal(result(web, "web").status, 1);
  assert.equal(result(web, "web", "--inspect").status, 1);
  renameSync(npmLock + ".disabled", npmLock);
  assert.equal(result(web, "web").status, 0);
  const catalog = join(web, "node_modules/@openboa/yogurt/catalog/patterns.json");
  writeFileSync(catalog, "{ malformed");
  assert.equal(inspect(web, "web").status, "invalid-catalog");
  writeFileSync(catalog, '{"formatVersion":999}');
  assert.equal(inspect(web, "web").status, "incompatible");

  const native = join(root, "native");
  const extracted = join(native, "sdk");
  const archive = join(native, "sdk.tgz");
  mkdirSync(extracted, { recursive: true });
  cpSync(archivePath, archive);
  execFileSync("tar", ["-xzf", archive, "-C", extracted, "--strip-components=1"]);
  const revision = "sha256:" + createHash("sha256").update(readFileSync(archive)).digest("hex");
  config(native, { nativeSdk: { root: "sdk", archive: "sdk.tgz", revision, version: observed.version } });
  const bound = result(native, "native");
  assert.equal(bound.status, 0, bound.stderr);
  assert.equal(JSON.parse(bound.stdout).revision, revision);
  assert.equal(inspect(native, "native").status, "compatible");
  const nativeGuide = result(native, "native", "--agent-guide");
  assert.equal(nativeGuide.status, 0, nativeGuide.stderr);
  assert.match(nativeGuide.stdout, /sdk\/packages\/native\/controls\/items\/receipt\.native/);
  assert(!nativeGuide.stdout.includes(native));
  assert(!existsSync(join(native, "AGENTS.md")));
  const markup = result(native, "native", "--lookup", "pattern.review-decision");
  assert.equal(markup.status, 0, markup.stderr);
  const nativeReview = JSON.parse(markup.stdout);
  const nativeDialog = nativeReview.components.find(item => item.id === "confirm-dialog");
  assert.equal(nativeReview.revision, revision);
  assert.equal(nativeDialog.template, join(extracted, "packages/native/controls/items/confirm-dialog.native"));
  assert.equal(nativeDialog.install, "yogurt add confirm-dialog --target native");
  assert.match(readFileSync(nativeDialog.template, "utf8"), /on-press="confirm_current"/);
  writeFileSync(join(extracted, "DESIGN.md"), "Unexpected edit");
  const changed = result(native, "native");
  assert.equal(changed.status, 1);
  assert.match(changed.stderr, /differs from its archive at DESIGN\.md/);
  assert.equal(result(native, "native", "--inspect").status, 1);

  if (previousArchivePath) {
    const olderNative = join(root, "legacy-native");
    const contents = join(olderNative, "sdk");
    const pinnedArchive = join(olderNative, "sdk.tgz");
    mkdirSync(contents, { recursive: true });
    cpSync(previousArchivePath, pinnedArchive);
    execFileSync("tar", ["-xzf", pinnedArchive, "-C", contents, "--strip-components=1"]);
    const revision = "sha256:" + createHash("sha256").update(readFileSync(pinnedArchive)).digest("hex");
    config(olderNative, { nativeSdk: { root: "sdk", archive: "sdk.tgz", revision, version: incomplete.version } });
    const nativeGap = inspect(olderNative, "native");
    assert.equal(nativeGap.revision, revision);
    assert.equal(nativeGap.status, "missing-resources");
    assert.deepEqual(nativeGap.missing, incomplete.missing);
  }

  console.log("Isolated plugin resolved its pinned Web and Native SDKs, inspected installed guidance, and rejected invalid or edited inputs.");
} finally {
  rmSync(root, { recursive: true });
}
