const {chromium}=require(process.cwd()+"/node_modules/playwright-core");
const {pathToFileURL}=require("node:url");
const {join}=require("node:path");
const assert=require("node:assert/strict");
(async()=>{const browser=await chromium.launch({channel:"chrome"});try{
for(const width of [320,1440]){
 const page=await browser.newPage({viewport:{width,height:900},colorScheme:width===320?"dark":"light"});
 const guide=pathToFileURL(join(process.cwd(),"apps/guide/generated/components.html")).href;
 await page.goto(guide+"#segmented-control");
 const root=page.locator('.specimen[data-component="segmented-control"] .yg-segment').first();
 await root.waitFor();
 const buttons=root.locator(':scope > button');
 assert((await buttons.count())>=2);
 const before=await root.locator('button[data-state="on"]').innerText();
 const target=buttons.nth(1);
 await target.click();
 assert.equal(await target.getAttribute('data-state'),'on');
 const track=await root.evaluate(el=>({shadow:getComputedStyle(el).boxShadow,padding:getComputedStyle(el).padding,outline:getComputedStyle(el).outlineStyle,gap:getComputedStyle(el).columnGap}));
 assert.equal(track.shadow,'none');
 assert.equal(track.padding,'3px');
 assert.equal(track.gap,'2px');
 assert.equal(await buttons.first().evaluate(el=>getComputedStyle(el).paddingInlineStart),width===320?'9.6px':'12px');
 assert.equal(await buttons.first().evaluate(el=>getComputedStyle(el).paddingInlineEnd),width===320?'9.6px':'12px');
 const marker=root.locator('.yg-selection-marker');
 await page.waitForTimeout(700);
 assert(await marker.isVisible());
 const [m,b]=await Promise.all([marker.boundingBox(),target.boundingBox()]);
 assert(Math.abs(m.x-b.x)<2 && Math.abs(m.width-b.width)<2);
 await buttons.first().focus();
 await buttons.first().press('Space');
 assert.notEqual(await root.locator('button[data-state="on"]').innerText(),await target.innerText());
 await page.waitForTimeout(700);
 const focus=await buttons.first().evaluate(el=>({outline:getComputedStyle(el).outlineStyle,shadow:getComputedStyle(el).boxShadow}));
 assert.equal(focus.outline,'none');
 assert.notEqual(focus.shadow,'none');
 console.log(JSON.stringify({width,before,track,selection:await root.locator('button[data-state="on"]').innerText()}));
 await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
