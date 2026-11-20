import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../../../", import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), "utf8"));
const catalog = await read("catalog/patterns.json");
const examples = await read("examples/project-use/scenarios.json");
const byId = rows => {
  const map = new Map(rows.map(row => [row.id, row]));
  if (map.size !== rows.length) throw new Error("Duplicate catalog ID");
  return map;
};
const components = byId(catalog.components);
const patterns = byId(catalog.patterns);
byId(examples);
for (const pattern of catalog.patterns) {
  byId(pattern.states);
  for (const id of pattern.components) if (!components.has(id)) throw new Error("Unknown component " + id);
  for (const id of pattern.related) if (!patterns.has(id)) throw new Error("Unknown pattern " + id);
}
for (const example of examples) {
  for (const scene of example.scenes) {
    if (!patterns.get(scene.pattern)?.states.some(state => state.id === scene.state)) {
      throw new Error("Unknown example state " + scene.pattern + "/" + scene.state);
    }
  }
}
// A classic script can load data over file:// with no server or network request.
const output = "window.yogurtPlaybook = " + JSON.stringify({catalog, examples}) + ";\n";
const destination = new URL("../runtime/playbook-data.js", import.meta.url);
if (process.argv.includes("--check")) {
  if (await readFile(destination, "utf8") !== output) throw new Error("Regenerate the offline playbook data");
} else {
  await writeFile(destination, output);
}
