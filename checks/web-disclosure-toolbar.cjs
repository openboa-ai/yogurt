const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/motion-patterns.html")).href + "#disclosure-toolbar");
      const root = page.locator("#disclosure-toolbar");
      const summary = root.getByText("Text formatting", { exact: true });
      const arrow = summary.locator("svg");
      await summary.waitFor();
      assert.deepEqual(await arrow.evaluate(node => {
        const rect = node.getBoundingClientRect(); return [rect.width, rect.height];
      }), [20, 20]);
      assert((await summary.boundingBox()).height >= 44);
      await summary.focus();
      await page.keyboard.press("Enter");
      const bold = root.getByRole("button", { name: "Bold", exact: true });
      const italic = root.getByRole("button", { name: "Italic", exact: true });
      for (const button of [bold, italic]) {
        const size = await button.locator(".extra-format-icon").evaluate(node => {
          const rect = node.getBoundingClientRect(); return [rect.width, rect.height];
        });
        assert.deepEqual(size, [18, 18]);
        assert((await button.boundingBox()).height >= 44);
      }
      await bold.click();
      assert.equal(await bold.getAttribute("aria-pressed"), "true");
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await arrow.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.close();
    }
    console.log("Disclosure toolbar icon sizes, alignment and interaction verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
