import { cpSync, existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

export function runNative(kit, [verb, app = ".", ...flags]) {
  if (!["build", "dev", "test", "check"].includes(verb)) {
    throw Error("Usage: yogurt native build|dev|test|check [app-dir] [Native flags]");
  }
  const configured = process.env.NATIVE_SDK_PATH;
  if (!configured) throw Error("Set NATIVE_SDK_PATH to the unpatched Native SDK 0.11.1 framework.");
  const source = realpathSync(configured);
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
    const build = spawnSync("native", [verb, resolve(app), ...flags], {
      env: { ...process.env, NATIVE_SDK_PATH: framework },
      stdio: "inherit",
    });
    if (build.error) throw build.error;
    return build.status ?? 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
