const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#slider");
      const slider = page.locator('.specimen[data-component="slider"]').getByRole("slider");
      await slider.waitFor();
      const initial = Number(await slider.inputValue());
      const geometry = await slider.evaluate(el => ({
        height: el.getBoundingClientRect().height,
        track: parseFloat(getComputedStyle(el).getPropertyValue("--yg-slider-track-height")),
        thumb: parseFloat(getComputedStyle(el).getPropertyValue("--yg-slider-thumb-size")),
        fill: el.style.getPropertyValue("--yg-range-fill"),
      }));
      assert(geometry.height >= 44);
      assert.equal(geometry.track, 4);
      assert.equal(geometry.thumb, 28);
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      assert(Number(await slider.inputValue()) > initial);
      assert.notEqual(await slider.evaluate(el => el.style.getPropertyValue("--yg-range-fill")), geometry.fill);
      const card = page.locator(".variation .specimen").getByRole("slider", { name: "Preview volume" });
      await card.waitFor();
      assert((await card.boundingBox()).height >= 44);
      assert.equal(await card.getAttribute("aria-valuetext"), "30%");
      await card.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await card.getAttribute("aria-valuetext"), "31%");
      const cardBox = await card.boundingBox();
      await card.click({ position: { x: cardBox.width * .75, y: cardBox.height / 2 } });
      assert(Number(await card.inputValue()) > 50);
      await page.close();
    }
    console.log("Slider geometry and keyboard updates verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
