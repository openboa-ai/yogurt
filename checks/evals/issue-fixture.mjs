import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { issueLedger } from "../../plugins/yogurt/bin/issue-ledger.mjs";
import { reportIssue } from "../../plugins/yogurt/bin/report-issue.mjs";

const [scenario, projectArg, evidence] = process.argv.slice(2);
const project = realpathSync(projectArg);
const kit = "test-org/yogurt";
const product = "test-org/directory";
const actor = "fixture-maintainer";
const routes = { sdk: kit, product };
const repositoryIds = { [kit]: 1, [product]: 2, "test-org/search": 3 };
const draftOnly = scenario === "feedback-draft-product";
const recovered = scenario === "feedback-create-uncertain";
const existing = scenario === "feedback-existing-issue";
if (!draftOnly && !recovered && !existing) throw Error("Unknown issue fixture.");

const state = { scenario, calls: [], reports: [], issues: [] };
if (existing) state.issues.push(
  {
    target: kit, number: 8, state: "open", title: "Focus disappears after closing an empty picker",
    body: "Web fixture-r21, select. The select trigger loses keyboard focus after Escape whenever the filtered list is empty.",
  },
  { target: "test-org/search", number: 8, state: "open", title: "Scrolling returns to the top", body: "The search results scroll after selecting a query." },
);
const persist = () => writeFileSync(evidence, JSON.stringify(state, null, 2) + "\n");
const effect = (method, target) => {
  state.calls.push({ method, target });
  persist();
};
const policy = draftOnly ? [] : [{ project, repository: kit, repositoryId: 1, actor, operation: "create_issue" }];
const connector = {
  actor: async () => actor,
  async repository(target) {
    effect("repository", target);
    return { full_name: target, id: repositoryIds[target] };
  },
  async issues(target) {
    effect("search", target);
    return state.issues.filter(item => item.target === target);
  },
  async create(target, payload) {
    effect("create", target);
    if (draftOnly || target !== kit) throw Error("The simulated authority denied the request.");
    const issue = { ...payload, target, number: 41 + state.calls.filter(call => call.method === "create").length - 1, state: "open" };
    state.issues.push(issue);
    persist();
    if (recovered && issue.number === 41) throw Error("Simulated lost acknowledgement after create.");
    return issue;
  },
};

const fields = {
  mode: { type: "string", enum: ["draft", "file"] },
  owner: { type: "string", enum: ["product", "sdk", "undetermined"] },
  renderer: { type: "string", enum: ["web", "native"] },
  ...Object.fromEntries(["title", "pin", "publicId", "symptom", "reproduction", "expected", "observed", "impact", "acceptance"]
    .map(name => [name, { type: "string", maxLength: 2500 }])),
};
fields.symptom.description = "Use the exact reproducible symptom from the observation when it gives one.";
const tool = {
  name: "report_issue",
  description: "Submit a report to the simulated Yogurt broker. It selects the configured destination, returns a draft or confirms the issue, and reconciles a lost response.",
  inputSchema: { type: "object", properties: fields, required: Object.keys(fields), additionalProperties: false },
};

async function run(report) {
  if (!report || Object.keys(report).some(name => !Object.hasOwn(fields, name)) ||
    Object.keys(fields).some(name => typeof report[name] !== "string" || report[name].length > 2500)) {
    throw Error("Supply the fields in the report tool schema.");
  }
  const entry = { report };
  state.reports.push(entry);
  persist();
  entry.result = await reportIssue({
    project, report, connector, readPolicy: () => policy,
    openLedger: () => issueLedger(evidence + ".ledger"),
  });
  persist();
  return { content: [{ type: "text", text: JSON.stringify(entry.result) }] };
}

const config = JSON.parse(readFileSync(join(project, "yogurt.config.json"), "utf8"));
if (config.issueRouting?.sdk !== routes.sdk || config.issueRouting?.product !== routes.product) {
  throw Error("Wrong consumer route for the evaluation fixture.");
}
persist();
const lines = createInterface({ input: process.stdin });
for await (const line of lines) {
  const message = JSON.parse(line);
  if (message.id === undefined) continue;
  const send = payload => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, ...payload }) + "\n");
  switch (message.method) {
    case "initialize":
      send({ result: { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "yogurt-issue-fixture", version: "1.0.0" } } });
      break;
    case "tools/list": send({ result: { tools: [tool] } }); break;
    case "tools/call":
      try {
        if (message.params.name !== tool.name) throw Error("Unknown issue tool.");
        send({ result: await run(message.params.arguments) });
      } catch (error) {
        send({ result: { isError: true, content: [{ type: "text", text: error.message }] } });
      }
      break;
    case "ping": send({ result: {} }); break;
    default: send({ error: { code: -32601, message: "Method not found." } });
  }
}
