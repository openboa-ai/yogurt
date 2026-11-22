#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args[0] === "build") {
  const prefix = args.indexOf("--prefix");
  if (prefix !== -1) args.splice(prefix, 2);
  args.push("--prefix", process.env.YOGURT_RELEASE_PREFIX);
}
const result = spawnSync(process.env.YOGURT_REAL_ZIG, args, { stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
