import { cp, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteLayout, sitePath } from "./site-layout.mjs";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const output = join(root, "site");
const stage = await mkdtemp(join(root, ".site-"));
const staticOnly = process.argv.includes("--static-only");
const interactivePages = ["components", "motion-patterns", "motion-comparison", "workflows", "agents"];
const cleanLinks = {
  "index.html": "/", "system.html": "/system", "library.html": "/library",
  "adoption.html": "/adoption", "playbook.html": "/playbook", "emoji.html": "/emoji",
  "components.html": "/components", "motion-patterns.html": "/motion",
  "motion-comparison.html": "/motion-comparison", "workflows.html": "/workflows", "agents.html": "/agents",
};

try {
  for (const [source, destination] of siteLayout) {
    await cp(join(root, source), join(stage, destination), { recursive: true });
  }
  for (const name of await readdir(join(root, "apps/guide/pages"))) {
    if (!name.endsWith(".html")) continue;
    const path = join(stage, name);
    const html = await readFile(path, "utf8");
    await writeFile(path, html.replace(/href="([^"]+)"/g, (whole, href) => {
      const [file, hash] = href.split("#");
      const route = cleanLinks[file];
      if (!route) return whole;
      if (hash && (file === "components.html" || file === "motion-patterns.html")) return `href="${route}/${hash}"`;
      return `href="${route}${hash ? "#" + hash : ""}"`;
    }));
  }
  if (!staticOnly) {
    const built = join(root, ".vite-guide");
    await cp(join(built, "assets"), join(stage, "assets"), { recursive: true });
    for (const name of interactivePages) {
      await cp(join(built, "_entry-" + name + ".html"), join(stage, name + ".html"));
    }
    const notices = ["packages/web/dist/THIRD-PARTY-NOTICES.txt", "node_modules/react/LICENSE", "node_modules/react-dom/LICENSE", "node_modules/scheduler/LICENSE", "node_modules/@ui-sdk/core/LICENSE", "node_modules/@ui-sdk/react/LICENSE"];
    const texts = await Promise.all(notices.map(path => readFile(join(root, path), "utf8")));
    await writeFile(join(stage, "THIRD-PARTY-NOTICES.txt"), texts.join("\n\n") + "\n");
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
