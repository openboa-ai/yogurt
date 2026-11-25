const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
const {buildSync} = require('esbuild');
const {join} = require('node:path');
const {pathToFileURL} = require('node:url');
const bundle = buildSync({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
  import React, {useState} from 'react';
  import {createRoot} from 'react-dom/client';
  import {Tabs,Breadcrumb,Navbar} from './packages/web/dist/index.js';
  const items=[{id:'one',label:'One',panel:'First panel'}, {id:'two',label:'Two',panel:'Second panel',disabled:true}, {id:'three',label:'Three',panel:'Third panel'}];
  window.tabChanges=[];
  function Fixture(){
    const [value,setValue]=useState('one');
    return <><Breadcrumb items={[{id:'home',label:'Home',href:'#home'},{id:'here',label:'Here',href:'#here'}]} />
      <Navbar label="Current page" onBack={()=>{}} />
      <Tabs label="Sections" items={items} value={value} onValueChange={value=>{window.tabChanges.push(value);setValue(value);}} />
    </>;
  }
  createRoot(document.getElementById('navigation-fixture'), { identifierPrefix: 'ndm-' }).render(<Fixture />);
`},bundle:true,write:false,platform:'browser',format:'iife',loader:{'.css':'empty','.module.css':'empty'}}).outputFiles[0].text;
(async()=>{
  const browser=await chromium.launch({channel:process.env.YOGURT_BROWSER_CHANNEL||'chrome'});
  try {
    for(const width of [320,1440]) for(const direction of ['ltr','rtl']) for(const reducedMotion of ['no-preference','reduce']) {
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href);
      await page.evaluate(dir=>{
        const host=document.createElement('div');host.id='navigation-fixture';host.className='yg-root';host.dir=dir;
        Object.assign(host.style,{position:'fixed',top:'20px',left:'20px',width:'min(280px, calc(100vw - 40px))',zIndex:'9999'});
        document.body.append(host);
      },direction);
      await page.addScriptTag({content:bundle});
      const host=page.locator('#navigation-fixture');
      const one=host.getByRole('tab',{name:'One'}), three=host.getByRole('tab',{name:'Three'});
      await one.focus();
      await one.press(direction==='rtl'?'ArrowLeft':'ArrowRight');
      assert.equal(await three.getAttribute('aria-selected'),'true');
      assert.equal(await three.evaluate(node=>node===document.activeElement),true);
      assert.deepEqual(await page.evaluate(()=>window.tabChanges),['three'],'one key produces one controlled selection');
      await three.press(direction==='rtl'?'ArrowRight':'ArrowLeft');
      assert.equal(await one.getAttribute('aria-selected'),'true');
      assert.deepEqual(await page.evaluate(()=>window.tabChanges),['three','one']);
      const rotations=await Promise.all([
        host.locator('.yg-breadcrumb .yg-icon').evaluate(node=>getComputedStyle(node).rotate),
        host.getByRole('button',{name:'Go back'}).locator('svg').evaluate(node=>getComputedStyle(node).rotate),
      ]);
      assert.deepEqual(rotations,direction==='rtl'?['180deg','180deg']:['none','none']);
      await page.close();
    }
    console.log('Directional tabs and navigation indicators verified.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
