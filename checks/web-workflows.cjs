const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

async function verify() {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: width === 320 ? "dark" : "light",
        reducedMotion: width === 320 ? "reduce" : "no-preference",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pathToFileURL(join(__dirname, "../apps/guide/generated/workflows.html")).href);
      await page.getByRole("combobox", { name: "Sort records" }).click();
      await page.getByRole("option", { name: "Title", exact: true }).click();
      assert.match(await page.getByRole("list", { name: "Workspace records" }).getByRole("button").first().textContent(), /Project intake/);
      await page.getByRole("button", { name: /Project intake/ }).click();
      const detail = page.getByRole("region", { name: "Record details" });
      await detail.getByText("Project intake", { exact: true }).waitFor();
      if (width === 320) await page.getByRole("button", { name: "Back to records" }).click();
      await page.getByRole("searchbox").fill("nothing to match");
      await page.getByText(/No results|No matches/i).first().waitFor();
      async function openWorkflow(name) {
        if (width === 320) await page.getByRole("button", { name: "Expand navigation" }).click();
        await page.getByRole("link", { name }).click();
        await page.getByRole("heading", { name, level: 1 }).waitFor();
      }
      await openWorkflow("Write a request");
      const prompt = page.getByRole("textbox", { name: "Prompt" });
      await prompt.fill("Review the missing notes.");
      await page.getByRole("button", { name: "Send" }).click();
      await page.getByText("Could not load the supporting notes.").waitFor();
      await page.getByRole("button", { name: "Retry" }).click();
      await page.getByText(/two items that need an owner before handoff/).waitFor();
      await openWorkflow("Review a decision");
      const review = page.getByRole("button", { name: "Return for revision" });
      await review.click();
      const dialog = page.getByRole("dialog", { name: "Return the brief for revision?" });
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await review.click();
      await dialog.getByRole("button", { name: "Return for revision" }).click();
      await page.getByText("Could not return the brief. Try again.").waitFor();
      await review.click();
      await dialog.getByRole("button", { name: "Return for revision" }).click();
      await page.getByText("Brief returned to Kai. The handoff is paused.").waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Verified record selection, request retry and decision recovery at ${width}px.`);
    }
  } finally {
    await browser.close();
  }
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
