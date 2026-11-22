import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brandCss } from "./brand.mjs";
import { uiTokens } from "./ui.mjs";
import { nativeTemplates } from "./native-templates.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));

export function generateTokens({ root = repository, check = false, target = "all" } = {}) {
  const readJson = path => JSON.parse(readFileSync(resolve(root, path), "utf8"));
  const sources = readJson("catalog/brand.json").sources;
  const brand = readJson(sources.primitives);
  const outputs = new Map();
  if (target !== "ui") outputs.set("design/styles/tokens.css", brandCss(brand));
  if (target !== "brand") {
    const ui = readJson(sources.roles);
    const { css, zig } = uiTokens(brand, ui);
    outputs.set("design/styles/ui-tokens.css", css);
    outputs.set("packages/native/controls/tokens.zig", zig);
    for (const [path, markup] of nativeTemplates(root, brand, ui.geometry, readJson(sources.components), readJson("catalog/blocks.json"))) {
      outputs.set(path, markup);
    }
  }
  const changed = [];
  for (const [path, source] of outputs) {
    const file = resolve(root, path);
    if (existsSync(file) && readFileSync(file, "utf8") === source) continue;
    if (check) changed.push(path);
    else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, source);
    }
  }
  if (changed.length) throw Error("Regenerate shared design tokens with npm run tokens. Stale output: " + changed.join(", "));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  generateTokens({ check: process.argv.includes("--check") });
}
