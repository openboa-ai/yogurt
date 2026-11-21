const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");
const checkboxSize = require("../design/tokens/ui.json").geometry["checkbox-size"];

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#checkbox");
      const control = page.locator('.specimen[data-component="checkbox"]').getByRole("checkbox");
      await control.waitFor();
      const box = await control.boundingBox();
      assert.equal(box.width, checkboxSize);
      assert.equal(box.height, checkboxSize);
      assert.equal(await control.evaluate(el => getComputedStyle(el).borderWidth), "0px");
      const before = await control.getAttribute("aria-checked");
      await control.focus();
      await page.keyboard.press("Space");
      assert.notEqual(await control.getAttribute("aria-checked"), before);
      await page.emulateMedia({ forcedColors: "active" });
      assert.equal(await control.evaluate(el => getComputedStyle(el).borderWidth), "1px");
      await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
      await control.press("Space");
      assert.equal(await control.getAttribute("aria-checked"), before);
      assert.equal(await control.locator(".yg-checkbox-check").evaluate(el => getComputedStyle(el).strokeDashoffset), "0px");
      const variation = page.locator(".variation .specimen");
      const form = variation.getByRole("form", { name: "Checkbox form" });
      assert.equal(await form.evaluate(el => new FormData(el).get("notes")), "include");
      const notes = form.getByRole("checkbox", { name: "Include notes" });
      await notes.uncheck();
      assert.equal(await form.evaluate(el => new FormData(el).get("notes")), null);
      assert.equal(await variation.getByRole("checkbox", { name: "Some records selected" }).getAttribute("aria-checked"), "mixed");
      assert(await variation.getByRole("checkbox", { name: "Unavailable option" }).isDisabled());
      await page.close();
    }
    console.log("Checkbox dimensions, keyboard and forced colors verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
