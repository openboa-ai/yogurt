import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const sdk = "@openboa/yogurt";
const installedPath = `node_modules/${sdk}`;

export async function installSdk(project, archive, expectedDigest) {
  const stagedArchive = join(project, "yogurt.tgz");
  await copyFile(archive, stagedArchive);
  const digest = createHash("sha256").update(await readFile(stagedArchive)).digest("hex");
  if (digest !== expectedDigest) throw Error("The mounted SDK archive differs from the recorded input.");
  await writeFile(join(project, "package.json"), JSON.stringify({
    name: "yogurt-eval-fixture", private: true, dependencies: { [sdk]: "file:yogurt.tgz" },
  }));
  execFileSync("npm", ["install", "--offline", "--legacy-peer-deps", "--ignore-scripts", "--no-audit", "--no-fund",
    "--userconfig=/dev/null", "--cache", join(dirname(project), "npm-cache")], { cwd: project, stdio: "pipe" });
  const manifest = JSON.parse(await readFile(join(project, installedPath, "package.json"), "utf8"));
  if (manifest.name !== sdk || typeof manifest.version !== "string") throw Error("Unexpected SDK in the fixture archive.");
  await mkdir(join(project, "src"));
  await writeFile(join(project, "yogurt.config.json"), JSON.stringify({
    version: manifest.version, surfaces: { site: { target: "web", root: "src" } },
  }));
  const lock = JSON.parse(await readFile(join(project, "package-lock.json"), "utf8"));
  const pin = lock.packages?.[installedPath];
  if (pin?.version !== manifest.version || !pin.integrity || pin.resolved !== "file:yogurt.tgz") {
    throw Error("Unexpected pin in the evaluation fixture lock.");
  }
  return { version: pin.version, integrity: pin.integrity, sha256: digest };
}
