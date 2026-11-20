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
    await page.getByRole("heading", {name: "Task list", level: 1}).waitFor();
    if (output && width !== 768) await page.screenshot({path: join(output, `yogurt-motion-patterns-${width}.png`)});
    const links = page.locator('[aria-label="Pattern index"] a');
    const ids = await links.evaluateAll(nodes => nodes.map(node => node.hash.slice(1)));
    assert.equal(ids.length, 78, "The retained patterns are indexed");
    assert.equal(ids.length, new Set(ids).size, "Gallery IDs are unique");
    for (const id of ["expressive", "rubber-dock", "pull-cord", "magnetic-press", "attention-ring"])
      assert(!ids.includes(id), `Retired entry remains: ${id}`);
    const article = page.locator(".motion-pattern-article");
    const demo = async id => {
      await page.evaluate(id => { window.location.hash = id; }, id);
      const example = page.locator(".motion-pattern-article#" + id);
      await example.waitFor();
      return example;
    };
    for (const id of ids) {
      const example = await demo(id);
      const check = await example.evaluate(node => {
        const heading = document.querySelector(".motion-pattern-intro h1").getBoundingClientRect();
        const bounds = node.querySelector(".motion-pattern-sample").getBoundingClientRect();
        return {
          hasControl: !!node.querySelector("button, input, select, textarea, summary, [tabindex]"),
          overflow: document.documentElement.scrollWidth - innerWidth,
          readingEdge: Math.abs(bounds.left - heading.left),
        };
      });
      assert(check.hasControl && check.overflow <= 1 && check.readingEdge <= 1, JSON.stringify({width, id, ...check}));
    }
    assert.equal(await article.count(), 1, "Only the chosen pattern is mounted");
    await page.goto(gallery("motion-patterns") + "#task-list");
    const indexToggle = page.getByRole("button", {name: "Browse patterns"});
    if (await indexToggle.isVisible()) await indexToggle.click();
    const search = page.getByRole("searchbox", {name: "Find a pattern"});
    await search.fill("Expressive motion");
    await page.getByText("No matching patterns.").waitFor();
    await search.fill("Storage meter");
    assert.equal(await links.count(), 1);
    await search.press("Enter");
    await page.locator(".motion-pattern-article#storage-meter").waitFor();
    await page.waitForFunction(() => document.activeElement === document.querySelector(".motion-pattern-intro h1"));
    if (await indexToggle.isVisible()) assert.equal(await indexToggle.getAttribute("aria-expanded"), "false");
    await page.goBack();
    await page.locator(".motion-pattern-article#task-list").waitFor();
    if (width !== 1440) {
      await page.close();
      continue;
    }
    await page.getByText("Example controls", {exact: true}).click();
    const primarySize = await page.locator("#task-list .yg-button").first().evaluate(node => ({
      height: getComputedStyle(node).minBlockSize,
      corner: getComputedStyle(node).borderTopLeftRadius,
      font: getComputedStyle(node).fontSize,
    }));
    assert.deepEqual(primarySize, {height:"36px",corner:"8px",font:"14px"});
    const dropdown = await demo("spring-dropdown");
    const view = dropdown.getByRole("combobox", {name:"Workspace view"});
    await view.press("Space");
    const options = page.getByRole("listbox");
    await options.waitFor();
    await page.keyboard.press("Escape");
    await options.waitFor({state:"hidden"});
    assert(await view.evaluate(node => node === document.activeElement));
    await view.click();
    await options.getByRole("option", {name:"Files"}).click();
    assert.match(await view.textContent(), /Files/);
    await options.waitFor({state:"hidden"});
    assert(await view.evaluate(node => node === document.activeElement));

    const command = await demo("command-palette");
    const open = command.getByRole("button", {name:"Open command palette"});
    await open.click();
    const commandField = page.getByRole("combobox", {name:"Find a command"});
    await commandField.fill("Source");
    await commandField.press("Enter");
    await command.getByText("Opened Source files").waitFor();
    assert(await open.evaluate(node => node === document.activeElement));
    const focus = await demo("focus-mode");
    await focus.getByRole("switch", {name:"Focus mode"}).click();
    assert.equal(await focus.getByRole("status").textContent(), "Priority only");
    assert.equal(await focus.locator("[data-deferred]").count(), 2);
    const billing = await demo("plan-switch");
    await billing.getByText("Yearly", {exact:true}).click();
    assert.match(await billing.getByRole("status").textContent(), /\$240 billed yearly/);

    const storage = await demo("storage-meter");
    const meter = storage.getByRole("meter");
    await storage.getByRole("button", {name: "Add files"}).click();
    assert.equal(await meter.getAttribute("aria-valuenow"), "76");

    const mentionExample = await demo("mention-picker");
    const mention = mentionExample.locator("textarea");
    await mention.pressSequentially("Ask @ka");
    await mentionExample.getByRole("option", {name: "Kai"}).waitFor();
    await mention.press("Enter");
    assert.equal((await mention.inputValue()).trim(), "Ask @Kai");
    assert(await mention.evaluate(node => node === document.activeElement));

    const ghost = (await demo("ghost-suggestion")).getByRole("textbox");
    await ghost.focus();
    await ghost.press("ArrowRight");
    assert.equal(await ghost.inputValue(), "Review the workspace notes");

    const files = await demo("file-drop");
    const input = files.locator('input[type="file"]');
    await input.setInputFiles({name: "brief.txt", mimeType: "text/plain", buffer: Buffer.from("Draft")});
    await files.getByText("brief.txt", {exact: true}).waitFor();
    await input.setInputFiles({name: "not-allowed.csv", mimeType: "text/csv", buffer: Buffer.from("Draft")});
    await files.getByText(/1 file was not added/).waitFor();

    const otp = (await demo("otp")).getByRole("textbox");
    await otp.fill("12a34567");
    assert.equal(await otp.inputValue(), "123456");

    const action = await demo("loading-to-success");
    await action.getByRole("button", {name: "Save changes"}).click();
    await action.getByRole("button", {name: "Saved", exact: true}).waitFor();

    const confirm = await demo("hold-button");
    const hold = confirm.locator(".yg-hold-confirm");
    await hold.focus();
    await hold.press("Enter");
    assert.equal((await confirm.getByRole("status").textContent()).trim(), "");
    await hold.press("Escape");
    await hold.press("Enter");
    await hold.press("Enter");
    assert.equal((await confirm.getByRole("status").textContent()).trim(), "Approved 1 time.");

    const island = (await demo("activity-island")).getByRole("button");
    await island.click();
    assert.equal(await island.getAttribute("aria-expanded"), "true");
    await island.click();
    assert.equal(await island.getAttribute("aria-expanded"), "false");

    const tasks = await demo("task-list");
    await tasks.getByText("Example controls", {exact: true}).click();
    const summary = tasks.locator(".yg-task-list summary");
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

    const cart = await demo("cart-button");
    const yogurt = cart.getByRole("group", {name: "Greek yogurt"});
    const subtotal = cart.locator("[data-cart-subtotal]");
    assert.equal(await subtotal.textContent(), "$7.00");
    const add = yogurt.getByRole("button", {name: "Add Greek yogurt"});
    await add.press("Enter");
    const increase = yogurt.getByRole("button", {name: "Increase quantity of Greek yogurt"});
    assert(await increase.evaluate(node => node === document.activeElement), "Add retains focus after opening");
    assert.equal(await subtotal.textContent(), "$11.20");
    await increase.press("Space");
    assert.equal(await yogurt.locator("output").textContent(), "2");
    await yogurt.getByRole("button", {name: "Decrease quantity of Greek yogurt"}).click();
    assert.equal(await yogurt.locator("output").textContent(), "1");
    await yogurt.getByRole("button", {name: "Remove Greek yogurt"}).press("Enter");
    assert(await add.evaluate(node => node === document.activeElement), "Removing the line focuses Add");
    assert.equal(await subtotal.textContent(), "$7.00");

    const berries = cart.getByRole("group", {name: "Blueberries"});
    const berryIncrease = berries.getByRole("button", {name: "Increase quantity of Blueberries"});
    await berryIncrease.scrollIntoViewIfNeeded();
    const increaseBox = await berryIncrease.boundingBox();
    await page.mouse.move(increaseBox.x + increaseBox.width / 2, increaseBox.y + increaseBox.height / 2);
    await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('#cart-button [aria-label="Quantity of Blueberries"]').textContent === "9");
    await page.mouse.up();
    assert.equal(await berryIncrease.getAttribute("aria-disabled"), "true");
    assert.equal(await berries.locator("output").textContent(), "9");
    await berryIncrease.press("Enter");
    await berries.getByText("Limit 9 per order", {exact:true}).waitFor();
    const berryDecrease = berries.getByRole("button", {name: "Decrease quantity of Blueberries"});
    const decreaseBox = await berryDecrease.boundingBox();
    await page.mouse.move(decreaseBox.x + decreaseBox.width / 2, decreaseBox.y + decreaseBox.height / 2);
    await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('#cart-button [aria-label="Quantity of Blueberries"]').textContent === "1");
    await page.mouse.up();
    assert.equal(await berries.locator("output").textContent(), "1", "A held decrease keeps the last item");
    assert.equal(await subtotal.textContent(), "$3.50");
    await add.click();
    if (output) await cart.screenshot({path: join(output, "yogurt-cart-button.png"), animations: "disabled"});

    await page.emulateMedia({reducedMotion: "reduce"});
    assert.equal(await yogurt.locator(".yg-cart-stepper").evaluate(n => getComputedStyle(n).transitionDuration), "0s");
    await demo("task-list");
    assert.equal(await tasks.locator("[data-active]").evaluate(n =>
      getComputedStyle(n, "::after").animationName), "none");
    const thinking = await demo("thinking");
    await thinking.getByRole("button", {name: "Start thinking"}).click();
    assert.equal(await thinking.locator(".yg-thinking-shape").evaluate(n =>
      n.getAnimations().length), 0);

    await page.close();
    console.log(JSON.stringify({interactivePatterns: ids.length, viewport: [320, 768, 1440], errors}));
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
