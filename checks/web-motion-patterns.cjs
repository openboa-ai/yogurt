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
        const bounds = node.querySelector(".motion-pattern-stage").getBoundingClientRect();
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
    const primarySize = await page.locator("#task-list .yg-button").first().evaluate(node => {
      const style = getComputedStyle(node);
      return {height: style.minBlockSize, corner: style.borderTopLeftRadius, font: style.fontSize, weight: style.fontWeight};
    });
    assert.deepEqual(primarySize, {height:"36px", corner:"8px", font:"14px", weight:"560"});
    const promptBox = (await demo("prompt-box")).locator(".yg-prompt-box");
    assert.deepEqual(await promptBox.evaluate(node => {
      const style = getComputedStyle(node);
      const text = getComputedStyle(node.querySelector("textarea"));
      return [style.height, style.borderTopLeftRadius, style.borderTopWidth, text.fontSize, text.lineHeight, text.fontWeight];
    }), ["52px", "24px", "0px", "15px", "22px", "450"]);
    const promptInput = promptBox.getByRole("textbox", {name:"Prompt"});
    await promptInput.fill("Review the brief");
    await promptInput.press("Shift+Enter");
    await promptInput.pressSequentially("Check the handoff");
    assert.equal(await promptInput.inputValue(), "Review the brief\nCheck the handoff");
    await page.waitForFunction(() => document.querySelector(".yg-prompt-editor").getBoundingClientRect().height >= 44);
    const send = promptBox.getByRole("button", {name:"Send"});
    const contrast = await send.evaluate(async button => {
      await Promise.allSettled(button.getAnimations().map(animation => animation.finished));
      const resolved = getComputedStyle(button);
      const luminance = rgb => {
        const channels = rgb.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255);
        const linear = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
      };
      const colors = [luminance(resolved.color), luminance(resolved.backgroundColor)];
      return (Math.max(...colors) + .05) / (Math.min(...colors) + .05);
    });
    assert(contrast >= 3, "The send icon is legible against its filled button");
    await promptInput.press("Enter");
    const thinkingStatus = promptBox.getByRole("status");
    await thinkingStatus.getByText("Thinking", {exact: true}).waitFor();
    await page.waitForFunction(() => {
      const status = document.querySelector(".yg-prompt-status").getBoundingClientRect();
      const input = document.querySelector(".yg-prompt-editor textarea").getBoundingClientRect();
      return input.top - status.top >= 16;
    });
    await promptBox.getByRole("button", {name:"Stop"}).click();
    await thinkingStatus.getByText("Thinking", {exact: true}).waitFor({state: "hidden"});
    assert.equal(await promptBox.getAttribute("aria-busy"), null, "Stop closes the status and settles the control");
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

    const pillTabs = await demo("tab-pill");
    const overviewTab = pillTabs.getByRole("tab", {name:"Overview"});
    await overviewTab.press("ArrowRight");
    assert.equal(await pillTabs.getByRole("tab", {name:"Projects"}).getAttribute("aria-selected"), "true");

    const bottomBar = await demo("bottom-bar");
    const savedTab = bottomBar.getByRole("tab", {name:"Saved"});
    await savedTab.click();
    assert.equal(await savedTab.getAttribute("aria-selected"), "true");
    assert.equal(await bottomBar.getByRole("tab", {name:"Home"}).getAttribute("aria-selected"), "false");

    const segmented = await demo("segmented-control");
    await segmented.getByText("Year", {exact:true}).click();
    assert.match(await segmented.getByRole("status").textContent(), /this year/);

    const switches = await demo("toggle-switch");
    const wifi = switches.getByRole("switch", {name:/Wi-Fi/});
    assert.deepEqual(await wifi.evaluate(node => {
      const {width, height} = node.getBoundingClientRect();
      return [width, height];
    }), [52, 32]);
    await wifi.evaluate(node => Promise.allSettled(node.getAnimations({subtree:true}).map(animation => animation.finished)));
    const rightInset = await wifi.evaluate(node =>
      Math.round(node.getBoundingClientRect().right - node.querySelector("span").getBoundingClientRect().right));
    assert.equal(rightInset, 3, "The checked thumb remains inside the track");
    await wifi.press("Space");
    assert.equal(await wifi.getAttribute("aria-checked"), "false");

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
    const category = storage.getByRole("button", {name: /Source files/});
    await category.press("Enter");
    assert.equal(await category.getAttribute("aria-expanded"), "true");
    await storage.getByRole("button", {name: "Free up space"}).click();
    assert.equal(await meter.getAttribute("aria-valuenow"), "64");

    const letterLimit = await demo("letter-limit");
    const letterField = letterLimit.getByRole("textbox", {name: "Short bio"});
    await letterField.fill("a".repeat(60));
    assert.equal((await letterField.inputValue()).length, 48);
    assert.equal(await letterLimit.locator(".yg-letter-limit").getAttribute("data-limit-state"), "full");
    await letterLimit.getByRole("button", {name: "Post"}).click();
    assert.equal(await letterField.inputValue(), "");

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

    const price = await demo("range-slider");
    const minimum = price.getByRole("slider", {name:"Minimum price"});
    const maximum = price.getByRole("slider", {name:"Maximum price"});
    await minimum.press("ArrowRight");
    assert.equal(await minimum.getAttribute("aria-valuenow"), "200");
    await maximum.press("ArrowLeft");
    assert.equal(await maximum.getAttribute("aria-valuenow"), "750");
    await minimum.press("End");
    assert.equal(await minimum.getAttribute("aria-valuenow"), "750");
    assert.equal(await maximum.getAttribute("aria-valuemin"), "750");
    assert.equal(await price.locator(".yg-motion-range-area").getAttribute("data-joined"), "true");
    await minimum.press("Home");
    assert.equal(await minimum.getAttribute("aria-valuenow"), "0");

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
    await tasks.getByText("Verify the revision").waitFor();
    await summary.press("Enter");
    await tasks.getByText("Verify the revision").waitFor({state:"hidden"});
    await summary.press("Enter");
    await tasks.getByText("Verify the revision").waitFor();
    await tasks.getByRole("button", {name: "Complete step"}).click();
    await tasks.getByText("2 of 3 done", {exact: true}).waitFor();
    assert.equal(await tasks.locator("[data-active]").count(), 1);
    await tasks.getByRole("button", {name: "Mark failed"}).click();
    await tasks.getByText("Failed", {exact: true}).waitFor();
    await tasks.getByRole("button", {name: "Retry step"}).click();
    await tasks.locator('[data-active][data-state="running"]').waitFor();
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
    assert.equal(await yogurt.locator("output").getAttribute("data-quantity"), "2");
    await yogurt.getByRole("button", {name: "Decrease quantity of Greek yogurt"}).click();
    assert.equal(await yogurt.locator("output").getAttribute("data-quantity"), "1");
    await yogurt.getByRole("button", {name: "Remove Greek yogurt"}).press("Enter");
    assert(await add.evaluate(node => node === document.activeElement), "Removing the line focuses Add");
    assert.equal(await subtotal.textContent(), "$7.00");

    const berries = cart.getByRole("group", {name: "Blueberries"});
    const berryIncrease = berries.getByRole("button", {name: "Increase quantity of Blueberries"});
    await berryIncrease.scrollIntoViewIfNeeded();
    const increaseBox = await berryIncrease.boundingBox();
    await page.mouse.move(increaseBox.x + increaseBox.width / 2, increaseBox.y + increaseBox.height / 2);
    await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('#cart-button [aria-label="Quantity of Blueberries"]').dataset.quantity === "9");
    await page.mouse.up();
    assert.equal(await berryIncrease.getAttribute("aria-disabled"), "true");
    assert.equal(await berries.locator("output").getAttribute("data-quantity"), "9");
    await berryIncrease.press("Enter");
    await berries.getByText("Limit 9 per order", {exact:true}).waitFor();
    const berryDecrease = berries.getByRole("button", {name: "Decrease quantity of Blueberries"});
    const decreaseBox = await berryDecrease.boundingBox();
    await page.mouse.move(decreaseBox.x + decreaseBox.width / 2, decreaseBox.y + decreaseBox.height / 2);
    await page.mouse.down();
    await page.waitForFunction(() => document.querySelector('#cart-button [aria-label="Quantity of Blueberries"]').dataset.quantity === "1");
    await page.mouse.up();
    assert.equal(await berries.locator("output").getAttribute("data-quantity"), "1", "A held decrease keeps the last item");
    assert.equal(await subtotal.textContent(), "$3.50");
    await add.click();
    if (output) await cart.screenshot({path: join(output, "yogurt-cart-button.png"), animations: "disabled"});

    const slide = await demo("slide-confirm");
    const slideTrack = slide.locator(".yg-slide-confirm");
    const thumb = slide.locator(".yg-slide-confirm-handle");
    const trackBounds = await slideTrack.boundingBox();
    const thumbBounds = await thumb.boundingBox();
    const startX = thumbBounds.x + thumbBounds.width / 2;
    const startY = thumbBounds.y + thumbBounds.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 30, startY, {steps: 3});
    await page.mouse.up();
    assert.equal((await slide.getByRole("status").textContent()).trim(), "");
    await thumb.evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished)));
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(trackBounds.x + trackBounds.width - 24, startY, {steps: 12});
    await page.mouse.up();
    assert.equal((await slide.getByRole("status").textContent()).trim(), "Approved 1 time.");

    const pageTurn = await demo("page-flip");
    const currentPage = pageTurn.locator(".extra-page-current");
    await currentPage.getByText("PAGE 1", {exact: true}).waitFor();
    const paper = await currentPage.boundingBox();
    await page.mouse.move(paper.x + paper.width * .9, paper.y + paper.height * .72);
    await page.mouse.down();
    await page.mouse.move(paper.x + paper.width * .75, paper.y + paper.height * .72, {steps: 4});
    await page.mouse.up();
    await currentPage.getByText("PAGE 1", {exact: true}).waitFor();
    await currentPage.evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished)));
    await page.mouse.move(paper.x + paper.width * .9, paper.y + paper.height * .72);
    await page.mouse.down();
    await page.mouse.move(paper.x + paper.width * .42, paper.y + paper.height * .72, {steps: 8});
    await page.mouse.up();
    await currentPage.getByText("PAGE 2", {exact: true}).waitFor();
    await pageTurn.getByRole("button", {name:"Back", exact:true}).press("Enter");
    await currentPage.getByText("PAGE 1", {exact: true}).waitFor();

    await demo("cart-button");
    await page.emulateMedia({reducedMotion: "reduce"});
    assert.equal(await yogurt.locator(".yg-cart-stepper").evaluate(n => getComputedStyle(n).transitionDuration), "0s");
    await demo("task-list");
    assert.equal(await tasks.locator("[data-active]").evaluate(n =>
      getComputedStyle(n, "::after").animationName), "none");
    const thinking = await demo("thinking");
    await thinking.getByRole("button", {name: "Start thinking"}).click();
    assert.equal(await thinking.locator(".yg-thinking-dots").evaluate(n =>
      n.getAnimations({subtree: true}).length), 0);

    await page.close();
    console.log(JSON.stringify({interactivePatterns: ids.length, viewport: [320, 768, 1440], errors}));
  }
  assert.deepEqual(errors, []);
}

async function checkNeutralControls(browser, colorScheme) {
  const page = await browser.newPage({colorScheme, reducedMotion: "reduce"});
  const show = async id => {
    await page.goto(gallery("motion-patterns") + "#" + id);
    return page.locator(".motion-pattern-article#" + id);
  };
  const neutral = async (locator, property = "backgroundColor") => {
    const value = await locator.evaluate((node, key) => getComputedStyle(node)[key], property);
    const channels = value.match(/[\d.]+/g)?.map(Number);
    assert(channels?.length === 3 && channels.every(channel => channel === channels[0]),
      `${colorScheme} ${locator} ${property} must be opaque and neutral, got ${value}`);
    return value;
  };

  try {
    await page.goto(gallery("components") + "#button");
    const button = page.locator('[data-component="button"] .specimen-inner .yg-button[data-emphasis="filled"]').first();
    const buttonFill = await neutral(button);
    await button.hover();
    await button.evaluate(node => Promise.allSettled(node.getAnimations().map(animation => animation.finished)));
    assert.notEqual(await neutral(button), buttonFill, "The default button has a neutral hover response");

    await page.goto(gallery("components") + "#attention-inbox");
    const unread = page.locator('[data-component="attention-inbox"] .yg-badge').filter({hasText: /^Unread$/}).first();
    await neutral(unread);

    const prompt = await show("prompt-box");
    const editor = prompt.getByRole("textbox", {name: "Prompt"});
    const box = prompt.locator(".yg-prompt-box");
    const restingFill = await neutral(box);
    await editor.fill("Review the draft");
    assert.equal(await neutral(box), restingFill, "An active prompt keeps its surface");
    await neutral(editor, "caretColor");
    await neutral(prompt.getByRole("button", {name: "Send"}), "color");
    await neutral(prompt.getByRole("button", {name: "Send"}));
    await editor.press("Enter");
    await neutral(prompt.getByRole("status"), "color");
    await neutral(prompt.getByRole("button", {name: "Stop"}));

    const bottom = await show("bottom-bar");
    const barFill = await neutral(bottom.getByRole("tablist"));
    const saved = bottom.getByRole("tab", {name: "Saved"});
    await saved.hover();
    assert.notEqual(await neutral(saved), barFill);
    await saved.click();
    assert.equal(await saved.getAttribute("aria-selected"), "true");
    await neutral(saved, "color");
    assert.notEqual(await neutral(bottom.locator(".yg-selection-marker[data-ready]")), barFill);

    const command = await show("command-palette");
    await command.getByRole("button", {name: "Open command palette"}).click();
    await neutral(command.locator(".yg-inline-command"));
    await neutral(command.locator(".yg-inline-command-marker"));

    const dropdown = await show("spring-dropdown");
    await dropdown.getByRole("combobox", {name: "Workspace view"}).click();
    await neutral(page.getByRole("listbox"));
    await neutral(page.locator(".yg-spring-option[data-state=checked]"));

    const files = await show("file-drop");
    const dropZone = files.locator(".yg-file-drop");
    const dropFill = await neutral(dropZone);
    await dropZone.dispatchEvent("dragenter");
    await files.locator(".yg-file-drop[data-dragging]").waitFor();
    assert.notEqual(await neutral(dropZone), dropFill, "Drag-over changes the neutral fill");
    await files.locator('input[type="file"]').setInputFiles({
      name: "brief.txt", mimeType: "text/plain", buffer: Buffer.from("Draft"),
    });
    await files.locator(".yg-file-drop[data-accepted]").waitFor();
    const successFill = await neutral(dropZone.locator(".yg-file-drop-core"));
    const expected = await dropZone.evaluate(node => {
      const sample = document.createElement("span");
      sample.style.backgroundColor = "var(--yg-success-soft)";
      node.append(sample);
      const color = getComputedStyle(sample).backgroundColor;
      sample.remove();
      return color;
    });
    assert.equal(successFill, expected, "Accepted files retain the semantic success fill");

    const switches = await show("toggle-switch");
    await neutral(switches.getByRole("switch", {checked: true}).first());
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome"});
  try {
    await run(browser);
    for (const colorScheme of ["light", "dark"]) await checkNeutralControls(browser, colorScheme);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
