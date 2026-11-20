import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("../../..", import.meta.url)));
const family = process.argv[2] === "--agents";
const motion = process.argv[2] === "--motion";
const review = family || motion ? process.argv[3] : undefined;
const js = await build({
  entryPoints: [family ? "apps/guide/agent-family.tsx" : motion ? "apps/guide/motion-review.tsx" : "apps/guide/ui-catalog.tsx"],
  write: false,
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  target: "es2022",
  legalComments: "none",
  logOverride: { "ignored-bare-import": "silent" },
  define: { "process.env.NODE_ENV": '"production"' },
});
const read = (p) => readFileSync(p, "utf8");
const galleryStyles = [
  "styles/tokens.css",
  "styles/ui-tokens.css",
  "styles/ui-catalog-parts.css",
  "styles/ui-workspaces.css",
  "styles/ui-agent-workspace.css",
  "styles/ui-project-workspace.css",
  "styles/ui-operations.css",
  "styles/ui-sidebar.css",
  "styles/ui-agent-motion.css",
  "styles/ui-motion-actions.css",
  "styles/ui-motion-navigation.css",
  "styles/ui.css",
  "apps/guide/ui-catalog.css",
  ...(motion ? ["apps/guide/motion-review.css"] : []),
];
const familyStyles = ["styles/tokens.css", "styles/ui.css", "styles/ui-agent-motion.css", "apps/guide/agent-family.css"];
const styles = (family ? familyStyles : galleryStyles)
  .map(read)
  .join("\n")
  .replace(/^@import .*?;$/gm, "")
  .replace(
    /url\("\.\.\/(assets\/fonts\/[^"]+)"\)/g,
    (_, p) =>
      'url("data:font/woff2;base64,' +
      readFileSync(p).toString("base64") +
      '")',
  );
const script = js.outputFiles[0].text
  .replace(/^[ \t]+$/gm, "")
  .replaceAll("</script", "<\\/script");
const licenses = [
  "dist/THIRD-PARTY-NOTICES.txt",
  "node_modules/react/LICENSE",
  "node_modules/react-dom/LICENSE",
  "node_modules/scheduler/LICENSE",
  "assets/fonts/rethink-sans/OFL.txt",
]
  .map((path) => path + "\n" + read(path))
  .join("\n\n")
  .replaceAll("<", "\\u003c");
const block =
  '<div id="' + (family ? "yogurt-agent-family" : motion ? "yogurt-motion-review" : "yogurt-ui-library") +
  '"></div>\n<style>' +
  styles +
  "</style>\n<script>" +
  script +
  '</script>\n<script type="text/plain" id="yogurt-third-party-notices">' +
  licenses +
  "</script>";
if (review) {
  writeFileSync(review, block + "\n");
} else writeFileSync(
  family ? "agents.html" : "components.html",
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    (family ? "Agent family" : "Component library") + ' · Yogurt</title></head><body>' +
    block +
    "</body></html>\n",
);
console.log("Offline gallery: " + Buffer.byteLength(block) + " bytes.");
