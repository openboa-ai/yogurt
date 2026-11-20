import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

const [rootArg, installedArg] = process.argv.slice(2);
if (!rootArg) throw Error("Usage: node checks/plugin-catalog.mjs <checkout-or-project> [installed-plugin-root]");
const root = realpathSync(rootArg);
const pluginRoot = installedArg ? realpathSync(installedArg) : join(root, "plugins/yogurt");
const manifest = JSON.parse(readFileSync(join(pluginRoot, ".codex-plugin/plugin.json"), "utf8"));
const marketplacePath = join(root, ".agents/plugins/marketplace.json");
const child = spawn("codex", ["app-server", "--stdio"], { cwd: root, stdio: ["pipe", "pipe", "ignore"] });
const lines = createInterface({ input: child.stdout });
const requests = new Map();
let nextId = 1;

function fail(error) {
  for (const { reject } of requests.values()) reject(error);
  requests.clear();
}

child.on("error", fail);
child.on("exit", code => fail(Error(`Codex app-server exited with ${code}.`)));
lines.on("line", line => {
  try {
    const reply = JSON.parse(line);
    const request = requests.get(reply.id);
    if (!request) return;
    requests.delete(reply.id);
    if (reply.error) request.reject(Error(reply.error.message));
    else request.resolve(reply.result);
  } catch (error) {
    fail(error);
  }
});

function send(message) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
}

async function request(method, params) {
  const id = nextId++;
  const wait = setTimeout(() => {
    requests.get(id)?.reject(Error(`Codex app-server timed out on ${method}.`));
    requests.delete(id);
  }, 15000);
  try {
    return await new Promise((resolve, reject) => {
      requests.set(id, { resolve, reject });
      send({ id, method, params });
    });
  } finally {
    clearTimeout(wait);
  }
}

try {
  await request("initialize", { clientInfo: { name: "yogurt-plugin-check", version: "0.1.0" } });
  send({ method: "initialized" });
  let skills;
  if (installedArg) {
    const { data } = await request("skills/list", { cwds: [root], forceReload: true });
    skills = data.flatMap(entry => entry.skills).filter(skill => skill.name.startsWith("yogurt:"));
    assert(skills.every(item => item.enabled === true));
  } else {
    const { plugin } = await request("plugin/read", { marketplacePath, pluginName: "yogurt" });
    assert.equal(plugin.summary.id, "yogurt@openboa-yogurt");
    assert.equal(plugin.summary.localVersion, manifest.version);
    skills = plugin.skills;
  }
  const expected = ["yogurt-build", "yogurt-feedback", "yogurt-review", "yogurt-ui"];
  assert.deepEqual(skills.map(skill => skill.name).sort(), expected.map(name => "yogurt:" + name));
  for (const item of skills) {
    const name = item.name.split(":").at(-1);
    assert.equal(item.path, join(pluginRoot, "skills", name, "SKILL.md"));
    if (name === "yogurt-ui" || name === "yogurt-review") {
      const guide = "../../references/composition.md";
      assert.ok(readFileSync(item.path, "utf8").includes(`](${guide})`));
      assert.match(readFileSync(join(dirname(item.path), guide), "utf8"), /^# Composing a screen\n/);
    }
  }
  console.log(`Codex recognized ${skills.length} Yogurt skills from ${installedArg ? "the installed cache" : "the marketplace snapshot"} at version ${manifest.version}.`);
} finally {
  lines.close();
  child.stdin.end();
  child.kill();
}
