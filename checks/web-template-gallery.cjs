const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright-core");
const components = require("../catalog/components.json");
const motionComponents = require("../catalog/motion-components.json").components;
const componentPaths = new Set([...components, ...motionComponents].map(item => "/components/" + item.id));

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

async function chooseSelect(page, combobox, optionName) {
  await combobox.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

async function checkGallery(browser, origin, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width >= 1000 ? "light" : "dark" });
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(origin + "/patterns");
    await page.getByRole("heading", { name: "Patterns", exact: true }).waitFor();
    const expected = require("../catalog/blocks.json").map(block => block.id).sort();
    const cards = await page.locator("[data-pattern]").evaluateAll(items => items.map(item => ({
      id: item.dataset.pattern,
      path: item.querySelector("a")?.pathname,
    })));
    assert.deepEqual(cards.map(card => card.id).sort(), expected);
    assert(cards.every(card => card.path === "/patterns/" + card.id));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "patterns overflow horizontally");
    const columns = await page.locator(".template-gallery-board").first().evaluate(board => new Set([...board.children].map(card => Math.round(card.getBoundingClientRect().x))).size);
    assert(width >= 1000 ? columns > 1 : columns === 1);

    await page.getByRole("link", { name: "Open Project Settings" }).click();
    await page.getByRole("heading", { name: "ProjectSettings", level: 1 }).waitFor();
    await page.getByRole("heading", { name: "When to use it", exact: true }).waitFor();
    await page.getByText(/Use this when changes need an explicit save/).waitFor();
    await page.getByRole("switch", { name: "Send a digest" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByText("Settings saved", { exact: true }).waitFor();

    const stage = page.locator(".template-stage");
    await page.goto(origin + "/patterns/invite");
    await stage.getByRole("textbox", { name: "Work email" }).fill("alex@example.test");
    await chooseSelect(page, stage.getByRole("combobox", { name: "Access" }), "Viewer");
    await stage.getByRole("button", { name: "Send invitation" }).click();
    await stage.getByText("Invitation prepared.").waitFor();
    await page.getByRole("button", { name: "Reset preview" }).click();
    assert.equal(await stage.getByRole("textbox", { name: "Work email" }).inputValue(), "");

    const documented = await page.locator(".template-component-links a").evaluateAll(links => links.map(link => link.pathname));
    assert(documented.length > 0 && documented.every(path => componentPaths.has(path)), "missing component page");

    await page.goto(origin + "/patterns/faq");
    await stage.getByRole("button", { name: "Who can see my drafts?" }).focus();
    await page.keyboard.press("Enter");
    await stage.getByText("Drafts stay private until you share them with the workspace.").waitFor();

    await page.goto(origin + "/patterns/access");
    await stage.getByRole("textbox", { name: "Verification code" }).fill("123456");
    await stage.getByText("Sample access verified.").waitFor();

    await page.goto(origin + "/patterns/compose");
    await chooseSelect(page, stage.getByRole("combobox", { name: "Density" }), "Compact");
    await stage.locator('.yg-card[data-density="compact"]').waitFor();
    await chooseSelect(page, stage.getByRole("combobox", { name: "Surface" }), "Paper");
    assert.equal(await stage.locator(".template-composition-canvas").getAttribute("data-material"), "paper");
    await chooseSelect(page, stage.getByRole("combobox", { name: "Task" }), "Settings");
    await stage.getByRole("switch", { name: "Review reminders" }).click();
    await stage.getByRole("button", { name: "Save preferences" }).click();
    await stage.getByText("Preferences saved", { exact: true }).waitFor();
    await stage.getByText(/density="compact"/).waitFor();
    await page.getByRole("button", { name: "Reset preview" }).click();
    await stage.locator('.yg-card[data-density="regular"]').waitFor();

    await page.goto(origin + "/patterns/type");
    await chooseSelect(page, stage.getByRole("combobox", { name: "Content" }), "Conversation");
    await stage.getByRole("heading", { name: "Review notes" }).waitFor();

    await page.goto(origin + "/patterns/chart");
    await stage.getByRole("radio", { name: "Missing readings", exact: true }).click();
    await stage.getByText("The source has no reading for Tue.").waitFor();

    await page.goto(origin + "/patterns/nested-panes");
    if (width < 630) await stage.getByRole("button", { name: "Toggle projects" }).click();
    await stage.getByRole("button", { name: "Operations", exact: true }).click();
    if (width < 810) await stage.getByRole("button", { name: "Toggle documents" }).click();
    await stage.getByRole("button", { name: "Archive", exact: true }).click();
    await stage.getByRole("heading", { name: "Archive", exact: true }).waitFor();

    await page.goto(origin + "/patterns/signup-split");
    await stage.getByRole("button", { name: "Create account" }).click();
    await stage.getByText("Enter a valid email address.").waitFor();
    await stage.getByRole("textbox", { name: "Name", exact: true }).fill("Alex");
    await stage.getByRole("textbox", { name: "Work email" }).fill("alex@example.test");
    await stage.getByLabel("Password").fill("sample-value");
    await stage.getByRole("button", { name: "Create account" }).click();
    await stage.getByText("Preview complete").waitFor();
    assert.equal(await stage.getByLabel("Password").count(), 0);

    await page.goto(origin + "/patterns/release-dashboard");
    await stage.getByRole("searchbox", { name: "Find a release" }).fill("2.4");
    await stage.getByRole("cell", { name: "Workspace 2.4" }).waitFor();
    assert.equal(await stage.getByRole("cell", { name: "Workspace 2.3" }).count(), 0);

    await page.goto(origin + "/patterns/files");
    await page.getByRole("heading", { name: "File tree", exact: true }).waitFor();

    await page.goto(origin + "/patterns/dialog");
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
    console.log(width + "px: recommended patterns and workspace interactions passed.");
  } finally {
    await page.close();
  }
}

(async () => {
  const hosted = process.env.YOGURT_GUIDE_URL
    ? { server: null, origin: process.env.YOGURT_GUIDE_URL }
    : await startSiteServer();
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await Promise.all([checkGallery(browser, hosted.origin, 1440), checkGallery(browser, hosted.origin, 390)]);
  } finally {
    await browser.close();
    hosted.server?.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
