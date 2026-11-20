import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright-core";

const [decisionRoot, recordRoot, captureRoot] = process.argv.slice(2);
if (!decisionRoot || !recordRoot || !captureRoot) {
  throw Error("Usage: node checks/web-consumer-journeys.mjs <decision-consumer> <record-consumer> <output-dir>");
}
assert.notEqual(resolve(decisionRoot), resolve(recordRoot));
const output = resolve(captureRoot);
const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const decisionExample = fileURLToPath(new URL("../plugins/yogurt/references/examples/review-decision.web.tsx", import.meta.url));
await mkdir(output, { recursive: true });

async function bundle(name, consumer) {
  const root = resolve(consumer);
  const source = name === "decision" ? decisionExample : join(fixtures, name + "-client.tsx");
  const lock = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
  const installed = lock.packages["node_modules/@openboa/yogurt"];
  assert(installed?.version, name + " has no installed SDK pin");
  const dist = join(output, name);
  await mkdir(dist, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { contents: await readFile(source, "utf8"), sourcefile: name + ".tsx", loader: "tsx", resolveDir: root },
    bundle: true,
    jsx: "automatic",
    loader: { ".woff2": "dataurl" },
    outfile: join(dist, "client.js"),
  });
  const file = join(dist, "index.html");
  await writeFile(file, `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Yogurt consumer fixture</title><link rel="stylesheet" href="./client.css">
    <style>
      body{margin:0}
      .yg-root{min-height:100vh}
      main{max-width:44rem;margin-inline:auto;padding:var(--boa-space-24)}
      [data-composition="room"] h1{font-size:var(--boa-size-title);line-height:var(--boa-line-height-title)}
      [data-composition="room"] h3{font-size:var(--boa-size-ui);line-height:var(--boa-line-height-ui)}
    </style></head><body><div id="app"></div><script src="./client.js"></script></body></html>`);
  return { file, pin: installed.resolved, version: installed.version };
}

async function decision(page, capture) {
  const button = name => page.getByRole("button", { name, exact: true });
  const log = () => page.evaluate(() => window.fixture.read());
  const dialog = page.getByRole("dialog", { name: "Return this brief?" });
  const trigger = button("Return for revision");
  const receipts = page.getByText("Request R-14", { exact: true });

  await button("Review Brief A").click();
  await trigger.click();
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await trigger.evaluate(node => node.matches(":focus")), true);
  assert.deepEqual(await log(), { commands: [], lookups: [] });

  await button("Back to briefs").click();
  await button("Review Brief B").click();
  await trigger.click();
  await dialog.waitFor();
  await capture("confirm");
  await dialog.getByRole("button", { name: "Return for revision", exact: true }).click();
  await page.getByRole("heading", { name: "Confirmation unavailable" }).waitFor();
  await receipts.waitFor();
  assert.equal(await page.getByRole("heading", { name: "Confirmed", exact: true }).count(), 0);
  assert.equal(await page.locator("progress").getAttribute("value"), "1");

  await button("Back to briefs").click();
  await button("Review Brief A").click();
  assert.equal(await receipts.count(), 0);
  await button("Back to briefs").click();
  await button("Review Brief B").click();
  await receipts.waitFor();
  await button("Check original request").click();
  await page.getByRole("heading", { name: "Confirmation unavailable" }).waitFor();
  await capture("unknown");
  await page.evaluate(() => window.fixture.complete("R-14", "10"));
  await button("Check original request").click();
  await page.getByRole("heading", { name: "Confirmed", exact: true }).waitFor();
  await page.getByText("Brief B was returned at revision 10.", { exact: true }).waitFor();
  assert.equal(await page.locator("progress").getAttribute("value"), "2");
  await capture("confirmed");

  const observed = await log();
  assert.deepEqual(observed, {
    commands: [{ id: "B", revision: "9", action: "Return for revision" }],
    lookups: ["R-14", "R-14"],
  });
  return observed;
}

async function record(page, capture, composition) {
  const chartName = composition === "overview" ? "Room 4 readings" : "Readings over time";
  const chart = page.getByRole("figure", { name: new RegExp(chartName) });
  const table = page.getByRole("table", { name: "Room 4" });
  await chart.waitFor();
  assert.equal(await chart.locator("svg circle").count(), 2);
  assert.equal((await chart.locator("svg path").getAttribute("d")).trim(), "M8 67 M232 7");
  assert.equal(await chart.locator("time").getAttribute("datetime"), "2026-01-12T13:00:00Z");
  await page.getByText(/Two of three readings/).waitFor();
  const sourceCount = await page.locator("main time").count();
  assert.equal(sourceCount, composition === "overview" ? 2 : 1);
  if (composition === "room") {
    const sizes = await page.locator("main h1, main h2, main h3").evaluateAll(headings =>
      headings.map(heading => parseFloat(getComputedStyle(heading).fontSize)));
    assert.equal(sizes.length, 3);
    assert.ok(sizes[0] > sizes[1] && sizes[1] > sizes[2]);
  }
  const disclosure = chart.getByText("View readings", { exact: true });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await table.waitFor();
  assert.equal(await disclosure.evaluate(node => node.matches(":focus")), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const values = await table.getByRole("row").all().then(async rows => {
    return Promise.all(rows.slice(1).map(row => row.getByRole("cell").allTextContents()));
  });
  assert.deepEqual(values, [["09:00", "0"], ["10:00", "No reading"], ["11:00", "0.16"]]);
  await capture("expanded");
  await page.evaluate(() => window.fixture.revoke());
  await page.getByRole("heading", { name: "Record unavailable" }).waitFor();
  assert.equal(await chart.count(), 0);
  assert.equal(await table.count(), 0);
  assert.equal(await page.locator("main").getByText(/Studio observations|Two of three readings|Monitoring log|No reading|0\.16/).count(), 0);
  const accessibility = await page.locator("main").ariaSnapshot();
  assert.doesNotMatch(accessibility, /Studio observations|Room 4|Monitoring log|0\.16/);
  await capture("revoked");
  return { values, sourceCount, revoked: true, accessibility };
}

const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
try {
  const evidence = [];
  for (const [name, consumer, check, compositions] of [
    ["decision", decisionRoot, decision, [null]],
    ["record", recordRoot, record, ["overview", "room"]],
  ]) {
    const installed = await bundle(name, consumer);
    for (const composition of compositions) {
      const url = pathToFileURL(installed.file);
      if (composition) url.searchParams.set("composition", composition);
      const captureName = composition === "overview" ? "record-overview" : name;
      for (const [width, colorScheme, reducedMotion] of [[1100, "light", "no-preference"], [390, "dark", "reduce"]]) {
        const page = await browser.newPage({ viewport: { width, height: 720 }, colorScheme, reducedMotion });
        const errors = [];
        page.on("pageerror", error => errors.push(String(error)));
        await page.route(/^https?:/, route => route.abort());
        try {
          await page.goto(url.href);
          await page.evaluate(() => document.fonts.ready.then(() => true));
          const capture = phase => page.screenshot({ path: join(output, `${captureName}-${phase}-${width}-${colorScheme}.png`) });
          const observed = await check(page, capture, composition);
          assert.deepEqual(errors, []);
          evidence.push({ name, composition, ...installed, width, colorScheme, reducedMotion, observed });
        } finally {
          await page.close();
        }
      }
    }
  }
  await writeFile(join(output, "web-consumer-journeys.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(`Passed ${evidence.length} installed consumer journeys with ${browser.version()}.`);
} finally {
  await browser.close();
}
