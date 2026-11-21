const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { SlideConfirm } from './packages/web/src/patterns/motion-confirm.tsx';
    window.confirmCount = 0;
    createRoot(document.getElementById('confirm-fixture')).render(
      <SlideConfirm label="Approve" onConfirm={() => { window.confirmCount++; }} />
    );
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) for (const direction of ["ltr", "rtl"]) for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate((dir) => {
        const host = document.createElement("div");
        host.id = "confirm-fixture";
        host.className = "yg-root";
        host.dir = dir;
        Object.assign(host.style, { position: "fixed", top: "20px", left: "20px", width: "min(280px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      }, direction);
      await page.addScriptTag({ content: bundle });
      const button = page.locator('#confirm-fixture .yg-slide-confirm');
      const handle = button.locator('.yg-slide-confirm-handle');
      await button.waitFor();
      const track = await button.boundingBox(), thumb = await handle.boundingBox();
      assert(track && thumb);
      const startX = thumb.x + thumb.width / 2, y = thumb.y + thumb.height / 2;
      const sign = direction === "rtl" ? -1 : 1;
      const travel = track.width - thumb.width - 8;

      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(startX + sign * travel * .25, y, { steps: 5 });
      await page.mouse.up();
      assert.equal(await page.evaluate(() => window.confirmCount), 0, "partial slide must not confirm");
      await handle.evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));

      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(startX + sign * travel * .6, y, { steps: 6 });
      const during = await handle.boundingBox();
      assert(during && sign * (during.x - thumb.x) > travel * .35, "handle must follow the reading direction");
      const fill = await button.locator('.yg-confirm-fill').evaluate(node => getComputedStyle(node).clipPath);
      // The computed inset may retain calc(percentage + pixels); keep that
      // expression intact while distinguishing the two physical sides.
      const dimension = '(?:calc\\([^)]*\\)|[\\d.]+(?:px|%))';
      const pattern = direction === "rtl"
        ? new RegExp(`^inset\\(0px 0px 0px (${dimension})\\)$`)
        : new RegExp(`^inset\\(0px (${dimension}) 0px 0px\\)$`);
      const clipped = fill.match(pattern)?.[1];
      assert(clipped && /[1-9]/.test(clipped), `fill must grow from the ${direction} start edge: ${fill}`);
      await page.mouse.move(startX + sign * travel, y, { steps: 8 });
      await page.mouse.up();
      assert.equal(await page.evaluate(() => window.confirmCount), 1, "full slide must confirm once");
      await page.close();
    }
    console.log("Slide confirmation LTR/RTL direction, cancellation and reduced motion verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
