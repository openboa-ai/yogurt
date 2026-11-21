const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: width === 320 ? "dark" : "light",
        hasTouch: width === 320,
      });
      try {
        await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#keypad");
        const root = page.locator('.specimen[data-component="keypad"]');
        const group = root.getByRole("group", { name: "Local entry" });
        const layout = root.getByLabel("Layout");
        const one = group.getByRole("button", { name: "1", exact: true });
        await one.waitFor();

        if (width === 320) await one.tap();
        else await one.click();
        await root.getByText("•", { exact: true }).waitFor();
        await one.focus();
        await page.keyboard.press("Enter");
        await root.getByText("••", { exact: true }).waitFor();
        await group.getByRole("button", { name: "Delete", exact: true }).click();
        await root.getByText("•", { exact: true }).waitFor();
        await group.getByRole("button", { name: "Done", exact: true }).click();
        await root.getByText("Entry accepted", { exact: true }).waitFor();

        await layout.selectOption("alphabet");
        const letter = group.getByRole("button", { name: "q", exact: true });
        await letter.click();
        await root.getByText("•", { exact: true }).waitFor();
        await group.getByRole("button", { name: "Shift", exact: true }).click();
        await group.getByRole("button", { name: "Q", exact: true }).click();
        await root.getByText("••", { exact: true }).waitFor();

        await layout.selectOption("private");
        await group.getByRole("button", { name: "1", exact: true }).waitFor();
        const privateKey = group.getByRole("button", { name: "A", exact: true });
        await privateKey.click();
        await root.getByText("•", { exact: true }).waitFor();

        // The gallery has no disabled prop control. This checks native disabled
        // behavior and styling, not React prop wiring in an installed consumer.
        await privateKey.evaluate(node => { node.disabled = true; });
        assert.equal(await privateKey.isDisabled(), true);
        const disabledOpacity = await privateKey.evaluate(node => getComputedStyle(node).opacity);
        assert.equal(disabledOpacity, "0.55");
        await privateKey.focus();
        await page.keyboard.press("Enter");
        assert.equal(await root.getByText("•", { exact: true }).count(), 1);

        await page.emulateMedia({ reducedMotion: "reduce" });
        const enabledKey = group.getByRole("button", { name: "B", exact: true });
        assert.equal(await enabledKey.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
        await page.emulateMedia({ forcedColors: "active" });
        assert.equal(await page.evaluate(() => matchMedia("(forced-colors: active)").matches), true);
        const outline = await enabledKey.evaluate(node => getComputedStyle(node).outlineStyle);
        assert.notEqual(outline, "none");
        await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference" });
        const bounds = await group.boundingBox();
        assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width, "keypad fits the viewport");
      } finally { await page.close(); }
    }
    console.log("Keypad gallery behavior, native disabled styling and media states checked at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
