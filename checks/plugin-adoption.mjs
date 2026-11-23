import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installSdk } from "./fixtures/install-sdk.mjs";

const [sdkArg, legacyArg, previousArg, outArg] = process.argv.slice(2);
if (!outArg) throw Error("Usage: node checks/plugin-adoption.mjs <sdk-archive> <legacy-sdk-archive> <previous-plugin-commit> <new-output-dir>");
const [sdk, legacy, output] = [sdkArg, legacyArg, outArg].map(resolvePath => resolve(resolvePath));
const repo = fileURLToPath(new URL("../", import.meta.url));
const pluginId = "yogurt@openboa-yogurt";
const marketplace = "openboa-yogurt";
const readJson = async file => JSON.parse(await readFile(file, "utf8"));
const digest = async file => createHash("sha256").update(await readFile(file)).digest("hex");
const git = args => execFileSync("git", args, { cwd: repo });

await mkdir(output);
const [sdkSha256, legacySha256] = await Promise.all([digest(sdk), digest(legacy)]);

async function snapshot(name, rev) {
  const revision = git(["rev-parse", "--verify", rev + "^{commit}"]).toString().trim();
  const directory = join(output, name);
  await mkdir(directory);
  execFileSync("tar", ["-xf", "-", "-C", directory], {
    input: git(["archive", revision, ".agents/plugins/marketplace.json", "plugins/yogurt"]),
  });
  const manifest = await readJson(join(directory, "plugins/yogurt/.codex-plugin/plugin.json"));
  return { directory, revision, version: manifest.version };
}

const previous = await snapshot("previous", previousArg);
const candidate = await snapshot("candidate", "HEAD");
assert.notEqual(candidate.version, previous.version);

async function consumer(name, archive, checksum) {
  const project = join(output, name);
  const profile = join(output, name + "-codex");
  await mkdir(project);
  await mkdir(profile);
  const install = await installSdk(project, archive, checksum);
  const lock = { ...install, revision: install.integrity, file: "package-lock.json" };
  return { project, profile, target: "web", lock, lockSha256: await digest(join(project, lock.file)) };
}

const web = await consumer("web", sdk, sdkSha256);
const peer = await consumer("peer", sdk, sdkSha256);
const receipts = [];

function cli(consumer, ...args) {
  return JSON.parse(execFileSync("codex", ["plugin", ...args, "--json"], {
    cwd: consumer.project, env: { ...process.env, CODEX_HOME: consumer.profile },
    stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: 20000,
  }));
}

async function install(consumer, snapshot, replace = false) {
  if (replace) {
    cli(consumer, "remove", pluginId);
    cli(consumer, "marketplace", "remove", marketplace);
  }
  cli(consumer, "marketplace", "add", snapshot.directory);
  const receipt = cli(consumer, "add", pluginId);
  assert.equal(receipt.version, snapshot.version);
  const expected = join(await realpath(consumer.profile), "plugins", "cache", marketplace, "yogurt", snapshot.version);
  assert.equal(await realpath(receipt.installedPath), expected);
  return expected;
}

function resolveFrom(root, project, target, ...args) {
  return spawnSync(process.execPath, [join(root, "bin/resolve-sdk.mjs"), project, target, ...args], {
    cwd: project, encoding: "utf8", timeout: 15000,
  });
}

async function observe(phase, consumer, snapshot, root) {
  const installed = cli(consumer, "list").installed.filter(item => item.pluginId === pluginId);
  assert.equal(installed.length, 1);
  assert.equal(installed[0].enabled, true);
  assert.equal(installed[0].version, snapshot.version);
  execFileSync(process.execPath, [join(repo, "checks/plugin-catalog.mjs"), consumer.project, root], {
    env: { ...process.env, CODEX_HOME: consumer.profile }, stdio: "inherit", timeout: 25000,
  });
  assert.equal(await digest(join(consumer.project, consumer.lock.file)), consumer.lockSha256);
  const resolved = resolveFrom(root, consumer.project, consumer.target);
  assert.equal(resolved.status, 0, resolved.stderr);
  const binding = JSON.parse(resolved.stdout);
  assert.equal(binding.revision, consumer.lock.revision);
  assert.equal(binding.version, consumer.lock.version);
  const pattern = JSON.parse(execFileSync(process.execPath, [binding.patterns, "pattern.review-decision", consumer.target], {
    cwd: consumer.project, encoding: "utf8", timeout: 15000,
  }));
  assert.equal(pattern.id, "pattern.review-decision");
  receipts.push({ phase, plugin: { version: snapshot.version, revision: snapshot.revision }, binding });
}

const first = await install(web, previous);
const steady = await install(peer, previous);
await observe("initial", web, previous, first);
await observe("initial", peer, previous, steady);
const next = await install(web, candidate, true);
await observe("upgraded", web, candidate, next);
await observe("peer-during-upgrade", peer, previous, steady);

const incompleteProject = join(output, "legacy");
await mkdir(incompleteProject);
const legacyPin = await installSdk(incompleteProject, legacy, legacySha256);
const strict = resolveFrom(next, incompleteProject, "web");
assert.equal(strict.status, 1);
const diagnostic = resolveFrom(next, incompleteProject, "web", "--inspect");
assert.equal(diagnostic.status, 0, diagnostic.stderr);
const diagnosed = JSON.parse(diagnostic.stdout);
assert.equal(diagnosed.status, "missing-resources");
assert.equal(diagnosed.revision, legacyPin.integrity);
assert(diagnosed.missing.includes("catalog/patterns.json"));
assert(diagnosed.resources["DESIGN.md"]);

const restored = await install(web, previous, true);
await observe("rolled-back", web, previous, restored);
await observe("peer-after-rollback", peer, previous, steady);
await writeFile(join(output, "plugin-adoption.json"), JSON.stringify({
  codex: execFileSync("codex", ["--version"], { encoding: "utf8" }).trim(),
  sdkSha256, legacySha256, previous, candidate, diagnosed, observations: receipts,
}, null, 2) + "\n");
console.log("Verified installed plugin upgrade and rollback with independent React installations.");
