import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright-core";
import ts from "typescript";

const runtime = fileURLToPath(new URL("../../node_modules/", import.meta.url));
const origin = "http://yogurt-fixture.test";
const dialogEntries = new Map([
  ["@openboa/yogurt", ["ConfirmDialog", "Dialog"]],
  ["@openboa/yogurt/web", ["ConfirmDialog", "Dialog"]],
  ["@openboa/yogurt/confirm-dialog", ["ConfirmDialog"]],
  ["@openboa/yogurt/dialog", ["Dialog"]],
  ["@openboa/yogurt/decision-review", ["DecisionReview"]],
]);
const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script></html>`;
const policy = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'none'";

const decisionInterface = `Return only a TSX module, with no Markdown fences.
Default-export a React component receiving {records, submit, lookup}.
Each record has {id: string, shortName: string, revision: number}.
submit({id, revision, action}) resolves to {id: string, state: "unknown"}. The id it returns is the original receipt.
lookup(id) resolves to {id, state: "unknown"} or {id, state: "confirmed", revision: number}.
Use installed Yogurt controls, including a public export for the dialog or decision control.`;

const decisionResponse = `${decisionInterface}
Expose buttons named "Review Brief A", "Review Brief B", "Return for revision", "Cancel", "Back to briefs", and "Check original request" where applicable.
Use "Return this brief?" as the dialog name. Show the original receipt as "Request R-14" when the host returns that id,
and use headings "Confirmation unavailable" and "Confirmed" for the two outcomes.`;

export const decisionCaseId = "build-review-decision";
const seed = {
  labels: {
    select: ["Review Brief A", "Review Brief B"],
    action: "Return for revision",
    dialog: "Return this brief?",
    back: "Back to briefs",
  },
  receipt: { id: "R-14", revision: 10 },
};

export async function readDecisionScenario(path) {
  const bytes = await readFile(path);
  const { prompt, records, labels, receipt } = JSON.parse(bytes);
  const nonempty = value => typeof value === "string" && value.trim() === value && value.length > 0;
  const revision = value => Number.isSafeInteger(value) && value >= 0;
  assert(nonempty(prompt), "Provide a decision task prompt.");
  assert(Array.isArray(records) && records.length === 2 && records.every(record =>
    record && nonempty(record.id) && nonempty(record.shortName) && revision(record.revision)) &&
    records[0].id !== records[1].id && records[0].revision !== records[1].revision,
  "Provide two distinct revisioned records.");
  assert(Array.isArray(labels?.select) && labels.select.length === 2 && labels.select.every(nonempty) &&
    labels.select[0] !== labels.select[1] && [labels.action, labels.dialog, labels.back].every(nonempty),
  "Provide two distinct selection labels and action, dialog and back labels.");
  assert(typeof receipt?.id === "string" && /^[A-Za-z][A-Za-z0-9-]*$/.test(receipt.id) &&
    revision(receipt.revision) && records.every(record => record.revision !== receipt.revision),
  "Provide an original receipt ID and a new effective revision.");
  return {
    digest: createHash("sha256").update(bytes).digest("hex"),
    prompt,
    records: records.map(({ id, shortName, revision }) => ({ id, shortName, revision })),
    labels,
    receipt,
  };
}

export function useDecisionScenario(item, scenario) {
  if (!scenario) return item;
  return {
    ...item,
    split: "holdout",
    prompt: scenario.prompt,
    inputs: { records: scenario.records },
    assertions: [
      "Opening the first record renders a shared SDK dialog.",
      "Cancel leaves the ledger empty and confirm sends exactly one command for the second record at its selected revision.",
      "Reopening preserves the original receipt only on the selected record. Recovery looks up that receipt without resubmitting.",
      "The accessible status stays unknown until the original receipt confirms and shows the resulting revision.",
    ],
  };
}

export function decisionContract(scenario) {
  if (!scenario) return decisionResponse;
  const { select, action, dialog, back } = scenario.labels;
  const buttons = [...select, action, "Cancel", back, "Check original request"].map(label => JSON.stringify(label)).join(", ");
  return `${decisionInterface}
Expose buttons named ${buttons} where applicable. Submit ${JSON.stringify(action)} as the action.
Use ${JSON.stringify(dialog)} as the dialog name. Show the original receipt as "Request <id>" using the id returned by the host,
and use headings "Confirmation unavailable" and "Confirmed" for the two outcomes.`;
}

async function bundle(answer, records, project, output) {
  const candidate = join(project, "__evaluation_candidate.tsx");
  await writeFile(candidate, answer);
  const contents = `
    import React from "react";
    import { createRoot } from "react-dom/client";
    import "@openboa/yogurt/styles.css";
    import Decision from "./__evaluation_candidate";
    const records = ${JSON.stringify(records)};
    const request = async (path, payload) => {
      const response = await fetch(path, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)});
      if (!response.ok) throw new Error("Fixture request rejected");
      return response.json();
    };
    createRoot(document.getElementById("root")).render(
      <Decision records={records} submit={command => request("/submit", command)} lookup={id => request("/lookup", {id})} />);
  `;
  const compiled = await build({
    absWorkingDir: project, nodePaths: [runtime], bundle: true, write: false, logLevel: "silent",
    stdin: { contents, loader: "tsx", sourcefile: "fixture-host.tsx", resolveDir: project },
    jsx: "automatic", loader: { ".woff2": "dataurl" }, outfile: join(output, "app.js"),
    plugins: [{ name: "consumer-imports", setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        if (args.importer !== candidate) return;
        if (/^react(?:\/jsx-runtime)?$/.test(args.path) ||
            /^@openboa\/yogurt(?:\/[a-z][a-z0-9-]*(?:\.css)?)?$/.test(args.path)) {
          return;
        }
        return { errors: [{ text: "The generated component may import React and public Yogurt entries." }] };
      });
    } }],
  });
  const source = ts.createSourceFile(candidate, answer, ts.ScriptTarget.Latest);
  const found = source.statements.some(node => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier) || node.importClause?.isTypeOnly) return false;
    const exports = dialogEntries.get(node.moduleSpecifier.text);
    const bindings = node.importClause?.namedBindings;
    if (!exports || !bindings) return false;
    if (ts.isNamespaceImport(bindings)) return true;
    return bindings.elements.some(binding => !binding.isTypeOnly && exports.includes((binding.propertyName ?? binding.name).text));
  });
  assert(found, "No installed shared decision or dialog import");
  return new Map(compiled.outputFiles.map(file => [file.path.endsWith(".css") ? "/app.css" : "/app.js", file.contents]));
}

export async function observeDecision(answer, records, project, output, scenario = seed) {
  const { labels, receipt: original } = scenario;
  const started = performance.now();
  const assertions = [null, null, null, null];
  const receipts = { commands: [], lookups: [] };
  const receiptReferences = {};
  let applied = false;
  let stage = 0;
  let focusRestored = null;
  let browser;
  const result = extra => ({ assertions, receipts, receiptReferences, focusRestored, elapsedMs: Math.round(performance.now() - started), ...extra });
  await mkdir(output);
  try {
    const assets = await bundle(answer, records, project, output);
    try {
      browser = await chromium.launch({
        channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome", chromiumSandbox: true, timeout: 15000,
        args: ["--host-resolver-rules=MAP * ~NOTFOUND", "--force-webrtc-ip-handling-policy=disable_non_proxied_udp"],
      });
    } catch (error) {
      return result({ unavailable: true, error: error.message });
    }
    const context = await browser.newContext({
      serviceWorkers: "block", viewport: { width: 390, height: 720 }, colorScheme: "dark", reducedMotion: "reduce",
    });
    await context.routeWebSocket("**/*", socket => socket.close());
    await context.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) return route.abort();
      if (request.method() === "GET") {
        if (url.pathname === "/") return route.fulfill({ body: html, contentType: "text/html", headers: { "Content-Security-Policy": policy } });
        const body = assets.get(url.pathname);
        if (!body) return route.abort();
        return route.fulfill({ body: Buffer.from(body), contentType: url.pathname.endsWith(".css") ? "text/css" : "text/javascript" });
      }
      if (request.method() !== "POST") return route.abort();
      if (url.pathname === "/submit") {
        receipts.commands.push(request.postDataJSON());
        return route.fulfill({ json: { id: original.id, state: "unknown" } });
      }
      if (url.pathname === "/lookup") {
        const { id } = request.postDataJSON();
        receipts.lookups.push(id);
        if (id !== original.id || !receipts.commands.length) return route.fulfill({ status: 404 });
        return route.fulfill({ json: applied ? { id, state: "confirmed", revision: original.revision } : { id, state: "unknown" } });
      }
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(4500);
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    const button = name => page.getByRole("button", { name, exact: true });
    const heading = name => page.getByRole("heading", { name, exact: true });
    const dialog = page.getByRole("dialog", { name: labels.dialog, exact: true }).and(page.locator("dialog.yg-dialog"));
    const receiptLabel = `Request ${original.id}`;
    const receipt = page.getByText(receiptLabel, { exact: true }).filter({ visible: true });
    const firstRecord = button(labels.select[0]);
    const secondRecord = button(labels.select[1]);
    const openConfirmation = async selection => {
      const trigger = button(labels.action);
      await selection.click();
      await dialog.or(trigger).first().waitFor();
      if (await dialog.isVisible()) return selection;
      await trigger.click();
      await dialog.waitFor();
      return trigger;
    };
    const cancel = async () => {
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
    };
    const backToList = async () => {
      const back = button(labels.back);
      await back.or(firstRecord).first().waitFor();
      if (await back.isVisible()) await back.click();
      await firstRecord.waitFor();
    };
    await page.goto(origin, { timeout: 10000 });
    await firstRecord.waitFor();

    const firstTrigger = await openConfirmation(firstRecord);
    assertions[stage++] = true;
    await cancel();
    focusRestored = await firstTrigger.count() === 1 &&
      await firstTrigger.evaluate(node => node.matches(":focus"));
    assert.deepEqual(receipts.commands, []);
    await backToList();
    await openConfirmation(secondRecord);
    const [submitted] = await Promise.all([
      page.waitForResponse(response => response.url() === origin + "/submit"),
      dialog.getByRole("button", { name: labels.action, exact: true }).click(),
    ]);
    await submitted.finished();
    assert.deepEqual(receipts.commands, [{ id: records[1].id, revision: records[1].revision, action: labels.action }]);
    assertions[stage++] = true;
    await receipt.first().waitFor();
    receiptReferences.submitted = await receipt.count();

    await backToList();
    await firstRecord.click();
    receiptReferences.otherRecord = await receipt.count();
    assert.equal(receiptReferences.otherRecord, 0, "The other record must not inherit the receipt");
    if (await dialog.isVisible()) await cancel();
    await backToList();
    await secondRecord.click();
    await receipt.first().waitFor();
    receiptReferences.reopened = await receipt.count();

    const [pendingLookup] = await Promise.all([
      page.waitForResponse(response => response.url() === origin + "/lookup"),
      button("Check original request").click(),
    ]);
    await pendingLookup.finished();
    assert.deepEqual(receipts.lookups, [original.id], "Recovery must query the original receipt");
    await heading("Confirmation unavailable").waitFor();
    assert.equal(await heading("Confirmed").count(), 0);
    const unknown = await page.locator("#root").ariaSnapshot();
    await page.screenshot({ path: join(output, "unknown.png") });
    applied = true;
    await button("Check original request").click();
    await heading("Confirmed").waitFor();
    assert.deepEqual(receipts.lookups, [original.id, original.id]);
    assert.equal(receipts.commands.length, 1, "Recovery must not resubmit");
    assertions[stage++] = true;

    assert.match(unknown, /heading "Confirmation unavailable"/);
    assert.doesNotMatch(unknown, /heading "Confirmed"/);
    const final = await page.locator("#root").ariaSnapshot();
    assert.match(final, /heading "Confirmed"/);
    assert(final.includes(receiptLabel));
    assert.match(final.replaceAll(receiptLabel, ""), new RegExp(`\\b${original.revision}\\b`));
    assert.deepEqual(pageErrors, []);
    await page.screenshot({ path: join(output, "confirmed.png") });
    assertions[stage] = true;
    return result({ accessible: { unknown, final } });
  } catch (error) {
    assertions[stage] = false;
    return result({ error: error.message });
  } finally {
    await browser?.close();
  }
}
