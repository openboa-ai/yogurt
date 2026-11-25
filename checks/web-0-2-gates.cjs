const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium, webkit } = require("playwright-core");

const rootDir = path.resolve(__dirname, "..");
const siteDir = path.join(rootDir, "site");
const componentsUrl = pathToFileURL(path.join(rootDir, "apps/guide/generated/components.html")).href;

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
      if (!filePath.startsWith(siteDir)) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(siteDir, "index.html");
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, origin: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function hasPlaywrightWebKit() {
  const cacheDir = path.join(os.homedir(), "Library/Caches/ms-playwright");
  if (!fs.existsSync(cacheDir)) return false;
  return fs.readdirSync(cacheDir).some((entry) => entry.startsWith("webkit-"));
}

async function checkFocusVisible(page) {
  const targets = [
    ["button", 'button.yg-button:not(:disabled)'],
    ["icon-button", 'button.yg-icon-button:not(:disabled)'],
    ["text-field", '.yg-input input:not(:disabled)'],
    ["select", 'button.yg-select-trigger:not(:disabled)'],
    ["switch", '[role="switch"]:not(:disabled)'],
    ["checkbox", '[role="checkbox"]:not(:disabled)'],
    ["radio-group", '[role="radio"]:not(:disabled)'],
    ["tabs", '[role="tab"]:not(:disabled)'],
    ["segmented-control", '.yg-segment button:not(:disabled)'],
    ["action-menu", 'button[aria-haspopup="menu"]:not(:disabled)'],
    ["slider", 'input[type="range"]:not(:disabled)'],
    ["toggle", 'button.yg-toggle:not(:disabled)'],
    ["popover", 'button.yg-button:not(:disabled)'],
    ["dialog", 'button.yg-button:not(:disabled)'],
    ["input-otp", '.yg-otp input:not(:disabled)'],
  ];

  for (const [id, selector] of targets) {
    await page.goto(`${componentsUrl}#${id}`);
    const specimen = page.locator(`.specimen[data-component="${id}"]`);
    await specimen.waitFor();
    const control = specimen.locator(selector).first();
    await control.waitFor();

    // Keyboard focus via Tab onto the target (or roving widget) so :focus-visible activates naturally.
    await control.evaluate((node) => {
      const probe = document.createElement("button");
      probe.id = "__focus_probe__";
      probe.type = "button";
      probe.textContent = ".";
      probe.style.cssText = "position:fixed;top:0;left:0;opacity:0;width:1px;height:1px;";
      const container = node.closest(".yg-segment, [role='tablist'], .yg-radio") ?? node;
      container.parentElement.insertBefore(probe, container);
      probe.focus();
    });
    await page.keyboard.press("Tab");
    const ring = await control.evaluate((node) => {
      const probe = document.getElementById("__focus_probe__");
      if (probe) probe.remove();
      const active = document.activeElement;
      const widget = node.closest(".yg-segment, [role='tablist'], .yg-radio");
      const checkEl = (el, pseudo) => {
        if (!el) return null;
        const s = getComputedStyle(el, pseudo);
        const outlineVisible = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 1.5;
        const shadowVisible = Boolean(s.boxShadow && s.boxShadow !== "none");
        return { tag: el.tagName + (pseudo || ""), cls: el.className, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow, ok: outlineVisible || shadowVisible };
      };
      const otpSlot = node.closest(".yg-otp")?.querySelector("[data-active]");
      const candidates = [
        [active],
        [node],
        [node.closest(".yg-input")],
        [node.closest(".yg-value-slider")?.querySelector("[data-slot='slider-thumb']")],
        [otpSlot],
        [otpSlot, "::before"],
      ].filter(([el]) => Boolean(el));
      const checked = candidates.map(([el, pseudo]) => checkEl(el, pseudo));
      const focused = active === node || node.contains(active) || Boolean(widget && widget.contains(active));
      return { focused, anyVisible: checked.some((c) => c && c.ok), checked };
    });
    assert(ring.focused, `${id}: keyboard Tab must focus control (${JSON.stringify(ring)})`);
    assert(ring.anyVisible, `${id}: visible :focus-visible ring missing (${JSON.stringify(ring)})`);
  }
}

async function checkZeroMountFlyIn(page) {
  for (const id of ["segmented-control", "tabs"]) {
    await page.goto(`${componentsUrl}#${id}`);
    const specimen = page.locator(`.specimen[data-component="${id}"]`);
    await specimen.waitFor();
    const state = await specimen.evaluate((root, componentId) => {
      const container = componentId === "segmented-control"
        ? root.querySelector(".yg-segment")
        : root.querySelector('[role="tablist"]');
      const marker = container?.querySelector(".yg-selection-marker");
      const active = container?.querySelector('[data-state="on"], [aria-selected="true"]');
      if (!container || !marker || !active) return { missing: true };
      const m = marker.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      const dir = container.getAttribute("data-activation-direction");
      const anims = marker.getAnimations().length;
      return {
        dir,
        anims,
        dx: Math.abs(m.left - a.left),
        dw: Math.abs(m.width - a.width),
      };
    }, id);
    assert(!state.missing, `${id}: active indicator missing`);
    assert(state.dir === null || state.dir === "none", `${id}: initial data-activation-direction must not indicate motion (${JSON.stringify(state)})`);
    assert.equal(state.anims, 0, `${id}: marker must not animate on initial mount (${JSON.stringify(state)})`);
    assert(state.dx <= 2 && state.dw <= 2, `${id}: marker must mount directly on active item (${JSON.stringify(state)})`);
  }
}

async function checkProjectAccessGeometry(page, origin) {
  await page.goto(`${origin}/patterns/project-access`);
  await page.getByRole("heading", { name: "ProjectAccess", level: 1 }).waitFor();
  const stage = page.locator(".template-stage");
  await stage.waitFor();

  const metrics = await stage.evaluate((root) => {
    const stageBox = root.getBoundingClientRect();
    const content = root.firstElementChild.getBoundingClientRect();
    const leftMargin = content.left - stageBox.left;
    const rightMargin = stageBox.right - content.right;

    const emailWrapper = root.querySelector(".yg-access-invite .yg-input");
    const roleTrigger = root.querySelector(".yg-access-invite .yg-select-trigger");
    const inviteBtn = root.querySelector('.yg-access-invite button[type="submit"]');
    const emailBox = emailWrapper.getBoundingClientRect();
    const roleBox = roleTrigger.getBoundingClientRect();
    const btnBox = inviteBtn.getBoundingClientRect();

    const ownerRow = root.querySelector(".yg-access-list .yg-row");
    const ownerTitle = ownerRow.querySelector(".yg-row-title-line .yg-row-title").getBoundingClientRect();
    const ownerBadge = ownerRow.querySelector(".yg-row-title-line .yg-badge").getBoundingClientRect();

    const memberControls = root.querySelector(".yg-access-member-controls");
    const memberSelect = memberControls.querySelector(".yg-select-trigger").getBoundingClientRect();
    const memberMenu = memberControls.querySelector("button.yg-icon-button, button.yg-button:not(.yg-select-trigger)").getBoundingClientRect();

    return {
      centeredDiff: Math.abs(leftMargin - rightMargin),
      inviteHeights: [Math.round(emailBox.height), Math.round(roleBox.height), Math.round(btnBox.height)],
      inviteBottomDiff: Math.max(
        Math.abs(emailBox.bottom - roleBox.bottom),
        Math.abs(emailBox.bottom - btnBox.bottom),
      ),
      ownerBadgeGap: ownerBadge.left - ownerTitle.right,
      ownerBadgeRowDiff: Math.abs((ownerBadge.top + ownerBadge.bottom) / 2 - (ownerTitle.top + ownerTitle.bottom) / 2),
      memberSelectHeight: Math.round(memberSelect.height),
      memberMenuHeight: Math.round(memberMenu.height),
      memberHeightDiff: Math.abs(memberSelect.height - memberMenu.height),
      memberCenterDiff: Math.abs((memberSelect.top + memberSelect.bottom) / 2 - (memberMenu.top + memberMenu.bottom) / 2),
    };
  });

  assert(metrics.centeredDiff <= 2, `ProjectAccess must be centered in .template-stage (${JSON.stringify(metrics)})`);
  assert.deepEqual(metrics.inviteHeights, [32, 32, 32], `Invite bar height parity (${JSON.stringify(metrics)})`);
  assert(metrics.inviteBottomDiff <= 1.5, `Invite bar baseline alignment (${JSON.stringify(metrics)})`);
  assert(metrics.ownerBadgeGap >= 2 && metrics.ownerBadgeGap <= 24, `Owner badge inline proximity (${JSON.stringify(metrics)})`);
  assert(metrics.ownerBadgeRowDiff <= 4, `Owner badge same line as title (${JSON.stringify(metrics)})`);
  assert.equal(metrics.memberSelectHeight, 28, `Member role select must be 28px compact (${JSON.stringify(metrics)})`);
  assert.equal(metrics.memberMenuHeight, 28, `Member action menu must be 28px compact (${JSON.stringify(metrics)})`);
  assert(metrics.memberHeightDiff <= 1.5 && metrics.memberCenterDiff <= 2, `Member controls alignment (${JSON.stringify(metrics)})`);
}

async function checkSelectAndPopover(browser, engineName) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    await page.goto(`${componentsUrl}#select`);
    const select = page.getByRole("combobox", { name: "Project", exact: true });
    await select.click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    await page.getByRole("option", { name: "Yogurt", exact: true }).click();
    await listbox.waitFor({ state: "hidden" });
    assert.match(await select.innerText(), /Yogurt/, `${engineName} Select pointer choice`);

    await select.focus();
    await page.keyboard.press("Space");
    await page.locator(".yg-select-popup [data-highlighted]").waitFor();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await listbox.waitFor({ state: "hidden" });
    assert.match(await select.innerText(), /Meatball/, `${engineName} Select keyboard choice`);

    await page.goto(`${componentsUrl}#popover`);
    const trigger = page.getByRole("button", { name: "About this view", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "About this view", exact: true });
    await dialog.waitFor();
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate((el) => el === document.activeElement), true, `${engineName} Popover focus return`);
    assert.deepEqual(errors, [], `${engineName} zero page errors`);
  } finally {
    await page.close();
  }
}

async function checkHostedGuide(browser, origin) {
  const sections = [
    ["/tokens", "Tokens"],
    ["/components", "Button"],
    ["/patterns", "Patterns"],
    ["/examples", "Sourdough Studio"],
  ];
  for (const appearance of ["light", "dark"]) {
    for (const width of [1440, 1150, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: appearance });
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(String(err)));
      try {
        for (const [route, title] of sections) {
          await page.goto(`${origin}${route}`);
          await page.getByRole("heading", { name: title, level: 1, exact: true }).waitFor();
          assert.equal(await page.locator(".guide-shell").getAttribute("data-appearance"), appearance);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          assert(overflow <= 1, `${appearance} ${width}px ${route} horizontal overflow: ${overflow}px`);

          if (route === "/examples" && width === 1440 && appearance === "light") {
            const rootMetrics = await page.evaluate(() => ({
              htmlFontSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
              bodyFontSize: parseFloat(getComputedStyle(document.body).fontSize),
              railW: Math.round(document.querySelector(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel")?.getBoundingClientRect().width || 0),
              nestedSidebars: document.querySelectorAll(".studio-demo .yg-sidebar-layout").length,
              inspectorW: Math.round(document.querySelector(".studio-inspector")?.getBoundingClientRect().width || 0),
            }));
            assert.equal(rootMetrics.htmlFontSize, 16, `Root html font-size must stay 16px so rem tokens do not double-shrink (${JSON.stringify(rootMetrics)})`);
            assert.equal(rootMetrics.bodyFontSize, 13, `Body font-size must resolve to 13px (${JSON.stringify(rootMetrics)})`);
            assert(rootMetrics.railW >= 260 && rootMetrics.railW <= 276, `Bot roster sidebar width must stay ~268px (${JSON.stringify(rootMetrics)})`);
            assert.equal(rootMetrics.nestedSidebars, 1, `Studio must use a clean 3-pane single-sidebar layout (${JSON.stringify(rootMetrics)})`);
            assert(rootMetrics.inspectorW >= 302 && rootMetrics.inspectorW <= 318, `Right computer drawer width must stay ~310px (${JSON.stringify(rootMetrics)})`);

            // Exercise Studio interactive flows.
            await page.getByRole("radio", { name: "Trace", exact: true }).click();
            await page.getByText("Worked on Kai’s computer").first().waitFor();
            await page.getByRole("radio", { name: "Diff", exact: true }).click();
            await page.getByText("diff · Morning brief.md").waitFor();
            await page.getByRole("radio", { name: "Stream", exact: true }).click();
            await page.getByText("Source verification gate").waitFor();
            await page.getByRole("button", { name: "Hold REG-04", exact: true }).click();
            await page.getByText("Held REG-04").waitFor();
            await page.getByRole("button", { name: "Approve brief", exact: true }).click();
            await page.getByRole("button", { name: "Brief approved", exact: true }).waitFor();
            await page.getByRole("button", { name: "Sol", exact: true }).click();
            await page.getByText("RUN-408").waitFor();
            await page.locator(".studio-kbd-trigger").click();
            const searchDialog = page.getByRole("dialog", { name: "Search workspace" });
            await searchDialog.waitFor();
            await page.keyboard.press("Escape");
            await searchDialog.waitFor({ state: "hidden" });
            await page.getByRole("button", { name: "Settings", exact: true }).click();
            assert.equal(await page.getByRole("button", { name: "Save preferences", exact: true }).isDisabled(), true, "Save preferences must be disabled until dirty");
            await page.getByRole("switch", { name: "Show agent steps" }).click();
            await page.getByRole("button", { name: "Save preferences", exact: true }).click();
            await page.getByText("Preferences saved.").waitFor();
          }
          if (route === "/examples" && width === 1150 && appearance === "light") {
            await page.getByRole("radio", { name: "Trace", exact: true }).click();
            await page.getByText("Worked on Kai’s computer").first().waitFor();
            await page.getByRole("radio", { name: "Diff", exact: true }).click();
            await page.getByText("diff · Morning brief.md").waitFor();
            await page.getByRole("radio", { name: "Stream", exact: true }).click();
            await page.getByText("Source verification gate").waitFor();
          }
          if (route === "/tokens") {
            const ramp = await page.evaluate(() => {
              const container = document.querySelector(".guide-color-matrix").getBoundingClientRect();
              const step950 = document.querySelector('[aria-label^="neutral 950"]');
              const stepBox = step950.getBoundingClientRect();
              const headerSteps = [...document.querySelectorAll(".guide-color-header .guide-color-steps > *")].map(el => el.textContent.trim());
              const rail = document.querySelector(".guide-editorial-rail");
              const railBox = rail ? rail.getBoundingClientRect() : null;
              const layout = document.querySelector(".guide-editorial-layout");
              return {
                containerRight: container.right,
                stepRight: stepBox.right,
                stepWidth: stepBox.width,
                headerSteps,
                viewportRight: innerWidth,
                railLeft: railBox ? railBox.left : null,
                colGap: layout ? parseFloat(getComputedStyle(layout).columnGap) || 0 : 0,
                hasSemanticTable: !!document.querySelector("#semantic-roles table"),
              };
            });
            assert.deepEqual(ramp.headerSteps, ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
              `Tokens matrix must use unified 11-step columns (${JSON.stringify(ramp.headerSteps)})`);
            assert(ramp.stepWidth > 0, `Tokens 950 swatch visible (${JSON.stringify(ramp)})`);
            assert(ramp.stepRight <= ramp.containerRight + 1 && ramp.stepRight <= ramp.viewportRight + 1,
              `Tokens 950 step must not clip at ${width}px (${JSON.stringify(ramp)})`);
            if (width >= 1150 && ramp.railLeft !== null) {
              assert(ramp.colGap >= 24 && ramp.stepRight + 16 <= ramp.railLeft,
                `Tokens 950 step must keep clean gutter before TOC rail at ${width}px (${JSON.stringify(ramp)})`);
            }
            assert(ramp.hasSemanticTable, "Tokens semantic role table must render");
          }
        }
        assert.deepEqual(consoleErrors, [], `${appearance} ${width}px console errors`);
        assert.deepEqual(pageErrors, [], `${appearance} ${width}px page errors`);
      } finally {
        await page.close();
      }
    }
  }

  // Verify interactive Light / Dark header toggle across all four sections.
  const togglePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  try {
    for (const [route, title] of sections) {
      await togglePage.goto(`${origin}${route}`);
      await togglePage.getByRole("heading", { name: title, level: 1, exact: true }).waitFor();
      assert.equal(await togglePage.locator(".guide-shell").getAttribute("data-appearance"), "light", `${route} initial light`);
      await togglePage.getByRole("button", { name: "Use dark appearance" }).click();
      assert.equal(await togglePage.locator(".guide-shell").getAttribute("data-appearance"), "dark", `${route} toggled dark`);
      await togglePage.getByRole("button", { name: "Use light appearance" }).click();
      assert.equal(await togglePage.locator(".guide-shell").getAttribute("data-appearance"), "light", `${route} toggled back light`);
    }
  } finally {
    await togglePage.close();
  }
}

(async () => {
  const { server, origin } = await startSiteServer();
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  let webkitStatus = "skipped (webkit binary not installed in ~/Library/Caches/ms-playwright)";
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await checkFocusVisible(page);
    await checkZeroMountFlyIn(page);
    await checkProjectAccessGeometry(page, origin);
    await page.close();

    await checkSelectAndPopover(browser, "chromium");
    await checkHostedGuide(browser, origin);

    if (hasPlaywrightWebKit()) {
      const wk = await webkit.launch();
      try {
        await checkSelectAndPopover(wk, "webkit");
        webkitStatus = "passed";
      } finally {
        await wk.close();
      }
    }

    console.log(JSON.stringify({
      gates: {
        focusVisible: "passed (15 core controls)",
        zeroMountFlyIn: "passed (SegmentedControl, Tabs)",
        projectAccessGeometry: "passed (centered stage, invite parity, owner badge, member alignment)",
        selectAndPopoverChromium: "passed",
        selectAndPopoverWebKit: webkitStatus,
        hostedGuideLightDark: "passed (Tokens, Components, Patterns, Studio at 1440px, 1150px, and 390px + interactive Light/Dark toggle)",
      },
    }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
