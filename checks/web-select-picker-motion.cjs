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
      const select = page.getByRole("combobox", { name: "Project" });
      await select.click();
      await page.waitForFunction(() => document.querySelector(".specimen select")?.matches(":open"));
      assert.equal(await select.evaluate(node => node.matches(":open")), true);
      assert.equal(await select.inputValue(), "sourdough");
      await page.keyboard.press("Escape");
      assert.equal(await select.inputValue(), "sourdough", "cancelling must not change the value");
      await select.focus();
      await page.keyboard.press("Space");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(await select.inputValue(), "meatball");
      assert.deepEqual(errors, []);
      await context.close();
    }

    // This exercises the feature-detection branch; it is not a substitute for
    // testing an actual browser that does not implement customizable select.
    const context = await browser.newContext({ viewport: { width: 320, height: 800 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const original = CSS.supports.bind(CSS);
      CSS.supports = (...args) => args[0] === "appearance" && args[1] === "base-select" ? false : original(...args);
    });
    await page.goto(gallery + "#select");
    const fallback = page.getByRole("combobox", { name: "Project" });
    await fallback.click();
    await page.waitForFunction(() => document.querySelector(".specimen select")?.matches(":open"));
    assert.equal(await fallback.locator("xpath=..").getAttribute("data-picker-side"), null);
    await fallback.getByRole("option", { name: "Yogurt", exact: true }).click();
    assert.equal(await fallback.inputValue(), "yogurt");
    await context.close();
    console.log("Native select motion preferences, keyboard behavior and feature-detection fallback verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
