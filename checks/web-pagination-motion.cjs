const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#pagination");
      const root = page.locator('.specimen[data-component="pagination"]');
      const nav = root.getByRole("navigation", { name: "Pages" });
      const previous = nav.getByRole("button", { name: "Previous" });
      const next = nav.getByRole("button", { name: "Next" });
      const live = nav.locator('[aria-live="polite"]');
      await next.waitFor();
      assert.equal(await live.innerText(), "1 of 5");
      assert.equal(await previous.isDisabled(), true);
      assert.equal(await next.isEnabled(), true);

      await next.focus();
      await next.press("Enter");
      assert.equal(await live.innerText(), "2 of 5");
      assert.equal(await previous.isEnabled(), true);
      assert.equal(await nav.locator(".yg-pagination-value").isVisible(), true);
      assert.equal(await live.getAttribute("aria-live"), "polite");

      for (let i = 0; i < 3; i++) await next.click();
      assert.equal(await live.innerText(), "5 of 5");
      assert.equal(await next.isDisabled(), true);
      await previous.focus();
      await previous.press("Space");
      assert.equal(await live.innerText(), "4 of 5");
      assert.equal(await next.isEnabled(), true);

      await page.emulateMedia({ reducedMotion: "reduce" });
      await previous.click();
      assert.equal(await live.innerText(), "3 of 5");
      assert.equal(await nav.locator(".yg-pagination-value").evaluate(node => getComputedStyle(node).animationName), "none");
      assert.equal(await live.getAttribute("aria-live"), "polite");
      await page.close();
    }
    console.log("Pagination boundaries, keyboard changes, live status and reduced motion verified at 320 and 1440 px.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
