const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

// Mount the public component with a controlled host so send and stop exercise
// the same callbacks a consuming product supplies.
const fixture = buildSync({
  stdin: {
    resolveDir: process.cwd(),
    sourcefile: "composer-fixture.jsx",
    contents: `
      import React, { useState } from 'react';
      import { createRoot } from 'react-dom/client';
      import { Composer } from './packages/web/dist/entries/composer.js';
      function App() {
        const [value, setValue] = useState('');
        const [attachments, setAttachments] = useState([]);
        const [pending, setPending] = useState(false);
        const [outcome, setOutcome] = useState('idle');
        const [sends, setSends] = useState(0);
        const [stops, setStops] = useState(0);
        return React.createElement(React.Fragment, null,
          React.createElement(Composer, {
            label: 'Fixture message', value, onValueChange: setValue, attachments, pending,
            onAddAttachment: () => setAttachments([{ id: 'draft', name: 'Draft notes.md', detail: 'Document', progress: 100 }]),
            onRemoveAttachment: id => setAttachments(items => items.filter(item => item.id !== id)),
            onSend: message => { setSends(count => count + 1); setOutcome(JSON.stringify(message)); setPending(true); },
            onStop: () => { setStops(count => count + 1); setOutcome('stopped'); setPending(false); }
          }),
          React.createElement('output', { 'data-testid': 'composer-outcome' }, outcome),
          React.createElement('output', { 'data-testid': 'composer-sends' }, sends),
          React.createElement('output', { 'data-testid': 'composer-stops' }, stops),
          React.createElement('button', { type: 'button', 'data-testid': 'outside-focus', onClick: () => setPending(true) }, 'Outside action')
        );
      }
      const container = document.createElement('div');
      container.id = 'composer-fixture';
      container.style.inlineSize = '100%';
      container.style.maxInlineSize = '480px';
      document.querySelector('.specimen[data-component="composer"]').append(container);
      createRoot(container, { identifierPrefix: 'cf-' }).render(React.createElement(App));
    `,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
}).outputFiles[0].text;

async function assertLayout(form, selectors) {
  const geometry = await form.evaluate((element, children) => {
    const container = element.getBoundingClientRect();
    const fits = children.map(selector => {
      const child = element.querySelector(selector);
      if (!child) return { selector, missing: true };
      const box = child.getBoundingClientRect();
      return { selector, left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height, scroll: child.scrollWidth, client: child.clientWidth };
    });
    return { container: { left: container.left, right: container.right, top: container.top, bottom: container.bottom }, fits };
  }, selectors);
  for (const child of geometry.fits) {
    assert(!child.missing, `${child.selector} must exist`);
    assert(child.width > 0 && child.height > 0, `${child.selector} must have visible size`);
    assert(child.left >= geometry.container.left - 1 && child.right <= geometry.container.right + 1, `${child.selector} must fit horizontally`);
    assert(child.top >= geometry.container.top - 1 && child.bottom <= geometry.container.bottom + 1, `${child.selector} must fit vertically`);
    if (!child.selector.includes("textarea")) assert(child.scroll <= child.client + 1, `${child.selector} must not overflow horizontally`);
  }
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light", reducedMotion });
        await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#composer");
        await page.locator('.specimen[data-component="composer"]').waitFor();
        await page.addScriptTag({ content: fixture });
        const host = page.locator("#composer-fixture");
        const form = host.getByRole("form", { name: "Fixture message composer" });
        const input = form.getByRole("textbox", { name: "Fixture message" });
        const send = form.getByRole("button", { name: "Send", exact: true });
        const attach = form.getByRole("button", { name: "Attach", exact: true });
        await input.waitFor();
        assert.equal(await send.isDisabled(), true);
        await assertLayout(form, ["textarea", ".yg-composer-footer", ".yg-composer-footer > .yg-composer-tools:last-child > button"]);
        assert.equal(await input.evaluate(element => getComputedStyle(element).resize), "none");
        const initialBorder = await form.evaluate(element => getComputedStyle(element).borderColor);
        await input.focus();
        assert.equal(await input.evaluate(element => element === document.activeElement), true);
        assert.equal(await form.evaluate(element => element.matches(":focus-within")), true);
        await page.waitForFunction(({ color }) => getComputedStyle(document.querySelector('#composer-fixture .yg-composer')).borderColor !== color, { color: initialBorder });
        await input.fill("A line of content\n".repeat(20));
        await page.waitForFunction(() => {
          const input = document.querySelector('#composer-fixture textarea');
          return input && input.getBoundingClientRect().height >= 120;
        });
        assert((await input.boundingBox()).height <= 176.5, "editor growth must remain bounded");
        await input.fill("");
        await page.waitForFunction(() => {
          const input = document.querySelector('#composer-fixture textarea');
          return input && input.getBoundingClientRect().height <= 60;
        });

        await input.fill("Ready to send");
        assert.equal(await send.isEnabled(), true);
        await attach.click();
        await form.getByText("Draft notes.md", { exact: true }).waitFor();
        await assertLayout(form, ["textarea", ".yg-attachment", ".yg-composer-footer", ".yg-composer-footer > .yg-composer-tools:last-child > button"]);

        await send.focus();
        await send.click();
        assert.deepEqual(JSON.parse(await host.getByTestId("composer-outcome").textContent()), { text: "Ready to send", attachmentIds: ["draft"] });
        const stop = form.getByRole("button", { name: "Stop", exact: true });
        await stop.waitFor();
        assert.equal(await stop.evaluate(element => element === document.activeElement), true, "focus follows the action when it changes");
        assert.equal(await form.getAttribute("aria-busy"), "true");
        assert.equal(await attach.isDisabled(), true);
        await assertLayout(form, ["textarea", ".yg-attachment", ".yg-composer-footer", ".yg-composer-footer > .yg-composer-tools:last-child > button"]);
        if (reducedMotion === "reduce") {
          assert.equal(await form.evaluate(element => getComputedStyle(element).transitionDuration), "0s");
          assert.equal(await stop.evaluate(element => getComputedStyle(element).animationName), "none");
        }
        const stopType = await stop.getAttribute("type");
        const stopDisabled = await stop.getAttribute("aria-disabled");
        await stop.click();
        await page.waitForFunction(() => document.querySelector('#composer-fixture [data-testid="composer-stops"]').textContent === '1', null, { timeout: 3000 }).catch(async error => {
          const evidence = await host.evaluate(element => ({
            outcome: element.querySelector('[data-testid="composer-outcome"]').textContent,
            sends: element.querySelector('[data-testid="composer-sends"]').textContent,
            stops: element.querySelector('[data-testid="composer-stops"]').textContent,
          }));
          throw new Error(`Stop callback was not observed (type=${stopType}, aria-disabled=${stopDisabled}, evidence=${JSON.stringify(evidence)}): ${error.message}`);
        });
        const afterStop = {
          type: stopType,
          ariaDisabled: stopDisabled,
          sends: await host.getByTestId("composer-sends").textContent(),
          stops: await host.getByTestId("composer-stops").textContent(),
          outcome: await host.getByTestId("composer-outcome").textContent(),
        };
        console.log("Composer stop evidence:", JSON.stringify(afterStop));
        assert.equal(afterStop.type, "button", "Stop must not act as a submit button");
        assert.equal(afterStop.sends, "1", "stopping must not submit again");
        assert.equal(afterStop.outcome, "stopped");
        assert.equal(await form.getAttribute("aria-busy"), null);
        assert.equal(await send.isEnabled(), true);
        const outside = host.getByTestId("outside-focus");
        await outside.focus();
        await outside.click();
        await form.getByRole("button", { name: "Stop", exact: true }).waitFor();
        assert.equal(await outside.evaluate(element => element === document.activeElement), true, "state changes must not steal focus from another control");
        await page.close();
      }
    }
    console.log("Composer layout, focus, attachment, send, stop and reduced motion verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
