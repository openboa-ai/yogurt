const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

// Mount the actual component so an image error exercises React's onError path.
const fixture = buildSync({
  stdin: {
    resolveDir: process.cwd(),
    sourcefile: "avatar-fixture.jsx",
    contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { Avatar } from './packages/web/dist/entries/avatar.js';
      const svg = (w, h) => 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="100%" height="100%" fill="steelblue"/></svg>'
      );
      const container = document.createElement('div');
      container.id = 'avatar-fixture';
      document.querySelector('.specimen[data-component="avatar"]').append(container);
      createRoot(container, { identifierPrefix: 'av-' }).render(React.createElement(React.Fragment, null,
        React.createElement(Avatar, { label: 'Portrait image', src: svg(40, 120), size: 36 }),
        React.createElement(Avatar, { label: 'Landscape image', src: svg(120, 40), size: 36 }),
        React.createElement(Avatar, { label: 'Broken image', src: 'data:image/png;base64,broken', size: 36 })
      ));
    `,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#avatar");
      await page.locator('.specimen[data-component="avatar"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const host = page.locator("#avatar-fixture");
      for (const [label, naturalWidth, naturalHeight] of [["Portrait image", 40, 120], ["Landscape image", 120, 40]]) {
        const avatar = host.getByRole("img", { name: label });
        const img = avatar.locator("img");
        await img.waitFor();
        await page.waitForFunction(element => element.complete && element.naturalWidth > 0, await img.elementHandle());
        const result = await img.evaluate(element => {
          const image = element.getBoundingClientRect();
          const frame = element.parentElement.getBoundingClientRect();
          return { naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight, width: image.width, height: image.height, frameWidth: frame.width, frameHeight: frame.height, fit: getComputedStyle(element).objectFit };
        });
        assert.equal(result.naturalWidth, naturalWidth);
        assert.equal(result.naturalHeight, naturalHeight);
        assert.equal(result.fit, "cover");
        assert.equal(result.frameWidth, 36);
        assert.equal(result.frameHeight, 36);
        assert(result.width >= 34 && result.width <= result.frameWidth, `avatar image width ${result.width}`);
        assert(result.height >= 34 && result.height <= result.frameHeight, `avatar image height ${result.height}`);
      }
      const fallback = host.getByRole("img", { name: "Broken image" });
      await fallback.getByText("BI", { exact: true }).waitFor();
      assert.equal(await fallback.locator("img").count(), 0);
      await page.close();
    }
    console.log("Avatar portrait and landscape cover and failed-image fallback verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
