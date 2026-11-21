const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { buildSync } = require('esbuild');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const bundle = buildSync({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React from 'react';
  import {createRoot} from 'react-dom/client';
  import {SidebarLayout,SidebarTrigger,SidebarContent,SidebarItem} from './packages/web/dist/index.js';
  createRoot(document.getElementById('hide-sidebar-fixture')).render(
    <SidebarLayout label="Workspace" collapse="hide" compactAt={0}
      navigation={<SidebarContent><SidebarItem label="Overview" onSelect={() => {}} /></SidebarContent>}>
      <SidebarTrigger /><p>Main content</p>
    </SidebarLayout>
  );
`},bundle:true,write:false,platform:'browser',format:'iife',loader:{'.css':'empty','.module.css':'empty'}}).outputFiles[0].text;
(async () => {
  const browser = await chromium.launch({channel:process.env.YOGURT_BROWSER_CHANNEL || 'chrome'});
  try {
    for (const reducedMotion of ['no-preference','reduce']) {
      const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href);
      await page.evaluate(() => {
        const host=document.createElement('div'); host.id='hide-sidebar-fixture'; host.className='yg-root';
        Object.assign(host.style,{position:'fixed',top:'20px',left:'20px',width:'750px',height:'280px',zIndex:'9999'});
        document.body.append(host);
      });
      await page.addScriptTag({content:bundle});
      const host = page.locator('#hide-sidebar-fixture'), layout = host.locator('.yg-sidebar-layout');
      const panel=host.locator('.yg-sidebar-panel'), trigger=host.getByRole('button',{name:'Collapse navigation'});
      await trigger.waitFor();
      const width= (await panel.boundingBox()).width;
      assert(width > 100, 'initial panel width');
      await trigger.click();
      assert.equal(await layout.getAttribute('data-panel'),'hidden');
      assert.equal(await panel.getAttribute('aria-hidden'),'true');
      assert.equal(await panel.evaluate(node => node.inert),true);
      assert.equal(await host.getByRole('button',{name:'Overview'}).count(),0);
      assert((await panel.boundingBox()).width < 1, 'hidden panel releases its layout width');
      await host.getByRole('button',{name:'Expand navigation'}).click();
      assert.equal(await layout.getAttribute('data-panel'),'full');
      assert.equal(await panel.evaluate(node => node.inert),false);
      await layout.evaluate(async node => { await Promise.allSettled(node.getAnimations().map(animation=>animation.finished)); });
      assert(Math.abs((await panel.boundingBox()).width-width) < 1,'rapid reversal restores panel');
      await host.getByRole('button',{name:'Overview'}).focus();
      await page.evaluate(() => {
        document.querySelector('#hide-sidebar-fixture button[aria-controls]').click();
      });
      assert.equal(await host.getByRole('button',{name:'Expand navigation'}).evaluate(node => node === document.activeElement),true,
        'collapsing a focused panel restores focus to its trigger');
      await page.close();
    }
    console.log('Sidebar hide motion, reversal, focus and reduced motion verified.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
