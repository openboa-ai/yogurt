const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

(async () => {
  const { Attachment } = await import(pathToFileURL(join(process.cwd(), "packages/web/dist/entries/attachment.js")).href);
  const progressExamples = [0, 50, 100].map(value => renderToStaticMarkup(
    React.createElement(Attachment, { name: `Upload ${value}`, progress: value }),
  )).join("");
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#attachment");
      const root = page.locator('.specimen[data-component="attachment"]');
      const attachment = root.locator(".yg-attachment");
      const open = attachment.locator("button.yg-file-name");
      await open.waitFor();
      await open.locator("strong").evaluate(el => { el.textContent = "extraordinarily-long-unbroken-attachment-filename-for-narrow-layout-review-12345678901234567890.txt"; });
      const bounds = await attachment.evaluate(el => {
        const name = el.querySelector(".yg-file-name");
        return { parent: el.getBoundingClientRect().width, child: name.getBoundingClientRect().width, client: name.clientWidth, scroll: name.scrollWidth };
      });
      assert(bounds.child <= bounds.parent + 1, "filename must fit in attachment");
      assert(bounds.scroll <= bounds.client + 1, "long filename must wrap without horizontal overflow");

      // Render the actual component with each progress prop; the gallery's interactive
      // example does not itself include an upload in progress.
      await root.evaluate((el, html) => {
        const host = document.createElement("div");
        host.className = "attachment-progress-fixtures";
        host.innerHTML = html;
        el.appendChild(host);
      }, progressExamples);
      const fixture = root.locator(".attachment-progress-fixtures");
      for (const value of [0, 50, 100]) {
        const progress = fixture.getByRole("progressbar", { name: `Upload Upload ${value}` });
        assert.equal(await progress.evaluate(el => el.value), value);
        assert.equal(await progress.evaluate(el => el.max), 100);
      }
      await open.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      assert.equal(await open.evaluate(el => el.matches(":focus-visible")), true);
      assert.notEqual(await open.evaluate(el => getComputedStyle(el).outlineStyle), "none");

      await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
      const progress = fixture.getByRole("progressbar", { name: "Upload Upload 50" });
      assert.notEqual(await progress.evaluate(el => getComputedStyle(el).appearance), "none", "forced colors keeps the platform progress control");
      assert.notEqual(await open.evaluate(el => getComputedStyle(el).outlineStyle), "none");
      assert.equal(await open.evaluate(el => getComputedStyle(el).transitionDuration), "0s");

      // The gallery displays the component selected by the hash; switch the
      // specimen before exercising Accordion.
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#accordion");
      const accordion = page.locator('.specimen[data-component="accordion"]');
      const trigger = accordion.getByRole("button", { name: "Who can open this view?" });
      await trigger.click();
      assert.equal(await trigger.getAttribute("aria-expanded"), "true");
      assert.equal(await trigger.locator(".yg-icon").evaluate(el => getComputedStyle(el).rotate), "180deg");
      assert.equal(await trigger.locator(".yg-icon").evaluate(el => getComputedStyle(el).transitionDuration), "0s");
      await trigger.click();
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      await page.close();
    }
    console.log("Attachment layout, rendered progress states, focus and reduced-motion accordion verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
