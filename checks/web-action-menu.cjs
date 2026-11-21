const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 850 }, reducedMotion });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(join(__dirname, "../apps/guide/generated/motion-patterns.html")).href + "#dynamic-menu");
      const root = page.locator(".yg-action-menu-expanding");
      const trigger = root.getByRole("button", { name: "View actions" });
      await trigger.click();
      await page.waitForFunction(() => document.querySelector(".yg-action-menu-expanding")?.dataset.open === "true");
      const menu = root.getByRole("menu", { name: "View actions" });
      await menu.waitFor({ state: "visible" });
      assert.equal(await menu.getByRole("menuitem").count(), 3);
      for (const item of await menu.getByRole("menuitem").all()) {
        assert.equal(await item.isVisible(), true);
        const box = await item.boundingBox();
        assert(box && box.width > 0 && box.height >= 44, "menu items retain a visible hit target");
      }
      await trigger.click();
      assert.equal(await root.getAttribute("data-open"), "false");
      assert.equal(await root.locator('[role="menu"]').evaluate(node => node.inert), true);
      await trigger.press("ArrowDown");
      assert.equal(await root.getAttribute("data-open"), "true");
      await menu.getByRole("menuitem").first().waitFor({ state: "visible" });
      await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "menuitem");
      await page.keyboard.press("Escape");
      assert.equal(await root.getAttribute("data-open"), "false");
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true, "Escape restores trigger focus");
      await trigger.click();
      await menu.waitFor({ state: "visible" });
      await menu.getByRole("menuitem", { name: "Notes" }).click();
      await page.waitForFunction(() => document.querySelector(".yg-action-menu-expanding")?.dataset.open === "false");
      assert.match(await page.locator(".motion-pattern-article").textContent(), /Notes/);
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true, "selection restores trigger focus");
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("Action menu visibility, keyboard focus, selection and reduced motion verified.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
