const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium, webkit } = require("playwright-core");

(async () => {
  const engine = process.argv[2] === "webkit" ? webkit : chromium;
  const browser = await engine.launch(engine === chromium ? { channel: "chrome" } : {});
  try {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ reducedMotion, viewport: { width: 1100, height: 850 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(join(__dirname, "../apps/guide/generated/motion-patterns.html")).href + "#spring-dropdown");
      const trigger = page.getByRole("combobox", { name: "Work status" });
      const list = page.getByRole("listbox");
      await trigger.press("Space");
      await list.waitFor();
      if (reducedMotion === "no-preference") {
        assert(await list.evaluate(node => {
          const current = parseFloat(node.style.getPropertyValue("--yg-picker-open"));
          return Number.isFinite(current) && current >= 0;
        }), "the open SDK layer uses Yogurt's spring progress");
      }
      await page.keyboard.press("ArrowDown");
      assert.equal((await list.locator("[data-highlighted]").textContent()).trim(), "In review");
      await page.keyboard.press("Escape");
      await list.waitFor({ state: "hidden" });
      assert(await trigger.evaluate(node => node === document.activeElement));
      await trigger.click();
      await list.getByRole("option", { name: "In review" }).click();
      await list.waitFor({ state: "hidden" });
      await trigger.getByText("In review", { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(engine.name() + " spring dropdown selection, dismissal, focus return and reduced motion verified.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
