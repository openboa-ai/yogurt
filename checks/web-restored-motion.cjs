const assert = require("node:assert/strict");
const fs = require("node:fs");
const { resolve, join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

const origin = process.env.YOGURT_GUIDE_URL;
const capture = process.env.YOGURT_CAPTURE_DIR;

async function openSpecimen(page, id) {
  const standalone = pathToFileURL(resolve(__dirname, "../apps/guide/generated/components.html"));
  await page.goto(origin ? new URL("/components/" + id, origin).href : standalone.href + "#" + id);
  const root = page.locator(`.specimen[data-component="${id}"]`);
  await root.waitFor({ state: "visible" });
  return root;
}

async function openMotionSpecimen(page, id, example) {
  if (origin) {
    const url = new URL("/components/" + id, origin);
    if (!id.startsWith("motion-")) url.searchParams.set("preview", example);
    await page.goto(url.href);
    return page.locator(`.specimen[data-component="${id}"]`);
  }
  const gallery = pathToFileURL(resolve(__dirname, "../apps/guide/generated/motion-patterns.html"));
  await page.goto(gallery.href + "#" + example);
  return page.locator(".motion-pattern-article");
}

async function sampleTween(locator, property) {
  return locator.evaluate(async (node, prop) => {
    const physical = { "block-size": "height", "inline-size": "width" }[prop];
    const find = () => node.getAnimations().find(animation => [prop, physical].includes(animation.transitionProperty) &&
      typeof animation.transitionProperty === "string");
    for (let i = 0; i < 6 && !find(); i++) await new Promise(requestAnimationFrame);
    const animation = find();
    if (!animation) return null;
    animation.pause();
    await animation.ready;
    const duration = animation.effect.getTiming().duration;
    const samples = [0, 0.22, 1].map(fraction => {
      animation.currentTime = duration * fraction;
      return getComputedStyle(node).getPropertyValue(prop);
    });
    animation.currentTime = duration * .22;
    return { duration, samples, property: animation.transitionProperty };
  }, property);
}

async function verifyTween(root, selector, property, reduced, id) {
  const node = root.locator(selector).first();
  const result = await sampleTween(node, property);
  if (reduced) {
    assert.equal(result, null, `${id} must settle immediately in reduced motion`);
  } else {
    assert(result && result.duration > 0, `${id} should play a ${property} transition`);
    assert.equal(new Set(result.samples).size, 3, `${id} must have a distinct intermediate frame`);
    if (capture) await root.screenshot({ path: join(capture, `${id}-intermediate.png`) });
    await node.evaluate((el, prop) => {
      el.getAnimations().find(animation => animation.transitionProperty === prop)?.finish();
    }, result.property);
  }
}

(async () => {
  if (capture) fs.mkdirSync(capture, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const [width, reduced] of [[1440, false], [390, true]]) {
      const page = await browser.newPage({ viewport: { width, height: 900 },
        reducedMotion: reduced ? "reduce" : "no-preference" });
      let root = await openSpecimen(page, "switch");
      const toggle = root.getByRole("switch", { name: "Record dates" });
      const startingValue = await toggle.getAttribute("aria-checked");
      await toggle.press("Space");
      assert.notEqual(await toggle.getAttribute("aria-checked"), startingValue);
      await verifyTween(root, "[role=switch] > span", "transform", reduced, "switch");
      await toggle.press("Space");
      await toggle.press("Space");
      assert.notEqual(await toggle.getAttribute("aria-checked"), startingValue);

      root = await openSpecimen(page, "checkbox");
      await root.getByRole("checkbox", { name: "Include archived views" }).press("Space");
      await verifyTween(root, ".yg-checkbox-check", "stroke-dashoffset", reduced, "checkbox");

      root = await openSpecimen(page, "accordion");
      const accordion = root.getByRole("button", { name: "Who can open this view?" });
      await accordion.press("Enter");
      assert.equal(await accordion.getAttribute("aria-expanded"), "true");
      await verifyTween(root, ".yg-accordion-content", "height", reduced, "accordion");
      await accordion.press("Enter");
      assert.equal(await accordion.getAttribute("aria-expanded"), "false");

      root = await openSpecimen(page, "disclosure-row");
      const disclosure = root.locator("details");
      const heights = await disclosure.evaluate(async node => {
        if (!CSS.supports("interpolate-size: allow-keywords")) return null;
        const height = () => parseFloat(getComputedStyle(node, "::details-content").blockSize);
        const start = height();
        node.querySelector("summary").click();
        const opening = [];
        for (let i = 0; i < 5; i++) {
          await new Promise(requestAnimationFrame);
          opening.push(height());
        }
        const expanded = node.querySelector(":scope > div").getBoundingClientRect().height;
        return { start, opening, expanded, open: node.open };
      });
      assert(heights?.open && heights.start === 0 && heights.expanded > 0);
      if (reduced) {
        assert(heights.opening.every(height => height >= heights.expanded));
      } else {
        assert(heights.opening.some(height => height > 0 && height < heights.expanded));
      }

      root = await openSpecimen(page, "progress");
      await root.getByRole("button", { name: "Review next record" }).click();
      await verifyTween(root, ".yg-progress-track > span", "transform", reduced, "progress");

      for (const id of ["dialog", "sheet"]) {
        root = await openSpecimen(page, id);
        const trigger = root.getByRole("button", { name: "Edit view" });
        await trigger.click();
        await verifyTween(root, "dialog", "translate", reduced, id);
        await root.locator("dialog").evaluate(node =>
          Promise.allSettled(node.getAnimations().map(animation => animation.finished)));
        await page.keyboard.press("Escape");
        assert.equal(await root.locator("dialog").evaluate(node => node.open), false);
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
        await verifyTween(root, "dialog", "opacity", reduced, id + "-exit");
        await root.locator("dialog").waitFor({ state: "hidden" });
      }

      root = await openSpecimen(page, "action-menu");
      const menu = root.getByRole("button", { name: "View actions" });
      await menu.press("Enter");
      await verifyTween(root, ".yg-popup-menu", "opacity", reduced, "action-menu");
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.equal(await menu.evaluate(node => node === document.activeElement), true);
      assert.equal(await root.getByRole("menuitem").count(), 0);
      root = await openSpecimen(page, "button");
      const action = root.getByRole("button").first();
      await action.scrollIntoViewIfNeeded();
      const press = await action.boundingBox();
      await page.mouse.move(press.x + press.width / 2, press.y + press.height / 2);
      await page.mouse.down();
      try {
        await verifyTween(root, ".yg-button", "scale", reduced, "button-press");
      } finally {
        await page.mouse.up();
      }
      await root.getByRole("status").filter({ hasText: "View saved." }).waitFor();
      assert.equal(await action.evaluate(node => Number(getComputedStyle(node).scale) || 1), 1,
        "a released action settles to its original scale");

      root = await openMotionSpecimen(page, "command", "command-palette");
      const command = root.getByRole("button", { name: "Open command palette" });
      await command.click();
      const field = root.getByRole("combobox", { name: "Find a command" });
      await field.waitFor();
      await verifyTween(root, ".yg-inline-command", "block-size", reduced, "command-open");
      await field.press("Escape");
      assert.equal(await command.getAttribute("aria-expanded"), "false");
      assert.equal(await command.evaluate(node => node === document.activeElement), true);
      assert.equal(await root.locator(".yg-inline-command-panel").evaluate(node => node.inert), true);
      await verifyTween(root, ".yg-inline-command", "block-size", reduced, "command-close");

      root = await openMotionSpecimen(page, "motion-storage-meter", "storage-meter");
      await root.getByRole("button", { name: "Add files" }).click();
      await verifyTween(root, ".yg-storage-bar > span", "inline-size", reduced, "storage-fill");

      root = await openMotionSpecimen(page, "motion-letter-limit", "letter-limit");
      await root.getByRole("textbox", { name: "Short bio" }).fill("A note for the next review.");
      await verifyTween(root, ".yg-letter-meter > circle:last-child", "stroke-dashoffset", reduced, "letter-meter");

      await page.close();
    }
    console.log("Press, choice, disclosure, carousel, progress, layers, command, meters and reduced motion verified.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
