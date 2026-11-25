const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright-core");

const rootDir = path.resolve(__dirname, "..");
const siteDir = path.join(rootDir, "site");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function startSiteServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = path.join(siteDir, urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, ""));
      if (!filePath.startsWith(siteDir)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
      if (!fs.existsSync(filePath)) filePath = path.join(siteDir, "index.html");
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function chooseSelect(page, combobox, optionName) {
  await combobox.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

const names = ["Tasks", "Workflows", "Schedule", "Files", "Usage", "Customers", "Extensions", "Model providers", "Settings", "Help"];

async function exercise(browser, origin, width) {
  const page = await browser.newPage({ viewport: { width, height: width >= 860 ? 780 : 900 }, colorScheme: width < 860 ? "dark" : "light" });
  const errors = [];
  const remoteRequests = [];
  page.on("pageerror", error => errors.push(error.stack ?? error.message));
  page.on("request", request => {
    if (new URL(request.url()).origin !== origin && /^https?:/.test(request.url())) remoteRequests.push(request.url());
  });
  page.setDefaultTimeout(6000);
  try {
    await page.goto(origin + "/examples");
    const app = page.locator(".studio-demo");
    await page.getByRole("heading", { name: "Sourdough Studio" }).waitFor();
    async function openNavIfCompact() {
      if (width < 860) {
        const trigger = app.getByRole("button", { name: "Browse workspace" });
        await trigger.click();
        return page.getByRole("dialog", { name: "Studio navigation" });
      }
      return app;
    }
    async function go(name) {
      const container = await openNavIfCompact();
      const targetName = name === "Conversations" ? "Kai" : name;
      await container.getByRole("navigation", { name: "Studio sections" }).getByRole("button", { name: targetName, exact: true }).click();
      await app.getByRole("region", { name, exact: true }).waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + " overflows");
      return app.getByRole("region", { name, exact: true });
    }
    for (const name of names) await go(name);

    const inbox = await go("Conversations");
    const toolbar = app.locator(".studio-toolbar");
    const composer = inbox.getByRole("textbox", { name: "Message Kai" });
    if (width >= 860) {
      assert(await composer.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 120), "composer must fit in desktop viewport");
    } else {
      const trigger = toolbar.getByRole("button", { name: "Browse workspace" });
      await trigger.click();
      const drawer = page.getByRole("dialog", { name: "Studio navigation" });
      await drawer.waitFor();
      await drawer.getByRole("button", { name: "Close studio navigation" }).click();
      assert(await trigger.evaluate(el => document.activeElement === el), "closing studio navigation restores toolbar focus");
    }
    const geometry = await inbox.evaluate(region => {
      const composer = region.querySelector(".yg-composer").getBoundingClientRect();
      const transcript = region.querySelector(".yg-transcript").getBoundingClientRect();
      return { aligned: Math.abs(composer.left - transcript.left) <= 1 && Math.abs(composer.width - transcript.width) <= 1 };
    });
    assert(geometry.aligned, "conversation and composer should use the same reading column");
    assert.equal(await inbox.getByRole("button", { name: "Jump to latest" }).count(), 0);
    const sourceLabel = "Inspect brief";
    const source = inbox.getByRole("button", { name: sourceLabel });
    await source.click();
    if (width >= 1200) {
      const inspector = inbox.getByRole("complementary", { name: "Conversation inspector" });
      await inspector.getByText("Morning brief.md").waitFor();
      await inspector.getByRole("button", { name: "Close conversation details" }).click();
    } else {
      const inspector = page.getByRole("dialog", { name: "Files" });
      await inspector.getByText("Morning brief.md").waitFor();
      await page.keyboard.press("Escape");
    }
    await page.waitForFunction((expected) => document.activeElement?.textContent?.trim() === expected, sourceLabel);
    await composer.fill("Please compare the timestamps.");
    await inbox.getByRole("button", { name: "Send", exact: true }).click();
    await inbox.getByRole("region", { name: "Kai transcript" }).getByText(/I added your note/).waitFor();
    await toolbar.getByRole("button", { name: "Conversation details", exact: true }).click();
    await page.getByRole("menuitem", { name: "New thread", exact: true }).click();
    await inbox.getByRole("textbox", { name: "Message Thread 1" }).fill("Use the observation log.");
    await inbox.getByRole("button", { name: "Attach", exact: true }).click();
    await page.getByRole("dialog", { name: "Attach a sample file" }).getByRole("button", { name: /Observation log/ }).click();
    await inbox.getByRole("button", { name: "Send", exact: true }).click();
    await inbox.getByText(/Attached: Observation log/).waitFor();

    const tasks = await go("Tasks");
    await tasks.getByRole("radio", { name: /^Working/ }).click();
    await tasks.getByRole("heading", { name: "Prepare the research brief" }).waitFor();
    assert.equal(await tasks.getByRole("heading", { name: "Review the missing source" }).count(), 0);
    await tasks.getByRole("radio", { name: /^All/ }).click();
    await tasks.getByRole("button", { name: "New task" }).click();
    const task = page.getByRole("dialog", { name: "New task" });
    await task.getByRole("textbox", { name: "Task", exact: true }).fill("Verify the sample");
    await task.getByRole("button", { name: "Create task" }).click();
    await tasks.getByRole("heading", { name: "Verify the sample" }).waitFor();
    await tasks.getByRole("button", { name: "Mark complete" }).click();
    await tasks.getByText("Review recorded").waitFor();

    const workflows = await go("Workflows");
    assert.equal(await workflows.evaluate(el => getComputedStyle(el).animationName), "studio-view-in");
    await workflows.getByRole("button", { name: "Prepare the morning brief" }).click();
    await workflows.getByRole("textbox", { name: "Step label" }).fill("Prepare the Tuesday brief");
    await workflows.getByRole("button", { name: "Move up" }).click();
    await workflows.locator(".studio-workflow-steps li").first().getByText("Prepare the Tuesday brief").waitFor();
    await workflows.getByRole("button", { name: "Run sample" }).click();
    await workflows.getByRole("button", { name: "Review output" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Approve sample" }).click();
    await workflows.getByText("Sample run complete").waitFor();

    const schedule = await go("Schedule");
    await schedule.getByRole("button", { name: "Add routine" }).click();
    const routine = page.getByRole("dialog");
    await routine.getByRole("textbox", { name: "Routine name" }).fill("Afternoon check");
    await routine.getByRole("button", { name: "Save routine" }).click();
    await schedule.getByRole("switch", { name: /Afternoon check/ }).waitFor();

    const usage = await go("Usage");
    await chooseSelect(page, usage.getByRole("combobox", { name: "Metric" }), "Tokens");
    await usage.getByRole("heading", { name: "320K tokens" }).waitFor();
    await chooseSelect(page, usage.getByRole("combobox", { name: "Period" }), "30 days");
    await usage.getByText("Oct 23", { exact: true }).first().waitFor();

    const files = await go("Files");
    await files.getByRole("button", { name: /Observation log/ }).click();
    await page.getByRole("dialog", { name: "Observation log.csv" }).getByText(/Date, Observations, Reviewed/).waitFor();
    await page.keyboard.press("Escape");

    await files.getByRole("button", { name: "Select files" }).click();
    await files.getByRole("checkbox", { name: "Select Observation log.csv" }).check();
    await files.getByRole("radio", { name: "Document", exact: true }).click();
    assert.equal(await files.getByRole("button", { name: "Remove from sample" }).count(), 0);
    await files.getByRole("radio", { name: "All files" }).click();
    await files.getByRole("button", { name: "Remove from sample" }).click();
    const searchHost = await openNavIfCompact();
    await searchHost.getByRole("button", { name: "Search", exact: true }).click();
    const fileSearch = page.getByRole("dialog", { name: "Search workspace" });
    await fileSearch.getByRole("searchbox").fill("Observation log");
    assert.equal(await fileSearch.getByRole("button", { name: /Observation log/ }).count(), 0);
    await page.keyboard.press("Escape");

    const customers = await go("Customers");
    await customers.getByRole("button", { name: "New customer" }).click();
    const customer = page.getByRole("dialog");
    await customer.getByRole("textbox", { name: "Customer name" }).fill("Review Studio");
    await customer.getByRole("textbox", { name: "Email" }).fill("sample@example.test");
    await customer.getByRole("button", { name: "Save customer" }).click();
    await customers.getByRole("heading", { name: "Review Studio" }).waitFor();

    const extensions = await go("Extensions");
    await extensions.getByRole("radio", { name: "Skills" }).click();
    await extensions.getByRole("button", { name: "Add", exact: true }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Enable sample" }).click();
    await extensions.getByText("Enabled", { exact: true }).waitFor();

    const settings = await go("Settings");
    await settings.getByRole("button", { name: "Appearance" }).click();
    await chooseSelect(page, settings.getByRole("combobox", { name: "Color scheme" }), "Dark");
    await settings.getByRole("button", { name: "Save preferences" }).click();
    await settings.getByText("Preferences saved.").waitFor();

    const finalSearchHost = await openNavIfCompact();
    await finalSearchHost.getByRole("button", { name: "Search", exact: true }).click();
    const search = page.getByRole("dialog", { name: "Search workspace" });
    await search.getByRole("searchbox").fill("Morning brief");
    await search.getByRole("button", { name: /Morning brief/ }).click();
    await page.getByRole("dialog", { name: "Morning brief.md" }).waitFor();
    await page.keyboard.press("Escape");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reduced = await go("Workflows");
    assert.equal(await reduced.evaluate(el => getComputedStyle(el).animationName), "none");

    assert.deepEqual(errors, []);
    assert.deepEqual(remoteRequests, []);
    console.log(width + "px: 11 views and session-local workflows passed.");
  } finally {
    await page.close();
  }
}

async function exerciseShortWindow(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
  try {
    await page.goto(origin + "/examples");
    const transcript = page.locator(".studio-thread .yg-transcript");
    await transcript.waitFor();
    assert((await transcript.boundingBox()).height >= 96, "the transcript needs room to read");
    const send = page.getByRole("button", { name: "Send", exact: true });
    await send.scrollIntoViewIfNeeded();
    assert(await send.evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), "send must be reachable");
  } finally {
    await page.close();
  }
}

(async () => {
  const hosted = process.env.YOGURT_GUIDE_URL
    ? { server: null, origin: process.env.YOGURT_GUIDE_URL }
    : await startSiteServer();
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await Promise.all([
      exercise(browser, hosted.origin, 1440),
      exercise(browser, hosted.origin, 390),
      exerciseShortWindow(browser, hosted.origin),
    ]);
  } finally {
    await browser.close();
    hosted.server?.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
