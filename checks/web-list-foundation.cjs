const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#list-row");
      const root = page.locator('.specimen[data-component="list-row"]');
      const rows = root.locator(".yg-row");
      await rows.first().waitFor();
      assert.equal(await rows.count(), 3);
      for (const row of await rows.all()) {
        assert((await row.boundingBox()).height >= 48);
        assert.equal(await row.evaluate(el => getComputedStyle(el).gap), "12px");
      }
      await root.getByRole("button", { name: /Field notes/ }).click();
      await root.getByRole("status").filter({ hasText: "Opened Field notes." }).waitFor();
      await page.close();
    }
    console.log("List row dimensions and action verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
