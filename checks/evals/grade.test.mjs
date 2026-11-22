import assert from "node:assert/strict";
import test from "node:test";
import { decisionRetryHint, gradeCase, outcomeGraders, skillReads, usage } from "./grade.mjs";

const series = { id: "build-series-rows", kind: "outcome", assertions: ["function", "observations", "permissions", "immutability"] };
const correct = `function seriesRows(observations,canRead) {
  return canRead ? observations.map(({time,value}) => ({time,label:value===null?"Unavailable":String(value)})) : [];
}`;

test("the first screen needs both installed target bindings and host recovery", () => {
  const grade = plan => outcomeGraders["compose-first-screen"](JSON.stringify(plan));
  const plan = {
    pattern: "pattern.find-records",
    web: ["@openboa/yogurt/search-field", "@openboa/yogurt/list-row"],
    native: ["yg-search-field", "yg-list"],
    stateOwner: "host",
    retains: ["query", "selectedId"],
    recovery: "Clear the unmatched query and check focus returns to search.",
  };
  assert.deepEqual(grade(plan), [true, true, true, true]);
  assert.deepEqual(grade({ ...plan, native: plan.web, recovery: { toString: null } }), [true, true, false, false]);
});

test("checks zero, missing values, ordering, denied access and frozen inputs", () => {
  const grade = answer => gradeCase(series, { status: "completed", answer });
  assert.equal(grade(correct).status, "passed");
  assert.equal(grade(correct.replace("value===null", "!value")).status, "failed");
  assert.equal(grade(correct.replace("observations.map", "observations.reverse().map")).status, "failed");
  assert.equal(grade(correct.replace("canRead ?", "true ?")).status, "failed");
  assert.equal(grade("```js\n" + correct + "\n```").status, "failed");
});

test("requires evidence for task, routing and host status", () => {
  const route = { id: "route", kind: "routing", expected_skill: "yogurt-ui", assertions: ["observed selection"] };
  assert.equal(gradeCase(route, { status: "completed", skills: [] }).status, "unobserved");
  assert.equal(gradeCase(route, { status: "completed", skills: ["yogurt-ui"] }).status, "passed");
  assert.equal(gradeCase(route, { status: "completed", skills: ["yogurt-review"] }).status, "failed");
  assert.equal(gradeCase({ ...series, id: "new-case" }, { status: "completed" }).status, "unobserved");
  assert.equal(gradeCase(series, { status: "timeout" }).status, "timeout");
  assert.equal(gradeCase(series, { status: "model-unavailable" }).status, "model-unavailable");
});

test("only a complete tool-free turn proves that no skill required a read", () => {
  const item = { id: "route-unrelated", kind: "routing", expected_skill: "none", assertions: ["no skill read"] };
  const start = { type: "turn.started" };
  const answer = { type: "item.completed", item: { type: "agent_message" } };
  const end = { type: "turn.completed" };
  const attempt = { status: "completed", skills: [], events: [start, answer, end], traceComplete: true };
  assert.equal(gradeCase(item, attempt).status, "passed");
  assert.equal(gradeCase({ ...item, expected_skill: "yogurt-ui" }, attempt).status, "failed");
  assert.equal(gradeCase(item, { ...attempt, skills: ["yogurt-ui"] }).status, "failed");
  assert.equal(gradeCase(item, { ...attempt, traceComplete: false }).status, "unobserved");
  assert.equal(gradeCase(item, { ...attempt, traceComplete: false, skills: ["yogurt-ui"] }).status, "unobserved");
  assert.equal(gradeCase(item, { ...attempt, events: [start, end] }).status, "unobserved");
  const opaque = { type: "item.completed", item: { type: "command_execution" } };
  assert.equal(gradeCase(item, { ...attempt, events: [start, opaque, answer, end] }).status, "unobserved");
});

test("rejects breached profiles and compares measured results on matched tasks", () => {
  const item = { id: "evaluate-efficient-profile", kind: "outcome", assertions: ["eligibility", "metrics", "trial", "limits"] };
  const grade = answer => gradeCase(item, { status: "completed", answer: JSON.stringify(answer) });
  const correctReport = {
    profiles: {
      A: { eligible: true, accepted: 3, fixtureCostPerAcceptedTask: 0.10, p50Seconds: 10 },
      B: { eligible: false, reason: "disclosure", accepted: 2, fixtureCostPerAcceptedTask: 0.03, p50Seconds: 3 },
      C: { eligible: true, accepted: 3, fixtureCostPerAcceptedTask: 0.04, p50Seconds: 6 },
    },
    nextTrial: "C", useMatchedTasks: true, countRetries: true,
    currency: "synthetic fixture dollar", attemptsPerProfile: 3, requireIndependentRepeat: true,
    explanation: "C met the requirement and had the lowest observed cost and latency among the eligible profiles.",
  };
  assert.equal(grade(correctReport).status, "passed");
  assert.equal(grade(null).status, "failed");
  assert.equal(grade({ ...correctReport, nextTrial: "B" }).assertions[2].result, false);
  assert.equal(grade({ ...correctReport, countRetries: false }).assertions[2].result, false);
  assert.equal(grade({ ...correctReport, currency: "USD" }).assertions[3].result, false);
});

test("requires the observed legacy install and distinguishes native files from native behavior", () => {
  const item = { id: "decide-installed-only", kind: "outcome", assertions: ["inventory", "native", "isolation"] };
  const fixturePreflight = { siblingReadDenied: true, sdk: { missingPatternResources: true } };
  const report = {
    installedVersion: "0.1.0-local.15",
    availableEntry: "node_modules/@openboa/yogurt/DESIGN.md",
    missingResources: ["catalog/patterns.json", "./node_modules/@openboa/yogurt/scripts/describe-pattern.mjs"],
    nativeInteractionEvidence: "unverified",
    reproduction: "Read the lock and check node_modules/@openboa/yogurt/catalog/patterns.json.",
  };
  const grade = (answer, evidence) => gradeCase(item, { status: "completed", answer: JSON.stringify(answer), fixturePreflight: evidence });
  assert.equal(grade(report, fixturePreflight).status, "passed");
  assert.equal(grade({ ...report, nativeInteractionEvidence: "verified" }, fixturePreflight).assertions[1].result, false);
  assert.equal(grade(report, undefined).assertions[2].result, false);
  assert.equal(grade({ ...report, missingResources: [] }, fixturePreflight).assertions[0].result, false);
});

test("accepts an observed diagnostic for the exact legacy pin as reproduction", () => {
  const item = { id: "decide-installed-only", kind: "outcome", assertions: ["inventory", "native", "isolation"] };
  const missing = ["catalog/patterns.json", "scripts/describe-pattern.mjs"];
  const reproduction = "node .agents/bin/resolve-sdk.mjs . web --inspect";
  const answer = JSON.stringify({
    installedVersion: "0.1.0-local.15", availableEntry: "DESIGN.md", missingResources: missing,
    nativeInteractionEvidence: "unverified", reproduction,
  });
  const fixturePreflight = { siblingReadDenied: true, sdk: { missingPatternResources: true, revision: "fixture-pin" } };
  const grade = (revision, exitCode = 0) => gradeCase(item, {
    status: "completed", answer, fixturePreflight,
    events: [{ type: "item.completed", item: {
      type: "command_execution", exit_code: exitCode, command: reproduction + "; rg check",
      aggregated_output: JSON.stringify({ status: "missing-resources", target: "web", revision, missing }),
    } }],
  });
  assert.equal(grade("fixture-pin").status, "passed");
  assert.equal(grade("fixture-pin", 127).status, "passed");
  assert.equal(grade("other-pin").assertions[2].result, false);
});

test("reads trace evidence and preserves unknown usage", () => {
  const event = { type: "item.completed", item: { type: "command_execution", exit_code: 0,
    command: "cat .agents/skills/yogurt-ui/SKILL.md", aggregated_output: "---\nname: yogurt-ui\n---" } };
  assert.deepEqual(skillReads([event], ["yogurt-ui"]), ["yogurt-ui"]);
  assert.deepEqual(skillReads([{ ...event, item: { ...event.item, aggregated_output: "SKILL.md" } }], ["yogurt-ui"]), []);
  assert.deepEqual(skillReads([{ ...event, item: {
    ...event.item, exit_code: 1, aggregated_output: event.item.aggregated_output + "\nsed: missing adjacent guide",
  } }], ["yogurt-ui"]), ["yogurt-ui"]);
  const receipt = { type: "turn.completed", usage: {
    input_tokens: 100, cached_input_tokens: 20, output_tokens: 40, reasoning_output_tokens: 10,
  } };
  assert.deepEqual(usage([receipt, receipt]), {
    input_tokens: 200, cached_input_tokens: 40, output_tokens: 80, reasoning_output_tokens: 20,
  });
  assert.equal(usage([{ type: "turn.completed" }]), null);
  assert.equal(usage([{ ...receipt, usage: { ...receipt.usage, cached_input_tokens: 101 } }]), null);
});

test("distinguishes missing coverage from an observed zero and requires a withdrawal check", () => {
  const review = {
    zeroAt: "09:00", missingAt: "10:00", missingLabel: "Unavailable",
    observedAt: "13:00 UTC", shownUpdatedAt: "14:30 UTC", withdrawnAt: "14:35",
    remainingSurface: "readings dialog", evidence: ["capture", "source"], liveVerified: false,
    verification: {
      missing: "Verify both visible readings and screen reader text.",
      time: "Verify the observation timestamp of 13:00.",
      withdrawal: "Revoke access with the dialog open and verify the values are absent.",
    },
  };
  const grade = answer => outcomeGraders["review-coverage"](JSON.stringify(answer));
  assert.deepEqual(grade(review), [true, true, true, true]);
  assert.equal(grade({ ...review, missingLabel: "0" })[0], false);
  assert.equal(grade({ ...review, remainingSurface: "chart" })[2], false);
  assert.equal(grade({ ...review, liveVerified: true })[3], false);
});

test("credits roster labels and rejects motion signoff from stills", () => {
  const review = {
    observedStills: true, readableStateLabels: true, reducedMotionLabel: true, motionStatus: "unverified",
    replay: "Capture normal-speed Waiting and Working at 24px.",
    comparison: "Compare guesses from unlabeled clips against the known state.",
    reducedMotionCheck: "Check that the visual and accessible label remains in reduced motion.",
  };
  const grade = answer => outcomeGraders["review-roster-motion"](JSON.stringify(answer));
  assert.deepEqual(grade(review), [true, true, true]);
  assert.equal(grade({ ...review, motionStatus: "verified" })[1], false);
  assert.equal(grade({ ...review, comparison: "Ask whether the animations look different." })[2], false);
});

test("a decision retry needs verified wiring and an isolated recovery or outcome failure", () => {
  assert.equal(decisionRetryHint(undefined), null);
  assert.equal(decisionRetryHint({ assertions: [false, null, null, null] }), null);
  assert.equal(decisionRetryHint({ assertions: [true, false, null, null] }), null);
  assert.equal(decisionRetryHint({ assertions: [true, true, false, null], receiptReferences: { otherRecord: 1 } }), null);
  assert.match(decisionRetryHint({ assertions: [true, true, false, null] }), /reopening/);
  assert.match(decisionRetryHint({ assertions: [true, true, true, false] }), /accessibility tree/);
  assert.equal(decisionRetryHint({ assertions: [true, true, true, true] }), null);
});

test("the printing brief requires the original receipt and a matching host result", () => {
  const grade = answer => outcomeGraders["decide-uncertain-print-receipt"](JSON.stringify(answer));
  const correct = {
    scope: { station: "Copper", job: "x-1", receipt: "k-83" },
    stateAfterOtherStationCompletes: "unknown",
    recovery: { action: "lookup", receipt: "k-83", resubmit: false },
    confirmation: { source: "host", match: "original-receipt", visibleState: "confirmed" },
  };
  assert.deepEqual(grade(correct), [true, true, true, true]);
  assert.equal(grade({ ...correct, stateAfterOtherStationCompletes: "confirmed" })[1], false);
  assert.equal(grade({ ...correct, recovery: { ...correct.recovery, resubmit: true } })[2], false);
  assert.equal(grade({ ...correct, confirmation: { ...correct.confirmation, match: "poster-label" } })[3], false);
});

test("state copy can pass structured checks while editorial review remains unobserved", () => {
  const grade = answer => outcomeGraders["review-brand-voice"](JSON.stringify(answer));
  const correct = {
    empty: { copy: "No accession records yet.", action: null },
    unavailable: { copy: "Could not load records.", action: "Refresh" },
  };
  assert.deepEqual(grade(correct), [true, true, true, null]);
  assert.equal(grade({ ...correct, unavailable: { ...correct.unavailable, copy: correct.empty.copy } })[1], false);
  assert.equal(grade({ ...correct, empty: { ...correct.empty, action: "Add records" } })[0], false);
});

test("visual preference and lower latency cannot overrule an observed disclosure", () => {
  const grade = answer => outcomeGraders["evaluate-new-regression"](JSON.stringify(answer));
  const correct = {
    decision: "hold", regression: "Shows a previous account's record after switching.",
    preferred: 5, comparisons: 6, visualPreferenceProvesSafety: false, observedCost: null,
    retest: "Reproduce the account switch, then exercise an independent kiosk task.",
  };
  assert.deepEqual(grade(correct), [true, true, true]);
  assert.equal(grade({ ...correct, decision: "adopt" })[0], false);
  assert.equal(grade({ ...correct, visualPreferenceProvesSafety: true })[1], false);
  assert.equal(grade({ ...correct, observedCost: 0 })[2], false);
});
