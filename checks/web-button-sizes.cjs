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
 await page.close();
}
console.log("Five button sizes, pill shape and actions verified at 320 and 1440 px.");
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
