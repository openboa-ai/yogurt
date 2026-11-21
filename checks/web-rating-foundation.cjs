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
      assert.equal(await labels.count(), 5);
      assert.equal(await labels.nth(2).locator("span").innerText(), "★");
      assert.equal(await labels.nth(3).locator("span").innerText(), "☆");
      await root.getByRole("radio", { name: "4 of 5" }).check();
      assert.equal(await labels.nth(3).locator("span").innerText(), "★");
      assert.equal(await labels.nth(4).locator("span").innerText(), "☆");
      await page.close();
    }
    console.log("Rating selection and star states verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
