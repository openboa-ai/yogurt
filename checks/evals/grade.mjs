import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import ts from "typescript";

export function usage(events) {
  const turns = events.filter(event => event.type === "turn.completed");
  if (!turns.length || turns.some(event => !event.usage)) return null;
  const keys = ["input_tokens", "cached_input_tokens", "output_tokens", "reasoning_output_tokens"];
  if (turns.some(event => keys.some(key => !Number.isSafeInteger(event.usage[key]) || event.usage[key] < 0 ||
    event.usage.cached_input_tokens > event.usage.input_tokens || event.usage.reasoning_output_tokens > event.usage.output_tokens))) {
    return null;
  }
  return Object.fromEntries(keys.map(key => [key, turns.reduce((sum, event) => sum + event.usage[key], 0)]));
}

export function skillReads(events, inventory) {
  const observed = [];
  for (const event of events) {
    const item = event.item;
    if (event.type !== "item.completed" || item?.type !== "command_execution") continue;
    const lines = item.aggregated_output?.split(/\r?\n/) ?? [];
    for (const name of inventory) {
      // An invocation, filename or agent claim alone does not prove the file was read.
      const frontmatter = lines.findIndex((line, index) => line === "name: " + name && lines[index - 1] === "---");
      if (item.command?.includes(`${name}/SKILL.md`) &&
          frontmatter >= 0 && lines.indexOf("---", frontmatter + 1) >= 0 && !observed.includes(name)) {
        observed.push(name);
      }
    }
  }
  return observed;
}

function observedRoute({ skills, events, traceComplete }) {
  if (traceComplete === false) return null;
  if (skills?.length) return skills[0];
  if (traceComplete !== true || events?.at(-1)?.type !== "turn.completed") return null;
  const turnMarkers = ["thread.started", "turn.started", "turn.completed"];
  const responseEvents = ["item.started", "item.updated", "item.completed"];
  const responseItems = ["reasoning", "agent_message"];
  const toolFree = events.every(event => turnMarkers.includes(event.type) ||
    (responseEvents.includes(event.type) && responseItems.includes(event.item?.type)));
  const started = events.some(event => event.type === "turn.started");
  const answered = events.some(event => event.type === "item.completed" && event.item?.type === "agent_message");
  return toolFree && started && answered ? "none" : null;
}

const seriesTests = [
  "(() => typeof seriesRows === 'function')()",
  `(() => {
    const rows = [{time:"b",value:0},{time:"a",value:null},{time:"a",value:-1.25}];
    return JSON.stringify(seriesRows(rows,true)) === '[{"time":"b","label":"0"},{"time":"a","label":"Unavailable"},{"time":"a","label":"-1.25"}]';
  })()`,
  `JSON.stringify(seriesRows([{time:"a",value:2}],false)) === "[]" && JSON.stringify(seriesRows([],true)) === "[]"`,
  `(() => {
    const rows = Object.freeze([Object.freeze({time:"d",value:0}),Object.freeze({time:"c",value:null})]);
    const before = JSON.stringify(rows);
    const actual = seriesRows(rows,true);
    return JSON.stringify(actual) === '[{"time":"d","label":"0"},{"time":"c","label":"Unavailable"}]' &&
      JSON.stringify(seriesRows(rows,false)) === "[]" && JSON.stringify(rows) === before;
  })()`,
];

function gradeSeries(answer) {
  const source = ts.createSourceFile("solution.js", answer, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
  const [declaration] = source.statements;
  const isFunction = source.parseDiagnostics.length === 0 && source.statements.length === 1 &&
    ts.isFunctionDeclaration(declaration) && declaration.name?.text === "seriesRows" && declaration.body;
  if (!isFunction) return [false, false, false, false];
  return seriesTests.map(test => {
    try {
      return runInNewContext(answer + "\n;" + test, Object.create(null), {
        timeout: 120,
        contextCodeGeneration: { strings: false, wasm: false },
      }) === true;
    } catch {
      return false;
    }
  });
}

function gradeProfile(answer) {
  let report;
  try {
    report = JSON.parse(answer);
  } catch {
    return [false, false, false, false];
  }
  if (report === null || typeof report !== "object") return [false, false, false, false];
  const figures = report.profiles ?? {};
  const accurate = (id, accepted, cost, p50) => figures[id]?.accepted === accepted &&
    Math.abs(figures[id].fixtureCostPerAcceptedTask - cost) < 1e-9 && figures[id].p50Seconds === p50;
  return [
    figures.A?.eligible === true && figures.C?.eligible === true && figures.B?.eligible === false &&
      figures.B?.reason === "disclosure",
    accurate("A", 3, 0.10, 10) && accurate("C", 3, 0.04, 6),
    report.nextTrial === "C" && report.useMatchedTasks === true && report.countRetries === true,
    report.currency === "synthetic fixture dollar" && report.attemptsPerProfile === 3 &&
      report.requireIndependentRepeat === true && typeof report.explanation === "string" && !!report.explanation.trim(),
  ];
}

function parseAnswer(answer) {
  try {
    return JSON.parse(answer);
  } catch {
    return null;
  }
}

function gradeLegacyGuide(answer, attempt) {
  const report = parseAnswer(answer);
  const expectedMissing = ["catalog/patterns.json", "scripts/describe-pattern.mjs"];
  const cleanPath = path => typeof path === "string" && path.replace(/^(?:.*\/)?node_modules\/@openboa\/yogurt\//, "");
  const missing = Array.isArray(report?.missingResources) ? report.missingResources.map(cleanPath) : [];
  const reproduction = typeof report?.reproduction === "string" ? report.reproduction : "";
  const preflight = attempt.fixturePreflight;
  const directCheck = /node_modules|package-lock\.json/.test(reproduction) &&
    expectedMissing.some(path => reproduction.includes(path));
  const inspection = /\bnode\s+[^\n]*resolve-sdk\.mjs\s+[^\n]+\sweb\s+--inspect\b/;
  const observedInspection = typeof preflight?.sdk?.revision === "string" &&
    inspection.test(reproduction) && attempt.events?.some(event => {
    const item = event.item;
    if (event.type !== "item.completed" || item?.type !== "command_execution" ||
      !inspection.test(item.command)) return false;
    return item.aggregated_output?.split(/\r?\n/).some(line => {
      try {
        const receipt = JSON.parse(line);
        return receipt?.status === "missing-resources" && receipt.target === "web" &&
          receipt.revision === preflight?.sdk?.revision &&
          Array.isArray(receipt.missing) && expectedMissing.every(path => receipt.missing.includes(path));
      } catch {
        return false;
      }
    });
  });
  return [
    report?.installedVersion === "0.1.0-local.15" && cleanPath(report.availableEntry) === "DESIGN.md" &&
      expectedMissing.every(path => missing.includes(path)),
    report?.nativeInteractionEvidence === "unverified",
    preflight?.siblingReadDenied === true && preflight.sdk?.missingPatternResources === true &&
      (directCheck || observedInspection === true),
  ];
}

const kitRepository = "test-org/yogurt";
const productRepository = "test-org/directory";

function gradeSidebar(answer, { fixturePreflight }) {
  const brief = parseAnswer(answer);
  const test = brief?.focusTest;
  return [
    !!fixturePreflight?.sdk?.revision && brief?.entry === "@openboa/yogurt/sidebar-layout" &&
      /departments?/i.test(brief?.directoryGrouping) && /agent/i.test(brief?.rosterGrouping) && /activit/i.test(brief?.rosterGrouping) &&
      brief?.groupingOwner === "product",
    brief?.renameOwner === "product" && brief?.routePermissionsOwner === "product",
    /narrow|compact/i.test(test) && /drawer/i.test(test) && /escape|dismiss|close/i.test(test) &&
      /focus/i.test(test) && /original trigger|same trigger/i.test(test),
  ];
}

function gradeCoverage(answer) {
  const review = parseAnswer(answer);
  const test = review?.verification;
  return [
    review?.zeroAt === "09:00" && review?.missingAt === "10:00" &&
      /unavailable|no reading|missing/i.test(review?.missingLabel) &&
      /visible|visual/i.test(test?.missing) && /accessib|screen reader|aria/i.test(test?.missing),
    review?.observedAt === "13:00 UTC" && review?.shownUpdatedAt === "14:30 UTC" &&
      /13:00/.test(test?.time) && /observ/i.test(test?.time),
    /^(14:35)( UTC)?$/.test(review?.withdrawnAt) && /dialog/i.test(review?.remainingSurface) &&
      /revoke|withdraw/i.test(test?.withdrawal) && /dialog/i.test(test?.withdrawal) &&
      /absent|clear|remove|hidden|close/i.test(test?.withdrawal),
    Array.isArray(review?.evidence) && review.evidence.includes("capture") && review.evidence.includes("source") &&
      review.liveVerified === false,
  ];
}

function gradeRosterReview(answer) {
  const review = parseAnswer(answer);
  return [
    review?.observedStills === true && review?.readableStateLabels === true && review?.reducedMotionLabel === true,
    review?.motionStatus === "unverified" && /normal.speed|live replay/i.test(review?.replay) &&
      /24\s?px/.test(review?.replay) && /waiting/i.test(review?.replay) && /working/i.test(review?.replay),
    /unlabel/i.test(review?.comparison) && /ground.truth|known state/i.test(review?.comparison) &&
      /reduced.motion/i.test(review?.reducedMotionCheck) && /label/i.test(review?.reducedMotionCheck),
  ];
}

function gradeProductDraft(answer, { issue }) {
  const handoff = parseAnswer(answer);
  const draft = issue?.reports?.find(entry => entry.result?.status === "draft");
  const report = draft?.report;
  return [
    handoff?.status === "draft" && handoff?.repository === productRepository &&
      draft?.result.repository === productRepository && report?.owner === "product" &&
      /\bmenu\b/i.test(report.observed) && /\bview\b/i.test(report.observed) && /\brename\b/i.test(report.observed),
    handoff?.title === draft?.result.title && handoff?.body === draft?.result.body &&
      report?.mode === "draft" && /\beditor\b/i.test(report.reproduction) &&
      /\brename\b/i.test(report.expected) && /\beditor\b/i.test(report.acceptance) && /\brename\b/i.test(report.acceptance),
    issue?.calls?.every(call => !["create", "update", "comment"].includes(call.method)) === true,
  ];
}

function gradeLostIssue(answer, { issue }) {
  const handoff = parseAnswer(answer);
  const calls = issue?.calls ?? [];
  const creates = calls.filter(call => call.method === "create");
  const created = issue?.issues ?? [];
  const firstCreate = calls.findIndex(call => call.method === "create");
  const observed = issue?.reports?.find(entry => entry.result?.status === "reconciled");
  const report = observed?.report;
  const url = "https://github.com/test-org/yogurt/issues/41";
  return [
    firstCreate > 0 && calls.slice(0, firstCreate).some(call => call.method === "search" && call.target === kitRepository),
    creates.length === 1 && created.length === 1 && created[0].target === kitRepository &&
      report?.pin === "fixture-r17" && report.renderer === "web" &&
      /\bescape\b/i.test(report.reproduction) && /\btrigger\b/i.test(report.reproduction) &&
      (/\bbody\b/i.test(report.observed) || /\bbody\b/i.test(report.symptom)) &&
      /\breturn|restor|back|original/i.test(report.expected) && /\btrigger\b/i.test(report.expected),
    creates.length === 1 && calls.slice(firstCreate + 1).some(call => call.method === "search" && call.target === kitRepository) &&
      observed?.result.number === 41,
    handoff?.status === "reconciled" && handoff?.url === url && observed?.result.url === url,
  ];
}

function gradeExistingIssue(answer, { issue }) {
  const handoff = parseAnswer(answer);
  const url = "https://github.com/test-org/yogurt/issues/8";
  return [
    issue?.calls?.some(call => call.method === "search" && call.target === kitRepository) === true &&
      issue?.reports?.some(entry => entry.result?.status === "existing" && entry.result.url === url) === true,
    handoff?.status === "existing" && handoff?.url === url,
    issue?.calls?.every(call => !["create", "update", "comment"].includes(call.method)) === true,
  ];
}

function gradePrintReceipt(answer) {
  const brief = parseAnswer(answer);
  const scope = brief?.scope;
  const recovery = brief?.recovery;
  const confirmation = brief?.confirmation;
  return [
    scope?.station === "Copper" && scope?.job === "x-1" && scope?.receipt === "k-83",
    brief?.stateAfterOtherStationCompletes === "unknown",
    recovery?.action === "lookup" && recovery?.receipt === scope?.receipt && recovery?.resubmit === false,
    confirmation?.source === "host" && confirmation?.match === "original-receipt" &&
      confirmation?.visibleState === "confirmed",
  ];
}

function gradeBrandVoice(answer) {
  const review = parseAnswer(answer);
  const empty = review?.empty;
  const unavailable = review?.unavailable;
  return [
    typeof empty?.copy === "string" && /\b(no|empty|nothing)\b/i.test(empty.copy) &&
      /\b(records?|accessions?|collection)\b/i.test(empty.copy) &&
      !/could not|unable|unavailable|failed/i.test(empty.copy) && empty.action === null,
    typeof unavailable?.copy === "string" &&
      /(?:could(?: not|n't)|unable to|failed to|cannot|can't)\s+(?:load|fetch|retrieve)|(?:records|accessions|collection)\s+(?:are|is)\s+unavailable/i.test(unavailable.copy) &&
      /refresh|^try again$/i.test(unavailable.action),
    typeof empty?.copy === "string" && typeof unavailable?.copy === "string" &&
      !/awww|sad little|\b(add|create|plant|upload)\b/i.test([empty.copy, unavailable.copy, unavailable.action].join(" ")),
    null,
  ];
}

function gradeReleaseRegression(answer) {
  const report = parseAnswer(answer);
  return [
    report?.decision === "hold" && /account/i.test(report?.regression) &&
      /previous|another|cross.account/i.test(report?.regression),
    report?.preferred === 5 && report?.comparisons === 6 && report?.visualPreferenceProvesSafety === false,
    report?.observedCost === null && /account.switch|switch accounts/i.test(report?.retest) &&
      /independent|held.out|unseen/i.test(report?.retest),
  ];
}

export const outcomeGraders = {
  "compose-first-screen": answer => {
    const plan = parseAnswer(answer);
    const names = (bindings, options) => Array.isArray(bindings) && options.some(id => bindings.includes(id));
    return [
      plan?.pattern === "pattern.find-records",
      names(plan?.web, ["@openboa/yogurt/search-field", "@openboa/yogurt/filter-bar"]) &&
        names(plan?.web, ["@openboa/yogurt/list-row", "@openboa/yogurt/disclosure-row", "@openboa/yogurt/data-table"]),
      names(plan?.native, ["yg-search-field", "yg-filter-bar", "yg-collection-browser"]) &&
        names(plan?.native, ["yg-list", "yg-disclosure-row", "yg-data-table", "yg-collection-browser"]),
      plan?.stateOwner === "host" && names(plan?.retains, ["query"]) && names(plan?.retains, ["selectedId"]) &&
        typeof plan?.recovery === "string" && /focus/i.test(plan.recovery) && /clear/i.test(plan.recovery),
    ];
  },
  "build-series-rows": gradeSeries,
  "evaluate-efficient-profile": gradeProfile,
  "decide-installed-only": gradeLegacyGuide,
  "build-review-decision": (_, attempt) => attempt.decision?.assertions ?? [null, null, null, null],
  "decide-sidebar-composition": gradeSidebar,
  "review-coverage": gradeCoverage,
  "review-roster-motion": gradeRosterReview,
  "feedback-draft-product": gradeProductDraft,
  "feedback-create-uncertain": gradeLostIssue,
  "feedback-existing-issue": gradeExistingIssue,
  "decide-uncertain-print-receipt": gradePrintReceipt,
  "review-brand-voice": gradeBrandVoice,
  "evaluate-new-regression": gradeReleaseRegression,
};

const trackedIssue = `Use the simulated issue service through the report_issue tool. Report the observed outcome as JSON with status and url.`;

export const responseContracts = {
  "compose-first-screen": `Return JSON with pattern (its installed stable ID), web (the selected public import strings),
native (the selected installed template names), stateOwner (host or SDK), retains (an array of state names) and recovery
(a short sequence of what to verify). Base both compositions on the actual installed SDK for each target.`,
  "decide-uncertain-print-receipt": `Return JSON with scope (station, job, receipt), stateAfterOtherStationCompletes,
recovery (action, receipt, resubmit boolean), and confirmation (source, match, visibleState).
Use unknown or confirmed for states and describe the match as original-receipt if that is what you require.`,
  "review-brand-voice": `Return JSON with empty and unavailable, each containing copy and action. Use null when there is no action.`,
  "evaluate-new-regression": `Return JSON with decision (adopt or hold), regression, preferred and comparisons (counts),
visualPreferenceProvesSafety (boolean), observedCost (null if unavailable), and retest (the next verification plan).`,
  "decide-sidebar-composition": `Return JSON with entry (the installed shared import), directoryGrouping, rosterGrouping,
groupingOwner, renameOwner, routePermissionsOwner and focusTest (your verification on a narrow layout).`,
  "review-coverage": `Return JSON with zeroAt, missingAt, missingLabel, observedAt and shownUpdatedAt (include UTC when present),
withdrawnAt, remainingSurface, evidence (an array of source kinds), liveVerified (boolean) and verification
(an object giving the checks for missing data, time and withdrawal in fields missing, time and withdrawal).`,
  "review-roster-motion": `Return JSON with observedStills, readableStateLabels and reducedMotionLabel (booleans),
motionStatus, replay (capture or replay request), comparison (how to judge it) and reducedMotionCheck.`,
  "feedback-draft-product": `Use the simulated report_issue tool. Present the returned draft as JSON with status, repository, title and body.`,
  "feedback-create-uncertain": trackedIssue,
  "feedback-existing-issue": trackedIssue,
  "decide-installed-only": `Return JSON with installedVersion, availableEntry (path to the installed design guide), missingResources (an array
of paths), nativeInteractionEvidence (verified or unverified), and reproduction (a check the consumer can repeat).`,
  "evaluate-efficient-profile": `Return JSON containing profiles keyed by profile ID. Each entry contains eligible,
reason (use "disclosure" when that requirement was breached), accepted, fixtureCostPerAcceptedTask, and p50Seconds.
The top-level object contains nextTrial (profile ID), useMatchedTasks and countRetries (booleans describing your
proposed trial), currency (use the exact currency named in the fixture), attemptsPerProfile (first attempts each),
requireIndependentRepeat (boolean), and explanation (your short recommendation).`,
};

export function gradeCase(item, attempt) {
  const values = (() => {
    if (attempt.status !== "completed") return item.assertions.map(() => null);
    if (item.kind === "routing") {
      const selected = observedRoute(attempt);
      return [selected === null ? null : selected === item.expected_skill];
    }
    const grader = outcomeGraders[item.id];
    return grader ? grader(attempt.answer, attempt) : item.assertions.map(() => null);
  })();
  assert.equal(values.length, item.assertions.length, item.id);
  const status = attempt.status !== "completed" ? attempt.status
    : values.includes(false) ? "failed"
    : values.includes(null) ? "unobserved" : "passed";
  return { status, assertions: item.assertions.map((requirement, index) => ({ requirement, result: values[index] })) };
}

export function decisionRetryHint(decision) {
  const [dialog, command, recovery, outcome] = decision?.assertions ?? [];
  if (dialog !== true || command !== true || decision.receiptReferences?.otherRecord > 0) return null;
  if (recovery === false) return "The previous attempt used the shared dialog and sent the correct command. Verify recovery after closing and reopening the record.";
  if (outcome === false) return "The previous attempt recovered the original receipt. Verify what the screen and accessibility tree show before and after the lookup confirms the outcome.";
  return null;
}
