const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const gallery = pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href;
  const touchMeasurements = [];
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light", reducedMotion: "reduce" });
      await page.goto(gallery + "#date-picker");
      const root = page.locator('.specimen[data-component="date-picker"]');
      const trigger = root.getByRole("button", { name: "Review date" });
      await trigger.waitFor();
      assert.equal(await trigger.getAttribute("data-state"), "closed");
      await trigger.click();
      assert.equal(await trigger.getAttribute("data-state"), "open");
      assert.equal(await trigger.locator(".yg-icon").evaluate(el => getComputedStyle(el).rotate), "180deg");
      assert.equal(await trigger.locator(".yg-icon").evaluate(el => getComputedStyle(el).transitionDuration), "0s");

      const calendar = root.locator(".yg-calendar");
      await calendar.waitFor();
      const bounds = await calendar.boundingBox();
      assert(bounds.x >= -1 && bounds.x + bounds.width <= width + 1, "calendar fits inside the viewport");
      const selected = calendar.locator(".rdp-selected button");
      await selected.waitFor();
      const appearance = el => ({ background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color });
      const beforeHover = await selected.evaluate(appearance);
      assert.notEqual(beforeHover.background, "rgba(0, 0, 0, 0)");
      await selected.hover();
      assert.deepEqual(await selected.evaluate(appearance), beforeHover, "hover preserves the selected state");

      await calendar.getByRole("button", { name: /November 21/ }).click();
      assert.equal(await trigger.getAttribute("data-state"), "closed");
      assert.match(await trigger.innerText(), /2026-11-21/);
      await trigger.click();
      assert.equal(await trigger.getAttribute("data-state"), "open");
      await page.keyboard.press("Escape");
      assert.equal(await trigger.getAttribute("data-state"), "closed");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.notEqual(await trigger.locator(".yg-icon").evaluate(el => getComputedStyle(el).transitionDuration), "0s");
      await page.close();

      const touch = await browser.newPage({ viewport: { width, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      await touch.goto(gallery + "#calendar");
      assert.equal(await touch.evaluate(() => matchMedia("(pointer: coarse)").matches), true);
      const touchDay = touch.locator('.specimen[data-component="calendar"] .yg-calendar .rdp-selected button');
      await touchDay.waitFor();
      const size = await touchDay.boundingBox();
      assert(size && size.width > 0 && size.height > 0);
      assert(size.width >= 44 && size.height >= 44, "standalone selected day has a 44px touch target");
      assert((await touch.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, "standalone calendar must not overflow the page");
      const standaloneCalendar = touch.locator('.specimen[data-component="calendar"] .yg-calendar');
      const standaloneDays = standaloneCalendar.locator(".rdp-day_button");
      const standaloneSizes = await standaloneDays.evaluateAll(elements => elements.map(el => {
        const box = el.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }));
      assert(standaloneSizes.length > 27 && standaloneSizes.every(day => day.width >= 44 && day.height >= 44));
      await standaloneDays.last().focus();
      const focusedBounds = await standaloneCalendar.evaluate(el => {
        const outer = el.getBoundingClientRect();
        const focused = el.querySelector(":focus").getBoundingClientRect();
        return { left: outer.left, right: outer.right, focusedLeft: focused.left, focusedRight: focused.right };
      });
      assert(focusedBounds.focusedLeft >= focusedBounds.left - 1 && focusedBounds.focusedRight <= focusedBounds.right + 1,
        "keyboard focus scrolls the day into the calendar viewport");
      touchMeasurements.push({ viewport: width, dayWidth: size.width, dayHeight: size.height });

      await touch.goto(gallery + "#date-picker");
      const touchRoot = touch.locator('.specimen[data-component="date-picker"]');
      const touchTrigger = touchRoot.getByRole("button", { name: "Review date" });
      await touchTrigger.tap();
      const popup = touchRoot.locator(".yg-date-popup");
      await popup.waitFor();
      const popupBox = await popup.boundingBox();
      assert(popupBox.x >= -1 && popupBox.x + popupBox.width <= width + 1, "touch date popup fits in viewport");
      const daySizes = await popup.locator(".rdp-day_button").evaluateAll(elements => elements.map(el => {
        const box = el.getBoundingClientRect();
        return { x: box.x, width: box.width, height: box.height };
      }));
      assert(daySizes.length > 27, "the month has day buttons");
      assert(daySizes.every(day => day.width >= 44 && day.height >= 44), "every rendered day has a 44px touch target");
      assert(daySizes.every(day => day.x >= -1 && day.x + day.width <= width + 1), "all day targets fit inside viewport");
      await popup.getByRole("button", { name: /November 21/ }).tap();
      assert.equal(await touchTrigger.getAttribute("data-state"), "closed");
      assert.match(await touchTrigger.innerText(), /2026-11-21/);
      await touch.close();
    }
    console.log(JSON.stringify({ datePicker: "open, selection, dismissal and selected hover checked", touchMeasurements }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
