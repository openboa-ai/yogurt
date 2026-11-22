import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const catalogPath = "catalog/patterns.json";
const files = ["DESIGN.md", "docs/using-yogurt.md", "bin/yogurt.mjs", "scripts/describe-pattern.mjs", catalogPath];
const compatibility = JSON.parse(readFileSync(new URL("../compatibility.json", import.meta.url)));
const sha = /^[0-9a-f]{40}$/;
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

function nativeInstallation(root, expected, inspecting) {
  if (!expected?.root || !expected.version || typeof expected.revision !== "string") {
    throw Error("Declare nativeSdk.root, nativeSdk.version and nativeSdk.revision in yogurt.config.json.");
  }
  const kit = inside(root, expected.root);
  const revision = expected.revision;
  if (sha.test(revision)) {
    const git = args => execFileSync("git", ["-C", kit, ...args], { encoding: "utf8" }).trim();
    if (git(["rev-parse", "--show-toplevel"]) !== kit || git(["rev-parse", "HEAD"]) !== revision ||
        git(["status", "--porcelain=v1", "--untracked-files=all"])) {
      throw Error("The Native SDK checkout differs from the declared pin or has local edits.");
    }
  } else {
    if (!expected.archive || !/^sha256:[0-9a-f]{64}$/.test(revision)) {
      throw Error("Declare a full Git revision or an SDK archive with its SHA-256.");
    }
    const archive = inside(root, expected.archive);
    const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
    if ("sha256:" + digest !== revision) throw Error("The Native SDK archive digest differs from the declared pin.");
    const archiveMembers = new Set(execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).split("\n"));
    for (const name of ["catalog/motion-components.json", "bin/install/native.mjs", "bin/install/files.mjs"]) {
      const present = archiveMembers.has("package/" + name);
      const file = optionalFile(kit, name);
      if (present !== Boolean(file) || (present &&
          !execFileSync("tar", ["-xOf", archive, "package/" + name]).equals(readFileSync(file)))) {
        throw Error(`The Native SDK extraction differs from its archive at ${name}.`);
      }
    }
    for (const name of ["package.json", ...files, "catalog/components.json"]) {
      if (inspecting && name !== "package.json" && !archiveMembers.has("package/" + name) && !optionalFile(kit, name)) continue;
      const archived = execFileSync("tar", ["-xOf", archive, "package/" + name]);
      if (!archived.equals(readFileSync(inside(kit, name)))) {
        throw Error(`The Native SDK extraction differs from its archive at ${name}.`);
      }
    }
  }
  return { kit, revision, version: expected.version };
}

function pinnedSdk(project, target, inspecting = false) {
  if (!["web", "native"].includes(target)) throw Error("Select web or native.");
  const root = realpathSync(project);
  const config = json(join(root, "yogurt.config.json"));
  const install = target === "web" ? webInstallation(root) : nativeInstallation(root, config.nativeSdk, inspecting);
  const observed = json(inside(install.kit, "package.json"));
  if (observed.name !== compatibility.sdk || install.version !== observed.version ||
      (config.version && config.version !== observed.version)) {
    throw Error(`Expected ${compatibility.sdk}@${config.version ?? install.version}; found ${observed.name}@${observed.version}.`);
  }
  return { project: root, ...install, target };
}

export function inspectSdk(project, target) {
  const install = pinnedSdk(project, target, true);
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
        item.web !== "available" || item.native !== "unavailable" || !item.guidance ||
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
      if (target !== "web") throw Error(`${id} is unavailable for Native.`);
      motionEntries.push(motion);
      continue;
    }
    const pattern = catalog.patterns.find(item => item.id === id);
    if (!pattern) throw Error(`Unknown installed pattern or component: ${id}; it may be unavailable in this SDK version. Use describe-pattern.mjs --list or yogurt list.`);
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
    if (target === "web") return { ...webComponent(binding, manifest, id), guidance };
    const template = optionalFile(binding.kit, `packages/native/controls/items/${id}.native`);
    if (!template) throw Error(`The installed SDK is missing the Native template for ${id}.`);
    const entry = { id, template, install: `yogurt add ${id} --target native`, guidance };
    if (!component.nativeView) return { ...entry, entry: template };
    const { module, symbol } = component.nativeView;
    if (!/^(?:[a-z][a-z0-9-]*\/)*[a-z][a-z0-9-]*\.zig$/.test(module) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(symbol)) {
      throw Error(`Invalid installed Native view for ${id}.`);
    }
    const source = optionalFile(binding.kit, `packages/native/controls/${module}`);
    if (!source) throw Error(`Missing installed Native view for ${id} at ${module}.`);
    return { ...entry, entry: source, symbol, importStatement: `const ${symbol} = @import("yogurt/${module}").${symbol};` };
  });
  for (const item of motionEntries) {
    const exported = manifest.exports?.["./motion-patterns"];
    const js = exported?.import && optionalFile(binding.kit, exported.import);
    const stub = exported?.types && optionalFile(binding.kit, exported.types);
    if (!js || !stub) throw Error(`The installed SDK is missing the entry for ${item.id}.`);
    const line = [...readFileSync(stub, "utf8").matchAll(/^export \{ ([\w$, ]+) \} from "(\.\/(?:[\w-]+\/)*[\w-]+)\.js";$/gm)]
      .find(match => match[1].split(", ").includes(item.name));
    const types = line && optionalFile(binding.kit, resolve(dirname(stub), line[2] + ".d.ts"));
    if (!types) throw Error(`The installed declaration for ${item.id} does not expose ${item.name}.`);
    entries.push({ id: item.id, entry: item.entry, names: [item.name], types, guidance: item.guidance,
      importStatement: `import { ${item.name} } from ${JSON.stringify(item.entry)};` });
  }

  const declarations = Object.create(null);
  if (includeDeclarations && target === "web") {
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
  const renderer = target === "web" ? "Web" : "Native";
  return [
    `## Yogurt ${renderer} UI`,
    "",
    `This project uses Yogurt \`${version}\`. Start UI changes with \`${local(binding.design)}\` and \`${path("docs/design-system-rules.md")}\`.`,
    `Find the current pattern with \`node "${local(binding.patterns)}" <pattern-id> ${target}\`. Read the relevant section of \`${local(binding.usage)}\` for setup and verification.`,
    "Use the public bindings below. A declaration module supplies types and carries no public import name of its own.",
    "The host owns data, permissions and effects. Check the normal and recovery paths in the target renderer.",
    "Use `yogurt-ui` to choose a pattern, `yogurt-build` to implement it, `yogurt-review` to verify the result, and `yogurt-feedback` to route a reproduced problem.",
    "",
    "| User task | Pattern ID |",
    "| --- | --- |",
    ...catalog.patterns.map(({ name, id }) => `| ${name} | \`${id}\` |`),
    "",
    target === "web" ? "| Exported names | Installed import |" : "| Component | Native entry |",
    "| --- | --- |",
    ...index.components.map(item => target === "web"
      ? `| \`${item.names.join(", ")}\` | \`${item.entry}\` |`
      : `| \`${item.id}\` | \`${item.importStatement ?? local(item.entry)}\` |`),
    "",
    `Look up other controls in \`${path("catalog/components.json")}\`. Run \`node "${local(binding.check)}" check\` from this project before review.`,
  ].join("\n");
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  try {
    const [root, target, option, ...extra] = process.argv.slice(2);
    if (!root || !target || (option === "--lookup" ? !extra.length :
      (option && !["--inspect", "--agent-guide"].includes(option)) || extra.length)) {
      throw Error("Usage: node resolve-sdk.mjs <project-root> <web|native> [--inspect | --agent-guide | --lookup <id> [<id> ...]]");
    }
    const binding = option === "--inspect" ? inspectSdk(root, target) : resolveSdk(root, target);
    if (option === "--agent-guide") console.log(agentGuide(binding));
    else console.log(JSON.stringify(option === "--lookup" ? lookupSdk(binding, extra) : binding));
  } catch (error) {
    console.error(`${error.message} Install or restore the consumer's compatible SDK and plugin pins.`);
    process.exitCode = 1;
  }
}
