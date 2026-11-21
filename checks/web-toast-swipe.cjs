const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

const bundle = buildSync({ stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
  import React, { useState } from 'react';
  import { createRoot } from 'react-dom/client';
  import { ToastStack } from './packages/web/src/patterns/editorial.tsx';
  const initial = [{id:'a',message:'First notice'}, {id:'b',message:'Second notice'}];
  window.requests = [];
  function Fixture() {
    const [items, setItems] = useState(initial);
    const [removes, setRemoves] = useState(false);
    window.setItems = setItems; window.setRemoves = setRemoves;
    return <ToastStack label="Swipe notices" items={items} presentation="stacked" swipe
      onDismiss={id => { window.requests.push(id); if (removes) setItems(previous => previous.filter(item => item.id !== id)); }} />;
  }
  createRoot(document.getElementById('swipe-fixture')).render(<Fixture />);
` }, bundle: true, write: false, platform: "browser", format: "iife",
loader: { ".css": "empty", ".module.css": "empty" } }).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement('div'); host.id = 'swipe-fixture'; host.className = 'yg-root';
        Object.assign(host.style, { position:'fixed', top:'20px', left:'20px', width:'min(280px, calc(100vw - 40px))', zIndex:'9999' });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      const stack = page.getByRole('region', { name:'Swipe notices' });
      const item = stack.locator('[data-yg-toast-id="a"]');
      const card = item.locator('.yg-toast-swipe');
      await card.waitFor();
      async function drag(dx, dy = 0, cancel = false) {
        const bounds = await card.boundingBox();
        const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
        await page.mouse.move(x, y); await page.mouse.down();
        await page.mouse.move(x + dx, y + dy, {steps:5});
        if (cancel) await card.dispatchEvent('pointercancel', {pointerId:1, pointerType:'mouse', isPrimary:true, bubbles:true});
        else if (Math.abs(dx) < 100) await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForFunction(() => {
          const node = document.querySelector('[aria-label="Swipe notices"] [data-yg-toast-id="a"] .yg-toast-swipe');
          return !node || Math.abs(parseFloat(getComputedStyle(node).translate) || 0) < .1;
        });
      }
      await drag(35);
      assert.deepEqual(await page.evaluate(() => window.requests), [], 'partial drag must return without a request');
      if (reducedMotion === 'no-preference') {
        // Interrupt a returning card, then release without horizontal intent.
        // Both a tap and a vertical scroll must allow the return to finish.
        for (const vertical of [false, true]) {
          const bounds = await card.boundingBox();
          const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
          await page.mouse.move(x, y); await page.mouse.down();
          await page.mouse.move(x + 65, y, {steps:4});
          await page.waitForTimeout(100); await page.mouse.up();
          await page.waitForFunction(() => Math.abs(parseFloat(getComputedStyle(document.querySelector('[aria-label="Swipe notices"] [data-yg-toast-id="a"] .yg-toast-swipe')).translate) || 0) > 2);
          const moved = await card.boundingBox();
          const nextX = moved.x + moved.width / 2, nextY = moved.y + moved.height / 2;
          await page.mouse.move(nextX, nextY); await page.mouse.down();
          if (vertical) await page.mouse.move(nextX, nextY + 20, {steps:3});
          await page.mouse.up();
          await page.waitForFunction(() => Math.abs(parseFloat(getComputedStyle(document.querySelector('[aria-label="Swipe notices"] [data-yg-toast-id="a"] .yg-toast-swipe')).translate) || 0) < .1);
          assert.deepEqual(await page.evaluate(() => window.requests), [], 'interrupted return must not request dismissal');
        }
      }
      await drag(12, 90);
      assert.deepEqual(await page.evaluate(() => window.requests), [], 'vertical movement must not request dismissal');
      await drag(130, 0, true);
      assert.deepEqual(await page.evaluate(() => window.requests), [], 'cancellation must not request dismissal');
      await drag(130);
      assert.deepEqual(await page.evaluate(() => window.requests), ['a']);
      assert.equal(await item.count(), 1, 'a refused request retains the host item');
      await drag(-130);
      assert.deepEqual(await page.evaluate(() => window.requests), ['a','a'], 'a later swipe may request again');
      await item.getByRole('button', {name:'Dismiss notification'}).click();
      assert.deepEqual(await page.evaluate(() => window.requests), ['a','a','a'], 'the dismiss action makes one request');
      await page.evaluate(() => window.setRemoves(true));
      const bounds = await card.boundingBox();
      const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x + 130, y, {steps:5}); await page.mouse.up();
      if (reducedMotion === 'no-preference') {
        const exitOffset = await page.waitForFunction(() => {
          const node = document.querySelector('[aria-label="Swipe notices"] [data-yg-toast-id="a"][data-exiting] .yg-toast-swipe');
          return node && (Math.abs(parseFloat(getComputedStyle(node).translate) || 0) || -1);
        });
        assert((await exitOffset.jsonValue()) > 10, 'host-confirmed exit retains its dragged position');
      }
      await item.waitFor({state:'detached'});
      assert.deepEqual(await page.evaluate(() => window.requests), ['a','a','a','a']);
      await page.close();
    }
    console.log('Toast swipe direction, cancellation, host ownership, keyboard alternative and reduced motion verified.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
