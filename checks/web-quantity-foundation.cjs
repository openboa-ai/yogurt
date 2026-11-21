const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#numeric-spinner");
      const root = page.locator('.specimen[data-component="numeric-spinner"]');
      const more = root.getByRole("button", { name: "Increase Copies" });
      const less = root.getByRole("button", { name: "Decrease Copies" });
      await more.waitFor();
      assert.equal(Math.round((await more.boundingBox()).width), 40);
      assert.equal(Math.round((await less.boundingBox()).height), 40);
      await more.click();
      assert.equal(await root.locator(".yg-quantity-in").innerText(), "4");
      await less.click();
      await less.click();
      await less.click();
      assert(await less.isDisabled());
      assert.equal(await root.locator(".yg-quantity-in").innerText(), "1");
      await page.close();
    }
    console.log("Quantity geometry and bounds verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
