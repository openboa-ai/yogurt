const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

const url = process.env.YOGURT_MOTION_URL ||
  pathToFileURL(join(__dirname, "../apps/guide/generated/motion-comparison.html")).href;
const output = process.env.YOGURT_CAPTURE_DIR;
const recording = process.env.YOGURT_RECORD_DIR;
const translations = (locator) =>
  locator.evaluate(node => parseFloat(getComputedStyle(node).translate) || 0);
const stripLeft = (locator) => locator.evaluate(node => node.getBoundingClientRect().left);

(async () => {
  const browser = await chromium.launch({channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome"});
  const problems = [];
  try {
    const page = await browser.newPage({
      viewport: {width: 1200, height: 900},
      recordVideo: recording ? {dir: recording, size: {width: 960, height: 720}} : undefined,
    });
    page.setDefaultTimeout(6000);
    page.on("pageerror", problem => problems.push(problem.message));
    await page.goto(url);
    await page.getByRole("heading", {name: "Component motion"}).waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (output) await page.screenshot({path: join(output, "yogurt-motion-comparison.png"), fullPage: true});

    const candidate = (name) => page.getByRole("region", {name, exact: true})
      .getByRole("group", {name: "Candidate", exact: true});
    const action = candidate("Button");
    const save = action.locator(".yg-button[data-result]");
    const result = action.getByRole("status");
    const states = [];
    await result.evaluate(node => {
      window.motionResults = [];
      new MutationObserver(() => window.motionResults.push(node.dataset.result))
        .observe(node, {attributes: true, attributeFilter: ["data-result"]});
    });
    const before = await save.boundingBox();
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    assert.match(await save.evaluate(node => getComputedStyle(node).boxShadow), /2px.*inset/);
    assert.deepEqual(await save.boundingBox(), before);
    await page.mouse.move(before.x - 12, before.y - 12);
    await page.mouse.up();
    assert.equal(await result.getAttribute("data-result"), "idle");
    await save.click();
    assert.equal(await save.getAttribute("aria-busy"), "true");
    await page.keyboard.press("Enter");
    await result.locator('xpath=self::*[@data-result="success"]').waitFor();
    await action.getByRole("button", {name: "Saved", exact: true}).waitFor();
    states.push(...await result.evaluate(() => window.motionResults));
    assert.deepEqual(states, ["pending", "success"]);
    await action.getByRole("combobox").selectOption("failure");
    await save.click();
    await result.locator('xpath=self::*[@data-result="failure"]').waitFor();
    await action.getByRole("button", {name: "Try again", exact: true}).waitFor();
    assert.deepEqual(await save.boundingBox(), before);

    const select = candidate("Select").getByRole("combobox", {name: "Workspace"});
    await select.evaluate(node => node.scrollIntoView({block: "center"}));
    await select.click();
    assert(await select.evaluate(node => node.matches(":open")));
    assert.equal(await select.evaluate(node => getComputedStyle(node, "::picker(select)").opacity), "1");
    await page.keyboard.press("Escape");
    assert(await select.evaluate(node => document.activeElement === node && !node.matches(":open")));
    await select.click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal(await select.inputValue(), "workshop");
    assert(await select.evaluate(node => document.activeElement === node && !node.matches(":open")));
    await page.setViewportSize({width: 1200, height: 520});
    await select.evaluate(node => {
      const top = node.getBoundingClientRect().top;
      window.scrollTo(0, window.scrollY + top - window.innerHeight + 50);
    });
    await select.click();
    assert(await select.evaluate(node => node.getBoundingClientRect().bottom > innerHeight - 80 && node.matches(":open")));
    await page.keyboard.press("Escape");
    await page.setViewportSize({width: 1200, height: 900});

    const segmented = candidate("Segmented control");
    const marker = segmented.locator(".yg-selection-marker");
    const start = await translations(marker);
    await segmented.locator("[data-segment-result]").evaluate(node => {
      window.motionSelections = [];
      new MutationObserver(() => window.motionSelections.push(node.dataset.segmentResult))
        .observe(node, {attributes: true, attributeFilter: ["data-segment-result"]});
    });
    await page.getByRole("button", {name: "Replay a quick reversal"}).click();
    await segmented.locator('[data-segment-result="activity"]').waitFor();
    assert.deepEqual(await page.evaluate(() => window.motionSelections), ["files", "activity"]);
    assert.equal(await segmented.locator('.yg-segment button[data-state="on"]').textContent(), "Activity");
    await marker.evaluate(async node => {
      await new Promise(requestAnimationFrame);
      await Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {})));
    });
    assert.notEqual(await translations(marker), start);
    assert(await marker.evaluate(node => Math.abs(node.getBoundingClientRect().left -
      node.parentElement.querySelector('[data-state="on"]').getBoundingClientRect().left) < 1));

    const carousel = candidate("Carousel");
    const viewport = carousel.locator(".yg-carousel-viewport");
    const strip = carousel.locator(".yg-carousel-strip");
    await viewport.scrollIntoViewIfNeeded();
    const box = await viewport.boundingBox();
    const nav = await carousel.locator(".yg-carousel-nav").boundingBox();
    assert(Math.abs(nav.x + nav.width / 2 - (box.x + box.width / 2)) < 1);
    const center = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    const rest = await stripLeft(strip);
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x - 100, center.y, {steps: 5});
    assert(Math.abs(await stripLeft(strip) - rest + 100) < 1);
    await page.mouse.move(center.x - 22, center.y, {steps: 4});
    assert(Math.abs(await stripLeft(strip) - rest + 22) < 1);
    await page.mouse.up();
    assert.equal(await carousel.locator('[aria-live]').textContent(), "Brief · 1 / 3");

    const next = carousel.getByRole("button", {name: "Next slide"});
    await next.focus();
    await page.keyboard.press("Enter");
    assert.equal(await carousel.locator('[aria-live]').textContent(), "Draft · 2 / 3");
    assert(await next.evaluate(node => node === document.activeElement));
    assert.equal(await carousel.getByRole("heading", {name: "Review the brief"}).count(), 0);

    const narrow = await browser.newPage({
      viewport: {width: 360, height: 700}, hasTouch: true,
      colorScheme: "dark", reducedMotion: "reduce",
    });
    narrow.setDefaultTimeout(6000);
    narrow.on("pageerror", problem => problems.push(problem.message));
    await narrow.goto(url);
    const narrowStrip = narrow.locator('[data-motion-candidate] .yg-carousel-strip');
    await narrowStrip.waitFor();
    assert.equal(await narrowStrip.evaluate(node => getComputedStyle(node).transitionProperty), "none");
    assert(await narrow.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const touch = await narrow.context().newCDPSession(narrow);
    const touchViewport = narrow.locator(".yg-carousel-viewport");
    await touchViewport.scrollIntoViewIfNeeded();
    const t = await touchViewport.boundingBox();
    const touchNav = await narrow.locator('[data-motion-candidate] .yg-carousel-nav').boundingBox();
    assert(Math.abs(touchNav.x + touchNav.width / 2 - (t.x + t.width / 2)) < 1);
    const x = Math.round(t.x + t.width / 2);
    const y = Math.round(t.y + t.height / 2);
    await touch.send("Input.dispatchTouchEvent", {type: "touchStart", touchPoints: [{x, y}]});
    await touch.send("Input.dispatchTouchEvent", {type: "touchMove", touchPoints: [{x: x - 95, y}]});
    await narrowStrip.locator('xpath=self::*[@data-dragging]').waitFor();
    await touch.send("Input.dispatchTouchEvent", {type: "touchCancel", touchPoints: []});
    assert.equal(await narrowStrip.getAttribute("data-dragging"), null);
    const count = narrow.locator('[data-motion-candidate] .yg-carousel [aria-live]');
    assert.equal(await count.textContent(), "Brief · 1 / 3");
    await touch.send("Input.dispatchTouchEvent", {type: "touchStart", touchPoints: [{x, y}]});
    await touch.send("Input.dispatchTouchEvent", {type: "touchMove", touchPoints: [{x: x - 95, y}]});
    await narrowStrip.locator('xpath=self::*[@data-dragging]').waitFor();
    await touch.send("Input.dispatchTouchEvent", {type: "touchEnd", touchPoints: []});
    await narrow.getByRole("group", {name: "Candidate", exact: true})
      .getByText("Draft · 2 / 3", {exact: true}).waitFor();
    await narrow.evaluate(() => window.scrollTo(0, 0));
    if (output) await narrow.screenshot({path: join(output, "yogurt-motion-comparison-dark.png"), fullPage: true});
    assert.deepEqual(problems, []);
    await page.close();
    if (recording && output) await page.video().saveAs(join(output, "yogurt-motion-rehearsal.webm"));
    console.log("Motion comparison passed in Chrome " + browser.version() + " at 1200 and 360 px.");
  } finally {
    await browser.close();
  }
})().catch(problem => {
  console.error(problem);
  process.exitCode = 1;
});
