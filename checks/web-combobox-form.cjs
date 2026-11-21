const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "combobox-form-fixture.jsx", loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { Combobox } from './packages/web/dist/entries/combobox.js';
    const options = [
      { id: 'alpha', label: 'First choice' },
      { id: 'beta', label: 'Second choice' },
      { id: 'locked', label: 'Unavailable choice', disabled: true },
    ];
    function App() {
      const [value, setValue] = useState('alpha');
      const [changes, setChanges] = useState(0);
      const [disabled, setDisabled] = useState(false);
      return <form aria-label="Combobox fixture" onReset={() => setValue('alpha')}>
        <Combobox label="Choose a value" name="choice" options={options} value={value}
          disabled={disabled} onValueChange={next => { setValue(next); setChanges(count => count + 1); }} />
        <Combobox label="Unnamed" options={options} value="beta" onValueChange={() => {}} />
        <button type="button" onClick={() => setValue('beta')}>Change externally</button>
        <button type="button" onClick={() => setDisabled(current => !current)}>Toggle disabled</button>
        <button type="reset">Reset</button>
        <output data-testid="changes">{changes}</output>
      </form>;
    }
    const node = document.createElement('div'); node.id = 'combobox-form-fixture';
    document.querySelector('.specimen[data-component="combobox"]').appendChild(node);
    createRoot(node).render(<App />);
  ` }, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#combobox");
      await page.locator('.specimen[data-component="combobox"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const form = page.getByRole("form", { name: "Combobox fixture" });
      const box = form.getByRole("combobox", { name: "Choose a value" });
      const values = () => form.evaluate(node => [...new FormData(node).entries()]);
      await box.waitFor();
      assert.deepEqual(await values(), [["choice", "alpha"]]);
      await box.fill("Second");
      assert.deepEqual(await values(), [["choice", "alpha"]], "uncommitted query is not submitted");
      await box.press("ArrowDown");
      await box.press("Enter");
      assert.equal(await box.inputValue(), "Second choice");
      assert.equal(await form.getByTestId("changes").textContent(), "1");
      assert.deepEqual(await values(), [["choice", "beta"]]);
      await form.getByRole("button", { name: "Reset", exact: true }).click();
      assert.deepEqual(await values(), [["choice", "alpha"]], "host-controlled reset updates the submitted value");
      await form.getByRole("button", { name: "Change externally" }).click();
      assert.deepEqual(await values(), [["choice", "beta"]], "external controlled updates are submitted");
      await form.getByRole("button", { name: "Toggle disabled" }).click();
      assert.equal(await box.isDisabled(), true);
      assert.deepEqual(await values(), [], "disabled and unnamed controls are omitted");
      await form.getByRole("button", { name: "Toggle disabled" }).click();
      assert.deepEqual(await values(), [["choice", "beta"]]);
      await box.fill("Unavailable");
      await box.press("ArrowDown");
      await box.press("Enter");
      assert.deepEqual(await values(), [["choice", "beta"]], "disabled option cannot commit");
      assert.equal(await form.getByTestId("changes").textContent(), "1");
      await page.close();
    }
    console.log("Combobox committed ID, query, disabled, controlled updates and form reset verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
