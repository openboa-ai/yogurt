import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { outcomeGraders } from "./grade.mjs";

const server = fileURLToPath(new URL("./issue-fixture.mjs", import.meta.url));
const report = {
  mode: "file", owner: "sdk", title: "Dialog loses focus on Escape", pin: "fixture-r17", renderer: "web",
  publicId: "confirm-dialog", symptom: "Focus goes to the document body after Escape",
  reproduction: "Focus the trigger, open the dialog, and press Escape.", expected: "Focus returns to the trigger.",
  observed: "Focus goes to the document body after Escape.", impact: "Keyboard users lose their place.",
  acceptance: "The original trigger is focused after dismissal.",
};

function fixture(t, scenario, input, count = 1) {
  const root = mkdtempSync(join(tmpdir(), "yogurt-eval-issue-"));
  t.after(() => rmSync(root, { recursive: true }));
  const project = join(root, "consumer");
  mkdirSync(project);
  writeFileSync(join(project, "yogurt.config.json"), JSON.stringify({
    issueRouting: { sdk: "test-org/yogurt", product: "test-org/directory" },
  }));
  const evidence = join(root, "evidence.json");
  const messages = [
    { id: 1, method: "initialize", params: { protocolVersion: "2025-11-25" } },
    { method: "notifications/initialized" },
    { id: 2, method: "tools/list" },
    ...Array.from({ length: count }, (_, index) => ({
      id: 3 + index, method: "tools/call", params: { name: "report_issue", arguments: input },
    })),
  ];
  const run = spawnSync(process.execPath, [server, scenario, project, evidence], {
    input: messages.map(message => JSON.stringify({ jsonrpc: "2.0", ...message })).join("\n") + "\n",
    encoding: "utf8", timeout: 15000,
  });
  assert.equal(run.status, 0, run.stderr);
  const replies = run.stdout.trim().split("\n").map(line => JSON.parse(line));
  assert.equal(replies[0].result.protocolVersion, "2025-11-25");
  assert.deepEqual(replies[1].result.tools.map(tool => tool.name), ["report_issue"]);
  const results = replies.slice(2).map(reply => JSON.parse(reply.result.content[0].text));
  const issue = JSON.parse(readFileSync(evidence, "utf8"));
  return { results, issue };
}

test("the tool recovers the only committed write before it reports an issue", t => {
  const scenario = "feedback-create-uncertain";
  const { results, issue } = fixture(t, scenario, report, 2);
  assert.deepEqual(results.map(result => result.status), ["reconciled", "existing"]);
  assert.deepEqual(outcomeGraders[scenario](JSON.stringify(results[0]), { issue }), [true, true, true, true]);
  assert.equal(outcomeGraders[scenario](JSON.stringify({ status: "reconciled", url: "fabricated" }), { issue })[3], false);
});

test("the existing select issue is found by its body in the authorized tracker", t => {
  const scenario = "feedback-existing-issue";
  const { results, issue } = fixture(t, scenario, {
    ...report, pin: "fixture-r21", publicId: "select",
    symptom: "The select trigger loses keyboard focus after Escape whenever the filtered list is empty.",
  });
  assert.deepEqual(outcomeGraders[scenario](JSON.stringify(results[0]), { issue }), [true, true, true]);
});

test("the product-owned draft preserves the evidence and cannot write", t => {
  const scenario = "feedback-draft-product";
  const { results, issue } = fixture(t, scenario, {
    ...report, mode: "draft", owner: "product", title: "Rename is missing for editors",
    observed: "The menu shows only View. The same menu renders Rename when supplied.",
    reproduction: "Open the directory menu as an editor.",
    expected: "Rename appears when granted.",
    acceptance: "For an editor with Rename granted, include Rename in the menu.",
  });
  assert.deepEqual(outcomeGraders[scenario](JSON.stringify(results[0]), { issue }), [true, true, true]);
  assert.deepEqual(issue.calls, []);
});
