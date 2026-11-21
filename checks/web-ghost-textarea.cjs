const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "completion-fixture.jsx", loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { Textarea } from './packages/web/dist/entries/textarea.js';
    function App() {
      const [text, setText] = useState('Hello');
      const [controlledChanges, setControlledChanges] = useState(0);
      const [uncontrolledChanges, setUncontrolledChanges] = useState(0);
      const [enabled, setEnabled] = useState(false);
      const [dynamicControlled, setDynamicControlled] = useState('');
      return <form aria-label="Completion form">
        <Textarea name="controlled" label="Controlled" help="Supporting text" error="Example error"
          value={text} suggestion="Hello there" onChange={e => { setText(e.target.value); setControlledChanges(n => n + 1); }} />
        <Textarea name="uncontrolled" label="Uncontrolled" defaultValue="Hello" suggestion="Hello there"
          onChange={() => setUncontrolledChanges(n => n + 1)} />
        <Textarea name="typed" label="Typed" suggestion="Hello there" />
        <Textarea label="Limited" defaultValue="Hello" suggestion="Hello there" maxLength={7} />
        <Textarea label="Readonly" value="Hello" suggestion="Hello there" readOnly />
        <Textarea label="Disabled" value="Hello" suggestion="Hello there" disabled />
        <Textarea label="Cancelled" defaultValue="Hello" suggestion="Hello there" onKeyDown={e => e.preventDefault()} />
        <Textarea name="dynamic-uncontrolled" label="Dynamic uncontrolled" defaultValue="Hello" suggestion={enabled ? 'Hello there' : undefined} />
        <Textarea name="dynamic-controlled" label="Dynamic controlled" value={dynamicControlled}
          suggestion={enabled ? 'Hello there' : undefined} onChange={e => setDynamicControlled(e.target.value)} />
        <button type="button" onClick={() => setEnabled(!enabled)}>Toggle completion</button>
        <output data-testid="controlled-changes">{controlledChanges}</output>
        <output data-testid="uncontrolled-changes">{uncontrolledChanges}</output>
      </form>;
    }
    const node = document.createElement('div'); node.id = 'completion-fixture';
    document.querySelector('.specimen[data-component="textarea"]').appendChild(node);
    createRoot(node, { identifierPrefix: 'completion-fixture-' }).render(<App />);
  `}, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#textarea");
      await page.locator('.specimen[data-component="textarea"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const host = page.locator("#completion-fixture");
      const controlled = host.getByRole("textbox", { name: "Controlled", exact: true });
      const uncontrolled = host.getByRole("textbox", { name: "Uncontrolled", exact: true });
      await controlled.waitFor();
      const description = await controlled.getAttribute("aria-describedby");
      assert.match(description, /-help/); assert.match(description, /-error/); assert.match(description, /-suggestion/);
      await controlled.focus(); await controlled.evaluate(el => { el.setSelectionRange(el.value.length, el.value.length); el.dispatchEvent(new Event("select", { bubbles: true })); });
      await controlled.press("Tab");
      assert.equal(await controlled.inputValue(), "Hello there");
      assert.equal(await controlled.evaluate(el => el === document.activeElement), true);
      assert.equal(await host.getByTestId("controlled-changes").textContent(), "1");
      assert.equal(await host.getByRole("form").evaluate(form => new FormData(form).get("controlled")), "Hello there");

      await uncontrolled.focus(); await uncontrolled.evaluate(el => { el.setSelectionRange(el.value.length, el.value.length); el.dispatchEvent(new Event("select", { bubbles: true })); }); await uncontrolled.press("ArrowRight");
      assert.equal(await uncontrolled.inputValue(), "Hello there");
      assert.equal(await host.getByTestId("uncontrolled-changes").textContent(), "1");
      assert.equal(await host.getByRole("form").evaluate(form => new FormData(form).get("uncontrolled")), "Hello there");

      const typed = host.getByRole("textbox", { name: "Typed", exact: true });
      await typed.focus(); await typed.pressSequentially("Hello"); await typed.press("Tab");
      assert.equal(await typed.inputValue(), "Hello there", "typing at the end must offer completion");

      for (const name of ["Limited", "Readonly", "Cancelled"]) {
        const field = host.getByRole("textbox", { name, exact: true });
        await field.focus(); await field.evaluate(el => { el.setSelectionRange(el.value.length, el.value.length); el.dispatchEvent(new Event("select", { bubbles: true })); }); await field.press("ArrowRight");
        assert.equal(await field.inputValue(), "Hello", `${name} must not accept`);
      }
      const disabled = host.getByRole("textbox", { name: "Disabled", exact: true });
      assert.equal(await disabled.isDisabled(), true);
      assert(!((await disabled.getAttribute("aria-describedby")) || "").includes("suggestion"));

      await controlled.fill("Hello");
      await controlled.evaluate(el => { el.focus(); el.setSelectionRange(1, 3); });
      await controlled.press("ArrowRight");
      assert.equal(await controlled.inputValue(), "Hello", "a selection must not accept");
      await controlled.evaluate(el => { el.setSelectionRange(el.value.length, el.value.length); });
      await controlled.evaluate(el => el.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, isComposing: true })));
      assert.equal(await controlled.inputValue(), "Hello", "composition must not accept");
      await page.emulateMedia({ reducedMotion: "reduce" });
      const suffix = host.locator(".yg-ghost-suffix .yg-ghost-word > span").first();
      if (await suffix.count()) assert.equal(await suffix.evaluate(el => getComputedStyle(el).animationName), "none");

      const dynamic = host.getByRole("textbox", { name: "Dynamic uncontrolled", exact: true });
      const dynamicControlled = host.getByRole("textbox", { name: "Dynamic controlled", exact: true });
      await dynamic.fill("Hell"); await dynamicControlled.fill("Hello");
      await host.getByRole("button", { name: "Toggle completion" }).click();
      for (const [field, expected] of [[dynamic, "Hell"], [dynamicControlled, "Hello"]]) {
        assert.equal(await field.inputValue(), expected);
        const container = field.locator("xpath=..");
        assert.equal(await container.locator(".yg-ghost-mirror > span:first-child").textContent(), expected);
        assert.match(await field.getAttribute("aria-describedby"), /-suggestion/);
        await field.focus(); await field.evaluate(el => el.setSelectionRange(el.value.length, el.value.length)); await field.press("Tab");
        assert.equal(await field.inputValue(), "Hello there");
      }
      await host.getByRole("form").evaluate(form => form.reset());
      await page.waitForFunction(() => document.querySelector('#completion-fixture [name="dynamic-uncontrolled"]').value === 'Hello');
      await page.waitForFunction(() => document.querySelector('#completion-fixture [name="dynamic-uncontrolled"]').parentElement.querySelector('.yg-ghost-mirror > span:first-child').textContent === 'Hello');
      await page.waitForFunction(() => document.querySelector('#completion-fixture [name="dynamic-uncontrolled"]').getAttribute('aria-describedby')?.includes('-suggestion'));
      assert.equal(await dynamicControlled.inputValue(), "Hello there", "native reset must not overwrite a controlled host value");
      assert.match(await dynamic.getAttribute("aria-describedby"), /-suggestion/);
      await dynamic.focus(); await dynamic.evaluate(el => el.setSelectionRange(el.value.length, el.value.length)); await dynamic.press("Tab");
      assert.equal(await dynamic.inputValue(), "Hello there", "completion must use the reset native value");
      await host.getByRole("button", { name: "Toggle completion" }).click();
      await dynamic.fill("Hell"); await dynamicControlled.fill("Hell");
      await host.getByRole("button", { name: "Toggle completion" }).click();
      for (const field of [dynamic, dynamicControlled]) {
        assert.equal(await field.locator("xpath=..").locator(".yg-ghost-mirror > span:first-child").textContent(), "Hell");
        assert.match(await field.getAttribute("aria-describedby"), /-suggestion/);
        await field.focus(); await field.evaluate(el => el.setSelectionRange(el.value.length, el.value.length)); await field.press("Tab");
        assert.equal(await field.inputValue(), "Hello there");
      }
      await page.close();
    }
    console.log("Textarea completion, controlled and native input contracts checked at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
