const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#button");
      const related = page.locator(".related-actions");
      await related.waitFor();
      const guidance = page.locator(".catalog-guidance");
      assert.match(await guidance.innerText(), /Commit one clearly named action/);
      assert.equal(await guidance.getByRole("link", {name:"Dialog"}).count(), 1);
      await guidance.getByRole("link", {name:"Dialog"}).click();
      assert.equal(await page.locator(".catalog-intro h1").innerText(), "Dialog");
      assert.match(await page.locator(".catalog-guidance").innerText(), /focused task/);
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#button");
      await page.locator(".related-actions").waitFor();
      const links = await related.getByRole("link").all();
      assert.equal(links.length, 5);
      const targets = [
        ["Copy", "motion-copy-button"], ["Quantity", "motion-cart-button"],
        ["Hold to confirm", "motion-hold-button"], ["Slide to confirm", "motion-slide-confirm"],
        ["Loading result", "motion-loading-success-button"],
      ];
      for (const [name, id] of targets) {
        await related.getByRole("link", { name, exact: true }).click();
        assert.equal(new URL(page.url()).hash, "#" + id);
        await page.locator(`.specimen[data-component="${id}"]`).waitFor();
        await page.goBack();
        await related.waitFor();
      }
      if (width === 320) await page.getByRole("button", { name: "Browse components" }).click();
      const search = page.getByRole("searchbox", { name: "Find a component" });
      await search.fill("slider");
      const link = page.getByRole("link", { name: "Slider", exact: true });
      await link.waitFor();
      await link.click();
      assert.equal(await page.locator(".catalog-intro h1").innerText(), "Slider");
      if (width === 320) await page.getByRole("button", { name: "Browse components" }).click();
      await search.clear();
      await page.close();
    }
    console.log("Shared guide search and component navigation verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
