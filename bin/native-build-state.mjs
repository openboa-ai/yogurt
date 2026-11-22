import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join, relative } from "node:path";

const stateName = ".yogurt-native-build";

function running(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw Error("Invalid Native build process record.");
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    if (error.code === "EPERM") return true;
    throw error;
  }
}

export function startBuild(project) {
  const state = join(project, stateName);
  const processes = { id: randomUUID(), owner: process.pid, worker: null };
  const staged = mkdtempSync(state + "-");
  const owner = join(state, "owner.json");
  try {
    writeFileSync(join(staged, "owner.json"), JSON.stringify(processes), { mode: 0o600 });
    if (existsSync(state)) throw Error("A Native build record already exists. After the build has stopped, run yogurt native recover in the app directory.");
    renameSync(staged, state);
  } catch (error) {
    rmSync(staged, { recursive: true, force: true });
    if (["EEXIST", "ENOTEMPTY"].includes(error.code)) {
      throw Error("Another Native build acquired the app lock. Wait for it to finish.");
    }
    throw error;
  }
  return {
    bind: framework => bindManifest(project, state, framework),
    recordWorker(pid) {
      processes.worker = pid;
      const pending = join(state, "owner.next");
      writeFileSync(pending, JSON.stringify(processes), { mode: 0o600 });
      renameSync(pending, owner);
    },
    finish() {
      restoreManifest(project, state);
      retireState(state);
    },
  };
}

export function recoverBuild(project) {
  const state = join(project, stateName);
  if (!existsSync(state)) throw Error("No interrupted Native build record in this app.");
  if (!lstatSync(state).isDirectory()) throw Error("Native build record must be a directory.");
  const owner = join(state, "owner.json");
  if (!existsSync(owner)) throw Error("No build owner record. Confirm no Native build is active before inspecting " + state);
  const record = readFileSync(owner, "utf8");
  const processes = JSON.parse(record);
  if (running(processes.owner) || (processes.worker !== null && running(processes.worker))) {
    throw Error("The Native build still has a running process. Stop it before recovering.");
  }
  const guard = join(state, "recovering");
  mkdirSync(guard);
  try {
    if (readFileSync(owner, "utf8") !== record) throw Error("Native build ownership changed; retry recovery once the app is idle.");
    restoreManifest(project, state);
    retireState(state);
  } catch (error) {
    rmSync(guard, { recursive: true });
    throw error;
  }
}

function retireState(state) {
  const retired = state + "-finished-" + randomUUID();
  renameSync(state, retired);
  rmSync(retired, { recursive: true });
}

function readManifest(file) {
  const info = lstatSync(file);
  if (!info.isFile()) throw Error("build.zig.zon must be a regular file.");
  return { text: readFileSync(file, "utf8"), mode: info.mode & 0o777 };
}

function bindManifest(project, state, framework) {
  const manifest = join(project, "build.zig.zon");
  const original = readManifest(manifest);
  // Ignore comments when locating the dependency. Keep the original offsets.
  const searchable = original.text.replace(/"(?:[^"\\]|\\.)*"|\/\/[^\n]*/g,
    token => token.startsWith("//") ? " ".repeat(token.length) : token);
  const dependency = /\.native_sdk\s*=\s*\.\{\s*(?:\.(?:path|url|hash)\s*=\s*"(?:[^"\\]|\\.)*"\s*,?\s*)+\}/g;
  const matches = [...searchable.matchAll(dependency)];
  if (matches.length !== 1) {
    throw Error("Expected one native_sdk dependency with a path or URL in build.zig.zon.");
  }
  const [{ 0: entry, index }] = matches;
  const bound = original.text.slice(0, index) + ".native_sdk = .{ .path = " +
    JSON.stringify(relative(project, framework)) + " }" + original.text.slice(index + entry.length);
  writeFileSync(join(state, "original.zon"), original.text, { mode: original.mode });
  writeFileSync(join(state, "bound.zon"), bound, { mode: original.mode });
  const replacement = join(state, "manifest.next");
  writeFileSync(replacement, bound, { mode: original.mode });
  if (readManifest(manifest).text !== original.text) throw Error("build.zig.zon changed while preparing the build.");
  renameSync(replacement, manifest);
}

function restoreManifest(project, state) {
  const boundFile = join(state, "bound.zon");
  // The manifest is only replaced after both copies exist.
  if (!existsSync(boundFile)) return;
  const backup = join(state, "original.zon");
  const original = readFileSync(backup, "utf8");
  const manifest = join(project, "build.zig.zon");
  const current = readManifest(manifest).text;
  if (current === original) return;
  if (current !== readFileSync(boundFile, "utf8")) {
    throw Error("build.zig.zon was changed. It was preserved; the original is at " + backup);
  }
  const replacement = join(state, "restore.next");
  copyFileSync(backup, replacement);
  renameSync(replacement, manifest);
}
