const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { Message, Transcript } from './packages/web/src/identity/identity.tsx';
    import { Bubble } from './packages/web/src/patterns/editorial.tsx';
    const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500"><rect width="1000" height="500" fill="#777"/></svg>');
    const content = (prefix) => <><img alt={prefix + ' image'} src={image} width="1000" height="500" /><pre data-content={prefix}>{'long_code_without_spaces'.repeat(50)}</pre></>;
    createRoot(document.getElementById('conversation-media-fixture')).render(
      <Transcript label="Conversation" revision={1}>
        <Message speaker="Agent">{content('message')}<Bubble>{content('bubble')}</Bubble></Message>
      </Transcript>
    );
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
    await page.evaluate(() => {
      const host = document.createElement("div");
      host.id = "conversation-media-fixture"; host.className = "yg-root";
      Object.assign(host.style, { position: "fixed", top: "20px", left: "20px", width: "280px", zIndex: "9999" });
      document.body.append(host);
    });
    await page.addScriptTag({ content: bundle });
    const host = page.locator("#conversation-media-fixture");
    const bubble = host.locator(".yg-bubble");
    await bubble.waitFor();
    for (const prefix of ["message", "bubble"]) {
      const image = host.getByRole("img", { name: `${prefix} image` });
      await image.evaluate(node => node.decode());
      const geometry = await image.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const container = (node.closest('.yg-bubble') || node.closest('.yg-message > div:last-child')).getBoundingClientRect();
        return { width: rect.width, height: rect.height, left: rect.left, right: rect.right, containerLeft: container.left, containerRight: container.right };
      });
      assert(geometry.left >= geometry.containerLeft - 1 && geometry.right <= geometry.containerRight + 1, `${prefix} image must fit its container`);
      assert(Math.abs(geometry.width / geometry.height - 2) < .02, `${prefix} image must keep its 2:1 ratio`);
      const code = host.locator(`pre[data-content="${prefix}"]`);
      const codeLayout = await code.evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth, overflow: getComputedStyle(node).overflowX }));
      assert(codeLayout.scroll > codeLayout.width && ["auto", "scroll"].includes(codeLayout.overflow), `${prefix} code must scroll within its own width`);
    }
    const bounds = await host.evaluate(node => {
      const body = node.querySelector('.yg-message > div:last-child');
      const bubble = node.querySelector('.yg-bubble');
      const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, scroll: element.scrollWidth, client: element.clientWidth }; };
      return { host: rect(node), body: rect(body), bubble: rect(bubble), transcript: rect(node.querySelector('.yg-scroll')) };
    });
    assert(bounds.bubble.right <= bounds.body.right + 1, `bubble must remain within the message: ${JSON.stringify(bounds)}`);
    assert(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1), "conversation must not overflow its host");
    console.log("Conversation media fit and retain aspect ratio; long code scrolls within message and bubble at 320 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
