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
        const h = (await row.boundingBox()).height;
        assert(h >= 32 && h <= 44, `Desktop list row height expected 32-44px, got ${h}`);
        assert.equal(await row.evaluate(el => getComputedStyle(el).columnGap), "10px");
      }
      await root.getByRole("button", { name: /Field notes/ }).click();
      await root.getByRole("status").filter({ hasText: "Opened Field notes." }).waitFor();
      await page.close();
    }
    const touchPage = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true });
    await touchPage.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#list-row");
    const touchRows = touchPage.locator('.specimen[data-component="list-row"] .yg-row');
    await touchRows.first().waitFor();
    for (const row of await touchRows.all()) {
      const h = (await row.boundingBox()).height;
      assert(h >= 44, `Coarse list row height expected >= 44px, got ${h}`);
    }
    await touchPage.close();
    console.log("List row dimensions, coarse touch targets and action verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
