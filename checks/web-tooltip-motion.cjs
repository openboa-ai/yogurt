const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#tooltip");
      const root = page.locator('.specimen[data-component="tooltip"]');
      const trigger = root.getByRole("button", { name: "Add a view" });
      const tip = root.locator('[role="tooltip"]');
      await trigger.focus();
      assert.equal(await trigger.getAttribute("aria-describedby"), await tip.getAttribute("id"));
      await tip.waitFor({ state: "visible" });
      assert.equal(await tip.getAttribute("aria-hidden"), "false");
      await page.emulateMedia({ reducedMotion: "reduce" });
      const positions = await Promise.all([trigger.boundingBox(), tip.boundingBox()]);
      assert(positions[0] && positions[1]);
      assert(Math.abs(positions[0].x + positions[0].width / 2 - positions[1].x - positions[1].width / 2) < 1);
      assert(positions[1].y + positions[1].height < positions[0].y);
      assert.equal(await tip.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
      await trigger.press("Escape");
      assert.equal(await tip.getAttribute("aria-hidden"), "true");
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
      await trigger.blur();
      await trigger.hover();
      assert.equal(await tip.getAttribute("aria-hidden"), "false");
      await trigger.focus();
      await page.mouse.move(0, 0);
      assert.equal(await tip.getAttribute("aria-hidden"), "false");
      await trigger.blur();
      assert.equal(await tip.getAttribute("aria-hidden"), "true");
      await trigger.hover();
      await page.mouse.move(0, 0);
      await trigger.hover();
      assert.equal(await tip.getAttribute("aria-hidden"), "false");
      await page.mouse.move(width / 2, 850);
      await trigger.blur();
      const anchor = root.locator(".yg-tip-anchor");
      for (const edge of ["left", "right"]) {
        await anchor.evaluate((node, side) => {
          Object.assign(node.style, { position: "fixed", top: "2px", left: side === "left" ? "2px" : "auto", right: side === "right" ? "2px" : "auto", zIndex: "1000" });
        }, edge);
        await trigger.focus();
        await page.waitForFunction(() => {
          const node = document.querySelector('.specimen[data-component="tooltip"] .yg-tip');
          return node?.getAttribute("data-side") === "below";
        });
        const bounds = await tip.boundingBox();
        assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0,
          `Tooltip must remain on screen at the ${edge} edge`);
        await trigger.blur();
      }
      await page.close();
    }
    console.log("Tooltip position, focus, pointer, interruption, Escape and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
