const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "field-aria-fixture.jsx", loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { TextField, Textarea, Select } from './packages/web/dist/index.js';
    const node = document.createElement('div'); node.id = 'field-aria-fixture';
    document.querySelector('.specimen[data-component="text-field"]').appendChild(node);
    const options = [{id:'first',label:'First'}];
    createRoot(node, {identifierPrefix:'field-aria-fixture-'}).render(<>
      <span id="shared-note">Shared note</span>
      <TextField label="Text external" aria-describedby="shared-note shared-note" aria-invalid="spelling" help="Text help" />
      <TextField label="Text spring" motion="spring" aria-describedby="shared-note" aria-invalid="grammar" help="Spring help" />
      <TextField label="Text error" aria-describedby="shared-note" aria-invalid={false} error="Text error" />
      <Textarea label="Area external" aria-describedby="shared-note" aria-invalid="spelling" help="Area help" />
      <Textarea label="Area completion" aria-describedby="shared-note" aria-invalid={false} error="Area error"
        defaultValue="Hello" suggestion="Hello there" />
      <Select label="Select external" aria-describedby="shared-note" aria-invalid="grammar" help="Select help" options={options} />
      <Select label="Select error" aria-describedby="shared-note" aria-invalid={false} error="Select error" options={options} />
    </>);
  ` }, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#text-field");
      await page.locator('.specimen[data-component="text-field"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const host = page.locator("#field-aria-fixture");
      for (const [role, name, expectedInvalid, suffixes] of [
        ["textbox", "Text external", "spelling", ["-help"]],
        ["textbox", "Text spring", "grammar", ["-help"]],
        ["textbox", "Text error", "true", ["-error"]],
        ["textbox", "Area external", "spelling", ["-help"]],
        ["textbox", "Area completion", "true", ["-error", "-suggestion"]],
        ["combobox", "Select external", "grammar", ["-help"]],
        ["combobox", "Select error", "true", ["-error"]],
      ]) {
        const input = host.getByRole(role, { name, exact: true });
        await input.waitFor();
        const ids = (await input.getAttribute("aria-describedby")).split(/\s+/);
        assert.equal(ids.filter(id => id === "shared-note").length, 1, `${name}: external description retained once`);
        for (const suffix of suffixes) assert(ids.some(id => id.endsWith(suffix)), `${name}: ${suffix} association missing`);
        for (const id of ids) assert.equal(await page.locator(`[id=${JSON.stringify(id)}]`).count(), 1, `${name}: description must resolve`);
        assert.equal(await input.getAttribute("aria-invalid"), expectedInvalid, `${name}: invalid state`);
      }
      await page.close();
    }
    console.log("Field description and invalid associations verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
