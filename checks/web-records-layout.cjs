const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/workflows.html")).href + "#records");
      const list = page.getByRole("region", { name: "Record list" });
      const detail = page.getByRole("region", { name: "Record details" });
      await list.waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      const listGeometry = await list.evaluate(node => {
        const outer = node.getBoundingClientRect();
        const sort = node.querySelector(".workflow-sort").getBoundingClientRect();
        const heading = node.querySelector(".yg-section-line").getBoundingClientRect();
        const search = node.querySelector(".yg-filter").getBoundingClientRect();
        return { outer: { left: outer.left, right: outer.right }, sortBottom: sort.bottom, headingTop: heading.top,
          headingBottom: heading.bottom, searchTop: search.top };
      });
      assert(listGeometry.sortBottom + 20 <= listGeometry.headingTop, "sort and records need distinct spacing");
      assert(listGeometry.headingBottom + 8 <= listGeometry.searchTop, "heading and search need distinct spacing");
      if (width >= 768) {
        const layout = page.locator(".workflow-body .yg-sidebar-layout");
        const compact = (await layout.getAttribute("data-compact")) === "true";
        const panelLocator = layout.locator(":scope > .yg-sidebar-panel");
        assert.equal(await panelLocator.count(), compact ? 0 : 1, "sidebar panel follows its container's compact state");
        const panel = compact ? null : await panelLocator.boundingBox();
        const box = await detail.boundingBox();
        assert(box);
        if (panel) {
          const inset = await page.locator(".workflow-body .yg-sidebar-main").evaluate(node => parseFloat(getComputedStyle(node).paddingInlineStart));
          assert(inset >= 24, "the expanded sidebar needs a valid content inset");
          assert(listGeometry.outer.left - (panel.x + panel.width) >= 24, "content must clear the sidebar");
        }
        assert(box.x - listGeometry.outer.right >= 20, "record details need space from the list");
        assert(await detail.locator(".yg-facts").evaluate(node => node.getBoundingClientRect().width <= 544 + 1));
      } else {
        assert.equal(await detail.isVisible(), false);
      }
      await list.getByRole("button", { name: /Project intake/ }).click();
      await detail.getByText("Project intake", { exact: true }).waitFor();
      if (width === 320) {
        assert.equal(await list.isVisible(), false);
        await detail.getByRole("button", { name: "Back to records" }).click();
        await list.waitFor();
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("Records layout, spacing and navigation checked at 320, 768 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
