const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { buildSync } = require("esbuild");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const bundle = buildSync({
  stdin: { resolveDir: process.cwd(), loader: "jsx", contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { Breadcrumb, NavigationList, Pagination } from './packages/web/src/controls/navigation.tsx';
    import { Navbar, Stepper } from './packages/web/src/controls/advanced.tsx';
    import { Badge, Status, Notice, Result, Skeleton, Progress } from './packages/web/src/controls/feedback.tsx';
    import { Legend } from './packages/web/src/controls/data.tsx';
    import { Count } from './packages/web/src/patterns/collections.tsx';
    const long = 'UnbrokenWorkspaceName'.repeat(6);
    const links = [{id:'a',label:long,href:'#a'},{id:'b',label:long,href:'#b'}];
    const wrap = (id, child) => <section data-layout={id}>{child}</section>;
    createRoot(document.getElementById('navigation-feedback-fixture')).render(<>
      {wrap('breadcrumb', <Breadcrumb items={links} />)}
      {wrap('navigation', <NavigationList label="Navigation" items={links} current="a" />)}
      {wrap('navbar', <Navbar label={long} onBack={() => {}} action={<button type="button">Action</button>} />)}
      {wrap('badge', <Badge>{long}</Badge>)}
      {wrap('count', <Count label="items" value={1234567890123456} />)}
      {wrap('status', <Status>{long}</Status>)}
      {wrap('legend', <Legend label={long} />)}
      {wrap('progress', <Progress label={long} value={55} />)}
      {wrap('notice', <Notice title={long}>{long}</Notice>)}
      {wrap('result', <Result title={long}>{long}</Result>)}
      {wrap('skeleton', <Skeleton />)}
      {wrap('pagination', <Pagination page={2} pages={10} onPageChange={() => {}} />)}
      {wrap('stepper', <Stepper label="Steps" current="a" steps={[{id:'a',label:long},{id:'b',label:long}]} />)}
    </>);
  ` }, bundle: true, write: false, platform: "browser", format: "iife",
  loader: { ".css": "empty", ".module.css": "empty" },
}).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 1440]) for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href);
      await page.evaluate(() => {
        const host = document.createElement("div"); host.id = "navigation-feedback-fixture"; host.className = "yg-root";
        Object.assign(host.style, { position: "absolute", top: "0", left: "0", width: "min(260px, calc(100vw - 40px))", zIndex: "9999" });
        document.body.append(host);
      });
      await page.addScriptTag({ content: bundle });
      await page.locator('#navigation-feedback-fixture [data-layout="stepper"]').waitFor();
      const boxes = await page.locator('#navigation-feedback-fixture [data-layout]').evaluateAll(nodes => nodes.map(node => ({
        id: node.dataset.layout, width: node.clientWidth, scroll: node.scrollWidth,
      })));
      for (const box of boxes) assert(box.scroll <= box.width + 1, `${box.id} overflows: ${box.scroll} > ${box.width}`);
      assert.equal(await page.locator('#navigation-feedback-fixture').getByRole("navigation", { name: "Breadcrumb" }).locator('[aria-current="page"]').count(), 1);
      assert.equal(await page.locator('#navigation-feedback-fixture .yg-progress progress').getAttribute('value'), '55');
      await page.close();
    }
    console.log("Navigation and feedback labels remain inside narrow containers in both appearances.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
