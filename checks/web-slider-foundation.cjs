const { chromium, webkit } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = process.argv[2] === "webkit" ? await webkit.launch() : await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: width === 320 ? "dark" : "light",
        reducedMotion: width === 320 ? "reduce" : "no-preference",
      });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#slider");
      const surface = page.locator('.specimen[data-component="slider"] .yg-value-slider').first();
      const slider = surface.getByRole("slider", { name: "Preview volume" });
      await slider.waitFor();
      const initial = Number(await slider.inputValue());
      const geometry = await surface.evaluate(el => ({
        height: el.querySelector("[data-slot=slider-control]").getBoundingClientRect().height,
        track: el.querySelector("[data-slot=slider-track]").getBoundingClientRect().height,
        thumb: el.querySelector("[data-slot=slider-thumb]").getBoundingClientRect().width,
        fill: el.querySelector("[data-slot=slider-indicator]").getBoundingClientRect().width,
      }));
      assert(geometry.height >= 32);
      assert.equal(geometry.track, 4);
      assert.equal(geometry.thumb, 16);
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      assert(Number(await slider.inputValue()) > initial);
      assert((await surface.locator("[data-slot=slider-indicator]").boundingBox()).width > geometry.fill);
      const tip = surface.locator("[data-tip=start]");
      await page.waitForFunction(node => Number(getComputedStyle(node).opacity) === 1, await tip.elementHandle());
      await slider.blur();
      await page.waitForFunction(node => Number(getComputedStyle(node).opacity) === 0, await tip.elementHandle());

      const card = page.locator(".variation .specimen .yg-value-slider");
      const preview = card.getByRole("slider", { name: "Preview volume" });
      const control = card.locator("[data-slot=slider-control]");
      assert((await control.boundingBox()).height >= 30);
      assert.equal(await preview.getAttribute("aria-valuetext"), "30%");
      await preview.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await preview.getAttribute("aria-valuetext"), "31%");
      await control.scrollIntoViewIfNeeded();
      const { x, y, width: railWidth, height } = await control.boundingBox();
      const railY = y + height / 2;
      await page.mouse.move(x + railWidth * .6, railY);
      await page.mouse.down();
      await page.mouse.move(x + railWidth * .8, railY, { steps: 5 });
      await card.locator("[data-slot=slider-thumb][data-dragging]").waitFor();
      await page.waitForFunction(node => node.valueAsNumber > 70, await preview.elementHandle());
      const frames = await card.evaluate(async node => {
        const cue = node.querySelector("[data-tip=start]");
        const track = node.querySelector("[data-slot=slider-track]");
        const sample = () => {
          const style = getComputedStyle(cue);
          return {
            lag: track.clientWidth * Math.abs(parseFloat(node.style.getPropertyValue("--yg-slider-start")) -
              parseFloat(cue.style.getPropertyValue("--yg-tip-current"))) / 100,
            lean: Math.abs(parseFloat(style.rotate)),
          };
        };
        const samples = [sample()];
        for (let frame = 0; frame < 2; frame++) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          samples.push(sample());
        }
        return samples;
      });
      if (width === 320) {
        assert(frames.every(frame => frame.lag === 0 && frame.lean === 0), "Reduced motion tracks immediately");
      } else {
        assert(frames.some(frame => frame.lag > 3 && frame.lean > 2), "The cue visibly trails and leans while dragging");
      }
      await page.mouse.up();
      assert.equal(await card.locator("[data-slot=slider-thumb][data-dragging]").count(), 0);
      await page.waitForFunction(node => {
        const cue = node.querySelector("[data-tip=start]");
        return cue.style.getPropertyValue("--yg-tip-current") === node.style.getPropertyValue("--yg-slider-start") &&
          parseFloat(getComputedStyle(cue).rotate) === 0;
      }, await card.elementHandle());
      await preview.press("End");
      const edge = await card.locator("[data-tip=start]").evaluate(async node => {
        await Promise.allSettled(node.getAnimations().map(animation => animation.finished));
        return node.getBoundingClientRect().right <= node.closest(".yg-value-slider").getBoundingClientRect().right;
      });
      assert(edge, "the value stays inside the card at the endpoint");
      await page.close();
    }
    const touchPage = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true });
    await touchPage.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#slider");
    const touchControl = touchPage.locator('.specimen[data-component="slider"] .yg-value-slider [data-slot=slider-control]').first();
    await touchControl.waitFor();
    assert((await touchControl.boundingBox()).height >= 44, "coarse slider control hit area >= 44px");
    await touchPage.close();
    console.log("Slider hit area, coarse touch target, value display, keyboard, pointer and reduced motion verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
