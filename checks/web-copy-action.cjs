const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { CopyButton } from './packages/web/src/patterns/motion-status.tsx';
    let requests = [];
    window.copyRequests = requests;
    const handlers = [0, 1].map(index => value => new Promise((resolve, reject) => {
      requests.push({index, value, resolve, reject});
    }));
    function App() {
      const [value, setValue] = useState('first');
      const [which, setWhich] = useState(0);
      const [mounted, setMounted] = useState(true);
      const [errorLabel, setErrorLabel] = useState('Copy failed');
      window.setCopyValue = setValue;
      window.setCopyHandler = setWhich;
      window.setCopyErrorLabel = setErrorLabel;
      window.unmountCopy = () => setMounted(false);
      return <form onSubmit={event => {event.preventDefault(); window.submissions++;}}>
        {mounted && <CopyButton value={value} onCopy={text => handlers[which](text)} presentation="quiet" errorLabel={errorLabel}/>}
        <div data-testid="unavailable"><CopyButton value="not exposed" /></div>
        <button type="button" data-testid="outside">Outside</button>
      </form>;
    }
    window.submissions = 0;
    const node = document.createElement('div');
    node.id = 'copy-action-fixture'; node.className = 'yg-root';
    document.body.append(node);
    createRoot(node).render(<App />);
  ` }, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      if (width === 320) await page.evaluate(() => { window.ResizeObserver = undefined; });
      await page.addScriptTag({ content: fixture });
      const host = page.locator("#copy-action-fixture");
      const action = host.locator(".yg-copy-action[data-presentation='quiet']");
      const copy = action.getByRole("button", { name: "Copy", exact: true });
      const unavailable = host.getByTestId("unavailable");
      await unavailable.getByRole("button", { name: "Copy", exact: true }).click();
      await unavailable.getByRole("button", { name: "Try again" }).waitFor();
      assert.match(await unavailable.getByRole("status").textContent(), /Copy failed/);
      await copy.focus();
      await copy.press("Enter");
      assert.equal(await page.evaluate(() => window.copyRequests.length), 1);
      assert.equal(await copy.getAttribute("aria-disabled"), "true");
      assert.equal(await copy.evaluate(node => node === document.activeElement), true, "pending retains focus");
      await copy.press("Enter");
      assert.equal(await page.evaluate(() => window.copyRequests.length), 1, "pending cannot repeat");
      assert.equal(await page.evaluate(() => window.submissions), 0, "copy never submits a form");

      await page.evaluate(() => window.setCopyValue('second'));
      assert.equal(await copy.getAttribute("aria-disabled"), "true", "value change keeps the uncancellable write pending");
      await copy.press("Enter");
      assert.equal(await page.evaluate(() => window.copyRequests.length), 1, "new writes wait for the old write to settle");
      await page.evaluate(() => window.copyRequests[0].resolve());
      await page.waitForFunction(() => !document.querySelector('#copy-action-fixture .yg-copy-button').hasAttribute('aria-disabled'));
      assert.equal(await action.getByRole("status").textContent(), "", "old result is not reported for a new value");
      await copy.click();
      assert.deepEqual(await page.evaluate(() => window.copyRequests.map(({index, value}) => ({index, value}))),
        [{index: 0, value: 'first'}, {index: 0, value: 'second'}]);
      assert.equal(await copy.getAttribute("aria-disabled"), "true", "new request is pending");
      await page.evaluate(() => window.copyRequests[1].reject(new Error('denied')));
      const retry = action.getByRole("button", { name: "Copy failed" });
      await retry.waitFor();
      assert.match(await action.getByRole("status").textContent(), /Copy failed/);
      if (width === 320) {
        await page.evaluate(() => window.setCopyErrorLabel('Copy failed, please retry'));
        const longRetry = action.getByRole("button", { name: "Copy failed, please retry" });
        await longRetry.waitFor();
        await page.waitForFunction(() => {
          const roll = document.querySelector('#copy-action-fixture .yg-copy-action[data-presentation="quiet"] .yg-copy-roll');
          const text = roll?.firstElementChild?.firstElementChild;
          return !!roll && !!text && roll.getBoundingClientRect().width >= text.getBoundingClientRect().width - 1;
        });
        await page.evaluate(() => window.setCopyErrorLabel('Copy failed'));
        await retry.waitFor();
      }
      await retry.click();
      await page.evaluate(() => window.setCopyHandler(1));
      assert.equal(await copy.getAttribute("aria-disabled"), "true", "handler rerender preserves the pending request");
      await copy.press("Enter");
      assert.equal(await page.evaluate(() => window.copyRequests.length), 3, "handler rerender cannot trigger a duplicate request");
      await page.evaluate(() => window.copyRequests[2].reject(new Error('late failure')));
      await retry.waitFor();
      assert.match(await action.getByRole("status").textContent(), /Copy failed/, "in-flight result is reported despite the handler rerender");
      await retry.click();
      assert.deepEqual(await page.evaluate(() => {const {index, value} = window.copyRequests[3]; return {index, value};}), {index: 1, value: 'second'});
      await page.evaluate(() => window.copyRequests[3].resolve());
      await action.getByRole("button", { name: "Copied" }).waitFor();
      assert.match(await action.getByRole("status").textContent(), /Copied/);
      if (width === 320) {
        await page.evaluate(() => window.dispatchEvent(new Event("resize")));
        assert((await action.locator(".yg-copy-roll").boundingBox()).width > 0, "fallback remeasures readable label without ResizeObserver");
        assert.deepEqual(errors, [], "missing ResizeObserver must not break the action");
      }
      const geometry = await action.boundingBox();
      assert(geometry.width <= width && geometry.height > 0, "action fits its host");
      await action.getByRole("button", { name: "Copied" }).click();
      await page.evaluate(() => { window.unmountCopy(); window.copyRequests[4].resolve(); });
      await page.waitForFunction(() => !document.querySelector('#copy-action-fixture .yg-copy-action[data-presentation="quiet"]'));
      await page.close();
    }
    console.log("Copy action request ownership, stale results, failure, focus and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
