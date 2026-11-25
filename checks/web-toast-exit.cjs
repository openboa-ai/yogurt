const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { ToastStack } from './packages/web/src/patterns/editorial.tsx';
    window.dismissed = [];
    window.fixtureRenders = 0;
    function Fixture() {
      const [items, setItems] = useState([{id:'a',message:'First'}, {id:'b',message:'Second'}]);
      window.setItems = setItems;
      window.fixtureRenders += 1;
      return <ToastStack items={items} onDismiss={id => window.dismissed.push(id)} />;
    }
    const root = createRoot(document.getElementById('toast-test-root'));
    window.unmount = () => root.unmount();
    root.render(<Fixture />);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", error => errors.push(String(error)));
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement("div");
        host.className = "yg-root";
        host.id = "toast-test-root";
        Object.assign(host.style, { position: "fixed", inset: "20px auto auto 20px", width: "min(280px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      const fixture = page.locator("#toast-test-root");
      const toast = id => fixture.locator(`[data-yg-toast-id="${id}"]`);
      const dismiss = id => toast(id).getByRole("button", { name: "Dismiss notification" });
      // Start with keyboard focus and keep it visible in both normal and forced colors.
      await dismiss("a").focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      for (const forcedColors of ["none", "active"]) {
        await page.emulateMedia({ forcedColors });
        const focus = await dismiss("a").evaluate(node => {
          const style = getComputedStyle(node);
          return { active: node === document.activeElement, visible: node.matches(":focus-visible"), outline: style.outlineStyle, width: parseFloat(style.outlineWidth), shadow: style.boxShadow };
        });
        assert.equal(focus.active, true, `dismiss focus must remain on the button (${forcedColors})`);
        assert.equal(focus.visible, true, `keyboard focus must remain visible (${forcedColors})`);
        if (forcedColors === "active") {
          assert.notEqual(focus.outline, "none", `forced-colors focus outline must be present (${forcedColors})`);
          assert(focus.width > 0, `forced-colors focus outline must have a visible width (${forcedColors})`);
        } else {
          assert(focus.shadow && focus.shadow !== "none", `unified focus boxShadow must be present (${forcedColors})`);
        }
      }
      await page.emulateMedia({ forcedColors: "none" });
      await dismiss("a").click();
      assert.deepEqual(await page.evaluate(() => window.dismissed), ["a"]);
      assert.equal(await toast("a").getAttribute("data-exiting"), null);
      // The host may retain an item after a dismiss request. Re-rendering the
      // unchanged list must neither remove it nor issue another request.
      const renders = await page.evaluate(() => window.fixtureRenders);
      await page.evaluate(() => window.setItems([{id:"a", message:"First"}, {id:"b", message:"Second"}]));
      await page.waitForFunction(previous => window.fixtureRenders > previous, renders);
      assert.deepEqual(await page.evaluate(() => window.dismissed), ["a"]);
      assert.equal(await toast("a").count(), 1);
      assert.equal(await toast("a").getAttribute("data-exiting"), null);
      assert.equal(await fixture.getByRole("status").count(), 2);
      await page.evaluate(() => window.setItems([{id:"b", message:"Second"}]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="a"]')?.hasAttribute('data-exiting'));
      assert.equal(await toast("a").getAttribute("aria-hidden"), "true");
      assert.equal(await toast("a").evaluate(node => node.inert), true);
      assert.equal(await dismiss("b").evaluate(node => node === document.activeElement), true);
      await page.evaluate(() => window.setItems([{id:"a",message:"Updated"},{id:"b",message:"Second"}]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="a"]')?.textContent.includes('Updated'));
      await page.waitForTimeout(600);
      assert.equal(await toast("a").count(), 1);
      assert.equal(await toast("a").getAttribute("data-exiting"), null);
      assert.equal(await fixture.getByRole("status").count(), 2);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await dismiss("a").focus();
      await page.evaluate(() => window.setItems([]));
      await page.waitForFunction(() => !document.querySelector('#toast-test-root [data-yg-toast-id]'));
      assert.equal(await fixture.getByRole("region", { name: "Notifications" }).evaluate(node => node === document.activeElement), true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.evaluate(() => window.setItems([{id:"c",message:"Third"}]));
      await toast("c").waitFor();
      await page.evaluate(() => window.setItems([]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="c"]')?.hasAttribute('data-exiting'));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() => !document.querySelector('#toast-test-root [data-yg-toast-id]'));
      await page.emulateMedia({ reducedMotion: "no-preference" });

      // A previously exiting item can return in the same host update that
      // removes the focused item. Focus must not be left on the document body.
      await page.evaluate(() => window.setItems([{id:"a",message:"First"}, {id:"b",message:"Second"}]));
      await dismiss("a").waitFor();
      await dismiss("b").waitFor();
      await dismiss("a").focus();
      await page.evaluate(() => window.setItems([{id:"a",message:"First"}]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="b"]')?.hasAttribute('data-exiting'));
      assert.equal(await toast("b").evaluate(node => node.inert), true);
      await page.evaluate(() => window.setItems([{id:"b",message:"Second again"}]));
      await page.waitForFunction(() => {
        const host = document.querySelector('#toast-test-root');
        const returned = host.querySelector('[data-yg-toast-id="b"]');
        return returned && !returned.inert && !returned.hasAttribute('data-exiting') && returned.textContent.includes('Second again');
      });
      const safeFocus = await page.evaluate(() => {
        const host = document.querySelector('#toast-test-root');
        const returned = host.querySelector('[data-yg-toast-id="b"]');
        const focused = document.activeElement;
        return focused === host.querySelector('section[aria-label="Notifications"]') || returned.contains(focused);
      });
      assert.equal(safeFocus, true, "focus must transfer to the returned toast or its region");
      await page.evaluate(() => window.setItems([]));
      await page.waitForFunction(() => !document.querySelector('#toast-test-root [data-yg-toast-id]'));

      // The exit fallback cannot discard a toast while its token-driven CSS
      // animation is still running, even when the duration exceeds 500ms.
      await page.evaluate(() => {
        document.querySelector('#toast-test-root').style.setProperty('--yg-change', '1200ms');
        window.setItems([{id:'long', message:'Long exit'}]);
      });
      await toast("long").waitFor();
      await page.evaluate(() => window.setItems([]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="long"]')?.hasAttribute('data-exiting'));
      assert.equal(await toast("long").evaluate(node => getComputedStyle(node).animationDuration), "1.2s");
      await page.waitForTimeout(700);
      assert.equal(await toast("long").count(), 1, "exit must remain mounted while the token-driven animation is active");
      await page.waitForFunction(() => !document.querySelector('#toast-test-root [data-yg-toast-id="long"]'));
      await page.evaluate(() => document.querySelector('#toast-test-root').style.removeProperty('--yg-change'));

      await page.evaluate(() => window.setItems([{id:"d",message:"Fourth"}]));
      await toast("d").waitFor();
      await page.evaluate(() => window.setItems([]));
      await page.waitForFunction(() => document.querySelector('#toast-test-root [data-yg-toast-id="d"]')?.hasAttribute('data-exiting'));
      await page.evaluate(() => window.unmount());
      await page.waitForTimeout(600);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("Toast host ownership, re-addition, focus and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
