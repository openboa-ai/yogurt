const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const { geometry } = require("../design/tokens/ui.json");
const { control } = require("../design/tokens/brand.json");

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
    import { RadioGroup } from './packages/web/dist/entries/radio-group.js';
    import { Switch } from './packages/web/dist/entries/switch.js';
    const long = 'UnbrokenItemWithLongNameAndLongStatusForNarrowLayouts';
    function App() { return <div style={{width:'min(280px, 100%)', minWidth:0}}>
      <ListHeader title={long} detail={long} action={<button type="button">Review</button>} />
      <List label="Long items"><ListRow title="A record" leading={<span>Open</span>} trailing={long} onActivate={() => {}} /></List>
      <SelectionList label="Choose" options={[{id:'one',label:long}]} selected={[]} onValueChange={() => {}} />
      <RadioGroup label={long} options={[{id:'one',label:long}]} value="one" onValueChange={() => {}} />
      <Switch label={long} />
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
      for (const selector of ['.yg-row', '.yg-selection-list .yg-choice', '.yg-radio label', 'fieldset.yg-fieldset:not(.yg-selection-list) > legend', '.yg-grid-list > li', 'header.yg-section-line', 'footer.yg-section-line']) {
        const element = host.locator(selector);
        const geometry = await element.evaluate(node => ({client:node.clientWidth, scroll:node.scrollWidth,
          children:[...node.children].map(child => ({name:child.tagName, box:child.getBoundingClientRect().toJSON(), scroll:child.scrollWidth, client:child.clientWidth}))}));
        assert(geometry.scroll <= geometry.client + 1, selector + ' content must fit its narrow container: ' + JSON.stringify(geometry));
      }
      const checkbox = host.getByRole('checkbox', { name: /UnbrokenItem/ });
      assert.equal((await checkbox.boundingBox()).width, geometry["checkbox-size"], 'long labels must not shrink the checkbox mark');
      const radio = host.getByRole('radio', { name: /UnbrokenItem/ });
      const toggle = host.getByRole('switch', { name: /UnbrokenItem/ });
      assert.equal((await radio.boundingBox()).width, control.glyph, 'long labels must not shrink the radio mark');
      assert.equal((await toggle.boundingBox()).width, geometry["switch-width"], 'long labels must not shrink the switch track');
      const switchBounds = await host.locator('.yg-switch').evaluate(node => {
        const box = node.getBoundingClientRect();
        return [...node.children].map(child => {
          const rect = child.getBoundingClientRect();
          return { left: rect.left - box.left, right: rect.right - box.right,
            client: child.clientWidth, scroll: child.scrollWidth, isLabel: child.tagName === 'LABEL' };
        });
      });
      for (const child of switchBounds) {
        assert(child.left >= -1 && child.right <= 1, 'visible switch label and track stay within their container');
        if (child.isLabel) assert(child.scroll <= child.client + 1, 'switch label wraps without clipping');
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'page must not overflow horizontally');
      assert.equal(await host.getByRole('button', { name: /A record/ }).count(), 1, 'row remains an actionable button');
      await page.close();
    }
    console.log('Long collection labels, rows and actions fit the narrow container.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
