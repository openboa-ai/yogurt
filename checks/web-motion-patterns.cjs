const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

const gallery = (name) => pathToFileURL(join(__dirname, "../apps/guide/generated", name + ".html")).href;
const output = process.env.YOGURT_CAPTURE_DIR;

async function run(browser) {
  const errors = [];
  for (const width of [320, 768, 1440]) {
    const page = await browser.newPage({viewport: {width, height: 900}, colorScheme: width < 500 ? "dark" : "light"});
    page.on("pageerror", error => errors.push(error.message));
    page.setDefaultTimeout(4500);
    for (const id of ["button", "select", "carousel", "data-table", "project-workspace", "collection-browser"]) {
      await page.goto(gallery("components") + "#" + id);
      const specimen = page.locator(`.specimen[data-component="${id}"]`);
      await specimen.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const measure = await specimen.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const example = node.querySelector(".specimen-inner").getBoundingClientRect();
        const intro = document.querySelector(".catalog-intro").getBoundingClientRect();
        const identity = document.querySelector(".catalog-identity").getBoundingClientRect();
        const shell = document.querySelector(".catalog-body");
        const inset = parseFloat(getComputedStyle(shell).paddingInlineStart);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          readingEdge: Math.abs(rect.left - intro.left),
          guideEdge: Math.abs(identity.left - shell.getBoundingClientRect().left - inset),
          center: Math.abs((rect.left + rect.right) - (example.left + example.right)) / 2,
          width: rect.width,
          contentWidth: example.width,
        };
      });
      assert(measure.overflow <= 1 && measure.readingEdge < 1 && measure.guideEdge < 1 && measure.center < 1,
        JSON.stringify({width, id, ...measure}));
      if (["data-table", "project-workspace", "collection-browser"].includes(id))
        assert(measure.width - measure.contentWidth <= 49, JSON.stringify({width, id, ...measure}));
      if (output && id === "project-workspace")
        await page.screenshot({path: join(output, `yogurt-alignment-${width}.png`)});
    }
    await page.goto(gallery("motion-patterns"));
    await page.getByRole("heading", {name: "Motion patterns", exact: true}).waitFor();
    const cards = await page.locator(".motion-pattern-grid > article").all();
    const ids = await page.locator(".motion-pattern-grid > article").evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(ids.length, new Set(ids).size, "Gallery IDs are unique");
    assert(cards.length >= 86, `Only ${cards.length} interactive patterns`);
    const inactive = await page.locator(".motion-pattern-grid > article").evaluateAll(nodes =>
      nodes.filter(node => !node.querySelector("button, input, select, textarea, summary, [tabindex]")).map(node => node.id));
    assert.deepEqual(inactive, [], "Every pattern has a direct control");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 1, JSON.stringify({width, overflow}));
    if (output && width !== 768) await page.screenshot({path: join(output, `yogurt-motion-patterns-${width}.png`)});
    if (width !== 1440) {
      await page.close();
      continue;
    }
    const demo = id => page.locator("article#" + id);
    const meter = demo("storage-meter").getByRole("meter");
    await demo("storage-meter").getByRole("button", {name: "Add files"}).click();
    assert.equal(await meter.getAttribute("aria-valuenow"), "76");

    const mention = demo("mention-picker").locator("textarea");
    await mention.pressSequentially("Ask @ka");
    await demo("mention-picker").getByRole("option", {name: "Kai"}).waitFor();
    await mention.press("Enter");
    assert.equal((await mention.inputValue()).trim(), "Ask @Kai");
    assert(await mention.evaluate(node => node === document.activeElement));

    const ghost = demo("ghost-suggestion").getByRole("textbox");
    await ghost.focus();
    await ghost.press("ArrowRight");
    assert.equal(await ghost.inputValue(), "Review the workspace notes");

    const input = demo("file-drop").locator('input[type="file"]');
    await input.setInputFiles({name: "brief.txt", mimeType: "text/plain", buffer: Buffer.from("Draft")});
    await demo("file-drop").getByText("brief.txt", {exact: true}).waitFor();
    await input.setInputFiles({name: "not-allowed.csv", mimeType: "text/csv", buffer: Buffer.from("Draft")});
    await demo("file-drop").getByText(/1 file was not added/).waitFor();

    const otp = demo("otp").getByRole("textbox");
    await otp.fill("12a34567");
    assert.equal(await otp.inputValue(), "123456");

    const action = demo("loading-to-success");
    await action.getByRole("button", {name: "Save changes"}).click();
    await action.getByRole("button", {name: "Saved", exact: true}).waitFor();

    const hold = demo("hold-button").locator(".yg-hold-confirm");
    await hold.focus();
    await hold.press("Enter");
    assert.equal((await demo("hold-button").getByRole("status").textContent()).trim(), "");
    await hold.press("Escape");
    await hold.press("Enter");
    await hold.press("Enter");
    assert.equal((await demo("hold-button").getByRole("status").textContent()).trim(), "Approved 1 time.");

    const island = demo("activity-island").getByRole("button");
    await island.click();
    assert.equal(await island.getAttribute("aria-expanded"), "true");
    await island.click();
    assert.equal(await island.getAttribute("aria-expanded"), "false");

    const tasks = demo("task-list");
    const summary = tasks.locator("summary");
    await summary.press("Enter");
    await tasks.getByText("Verify the revision").waitFor();
    await tasks.getByRole("button", {name: "Complete step"}).click();
    await tasks.getByText("2 of 3 done", {exact: true}).waitFor();
    assert.equal(await tasks.locator("[data-active]").count(), 1);
    await tasks.getByRole("button", {name: "Mark failed"}).click();
    await tasks.getByText("Failed", {exact: true}).waitFor();
    await tasks.getByRole("button", {name: "Retry step"}).click();
    await tasks.getByText("Running", {exact: true}).waitFor();
    if (output) await tasks.screenshot({path: join(output, "yogurt-task-list-review.png")});

    await page.emulateMedia({reducedMotion: "reduce"});
    assert.equal(await tasks.locator("[data-active]").evaluate(n =>
      getComputedStyle(n, "::after").animationName), "none");
    await demo("thinking").getByRole("button", {name: "Start thinking"}).click();
    assert.equal(await demo("thinking").locator(".yg-thinking-shape").evaluate(n =>
      n.getAnimations().length), 0);

    const search = page.getByRole("searchbox", {name: "Find a pattern"});
    await search.fill("Storage meter");
    assert.equal(await page.locator(".motion-pattern-grid > article").count(), 1);
    await page.close();
    console.log(JSON.stringify({interactivePatterns: cards.length, viewport: [320, 768, 1440], errors}));
  }
  assert.deepEqual(errors, []);
}

(async () => {
  const browser = await chromium.launch({channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome"});
  try {
    await run(browser);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
