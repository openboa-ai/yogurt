const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const fixture = buildSync({
  stdin: { resolveDir:process.cwd(), sourcefile:"form-feedback-motion.jsx", loader:"jsx", contents:`
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { SearchField } from './packages/web/dist/entries/search-field.js';
    import { TextField } from './packages/web/dist/entries/text-field.js';
    import { Checkbox } from './packages/web/dist/entries/checkbox.js';
    import { RadioGroup } from './packages/web/dist/entries/radio-group.js';
    function App() {
      const [query,setQuery] = useState('');
      const [error,setError] = useState(false);
      const [mixed,setMixed] = useState(false);
      const [radio,setRadio] = useState('a');
      return <div style={{width:'min(280px,100%)'}}>
        <SearchField label="Search records" value={query} onValueChange={setQuery} />
        <TextField label="Title" error={error ? 'A title is required.' : undefined} />
        <button type="button" onClick={() => setError(!error)}>Toggle error</button>
        <Checkbox label="Include records" checked={mixed ? 'indeterminate' : false} onCheckedChange={() => {}} />
        <button type="button" onClick={() => setMixed(!mixed)}>Toggle mixed</button>
        <RadioGroup label="Order" value={radio} onValueChange={setRadio} options={[{id:'a',label:'First'},{id:'b',label:'Second'}]} />
      </div>;
    }
    const node=document.createElement('div'); node.id='form-feedback-fixture';
    document.querySelector('.specimen[data-component="search-field"] .specimen-inner').append(node);
    createRoot(node).render(<App />);
  `}, bundle:true, write:false, platform:"browser", format:"iife",
  loader:{".css":"empty", ".module.css":"empty"},
}).outputFiles[0].text;

(async () => {
  const browser=await chromium.launch({channel:"chrome"});
  try {
    for (const width of [320,1440]) for (const reducedMotion of ['no-preference','reduce']) {
      const page=await browser.newPage({viewport:{width,height:900}, reducedMotion});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href+'#search-field');
      await page.locator('.specimen[data-component="search-field"]').waitFor();
      await page.addScriptTag({content:fixture});
      const host=page.locator('#form-feedback-fixture');
      const search=host.getByRole('searchbox',{name:'Search records',exact:true});
      await search.fill('notes');
      const clear=host.getByRole('button',{name:'Clear search records',exact:true});
      await clear.waitFor();
      const clearAnimation=await clear.evaluate(node=>getComputedStyle(node).animationName);
      assert.equal(clearAnimation,reducedMotion==='reduce'?'none':'yg-search-clear-arrive');
      await clear.click();
      assert.equal(await search.inputValue(),'');

      await host.getByRole('button',{name:'Toggle error',exact:true}).click();
      const error=host.getByText('A title is required.',{exact:true});
      await error.waitFor();
      const title=host.getByRole('textbox',{name:'Title',exact:true});
      assert.equal(await title.getAttribute('aria-invalid'),'true');
      assert((await title.getAttribute('aria-describedby')).includes(await error.getAttribute('id')));
      assert.equal(await error.evaluate(node=>getComputedStyle(node).animationName),reducedMotion==='reduce'?'none':'yg-field-error-arrive');

      await host.getByRole('button',{name:'Toggle mixed',exact:true}).click();
      const checkbox=host.getByRole('checkbox',{name:'Include records',exact:true});
      assert.equal(await checkbox.getAttribute('aria-checked'),'mixed');
      const mixed=host.locator('.yg-checkbox-mixed');
      assert.equal(await mixed.evaluate(node=>getComputedStyle(node).opacity),'1');
      assert.equal(await mixed.evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration)>0),reducedMotion==='no-preference');

      const second=host.getByRole('radio',{name:'Second',exact:true});
      await second.click();
      assert.equal(await second.getAttribute('aria-checked'),'true');
      const dot=second.locator(':scope > span');
      await dot.waitFor();
      assert.equal(await dot.evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration)>0),reducedMotion==='no-preference');
      await page.close();
    }
    console.log('Radio, indeterminate checkbox, search clear and error feedback verified.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
