const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const { resolve, join } = require("node:path");
const { pathToFileURL } = require("node:url");

const gallery = pathToFileURL(resolve(__dirname, "../components.html")).href;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    async function open(id) {
      await page.goto(gallery + "#" + id);
      const view = page.locator('.specimen[data-component="' + id + '"]');
      await view.waitFor();
      return view;
    }
    const capture = process.env.YOGURT_CAPTURE_DIR;
    let root = await open("sidebar-layout");
    const layout = root.locator(".yg-sidebar-layout");
    const panel = root.locator(".yg-sidebar-panel");
    const main = root.locator(".yg-sidebar-main");
    await root.getByRole("button", { name: "Collapse navigation" }).press("Enter");
    assert.equal(await layout.getAttribute("data-panel"), "rail");
    assert.equal(await root.getByRole("button", { name: "Overview", exact: true }).getAttribute("aria-current"), "page");
    assert.equal(await root.getByRole("button", { name: "Review queue" }).count(), 0);
    await root.getByRole("button", { name: "Work" }).click();
    assert.equal(await layout.getAttribute("data-panel"), "full");
    await root.getByRole("button", { name: "Review queue" }).click();
    await root.getByRole("heading", { name: "Review queue", exact: true }).waitFor();
    assert.equal(await root.getByRole("button", { name: "Review queue" }).getAttribute("aria-current"), "page");
    await root.getByText("End", { exact: true }).click();
    const panelBounds = await panel.boundingBox();
    const mainBounds = await main.boundingBox();
    assert(panelBounds.x >= mainBounds.x + mainBounds.width);
    await root.getByRole("button", { name: "Collapse navigation" }).click();
    await page.setViewportSize({ width: 390, height: 820 });
    const collapsed = root.getByRole("button", { name: "Expand navigation" });
    await collapsed.click();
    const rightDrawer = root.getByRole("dialog", { name: "Project navigation", exact: true });
    await rightDrawer.waitFor();
    await rightDrawer.evaluate((element) => Promise.all(element.getAnimations().map((motion) => motion.finished)));
    const drawerBounds = await rightDrawer.boundingBox();
    assert.equal(drawerBounds.x + drawerBounds.width, 390);
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1280, height: 850 });
    await panel.waitFor();
    assert.equal(await layout.getAttribute("data-panel"), "rail");

    root = await open("project-sidebar");
    if (capture) await root.screenshot({ path: join(capture, "project-sidebar-light.png") });
    const search = root.getByRole("searchbox", { name: "Find a view" });
    await search.fill("missing");
    await root.getByText("No matching views.", { exact: true }).waitFor();
    await root.getByRole("button", { name: "Clear find a view" }).click();
    await root.getByRole("button", { name: "Run history", exact: true }).click();
    await root.getByRole("heading", { name: "Run history", exact: true }).waitFor();
    await root.getByRole("button", { name: "Add project view" }).click();
    await root.getByText("New view opened in this preview.", { exact: true }).waitFor();

    root = await open("sidebar");
    await root.getByRole("button", { name: "Collapse navigation" }).click();
    assert.equal(await root.getByRole("button", { name: "Expand navigation" }).getAttribute("aria-expanded"), "false");

    await page.setViewportSize({ width: 390, height: 820 });
    await page.emulateMedia({ colorScheme: "dark" });
    root = await open("agent-sidebar");
    const darkAppearance = page.getByRole("button", { name: "Use dark appearance" });
    if (await darkAppearance.isVisible()) await darkAppearance.click();
    const trigger = root.getByRole("button", { name: "Expand navigation" });
    await trigger.click();
    const drawer = root.getByRole("dialog", { name: "Agents", exact: true });
    await drawer.waitFor();
    assert(await drawer.evaluate((element) => element.matches(":modal")));
    await page.keyboard.press("Tab");
    assert(await drawer.evaluate((element) => element.contains(document.activeElement)));
    if (capture) await page.screenshot({ path: join(capture, "agent-sidebar-dark.png") });
    await page.keyboard.press("Escape");
    assert.equal(await drawer.count(), 0);
    assert(await trigger.evaluate((element) => element === document.activeElement));
    await trigger.click();
    const bounds = await drawer.boundingBox();
    await page.mouse.click(bounds.x + bounds.width + 12, bounds.y + 48);
    assert.equal(await drawer.count(), 0);
    await trigger.click();
    await drawer.getByRole("button", { name: "Sol", exact: true }).click();
    assert.equal(await drawer.count(), 0);
    await root.getByRole("heading", { name: "Sol", exact: true }).waitFor();
    assert.deepEqual(errors, []);

    await page.close();
    console.log(JSON.stringify({ desktop: ["rail", "active destination", "end edge", "search", "old props"],
      narrow: ["modal focus", "Escape", "backdrop", "destination"], pageErrors: errors }));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
