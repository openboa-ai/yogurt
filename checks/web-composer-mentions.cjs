const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { Composer } from './packages/web/src/patterns/composer.tsx';
    window.mentionSends = 0;
    window.deferMention = false;
    function Fixture() {
      const [value, setValue] = useState('');
      const [plain, setPlain] = useState('');
      const [people, setPeople] = useState([{id:'kai',label:'Kai'},{id:'sol',label:'Sol'}]);
      const [enabled, setEnabled] = useState(true);
      window.acceptMention = () => setValue(window.pendingMention);
      window.removePeople = () => setPeople([]);
      window.setMentionEnabled = setEnabled;
      return <>
        <Composer label="Mention message" value={value} mentionPeople={enabled ? people : undefined}
          onValueChange={next => { if (window.deferMention && next.includes('@Kai')) window.pendingMention = next; else setValue(next); }}
          onSend={() => window.mentionSends++} />
        <Composer label="Plain message" value={plain} onValueChange={setPlain} onSend={() => window.mentionSends++} />
        <button type="button" data-testid="outside">Other action</button>
      </>;
    }
    createRoot(document.getElementById('composer-mention-fixture')).render(<Fixture />);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement("div"); host.id = "composer-mention-fixture"; host.className = "yg-root";
        Object.assign(host.style, { position: "fixed", top: "20px", left: "20px", width: "min(300px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      const host = page.locator("#composer-mention-fixture");
      const input = host.getByRole("textbox", { name: "Mention message" });
      const plain = host.getByRole("textbox", { name: "Plain message" });
      await input.fill("Ask @ka tail");
      await input.press("End");
      for (let n = 0; n < 5; n++) await input.press("ArrowLeft");
      const option = host.getByRole("option", { name: "Kai" });
      await option.waitFor();
      assert.equal(await input.getAttribute("aria-expanded"), null, "textarea keeps supported textbox semantics");
      assert.equal(await input.getAttribute("aria-autocomplete"), "list");
      assert.equal(await host.getByRole("status").textContent(), "1 suggestion available");
      assert.equal(await input.getAttribute("aria-activedescendant"), await option.getAttribute("id"));
      const button = await input.boundingBox(), popup = await option.boundingBox();
      assert(button && popup && popup.x >= 0 && popup.x + popup.width <= width, "mention list must fit the viewport");
      await input.press("Enter");
      assert.equal(await input.inputValue(), "Ask @Kai tail");
      assert.equal(await input.evaluate(node => node.selectionStart), 8);
      assert.equal(await page.evaluate(() => window.mentionSends), 0);

      await input.fill("Ask @ka");
      await option.waitFor();
      await page.evaluate(() => window.setMentionEnabled(false));
      await page.waitForFunction(() => !document.querySelector('#composer-mention-fixture textarea[aria-label="Mention message"]').hasAttribute('aria-autocomplete'));
      assert.equal(await input.evaluate(node => node === document.activeElement), true, "disabling mentions preserves focus");
      await page.evaluate(() => window.setMentionEnabled(true));
      await option.waitFor();
      assert.equal(await input.evaluate(node => node === document.activeElement), true, "enabling mentions preserves focus");
      assert.equal(await input.getAttribute("aria-activedescendant"), await option.getAttribute("id"));

      await input.fill("Ask @ka tail");
      await input.press("End");
      for (let n = 0; n < 5; n++) await input.press("ArrowLeft");
      await option.waitFor();
      await input.press("Shift+ArrowLeft");
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture .yg-mention-layer')?.getAttribute('data-open') === 'false');
      assert.equal(await host.getByRole("option", { name: "Kai" }).count(), 0, "selection ranges suppress mentions");
      await input.press("ArrowRight");
      await option.waitFor();
      await input.press("Escape");
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture .yg-mention-layer')?.getAttribute('data-open') === 'false');
      assert.equal(await host.getByRole("option", { name: "Kai" }).count(), 0);
      assert.equal(await input.inputValue(), "Ask @ka tail");
      await input.press("ArrowLeft"); await input.press("ArrowRight");
      // A later edit begins a new interaction after Escape.
      await input.press("Backspace"); await input.press("a");
      await option.waitFor();
      await input.evaluate(node => {
        node.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
        node.form.requestSubmit();
      });
      assert.equal(await page.evaluate(() => window.mentionSends), 0, "same-tick form submission must not send during composition");
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture .yg-mention-layer')?.getAttribute('data-open') === 'false');
      const mentionSend = input.locator('xpath=ancestor::form').getByRole('button', { name: 'Send', exact: true });
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture form[aria-label="Mention message composer"] button[type="submit"]')?.disabled);
      assert.equal(await mentionSend.isDisabled(), true);
      await input.evaluate(node => node.form.requestSubmit());
      assert.equal(await page.evaluate(() => window.mentionSends), 0, "form submission must remain blocked during composition");
      const imePrevented = await input.evaluate(node => !node.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, isComposing: true })));
      assert.equal(imePrevented, false, "IME Enter must remain with the input method");
      await input.evaluate(node => node.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "" })));
      await option.waitFor();
      await page.evaluate(() => { window.deferMention = true; });
      await input.press("Enter");
      assert.equal(await page.evaluate(() => window.pendingMention), "Ask @Kai tail");
      await host.getByTestId("outside").click();
      await page.evaluate(() => window.acceptMention());
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture textarea[aria-label="Mention message"]').value === 'Ask @Kai tail');
      assert.equal(await host.getByTestId("outside").evaluate(node => node === document.activeElement), true, "late value does not steal focus");
      await page.evaluate(() => { window.deferMention = false; });
      await input.fill("Ask @ka tail");
      await input.press("End"); for (let n = 0; n < 5; n++) await input.press("ArrowLeft");
      await option.waitFor();
      await page.evaluate(() => window.removePeople());
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture .yg-mention-layer')?.getAttribute('data-open') === 'false');
      assert.equal(await host.getByRole("option", { name: "Kai" }).count(), 0);

      await plain.fill("First"); await plain.press("Enter"); await plain.pressSequentially("Second");
      assert.equal(await plain.inputValue(), "First\nSecond", "plain Composer retains newline behavior");
      assert.equal(await plain.getAttribute("aria-autocomplete"), null);
      assert.equal(await page.evaluate(() => window.mentionSends), 0);
      await plain.evaluate(node => {
        node.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
        node.form.requestSubmit();
      });
      assert.equal(await page.evaluate(() => window.mentionSends), 0, "plain Composer must block same-tick composition submission");
      const plainSend = plain.locator('xpath=ancestor::form').getByRole('button', { name: 'Send', exact: true });
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture form[aria-label="Plain message composer"] button[type="submit"]')?.disabled);
      assert.equal(await plainSend.isDisabled(), true);
      await plain.evaluate(node => node.form.requestSubmit());
      assert.equal(await page.evaluate(() => window.mentionSends), 0);
      await plain.evaluate(node => node.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "" })));
      await page.waitForFunction(() => document.querySelector('#composer-mention-fixture form[aria-label="Plain message composer"] button[type="submit"]')?.disabled === false);
      await plainSend.click();
      assert.equal(await page.evaluate(() => window.mentionSends), 1, "send recovers after composition ends");
      await page.close();
    }
    console.log("Composer mention selection, range gating, cancellation and existing newline behavior verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
