const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#rating");
      const root = page.locator('.specimen[data-component="rating"]');
      const labels = root.locator(".yg-rating label");
      await labels.first().waitFor();
      assert.equal(await labels.count(), 5);
      assert.equal(await labels.nth(2).getAttribute("data-filled"), "true");
      assert.equal(await labels.nth(3).getAttribute("data-filled"), null);
      await labels.nth(4).hover();
      assert.equal(await labels.nth(4).getAttribute("data-filled"), "true");
      await page.mouse.move(0, 0);
      assert.equal(await labels.nth(4).getAttribute("data-filled"), null);
      await root.getByRole("radio", { name: "4 of 5" }).check();
      assert.equal(await labels.nth(3).getAttribute("data-filled"), "true");
      assert.equal(await labels.nth(4).getAttribute("data-filled"), null);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await root.getByRole("radio", { name: "5 of 5" }).check();
      await page.waitForFunction(() => document.querySelector('.specimen[data-component="rating"] .yg-rating label:last-child svg')?.style.getPropertyValue("--yg-star-fill") === "100%");
      await page.close();
    }
    console.log("Rating selection and star states verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
