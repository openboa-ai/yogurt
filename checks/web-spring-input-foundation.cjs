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
        {['compact','regular','comfortable','spacious','touch'].map(size =>
          <TextField key={'text-'+size} label={'Text '+size} size={size} defaultValue="Hello" motion="spring" />)}
        {['compact','regular','comfortable','spacious','touch','featured'].map(size =>
          <InputGroup key={'group-'+size} label={'Group '+size} size={size} defaultValue="Hello" motion="spring" />)}
        <button type="button" onClick={() => setValue("Updated")}>Update controlled</button>
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
      assert.equal(await controlled.locator('xpath=..').locator('.yg-spring-window').count(), 0);
      assert.equal(await host.getByRole("form").evaluate(form => new FormData(form).get("controlled")), "Hello");
      await controlled.press("Shift+ArrowLeft"); await controlled.press("Shift+ArrowLeft");
      assert.equal(await controlled.evaluate(el => el.selectionEnd - el.selectionStart), 2);
      assert(Number(await host.getByTestId("spring-selects").textContent()) > 0);
      await controlled.evaluate(el => el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' })));
      await controlled.fill("안녕");
      await controlled.evaluate(el => el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '안녕' })));
      assert.equal(await controlled.inputValue(), "안녕", "composed text remains editable and controlled");
      await host.getByRole('button', { name: 'Update controlled' }).click();
      assert.equal(await controlled.inputValue(), 'Updated', 'external controlled update is rendered');
      await uncontrolled.fill("Changed");
      await host.getByRole("form").evaluate(form => form.reset());
      await page.waitForFunction(() => document.querySelector('#spring-input-fixture [name="uncontrolled"]').value === 'Initial');
      assert.equal(await controlled.inputValue(), 'Updated', 'form reset does not override controlled state');
      assert.equal(await host.locator('input[name="secret"]').inputValue(), "secret");
      assert.equal(await host.locator('input[name="ordinary"]').inputValue(), "Normal");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await controlled.fill("Reduced");
      assert.equal(await controlled.inputValue(), "Reduced");
      assert.notEqual(await controlled.evaluate(el => getComputedStyle(el).color), "rgba(0, 0, 0, 0)");
      await page.emulateMedia({ forcedColors: "active" });
      await controlled.fill("Visible");
      assert.equal(await controlled.inputValue(), "Visible");
      assert.notEqual(await controlled.evaluate(el => getComputedStyle(el).color), "rgba(0, 0, 0, 0)");
      await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
      for (const label of ['Text compact','Text regular','Text comfortable','Text spacious','Text touch',
        'Group compact','Group regular','Group comfortable','Group spacious','Group touch','Group featured']) {
        const field = host.getByRole('textbox', { name: label, exact: true });
        await field.focus();
        assert.equal(await field.inputValue(), 'Hello', `${label} exposes its value`);
        assert.equal(await field.evaluate(el => document.activeElement === el), true, `${label} accepts focus`);
        const box = await field.boundingBox();
        assert(box && box.width > 0 && box.height > 0, `${label} has a visible input box`);
        assert.equal(await field.locator('xpath=..').locator('.yg-spring-window').count(), 0, `${label} uses the SDK input`);
      }
      await page.close();
    }
    console.log("SDK input controlled and uncontrolled values, selection, composition, reset and accessibility verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
