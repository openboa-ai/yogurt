const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "collection-long-content.jsx", loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { List } from './packages/web/dist/entries/list.js';
    import { ListRow } from './packages/web/dist/entries/list-row.js';
    import { SelectionList } from './packages/web/dist/entries/selection-list.js';
    import { GridList } from './packages/web/dist/entries/grid-list.js';
    import { ListHeader } from './packages/web/dist/entries/list-header.js';
    import { ListFooter } from './packages/web/dist/entries/list-footer.js';
    const long = 'UnbrokenItemWithLongNameAndLongStatusForNarrowLayouts';
    function App() { return <div style={{width:'min(280px, 100%)', minWidth:0}}>
      <ListHeader title={long} detail={long} action={<button type="button">Review</button>} />
      <List label="Long items"><ListRow title="A record" leading={<span>Open</span>} trailing={long} onActivate={() => {}} /></List>
      <SelectionList label="Choose" options={[{id:'one',label:long}]} selected={[]} onValueChange={() => {}} />
      <GridList label="Grid" items={[{id:'one',content:long}]} />
      <ListFooter action={<button type="button">More</button>}>{long}</ListFooter>
    </div>; }
    const host=document.createElement('div'); host.id='collection-long-fixture';
    document.querySelector('.specimen[data-component="list-row"] .specimen-inner').append(host);
    createRoot(host).render(<App />);
  `}, bundle: true, write: false, format: "iife", platform: "browser",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#list-row");
      await page.locator('.specimen[data-component="list-row"]').waitFor();
      await page.addScriptTag({ content: fixture });
      const host = page.locator('#collection-long-fixture');
      await host.getByRole('list', { name: 'Long items' }).waitFor();
      for (const selector of ['.yg-row', '.yg-selection-list .yg-choice', '.yg-grid-list > li', 'header.yg-section-line', 'footer.yg-section-line']) {
        const element = host.locator(selector);
        const geometry = await element.evaluate(node => ({client:node.clientWidth, scroll:node.scrollWidth}));
        assert(geometry.scroll <= geometry.client + 1, selector + ' content must fit its narrow container');
      }
      const checkbox = host.getByRole('checkbox', { name: /UnbrokenItem/ });
      assert((await checkbox.boundingBox()).width >= 23, 'long labels must not shrink the checkbox mark');
      assert.equal(await host.getByRole('button', { name: /A record/ }).count(), 1, 'row remains an actionable button');
      await page.close();
    }
    console.log('Long collection labels, rows and actions fit the narrow container.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
