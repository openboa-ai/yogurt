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
      for (const [label, height] of Object.entries({ Compact: 28, Regular: 32, Comfortable: 36, Spacious: 44, Touch: 44 })) {
        const input = section.getByRole("textbox", { name: label, exact: true });
        await input.waitFor();
        const wrapper = input.locator("xpath=..");
        assert.equal(Math.round((await wrapper.boundingBox()).height), height, label);
        await input.fill(label);
        assert.equal(await input.inputValue(), label);
      }
      await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#search-field");
      const searches = page.locator(".variation .specimen");
      for (const [label, height] of Object.entries({ Compact: 28, Regular: 32, Comfortable: 36, Spacious: 44, Touch: 44 })) {
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
      for (const [label, height] of Object.entries({ Compact: 28, Regular: 32, Comfortable: 36, Spacious: 44, Touch: 44 })) {
        const trigger = selects.getByRole("combobox", { name: label, exact: true });
        await trigger.waitFor();
        assert.equal(Math.round((await trigger.boundingBox()).height), height, label);
        await trigger.click();
        const popup = page.locator(".yg-select-popup[data-open]");
        await popup.waitFor();
        await popup.getByRole("option", { name: "Yogurt", exact: true }).click();
        await popup.waitFor({ state: "hidden" });
        assert.match(await trigger.innerText(), /Yogurt/);
      }
      await page.close();
    }
    console.log("Text, search and select sizes verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
