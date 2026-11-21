const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { buildSync } = require('esbuild');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const bundle = buildSync({ stdin: { resolveDir: process.cwd(), loader: 'jsx', contents: `
  import React from 'react';
  import {createRoot} from 'react-dom/client';
  import {ProfileCard} from './packages/web/dist/index.js';
  import {ProfileCard as MotionProfileCard} from './packages/web/dist/motion-patterns.js';
  window.sameProfileExport = ProfileCard === MotionProfileCard;
  window.profileActions = 0;
  createRoot(document.getElementById('profile-fixture')).render(<>
    <ProfileCard name="Alexandra Morgan with a long name" detail="Research and documentation" initials="AM"
      actions={<button onClick={() => window.profileActions++}>Open profile</button>}>
      <p>Reviews long documents and provides detailed observations to the team.</p>
    </ProfileCard>
    <MotionProfileCard name="Riley" detail="Operations" initials="R" />
  </>);
` }, bundle: true, write: false, platform:'browser', format:'iife',
loader:{'.css':'empty','.module.css':'empty'} }).outputFiles[0].text;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || 'chrome' });
  try {
    for (const width of [320, 1440]) for (const appearance of ['light', 'dark']) {
      const page = await browser.newPage({viewport:{width,height:900}, colorScheme:appearance});
      await page.goto(pathToFileURL(join(process.cwd(),'apps/guide/generated/components.html')).href);
      await page.evaluate(appearance => {
        const host = document.createElement('div'); host.id = 'profile-fixture'; host.className = 'yg-root';
        host.dataset.appearance = appearance;
        Object.assign(host.style, {position:'fixed', top:'20px', left:'20px', width:'min(280px, calc(100vw - 40px))', zIndex:'9999'});
        document.body.append(host);
      }, appearance);
      await page.addScriptTag({content:bundle});
      const host = page.locator('#profile-fixture');
      const cards = host.locator('.yg-profile-card');
      const card = cards.first(), details = card.locator('details.yg-disclosure');
      const summary = details.locator('summary');
      await summary.waitFor();
      assert.equal(await page.evaluate(() => window.sameProfileExport), true, 'both imports share the same implementation');
      assert.equal(await cards.last().locator('details').count(), 0, 'no disclosure is rendered without details');
      assert.equal(await summary.innerText(), 'More about Alexandra Morgan with a long name');
      assert.equal(await details.evaluate(node => node.open), false);
      assert((await summary.boundingBox()).height >= 44, 'summary has a 44px target');
      assert.equal(await details.evaluate(node => getComputedStyle(node).borderBlockStartWidth), '0px');
      const hostBox = await host.boundingBox(), cardBox = await card.boundingBox();
      assert(cardBox.x >= hostBox.x - 1 && cardBox.x + cardBox.width <= hostBox.x + hostBox.width + 1, 'card stays in the host');
      await summary.focus(); await summary.press('Enter');
      assert.equal(await details.evaluate(node => node.open), true);
      await card.getByText('Reviews long documents and provides detailed observations to the team.').waitFor({state:'visible'});
      const description = card.getByText('Reviews long documents and provides detailed observations to the team.');
      assert.equal(await description.isVisible(), true);
      await summary.press('Enter'); await summary.press('Enter');
      assert.equal(await details.evaluate(node => node.open), true, 'rapid reversal keeps the last state');
      assert.equal(await summary.evaluate(node => node === document.activeElement), true);
      assert.equal(await page.evaluate(() => window.profileActions), 0, 'disclosure does not trigger host actions');
      await card.getByRole('button',{name:'Open profile'}).click();
      assert.equal(await page.evaluate(() => window.profileActions), 1);
      await page.emulateMedia({reducedMotion:'reduce'});
      await summary.click();
      assert.equal(await details.evaluate(node => node.open), false);
      assert.equal(await description.isVisible(), false);
      await summary.focus(); await summary.press('Space');
      assert.equal(await details.evaluate(node => node.open), true);
      assert.equal(await description.isVisible(), true);
      assert.equal(await summary.evaluate(node => node === document.activeElement), true);
      await page.close();
    }
    console.log('Profile disclosure exports, keyboard reversal, host actions, widths and reduced motion verified.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
