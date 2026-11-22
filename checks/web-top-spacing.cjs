const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#top");
      const header = page.locator('.specimen[data-component="top"] .yg-section-line > div').first();
      await header.waitFor();
      const geometry = await header.evaluate((el) => {
        const boxes = Array.from(el.children, child => child.getBoundingClientRect());
        return { gap: parseFloat(getComputedStyle(el).rowGap), gaps: boxes.slice(1).map((box, i) => box.top - boxes[i].bottom) };
      });
      assert.equal(geometry.gap, 6);
      assert(geometry.gaps.length >= 2);
      assert(geometry.gaps.every(gap => gap >= 6), "header lines must have visible separation");
      await page.close();
    }
    console.log("Top text spacing verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
