const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright-core");
const { color: palette } = require("../design/tokens/brand.json");

let base = process.env.YOGURT_GUIDE_URL ?? "";
const rootDir = path.resolve(__dirname, "..");
const siteDir = path.join(rootDir, "site");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
function startSiteServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = path.join(siteDir, urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, ""));
      if (!filePath.startsWith(siteDir)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
      if (!fs.existsSync(filePath)) filePath = path.join(siteDir, "index.html");
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}
const destinations = [
  ["Tokens", "/tokens", "Tokens"],
  ["Components", "/components", "Button"],
  ["Patterns", "/patterns", "Patterns"],
  ["Examples", "/examples", "Sourdough Studio"],
];
const patternControls = {
  "project-settings": ["switch", "Send a digest"],
  "collection-browser": ["searchbox", "Find a view"],
  "decision-review": ["button", "Archive review"],
  "conversation-panel": ["textbox", "Message"],
  "agent-workspace": ["region", "Agent workspace"],
  "project-workspace": ["region", "Project workspace"],
  "operations-library": ["searchbox", "Search operations"],
  "attention-inbox": ["list", "Attention items"],
  "artifact-library": ["searchbox", "Search library"],
  "project-access": ["textbox", "Email"],
  "agent-profile": ["form", "Agent profile"],
  "run-inspector": ["list", "Runs"],
  "agent-sidebar": ["searchbox", "Find an agent"],
  "project-sidebar": ["searchbox", "Find a view"],
};

async function checkCanvas(page, appearance) {
  assert.deepEqual(await page.evaluate(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const guideStyle = getComputedStyle(document.querySelector(".guide-shell"));
    return [documentStyle.colorScheme, documentStyle.colorScheme === guideStyle.colorScheme,
      documentStyle.backgroundColor === guideStyle.backgroundColor, documentStyle.backgroundColor !== "rgba(0, 0, 0, 0)"];
  }), [appearance, true, true, true]);
}

async function checkComponentIndex(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 820 }, reducedMotion: "reduce" });
  try {
    await page.goto(base + "/components/slider");
    const toggle = page.getByRole("button", { name: "Browse components" });
    const search = page.getByRole("searchbox", { name: "Find a component" });
    const compact = width <= 768;
    if (compact) {
      await toggle.click();
      assert.equal(await search.evaluate(input => input === document.activeElement), true);
    }
    const index = page.getByRole("navigation", { name: "Component index" });
    for (const label of await index.locator('button[aria-expanded="false"]').allTextContents()) {
      await index.getByRole("button", { name: label.trim(), exact: true }).click();
    }
    await index.evaluate(list => { list.scrollTop = 0; });
    await index.hover({ position: { x: 25, y: 24 } });
    const start = await search.boundingBox();
    const pageStart = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 440);
    await page.waitForFunction(() => document.querySelector('nav[aria-label="Component index"]').scrollTop > 0);
    assert.equal(await page.evaluate(() => window.scrollY), pageStart, "scrolling the index leaves the page in place");
    assert.equal((await search.boundingBox()).y, start.y, "search stays in place");
    const last = index.getByRole("link").last();
    await last.focus();
    assert(await last.evaluate(link => {
      const row = link.getBoundingClientRect();
      const list = link.closest("nav").getBoundingClientRect();
      return row.top >= list.top - 1 && row.bottom <= list.bottom + 1;
    }), "keyboard focus can reach the last entry");

    if (compact) {
      await page.keyboard.press("Escape");
      await index.waitFor({ state: "hidden" });
      assert.equal(await toggle.evaluate(button => button === document.activeElement), true);
    } else {
      const previous = await index.evaluate(list => list.scrollTop);
      await page.getByRole("link", { name: "Elastic slider", exact: true }).click();
      await page.getByRole("slider", { name: "Intensity" }).waitFor();
      assert.equal(await index.evaluate(list => list.scrollTop), previous, "variant navigation preserves the index position");
      await page.goBack();
      await page.getByRole("link", { name: "Default", exact: true }).waitFor();
      assert.equal(await index.evaluate(list => list.scrollTop), previous);
    }
  } finally { await page.close(); }
}

async function checkGuide(browser, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: "light" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const heading = name => page.getByRole("heading", { name, level: 1, exact: true });
  const nav = page.getByRole("navigation", { name: "Yogurt guide" });
  const openMenu = page.getByRole("button", { name: "Open menu" });
  const mobile = width <= 992;
  page.setDefaultTimeout(8000);
  try {
    await page.goto(base);
    await heading("Yogurt").waitFor();
    await checkCanvas(page, "light");
    assert.equal(await page.locator("link[rel=icon]").getAttribute("href"), "/assets/projects/yogurt.svg");
    await page.locator(".guide-brand-slogan").filter({ hasText: /^ships with live cultures$/ }).waitFor();
    const cover = page.locator(".guide-brand-opening");
    await cover.getByText("OpenBoa design system", { exact: true }).waitFor();
    await cover.getByText(/a UI SDK for browsers and desktop WebViews/).waitFor();
    const coverMarks = await cover.locator(".yg-mark").evaluateAll(marks => marks.map(mark => mark.getAttribute("src")));
    assert.equal(coverMarks.length, 1, "the original artwork has one position on the cover");
    assert.equal(coverMarks[0], await page.locator(".guide-identity .yg-mark").getAttribute("src"));
    assert.equal(await cover.locator(".guide-brand-title .yg-mark").count(), 0);
    const familyMarks = page.locator("#family .yg-mark");
    assert.equal(await familyMarks.count(), 3);
    assert.deepEqual(await familyMarks.evaluateAll(marks => marks.map(mark => mark.getAttribute("width"))), ["32", "32", "32"]);
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

    if (mobile) {
      await openMenu.focus();
      await page.keyboard.press("Enter");
      await nav.getByRole("link", { name: "Tokens" }).waitFor();
      assert.equal(await page.evaluate(() => document.activeElement.textContent), "Tokens");
      await page.keyboard.press("Escape");
      assert.equal(await openMenu.evaluate(el => document.activeElement === el), true);
    }
    const titleSizes = [];
    for (const [label, path, title] of destinations) {
      if (mobile) await openMenu.click();
      await nav.getByRole("link", { name: label, exact: true }).click();
      await heading(title).waitFor();
      assert.equal(await page.locator("#guide-content").getByRole("heading", { level: 1 }).count(), 1);
      if (label !== "Brand" && label !== "Examples") titleSizes.push(await heading(title).evaluate(el => getComputedStyle(el).fontSize));
      assert.equal(new URL(page.url()).pathname, path);
      assert.equal(await page.locator(".guide-masthead").getAttribute("data-check-persistence"), "yes");
      if (mobile) await openMenu.click();
      const current = nav.locator("[aria-current=page]");
      assert.equal(await current.innerText(), label);
      assert.equal(await current.evaluate(el => getComputedStyle(el).textDecorationLine), "none", path);
      if (mobile) await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, path);
    }

    assert.equal(new Set(titleSizes).size, 1, "ordinary screen titles share the same type size");
    assert.equal(await page.locator(".guide-masthead .yg-nav-list a:is([href='/motion'], [href='/workflows'])").count(), 0);
    await page.goBack();
    await heading("Patterns").waitFor();
    await page.goForward();
    await heading("Sourdough Studio").waitFor();
    await page.getByRole("link", { name: "Yogurt home" }).click();
    await heading("Yogurt").waitFor();
    assert.equal(await page.locator(".guide-masthead").getAttribute("data-check-persistence"), "yes");
    await page.getByRole("button", { name: "Use dark appearance" }).click();
    await page.getByRole("link", { name: "Browse components", exact: true }).click();
    await heading("Button").waitFor();
    assert.equal(await page.locator(".catalog").getAttribute("data-appearance"), "dark");
    await checkCanvas(page, "dark");
    await page.reload();
    await heading("Button").waitFor();
    assert.equal(await page.locator(".guide-shell").getAttribute("data-appearance"), "dark");
    await checkCanvas(page, "dark");

    await page.goto(base + "/components.html#input-otp");
    await heading("InputOTP").waitFor();
    assert.equal(new URL(page.url()).pathname, "/components/input-otp");
    for (const [legacy, next, title, role, name] of [
      ["/components/motion-spring-dropdown", "/components/select?preview=spring-dropdown", "Select", "combobox", "Work status"],
      ["/motion/range-slider", "/components/slider?preview=range-slider", "Slider", "slider", "Minimum price"],
    ]) {
      await page.goto(base + legacy);
      await heading(title).waitFor();
      assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, next);
      await page.locator(".specimen").getByRole(role, { name }).waitFor();
    }
    await page.goto(base + "/motion/smooth-tabs");
    await heading("Tabs").waitFor();
    assert.equal(new URL(page.url()).searchParams.get("preview"), "smooth-tabs");
    await page.locator(".specimen").getByRole("tab", { name: "Notes" }).click();
    await page.locator(".specimen").getByRole("tab", { name: "Notes", selected: true }).waitFor();
    await page.goto(base + "/motion/unrecognized");
    await heading("Button").waitFor();
    assert.equal(new URL(page.url()).pathname, "/components");
    await page.goto(base + "/workflows#records");
    await heading("Product playbook").waitFor();
    assert.equal(new URL(page.url()).pathname, "/playbook");
    for (const [previous, next, title] of [
      ["/docs/index.html", "/adoption", "Use yogurt in a project"],
      ["/examples/basic-controls/index.html", "/tokens#controls", "Tokens"],
      ["/templates", "/patterns", "Patterns"],
      ["/components/project-settings", "/patterns/project-settings", "ProjectSettings"],
      ["/examples/signature/index.html", "/#wordmark-study", "Yogurt"],
    ]) {
      await page.goto(base + previous);
      await heading(title).waitFor();
      assert.equal(page.url().slice(base.length), next);
    }
    await page.goto(base + "/patterns");
    await heading("Patterns").waitFor();
    const recommended = page.locator("[data-pattern]");
    const listedPatterns = await recommended.evaluateAll(items => items.map(item => item.dataset.pattern).sort());
    assert.deepEqual(listedPatterns, require("../catalog/blocks.json").map(block => block.id).sort());
    await page.getByRole("link", { name: "Compose a screen" }).click();
    await page.locator(".template-stage").getByRole("combobox", { name: "Task" }).waitFor();
    await page.goBack();
    await heading("Patterns").waitFor();
    await page.getByRole("link", { name: "Open Collection Browser" }).click();
    await heading("CollectionBrowser").waitFor();
    await page.getByRole("link", { name: "filter-bar", exact: true }).waitFor();
    await page.goto(base + "/components/project-access");
    await heading("ProjectAccess").waitFor();
    assert.equal(new URL(page.url()).pathname, "/patterns/project-access");
    const preview = page.locator(".template-stage");
    await preview.getByRole("textbox", { name: "Email" }).fill("new@example.test");
    await preview.getByRole("button", { name: "Invite", exact: true }).click();
    await preview.getByRole("list", { name: "People with access" }).getByText("new@example.test", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Reset preview" }).click();
    assert.equal(await preview.getByText("new@example.test", { exact: true }).count(), 0);
    if (width === 1440) {
      const blocks = require("../catalog/blocks.json");
      assert.deepEqual(Object.keys(patternControls).sort(), blocks.map(block => block.id).sort());
      for (const block of blocks) {
        await page.goto(base + "/patterns/" + block.id);
        await heading(block.name).waitFor();
        const [role, name] = patternControls[block.id];
        await preview.getByRole(role, { name, exact: true }).waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), block.id);
      }
    }
    await page.goto(base + "/system#color");
    const matrix = page.getByRole("region", { name: "Color matrix", exact: true });
    await matrix.getByRole("radiogroup", { name: "slate shades" }).waitFor();
    assert.equal(await matrix.getByRole("radiogroup").count(), Object.keys(palette).length);
    assert.equal(await matrix.getByRole("radio").count(),
      Object.values(palette).flatMap(colors => Object.keys(colors)).length);
    const chooseSelect = async (combobox, optionName) => {
      await combobox.click();
      await page.getByRole("option", typeof optionName === "string" ? { name: optionName, exact: true } : { name: optionName }).click();
    };
    await chooseSelect(page.locator("#hue"), "orange");
    assert.match(await page.locator("#color-name").innerText(), /^orange\./);
    const shades = page.getByRole("radiogroup", { name: "orange shades" });
    const shade = shades.getByRole("radio", { name: /^orange 600/ });
    await shade.click();
    assert.equal(await page.locator("#color-name").innerText(), "orange.600");
    await shade.press("ArrowLeft");
    assert.equal(await page.locator("#color-name").innerText(), "orange.500");
    const rosterSearch = page.getByRole("searchbox", { name: "Find an agent" });
    await rosterSearch.fill("014");
    await chooseSelect(page.getByRole("combobox", { name: "Status", exact: true }), "Working");
    await page.getByText("No matching agents.").waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    assert.equal(await rosterSearch.evaluate(el => document.activeElement === el), true);
    await page.getByText("2 agents", { exact: true }).waitFor();

    await page.goto(base + "/library#emoji");
    const contour = page.getByRole("radiogroup", { name: "Contour at detail size" });
    await contour.getByRole("radio", { name: "Plain" }).click();
    assert.equal(await contour.getByRole("radio", { name: "Plain" }).getAttribute("aria-checked"), "true");
    await chooseSelect(page.getByRole("combobox", { name: "Agent state", exact: true }), "Blocked");
    await page.getByText("Kai · Blocked", { exact: true }).waitFor();
    await page.goto(base + "/emoji.html?emoji=1f60a");
    await page.locator("#emoji-name").filter({ hasText: /Smiling Face/i }).waitFor();
    await chooseSelect(page.getByRole("combobox", { name: "Face color", exact: true }), "Soft peach");
    assert.match(await page.getByRole("link", { name: "SVG", exact: true }).getAttribute("href"), /variants\/peach/);
    const emojiSearch = page.getByRole("searchbox", { name: "Find an emoji" });
    await emojiSearch.fill("zzzznoemoji");
    await page.getByText("No matching emoji.").waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    assert.equal(await emojiSearch.evaluate(el => document.activeElement === el), true);
    await page.goto(base + "/playbook?project=sourdough");
    await page.locator("#pb-project").waitFor({ state: "visible" });
    assert.match(await page.locator("#pb-project").innerText(), /Sourdough/);
    await chooseSelect(page.getByRole("combobox", { name: "Product brief", exact: true }), /^Meatball/);
    const previous = await page.locator("#example-title").textContent();
    await page.getByRole("combobox", { name: "Product condition", exact: true }).click();
    await page.locator('.yg-select-popup[data-open] [role="option"]').nth(1).click();
    assert.notEqual(await page.locator("#example-title").textContent(), previous);
    await page.getByRole("button", { name: "Guide options" }).click();
    await page.getByRole("menuitem", { name: "Review checks" }).click();
    assert.equal(await page.locator("#proof details").getAttribute("open"), "");

    await page.goto(base + "/agents");
    await page.getByRole("button", { name: "Play sequence" }).click();
    await page.getByRole("button", { name: "Stop sequence" }).waitFor();
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}

(async () => {
  const hosted = base ? { server: null, origin: base } : await startSiteServer();
  base = hosted.origin;
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL ?? "chrome" });
  try {
    await Promise.all([checkGuide(browser, 320), checkGuide(browser, 900), checkGuide(browser, 1440),
      ...[320, 760, 900, 1440].map(width => checkComponentIndex(browser, width))]);
    console.log("Guide navigation, appearance, pattern interaction and index scrolling passed.");
  } finally {
    await browser.close();
    hosted.server?.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
