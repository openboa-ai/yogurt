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
      if (reducedMotion === "no-preference") {
        await page.waitForFunction(() => {
          const root = document.querySelector(".yg-action-menu-expanding");
          const height = parseFloat(root.style.getPropertyValue("--yg-action-menu-height"));
          return height > 1 && height < 150;
        });
        await trigger.click();
        await page.waitForFunction(() => document.querySelector(".yg-action-menu-expanding")?.dataset.open === "false");
        await trigger.click();
      }
      await page.waitForFunction(() => {
        const root = document.querySelector(".yg-action-menu-expanding");
        return root?.dataset.open === "true" &&
          Math.abs(parseFloat(root.style.getPropertyValue("--yg-action-menu-height")) - 158) < 0.1 &&
          [...root.querySelectorAll(".yg-action-menu-options button")].every(button =>
            Math.abs(parseFloat(button.style.getPropertyValue("--yg-action-menu-row")) - 1) < 0.01);
      });
      const menu = root.getByRole("menu", { name: "View actions" });
      assert.equal(await menu.getByRole("menuitem").count(), 3);
      await menu.getByRole("menuitem", { name: "Notes" }).click();
      await page.waitForFunction(() => document.querySelector(".yg-action-menu-expanding")?.dataset.open === "false");
      assert.match(await page.locator(".motion-pattern-article").textContent(), /Notes/);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("Action menu spring reversal and reduced motion verified.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
