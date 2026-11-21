const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

const fixtureBundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { Accordion } from './packages/web/src/controls/advanced.tsx';
    import { createYogurtAgent } from './packages/web/src/agent.ts';
    window.disclosureAgent = createYogurtAgent({ allow: step => step.label === 'Focus accordion' && step.action === 'setValue' });
    createRoot(document.getElementById('disclosure-test-root')).render(
      <Accordion label="Focus accordion" items={[{ id: 'first', title: 'First section', content: <input aria-label="Inside section" /> }]} />
    );
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const gallery = pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href;
      await page.goto(gallery + "#accordion");
      const accordion = page.locator('.specimen[data-component="accordion"]');
      const button = accordion.getByRole("button", { name: "Who can open this view?" });
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      const panel = accordion.locator(".yg-accordion-content").first();
      await panel.waitFor({ state: "visible" });
      assert((await panel.boundingBox())?.height > 0, "opened content is visible");
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-expanded"), "false");
      await panel.waitFor({ state: "hidden" });
      if (await panel.count()) {
        assert.equal(await panel.evaluate(node => node.inert), true);
        assert.equal(await panel.getAttribute("aria-hidden"), "true");
      }
      assert.equal(await button.evaluate(node => node === document.activeElement), true);

      // Rapid changes must leave the final open state visible and interactive.
      await button.press("Enter");
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      await button.press("Enter");
      assert.equal(await button.getAttribute("aria-expanded"), "false");
      await button.press("Enter");
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      await panel.waitFor({ state: "visible" });
      await panel.evaluate(async node => { await Promise.allSettled(node.getAnimations().map(animation => animation.finished)); });
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      assert.equal(await panel.evaluate(node => node.inert), false);
      assert.notEqual(await panel.getAttribute("aria-hidden"), "true");
      assert((await panel.boundingBox())?.height > 0);

      // Exercise the public Accordion with its host-authorized agent bridge.
      // The agent closes it while focus is inside the panel, not on the trigger.
      await page.evaluate(() => {
        const host = document.createElement("div");
        host.id = "disclosure-test-root";
        host.className = "yg-root";
        Object.assign(host.style, { position: "fixed", top: "20px", left: "20px", width: "min(280px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: fixtureBundle });
      const fixture = page.locator("#disclosure-test-root");
      const fixtureButton = fixture.getByRole("button", { name: "First section" });
      await fixtureButton.waitFor();
      await page.waitForFunction(() => window.disclosureAgent?.snapshot().some(item => item.label === "Focus accordion"));
      const opened = await page.evaluate(() => window.disclosureAgent.act({ steps: [{ ref: "Focus accordion", action: "setValue", args: [["first"]] }] }));
      assert.equal(opened.ok, true);
      const input = fixture.getByRole("textbox", { name: "Inside section" });
      await input.focus();
      assert.equal(await input.evaluate(node => node === document.activeElement), true);
      const closed = await page.evaluate(() => window.disclosureAgent.act({ steps: [{ ref: "Focus accordion", action: "setValue", args: [[]] }] }));
      assert.equal(closed.ok, true);
      assert.equal(await fixtureButton.getAttribute("aria-expanded"), "false");
      assert.equal(await fixtureButton.evaluate(node => node === document.activeElement), true,
        "closing while focus is inside must restore focus to its trigger");

      await page.goto(gallery + "#disclosure-row");
      const disclosure = page.locator('.specimen[data-component="disclosure-row"] details');
      const summary = disclosure.locator("summary");
      await summary.focus();
      await page.keyboard.press("Enter");
      assert.equal(await disclosure.evaluate(node => node.open), true);
      assert.equal(await disclosure.locator(":scope > div").isVisible(), true);
      await page.keyboard.press("Enter");
      assert.equal(await disclosure.evaluate(node => node.open), false);
      await page.goto(gallery + "#skeleton");
      const skeleton = page.locator('.specimen[data-component="skeleton"] .yg-skeleton span').first();
      await skeleton.waitFor({ state: "visible" });
      assert.equal(await skeleton.evaluate(node => getComputedStyle(node).animationName), "yg-skeleton-breathe");
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await skeleton.evaluate(node => getComputedStyle(node).animationName), "none");
      await page.close();
    }
    console.log("Accordion, disclosure and skeleton motion verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
