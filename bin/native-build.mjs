import { chmodSync, copyFileSync, cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { fork, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { homedir, tmpdir } from "node:os";
import { basename, delimiter, dirname, join, resolve } from "node:path";

import { recoverBuild, startBuild } from "./native-build-state.mjs";

export function nativeFramework() {
  if (process.env.NATIVE_SDK_PATH) return realpathSync(process.env.NATIVE_SDK_PATH);
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    const command = resolve(directory, "native");
    if (!existsSync(command)) continue;
    let root = dirname(realpathSync(command));
    for (let depth = 0; depth < 4; depth++, root = dirname(root)) {
      for (const candidate of [root, join(root, "@native-sdk/cli"), join(root, "cli")]) {
        if (existsSync(join(candidate, "build.zig")) && existsSync(join(candidate, "src/root.zig"))) return candidate;
      }
    }
    break;
  }
  throw Error("Install Native SDK 0.11.1 or set NATIVE_SDK_PATH to its framework directory.");
}

export async function runNative(kit, [verb, ...args]) {
  if (!["build", "dev", "test", "check", "package", "recover"].includes(verb)) {
    throw Error("Usage: yogurt native build|dev|test|check|package|recover [app-dir] [Native flags]");
  }
  const project = resolve(args[0] && !args[0].startsWith("-") ? args.shift() : ".");
  const flags = args;
  if (verb === "recover") {
    if (flags.length) throw Error("Usage: yogurt native recover [app-dir]");
    recoverBuild(project);
    console.log("Recovered the interrupted Native build.");
    return 0;
  }
  const ownedBuild = verb !== "check" && existsSync(join(project, "build.zig"));
  if (flags.some(flag => /^(?:-Dnative-sdk-path|--fork|--build-file)(?:=|$)/.test(flag))) {
    throw Error("Yogurt selects the patched SDK and build file. Use NATIVE_SDK_PATH to select the original framework.");
  }
  const packaging = verb === "package";
  let name;
  if (packaging) {
    if (process.platform !== "darwin" || flags.some(flag => /^--(?:target|binary)(?:=|$)/.test(flag))) {
      throw Error("yogurt native package supports the host macOS target and chooses the freshly built binary.");
    }
    ({ name } = JSON.parse(readFileSync(join(project, "app.json"), "utf8")));
    if (typeof name !== "string" || !/^[a-zA-Z0-9_-]+$/.test(name)) throw Error("Invalid app.json executable name.");
  }
  const source = nativeFramework();
  if (!existsSync(join(source, "build.zig"))) throw Error("NATIVE_SDK_PATH must point to the Native SDK framework.");
  const version = spawnSync("native", ["--version"], { encoding: "utf8" });
  if (version.error) throw version.error;
  if (version.status !== 0 || !/^native 0\.11\.1(?:\s|$)/i.test(version.stdout)) {
    throw Error("Yogurt's Native patch requires Native CLI 0.11.1.");
  }

  const scratch = mkdtempSync(join(tmpdir(), "yogurt-native-"));
  let state;
  try {
    state = startBuild(project);
    const framework = join(scratch, "framework");
    cpSync(source, framework, {
      recursive: true,
      filter: path => ![".git", ".zig-cache", "zig-out"].includes(basename(path)),
    });
    const patch = join(kit, "packages/native/controls/sdk-patches/v0.11.1-empty-focus-cell.patch");
    const apply = spawnSync("git", ["apply", patch], { cwd: framework, stdio: "inherit" });
    if (apply.error) throw apply.error;
    if (apply.status !== 0) throw Error("Could not apply Yogurt's OTP patch to the SDK copy. Use the original SDK 0.11.1 framework.");
    const env = { ...process.env, NATIVE_SDK_PATH: framework };
    const marker = ownedBuild ? markFramework(framework) : null;
    const prefix = packaging ? join(scratch, "release-build") : null;
    if (prefix) useReleasePrefix(scratch, prefix, env);
    if (ownedBuild) state.bind(framework);
    const buildFlags = packaging ? flags.filter(flag => flag.startsWith("-D")) : flags;
    const status = await runCommand([packaging ? "build" : verb, project, ...buildFlags], { env }, state, marker);
    if (!packaging || status !== 0) return status;
    const binary = join(prefix, "bin", name);
    if (!existsSync(binary)) throw Error("The release build did not produce " + binary);
    return await runCommand(["package", "--target", "macos", "--binary", binary, ...flags.filter(flag => !flag.startsWith("-D"))],
      { env, cwd: project }, state);
  } finally {
    try { state?.finish(); } finally { rmSync(scratch, { recursive: true, force: true }); }
  }
}

function runCommand(args, options, state, marker) {
  return new Promise((resolve, reject) => {
    const child = fork(new URL("./native-worker.mjs", import.meta.url), args, {
      ...options, stdio: ["inherit", "inherit", "pipe", "ipc"],
    });
    const handlers = ["SIGINT", "SIGTERM", "SIGHUP"].map(signal => [signal, () => child.kill(signal)]);
    for (const [signal, handler] of handlers) process.on(signal, handler);
    let tail = "";
    let verified = !marker;
    let failure;
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", chunk => {
      process.stderr.write(chunk);
      if (verified) return;
      const segment = tail + chunk;
      verified = segment.includes(marker);
      tail = segment.slice(-marker.length);
    });
    child.once("error", error => { failure = error; });
    child.once("close", code => {
      for (const [signal, handler] of handlers) process.removeListener(signal, handler);
      if (failure) reject(failure);
      else if (code === 0 && !verified) reject(Error("App-owned build did not load the patched native_sdk dependency."));
      else resolve(code ?? 1);
    });
    try {
      state.recordWorker(child.pid);
      child.send("start", error => {
        if (error) { failure = error; child.kill("SIGTERM"); }
      });
    } catch (error) {
      failure = error;
      if (child.connected) child.disconnect();
    }
  });
}

function markFramework(framework) {
  const file = join(framework, "build.zig");
  const original = readFileSync(file, "utf8");
  const entry = "pub fn build(b: *std.Build) void {";
  if (!original.includes(entry)) throw Error("Cannot mark the pinned Native SDK build entry.");
  const marker = "Yogurt patched Native SDK " + randomUUID();
  writeFileSync(file, original.replace(entry, entry + '\n    std.debug.print("' + marker + '\\n", .{});'));
  return marker;
}

function useReleasePrefix(scratch, prefix, env) {
  const zig = env.NATIVE_SDK_ZIG || "zig";
  const probe = spawnSync(zig, ["version"], { encoding: "utf8" });
  const managed = join(env.NATIVE_SDK_HOME || join(homedir(), ".native"), "toolchains/zig-0.16.0/zig");
  env.YOGURT_REAL_ZIG = probe.status === 0 && probe.stdout.trim() === "0.16.0" ? zig : managed;
  if (env.YOGURT_REAL_ZIG === managed && !existsSync(managed)) throw Error("Install Zig 0.16.0 before packaging.");
  env.YOGURT_RELEASE_PREFIX = prefix;
  const launcher = join(scratch, "yogurt-zig.mjs");
  copyFileSync(new URL("./native-release-zig.mjs", import.meta.url), launcher);
  chmodSync(launcher, 0o700);
  env.NATIVE_SDK_ZIG = launcher;
}
