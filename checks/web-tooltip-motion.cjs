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
      // Establish keyboard modality before focusing trigger (matching @ui-sdk/react/tooltip focusOpening)
      await page.keyboard.press("Tab");
      await trigger.focus();
      assert.equal(await trigger.getAttribute("aria-describedby"), await tip.getAttribute("id"));
      await tip.waitFor({ state: "visible" });
      assert(await tip.evaluate(node => node.hasAttribute("data-open")));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const positions = await Promise.all([trigger.boundingBox(), tip.boundingBox()]);
      assert(positions[0] && positions[1]);
      assert(Math.abs(positions[0].x + positions[0].width / 2 - positions[1].x - positions[1].width / 2) < 4);
      const side = await tip.getAttribute("data-side");
      assert(side === "top" ? positions[1].y + positions[1].height <= positions[0].y + 1 :
        side === "bottom" && positions[1].y >= positions[0].y + positions[0].height - 1,
        `Tooltip must open on its indicated side without overlapping its trigger: ${JSON.stringify({ side, positions })}`);
      assert.equal(await tip.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
      await trigger.press("Escape");
      await tip.waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
      await trigger.blur();
      await trigger.hover();
      await tip.waitFor({ state: "visible" });
      await page.keyboard.press("Tab");
      await trigger.focus();
      await page.mouse.move(0, 0);
      assert.equal(await tip.isVisible(), true);
      await trigger.blur();
      await tip.waitFor({ state: "hidden" });
      await trigger.hover();
      await tip.waitFor({ state: "visible" });
      await page.mouse.move(width / 2, 850);
      await tip.waitFor({ state: "hidden" });
      for (const edge of ["left", "right"]) {
        await trigger.evaluate((node, side) => {
          Object.assign(node.style, { position: "fixed", top: "2px", left: side === "left" ? "2px" : "auto", right: side === "right" ? "2px" : "auto", zIndex: "1000" });
        }, edge);
        await page.keyboard.press("Tab");
        await trigger.focus();
        await page.waitForFunction(() => {
          const node = document.querySelector('.specimen[data-component="tooltip"] .yg-tip');
          return node?.getAttribute("data-side") === "bottom";
        });
        const bounds = await tip.boundingBox();
        assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0,
          `Tooltip must remain on screen at the ${edge} edge`);
        await trigger.blur();
      }
      await trigger.evaluate(node => {
        node.removeAttribute("style");
        const parent = node.parentElement;
        const scroller = document.createElement("div");
        scroller.dataset.testTooltipScroller = "";
        Object.assign(scroller.style, {
          position: "fixed", left: `${Math.max(0, (innerWidth - 180) / 2)}px`, top: "150px",
          width: "180px", height: "120px", overflow: "auto", zIndex: "1000",
        });
        const content = document.createElement("div");
        Object.assign(content.style, { position: "relative", width: "420px", height: "200px" });
        Object.assign(node.style, { position: "absolute", left: "160px", top: "75px" });
        parent.appendChild(scroller);
        scroller.appendChild(content);
        content.appendChild(node);
        scroller.scrollLeft = 120;
      });
      await page.keyboard.press("Tab");
      await trigger.focus();
      await tip.waitFor({ state: "visible" });
      const bounds = await tip.boundingBox();
      assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0 && bounds.y + bounds.height <= 900,
        "Top-layer tooltip must stay visible within the viewport even inside a scroll container");
      await page.close();
    }
    console.log("Tooltip positioning, hover/focus parity, Escape dismissal and top-layer viewport bounds verified at 320 and 1440 px.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
