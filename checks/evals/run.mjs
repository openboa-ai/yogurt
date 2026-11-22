import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { installSdk } from "../fixtures/install-sdk.mjs";
import { decisionCaseId, decisionContract, observeDecision, readDecisionScenario, useDecisionScenario } from "./decision.mjs";
import { permissionConfig, probeFixture } from "./fixture.mjs";
import { decisionRetryHint, gradeCase, outcomeGraders, responseContracts, skillReads, usage } from "./grade.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const candidate = ["yogurt-ui", "yogurt-build", "yogurt-review", "yogurt-feedback"];
const evaluationSkill = "yogurt-evaluate";
const { values: args } = parseArgs({ options: {
  out: { type: "string" },
  case: { type: "string", multiple: true },
  split: { type: "string", default: "development" },
  profiles: { type: "string", default: join(root, "checks/evals/profiles.json") },
  arm: { type: "string", multiple: true },
  "baseline-skill": { type: "string" },
  repeats: { type: "string", default: "1" },
  jobs: { type: "string", default: "1" },
  "max-model-calls": { type: "string", default: "1" },
  "invoke-skill": { type: "string" },
  "agent-guide": { type: "boolean" },
  "decision-scenario": { type: "string" },
  plan: { type: "boolean" },
  sdk: { type: "string" },
  "legacy-sdk": { type: "string" },
  rates: { type: "string" },
} });
const arms = args.arm ?? ["small"];
const repeats = Number(args.repeats);
const parallel = Number(args.jobs);
const callCeiling = Number(args["max-model-calls"]);
const validCount = number => Number.isSafeInteger(number) && number > 0;
if ((!args.out && !args.plan) || !arms.length || arms.some(arm => !["small", "large", "routed", "baseline"].includes(arm)) ||
    !validCount(repeats) || !validCount(parallel) || !validCount(callCeiling)) {
  throw Error("Set --out (or --plan), a valid --arm, and positive --repeats, --jobs and --max-model-calls.");
}

const json = async path => JSON.parse(await readFile(path, "utf8"));
const write = (path, value) => writeFile(path, JSON.stringify(value, null, 2) + "\n");
const suiteFile = join(root, "docs/engineering/adoption/U19D-guide-and-evaluate-skills/evalset.json");
const suite = await json(suiteFile);
const scenarioPath = args["decision-scenario"];
if (scenarioPath !== undefined && (args.case?.length !== 1 || args.case[0] !== decisionCaseId)) {
  throw Error(`Select only --case ${decisionCaseId} when supplying a decision scenario.`);
}
const scenario = scenarioPath === undefined ? undefined : await readDecisionScenario(resolve(scenarioPath));
const selected = args.case
  ? args.case.map(id => {
      const item = suite.cases.find(entry => entry.id === id);
      if (!item) throw Error(`Unknown evaluation case ${id}.`);
      return useDecisionScenario(item, scenario);
    })
  : suite.cases.filter(item => item.split === args.split);
if (!selected.length) throw Error("No evaluation cases selected.");

const caseIds = selected.map(item => item.id);
const invokedSkill = args["invoke-skill"] ?? null;
if (invokedSkill !== null && (
  selected.some(item => item.kind !== "outcome") ||
  (!candidate.includes(invokedSkill) &&
    !(invokedSkill === evaluationSkill && selected.every(item => item.context === "maintainer"))) ||
  (arms.includes("baseline") && invokedSkill !== "yogurt-ui")
)) {
  throw Error("Explicit invocation needs an outcome case and a skill present in every selected arm.");
}
if (new Set(caseIds).size !== caseIds.length || new Set(arms).size !== arms.length) {
  throw Error("Select each case and arm once. Use --repeats for additional samples.");
}
const maximumCalls = repeats * (caseIds.length * arms.length +
  (arms.includes("routed") ? selected.filter(item => item.kind === "outcome").length : 0));
const ungraded = selected.filter(item => item.kind === "outcome" && !Object.hasOwn(outcomeGraders, item.id)).map(item => item.id);
const plan = { caseIds, arms, repeats, parallel, maximumCalls, callCeiling, invokedSkill, agentGuide: args["agent-guide"] ?? false, ungraded };
if (scenario) plan.decisionScenarioDigest = scenario.digest;
if (args.plan) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}
if (maximumCalls > callCeiling) {
  throw Error(`This run can make ${maximumCalls} model calls, above the configured limit of ${callCeiling}. Narrow the selection or set --max-model-calls.`);
}
if (ungraded.length) throw Error(`Add graders before making model calls for ${ungraded.join(", ")}.`);
if (args["agent-guide"] && (!args.sdk || caseIds.includes("decide-installed-only"))) {
  throw Error("The project instruction index needs a compatible --sdk archive.");
}

const profiles = await json(resolve(args.profiles));
for (const tier of ["small", "large"]) {
  if (typeof profiles[tier]?.model !== "string" || typeof profiles[tier]?.effort !== "string") {
    throw Error(`Provide a model ID and reasoning effort for ${tier}.`);
  }
}
const rates = args.rates && await json(resolve(args.rates));
const outputDir = resolve(args.out);
await mkdir(outputDir);
const archive = args.sdk && resolve(args.sdk);
const legacyArchive = args["legacy-sdk"] && resolve(args["legacy-sdk"]);
const digest = async path => path ? createHash("sha256").update(await readFile(path)).digest("hex") : null;
const [sdkDigest, legacySdkDigest] = await Promise.all([digest(archive), digest(legacyArchive)]);
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const host = execFileSync("codex", ["--version"], { encoding: "utf8" }).trim();
const previousSkill = {
  revision: "7448f5e68be86e558dd0fccbaa6536ffc1996c1c",
  sha256: "f192501ab3d6de5d44b8a9049c921b9fd6c470f9817cc4f6037a7abaac21db94",
};
let baseline;
let baselineError;
if (arms.includes("baseline")) {
  try {
    const source = args["baseline-skill"] ? await readFile(resolve(args["baseline-skill"])) :
      execFileSync("git", ["show", `${previousSkill.revision}:skills/yogurt-ui/SKILL.md`], { cwd: root, stdio: "pipe" });
    if (createHash("sha256").update(source).digest("hex") !== previousSkill.sha256) throw Error("Baseline digest mismatch.");
    baseline = source;
  } catch {
    baselineError = "The original baseline skill is unavailable or differs from its recorded digest. Supply --baseline-skill.";
  }
}
await write(join(outputDir, "run.json"), {
  commit, sdkDigest, legacySdkDigest, host, profiles, ...plan,
  baseline: baseline ? previousSkill : null,
  rateCard: rates ? { currency: rates.currency, asOf: rates.asOf } : null,
});

const issueCases = new Set(["feedback-draft-product", "feedback-create-uncertain", "feedback-existing-issue"]);
const promptEnv = { ...process.env };
for (const name of ["OPENAI_API_KEY", "CODEX_API_KEY", "GH_TOKEN", "GITHUB_TOKEN"]) delete promptEnv[name];

async function provision(project, arm, item) {
  const inventory = arm === "baseline" ? ["yogurt-ui"] :
    item.context === "maintainer" ? [...candidate, evaluationSkill] : candidate;
  await mkdir(join(project, ".agents", "skills"), { recursive: true });
  await write(join(project, "fixture.json"), item.inputs);
  const legacy = item.id === "decide-installed-only";
  const firstScreen = item.id === "compose-first-screen";
  if (legacy && legacySdkDigest !== item.fixture.sdkSha256) throw Error("Supply the recorded legacy package with --legacy-sdk.");
  if ((firstScreen || ["decide-sidebar-composition", "build-review-decision"].includes(item.id)) && !archive) {
    throw Error("Supply --sdk for this installed web case.");
  }
  const packageSource = legacy ? legacyArchive : archive;
  const installation = packageSource && await installSdk(project, packageSource, legacy ? legacySdkDigest : sdkDigest);
  if (firstScreen) {
    const native = join(project, "native-consumer");
    const vendor = join(native, "vendor/yogurt");
    await mkdir(vendor, { recursive: true });
    await cp(archive, join(native, "vendor/yogurt.tgz"));
    execFileSync("tar", ["-xzf", archive, "--strip-components=1", "-C", vendor]);
    await write(join(native, "yogurt.config.json"), {
      version: installation.version,
      surfaces: { desktop: { target: "native", root: "src" } },
      nativeSdk: {
        root: "vendor/yogurt", archive: "vendor/yogurt.tgz",
        revision: "sha256:" + sdkDigest, version: installation.version,
      },
    });
  }
  if (issueCases.has(item.id)) {
    const configPath = join(project, "yogurt.config.json");
    const config = installation ? await json(configPath) : {};
    await write(configPath, { ...config, issueRouting: { sdk: "test-org/yogurt", product: "test-org/directory" } });
  }
  for (const name of inventory) {
    if (arm === "baseline") {
      if (!baseline) throw Error(baselineError);
      const directory = join(project, ".agents", "skills", name);
      await mkdir(directory);
      await writeFile(join(directory, "SKILL.md"), baseline);
    } else {
      const source = name === evaluationSkill ? ".agents/skills" : "plugins/yogurt/skills";
      await cp(join(root, source, name), join(project, ".agents", "skills", name), { recursive: true });
    }
  }
  if (arm !== "baseline") {
    await cp(join(root, "plugins/yogurt/bin"), join(project, ".agents/bin"), { recursive: true });
    await cp(join(root, "plugins/yogurt/references"), join(project, ".agents/references"), { recursive: true });
    await cp(join(root, "plugins/yogurt/compatibility.json"), join(project, ".agents/compatibility.json"));
  }
  let agentGuide;
  if (args["agent-guide"]) {
    const guide = execFileSync(process.execPath, [join(root, "plugins/yogurt/bin/resolve-sdk.mjs"), ".", "web", "--agent-guide"],
      { cwd: project, encoding: "utf8" });
    await writeFile(join(project, "AGENTS.md"), guide, { flag: "wx" });
    agentGuide = { bytes: Buffer.byteLength(guide), sha256: createHash("sha256").update(guide).digest("hex") };
  }
  const policy = await permissionConfig(project);
  const preflight = await probeFixture(project, policy, installation, legacy ? "legacy" : arm === "baseline" ? "package" : "resolver");
  return { inventory, installation, policy, preflight: { ...preflight, agentGuide } };
}

async function callAgent(profile, prompt, cwd, policy, fixtureOptions = []) {
  const started = performance.now();
  const child = spawn("codex", [
    "exec", "--strict-config", "--ignore-user-config", "--ephemeral", "--skip-git-repo-check",
    "--json", "-m", profile.model, "-c", "approval_policy=never", "-c",
    `model_reasoning_effort=${profile.effort}`, "-c", 'default_permissions="yogurt_eval"', "-c", 'web_search="disabled"',
    ...policy.options, ...fixtureOptions, "-",
  ], { cwd, env: promptEnv, stdio: ["pipe", "pipe", "ignore"] });
  let transcript = "";
  let timedOut = false;
  let overflow = false;
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", chunk => {
    transcript += chunk;
    if (transcript.length > 5 * 1024 * 1024) {
      overflow = true;
      child.kill();
    }
  });
  child.stdin.on("error", () => {});
  child.stdin.end(prompt);
  const timeout = setTimeout(() => { timedOut = true; child.kill(); }, 90000);
  let code;
  try {
    code = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });
  } finally {
    clearTimeout(timeout);
  }
  let traceComplete = true;
  const events = transcript.split("\n").filter(line => line.trim()).flatMap(line => {
    try {
      const event = JSON.parse(line);
      if (typeof event?.type === "string") return [event];
    } catch {
      // Keep readable evidence without treating this trace as exhaustive.
    }
    traceComplete = false;
    return [];
  });
  const errors = events.filter(event => event.type === "error" || event.type === "turn.failed");
  const modelUnavailable = /model_not_found|model.+not supported|model.+not available/i.test(JSON.stringify(errors));
  const status = timedOut ? "timeout" : overflow ? "invalid-trace" : modelUnavailable ? "model-unavailable"
    : code === 0 && events.some(event => event.type === "turn.completed") ? "completed" : "runner-error";
  const answer = events.filter(event => event.type === "item.completed" && event.item?.type === "agent_message")
    .at(-1)?.item.text ?? "";
  return { status, answer, elapsedMs: Math.round(performance.now() - started), events, traceComplete, tokens: usage(events) };
}

function estimate(model, tokens) {
  const rate = rates?.models?.[model];
  if (!tokens || !rates?.currency || !rates?.asOf || !rate ||
      [rate.input, rate.cachedInput, rate.output].some(value => !Number.isFinite(value) || value < 0)) return null;
  return ((tokens.input_tokens - tokens.cached_input_tokens) * rate.input +
    tokens.cached_input_tokens * rate.cachedInput + tokens.output_tokens * rate.output) / 1_000_000;
}

async function trial({ item, arm, repeat }) {
  const dir = join(outputDir, `${item.id}--${arm}--${repeat}`);
  await mkdir(dir);
  const attempts = [];
  const run = async (tier, extraPrompt = "") => {
    const sequence = attempts.length + 1;
    const project = join(dir, `consumer-${sequence}`);
    const profile = profiles[tier];
    let fixture;
    try {
      fixture = await provision(project, arm, item);
    } catch (error) {
      const outcome = gradeCase(item, { status: "fixture-unavailable" });
      attempts.push({ sequence, tier, ...profile, ...outcome, setupError: error.message, elapsedMs: null, tokens: null,
        rateCardEstimate: null, observedCharge: null });
      return;
    }
    const mount = fixture.installation ? "\nThis project has @openboa/yogurt installed and pinned in package-lock.json." : "";
    const response = item.id === decisionCaseId ? decisionContract(scenario) : responseContracts[item.id];
    const contract = response ? "\n\n" + response : "";
    const invocation = invokedSkill ? `\n\nRead .agents/skills/${invokedSkill}/SKILL.md and use its workflow for this task.` : "";
    const prompt = `${item.prompt}\n\nFixture facts:\n${JSON.stringify(item.inputs)}${mount}${invocation}${contract}${extraPrompt}`;
    const issueEvidence = issueCases.has(item.id) ? join(dir, `issue-evidence-${sequence}.json`) : null;
    const issueOptions = issueEvidence ? [
      `mcp_servers.issue_fixture.command=${JSON.stringify(process.execPath)}`,
      `mcp_servers.issue_fixture.args=${JSON.stringify([join(root, "checks/evals/issue-fixture.mjs"), item.id, project, issueEvidence])}`,
      'mcp_servers.issue_fixture.enabled_tools=["report_issue"]',
      'mcp_servers.issue_fixture.default_tools_approval_mode="approve"',
    ].flatMap(setting => ["-c", setting]) : [];
    const { events, answer, ...observed } = await callAgent(profile, prompt, project, fixture.policy, issueOptions);
    const skills = skillReads(events, fixture.inventory);
    const decision = item.id === decisionCaseId && observed.status === "completed"
      ? await observeDecision(answer, item.inputs.records, project, join(dir, `browser-${sequence}`), scenario)
      : undefined;
    let status = decision?.unavailable ? "browser-unavailable" : observed.status;
    let issue;
    if (issueEvidence) {
      try {
        issue = await json(issueEvidence);
      } catch (error) {
        if (status === "completed") status = error.code === "ENOENT" ? "issue-service-unavailable" : "invalid-trace";
      }
    }
    const outcome = gradeCase(item, { ...observed, status, decision, issue, events, answer, skills, fixturePreflight: fixture.preflight });
    await write(join(dir, `attempt-${sequence}-trace.json`), events);
    await writeFile(join(dir, `attempt-${sequence}-answer.txt`), answer);
    attempts.push({
      sequence, tier, ...profile, skills, ...observed, ...outcome, fixturePreflight: fixture.preflight,
      skillReadObserved: invokedSkill ? skills.includes(invokedSkill) : undefined,
      decision, issueEvidence, modelElapsedMs: observed.elapsedMs, elapsedMs: observed.elapsedMs + (decision?.elapsedMs ?? 0),
      rateCardEstimate: estimate(profile.model, observed.tokens), observedCharge: null,
    });
  };
  await run(arm === "large" ? "large" : "small");
  let escalation;
  if (arm === "routed" && attempts[0].status === "failed" && item.kind === "outcome") {
    const hint = item.id === "build-review-decision" ? decisionRetryHint(attempts[0].decision) :
      "A prior implementation did not pass a required acceptance check. Recheck the user contract.";
    escalation = hint ? "attempted" : "skipped";
    if (hint) await run("large", "\n" + hint);
  }
  const final = attempts.at(-1);
  const result = { id: item.id, arm, repeat, critical: item.critical ?? false, status: final.status, escalation, attempts };
  await write(join(dir, "result.json"), result);
  console.log(item.id, arm, repeat, result.status);
  return result;
}

const jobs = [];
for (let repeat = 1; repeat <= repeats; repeat++) {
  for (const item of selected) {
    const ordered = repeat % 2 ? arms : [...arms].reverse();
    for (const arm of ordered) jobs.push({ item, arm, repeat });
  }
}
const rows = [];
let index = 0;
await Promise.all(Array.from({ length: Math.min(parallel, jobs.length) }, async () => {
  while (index < jobs.length) {
    const job = jobs[index++];
    rows.push(await trial(job));
  }
}));

function total(items, key) {
  return items.some(a => a[key] === null) ? null : items.reduce((sum, a) => sum + a[key], 0);
}
function percentile(samples, rank) {
  return samples[Math.max(0, Math.ceil(samples.length * rank) - 1)] ?? null;
}
function summarize(arm) {
  const observed = rows.filter(row => row.arm === arm);
  const attempts = observed.flatMap(row => row.attempts);
  const passed = observed.filter(row => row.status === "passed").length;
  const tokens = attempts.some(a => a.tokens === null) ? null : attempts.reduce(
    (count, a) => count + a.tokens.input_tokens + a.tokens.output_tokens, 0);
  const estimateTotal = total(attempts, "rateCardEstimate");
  const durations = observed.map(row => total(row.attempts, "elapsedMs")).filter(Number.isFinite).sort((a, b) => a - b);
  return {
    arm, samples: observed.length, attempts: attempts.length, passed,
    criticalFailures: observed.filter(row => row.critical && row.status === "failed").length,
    statuses: observed.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] ?? 0) + 1 }), {}),
    tokens, tokensPerPassedTask: tokens !== null && passed ? tokens / passed : null,
    p50Ms: percentile(durations, 0.5), p95Ms: percentile(durations, 0.95),
    observedCostPerPassedTask: null,
    estimatedCostPerPassedTask: estimateTotal !== null && passed ? estimateTotal / passed : null,
  };
}
await write(join(outputDir, "summary.json"), { arms: arms.map(summarize), results: rows.map(({ attempts, ...row }) => row) });
