const {chromium} = require("playwright-core");
const {join} = require("node:path");
const {pathToFileURL} = require("node:url");
const assert = require("node:assert/strict");

const guide = pathToFileURL(join(__dirname, "../apps/guide/generated/motion-patterns.html")).href;
const button = (root, name) => root.getByRole("button", {name, exact:typeof name === "string"});
const byText = (root, text) => root.getByText(text, {exact:typeof text === "string"});
const click = async (root, name) => button(root, name).click();
const show = async (root, name, expected) => {
  await click(root, name);
  await byText(root, expected).waitFor();
};
const press = async (loc, input, expected) => {
  const before = await loc.getAttribute("aria-valuenow") ?? await loc.inputValue();
  await loc.press(input);
  const after = await loc.getAttribute("aria-valuenow") ?? await loc.inputValue();
  assert.notEqual(before, after);
  if (expected) assert.equal(after, expected);
};
const selected = async (node, attr) => assert.equal(await node.getAttribute(attr), "true");
const select = async (root, role, name, attr) => {
  const item = root.getByRole(role,{name,exact:true});
  await item.click();
  await selected(item, attr);
};
const file = {name:"brief.txt",mimeType:"text/plain",buffer:Buffer.from("Draft")};

const actions = {
  "agent-steps": async root => { await click(root,"Next step"); await root.locator('[aria-current="step"]').getByText("Draft the update").waitFor(); },
  "bottom-bar": root => select(root,"tab","Saved","aria-selected"),
  "swipe-deck": async (root,page) => {
    await click(root,"Next");
    await root.locator('[data-depth="0"]').getByText("Handoff").waitFor();
    await root.locator("[data-flight]").waitFor();
    await root.locator("[data-flight]").waitFor({state:"detached"});
    const card = root.locator('[data-depth="0"]');
    const rect = await card.boundingBox();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + 60);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width / 2 + 125, rect.y + 76,{steps:9});
    await page.mouse.up();
    await root.locator('[data-depth="0"]').getByText("Launch").waitFor();
  },
  "cart-button": async (root, page) => {
    const group = root.getByRole("group", {name: "Greek yogurt"});
    const add = button(group, "Add Greek yogurt");
    assert.equal(await group.locator(".yg-cart-decrease").isVisible(), false);
    const before = await group.boundingBox();
    await add.press("Enter");
    await byText(root, "$11.20").waitFor();
    const plus = button(group, "Increase quantity of Greek yogurt");
    await plus.press("Enter");
    assert.equal(await group.locator("output").getAttribute("data-quantity"), "2");
    assert.equal(await group.locator(".yg-cart-current").evaluate(el => getComputedStyle(el).animationName), "yg-cart-count");
    assert.equal(Math.round((await group.boundingBox()).width), Math.round(before.width));
    await button(group, "Decrease quantity of Greek yogurt").press("Enter");
    await button(group, "Remove Greek yogurt").press("Enter");
    await add.waitFor();
    assert.equal(await group.locator(".yg-cart-decrease").isVisible(), false);
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Add Greek yogurt");
    await page.emulateMedia({reducedMotion:"reduce"});
    try {
      await page.waitForFunction(() => {
        const stepper = document.querySelector('.yg-cart-control[aria-label="Greek yogurt"] .yg-cart-stepper');
        return stepper && matchMedia("(prefers-reduced-motion: reduce)").matches &&
          stepper.getAnimations({subtree:true}).length === 0;
      });
    } finally {
      await page.emulateMedia({reducedMotion:"no-preference"});
    }
  },
  "word-choice": root => show(root,"Next status","in review"),
  "checkbox-list": async root => {await root.locator(".yg-motion-checklist-item").first().click(); assert(await root.getByRole("checkbox").first().isChecked());},
  "checklist-card": async root => { await root.getByRole("checkbox").check(); assert(await root.getByRole("checkbox").isChecked()); },
  "command-button": async (root,page) => {
    await click(root,"Run command");
    const field = page.getByRole("combobox");
    await field.fill("Notes");
    await field.press("Enter");
    await byText(root,"Opened Notes").waitFor();
  },
  "command-palette": async (root,page) => {
    await click(root,"Open command palette");
    await page.waitForFunction(() => document.querySelector("#command-palette .yg-inline-command").offsetHeight > 148);
    await page.getByRole("combobox").fill("Source files");
    await page.getByRole("combobox").press("Enter");
    await byText(root,"Opened Source files").waitFor();
  },
  "connection-state": root => show(root,"Simulate connect","Connected"),
  "copy-button": async (root, page) => {
    await button(root, "Copy").click();
    await root.getByRole("status").getByText("Copied to clipboard.").waitFor();
    const copied = button(root, "Copied");
    await copied.waitFor();
    assert.equal(await copied.evaluate(node => node.style.getPropertyValue("--yg-copy-roll")), "1");
    await button(root, "Copy").waitFor();
  },
  "date-choice": async root => {
    const trigger = root.getByRole("button", { name: "Choose a date" });
    await trigger.click();
    await root.getByRole("button", { name: /November 21/ }).click();
    await byText(root, "Selected: 2026-11-21").waitFor();
    assert.equal(await trigger.getAttribute("data-state"), "closed");
    await root.getByRole("button", { name: "Clear" }).click();
    await byText(root, "No date selected").waitFor();
  },
  "detent-dial": root => press(root.getByRole("slider"),"ArrowRight","1"),
  "disclosure-toolbar": async root => { await byText(root,"Text formatting").click(); await select(root,"button","Bold","aria-pressed"); },
  "dynamic-menu": async (root,page) => {
    await click(root,"View actions");
    const menu = root.getByRole("menu");
    assert.equal(await root.locator(".yg-action-menu-expanding").getAttribute("data-open"), "true");
    await menu.waitFor({state:"visible"});
    await menu.getByRole("menuitem",{name:"Notes"}).click();
    await byText(root,"Opened Notes").waitFor();
    await menu.waitFor({state:"hidden"});
  },
  "dynamic-text": async root => {
    await root.getByRole("textbox").fill("Yogurt");
    assert.equal(await root.locator(".utility-greeting .motion-extra-sr").textContent(), "Yogurt");
  },
  "elastic-slider": async (root, page) => {
    const rail = root.locator(".yg-elastic-rail");
    const bounds = await rail.boundingBox();
    const y = bounds.y + 16;
    await page.mouse.move(bounds.x + bounds.width * .5, y);
    await page.mouse.down();
    try {
      await page.mouse.move(bounds.x + bounds.width + 34, y, {steps: 8});
      await page.waitForFunction(() => {
        const node = document.querySelector(".yg-elastic-rail");
        return node && parseFloat(node.style.getPropertyValue("--yg-elastic-thumb")) > node.clientWidth - 10;
      });
    } finally {
      await page.mouse.up();
    }
    const slider = root.getByRole("slider");
    assert.equal(await slider.getAttribute("aria-valuenow"), "100");
    await press(slider, "Home", "0");
  },
  "expand-card": async root => { await root.locator("summary").click(); await byText(root,"See the source, changes and next action.").waitFor(); },
  "activity-island": async root => { const item=root.getByRole("button");await item.click();await selected(item,"aria-expanded"); },
  "exposure": root => press(root.getByRole("slider"),"ArrowRight","0.1"),
  "fan-cards": async (root, page) => {
    const item = button(root, /draft the update/i);
    await item.click();
    await selected(item, "aria-pressed");
    await page.setViewportSize({width:390,height:844});
    try {
      const cards = root.locator(".yg-fan-cards-list button");
      for (const card of await cards.all()) {
        await card.click();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const rect = await card.boundingBox();
        assert(rect.x >= 0 && rect.x + rect.width <= 390, "selected card fits the viewport");
      }
    } finally {
      await page.setViewportSize({width:1280,height:900});
    }
  },
  "file-drop": async root => {
    await root.locator('input[type="file"]').setInputFiles(file);
    await root.getByRole("progressbar",{name:"Preparing selected files"}).waitFor();
    await root.locator("[data-accepted]").waitFor({timeout:4000});
    await byText(root,"Files selected").waitFor();
  },
  "focus-mode": async root => {await select(root,"switch","Focus mode","aria-checked");await byText(root,"Priority only").waitFor();},
  "focus-options": async root => { await byText(root,"Focus").click(); await root.locator('[aria-pressed="true"], [aria-checked="true"], [data-selected="true"]').getByText("Focus",{exact:true}).waitFor(); },
  "folded-note": root => show(root,"Open note","The next review is ready for a second reader."),
  "formatting-toolbar": async (root, page) => {
    const marker = root.locator(".motion-format-marker");
    const before = await marker.evaluate(node => node.offsetLeft);
    await select(root, "button", "Underline", "aria-pressed");
    await page.waitForFunction(x => document.querySelector(".motion-format-marker").offsetLeft > x + 15, before);
  },
  "ghost-suggestion": async root => {
    const input = root.getByRole("textbox");
    assert.equal(await input.inputValue(), "Review");
    await input.focus();
    await input.evaluate(element => element.setSelectionRange(element.value.length, element.value.length));
    await input.press("ArrowRight");
    assert.equal(await input.inputValue(), "Review the workspace notes");
    assert.equal(await input.evaluate(element => element === document.activeElement), true);
  },
  "hold-button": async (root, page) => {
    await root.locator(".yg-hold-confirm").hover();
    await page.mouse.down();
    try {
      await byText(root, "Keep holding").waitFor();
      await page.waitForFunction(() => {
        const value = Number(document.querySelector(".yg-hold-confirm").style.getPropertyValue("--yg-confirm-progress"));
        return value > .15 && value < .9;
      });
    } finally {
      await page.mouse.up();
    }
    assert.equal(await byText(root, "Approved 1 time.").count(), 0);
    await page.waitForFunction(() => {
      const animation = document.querySelector(".yg-hold-confirm .yg-confirm-fill").getAnimations()[0];
      return !animation || animation.playState === "finished";
    });
    await page.mouse.down();
    try {
      await byText(root, "Approved 1 time.").waitFor();
      await root.locator(".yg-hold-check").waitFor();
    } finally {
      await page.mouse.up();
    }
  },
  "invite-people": async root => {await root.getByRole("textbox",{name:"Email address"}).fill("kai@example.com");await show(root,"Add person","1 person added");},
  "letter-limit": async root => {
    const input = root.getByRole("textbox");
    const control = root.locator(".yg-letter-limit");
    const count = root.locator(".yg-letter-count");
    await input.fill("A".repeat(38));
    assert.equal(await control.getAttribute("data-limit-state"), "near");
    assert.equal(await count.innerText(), "10 remaining");
    const nearColor = await count.evaluate(node => getComputedStyle(node).color);
    await input.fill("A".repeat(48));
    await input.press("x");
    assert.equal(await input.inputValue(), "A".repeat(48));
    assert.equal(await control.getAttribute("data-limit-state"), "full");
    assert.equal(await count.innerText(), "0 remaining");
    assert(await count.isVisible());
    assert.notEqual(await count.evaluate(node => getComputedStyle(node).color), nearColor);
  },
  "loading-to-success": async (root, page) => {
    await click(root, "Save changes");
    await button(root, "Saving").waitFor();
    await page.waitForFunction(() => document.querySelector(".yg-result-morph").offsetWidth < 64);
    await button(root, "Saved").waitFor();
  },
  "marker-text": async root => { await button(root,/Replay/).click(); const count=await root.locator(".extra-ink").evaluateAll(list=>list.flatMap(el=>el.getAnimations({subtree:true})).length);assert(count>0); },
  "masked-example": root => show(root,"Show number","4242 4242 4242 1234"),
  "mention-picker": async (root,page) => {
    const field=root.locator("textarea");await field.fill("Ask @");await field.press("End");
    await root.getByRole("option",{name:"Sol"}).waitFor();await field.press("ArrowDown");
    await selected(root.getByRole("option",{name:"Sol"}),"aria-selected");
    await page.waitForFunction(() => parseFloat(document.querySelector("#mention-picker .yg-mention-marker").style.getPropertyValue("--yg-mention-top")) > 20);
    await field.press("Enter");
    assert.equal((await field.inputValue()).trim(),"Ask @Sol");
    for (const person of ["Morgan", "Kai", "Sol"]) {
      await field.fill("Ask @" + person[0].toLowerCase());
      await root.getByRole("option", {name:person, exact:true}).click();
      await page.waitForFunction(name => document.querySelector("#mention-picker textarea").value.trim() === "Ask @" + name, person);
    }
  },
  "morph-tooltip": async (root, page) => {
    const first = button(root, "Storage details");
    await first.hover();
    const tooltip = root.getByRole("tooltip");
    await tooltip.waitFor();
    await page.waitForFunction(() => Number(document.querySelector(".yg-tooltip-bar")?.style.getPropertyValue("--yg-tooltip-open")) > .85);
    const tail = await root.locator(".yg-tooltip-bar-tail").evaluate(node => node.offsetLeft);
    const last = button(root, "Help");
    await last.hover();
    await page.waitForFunction(previous => document.querySelector(".yg-tooltip-bar-tail").offsetLeft > previous + 18, tail);
    await last.press("Escape");
    await tooltip.waitFor({state: "hidden"});
  },
  "music-player": root => show(root,"Play","Playing preview"),
  "note-pagination": root => show(root,"Next","Note 2 of 3"),
  "notification-bell": root => show(root,"Notifications","Notifications on"),
  "notifications": async (root, page) => {
    await show(root, "Add notification", "Update 1 received.");
    await show(root, "Add notification", "Update 2 received.");
    await show(root, "Add notification", "Update 3 received.");
    await show(root, "Add notification", "Update 4 received.");
    await click(root, "Show all 4");
    const stack = root.locator(".yg-toast-stack-stage");
    await page.waitForFunction(() => document.querySelector(".yg-toast-stack-stage").offsetHeight > 150);
    const top = stack.locator(".yg-toast-swipe").first();
    const bounds = await top.boundingBox();
    await page.mouse.move(bounds.x + 16, bounds.y + 20);
    await page.mouse.down();
    await page.mouse.move(bounds.x + 145, bounds.y + 20, {steps: 8});
    await page.mouse.up();
    await byText(root, "Update 4 received.").waitFor({state: "detached"});
    const remaining = byText(root, "Update 1 received.");
    await remaining.waitFor();
    await byText(root, "Update 2 received.").waitFor();
    await byText(root, "Update 3 received.").waitFor();
    const colors = await remaining.evaluate(node => ({
      foreground: getComputedStyle(node).color,
      background: getComputedStyle(node.closest(".yg-toast")).backgroundColor,
    }));
    assert.notEqual(colors.foreground, colors.background);
    for (const id of [1, 2, 3]) {
      const entry = byText(root, `Update ${id} received.`).locator('xpath=ancestor::*[@data-yg-toast-id]');
      await entry.getByRole('button', {name:'Dismiss notification'}).click();
      if (id === 3) {
        // Keeping the shared stack mounted allows its last notice to exit.
        await page.waitForFunction(() => document.querySelector('#notifications [data-yg-toast-id="3"][data-exiting]'));
      }
      await entry.waitFor({state:'detached'});
    }
  },
  "number-stepper": async root => {await click(root,"Add guest");await root.locator(".yg-quantity-in").getByText("4").waitFor();},
  "otp": async (root, page) => {
    const input = root.getByRole("textbox", {name:"Verification code"});
    await input.fill("12345");
    const otp = root.locator(".yg-otp");
    const measure = () => otp.evaluate(node => {
      const slots = node.querySelector(".yg-otp-slots");
      return {
        width: node.getBoundingClientRect().width,
        slot: slots.firstElementChild.getBoundingClientRect().width,
        gap: parseFloat(getComputedStyle(slots).columnGap),
        ring: getComputedStyle(slots.querySelector("[data-cursor]")).outlineStyle,
      };
    });
    const editing = await measure();
    assert(editing.width >= 230 && editing.slot >= 30 && editing.gap === 8 && editing.ring === "none",
      JSON.stringify(editing));
    await input.press("6");
    await root.getByRole("status").getByText("Verified").waitFor();
    assert.equal(await otp.getAttribute("data-verified"), "true");
    await page.waitForFunction(() => {
      const node = document.querySelector("#otp .yg-otp");
      return Array.from(node.querySelectorAll(".yg-otp-ink")).every(digit => Number(getComputedStyle(digit).opacity) < .02)
        && Number(getComputedStyle(node.querySelector(".yg-otp-confirmation")).opacity) > .95;
    });
    const confirmed = await measure();
    assert(confirmed.gap <= .2 && Math.abs(confirmed.slot - editing.slot) < .5 &&
      Math.abs(confirmed.width - editing.width) < .5, JSON.stringify(confirmed));
    await input.press("Backspace");
    await root.getByRole("status").waitFor({state:"detached"});
    assert.equal(await input.inputValue(), "12345");
  },
  "page-flip": async root => {await click(root,"Turn page");await root.locator(".extra-page-current").getByText("PAGE 2").waitFor();await root.locator(".extra-page-turning").waitFor();},
  "pagination-dots": root => show(root,"Step 2: Find a direction","Find a direction"),
  "password-strength": async root => {
    const field = root.getByLabel("Create a password");
    await field.fill("LongCookie7+");
    await root.getByRole("status").getByText("Strong").waitFor();
    const inputBefore = await field.boundingBox();
    await button(root, "Show password").click();
    assert.equal(await field.getAttribute("type"), "text");
    assert.equal(await field.inputValue(), "LongCookie7+");
    assert.deepEqual(await field.boundingBox(), inputBefore);
    assert(await field.evaluate(node => node === document.activeElement));
    await button(root, "Hide password").click();
    assert.equal(await field.getAttribute("type"), "password");
  },
  "plan-options": async root => { await byText(root,"Studio").click(); await root.locator('[aria-pressed="true"], [aria-checked="true"], [data-selected="true"]').getByText("Studio",{exact:true}).waitFor(); },
  "plan-switch": async (root, page) => {
    await byText(root, "Yearly").click();
    await byText(root, "$240 billed yearly").waitFor();
    const action = root.locator(".yg-result-morph");
    const width = (await action.boundingBox()).width;
    await click(root, "Review plan");
    await page.waitForFunction(() => {
      const node = document.querySelector("#plan-switch .yg-result-morph");
      return Math.abs(node.offsetWidth - node.offsetHeight) <= 1;
    });
    const offset = await action.evaluate(node => {
      const spin = node.querySelector(".yg-result-morph-spinner").getBoundingClientRect();
      const surface = node.getBoundingClientRect();
      return Math.abs(spin.left + spin.right - surface.left - surface.right) / 2;
    });
    assert(offset < 1, `The plan spinner is off center by ${offset}px`);
    await button(root, "Plan reviewed").waitFor();
    await page.waitForFunction(ready => Math.abs(document.querySelector("#plan-switch .yg-result-morph").offsetWidth - ready) <= 1, width);
  },
  "preview-scale": async root => {await press(root.getByRole("slider"),"ArrowRight","110");await byText(root,"110%").waitFor();},
  "profile-card": async (root, page) => {
    const follow = button(root, "Follow Kai");
    const before = await follow.evaluate(node => node.offsetWidth);
    await follow.click();
    await page.waitForFunction(initial => {
      const width = document.querySelector("#profile-card .motion-profile-actions button").offsetWidth;
      return width > initial * .54 && width < initial * .95;
    }, before);
    await byText(root, "Reviews new drafts and flags decisions.").waitFor();
    await selected(button(root, "Following Kai"), "aria-pressed");
    await show(root, "Message", "A message draft is ready for Kai.");
  },
  "prompt-box": async root => {const input=root.getByRole("textbox",{name:"Prompt"});await input.fill("Summarize the review");await input.press("Enter");await root.getByRole("status").getByText("Thinking").waitFor();await click(root,"Stop");await input.waitFor();},
  "quantity-stepper": async root => {await click(root,"Add one copy");await root.locator("output").getByText("2").waitFor();},
  "range-slider": root => press(root.getByRole("slider",{name:"Minimum price"}),"ArrowRight","200"),
  "rating": async root => { const item = root.getByRole("radio", {name: "4 of 5"}); await item.check(); assert(await item.isChecked()); },
  "read-along": async (root,page) => {
    const marker = root.locator(".extra-reading-marker");
    const start = await marker.evaluate(el=>el.style.getPropertyValue("--reading-left"));
    await click(root,"Next word");
    await byText(root,"Word 2 of 11").waitFor();
    await page.waitForFunction(start => document.querySelector(".extra-reading-marker")?.style.getPropertyValue("--reading-left") !== start, start);
  },
  "refresh-activity": async root => {
    await click(root,"Refresh activity");
    await byText(root,"Updating…").waitFor();
    await byText(root,"Refreshed 1 time in this preview").waitFor();
  },
  "scrubber": root => press(root.getByRole("slider"),"ArrowRight","37"),
  "segmented-control": async root => {await byText(root,"Year").click();await root.getByRole("status").getByText("year").waitFor();},
  "sidebar-collapse": root => show(root,"Collapse","Expand"),
  "slide-confirm": async (root, page) => {
    const slide = root.locator(".yg-slide-confirm");
    const handle = slide.locator(".yg-slide-confirm-handle");
    await handle.hover();
    const track = await slide.boundingBox(), thumb = await handle.boundingBox();
    await page.mouse.down();
    try {
      await page.mouse.move(track.x + track.width - 12, thumb.y + thumb.height / 2, {steps: 12});
    } finally {
      await page.mouse.up();
    }
    await byText(root, "Approved 1 time.").waitFor();
  },
  "smooth-tabs": root => select(root,"tab","Notes","aria-selected"),
  "spring-dropdown": async (root,page) => {
    await root.getByRole("combobox").press("Space");
    await page.getByRole("option",{name:"In review"}).click();
    await page.getByRole("listbox").waitFor({state:"hidden"});
    await root.getByRole("combobox").getByText("In review").waitFor();
  },
  "spring-input": async root => {
    const input = root.getByRole("textbox");
    await input.fill("Review workspace");
    assert.equal(await input.inputValue(), "Review workspace");
    await input.press("Enter");
    await root.getByRole("status").getByText("Workspace named").waitFor();
  },
  "star-rating": async root => {
    const item = root.getByRole("radio", {name: "5 of 5"});
    await item.focus();
    await item.press("Space");
    assert(await item.isChecked());
  },
  "stat-card": root => show(root,"Review a record","25"),
  "step-progress": async root => {await click(root,"Next step");assert.equal(await root.getByRole("progressbar").getAttribute("value"),"2");await root.locator('[data-complete]').waitFor();},
  "storage-meter": async root => {
    await click(root,"Add files");await button(root,/Source files/).click();await click(root,"Free up space");
    await root.locator('[data-outcome="pending"]').waitFor();
    const confirm = button(root, "Space freed");
    await confirm.waitFor();
    const box = await confirm.boundingBox();
    assert(box.height <= 56, `The storage action expanded to ${box.height}px`);
    assert.equal(await root.getByRole("meter").getAttribute("aria-valuenow"),"64");
  },
  "streaming-reply": async root => {await click(root,"Stream a reply");await root.locator(".yg-streaming-reply[aria-busy='true']").waitFor();await byText(root,/next revision/).waitFor();},
  "tab-pill": async root => {
    await select(root, "tab", "Projects", "aria-selected");
    const rows = await root.getByRole("tab").evaluateAll(tabs => new Set(tabs.map(tab => Math.round(tab.getBoundingClientRect().top))).size);
    assert.equal(rows, 1);
  },
  "tag-input": async root => {await root.getByRole("textbox",{name:"Tags"}).fill("Ready");await click(root,"Add tag");await root.locator(".motion-tag-chip").filter({hasText:"Ready"}).waitFor();},
  "task-list": async root => {await byText(root,"Example controls").click();await show(root,"Complete step","2 of 3 done");},
  "thinking": async (root, page) => {
    await click(root, "Start thinking");
    await root.getByRole("status", {name:"Thinking"}).waitFor();
    await page.waitForFunction(() => Array.from(document.querySelectorAll("#thinking .yg-thinking-dots i"))
      .slice(1).some(dot => Number.parseFloat(dot.style.translate.split(" ")[1]) < -.4));
    await click(root, "Stop thinking");
  },
  "tooltip-detail": async (root, page) => {
    const trigger = button(root, "Review scope");
    await trigger.focus();
    await root.getByRole("tooltip").getByText("Only confirmed readings are included.").waitFor();
    await trigger.press("Escape");
    await root.getByRole("tooltip").waitFor({state:"hidden"});
    assert(await trigger.evaluate(el => el === document.activeElement));
  },
  "toggle-switch": async root => {const item=root.getByRole("switch",{name:/Low power/});await item.click();await selected(item,"aria-checked");},
  "tool-approval": root => show(root,"Allow once","Allowed in preview"),
  "boarding-pass": root => show(root,"Simulate gate change","Gate moved to B31"),
  "parallax-ticket": async root => {await click(root,"Show ticket details");await selected(button(root,"Show ticket front"),"aria-pressed");},
  "undo-action": root => show(root,"Remove","You can undo this change"),
  "unlock-state": async root => {await click(root,"Simulate unlock");await byText(root,"Checking preview").waitFor();await byText(root,"Preview unlocked").waitFor({timeout:3800});},
  "volume-control": root => show(root,"Mute","Muted"),
  "wheel-picker": async (root, page) => {
    const wheel = root.getByRole("listbox");
    await wheel.press("ArrowDown");
    await selected(root.getByRole("option", {name:"Midday"}), "aria-selected");
    const bounds = await wheel.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 - 45, {steps: 8});
    const rotation = await wheel.evaluate(node => parseFloat(node.style.getPropertyValue("--wheel-turn")));
    assert(rotation > 40 && rotation < 55);
    await page.mouse.up();
    await wheel.press("Home");
    await selected(root.getByRole("option", {name:"Morning"}), "aria-selected");
  },
};

(async () => {
  const browser = await chromium.launch({channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome"});
  const results = [];
  try {
    const context = await browser.newContext({viewport:{width:1280,height:900}, permissions:["clipboard-read","clipboard-write"]});
    const index = await context.newPage();
    await index.goto(guide);
    const entries = index.locator('[aria-label="Pattern index"] a');
    await entries.first().waitFor({state: "attached"});
    const ids = await entries.evaluateAll(links => links.map(link => link.hash.slice(1)));
    await index.close();
    assert.deepEqual(Object.keys(actions).sort(), ids.slice().sort());
    const queue = ids.slice();
    await Promise.all(Array.from({length:4},async () => {
      const page = await context.newPage();
      page.setDefaultTimeout(4000);
      let crash;
      page.on("pageerror", error=>{crash = error.message;});
      while(queue.length) {
        const id = queue.shift();
        crash = undefined;
        try {
          await page.goto(guide+"#"+id);
          const root=page.locator("#"+id);
          await root.waitFor();
          await actions[id](root,page);
          if (crash) throw Error(crash);
          results.push({id, pass:true});
        } catch (error) {
          results.push({id,pass:false,error:String(error).split("\n").slice(0,4).join(" ")});
        }
      }
      await page.close();
    }));
  } finally {await browser.close();}
  const failed = results.filter(item => !item.pass);
  for (const result of failed) console.error(result.id, result.error);
  assert.deepEqual(failed, []);
  console.log(`${results.length} motion gallery interactions passed.`);
})().catch(error=>{console.error(error);process.exitCode=1});
