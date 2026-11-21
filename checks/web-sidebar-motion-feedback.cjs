const { chromium } = require("playwright-core");
const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");

const gallery = pathToFileURL(resolve(__dirname, "../apps/guide/generated/components.html")).href;

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(gallery + "#sidebar-layout");
    const root = page.locator('.specimen[data-component="sidebar-layout"]');
    const layout = root.locator(".yg-sidebar-layout");
    const panel = layout.locator(".yg-sidebar-panel");
    const submenuButton = panel.getByRole("button", { name: "Work", exact: true });
    const submenu = panel.locator(".yg-sidebar-submenu-content");
    await submenuButton.waitFor();
    assert.equal(await submenuButton.getAttribute("aria-expanded"), "true");
    await submenuButton.click();
    assert.equal(await submenuButton.getAttribute("aria-expanded"), "false");
    assert.equal(await submenu.getAttribute("aria-hidden"), "true");
    assert.equal(await submenu.evaluate(node => node.inert), true);
    assert.equal(await submenu.evaluate(node => getComputedStyle(node).transitionProperty.includes("grid-template-rows")), true);
    await submenuButton.press("Enter");
    assert.equal(await submenuButton.getAttribute("aria-expanded"), "true");
    assert.equal(await submenu.evaluate(node => node.inert), false);
    assert.equal(await layout.evaluate(node => getComputedStyle(node).transitionProperty.includes("grid-template-columns")), true);
    await root.getByRole("button", { name: "Collapse navigation" }).click();
    assert.equal(await layout.getAttribute("data-panel"), "rail");
    assert.equal(await submenu.evaluate(node => node.inert), true);
    await root.getByRole("button", { name: "Expand navigation" }).click();
    assert.equal(await layout.getAttribute("data-panel"), "full");
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await submenu.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
    assert.equal(await layout.evaluate(node => getComputedStyle(node).transitionDuration), "0s");

    // A host with a definite height expects the shell and its panel to fill it.
    const heights = await layout.evaluate(node => {
      const host = document.createElement("div");
      host.style.cssText = "width:900px;height:480px;";
      document.body.append(host);
      host.append(node);
      const aside = node.querySelector(".yg-sidebar-panel");
      return { host: host.getBoundingClientRect().height, shell: node.getBoundingClientRect().height,
        panel: aside.getBoundingClientRect().height };
    });
    assert(Math.abs(heights.host - heights.shell) < 1, "shell must fill a definite host height");
    assert(Math.abs(heights.host - heights.panel) < 1, "panel must fill its shell height");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(gallery + "#sidebar");
    const basic = page.locator('.specimen[data-component="sidebar"]');
    const basicNav = basic.locator(".yg-sidebar > nav");
    await basic.getByRole("button", { name: "Collapse navigation" }).click();
    assert.equal(await basicNav.getAttribute("aria-hidden"), "true");
    assert.equal(await basicNav.evaluate(node => node.inert), true);
    assert.equal(await basicNav.evaluate(node => getComputedStyle(node).transitionProperty.includes("grid-template-rows")), true);
    await basic.getByRole("button", { name: "Expand navigation" }).click();
    assert.equal(await basicNav.getAttribute("aria-hidden"), "false");
    assert.equal(await basicNav.evaluate(node => node.inert), false);
    await basic.getByRole("button", { name: "Collapse navigation" }).click();
    await basic.getByRole("button", { name: "Expand navigation" }).click();
    assert.equal(await basicNav.getAttribute("aria-hidden"), "false");
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await basicNav.evaluate(node => getComputedStyle(node).transitionDuration), "0s");
    await page.close();
    console.log("Sidebar motion, disclosure semantics, reduced motion and host height verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
