const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#text-field");
      const section = page.locator(".variation .specimen");
      for (const [label, height] of Object.entries({ Compact: 30, Regular: 36, Comfortable: 40, Spacious: 48, Touch: 44 })) {
        const input = section.getByRole("textbox", { name: label, exact: true });
        await input.waitFor();
        const wrapper = input.locator("xpath=..");
        assert.equal(Math.round((await wrapper.boundingBox()).height), height, label);
        await input.fill(label);
        assert.equal(await input.inputValue(), label);
      }
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#input-group");
      const groups = page.locator(".variation .specimen");
      for (const [label, height] of Object.entries({ Compact: 30, Regular: 36, Comfortable: 40, Spacious: 48, Touch: 44, Featured: 52 })) {
        const input = groups.getByRole("textbox", { name: label, exact: true });
        await input.waitFor();
        const wrapper = input.locator("xpath=..");
        assert.equal(Math.round((await wrapper.boundingBox()).height), height, label);
        await input.fill("docs");
        assert.equal(await input.inputValue(), "docs");
      }
      const featured = groups.getByRole("textbox", {name:"Featured"}).locator("xpath=..");
      assert.equal(await featured.evaluate(node => getComputedStyle(node).borderTopLeftRadius), "20px");
      await page.emulateMedia({reducedMotion:"reduce"});
      assert.equal(await featured.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
      await page.emulateMedia({reducedMotion:"no-preference"});
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#search-field");
      const searches = page.locator(".variation .specimen");
      for (const [label, height] of Object.entries({ Compact: 30, Regular: 36, Comfortable: 40, Spacious: 48, Touch: 44 })) {
        const input = searches.getByRole("searchbox", { name: label, exact: true });
        await input.waitFor();
        assert.equal(Math.round((await input.locator("xpath=..").boundingBox()).height), height, label);
        await input.fill(label);
        assert.equal(await input.inputValue(), label);
        const clear = searches.getByRole("button", { name: "Clear " + label.toLowerCase() });
        await clear.click();
        assert.equal(await input.inputValue(), "");
      }
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#select");
      const selects = page.locator(".variation .specimen");
      for (const [label, height] of Object.entries({ Compact: 30, Regular: 36, Comfortable: 40, Spacious: 48, Touch: 44 })) {
        const input = selects.getByRole("combobox", { name: label, exact: true });
        await input.waitFor();
        assert.equal(Math.round((await input.locator("xpath=..").boundingBox()).height), height, label);
        await input.selectOption("yogurt");
        assert.equal(await input.inputValue(), "yogurt");
      }
      const multiple = selects.getByRole("listbox", { name: "Multiple choice" });
      assert.equal(await multiple.getAttribute("size"), "3");
      assert.equal(await multiple.getAttribute("multiple"), "");
      await multiple.selectOption(["sourdough", "yogurt"]);
      assert.deepEqual(await multiple.evaluate(el => Array.from(el.selectedOptions, o => o.value)), ["sourdough", "yogurt"]);
      await page.close();
    }
    console.log("Text, input-group, search and select sizes verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
