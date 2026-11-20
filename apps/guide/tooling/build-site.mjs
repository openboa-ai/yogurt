import { cp, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteLayout, sitePath } from "./site-layout.mjs";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const output = join(root, "site");
const stage = await mkdtemp(join(root, ".site-"));

try {
  for (const [source, destination] of siteLayout) {
    await cp(join(root, source), join(stage, destination), { recursive: true });
  }
  // The on-disk SDK and the public guide share the same brand data.
  const brandFile = join(stage, "catalog", "brand.json");
  const brand = JSON.parse(await readFile(brandFile, "utf8"));
  for (const [key, source] of Object.entries(brand.sources)) {
    brand.sources[key] = sitePath(source);
  }
  for (const key of ["symbol", "lockup", "wordmark"]) {
    brand.signature[key] = sitePath(brand.signature[key]);
  }
  await writeFile(brandFile, JSON.stringify(brand, null, 2) + "\n");
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
} finally {
  await rm(stage, { recursive: true, force: true });
}
