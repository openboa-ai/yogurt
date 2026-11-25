const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { MentionPicker } from './packages/web/src/patterns/motion-inputs.tsx';
    function Fixture() {
      const [value, setValue] = useState('');
      window.mode = 'defer';
      window.accept = () => setValue(window.pendingValue);
      window.replace = next => setValue(next);
      return <>
        <MentionPicker label="Message" people={[{id:'kai',label:'Kai'}]} value={value}
          onChange={next => {
            if (next.includes('@Kai') && window.mode === 'defer') window.pendingValue = next;
            else setValue(next);
          }} />
        <button type="button" data-testid="outside">Other action</button>
      </>;
    }
    createRoot(document.getElementById('mention-caret-fixture'), { identifierPrefix: 'mc-' }).render(<Fixture />);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) for (const scenario of ["immediate", "delayed", "blur", "moved", "conflict"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement("div");
        host.id = "mention-caret-fixture";
        host.className = "yg-root";
        Object.assign(host.style, { position: "fixed", top: "20px", left: "20px", width: "min(300px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      const host = page.locator("#mention-caret-fixture");
      const input = host.getByRole("textbox", { name: "Message" });
      await input.fill("Ask @ka tail");
      await input.press("End");
      for (let n = 0; n < 5; n++) await input.press("ArrowLeft");
      await host.getByRole("option", { name: "Kai" }).waitFor();
      if (scenario === "immediate") await page.evaluate(() => { window.mode = "immediate"; });
      await input.press("Enter");
      if (scenario === "immediate") {
        await page.waitForFunction(() => document.querySelector('#mention-caret-fixture textarea').value === 'Ask @Kai tail');
        assert.equal(await input.evaluate(node => node.selectionStart), 8, "synchronous commit restores the caret before the suffix");
        await page.close();
        continue;
      }
      assert.equal(await page.evaluate(() => window.pendingValue), "Ask @Kai tail");
      if (scenario === "blur") await host.getByTestId("outside").click();
      if (scenario === "moved") await input.press("ArrowLeft");
      if (scenario === "conflict") {
        await page.evaluate(() => window.replace("Other draft"));
        await page.waitForFunction(() => document.querySelector('#mention-caret-fixture textarea').value === 'Other draft');
      }
      await input.evaluate(node => {
        const original = node.setSelectionRange.bind(node);
        window.selectionCalls = 0;
        node.setSelectionRange = (...args) => { window.selectionCalls++; return original(...args); };
      });
      await page.evaluate(() => window.accept());
      await page.waitForFunction(() => document.querySelector('#mention-caret-fixture textarea').value === 'Ask @Kai tail');
      if (scenario === "delayed") {
        assert.equal(await input.evaluate(node => node.selectionStart), 8, "accepted deferred commit restores the caret");
        assert.equal(await page.evaluate(() => window.selectionCalls), 1);
      } else {
        assert.equal(await page.evaluate(() => window.selectionCalls), 0, `${scenario} must discard the stale caret request`);
        if (scenario === "blur") assert.equal(await host.getByTestId("outside").evaluate(node => node === document.activeElement), true, "a deferred value must not steal focus");
      }
      await page.close();
    }
    console.log("Mention caret commits, deferred blur, selection and conflicting updates verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
