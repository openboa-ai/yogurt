const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir: process.cwd(), sourcefile: "navigation-long-content.jsx", loader: "jsx", contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { SegmentedControl } from './packages/web/dist/entries/segmented-control.js';
    import { Menubar } from './packages/web/dist/entries/menubar.js';
    const long = 'UnbrokenNavigationLabelWithALongNameForNarrowScreens';
    function App() {
      const [selected, setSelected] = useState('long');
      return <div style={{width:'min(280px, 100%)', minWidth:0}}>
        <SegmentedControl label="View choices" value={selected} onValueChange={setSelected}
          options={[{id:'long',label:long},{id:'other',label:'Other'}]} />
        <Menubar label="Workspace menu" menus={[{id:'long',label:long,items:[{id:'open',label:'Open'}]}]} onSelect={() => {}} />
        <output data-testid="selected">{selected}</output>
      </div>;
    }
    const node = document.createElement('div'); node.id='navigation-long-fixture';
    document.querySelector('.specimen[data-component="segmented-control"] .specimen-inner').append(node);
    createRoot(node).render(<App />);
  `}, bundle:true, write:false, platform:"browser", format:"iife",
  loader:{".css":"empty", ".module.css":"empty"},
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel:"chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({viewport:{width,height:900}, reducedMotion:"reduce"});
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#segmented-control");
      await page.locator('.specimen[data-component="segmented-control"]').waitFor();
      await page.addScriptTag({content:fixture});
      const host = page.locator('#navigation-long-fixture');
      const segment = host.locator('.yg-segment');
      await segment.waitFor();
      for (const element of [segment, ...await segment.locator(':scope > button').all(), host.locator('.yg-menu-bar'), ...await host.locator('.yg-menu-bar > button').all()]) {
        const bounds = await element.evaluate(node => ({client:node.clientWidth,scroll:node.scrollWidth}));
        assert(bounds.scroll <= bounds.client + 1, 'navigation labels must fit their container: ' + JSON.stringify(bounds));
      }
      await segment.locator(':scope > button').filter({hasText:'Other'}).click();
      assert.equal(await host.getByTestId('selected').textContent(), 'other', 'selection still follows the host callback');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'page must not overflow horizontally');
      await page.close();
    }
    console.log('Long segmented and menu labels fit a narrow container at 320 and 1440 px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
