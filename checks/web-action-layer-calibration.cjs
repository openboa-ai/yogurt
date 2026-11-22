const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { buildSync } = require('esbuild');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const bundle = buildSync({ stdin: {resolveDir:process.cwd(), loader:'jsx', contents:`
  import React, {useState} from 'react';
  import {createRoot} from 'react-dom/client';
  import {IconButton, Sheet} from './packages/web/dist/index.js';
  window.iconActions = [];
  function Fixture() {
    const [open,setOpen] = useState(false);
    const [dir,setDir] = useState('ltr'); window.setFixtureDirection = setDir;
    return <div dir={dir}>
      {['compact','regular','comfortable','spacious','touch'].map(size => <IconButton key={size} size={size}
        icon="close" label={size + ' icon'} onClick={() => window.iconActions.push(size)} />)}
      <button onClick={() => setOpen(true)}>Open sheet</button>
      <Sheet open={open} onOpenChange={setOpen} title="Settings">Sheet content</Sheet>
    </div>;
  }
  createRoot(document.getElementById('calibration-fixture')).render(<Fixture />);
`}, bundle:true, write:false, platform:'browser', format:'iife', loader:{'.css':'empty','.module.css':'empty'} }).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({channel:process.env.YOGURT_BROWSER_CHANNEL || 'chrome'});
  try {
    for (const width of [320,1440]) {
      const page = await browser.newPage({viewport:{width,height:900}});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href);
      await page.evaluate(() => {
        const host = document.createElement('div'); host.id='calibration-fixture'; host.className='yg-root';
        Object.assign(host.style,{position:'fixed', top:'20px', left:'20px', width:'min(280px, calc(100vw - 40px))', zIndex:'9999'});
        document.body.append(host);
      });
      await page.addScriptTag({content:bundle});
      const host = page.locator('#calibration-fixture');
      const sizes = {compact:30,regular:36,comfortable:40,spacious:48,touch:44};
      for (const [size, expected] of Object.entries(sizes)) {
        const button = host.getByRole('button',{name:`${size} icon`});
        const box = await button.boundingBox();
        assert.equal(Math.round(box.width),expected,`${size} width`);
        assert.equal(Math.round(box.height),expected,`${size} height`);
        await button.click();
      }
      assert.deepEqual(await page.evaluate(() => window.iconActions),Object.keys(sizes));
      for (const direction of ['ltr','rtl']) {
        await page.evaluate(value => window.setFixtureDirection(value),direction);
        const trigger = host.getByRole('button',{name:'Open sheet'});
        await trigger.click();
        const sheet = page.getByRole('dialog',{name:'Settings'});
        await sheet.waitFor();
        const corners = await sheet.evaluate(node => {
          const style = getComputedStyle(node);
          return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map(parseFloat);
        });
        if (width === 320) {
          assert(corners[0] > 0 && corners[1] > 0 && corners[2] === 0 && corners[3] === 0,`${direction} mobile sheet corners: ${corners}`);
        } else if (direction === 'ltr') {
          assert(corners[0] > 0 && corners[3] > 0 && corners[1] === 0 && corners[2] === 0,`LTR sheet corners: ${corners}`);
        } else {
          assert(corners[1] > 0 && corners[2] > 0 && corners[0] === 0 && corners[3] === 0,`RTL sheet corners: ${corners}`);
        }
        await page.keyboard.press('Escape');
        await sheet.waitFor({state:'hidden'});
        assert.equal(await trigger.evaluate(node => node === document.activeElement),true,'sheet restores focus');
      }
      await page.close();
    }
    console.log('Icon button size targets and responsive directional sheet corners verified.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
