import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { anatomy } from "./anatomy.mjs";
import { generateTokens } from "../tokens/generate.mjs";
import { generateAgentNames } from "../agents/agent-names.mjs";
process.chdir(fileURLToPath(new URL("../..", import.meta.url)));
generateTokens();
await import("./words.mjs");
await import("../agents/agent-motion.mjs");
await import("../agents/avatar-motion.mjs");
await import("../agents/agent-family.mjs");
generateAgentNames();
const read = (p) => readFileSync(p, "utf8");
const catalog = JSON.parse(read("catalog/components.json"));
const blocks = JSON.parse(read("catalog/blocks.json"));
const motionCatalog = JSON.parse(read("catalog/motion-components.json"));
const motionComponents = motionCatalog.components;
if (motionCatalog.formatVersion !== 1 || !Array.isArray(motionComponents)) throw Error("Invalid motion component catalog.");
const usedIds = new Set([...catalog, ...blocks, ...JSON.parse(read("catalog/patterns.json")).patterns].map(item => item.id));
const motionNames = new Set();
const declarationSource = read("packages/web/src/patterns/motion-patterns.ts");
const publicNames = new Set([...declarationSource.matchAll(/export \{ ([^}]+) \} from/g)]
  .flatMap(match => match[1].split(",").map(name => name.trim()).filter(name => !name.startsWith("type "))));
for (const item of motionComponents) {
  if (!/^motion-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || usedIds.has(item.id) ||
      !/^[A-Z][A-Za-z0-9]*$/.test(item.name) || motionNames.has(item.name) || !publicNames.has(item.name) ||
      item.entry !== "@openboa/yogurt/motion-patterns" || item.web !== "available" || item.native !== "unavailable" ||
      !item.guidance?.useWhen?.trim() || !item.guidance?.avoid?.trim() || !Array.isArray(item.guidance.verify) ||
      !item.guidance.verify.length || !item.guidance.verify.every(value => typeof value === "string" && value.trim()) ||
      !Array.isArray(item.examples) || !item.examples.every(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) {
    throw Error("Invalid or duplicate motion component metadata: " + item.id);
  }
  usedIds.add(item.id);
  motionNames.add(item.name);
}
if (publicNames.size !== motionNames.size) throw Error("The motion component catalog must cover each public export.");
const src = "packages/web/src";
const modulePaths = new Map();
for (const owner of ["foundation", "controls", "identity", "patterns"]) {
  for (const file of readdirSync(src + "/" + owner).filter(name => name.endsWith(".tsx"))) {
    const id = basename(file, ".tsx");
    if (modulePaths.has(id)) throw Error("Duplicate Web module " + id);
    modulePaths.set(id, owner + "/" + id + ".js");
  }
}
const modules = [...new Set(catalog.map((e) => e.module))].map(id => {
  const path = modulePaths.get(id);
  if (!path) throw Error("Missing Web module " + id);
  return path;
});
mkdirSync(src + "/entries", { recursive: true });
mkdirSync("registry", { recursive: true });
writeFileSync(
  src + "/index.ts",
  modules.map((m) => 'export * from "./' + m + '";').join("\n") +
    '\nexport { words } from "./foundation/words.js";\n' +
    'export { CopyButton, LoadingSuccessButton } from "./patterns/motion-status.js";\n' +
    'export { HoldButton, SlideConfirm } from "./patterns/motion-confirm.js";\n' +
    'export { CartButton } from "./patterns/motion-cart.js";\n' +
    'export { ProfileCard } from "./patterns/motion-cards.js";\n',
);
const art = {};
for (const [key, file] of Object.entries({
  openboa: "logo/upright-9.svg",
  yogurt: "projects/yogurt.svg",
  meatball: "projects/meatball.svg",
  sourdough: "projects/sourdough.svg",
}))
  art[key] =
    "data:image/svg+xml;base64," +
    Buffer.from(read("design/assets/" + file)).toString("base64");
const agents = {};
for (const name of ["Kai", "Sol"]) {
  const svg = read("design/assets/agents/" + name.toLowerCase() + ".svg");
  const [, id, fill] = svg.match(/<use href="#([^"]+)" fill="([^"]+)"/);
  const path = svg.match(new RegExp('<path id="' + id + '" d="([^"]+)"'))[1];
  const [, x, y] = svg.match(/<circle cx="([^"]+)" cy="([^"]+)"/);
  agents[name] = { path, fill, x: Number(x) + 13, y: Number(y) };
}
writeFileSync(
  src + "/identity/art-data.ts",
  "// Generated from the original OpenBoa masters.\nexport const marks: Record<" +
    Object.keys(art).map(JSON.stringify).join(" | ") +
    ", string> = " +
    JSON.stringify(art, null, 2) +
    ";\nexport const agents: Record<" +
    Object.keys(agents).map(JSON.stringify).join(" | ") +
    ", {path:string;fill:string;x:number;y:number}> = " +
    JSON.stringify(agents, null, 2) +
    ";\n",
);
for (const e of catalog) {
  const names = [e.name, ...(e.exports ?? [])].join(", ");
  writeFileSync(
    src + "/entries/" + e.id + ".ts",
    "export { " + names + ' } from "../' + modulePaths.get(e.module) + '";\n',
  );
  const content =
    '"use client";\n\nexport { ' +
    names +
    ' } from "@openboa/yogurt/' +
    e.id +
    '";\n';
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: e.id,
    type: "registry:ui",
    title: e.name,
    description: e.description,
    files: [{ path: "ui/" + e.id + ".tsx", type: "registry:ui", content }],
  };
  writeFileSync(
    "registry/" + e.id + ".json",
    JSON.stringify(item, null, 2) + "\n",
  );
}
for (const block of blocks) {
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: block.id, type: "registry:block", title: block.name, description: block.description,
    files: [{ path: "blocks/" + block.id + ".tsx", target: "@components/blocks/" + block.id + ".tsx", type: "registry:component", content: read("packages/recipes/" + block.id + "/web.tsx") }],
  };
  writeFileSync("registry/" + block.id + ".json", JSON.stringify(item, null, 2) + "\n");
}
for (const item of motionComponents) {
  const content = '"use client";\n\nexport { ' + item.name + ' } from "' + item.entry + '";\n';
  writeFileSync("registry/" + item.id + ".json", JSON.stringify({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.id, type: "registry:ui", title: item.name,
    description: item.guidance.useWhen,
    files: [{ path: "ui/" + item.id + ".tsx", type: "registry:ui", content }],
  }, null, 2) + "\n");
}
writeFileSync(
  "registry/registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "yogurt",
      homepage: "https://www.openboa.ai/",
      items: [...catalog, ...blocks, ...motionComponents].map((e) => JSON.parse(read("registry/" + e.id + ".json"))),
    },
    null,
    2,
  ) + "\n",
);
const declarations = execFileSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "--emitDeclarationOnly", "--listEmittedFiles", "--pretty", "false"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
const entryPoints = Object.fromEntries([
  ["index", src + "/index.ts"],
  ["agent", src + "/agent.ts"],
  ["motion-patterns", src + "/patterns/motion-patterns.ts"],
  ...catalog.map((e) => ["entries/" + e.id, src + "/entries/" + e.id + ".ts"]),
]);
const built = await build({
  entryPoints,
  outdir: "packages/web/dist",
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  treeShaking: true,
  external: ["react", "react/*", "react-dom", "react-dom/*", "@ui-sdk/core", "@ui-sdk/core/*", "@ui-sdk/react", "@ui-sdk/react/*"],
  plugins: [anatomy],
  banner: { js: '"use client";' },
  legalComments: "none",
  chunkNames: "shared/[name]-[hash]",
  metafile: true,
  logLevel: "silent",
});
const outputs = new Set(Object.keys(built.metafile.outputs));
for (const file of readdirSync("packages/web/dist/shared")) {
  const path = "packages/web/dist/shared/" + file;
  if (file.endsWith(".js") && !outputs.has(path)) unlinkSync(path);
}
const notices = new Map();
for (const input of Object.keys(built.metafile.inputs)) {
  if (!input.includes("node_modules/")) continue;
  let dir = dirname(resolve(input));
  while (!existsSync(dir + "/package.json") && dir !== dirname(dir))
    dir = dirname(dir);
  let pkg = JSON.parse(read(dir + "/package.json"));
  if (!pkg.name) continue;
  for (const license of [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "LICENSE.MIT",
    "License",
    "LICENSE.rst",
  ]) {
    if (existsSync(dir + "/" + license)) {
      notices.set(pkg.name + " " + pkg.version, read(dir + "/" + license));
      break;
    }
  }
}
notices.set("Cart button", read("design/notices/cart-button.txt"));
notices.set("Task list", read("design/notices/task-list.txt"));
const notice = [...notices]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, body]) => name + "\n" + body)
  .join("\n\n");
writeFileSync("packages/web/dist/THIRD-PARTY-NOTICES.txt", notice.trimEnd() + "\n");
const emittedDeclarations = new Set(
  declarations.split(/\r?\n/)
    .filter(line => line.startsWith("TSFILE: "))
    .map(line => resolve(line.slice("TSFILE: ".length))),
);
for (const file of readdirSync("packages/web/dist", { recursive: true })) {
  const path = resolve("packages/web/dist", file);
  if (file.endsWith(".d.ts") && !emittedDeclarations.has(path)) unlinkSync(path);
}
console.log(
  "Built " + catalog.length + " component entries and local registry items.",
);
