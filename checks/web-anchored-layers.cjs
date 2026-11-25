const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
const {buildSync} = require('esbuild');
const {join} = require('node:path');
const {pathToFileURL} = require('node:url');
const bundle = buildSync({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React from 'react';
  import {createRoot} from 'react-dom/client';
  import {ActionMenu,Popover} from './packages/web/dist/index.js';
  window.chosen=[];
  createRoot(document.getElementById('layer-fixture'), { identifierPrefix: 'al-' }).render(<>
    <div className="fixture-trailing"><ActionMenu label="Actions" items={[{id:'one',label:'First action'}, {id:'two',label:'Second action'}]} onSelect={id=>window.chosen.push(id)} /></div>
    <div className="fixture-leading"><Popover label="Details"><p>Details content</p></Popover></div>
    <div className="fixture-clip"><div className="fixture-clipped-anchor"><Popover label="Nested"><p>Nested content</p></Popover></div></div>
  </>);
`},bundle:true,write:false,platform:'browser',format:'iife',loader:{'.css':'empty','.module.css':'empty'}}).outputFiles[0].text;
(async()=>{
  const browser=await chromium.launch({channel:process.env.YOGURT_BROWSER_CHANNEL||'chrome'});
  try {
    for (const width of [320,1440]) for (const direction of ['ltr','rtl']) for (const reducedMotion of ['no-preference','reduce']) {
      const page=await browser.newPage({viewport:{width,height:700},reducedMotion});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href);
      await page.evaluate(dir=>{
        const host=document.createElement('div'); host.id='layer-fixture'; host.className='yg-root'; host.dir=dir;
        Object.assign(host.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'9999'});
        const style=document.createElement('style');
        style.textContent=`#layer-fixture .fixture-trailing{position:fixed;right:4px;bottom:4px;pointer-events:auto} #layer-fixture .fixture-leading{position:fixed;left:4px;bottom:4px;pointer-events:auto} #layer-fixture .fixture-clip{position:fixed;left:30px;top:30px;width:220px;height:170px;overflow:hidden;pointer-events:auto} #layer-fixture .fixture-clipped-anchor{position:absolute;right:0;bottom:0}`;
        document.head.append(style);document.body.append(host);
      },direction);
      await page.addScriptTag({content:bundle});
      async function inspect(label, role, clipping) {
        const trigger=page.locator('#layer-fixture').getByRole('button',{name:label,exact:true});
        await trigger.click();
        const panel=page.getByRole(role,{name:label,exact:true});
        await panel.waitFor();
        await panel.evaluate(async node => {await Promise.allSettled(node.getAnimations().map(animation=>animation.finished));});
        const bounds=await panel.boundingBox();
        const limits={x:0,y:0,width,height:700};
        assert(bounds.x>=limits.x+4 && bounds.x+bounds.width<=limits.x+limits.width-4, `${label} horizontal bounds: ${JSON.stringify({bounds,limits})}`);
        assert(bounds.y>=limits.y+4 && bounds.y+bounds.height<=limits.y+limits.height-4, `${label} vertical bounds: ${JSON.stringify({bounds,limits})}`);
        if (role === 'menu' || !clipping) assert.equal(await panel.getAttribute('data-side'),'top');
        assert.equal(await trigger.getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        await panel.waitFor({state:'hidden'});
        assert.equal(await trigger.evaluate(node=>node===document.activeElement),true,`${label} restores focus`);
      }
      await inspect('Actions','menu',false);
      await inspect('Details','dialog',false);
      await inspect('Nested','dialog',true);
      await page.close();
    }
    console.log('Anchored menus and popovers fit viewport and clipping containers in both directions.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
