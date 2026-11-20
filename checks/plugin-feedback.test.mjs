import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { issueLedger } from "../plugins/yogurt/bin/issue-ledger.mjs";
import { reportIssue } from "../plugins/yogurt/bin/report-issue.mjs";

const sdk = "test-org/yogurt";
const product = "test-org/editorial";
const request = {
  mode: "file",
  owner: "sdk",
  title: "Dialog focus after Escape",
  pin: "0.1.0-local.16",
  renderer: "web",
  publicId: "confirm-dialog",
  symptom: "focus moves to the body after Escape",
  reproduction: "Open the dialog using its focused trigger and press Escape.",
  expected: "The trigger gets focus.",
  observed: "Focus moves to the body after Escape.",
  impact: "Keyboard navigation loses its place.",
  acceptance: "Dismissal returns focus to the trigger.",
};

function fixture(t) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "yogurt-report-")));
  t.after(() => rmSync(dir, { recursive: true }));
  const roles = { sdk, product };
  const repoIds = { [sdk]: 1, [product]: 2, "test-org/other": 3 };
  const grants = Object.entries(repoIds).filter(([repository]) => repository !== "test-org/other")
    .map(([repository, repositoryId]) => ({ project: dir, repository, repositoryId, actor: "reviewer", operation: "create_issue" }));
  const calls = [];
  const items = [];
  let create;
  let actor = "reviewer";
  let visible = true;
  let onRead;
  function route(routes) {
    writeFileSync(join(dir, "yogurt.config.json"), JSON.stringify({ issueRouting: routes }));
  }
  route(roles);
  const connector = {
    actor: async () => actor,
    repository: async target => ({ full_name: target, id: repoIds[target] }),
    issues: async target => {
      onRead?.();
      return visible ? items.filter(item => item.target === target) : [];
    },
    async create(target, payload) {
      calls.push({ target, ...payload });
      if (create) return create(target, payload);
      return persist(target, payload);
    },
  };
  function persist(target, payload) {
    const issue = { number: items.length + 1, state: "open", target, ...payload };
    items.push(issue);
    return issue;
  }
  function report(overrides = {}, policy = grants) {
    return reportIssue({
      project: dir,
      report: { ...request, ...overrides },
      readPolicy: () => policy,
      openLedger: () => issueLedger(join(dir, "ledger")),
      connector,
    });
  }
  return { report, route, persist, calls, items, revoke: () => { grants.length = 0; },
    setCreate: handler => { create = handler; },
    setActor: login => { actor = login; },
    setVisible: show => { visible = show; },
    setOnRead: callback => { onRead = callback; },
  };
}

test("draft, product routing and wrong actor", async t => {
  const host = fixture(t);
  const draft = await host.report({ owner: "product", mode: "draft" });
  assert.equal(draft.repository, product);
  assert.match(draft.body, /Reproduction/);
  assert.equal(host.calls.length, 0);
  host.setActor("another-account");
  assert.equal((await host.report()).status, "draft");
  host.setActor("reviewer");
  assert.equal((await host.report({ owner: "product" })).status, "created");
  assert.equal(host.calls[0].target, product);
});

test("checkout routing does not grant authority", async t => {
  const host = fixture(t);
  host.route({ sdk: "test-org/other" });
  assert.equal((await host.report()).status, "draft");
  host.route({ sdk });
  assert.equal((await host.report({}, [])).status, "draft");
  assert.equal(host.calls.length, 0);
});

test("duplicate comes from matching body in the configured repository", async t => {
  const host = fixture(t);
  const body = "On web, confirm-dialog focus moves to the body after Escape.";
  host.persist("test-org/other", { title: request.title, body });
  host.persist(sdk, { title: "Keyboard position is lost", body });
  const result = await host.report();
  assert.deepEqual(result, { status: "existing", number: 2, url: "https://github.com/test-org/yogurt/issues/2" });
  assert.equal(host.calls.length, 0);
});

test("concurrent creates reconcile a lost response once", async t => {
  const host = fixture(t);
  let finish;
  let started;
  const entered = new Promise(resolve => { started = resolve; });
  const lost = new Promise(resolve => { finish = resolve; });
  host.setCreate(async (target, payload) => {
    started();
    await lost;
    host.persist(target, payload);
    throw Error("The connection dropped after commit.");
  });
  const first = host.report();
  await entered;
  assert.equal((await host.report({ title: "Renamed finding" })).status, "pending");
  finish();
  assert.equal((await first).status, "reconciled");
  assert.equal((await host.report()).url, "https://github.com/test-org/yogurt/issues/1");
  assert.equal(host.calls.length, 1);
});

test("reopen the ledger while a committed issue is not yet visible", async t => {
  const host = fixture(t);
  host.setCreate((target, payload) => {
    host.persist(target, payload);
    host.setVisible(false);
    throw Error("Acknowledgement and immediate read unavailable.");
  });
  assert.equal((await host.report()).status, "pending");
  assert.equal((await host.report()).status, "pending");
  host.setOnRead(() => { throw Error("Tracker read unavailable"); });
  assert.equal((await host.report()).status, "pending");
  host.setOnRead(undefined);
  host.setVisible(true);
  assert.equal((await host.report()).status, "existing");
  assert.equal(host.calls.length, 1);
});

test("final duplicate check can observe a report created during preparation", async t => {
  const host = fixture(t);
  let reads = 0;
  host.setOnRead(() => {
    if (++reads === 2) {
      host.persist(sdk, { title: "Keyboard focus loss", body: "On web, confirm-dialog focus moves to the body after Escape." });
    }
  });
  assert.equal((await host.report()).status, "existing");
  assert.equal(host.calls.length, 0);
});

test("a grant withdrawn before creation prevents the write", async t => {
  const host = fixture(t);
  host.setOnRead(host.revoke);
  assert.equal((await host.report()).status, "draft");
  assert.equal(host.calls.length, 0);
});

test("a definitive rejection permits a distinct attempt after reauthorization", async t => {
  const host = fixture(t);
  host.setCreate(() => { throw Object.assign(Error("Rejected"), { definitelyRejected: true }); });
  assert.equal((await host.report()).status, "draft");
  assert.equal((await host.report({}, [])).status, "draft");
  host.setCreate(undefined);
  assert.equal((await host.report()).status, "created");
  assert.equal(host.calls.length, 2);
  assert.equal(host.items.length, 1);
});
