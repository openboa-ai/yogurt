import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installSdk } from "../checks/fixtures/install-sdk.mjs";
import { decisionCaseId, observeDecision, readDecisionScenario, useDecisionScenario } from "./decision.mjs";
import { gradeCase } from "./grade.mjs";

const [previous, archive, output, scenarioPath] = process.argv.slice(2).map(value => resolve(value));
if (!output) throw Error("Usage: node evals/replay-decision.mjs <previous-report> <sdk-archive> <new-output-dir> [original-decision-scenario]");

const caseId = decisionCaseId;
const root = fileURLToPath(new URL("../", import.meta.url));
const json = async path => JSON.parse(await readFile(path, "utf8"));
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8" });
const run = await json(join(previous, "run.json"));
const summary = await json(join(previous, "summary.json"));
assert.match(run.commit, /^[0-9a-f]{40}$/);
assert.match(run.sdkDigest, /^[0-9a-f]{64}$/);
const scenario = scenarioPath ? await readDecisionScenario(scenarioPath) : undefined;
assert.equal(scenario?.digest, run.decisionScenarioDigest, "Replay requires the original grader scenario digest.");
const suitePath = "docs/engineering/adoption/U19D-guide-and-evaluate-skills/evalset.json";
const frozen = JSON.parse(git(["show", `${run.commit}:${suitePath}`]));
const item = frozen.cases.find(entry => entry.id === caseId);
const decisionRows = summary.results.filter(row => row.id === caseId);
assert(item && decisionRows.length > 0, "The source report must contain a completed decision evaluation.");
const selected = useDecisionScenario(item, scenario);

await mkdir(output);
const project = join(output, "consumer");
await mkdir(project);
const installation = await installSdk(project, archive, run.sdkDigest);
const results = [];
for (const { arm, repeat } of decisionRows) {
  assert(["baseline", "small", "large", "routed"].includes(arm) && Number.isSafeInteger(repeat) && repeat > 0);
  const name = `${caseId}--${arm}--${repeat}`;
  const original = await json(join(previous, name, "result.json"));
  const attempts = [];
  for (const attempt of original.attempts) {
    const { sequence, status: previousStatus } = attempt;
    assert(Number.isSafeInteger(sequence) && sequence > 0);
    if (!attempt.decision) {
      attempts.push({ sequence, previousStatus, status: previousStatus, replayed: false });
      continue;
    }
    const answer = await readFile(join(previous, name, `attempt-${sequence}-answer.txt`), "utf8");
    const decision = await observeDecision(answer, selected.inputs.records, project, join(output, `${name}--${sequence}`), scenario);
    const grade = gradeCase(selected, { status: decision.unavailable ? "browser-unavailable" : "completed", decision });
    attempts.push({ sequence, previousStatus, ...grade, replayed: true, decision });
  }
  results.push({ arm, repeat, previousStatus: original.status, status: attempts.at(-1).status, attempts });
  console.log(caseId, arm, repeat, original.status, "→", attempts.at(-1).status);
}
await writeFile(join(output, "replay.json"), JSON.stringify({
  originalRevision: run.commit, graderRevision: git(["rev-parse", "HEAD"]).trim(),
  decisionScenarioDigest: scenario?.digest, installation, modelCalls: 0, results,
}, null, 2) + "\n");
