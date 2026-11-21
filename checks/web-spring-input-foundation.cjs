const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "spring-input-fixture.jsx", loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { InputGroup, TextField } from './packages/web/dist/index.js';
    function App() {
      const [value, setValue] = useState('');
      const [changes, setChanges] = useState(0);
      const [selects, setSelects] = useState(0);
      return <form aria-label="Spring fixture">
        <TextField label="Controlled spring" name="controlled" value={value} motion="spring"
          help="Helpful text" onChange={event => { setValue(event.currentTarget.value); setChanges(n => n + 1); }}
          onSelect={() => setSelects(n => n + 1)} />
        <InputGroup label="Uncontrolled spring" name="uncontrolled" defaultValue="Initial" motion="spring" />
        <TextField label="Secret" name="secret" type="password" motion="spring" defaultValue="secret" />
        <TextField label="Ordinary" name="ordinary" defaultValue="Normal" />
        <output data-testid="spring-changes">{changes}</output>
        <output data-testid="spring-selects">{selects}</output>
      </form>;
    }
    const node = document.createElement('div'); node.id = 'spring-input-fixture';
    document.querySelector('.specimen[data-component="input-group"]').appendChild(node);
    createRoot(node, {identifierPrefix:'spring-fixture-'}).render(<App />);
  ` }, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#input-group");
      await page.locator('.specimen[data-component="input-group"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const host = page.locator("#spring-input-fixture");
      const controlled = host.getByRole("textbox", { name: "Controlled spring", exact: true });
      const uncontrolled = host.getByRole("textbox", { name: "Uncontrolled spring", exact: true });
      await controlled.waitFor();
      assert.match(await controlled.getAttribute("aria-describedby"), /-help/);
      await controlled.focus(); await controlled.pressSequentially("Hello");
      assert.equal(await controlled.inputValue(), "Hello");
      assert.equal(await host.getByTestId("spring-changes").textContent(), "5");
      const edit = controlled.locator("xpath=..");
      await page.waitForFunction(() => Array.from(document.querySelectorAll('#spring-input-fixture [name="controlled"] + .yg-spring-window [data-glyph]')).map(el => el.textContent).join('') === 'Hello');
      assert.equal(await edit.getAttribute("data-mirror"), "true");
      assert.equal(await host.getByRole("form").evaluate(form => new FormData(form).get("controlled")), "Hello");
      await controlled.press("Shift+ArrowLeft"); await controlled.press("Shift+ArrowLeft");
      assert.equal(await controlled.evaluate(el => el.selectionEnd - el.selectionStart), 2);
      await page.waitForFunction(() => !document.querySelector('#spring-input-fixture [name="controlled"]').parentElement.hasAttribute('data-mirror'));
      assert(Number(await host.getByTestId("spring-selects").textContent()) > 0);
      await controlled.evaluate(el => { el.dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true})); });
      assert.equal(await edit.getAttribute("data-mirror"), null);
      await controlled.evaluate(el => { el.dispatchEvent(new CompositionEvent('compositionend', {bubbles:true})); });
      await uncontrolled.fill("Changed");
      await host.getByRole("form").evaluate(form => form.reset());
      await page.waitForFunction(() => document.querySelector('#spring-input-fixture [name="uncontrolled"]').value === 'Initial');
      await page.waitForFunction(() => Array.from(document.querySelectorAll('#spring-input-fixture [name="uncontrolled"] + .yg-spring-window [data-glyph]')).map(el => el.textContent).join('') === 'Initial');
      const secret = host.locator('input[name="secret"]');
      assert.equal(await secret.inputValue(), "secret");
      assert.equal(await secret.locator("xpath=..").locator(".yg-spring-window").count(), 0);
      assert.equal(await host.locator('input[name="ordinary"]').locator("xpath=..").locator(".yg-spring-window").count(), 0);
      await controlled.fill("안녕"); await controlled.focus();
      assert.equal(await edit.getAttribute("data-mirror"), null, "complex text remains native");
      await controlled.fill("Hello"); await controlled.focus();
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await edit.locator(".yg-spring-window").evaluate(el => getComputedStyle(el).display), "none");
      assert.notEqual(await controlled.evaluate(el => getComputedStyle(el).color), "rgba(0, 0, 0, 0)");
      await page.emulateMedia({ forcedColors: "active" });
      assert.equal(await edit.locator(".yg-spring-window").evaluate(el => getComputedStyle(el).display), "none");
      await page.close();
    }
    console.log("Spring input native contract, selection, composition, reset and fallback verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
