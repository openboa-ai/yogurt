const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const base = process.env.YOGURT_GUIDE_URL || "http://127.0.0.1:6452";
      await page.goto(base + "/components/slider");
      await page.locator('.specimen[data-component="slider"] input[type="range"]').first().waitFor();
      await page.reload();
      await page.locator('.specimen[data-component="slider"]').waitFor();
      await page.goto(base + "/motion/checkbox-list");
      await page.getByRole("heading", { name: "CheckboxList", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/components/motion-checkbox-list");
      await page.goto(base + "/components.html#slider");
      await page.locator('.specimen[data-component="slider"]').waitFor();
      await page.goto(base + "/motion-patterns.html#checkbox-list");
      await page.getByRole("heading", { name: "CheckboxList", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/components/motion-checkbox-list");
      await page.goto(base + "/components/unknown-component");
      await page.getByRole("heading", { name: "Component not found" }).waitFor();
      await page.goto(base + "/motion/unknown-pattern");
      await page.getByRole("heading", { name: "Pattern not found" }).waitFor();
      await page.goto(base + "/components/button");
      await page.locator('.specimen[data-component="button"]').waitFor();
      if (process.env.YOGURT_SCREENSHOT_DIR) {
        await page.screenshot({ path: `${process.env.YOGURT_SCREENSHOT_DIR}/vite-components-${width}.png` });
      }
      if (width === 1440) {
        await page.getByRole("link", { name: "Brand", exact: true }).first().click();
        assert.equal(new URL(page.url()).pathname, "/");
        await page.goBack();
        await page.locator('.specimen[data-component="button"]').waitFor();
        await page.goForward();
        assert.equal(new URL(page.url()).pathname, "/");
      }
      for (const [example, name, destination] of [
        ["link", "View record details", "record-facts"],
        ["breadcrumb", "Records", "list"],
        ["navigation-list", "Facts", "record-facts"],
      ]) {
        await page.goto(base + "/components/" + example);
        await page.locator(".specimen").first().getByRole("link", { name, exact: true }).click();
        await page.waitForURL(base + "/components/" + destination);
        await page.locator(`.specimen[data-component="${destination}"]`).waitFor();
      }
      if (width === 320) {
        const offline = pathToFileURL(resolve("apps/guide/generated/components.html")).href;
        await page.goto(offline + "#motion-spring-dropdown");
        const trigger = page.locator(".specimen").first().getByRole("combobox", { name: "Work status" });
        await trigger.click();
        await page.getByRole("listbox").getByRole("option", { name: "Complete" }).click();
        assert.equal(await trigger.innerText(), "Complete");
        await page.goto(offline + "#link");
        await page.locator(".specimen").first().getByRole("link", { name: "View record details" }).click();
        await page.waitForURL(offline + "#record-facts");
        await page.locator('.specimen[data-component="record-facts"]').waitFor();
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("Clean and legacy guide routes verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
