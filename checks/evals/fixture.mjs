import { execFileSync } from "node:child_process";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function permissionConfig(project) {
  const node = await realpath(process.execPath);
  const runtime = node.match(/^(.+)\/Cellar\/node(?:@[^/]+)?\/[^/]+\/bin\/node$/)?.[1];
  const roots = [await realpath(project), dirname(node)];
  if (runtime) roots.push(join(runtime, "Cellar"), join(runtime, "opt"));
  const readRules = [
    '":root"="deny"', '":minimal"="read"', '":slash_tmp"="deny"',
    ...[...new Set(roots)].map(path => `${JSON.stringify(path)}="read"`),
    '"/private/tmp"="deny"', '"/private/var/tmp"="deny"',
  ].join(",");
  const env = { PATH: `${dirname(node)}:/usr/bin:/bin`, OPENSSL_CONF: "/dev/null" };
  const options = [
    `permissions.yogurt_eval.filesystem={${readRules}}`, "permissions.yogurt_eval.network.enabled=false",
    "allow_login_shell=false", 'shell_environment_policy.inherit="none"',
    ...Object.entries(env).map(([key, value]) => `shell_environment_policy.set.${key}=${JSON.stringify(value)}`),
  ].flatMap(setting => ["-c", setting]);
  return { options, env };
}

const probe = `
  const fs = require('node:fs');
  const assert = require('node:assert/strict');
  JSON.parse(fs.readFileSync('fixture.json', 'utf8'));
  const denied = { code: /^(EPERM|EACCES)$/ };
  assert.throws(() => fs.readFileSync(process.argv[1]), denied);
  for (const path of JSON.parse(process.argv[4])) assert.throws(() => fs.readFileSync(path), denied, path);
  assert.throws(() => fs.writeFileSync('write-probe', ''), denied);
  if (process.argv[2] === 'resolver') {
    const answer = require('node:child_process').execFileSync(process.execPath,
      ['.agents/bin/resolve-sdk.mjs', '.', 'web'], { encoding: 'utf8' });
    const install = JSON.parse(answer);
    assert.equal(install.revision, process.argv[3]);
    assert.equal(install.kit, fs.realpathSync('node_modules/@openboa/yogurt'));
    console.log(JSON.stringify(install));
  } else if (process.argv[2]) {
    const lock = JSON.parse(fs.readFileSync('node_modules/.package-lock.json', 'utf8'));
    assert.equal(lock.packages['node_modules/@openboa/yogurt'].integrity, process.argv[3]);
    const entry = require('node:child_process').execFileSync(process.execPath,
      ['--input-type=module', '-e', 'console.log(import.meta.resolve("@openboa/yogurt"))'], { encoding: 'utf8' }).trim();
    const observation = { entry, revision: process.argv[3] };
    if (process.argv[2] === 'legacy') {
      const sdk = 'node_modules/@openboa/yogurt/';
      fs.accessSync(sdk + 'DESIGN.md');
      fs.accessSync(sdk + 'bin/yogurt.mjs');
      fs.accessSync(sdk + 'packages/native/controls/items/button.native');
      assert.throws(() => fs.accessSync(sdk + 'catalog/patterns.json'), { code: 'ENOENT' });
      assert.throws(() => fs.accessSync(sdk + 'scripts/describe-pattern.mjs'), { code: 'ENOENT' });
      observation.missingPatternResources = true;
    }
    console.log(JSON.stringify(observation));
  }
`;

export async function probeFixture(project, policy, installation, sdkProbe) {
  const canary = join(dirname(project), "outside-fixture.txt");
  await writeFile(canary, "Synthetic evaluator-only file.\n");
  const directories = [];
  let stdout;
  try {
    for (const parent of ["/private/tmp", "/private/var/tmp"]) {
      const directory = await mkdtemp(join(parent, "yogurt-eval-canary-"));
      directories.push(directory);
      await writeFile(join(directory, "canary"), "Synthetic evaluator-only file.\n");
    }
    const canaries = directories.flatMap(path => {
      const file = join(path, "canary");
      return [file, file.replace(/^\/private/, "")];
    });
    const args = [sdkProbe ?? "", installation?.integrity ?? "", JSON.stringify(canaries)];
    stdout = execFileSync("codex", ["sandbox", "-P", "yogurt_eval", ...policy.options, "--",
      process.execPath, "-e", probe, canary, ...args], {
      cwd: project, env: { ...policy.env, PATH: process.env.PATH }, encoding: "utf8", timeout: 15000,
    });
  } finally {
    await Promise.all(directories.map(path => rm(path, {recursive: true, force: true})));
  }
  return {
    fixtureRead: true, siblingReadDenied: true, writeDenied: true, archiveSha256: installation?.sha256 ?? null,
    sdk: stdout.trim() ? JSON.parse(stdout) : null,
  };
}
