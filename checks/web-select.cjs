const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");
const brand = require("../design/tokens/brand.json");
const { control, radius } = brand;

const gallery = pathToFileURL(resolve(__dirname, "../apps/guide/generated/components.html")).href;

(async () => {
  const browser = await chromium.launch({
    channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome",
  });
  const seen = [], problems = [];
  try {
    for (const [theme, width, touch] of [
      ["light", 1120, false],
      ["dark", 1120, false],
      ["light", 320, true],
    ]) {
      const context = await browser.newContext({
        colorScheme: theme,
        viewport: { width, height: 800 },
        deviceScaleFactor: 2,
        hasTouch: touch,
        isMobile: touch,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => problems.push(String(e)));
      await page.goto(gallery + "#select");
      await page.evaluate(() => document.fonts.ready);
      const select = page.getByRole("combobox", { name: "Project", exact: true });
      if (touch) await select.tap();
      else await select.click();
      const listbox = page.getByRole("listbox");
      await listbox.waitFor();
      await page.locator(".yg-select-popup[data-open]:not([data-starting-style])").waitFor();
      await page.evaluate(() => Promise.all(
        Array.from(document.querySelectorAll(".yg-select-popup")).flatMap((el) => el.getAnimations().map((a) => a.finished.catch(() => {})))
      ));
      const metrics = await page.evaluate(() => {
        const trigger = document.querySelector(".specimen .yg-select-trigger");
        const panel = document.querySelector('.yg-select-popup[data-open]') || document.querySelector(".yg-select-popup");
        const option = panel.querySelector('[role="option"]');
        return {
          field: trigger.getBoundingClientRect().toJSON(),
          panel: panel.getBoundingClientRect().toJSON(),
          optionHeight: option.getBoundingClientRect().height,
          corner: getComputedStyle(panel).borderTopLeftRadius,
          background: getComputedStyle(panel).backgroundColor,
        };
      });
      assert.equal(metrics.corner, radius.menu + "px");
      assert.ok(metrics.optionHeight >= (touch ? control.touch : control.compact), JSON.stringify(metrics));
      assert.ok(metrics.panel.width >= 160 && Math.abs(metrics.panel.x - metrics.field.x) <= 2, JSON.stringify(metrics));
      if (!touch) {
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Escape");
        await listbox.waitFor({ state: "hidden" });
        assert.match(await select.innerText(), /Sourdough/);
        await select.focus();
        await page.keyboard.press("Space");
        await page.locator(".yg-select-popup [data-highlighted]").waitFor();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await listbox.waitFor({ state: "hidden" });
        assert.match(await select.innerText(), /Meatball/);
        await select.click();
        await listbox.waitFor();
        await page.getByRole("option", { name: "Yogurt", exact: true }).click();
        await listbox.waitFor({ state: "hidden" });
        assert.match(await select.innerText(), /Yogurt/);
        for (const name of ["Paper", "Mist"]) {
          await page.getByRole("radio", { name, exact: true }).click();
          await select.click();
          await listbox.waitFor();
          const bg = await page.locator(".yg-select-popup[data-open]").evaluate(el => getComputedStyle(el).backgroundColor);
          seen.push([theme, name, bg]);
          await page.keyboard.press("Escape");
          await listbox.waitFor({ state: "hidden" });
        }
      } else {
        await page.getByRole("option", { name: "Yogurt", exact: true }).tap();
        await listbox.waitFor({ state: "hidden" });
        assert.match(await select.innerText(), /Yogurt/);
      }
      seen.push(metrics);
      await context.close();
    }
    assert.deepEqual(problems, []);
    console.log(JSON.stringify({ browser: browser.version(), seen: seen.length }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
