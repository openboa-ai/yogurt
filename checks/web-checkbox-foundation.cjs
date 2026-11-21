const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#checkbox");
      const control = page.locator('.specimen[data-component="checkbox"]').getByRole("checkbox");
      await control.waitFor();
      const box = await control.boundingBox();
      assert.equal(box.width, 24);
      assert.equal(box.height, 24);
      assert.equal(await control.evaluate(el => getComputedStyle(el).borderWidth), "0px");
      const before = await control.getAttribute("aria-checked");
      await control.focus();
      await page.keyboard.press("Space");
      assert.notEqual(await control.getAttribute("aria-checked"), before);
      await page.emulateMedia({ forcedColors: "active" });
      assert.equal(await control.evaluate(el => getComputedStyle(el).borderWidth), "1px");
      await page.close();
    }
    console.log("Checkbox dimensions, keyboard and forced colors verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
