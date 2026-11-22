import { spawnSync } from "node:child_process";
import { lstatSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const source = "packages/native/controls/precision-inputs.zig";

export function upgradeOtp(kit, [app, previousKit, ...extra]) {
  if (!app || !previousKit || extra.length) {
    throw Error("Usage: yogurt upgrade-otp <app-dir> <previous-yogurt-kit-dir>");
  }
  const installed = resolve(app, "src/yogurt/precision-inputs.zig");
  const stat = lstatSync(installed);
  if (!stat.isFile()) throw Error("The installed precision-inputs.zig must be a regular file.");
  const base = resolve(previousKit, source);
  const next = join(kit, source);
  const current = readFileSync(installed);
  if (current.equals(readFileSync(next))) return;

  const scratch = mkdtempSync(join(dirname(installed), ".otp-upgrade-"));
  try {
    const local = join(scratch, "current.zig");
    writeFileSync(local, current, { mode: stat.mode });
    const merged = spawnSync("git", ["merge-file", "-p", "-L", "installed", "-L", "previous Yogurt", "-L", "updated Yogurt", local, base, next]);
    if (merged.error) throw merged.error;
    if (merged.status === null || merged.status < 0 || merged.status > 127) {
      throw Error(merged.stderr.toString() || "OTP upgrade failed.");
    }
    if (merged.status !== 0) {
      const conflict = installed + ".merge";
      writeFileSync(conflict, merged.stdout, { flag: "wx", mode: stat.mode });
      throw Error("OTP upgrade needs manual resolution. Review " + conflict + "; the installed file was preserved.");
    }
    if (!readFileSync(installed).equals(current)) throw Error("The installed OTP changed during the upgrade. Retry.");
    writeFileSync(local, merged.stdout);
    renameSync(local, installed);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
