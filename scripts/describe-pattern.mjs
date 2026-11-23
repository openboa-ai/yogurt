import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const catalogPath = "catalog/patterns.json";
const usage = "Usage: node scripts/describe-pattern.mjs <pattern-id> [web] or --list";

async function readCatalog() {
  let catalog;
  try {
    catalog = JSON.parse(await readFile(resolve(root, catalogPath), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw Error(`The installed kit is missing ${catalogPath}. Restore a complete Yogurt pin.`);
    }
    throw Error(`Cannot read ${catalogPath}. Restore a valid Yogurt pin.`, { cause: error });
  }
  if (catalog?.formatVersion !== 1) {
    throw Error(`Unsupported pattern catalog format ${catalog?.formatVersion ?? "(missing)"}. Expected 1.`);
  }
  if (!Array.isArray(catalog.patterns) || !Array.isArray(catalog.components)) {
    throw Error(`Invalid ${catalogPath}. Expected lists of patterns and components.`);
  }
  return catalog;
}

async function availability(entry, kitRoot) {
  if (!entry) return { status: "not-declared" };
  try {
    const candidate = fileURLToPath(import.meta.resolve(entry));
    const path = await realpath(candidate);
    const local = relative(kitRoot, path);
    if (!isAbsolute(local) && local !== ".." && !local.startsWith(".." + sep) &&
        (await stat(path)).isFile()) {
      return { status: "installed", path: local.split(sep).join("/") };
    }
  } catch (error) {
    if (!["ERR_MODULE_NOT_FOUND", "ERR_PACKAGE_PATH_NOT_EXPORTED", "ENOENT", "ENOTDIR"].includes(error.code)) {
      throw error;
    }
  }
  return { status: "missing" };
}

async function describe(args) {
  const [id, target, ...rest] = args;
  const list = !id || id === "--list";
  if (rest.length || (target && (list || target !== "web"))) {
    console.error(usage);
    process.exitCode = 2;
    return;
  }
  const catalog = await readCatalog();
  if (list) {
    for (const pattern of catalog.patterns) console.log(pattern.id.padEnd(25) + pattern.name);
    return;
  }
  const pattern = catalog.patterns.find(entry => entry.id === id);
  if (!pattern) {
    console.error(`Unknown pattern ${id}. Use --list to see the available IDs.`);
    process.exitCode = 2;
    return;
  }
  const kitRoot = await realpath(root);
  const components = await Promise.all(pattern.components.map(async key => {
    const part = catalog.components.find(entry => entry.id === key);
    if (!part) throw Error(`${pattern.id} references a missing component ${key} in ${catalogPath}.`);
    if (!target) return part;
    const sdk = part.sdk?.[target];
    const picked = {
      id: part.id,
      name: part.name,
      use: part.use,
      support: { [target]: part[target] },
      availability: { [target]: await availability(sdk?.entry, kitRoot) },
    };
    if (target === "web") {
      picked.source = part.source;
      picked.binding = part.webBinding;
    }
    if (sdk) picked.sdk = sdk;
    return picked;
  }));
  const result = { ...pattern, components };
  if (target) result.support = { [target]: pattern.support[target] };
  console.log(JSON.stringify(result, null, 2));
}

try {
  await describe(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
