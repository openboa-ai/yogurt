const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { Card } from './packages/web/src/patterns/editorial.tsx';
    import { Chart } from './packages/web/src/controls/data.tsx';
    import { StatCard } from './packages/web/src/patterns/motion-cards.tsx';
    const long = 'UnbrokenWorkspaceName'.repeat(6);
    createRoot(document.getElementById('data-long-fixture'), { identifierPrefix: 'dlc-' }).render(<>
      <Card title={long} description={long}><span>{long}</span></Card>
      <StatCard label={long} value={1234567890123456} detail="Change" />
      <Chart title={long} series="Items" points={[{id:'a', label:'Mon', value:125},{id:'b', label:'Tue', value:210}]} unit="items" source={long} asOf="2026-01-01" />
    </>);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
    await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
    await page.evaluate(() => {
      const host = document.createElement("div"); host.id = "data-long-fixture"; host.className = "yg-root";
      Object.assign(host.style, { position: "absolute", top: "20px", left: "20px", width: "280px", zIndex: "9999" });
      document.body.append(host);
    });
    await page.addScriptTag({ content: bundle });
    const host = page.locator("#data-long-fixture");
    await host.locator('.yg-chart').waitFor();
    for (const selector of [".yg-card", ".yg-stat-card", ".yg-chart"]) {
      const layout = await host.locator(selector).evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth }));
      assert(layout.scroll <= layout.width + 1, `${selector} overflows: ${layout.scroll} > ${layout.width}`);
    }
    assert(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1), "data examples must not overflow the host");
    console.log("Card, StatCard and Chart long content remains within its container at 320 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
