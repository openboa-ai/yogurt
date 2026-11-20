import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { issueLedger, requirePrivatePath } from "./issue-ledger.mjs";

const repositoryName = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
const fields = {
  pin: "SDK pin",
  renderer: "Renderer",
  publicId: "Public ID",
  symptom: "Failure",
  reproduction: "Reproduction",
  expected: "Expected",
  observed: "Observed",
  impact: "Impact",
  acceptance: "Acceptance",
};
const normalized = text => text.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const json = path => JSON.parse(readFileSync(path, "utf8"));

function form(report) {
  if (!["draft", "file"].includes(report.mode) || !["product", "sdk", "undetermined"].includes(report.owner)) {
    throw Error("Set report mode to draft or file and owner to product, sdk or undetermined.");
  }
  const values = Object.fromEntries(Object.entries({ title: "Title", ...fields }).map(([key, label]) => {
    const value = typeof report[key] === "string" ? report[key].trim() : "";
    if (!value || /<!--\s*yogurt-report:/i.test(value)) throw Error(`Supply a plain value for ${label}.`);
    return [key, value];
  }));
  if (/\r|\n/.test(values.title) || !["web", "native"].includes(values.renderer)) {
    throw Error("Supply a single-line title and renderer web or native.");
  }
  return {
    ...values,
    mode: report.mode,
    owner: report.owner,
    precedingIssue: report.precedingIssue,
    previousPin: report.previousPin,
  };
}

function draftFor(report, target) {
  const body = Object.entries(fields).map(([key, label]) => `**${label}**  \n${report[key]}`).join("\n\n");
  return { repository: target, title: report.title, body };
}

function issueMatches(issue, marker, report) {
  const body = issue.body ?? "";
  if (body.includes(marker)) return true;
  const text = normalized(body);
  return [report.publicId, report.renderer, report.symptom].every(term => text.includes(normalized(term)));
}

function issueReference(target, issue) {
  if (!Number.isInteger(issue.number) || issue.number <= 0) throw Error("GitHub returned an invalid issue number.");
  return { number: issue.number, url: `https://github.com/${target}/issues/${issue.number}` };
}

export async function reportIssue({ project, report: input, readPolicy, connector, openLedger }) {
  const root = realpathSync(project);
  const report = form(input);
  let routes;
  try {
    routes = json(join(root, "yogurt.config.json")).issueRouting;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const target = report.owner === "undetermined" ? null : routes?.[report.owner];
  const validTarget = typeof target === "string" && repositoryName.test(target) &&
    ![".", ".."].includes(target.split("/")[1]);
  const draft = draftFor(report, validTarget ? target : null);
  const asDraft = reason => ({ status: "draft", reason, ...draft });
  if (report.mode === "draft" || !validTarget) return asDraft("Draft requested or no matching project route.");

  let grant;
  let ledger;
  const currentGrant = () => readPolicy().find(item => item.project === root &&
    item.repository?.toLowerCase() === target.toLowerCase() && item.operation === "create_issue" &&
    Number.isSafeInteger(item.repositoryId) && typeof item.actor === "string");
  try {
    grant = currentGrant();
    if (grant) ledger = openLedger();
  } catch {
    return asDraft("The trusted host policy or reporting ledger is unavailable.");
  }
  if (!grant) return asDraft("No host grant matches this project, repository and operation.");

  const identityParts = [grant.repositoryId, report.renderer, normalized(report.publicId), normalized(report.symptom)];
  const recurring = Number.isSafeInteger(report.precedingIssue) && report.precedingIssue > 0 &&
    typeof report.previousPin === "string" && !!report.previousPin && report.previousPin !== report.pin;
  if (recurring) identityParts.push(report.precedingIssue, report.pin);
  const key = createHash("sha256").update(JSON.stringify(identityParts)).digest("hex");
  const marker = `<!-- yogurt-report:${key} -->`;
  const pending = () => ({ status: "pending", reason: "The original issue write has not been reconciled.", ...draft });
  const match = issue => (!recurring || issue.number !== report.precedingIssue) && issueMatches(issue, marker, report);

  let issues;
  let entry;
  try {
    const [actor, repository] = await Promise.all([connector.actor(), connector.repository(target)]);
    if (actor !== grant.actor || repository.id !== grant.repositoryId ||
        repository.full_name.toLowerCase() !== target.toLowerCase()) {
      return asDraft("The connector actor or repository identity differs from the host grant.");
    }
    entry = ledger.inspect(key);
    if (entry.status === "confirmed") return { status: "existing", ...entry.issue };
    issues = await connector.issues(target);
  } catch {
    if (entry?.status === "pending") return pending();
    return asDraft("The connector or reporting ledger cannot confirm the current state.");
  }

  const recorded = issues.find(issue => (issue.body ?? "").includes(marker));
  if (recorded) {
    const issue = issueReference(target, recorded);
    if (entry.status === "pending") ledger.finish(key, entry.attempt, { status: "confirmed", issue });
    return { status: "existing", ...issue };
  }
  if (entry.status === "pending") return pending();

  if (recurring && !issues.some(issue => issue.number === report.precedingIssue && issue.state === "closed" &&
      issueMatches(issue, marker, report) && normalized(issue.body ?? "").includes(normalized(report.previousPin)))) {
    return asDraft("The previous closed issue and affected version could not be confirmed.");
  }
  const existing = issues.find(match);
  if (existing) return { status: "existing", ...issueReference(target, existing) };

  if (!ledger.claim(key, entry.attempt)) return pending();
  try {
    const candidate = (await connector.issues(target)).find(match);
    if (candidate) {
      const issue = issueReference(target, candidate);
      ledger.finish(key, entry.attempt, { status: "confirmed", issue });
      return { status: "existing", ...issue };
    }
    const [actor, repository] = await Promise.all([connector.actor(), connector.repository(target)]);
    const allowed = currentGrant();
    if (allowed?.actor !== grant.actor || allowed.repositoryId !== grant.repositoryId ||
        actor !== grant.actor || repository.id !== grant.repositoryId ||
        repository.full_name.toLowerCase() !== target.toLowerCase()) {
      ledger.finish(key, entry.attempt, { status: "rejected" });
      return asDraft("The host grant or connector identity changed before creation.");
    }
  } catch {
    ledger.finish(key, entry.attempt, { status: "rejected" });
    return asDraft("The final authority or duplicate check could not complete.");
  }
  const body = draft.body + (recurring ? `\n\nReproduced on ${report.pin} after #${report.precedingIssue}.` : "") + "\n\n" + marker;
  try {
    const issue = issueReference(target, await connector.create(target, { title: draft.title, body }));
    ledger.finish(key, entry.attempt, { status: "confirmed", issue });
    return { status: "created", ...issue };
  } catch (error) {
    if (error.definitelyRejected) {
      ledger.finish(key, entry.attempt, { status: "rejected" });
      return asDraft("GitHub rejected creation without recording an issue.");
    }
    try {
      const found = (await connector.issues(target)).find(issue => (issue.body ?? "").includes(marker));
      if (found) {
        const issue = issueReference(target, found);
        ledger.finish(key, entry.attempt, { status: "confirmed", issue });
        return { status: "reconciled", ...issue };
      }
    } catch {
      // Preserve the durable pending record when reconciliation is unavailable.
    }
    return pending();
  }
}

function github() {
  function api(method, path, body, extra = []) {
    const args = ["api", "--hostname", "github.com", "--method", method, path, ...extra];
    if (body) args.push("--input", "-");
    try {
      return JSON.parse(execFileSync("gh", args, {
        encoding: "utf8",
        input: body && JSON.stringify(body),
        maxBuffer: 8 * 1024 * 1024,
        timeout: 30000,
        stdio: ["pipe", "pipe", "pipe"],
      }));
    } catch (error) {
      if (method === "POST" && /\(HTTP (401|403|404|422)\)/.test(error.stderr ?? "")) {
        throw Object.assign(Error("GitHub rejected the requested operation."), { definitelyRejected: true });
      }
      throw error;
    }
  }
  return {
    actor: () => api("GET", "user").login,
    repository: target => api("GET", "repos/" + target),
    issues: target => api("GET", `repos/${target}/issues?state=all&per_page=100`, undefined, ["--paginate", "--slurp"])
      .flat().filter(issue => !issue.pull_request),
    create: (target, body) => api("POST", `repos/${target}/issues`, body),
  };
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  try {
    const [project] = process.argv.slice(2);
    if (!project) throw Error("Usage: node report-issue.mjs <project-root> < report.json");
    const host = join(realpathSync(homedir()), ".config", "openboa", "yogurt");
    console.log(JSON.stringify(await reportIssue({
      project,
      report: json(0),
      connector: github(),
      openLedger: () => issueLedger(join(host, "issue-ledger")),
      readPolicy() {
        if (realpathSync(host) !== host) throw Error("The reporting host path cannot traverse a link.");
        requirePrivatePath(host, true);
        const file = join(host, "issue-delegations.json");
        requirePrivatePath(file, false);
        return json(file).delegations;
      },
    }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
