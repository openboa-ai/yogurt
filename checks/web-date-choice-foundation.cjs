const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const guide = pathToFileURL(join(process.cwd(), "apps/guide/generated/motion-patterns.html")).href;
  try {
    for (const width of [320, 1440]) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion, colorScheme: width === 320 ? "dark" : "light" });
        await page.goto(guide + "#date-choice");
        const root = page.locator("#date-choice");
        const trigger = root.getByRole("button", { name: "Choose a date" });
        await trigger.waitFor();
        assert.equal(await root.locator('input[type="date"]').count(), 0);
        const field = await trigger.boundingBox();
        const stage = await root.boundingBox();
        assert(field && stage && field.x >= stage.x - 1 && field.x + field.width <= stage.x + stage.width + 1);
        await trigger.focus();
        await trigger.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Choose a date" });
        await dialog.waitFor();
        const popup = await dialog.boundingBox();
        assert(popup && popup.x >= -1 && popup.x + popup.width <= width + 1, "calendar stays inside the viewport");
        await dialog.getByRole("button", { name: /November 21/ }).click();
        await root.getByRole("status").getByText("Selected: 2026-11-21").waitFor();
        assert.equal(await trigger.getAttribute("data-state"), "closed");
        await root.getByRole("button", { name: "Clear" }).click();
        await root.getByRole("status").getByText("No date selected").waitFor();
        await trigger.focus();
        await trigger.press("Enter");
        await dialog.waitFor();
        await page.keyboard.press("Escape");
        assert.equal(await trigger.getAttribute("data-state"), "closed");
        await page.close();
      }
    }
    console.log("Date choice shared picker, selection, clear, keyboard and layout verified at 320 and 1440 px.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
