import { cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, delimiter, dirname, join, resolve } from "node:path";

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
  if (!["build", "dev", "test", "check", "package"].includes(verb)) {
    throw Error("Usage: yogurt native build|dev|test|check|package [app-dir] [Native flags]");
  }
  const project = resolve(args[0] && !args[0].startsWith("-") ? args.shift() : ".");
  const flags = args;
  if (flags.some(flag => /^-Dnative-sdk-path(?:=|$)/.test(flag))) {
    throw Error("Yogurt sets -Dnative-sdk-path. Use NATIVE_SDK_PATH to select the original framework.");
  }
  const packaging = verb === "package";
  let binary;
  if (packaging) {
    if (process.platform !== "darwin" || flags.some(flag => /^--(?:target|binary)(?:=|$)/.test(flag))) {
      throw Error("yogurt native package supports the host macOS target and chooses the freshly built binary.");
    }
    const { name } = JSON.parse(readFileSync(join(project, "app.json"), "utf8"));
    if (typeof name !== "string" || !/^[a-zA-Z0-9_-]+$/.test(name)) throw Error("Invalid app.json executable name.");
    binary = join(project, "zig-out/bin", name);
  }
  const source = nativeFramework();
  if (!existsSync(join(source, "build.zig"))) throw Error("NATIVE_SDK_PATH must point to the Native SDK framework.");
  const version = spawnSync("native", ["--version"], { encoding: "utf8" });
  if (version.error) throw version.error;
  if (version.status !== 0 || !/^native 0\.11\.1(?:\s|$)/i.test(version.stdout)) {
    throw Error("Yogurt's Native patch requires Native CLI 0.11.1.");
  }

  const scratch = mkdtempSync(join(tmpdir(), "yogurt-native-"));
  try {
    const framework = join(scratch, "framework");
    cpSync(source, framework, {
      recursive: true,
      filter: path => ![".git", ".zig-cache", "zig-out"].includes(basename(path)),
    });
    const patch = join(kit, "packages/native/controls/sdk-patches/v0.11.1-empty-focus-cell.patch");
    const apply = spawnSync("git", ["apply", patch], { cwd: framework, stdio: "inherit" });
    if (apply.error) throw apply.error;
    if (apply.status !== 0) throw Error("Could not apply Yogurt's OTP patch to the SDK copy. Use the original SDK 0.11.1 framework.");
    const options = {
      env: { ...process.env, NATIVE_SDK_PATH: framework },
      stdio: "inherit",
    };
    const buildFlags = packaging ? flags.filter(flag => flag.startsWith("-D")) : [...flags];
    if (verb !== "check" && existsSync(join(project, "build.zig"))) {
      buildFlags.push("-Dnative-sdk-path=" + framework);
    }
    const buildArgs = [packaging ? "build" : verb, project, ...buildFlags];
    if (verb === "dev") return await runDevelopment(buildArgs, options);
    const build = spawnSync("native", buildArgs, options);
    if (build.error) throw build.error;
    if (!packaging || build.status !== 0) return build.status ?? 1;
    const release = spawnSync("native", ["package", "--target", "macos", "--binary", binary, ...flags.filter(flag => !flag.startsWith("-D"))], {
      ...options, cwd: project,
    });
    if (release.error) throw release.error;
    return release.status ?? 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function runDevelopment(args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn("native", args, options);
    const handlers = ["SIGINT", "SIGTERM", "SIGHUP"].map(signal => [signal, () => child.kill(signal)]);
    for (const [signal, handler] of handlers) process.once(signal, handler);
    child.on("error", reject);
    child.on("close", code => {
      for (const [signal, handler] of handlers) process.removeListener(signal, handler);
      resolve(code ?? 1);
    });
  });
}
