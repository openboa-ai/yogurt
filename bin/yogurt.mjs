#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkProject } from "./check-project.mjs";
import { installFiles } from "./install/files.mjs";
const kit = fileURLToPath(new URL("../", import.meta.url)),
  args = process.argv.slice(2),
  catalog = JSON.parse(readFileSync(join(kit, "catalog/components.json")));
const blocks = JSON.parse(readFileSync(join(kit, "catalog/blocks.json")));
const motionFile = join(kit, "catalog/motion-components.json");
const motion = existsSync(motionFile) ? JSON.parse(readFileSync(motionFile)).components : [];
if (!Array.isArray(motion)) throw Error("Invalid motion component catalog.");
const ids = new Set([...catalog, ...blocks].map(item => item.id));
for (const item of motion) {
  if (!/^motion-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id) ||
      !/^[A-Z][A-Za-z0-9]*$/.test(item.name) || item.entry !== "@openboa/yogurt/motion-patterns" ||
      item.web !== "available" || !item.guidance?.useWhen) {
    throw Error("Invalid or duplicate motion component metadata.");
  }
  ids.add(item.id);
}
const usage =
  "yogurt check [--dir project] | yogurt list | yogurt add <component-or-block> --target web [--dir project]";
function run() {
  if (args[0] === "check") {
    const at = args.indexOf("--dir");
    console.log(checkProject(resolve(at < 0 ? "." : args[at + 1]), kit));
    return;
  }
  if (args[0] === "list") {
    for (const item of [...catalog, ...blocks, ...motion])
      console.log(item.id + "  " + (item.description ?? item.guidance.useWhen));
    return;
  }
  const block = blocks.find((e) => e.id === args[1]);
  const motionItem = motion.find((e) => e.id === args[1]);
  const item = block ?? catalog.find((e) => e.id === args[1]) ?? motionItem;
  if (args[0] !== "add" || !item) throw Error(usage);
  const flag = (name) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args[i + 1];
  };
  const target = flag("--target") ?? "web",
    project = resolve(flag("--dir") ?? ".");
  if (target !== "web") throw Error(usage);
  const entry = JSON.parse(readFileSync(join(kit, "registry", item.id + ".json")));
  const dir = block ? "blocks" : "ui";
  const files = new Map([["src/components/" + dir + "/" + item.id + ".tsx", Buffer.from(entry.files[0].content)]]);
  const added = installFiles(project, files);
  console.log((added ? "Added " : "Already installed ") + item.name + " (" + target + ").");
}
try {
  run();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
