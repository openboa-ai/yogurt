const {chromium}=require("playwright-core");
const {pathToFileURL}=require("node:url");
const {join}=require("node:path");
const assert=require("node:assert/strict");
(async()=>{
const b=await chromium.launch({channel:"chrome"});
try{
for(const width of [320,1440]){
 const page=await b.newPage({viewport:{width,height:950},colorScheme:width===320?"dark":"light"});
 await page.goto(pathToFileURL(join(process.cwd(),"apps/guide/generated/components.html")).href+"#button");
 const section=page.locator(".variation .specimen");
 await section.waitFor();
 const sizes={Compact:30,Regular:36,Comfortable:40,Spacious:48,Touch:44};
 for(const [label,height] of Object.entries(sizes)){
  const button=section.getByRole("button",{name:label,exact:true});
  await button.waitFor();
  assert.equal(Math.round((await button.boundingBox()).height),height,label);
  await button.click();
  await section.getByRole("status").filter({hasText:label+" action selected."}).waitFor();
 }
 const pill=section.getByRole("button",{name:"Keep draft"});
 assert((await pill.evaluate(node=>parseInt(getComputedStyle(node).borderRadius)))>50);
 await page.goto(pathToFileURL(join(process.cwd(),"apps/guide/generated/components.html")).href+"#icon-button");
 const iconSpecimen=page.locator(".variation .specimen");
 for (const [name,height,glyphWidth] of [["Find a view",30,14],["Add a view",36,16],["Copy a view",40,20],["Save a view",44,20],["Close views",48,20]]) {
  const button=iconSpecimen.getByRole("button",{name,exact:true});
  const geometry=await button.evaluate(node=>{
   const button=node.getBoundingClientRect();
   const icon=node.querySelector("svg").getBoundingClientRect();
   return [button.width,button.height,icon.width,Math.abs(button.x+button.width/2-icon.x-icon.width/2),Math.abs(button.y+button.height/2-icon.y-icon.height/2)];
  });
  assert.deepEqual(geometry,[height,height,glyphWidth,0,0],name);
 }
 await iconSpecimen.getByRole("button",{name:"Copy a view"}).press("Enter");
 await iconSpecimen.getByRole("status").filter({hasText:"View copied."}).waitFor();
 await page.close();
}
console.log("Five button sizes, pill shape and actions verified at 320 and 1440 px.");
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
