const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      for (const id of ["agent-avatar", "gaze"]) {
        await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#" + id);
        const specimen = page.locator(`.specimen[data-component="${id}"]`);
        const tools = specimen.locator(".agent-motion-tools");
        const select = tools.getByRole("combobox", { name: "Agent state" });
        const play = tools.getByRole("button", { name: "Play sequence", exact: true });
        await play.waitFor();
        const geometry = await tools.evaluate(root => {
          const box = element => { const r = element.getBoundingClientRect(); return {left:r.left, right:r.right, top:r.top, bottom:r.bottom}; };
          return { root:box(root), select:box(root.querySelector(".yg-select")), button:box(root.querySelector(".yg-button")), viewport:document.documentElement.scrollWidth };
        });
        for (const part of [geometry.select, geometry.button]) {
          assert(part.left >= geometry.root.left - 1 && part.right <= geometry.root.right + 1, `${id} control fits at ${width}px`);
        }
        assert(geometry.viewport <= width + 1, `${id} does not expand the page at ${width}px`);
        if (geometry.button.top < geometry.select.bottom && geometry.select.top < geometry.button.bottom) {
          assert(Math.abs(geometry.select.bottom - geometry.button.bottom) <= 1, `${id} controls align at ${width}px`);
          assert(geometry.button.left >= geometry.select.right + 7, `${id} controls have a gap at ${width}px`);
        } else {
          assert(geometry.button.top >= geometry.select.bottom + 7, `${id} wrapped controls do not overlap at ${width}px`);
        }
        await select.selectOption("working");
        assert.equal(await specimen.locator(".yg-agent-avatar .yg-eyes").first().getAttribute("data-gaze"), "working");
        await play.click();
        const stop = tools.getByRole("button", { name: "Stop sequence", exact: true });
        await stop.waitFor();
        await stop.click();
        assert.equal(await select.inputValue(), "ready");
      }
      for (const id of ["agent-sidebar", "project-sidebar"]) {
        await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#" + id);
        const specimen = page.locator(`.specimen[data-component="${id}"]`);
        await specimen.waitFor();
        assert.equal(await specimen.getAttribute("data-layout"), "wide");
        const widths = await specimen.evaluate(element => ({
          specimen: element.clientWidth,
          inner: element.querySelector(".specimen-inner").getBoundingClientRect().width,
          padding: parseFloat(getComputedStyle(element).paddingLeft) + parseFloat(getComputedStyle(element).paddingRight),
        }));
        assert(Math.abs(widths.inner - (widths.specimen - widths.padding)) <= 1, `${id} fills the preview at ${width}px`);
      }
      await page.close();
    }
    console.log("Agent avatar and gaze controls align and work at 320, 390, 768 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
