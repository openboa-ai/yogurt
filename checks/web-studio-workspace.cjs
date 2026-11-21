const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");

const origin = process.env.YOGURT_GUIDE_URL ?? "http://127.0.0.1:5273";
const names = ["Conversations", "Tasks", "Workflows", "Schedule", "Files", "Usage", "Customers", "Extensions", "Model providers", "Settings", "Help"];

async function exercise(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 980 }, colorScheme: width < 780 ? "dark" : "light" });
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
    async function go(name) {
      if (width < 780) await app.getByRole("button", { name: "Browse workspace" }).click();
      await app.getByRole("navigation", { name: "Studio sections" }).getByRole("button", { name, exact: true }).click();
      await app.getByRole("region", { name, exact: true }).waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + " overflows");
      return app.getByRole("region", { name, exact: true });
    }
    for (const name of names) await go(name);

    const inbox = await go("Conversations");
    await inbox.getByRole("textbox", { name: "Message Kai" }).fill("Please compare the timestamps.");
    await inbox.getByRole("button", { name: "Send", exact: true }).click();
    await inbox.getByText(/I added your note/).waitFor();
    await inbox.getByRole("button", { name: "New thread" }).click();
    await inbox.getByRole("textbox", { name: "Message Thread 1" }).fill("Use the observation log.");
    await inbox.getByRole("button", { name: "Attach", exact: true }).click();
    await page.getByRole("dialog", { name: "Attach a sample file" }).getByRole("button", { name: /Observation log/ }).click();
    await inbox.getByRole("button", { name: "Send", exact: true }).click();
    await inbox.getByText(/Attached: Observation log/).waitFor();

    const tasks = await go("Tasks");
    await tasks.getByRole("button", { name: "New task" }).click();
    const task = page.getByRole("dialog", { name: "New task" });
    await task.getByRole("textbox", { name: "Task", exact: true }).fill("Verify the sample");
    await task.getByRole("button", { name: "Create task" }).click();
    await tasks.getByRole("heading", { name: "Verify the sample" }).waitFor();
    await tasks.getByRole("button", { name: "Mark complete" }).click();
    await tasks.getByText("Review recorded").waitFor();

    const workflows = await go("Workflows");
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
    await usage.getByRole("combobox", { name: "Metric" }).selectOption("Tokens");
    await usage.getByRole("heading", { name: "320K tokens" }).waitFor();

    const files = await go("Files");
    await files.getByRole("button", { name: /Observation log/ }).click();
    await page.getByRole("dialog", { name: "Observation log.csv" }).getByText(/Date, Observations, Reviewed/).waitFor();
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
    await settings.getByRole("combobox", { name: "Color scheme" }).selectOption("Dark");
    await settings.getByRole("button", { name: "Save preferences" }).click();
    await settings.getByText("Preferences saved.").waitFor();

    await app.getByRole("button", { name: "Search", exact: true }).click();
    const search = page.getByRole("dialog", { name: "Search workspace" });
    await search.getByRole("searchbox").fill("Morning brief");
    await search.getByRole("button", { name: /Morning brief/ }).click();
    await page.getByRole("dialog", { name: "Morning brief.md" }).waitFor();
    await page.keyboard.press("Escape");

    assert.deepEqual(errors, []);
    assert.deepEqual(remoteRequests, []);
    console.log(width + "px: 11 views and session-local workflows passed.");
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try { await Promise.all([exercise(browser, 1440), exercise(browser, 390)]); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
