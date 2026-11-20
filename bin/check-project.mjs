import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { resolve, relative, sep, extname } from "node:path";

// A consumer opts in by declaring its presentation roots. Its data, images,
// server code and build output are outside the design-source check.
export function checkProject(directory, kit) {
  const root = realpathSync(directory),
    config = JSON.parse(
      readFileSync(resolve(root, "yogurt.config.json"), "utf8"),
    );
  const { version, exports: packageExports } = JSON.parse(
    readFileSync(resolve(kit, "package.json")),
  );
  const palette = JSON.parse(
    readFileSync(resolve(kit, "tokens/brand.json")),
  ).color;
  const catalog = JSON.parse(
    readFileSync(resolve(kit, "catalog/components.json")),
  );
  const entries = new Set(catalog.map((e) => e.id));
  for (const subpath of Object.keys(packageExports)) {
    if (subpath.startsWith("./") && !subpath.includes("*"))
      entries.add(subpath.slice(2));
  }
  const problems = [];
  let files = 0;
  if (config.version && config.version !== version)
    problems.push(
      "yogurt.config.json · pin · expected " +
        config.version +
        ", installed " +
        version,
    );
  const surfaces = Object.entries(config.surfaces ?? {});
  if (!surfaces.length)
    throw Error("Declare at least one surface in yogurt.config.json.");
  const skip = new Set([
    "node_modules",
    "dist",
    "build",
    ".git",
    ".next",
    "out",
    "zig-out",
    ".native",
    ".zig-cache",
    "assets",
  ]);
  for (const [name, surface] of surfaces) {
    if (
      !surface ||
      !["native", "web"].includes(surface.target) ||
      typeof surface.root !== "string"
    )
      throw Error("Invalid surface " + name);
    const start = realpathSync(resolve(root, surface.root));
    const local = relative(root, start);
    if (
      local === ".." ||
      local.startsWith(".." + sep) ||
      !statSync(start).isDirectory()
    )
      throw Error("Invalid surface root " + name);
    let seen = false;
    function visit(dir) {
      for (const file of readdirSync(dir, { withFileTypes: true })) {
        const path = resolve(dir, file.name),
          rel = relative(root, path);
        if (file.isDirectory()) {
          if (!skip.has(file.name)) visit(path);
          continue;
        }
        if (
          !file.isFile() ||
          ![".css", ".tsx", ".jsx", ".js", ".ts", ".zig", ".native"].includes(
            extname(file.name),
          )
        )
          continue;
        // The native token source is generated from the pin and shared by every installed item.
        if (rel.replaceAll(sep, "/").endsWith("/yogurt/tokens.zig")) continue;
        const source = readFileSync(path, "utf8");
        files++;
        if (
          surface.target === "web" &&
          /["']@openboa\/yogurt(?:\/[^"']*)?["']/.test(source)
        )
          seen = true;
        if (
          surface.target === "native" &&
          /(?:src|@import\()\s*[=(]?\s*"yogurt\/|pub const file = @import\("native_sdk"\)\.canvas\.ui_markup/.test(
            source,
          )
        )
          seen = true;
        source.split(/\r?\n/).forEach((line, i) => {
          const report = (rule, detail) =>
            problems.push(rel + ":" + (i + 1) + " · " + rule + " · " + detail);
          if (
            /(?:from\s*|import\s*)["']@openai\/apps-sdk-ui\/components\//.test(
              line,
            )
          )
            report(
              "component-source",
              "Import the Yogurt component for this surface.",
            );
          if (
            /(?:\b(?:color|background(?:-color)?|border-color|fill|stroke)\s*[:=]\s*["']?#[\da-f]{3,8}\b|\bColor\.rgb[a]?8\s*\()/i.test(
              line,
            )
          )
            report("palette", "Use the shared palette or a surface role.");
          if (
            /\bfont-family\s*:/i.test(line) &&
            !/--boa-font-family|--yg-font-|Rethink Sans/.test(line)
          )
            report("typeface", "Use Rethink Sans.");
          for (const m of line.matchAll(/--boa-color-([a-z-]+)-(\d+)\b/g))
            if (!palette[m[1]]?.[m[2]]) report("palette-reference", m[0]);
          for (const m of line.matchAll(
            /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)["']@openboa\/yogurt\/([\w.-]+)["']/g,
          ))
            if (!entries.has(m[1])) report("component-entry", m[1]);
        });
      }
    }
    visit(start);
    if (!seen)
      problems.push(
        name +
          " · adapter · No Yogurt " +
          surface.target +
          " entry found in " +
          surface.root,
      );
  }
  if (problems.length) throw Error(problems.join("\n"));
  return (
    surfaces.length +
    " declared surfaces, " +
    files +
    " presentation files, Yogurt " +
    version +
    "."
  );
}
