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
    const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500"><rect width="1000" height="500" fill="#777"/></svg>');
    createRoot(document.getElementById('conversation-media-fixture'), { identifierPrefix: 'cml-' }).render(
      <Transcript label="Conversation" revision={1}>
        <Message speaker="Agent">
          <img alt="message image" src={image} width="1000" height="500" />
          <pre data-content="message">{'long_code_without_spaces'.repeat(50)}</pre>
        </Message>
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
    const image = host.getByRole("img", { name: "message image" });
    await image.waitFor();
    await image.evaluate(node => node.decode());
    const geometry = await image.evaluate(node => {
      const rect = node.getBoundingClientRect();
      const container = node.closest('.yg-message > div:last-child').getBoundingClientRect();
      return { width: rect.width, height: rect.height, left: rect.left, right: rect.right, containerLeft: container.left, containerRight: container.right };
    });
    assert(geometry.left >= geometry.containerLeft - 1 && geometry.right <= geometry.containerRight + 1, "message image must fit its container");
    assert(Math.abs(geometry.width / geometry.height - 2) < .02, "message image must keep its 2:1 ratio");
    const code = host.locator('pre[data-content="message"]');
    const codeLayout = await code.evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth, overflow: getComputedStyle(node).overflowX }));
    assert(codeLayout.scroll > codeLayout.width && ["auto", "scroll"].includes(codeLayout.overflow), "message code must scroll within its own width");
    assert(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1), "conversation must not overflow its host");
    console.log("Conversation media fit and retain aspect ratio; long code scrolls within message at 320 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
