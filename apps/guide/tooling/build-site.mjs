import { cp, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const output = join(root, "site");
const stage = await mkdtemp(join(root, ".site-"));
const publicFiles = [
  "components.html", "agents.html", "DESIGN.md", "README.md",
  "assets", "blocks", "catalog", "content", "docs", "examples", "packages", "styles",
];

try {
  await cp(join(root, "apps", "guide", "pages"), stage, { recursive: true });
  for (const path of publicFiles) {
    await cp(join(root, path), join(stage, path), { recursive: true });
  }
  await mkdir(join(stage, "apps", "guide"), { recursive: true });
  await cp(join(root, "apps", "guide", "runtime"), join(stage, "apps", "guide", "runtime"), { recursive: true });
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
} finally {
  await rm(stage, { recursive: true, force: true });
}
