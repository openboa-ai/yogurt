const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const components = require("../catalog/components.json");
const motionComponents = require("../catalog/motion-components.json").components;
const componentPaths = new Set([...components, ...motionComponents].map(item => "/components/" + item.id));

const origin = process.env.YOGURT_GUIDE_URL ?? "http://127.0.0.1:5273";

async function checkGallery(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width >= 1000 ? "light" : "dark" });
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(origin + "/templates");
    await page.getByRole("heading", { name: "Templates", exact: true }).waitFor();
    const boardSizes = await page.locator("[data-template-board]").evaluateAll(boards => boards.map(board => board.querySelectorAll("[data-template-specimen]").length));
    assert.deepEqual(boardSizes, [33, 31]);
    const cards = await page.locator("[data-template-specimen]").evaluateAll(items => items.map(item => ({
      id: item.id,
      hasContent: Boolean(item.querySelector(":scope > :not(.yg-heading)")),
      title: item.getAttribute("aria-label"),
    })));
    assert.equal(new Set(cards.map(card => card.id)).size, 64);
    assert(cards.every(card => card.hasContent && card.title));
    assert.equal(await page.locator("main a[href^='/templates/']").count(), 0);
    assert.equal(await page.getByRole("combobox", { name: "Example", exact: true }).count(), 0);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "gallery overflows horizontally");
    const columns = await page.locator(".template-gallery-board").first().evaluate(board => new Set([...board.children].map(card => Math.round(card.getBoundingClientRect().x))).size);
    assert(width >= 1000 ? columns > 1 : columns === 1);

    const inlineInvite = page.locator("#invite");
    await inlineInvite.getByRole("textbox", { name: "Work email" }).fill("alex@example.test");
    await inlineInvite.getByRole("button", { name: "Send invitation" }).click();
    await inlineInvite.getByText("Invitation prepared.").waitFor();
    assert.equal(await page.locator("#no-members").getByText("Invitation prepared.").count(), 0);
    const loading = page.locator("#loading-card");
    await loading.getByRole("button", { name: "Reload workspace" }).click();
    await loading.getByText("Workspace ready.").waitFor();
    await page.locator("#not-found").scrollIntoViewIfNeeded();
    assert.equal(new URL(page.url()).pathname, "/templates");

    const stage = page.locator(".template-stage");
    await page.goto(origin + "/templates/invite");
    await stage.getByRole("textbox", { name: "Work email" }).fill("alex@example.test");
    await stage.getByRole("combobox", { name: "Access" }).selectOption("Viewer");
    await stage.getByRole("button", { name: "Send invitation" }).click();
    await stage.getByText("Invitation prepared.").waitFor();
    await page.getByRole("button", { name: "Reset preview" }).click();
    assert.equal(await stage.getByRole("textbox", { name: "Work email" }).inputValue(), "");

    const documented = await page.locator(".template-component-links a").evaluateAll(links => links.map(link => link.pathname));
    assert(documented.length > 0 && documented.every(path => componentPaths.has(path)), "missing component page");

    await page.goto(origin + "/templates/faq");
    await stage.getByRole("button", { name: "Who can see my drafts?" }).focus();
    await page.keyboard.press("Enter");
    await stage.getByText("Drafts stay private until you share them with the workspace.").waitFor();

    await page.goto(origin + "/templates/access");
    await stage.getByRole("textbox", { name: "Verification code" }).fill("123456");
    await stage.getByText("Sample access verified.").waitFor();

    await page.goto(origin + "/templates/compose");
    await stage.getByRole("combobox", { name: "Density" }).selectOption("compact");
    await stage.locator('.yg-card[data-density="compact"]').waitFor();
    await stage.getByRole("combobox", { name: "Surface" }).selectOption("paper");
    assert.equal(await stage.locator(".template-composition-canvas").getAttribute("data-material"), "paper");
    await stage.getByRole("combobox", { name: "Task" }).selectOption("settings");
    await stage.getByRole("switch", { name: "Review reminders" }).click();
    await stage.getByRole("button", { name: "Save preferences" }).click();
    await stage.getByText("Preferences saved", { exact: true }).waitFor();
    await stage.getByText(/density="compact"/).waitFor();
    await page.getByRole("button", { name: "Reset preview" }).click();
    await stage.locator('.yg-card[data-density="regular"]').waitFor();

    await page.goto(origin + "/templates/type");
    await stage.getByRole("combobox", { name: "Content" }).selectOption("conversation");
    await stage.getByRole("heading", { name: "Review notes" }).waitFor();

    await page.goto(origin + "/templates/chart");
    await stage.getByRole("radio", { name: "Missing readings", exact: true }).click();
    await stage.getByText("The source has no reading for Tue.").waitFor();

    await page.goto(origin + "/templates/nested-panes");
    if (width < 630) await stage.getByRole("button", { name: "Toggle projects" }).click();
    await stage.getByRole("button", { name: "Operations", exact: true }).click();
    if (width < 810) await stage.getByRole("button", { name: "Toggle documents" }).click();
    await stage.getByRole("button", { name: "Archive", exact: true }).click();
    await stage.getByRole("heading", { name: "Archive", exact: true }).waitFor();

    await page.goto(origin + "/templates/signup-split");
    await stage.getByRole("button", { name: "Create account" }).click();
    await stage.getByText("Enter a valid email address.").waitFor();
    await stage.getByRole("textbox", { name: "Name", exact: true }).fill("Alex");
    await stage.getByRole("textbox", { name: "Work email" }).fill("alex@example.test");
    await stage.getByLabel("Password").fill("sample-value");
    await stage.getByRole("button", { name: "Create account" }).click();
    await stage.getByText("Preview complete").waitFor();
    assert.equal(await stage.getByLabel("Password").count(), 0);

    await page.goto(origin + "/templates/release-dashboard");
    await stage.getByRole("searchbox", { name: "Find a release" }).fill("2.4");
    await stage.getByRole("cell", { name: "Workspace 2.4" }).waitFor();
    assert.equal(await stage.getByRole("cell", { name: "Workspace 2.3" }).count(), 0);

    await page.goto(origin + "/templates/files");
    await page.getByRole("heading", { name: "File tree", exact: true }).waitFor();

    await page.goto(origin + "/templates/dialog");
    const picker = stage.getByRole("button", { name: "Find a destination" });
    await picker.click();
    await stage.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await picker.evaluate(element => element === document.activeElement), true);

    await page.goto(origin + "/examples/sourdough");
    await stage.getByText("Two observations need review.", { exact: true }).waitFor({ state: width >= 840 ? "visible" : "attached" });
    await stage.getByRole("button", { name: "Computer", exact: true }).click();
    await stage.getByText("18 of 20 observations", { exact: true }).waitFor();
    await stage.getByRole("button", { name: "Close computer", exact: true }).click();
    await stage.getByRole("button", { name: "Mark reviewed" }).click();
    await stage.getByText("Review recorded", { exact: true }).waitFor();
    await stage.getByRole("textbox", { name: "Message Kai" }).fill("Check the research register.");
    await stage.getByRole("button", { name: "Send", exact: true }).click();
    await stage.getByText(/Sample response:/).waitFor();
    assert.deepEqual(errors, []);
    console.log(width + "px: 64 inline compositions, studies and workspace interactions passed.");
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await Promise.all([checkGallery(browser, 1440), checkGallery(browser, 390)]);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
