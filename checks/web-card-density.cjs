const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#card");
      const cards = page.locator(".variation .specimen");
      for (const [density, padding] of Object.entries({ compact: 16, regular: 18, spacious: 24 })) {
        const card = cards.locator(`.yg-card[data-density="${density}"]`);
        await card.waitFor();
        const geometry = await card.evaluate(el => {
          const style = getComputedStyle(el);
          return { padding: parseFloat(style.paddingTop), radius: parseFloat(style.borderTopLeftRadius), border: parseFloat(style.borderTopWidth), width: el.getBoundingClientRect().width, parentWidth: el.parentElement.getBoundingClientRect().width };
        });
        assert.equal(geometry.padding, padding, density);
        assert.equal(geometry.radius, 24, density);
        assert.equal(geometry.border, 0, density);
        assert(geometry.width <= geometry.parentWidth + 1, density);
      }
      await page.close();
    }
    console.log("Three borderless card densities verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
