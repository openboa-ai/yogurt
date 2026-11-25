const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");

const gallery = pathToFileURL(resolve(__dirname, "../apps/guide/generated/components.html")).href;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const [width, colorScheme, reducedMotion, forcedColors] of [
      [320, "dark", "no-preference", "none"],
      [1440, "light", "no-preference", "none"],
      [320, "light", "reduce", "none"],
      [1440, "dark", "no-preference", "active"],
    ]) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme, reducedMotion, forcedColors });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(String(error)));
      await page.goto(gallery + "#select");
      const select = page.getByRole("combobox", { name: "Project", exact: true });
      await select.click();
      const listbox = page.getByRole("listbox");
      await listbox.waitFor();
      assert.equal(await select.getAttribute("aria-expanded"), "true");
      assert.match(await select.innerText(), /Sourdough/);
      await page.keyboard.press("Escape");
      await listbox.waitFor({ state: "hidden" });
      assert.match(await select.innerText(), /Sourdough/, "cancelling must not change the value");
      await select.focus();
      await page.keyboard.press("Space");
      await page.locator(".yg-select-popup [data-highlighted]").waitFor();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await listbox.waitFor({ state: "hidden" });
      assert.match(await select.innerText(), /Meatball/);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log("Custom Select motion preferences, forced colors and keyboard behavior verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
