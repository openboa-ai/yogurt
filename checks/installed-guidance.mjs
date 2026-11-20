import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const [kitArg, version] = process.argv.slice(2);
if (!kitArg || !version) throw Error("Usage: node checks/installed-guidance.mjs <installed-sdk> <version>");
const kit = resolve(kitArg);
const lookup = "scripts/describe-pattern.mjs";
const read = path => readFileSync(path, "utf8");
const patternIds = [
  "pattern.find-records",
  "pattern.inspect-record",
  "pattern.review-decision",
  "pattern.track-request",
];
assert.equal(JSON.parse(read(join(kit, "package.json"))).version, version);

function call(root, entry, ...args) {
  const result = spawnSync(process.execPath, [join(root, entry), ...args], { encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}

function assertLink(doc, href) {
  if (/^(?:[a-z]+:|\/\/)/i.test(href)) return;
  const [file, anchor] = href.split("#");
  const path = file ? resolve(dirname(doc), decodeURIComponent(file)) : doc;
  const local = relative(kit, path);
  assert(!isAbsolute(local) && !local.startsWith(".." + sep) && local !== "..", href);
  let dir = kit;
  for (const segment of local.split(sep)) {
    assert(readdirSync(dir).includes(segment), `${relative(kit, doc)} → ${href}`);
    dir = join(dir, segment);
  }
  if (!anchor) return;
  const content = read(path);
  const anchors = path.endsWith(".md")
    ? [...content.matchAll(/^#{1,6} (.+)$/gm)].map(([, heading]) =>
        heading.toLowerCase().replace(/[^\w -]/g, "").trim().replace(/ /g, "-"))
    : [...content.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/g)].map(([, a, b]) => a ?? b);
  assert(anchors.includes(decodeURIComponent(anchor)), `${relative(kit, doc)} → ${href}`);
}

for (const file of ["DESIGN.md", "docs/design-system-rules.md", "docs/using-yogurt.md", "docs/native-stack.md"]) {
  const doc = join(kit, file);
  for (const [, href] of read(doc).matchAll(/\]\(([^)\s]+)\)/g)) assertLink(doc, href);
}

const listed = call(kit, lookup, "--list");
assert.equal(listed.status, 0, listed.stderr);
for (const id of patternIds) {
  assert(listed.stdout.includes(id), id);
  for (const target of ["web", "native"]) {
    const result = call(kit, lookup, id, target);
    assert.equal(result.status, 0, result.stderr);
    const pattern = JSON.parse(result.stdout);
    assert.equal(pattern.id, id);
    assert(pattern.support[target].level);
    assert(pattern.components.length > 0);
    for (const item of pattern.components) {
      const entry = item.availability[target];
      assert.equal(entry.status, "installed", item.id);
      assertLink(join(kit, "DESIGN.md"), entry.path);
    }
  }
}

assert.equal(call(kit, lookup, "pattern.unknown").status, 2);
assert.equal(call(kit, lookup, patternIds[0], "unknown").status, 2);
const broken = mkdtempSync(join(tmpdir(), "yogurt-broken-kit-"));
try {
  cpSync(kit, broken, { recursive: true });
  const file = join(broken, "catalog/patterns.json");
  const original = read(file);
  renameSync(file, join(broken, "disabled.json"));
  const absent = call(broken, lookup, "--list");
  assert.equal(absent.status, 1);
  assert.match(absent.stderr, /missing catalog\/patterns\.json/);
  writeFileSync(file, "invalid JSON");
  const malformed = call(broken, lookup, "--list");
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /Cannot read catalog\/patterns\.json/);
  writeFileSync(file, JSON.stringify({ ...JSON.parse(original), formatVersion: 99 }));
  const incompatible = call(broken, lookup, "--list");
  assert.equal(incompatible.status, 1);
  assert.match(incompatible.stderr, /Unsupported pattern catalog format 99/);
} finally {
  rmSync(broken, { recursive: true });
}
console.log(`Yogurt ${version}: installed guides, web and Native paths, and failed lookup cases passed.`);
