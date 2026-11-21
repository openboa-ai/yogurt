const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");

const base = process.env.YOGURT_GUIDE_URL ?? "http://127.0.0.1:5273";
const destinations = [
  ["Design system", "/system", "Design system"],
  ["Components", "/components", "Button"],
  ["Design sources", "/library", "Design sources"],
  ["Project use", "/adoption", "Use yogurt in a project"],
  ["Brand", "/", "Yogurt"],
];

async function checkGuide(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: "light" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const heading = name => page.getByRole("heading", { name, level: 1, exact: true });
  const nav = page.getByRole("navigation", { name: "Yogurt guide" });
  const openMenu = page.getByRole("button", { name: "Open menu" });
  const mobile = width < 832;
  page.setDefaultTimeout(8000);
  try {
    await page.goto(base);
    await heading("Yogurt").waitFor();
    assert.equal(await page.locator("link[rel=icon]").getAttribute("href"), "/assets/projects/yogurt.svg");
    await page.locator(".yg-page-header-subtitle").filter({ hasText: /^ships with live cultures$/ }).waitFor();
    await page.getByText(/^Yogurt is OpenBoa’s design system and UI SDK/).waitFor();
    await page.getByText("Every limit has a shelf life.", { exact: true }).waitFor();
    const primaryActions = page.getByRole("group", { name: "Explore Yogurt" });
    assert.deepEqual(await primaryActions.getByRole("link").allTextContents(), ["Explore the design system", "Browse components"]);
    assert.deepEqual(await primaryActions.locator("[data-emphasis]").evaluateAll(links => links.map(link => link.dataset.emphasis)), ["soft", "filled"]);
    const [logo, intro] = await Promise.all([
      page.locator(".guide-identity").boundingBox(),
      heading("Yogurt").locator("..").boundingBox(),
    ]);
    assert(Math.abs(logo.x - intro.x) < 1, "the brand and page share a reading edge");
    await page.locator(".guide-masthead").evaluate(element => { element.dataset.checkPersistence = "yes"; });

    const titleSizes = [];
    for (const [label, path, title] of destinations) {
      if (mobile) await openMenu.click();
      await nav.getByRole("link", { name: label, exact: true }).click();
      await heading(title).waitFor();
      assert.equal(await page.locator(".guide-content > :is(.catalog, .guide-editorial) .yg-page-header").first().getByRole("heading", { level: 1 }).count(), 1);
      if (label !== "Brand") titleSizes.push(await heading(title).evaluate(el => getComputedStyle(el).fontSize));
      assert.equal(new URL(page.url()).pathname, path);
      assert.equal(await page.locator(".guide-masthead").getAttribute("data-check-persistence"), "yes");
      assert.equal(await page.locator(".guide-masthead .yg-nav-list [aria-current=page]").innerText(), label);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, path);
    }

    assert.equal(new Set(titleSizes).size, 1, "ordinary screen titles share the same type size");
    assert.equal(await page.locator(".guide-masthead .yg-nav-list a:is([href='/motion'], [href='/workflows'])").count(), 0);
    await page.goBack();
    await heading("Use yogurt in a project").waitFor();
    await page.goForward();
    await heading("Yogurt").waitFor();
    assert.equal(await page.locator(".guide-masthead").getAttribute("data-check-persistence"), "yes");
    await page.getByRole("button", { name: "Use dark appearance" }).click();
    await page.getByRole("link", { name: "Browse components", exact: true }).click();
    await heading("Button").waitFor();
    assert.equal(await page.locator(".catalog").getAttribute("data-appearance"), "dark");
    await page.reload();
    await heading("Button").waitFor();
    assert.equal(await page.locator(".guide-shell").getAttribute("data-appearance"), "dark");

    await page.goto(base + "/components.html#input-otp");
    await heading("InputOTP").waitFor();
    assert.equal(new URL(page.url()).pathname, "/components/input-otp");
    await page.goto(base + "/motion-patterns.html#plan-switch");
    await heading("PlanSwitch").waitFor();
    assert.equal(new URL(page.url()).pathname, "/components/motion-plan-switch");
    const plan = page.locator(".specimen").getByRole("radiogroup", { name: "Plan" });
    const studio = plan.getByRole("radio", { name: /Studio/ });
    await studio.check();
    assert.equal(await studio.isChecked(), true);
    await page.getByRole("button", { name: "Use in a project" }).click();
    await page.getByText('import { PlanSwitch } from "@openboa/yogurt/motion-patterns";', { exact: true }).waitFor();
    await page.goto(base + "/motion/unrecognized");
    await heading("Button").waitFor();
    assert.equal(new URL(page.url()).pathname, "/components");
    await page.goto(base + "/workflows#records");
    await heading("Product playbook").waitFor();
    assert.equal(new URL(page.url()).pathname, "/playbook");
    await page.goto(base + "/system#color");
    await page.locator("#swatches button").first().waitFor();
    await page.locator("#hue").selectOption("orange");
    assert.match(await page.locator("#color-name").innerText(), /^orange\./);
    await page.goto(base + "/emoji.html?emoji=1f60a");
    await page.locator("#emoji-name").filter({ hasText: /Smiling Face/i }).waitFor();
    await page.goto(base + "/playbook?project=sourdough");
    await page.locator("#pb-project option").first().waitFor({ state: "attached" });
    assert.equal(await page.locator("#pb-project").inputValue(), "sourdough");
    await page.goto(base + "/agents");
    await page.getByRole("button", { name: "Play sequence" }).click();
    await page.getByRole("button", { name: "Stop sequence" }).waitFor();
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await Promise.all([checkGuide(browser, 320), checkGuide(browser, 1440)]);
    console.log("Guide shell passed at 320px and 1440px.");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
