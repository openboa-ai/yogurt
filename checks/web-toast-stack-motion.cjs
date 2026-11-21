const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { ToastStack } from './packages/web/src/patterns/editorial.tsx';
    const initial = [
      {id:'a',message:'First notice'},
      {id:'b',message:'Second notice with a longer message that wraps inside a narrow space.'},
      {id:'c',message:'Third notice'}, {id:'d',message:'Fourth notice'},
    ];
    window.dismissed = [];
    function Fixture() {
      const [items, setItems] = useState(initial);
      const [presentation, setPresentation] = useState('stacked');
      window.setItems = setItems;
      window.setPresentation = setPresentation;
      return <>
        <button data-testid="outside">Outside</button>
        <ToastStack label="Compact notifications" items={items} presentation={presentation} onDismiss={id => window.dismissed.push(id)} />
        <ToastStack label="Default notifications" items={items} onDismiss={() => {}} />
      </>;
    }
    createRoot(document.getElementById('toast-stack-fixture')).render(<Fixture />);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement("div");
        host.id = "toast-stack-fixture";
        host.className = "yg-root";
        Object.assign(host.style, { position: "fixed", inset: "20px auto auto 20px", width: "min(280px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      const stacked = page.getByRole("region", { name: "Compact notifications" });
      const defaults = page.getByRole("region", { name: "Default notifications" });
      const toggle = stacked.getByRole("button", { name: "Show all 4" });
      await toggle.waitFor();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(await defaults.getByRole("status").count(), 4);
      assert.equal(await defaults.getByRole("button", { name: /Show all/ }).count(), 0);
      assert.equal(await stacked.getByRole("status").count(), 4, "compact notices remain announced");
      const first = stacked.locator('[data-yg-toast-id="a"]');
      const second = stacked.locator('[data-yg-toast-id="b"]');
      assert.equal(await second.locator("..").getAttribute("data-behind"), "true");
      await second.getByRole("button", { name: "Dismiss notification" }).focus();
      await page.waitForFunction(() => document.querySelector('[aria-label="Compact notifications"] button[aria-controls]')?.getAttribute("aria-expanded") === "true");
      assert.equal(await second.getByRole("button", { name: "Dismiss notification" }).evaluate(node => node === document.activeElement), true);
      assert.equal(await stacked.locator(".yg-toast-stack-slot[data-behind]").count(), 0);
      const boxes = await Promise.all([first.boundingBox(), second.boundingBox()]);
      assert(boxes[1].y >= boxes[0].y + boxes[0].height - 1, "expanded notices must not overlap");
      assert.equal(await stacked.locator(".yg-toast-stack-stage").evaluate(node => getComputedStyle(node).transitionDuration), "0s");
      await stacked.getByRole("button", { name: "Show fewer" }).click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      await first.getByRole("button", { name: "Dismiss notification" }).click();
      assert.deepEqual(await page.evaluate(() => window.dismissed), ["a"]);
      assert.equal(await first.count(), 1, "host still owns removal");
      await page.evaluate(() => window.setItems([{id:'b',message:'Second notice'}, {id:'c',message:'Third notice'}, {id:'d',message:'Fourth notice'}]));
      await page.waitForFunction(() => !document.querySelector('[aria-label="Compact notifications"] [data-yg-toast-id="a"]'));
      assert.equal(await stacked.getByRole("status").count(), 3);

      // Removing a focused expansion control must not send focus to the document body.
      await stacked.locator("button[aria-controls]").focus();
      await page.evaluate(() => window.setItems([{id:'b',message:'Second notice'}]));
      await page.waitForFunction(() => !document.querySelector('[aria-label="Compact notifications"] button[aria-controls]'));
      assert.equal(await stacked.evaluate(node => node.contains(document.activeElement)), true);
      assert.equal(await stacked.locator('[data-yg-toast-id="b"] button').evaluate(node => node === document.activeElement), true);

      await page.evaluate(() => window.setItems([{id:'b',message:'Second notice'}, {id:'c',message:'Third notice'}]));
      await stacked.locator("button[aria-controls]").focus();
      await page.evaluate(() => window.setPresentation('list'));
      await page.waitForFunction(() => !document.querySelector('[aria-label="Compact notifications"] button[aria-controls]'));
      assert.equal(await stacked.evaluate(node => node.contains(document.activeElement)), true);

      // An unrelated element focused by the host must never be overridden.
      await page.evaluate(() => window.setPresentation('stacked'));
      await stacked.locator("button[aria-controls]").waitFor();
      await page.getByTestId("outside").focus();
      await page.evaluate(() => window.setItems([{id:'b',message:'Second notice'}]));
      await page.waitForFunction(() => !document.querySelector('[aria-label="Compact notifications"] button[aria-controls]'));
      assert.equal(await page.getByTestId("outside").evaluate(node => node === document.activeElement), true);
      await page.close();
    }
    console.log("Stacked and default toast presentations, keyboard expansion and host ownership verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
