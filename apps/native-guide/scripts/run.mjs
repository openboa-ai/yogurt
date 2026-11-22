#!/usr/bin/env node
import { generateTokens } from "../../../scripts/tokens/generate.mjs";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const cache = resolve(process.env.YOGURT_NATIVE_GUIDE_CACHE || join(homedir(), ".cache", "yogurt", "native-guide"));
function version(program, expected, args) {
  const result = spawnSync(program, args, { encoding: "utf8" });
  if (result.error || result.status !== 0 || !new RegExp(`(^|[^0-9])${expected.replaceAll(".", "\\.")}([^0-9]|$)`).test((result.stdout || "") + (result.stderr || ""))) {
    throw Error(`Install ${program} ${expected} and ensure it is on PATH.`);
  }
}
function command(program, args, options = {}) {
  const result = spawnSync(program, args, { stdio: "inherit", ...options });
  if (result.error || result.status !== 0) throw Error(`${program} failed${result.error ? `: ${result.error.message}` : ` (exit ${result.status})`}.`);
}
version("native", "0.11.1", ["--version"]);
version("zig", "0.16.0", ["version"]);
if (!process.env.NATIVE_SDK_PATH) throw Error("Set NATIVE_SDK_PATH to the Native SDK 0.11.1 framework.");
generateTokens();
const digest = createHash("sha256");
function hash(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const item of readdirSync(path).sort()) hash(join(path, item));
  } else if (stat.isFile()) {
    digest.update(path.slice(root.length));
    digest.update(readFileSync(path));
  }
}
for (const path of ["apps/native-guide", "catalog", "packages/native/controls", "packages/recipes", "design/assets/fonts/rethink-sans", "bin/install"]) hash(join(root, path));
const key = digest.digest("hex").slice(0, 20);
mkdirSync(cache, { recursive: true });
let host;
for (let attempt = 0; attempt < 100; attempt++) {
  const candidate = join(cache, `guide-${key}-${attempt}`);
  const ready = join(candidate, ".yogurt-guide-ready");
  if (existsSync(candidate)) {
    if (existsSync(ready) && readFileSync(ready, "utf8").trim() === key && existsSync(join(candidate, ".yogurt-guide-host"))) { host = candidate; break; }
    continue;
  }
  const lock = `${candidate}.lock`;
  try { mkdirSync(lock); } catch (error) { if (error.code === "EEXIST") continue; throw error; }
  try {
    if (existsSync(candidate)) continue;
    command("native", ["init", candidate, "--template", "zig-core", "--framework", resolve(process.env.NATIVE_SDK_PATH)]);
    writeFileSync(join(candidate, ".yogurt-guide-host"), "yogurt-native-guide\n", { flag: "wx" });
    command(process.execPath, [join(root, "apps/native-guide/scripts/prepare.mjs"), candidate]);
    writeFileSync(ready, `${key}\n`, { flag: "wx" });
    host = candidate;
    break;
  } finally { rmdirSync(lock); }
}
if (!host) throw Error(`No free guide cache slot in ${cache}; existing files were left untouched.`);
console.log(`Running Yogurt Native guide from ${host}`);
command(process.execPath, [join(root, "bin/yogurt.mjs"), "native", "dev", host]);
