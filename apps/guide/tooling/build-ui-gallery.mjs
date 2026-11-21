import { build } from "esbuild";
import { anatomy } from "../../../scripts/sdk/anatomy.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("../../..", import.meta.url)));
const family = process.argv[2] === "--agents";
const motion = process.argv[2] === "--motion";
const comparison = process.argv[2] === "--motion-comparison";
const workflows = process.argv[2] === "--workflows";
const patterns = process.argv[2] === "--motion-patterns";
const review = family || motion ? process.argv[3] : undefined;
const entry = family ? "agent-family" : motion ? "motion-review" :
  comparison ? "motion-comparison" : patterns ? "motion-patterns" : workflows ? "workflows" : "ui-catalog-offline";
const js = await build({
  entryPoints: ["apps/guide/" + entry + ".tsx"],
  write: false,
  bundle: true,
  plugins: comparison ? [anatomy] : [],
  minify: true,
  format: "iife",
  jsx: "automatic",
  target: "es2022",
  legalComments: "none",
  logOverride: { "ignored-bare-import": "silent" },
  define: { "process.env.NODE_ENV": '"production"' },
});
const read = (p) => readFileSync(p, "utf8");
const inlineStyles = (path) => read(path).replace(
  /^@import "\.\/([^"]+)";$/gm,
  (_, imported) => inlineStyles(join(dirname(path), imported)),
);
const galleryStyles = [
  "design/styles/ui.css",
  "apps/guide/ui-catalog.css",
  ...(motion ? ["apps/guide/motion-review.css"] : []),
  ...(comparison ? ["apps/guide/motion-comparison.css"] : []),
  ...(workflows ? ["apps/guide/workflows.css"] : []),
  ...(patterns || entry === "ui-catalog-offline" ? [
    "apps/guide/motion-pattern-gallery.css",
    "apps/guide/motion-extra-cards.css",
    "apps/guide/motion-extra-controls.css",
    "apps/guide/motion-extra-gestures.css",
    "apps/guide/motion-extra-utilities.css",
  ] : []),
];
const familyStyles = ["design/styles/ui.css", "apps/guide/agent-family.css"];
const styles = (family ? familyStyles : galleryStyles).map(inlineStyles)
  .join("\n")
  .replace(
    /url\("\.\.\/(assets\/fonts\/[^"]+)"\)/g,
    (_, p) =>
      'url("data:font/woff2;base64,' +
      readFileSync("design/" + p).toString("base64") +
      '")',
  );
const script = js.outputFiles[0].text
  .replace(/^[ \t]+$/gm, "")
  .replaceAll("</script", "<\\/script");
const licenses = [
  "packages/web/dist/THIRD-PARTY-NOTICES.txt",
  "node_modules/react/LICENSE",
  "node_modules/react-dom/LICENSE",
  "node_modules/scheduler/LICENSE",
  "node_modules/@ui-sdk/core/LICENSE",
  "node_modules/@ui-sdk/react/LICENSE",
  "design/assets/fonts/rethink-sans/OFL.txt",
]
  .map((path) => path + "\n" + read(path))
  .join("\n\n")
  .replaceAll("<", "\\u003c");
const block =
  '<div id="' + (family ? "yogurt-agent-family" : motion ? "yogurt-motion-review" :
    comparison ? "yogurt-motion-comparison" : patterns ? "yogurt-motion-patterns" : workflows ? "yogurt-workflows" : "yogurt-ui-library") +
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
  family ? "apps/guide/generated/agents.html" : comparison ? "apps/guide/generated/motion-comparison.html" :
    patterns ? "apps/guide/generated/motion-patterns.html" : workflows ? "apps/guide/generated/workflows.html" : "apps/guide/generated/components.html",
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    (family ? "Agent family" : comparison ? "Component motion" : patterns ? "Motion patterns" : workflows ? "Product workflows" : "Component library") + ' · Yogurt</title></head><body>' +
    block +
    "</body></html>\n",
);
console.log("Offline gallery: " + Buffer.byteLength(block) + " bytes.");
