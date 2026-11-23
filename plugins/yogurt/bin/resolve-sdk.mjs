import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const catalogPath = "catalog/patterns.json";
const files = ["DESIGN.md", "docs/using-yogurt.md", "bin/yogurt.mjs", "scripts/describe-pattern.mjs", catalogPath];
const compatibility = JSON.parse(readFileSync(new URL("../compatibility.json", import.meta.url)));
const json = file => JSON.parse(readFileSync(file, "utf8"));

function within(root, path) {
  const name = relative(root, path);
  return name !== ".." && !name.startsWith(".." + sep) && !isAbsolute(name);
}

function inside(root, path) {
  const file = realpathSync(resolve(root, path));
  if (!within(root, file)) throw Error(`Path is outside its declared root: ${path}`);
  return file;
}

function optionalFile(root, path) {
  try {
    const file = inside(root, path);
    if (!statSync(file).isFile()) throw Error(`Expected a file within the Yogurt SDK: ${path}`);
    return file;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

function webInstallation(root) {
  const key = "node_modules/" + compatibility.sdk;
  const declared = json(join(root, "package-lock.json")).packages?.[key];
  const installed = json(join(root, "node_modules", ".package-lock.json")).packages?.[key];
  if (!declared?.resolved || declared.resolved !== installed?.resolved ||
      declared.version !== installed.version || declared.integrity !== installed.integrity) {
    throw Error("The installed npm lock does not match the project's declared Yogurt pin.");
  }
  const gitRevision = declared.resolved.match(/#([0-9a-f]{40})$/)?.[1];
  const revision = gitRevision ?? declared.integrity;
  if (!revision) throw Error("Pin the SDK to an immutable Git commit or a locked archive.");

  const kit = inside(root, key);
  const entry = execFileSync(process.execPath, ["--input-type=module", "-e",
    "console.log(import.meta.resolve(process.argv[1]))", compatibility.sdk], { cwd: root, encoding: "utf8" }).trim();
  if (!within(kit, realpathSync(fileURLToPath(entry)))) {
    throw Error("Node resolves Yogurt outside the locked project dependency.");
  }
  return { kit, revision, version: declared.version };
}

function pinnedSdk(project, target) {
  if (target !== "web") throw Error("Select web for the React SDK.");
  const root = realpathSync(project);
  const config = json(join(root, "yogurt.config.json"));
  const install = webInstallation(root);
  const observed = json(inside(install.kit, "package.json"));
  if (observed.name !== compatibility.sdk || install.version !== observed.version ||
      (config.version && config.version !== observed.version)) {
    throw Error(`Expected ${compatibility.sdk}@${config.version ?? install.version}; found ${observed.name}@${observed.version}.`);
  }
  return { project: root, ...install, target };
}

export function inspectSdk(project, target) {
  const install = pinnedSdk(project, target);
  const resources = Object.fromEntries(files.map(name => [name, optionalFile(install.kit, name)]));
  const missing = files.filter(name => !resources[name]);
  let formatVersion = null;
  let status = "missing-resources";
  if (missing.length === 0) {
    try {
      formatVersion = json(resources[catalogPath])?.formatVersion ?? null;
      status = compatibility.catalogs[String(formatVersion)]?.includes(install.version) ? "compatible" : "incompatible";
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      status = "invalid-catalog";
    }
  }
  return { ...install, status, formatVersion, resources, missing };
}

export function resolveSdk(project, target) {
  const install = pinnedSdk(project, target);
  let formatVersion;
  try {
    ({ formatVersion } = json(inside(install.kit, catalogPath)));
  } catch (error) {
    throw Error(`SDK ${install.version} has no readable installed ${catalogPath}. Supported pairs: ${JSON.stringify(compatibility.catalogs)}.`, { cause: error });
  }
  if (!compatibility.catalogs[String(formatVersion)]?.includes(install.version)) {
    throw Error(`Incompatible Yogurt pair: installed SDK ${install.version}, catalog format ${formatVersion}, supported ${JSON.stringify(compatibility.catalogs)}.`);
  }
  return {
    ...install,
    formatVersion,
    design: inside(install.kit, files[0]),
    usage: inside(install.kit, files[1]),
    check: inside(install.kit, files[2]),
    patterns: inside(install.kit, files[3]),
  };
}

function webComponent(binding, manifest, id) {
  const entry = `${manifest.name}/${id}`;
  const exports = manifest.exports?.[`./${id}`] ?? manifest.exports?.["./*"];
  const file = kind => {
    const path = exports?.[kind]?.replace("*", id);
    const installed = path && optionalFile(binding.kit, path);
    if (!installed) throw Error(`The installed SDK is missing the ${kind} entry for ${entry}.`);
    return installed;
  };
  file("import");
  const stub = file("types");
  // The SDK build emits one named re-export per public component entry.
  const reexport = /^export \{ ([\w$, ]+) \} from "(\.\.\/(?:[\w-]+\/)*[\w-]+)\.js";$/.exec(readFileSync(stub, "utf8").trim());
  if (!reexport) throw Error(`The installed declaration for ${entry} has an unsupported format at ${stub}.`);
  const types = optionalFile(binding.kit, resolve(dirname(stub), reexport[2] + ".d.ts"));
  if (!types) throw Error(`The installed declaration for ${entry} refers to a missing module.`);
  const names = reexport[1].split(", ");
  return { id, entry, names, types, importStatement: `import { ${names.join(", ")} } from ${JSON.stringify(entry)};` };
}

function lookupSdk(binding, ids, includeDeclarations = true) {
  const { target } = binding;
  const catalog = json(inside(binding.kit, catalogPath));
  const manifest = json(inside(binding.kit, "package.json"));
  const inventory = json(inside(binding.kit, "catalog/components.json"));
  const knownComponents = new Set(inventory.map(item => item.id));
  const motionFile = optionalFile(binding.kit, "catalog/motion-components.json");
  const motionCatalog = motionFile ? json(motionFile) : {formatVersion: 1, components: []};
  if (motionCatalog.formatVersion !== 1 || !Array.isArray(motionCatalog.components)) throw Error("Invalid installed motion component catalog.");
  const reserved = new Set([...knownComponents, ...catalog.patterns.map(item => item.id),
    ...json(inside(binding.kit, "catalog/blocks.json")).map(item => item.id)]);
  const motionIds = new Set();
  for (const item of motionCatalog.components) {
    if (!/^motion-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || reserved.has(item.id) || motionIds.has(item.id) ||
        !/^[A-Z][A-Za-z0-9]*$/.test(item.name) || item.entry !== `${manifest.name}/motion-patterns` ||
        item.web !== "available" || !item.guidance ||
        typeof item.guidance.useWhen !== "string" || !item.guidance.useWhen.trim() ||
        typeof item.guidance.avoid !== "string" || !item.guidance.avoid.trim() ||
        !Array.isArray(item.guidance.verify) || !item.guidance.verify.length ||
        !item.guidance.verify.every(value => typeof value === "string" && value.trim())) {
      throw Error("Invalid or duplicate installed motion component metadata.");
    }
    motionIds.add(item.id);
  }
  const components = new Set();
  const motionEntries = [];
  const patterns = [];
  for (const id of new Set(ids)) {
    if (knownComponents.has(id)) {
      components.add(id);
      continue;
    }
    const motion = motionCatalog.components.find(item => item.id === id);
    if (motion) {
      motionEntries.push(motion);
      continue;
    }
    const pattern = catalog.patterns.find(item => item.id === id);
    if (!pattern) throw Error(`Unknown installed pattern or component: ${id}. Review ${binding.design} for the task map, run node "${binding.patterns}" --list for pattern IDs, or use yogurt list for component and block IDs.`);
    for (const key of pattern.components) {
      if (!knownComponents.has(key)) throw Error(`Pattern ${id} references unlisted component ${key}.`);
      components.add(key);
    }
    const { productInputs, states, copy, keyboard } = pattern;
    patterns.push({ id, productInputs, states: states.map(({ id, acceptance }) => ({ id, acceptance })), copy, keyboard });
  }

  const entries = [...components].map(id => {
    const component = inventory.find(item => item.id === id);
    const guidance = component.guidance ?? null;
    return { ...webComponent(binding, manifest, id), guidance };
  });
  for (const item of motionEntries) {
    const exported = manifest.exports?.["./motion-patterns"];
    const js = exported?.import && optionalFile(binding.kit, exported.import);
    const stub = exported?.types && optionalFile(binding.kit, exported.types);
    if (!js || !stub) throw Error(`The installed SDK is missing the entry for ${item.id}.`);
    const line = [...readFileSync(stub, "utf8").matchAll(/^export \{ ([\w$, ]+) \} from "(\.\.?\/(?:[\w-]+\/)*[\w-]+)\.js";$/gm)]
      .find(match => match[1].split(", ").some(name => name.trim().split(/\s+as\s+/).at(-1) === item.name));
    const types = line && optionalFile(binding.kit, resolve(dirname(stub), line[2] + ".d.ts"));
    if (!types) throw Error(`The installed declaration for ${item.id} does not expose ${item.name}.`);
    entries.push({ id: item.id, entry: item.entry, names: [item.name], types, guidance: item.guidance,
      importStatement: `import { ${item.name} } from ${JSON.stringify(item.entry)};` });
  }

  const declarations = Object.create(null);
  if (includeDeclarations) {
    const files = [...new Set(entries.map(item => item.types))]
      .map(path => ({ path, bytes: statSync(path).size }))
      .sort((a, b) => a.bytes - b.bytes);
    let remaining = 4096;
    for (const { path, bytes } of files) {
      declarations[path] = bytes <= remaining ? readFileSync(path, "utf8") : null;
      if (declarations[path] !== null) remaining -= bytes;
    }
  }
  const { version, revision, usage } = binding;
  return { version, revision, target, usage, patterns, components: entries, declarations };
}

function agentGuide(binding) {
  const { project, kit, target, version } = binding;
  const local = path => relative(project, path);
  const path = name => local(inside(kit, name));
  const catalog = json(inside(kit, catalogPath));
  const index = lookupSdk(binding, catalog.patterns.map(pattern => pattern.id), false);
  const renderer = "React";
  return [
    `## Yogurt ${renderer} UI`,
    "",
    `This project uses Yogurt \`${version}\`. Start with the user task and open the task map in \`${local(binding.design)}\`. Follow \`${path("docs/design-system-rules.md")}\` for shared UI.`,
    `Find the current pattern with \`node "${local(binding.patterns)}" <pattern-id> ${target}\`. Read the relevant section of \`${local(binding.usage)}\` for setup and verification.`,
    "Use the public bindings below. A declaration module supplies types and carries no public import name of its own.",
    "The host owns data, permissions and effects. Check the normal and recovery paths in the target renderer.",
    "Use `yogurt-ui` to choose a pattern, `yogurt-build` to implement it, `yogurt-review` to verify the result, and `yogurt-feedback` to route a reproduced problem.",
    "",
    "| User task | Pattern ID |",
    "| --- | --- |",
    ...catalog.patterns.map(({ name, id }) => `| ${name} | \`${id}\` |`),
    "",
    "| Exported names | Installed import |",
    "| --- | --- |",
    ...index.components.map(item => `| \`${item.names.join(", ")}\` | \`${item.entry}\` |`),
    "",
    `Look up other controls in \`${path("catalog/components.json")}\`. Run \`node "${local(binding.check)}" check\` from this project before review.`,
  ].join("\n");
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  try {
    const [root, target, option, ...extra] = process.argv.slice(2);
    if (!root || !target || (option === "--lookup" ? !extra.length :
      (option && !["--inspect", "--agent-guide"].includes(option)) || extra.length)) {
      throw Error("Usage: node resolve-sdk.mjs <project-root> <web> [--inspect | --agent-guide | --lookup <id> [<id> ...]]");
    }
    let binding;
    try {
      binding = option === "--inspect" ? inspectSdk(root, target) : resolveSdk(root, target);
    } catch (error) {
      throw Error(`${error.message} Check the consumer’s compatible SDK and plugin pins. Use --inspect to diagnose a declared installation.`, { cause: error });
    }
    if (option === "--agent-guide") console.log(agentGuide(binding));
    else console.log(JSON.stringify(option === "--lookup" ? lookupSdk(binding, extra) : binding));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
