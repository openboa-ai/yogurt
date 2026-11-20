const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");
const gallery = pathToFileURL(resolve(__dirname, "../components.html")).href;
async function metrics(select) {
  return select.evaluate((el) => {
    const panel = getComputedStyle(el, "::picker(select)");
    const box = (n) =>
      Object.fromEntries(
        ["x", "y", "width", "height", "top", "bottom"].map((k) => [
          k,
          n.getBoundingClientRect()[k],
        ]),
      );
    const option = el.options[0];
    return {
      view: [innerWidth, innerHeight],
      value: el.value,
      opened: el.matches(":open"),
      field: box(el),
      first: box(option),
      last: box(el.options[el.length - 1]),
      appearance: panel.appearance,
      panelWidth: parseFloat(panel.width),
      height: parseFloat(panel.height),
      side: panel.positionArea,
      material: getComputedStyle(el).colorScheme,
      background: panel.backgroundColor,
      rowFont: getComputedStyle(option).fontSize,
      corner: panel.borderTopLeftRadius,
      gap: panel.marginBlockStart,
      rowPadding: getComputedStyle(option).paddingInlineStart,
      textInset: getComputedStyle(el).paddingInlineStart,
      check: getComputedStyle(el.selectedOptions[0], "::checkmark").order,
    };
  });
}
(async () => {
  const browser = await chromium.launch({
    channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome",
  });
  const seen = [],
    problems = [];
  try {
    for (const [theme, width, touch] of [
      ["light", 1120, false],
      ["dark", 1120, false],
      ["light", 320, true],
    ]) {
      const context = await browser.newContext({
        colorScheme: theme,
        viewport: { width, height: 800 },
        deviceScaleFactor: 2,
        hasTouch: touch,
        isMobile: touch,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => problems.push(String(e)));
      await page.goto(gallery + "#select");
      await page.evaluate(() => document.fonts.ready);
      const select = page.getByRole("combobox", { name: "Project" });
      if (touch) await select.tap();
      else await select.click();
      await page.waitForFunction(() =>
        document.querySelector(".specimen select")?.matches(":open"),
      );
      const m = await metrics(select);
      assert.equal(m.appearance, "base-select");
      assert.equal(m.corner, "12px");
      assert.equal(m.check, "1");
      assert.ok(Math.abs(m.field.width - m.panelWidth) < 1, JSON.stringify(m));
      assert.ok(m.first.height >= (touch ? 44 : 36));
      assert.ok(
        Math.abs(m.field.bottom + 8 - m.first.top) < 1 ||
          Math.abs(m.field.top - 8 - m.last.bottom) < 1,
        JSON.stringify(m),
      );
      const clip = {
        x: Math.max(0, Math.floor(m.field.x - 24)),
        y: Math.max(
          0,
          Math.floor(Math.min(m.field.top - 48, m.first.top - 24)),
        ),
        width: Math.min(width, m.field.width + 48),
        height: Math.ceil(
          Math.max(m.last.bottom, m.field.bottom) +
            32 -
            Math.max(
              0,
              Math.floor(Math.min(m.field.top - 48, m.first.top - 24)),
            ),
        ),
      };
      clip.width = Math.min(Math.ceil(clip.width), width - clip.x);
      await select.evaluate((el) =>
        Promise.all(
          el.parentElement
            .getAnimations({ subtree: true })
            .map((a) => a.finished),
        ),
      );
      if (process.env.YOGURT_CAPTURE_DIR)
        await page.screenshot({
          path: resolve(
            process.env.YOGURT_CAPTURE_DIR,
            "select-" + (touch ? "touch" : theme) + ".png",
          ),
          clip,
        });
      if (!touch) {
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Escape");
        assert.equal(await select.inputValue(), "sourdough");
        await select.focus();
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        assert.equal(await select.inputValue(), "meatball");
        await select.click();
        await page.getByRole("option", { name: "Yogurt", exact: true }).click();
        assert.equal(await select.inputValue(), "yogurt");
        for (const name of ["Paper", "Mist"]) {
          await page.getByRole("radio", { name, exact: true }).click();
          await select.click();
          const g = await metrics(select);
          seen.push([theme, name, g.background]);
          await page.keyboard.press("Escape");
        }
        await page.getByRole("button", { name: "Brand & tokens" }).click();
        const brand = page.getByRole("combobox", { name: "Appearance" });
        await brand.click();
        assert.equal((await metrics(brand)).appearance, "base-select");
        await page.getByRole("option", { name: "Dark", exact: true }).click();
        assert.match(
          await page.locator(".brand-role-grid").innerText(),
          /neutral\.975/,
        );
      } else {
        await page.getByRole("option", { name: "Yogurt", exact: true }).tap();
        assert.equal(await select.inputValue(), "yogurt");
      }
      seen.push(m);
      await context.close();
    }
    assert.deepEqual(problems, []);
    console.log(JSON.stringify({ browser: browser.version(), seen }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
