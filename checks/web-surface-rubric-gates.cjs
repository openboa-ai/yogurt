const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

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

function parseRgb(str) {
  const m = String(str).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function relLuma(rgbStr) {
  const rgb = parseRgb(rgbStr);
  assert(rgb, `Could not parse RGB: ${rgbStr}`);
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(c1, c2) {
  const l1 = relLuma(c1), l2 = relLuma(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

async function resolveVarRgb(page, selector, varName) {
  return page.evaluate(({ sel, v }) => {
    const host = document.querySelector(sel) || document.documentElement;
    const probe = document.createElement("div");
    probe.style.backgroundColor = `var(${v})`;
    probe.style.display = "none";
    host.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, { sel: selector, v: varName });
}

async function checkStudioRubric(browser, origin) {
  for (const appearance of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: appearance });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    try {
      await page.goto(`${origin}/examples`);
      await page.locator(".studio-demo").waitFor();

      // J-STU-01: 3-Pane Calm Polarity (sidebar & computer drawer share --yg-surface; center canvas distinct)
      const panes = await page.evaluate(() => {
        const rail = document.querySelector(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel");
        const canvas = document.querySelector(".studio-conversation");
        const inspector = document.querySelector(".studio-inspector");
        return {
          rail: getComputedStyle(rail).backgroundColor,
          canvas: getComputedStyle(canvas).backgroundColor,
          inspector: getComputedStyle(inspector).backgroundColor,
        };
      });
      const lRail = relLuma(panes.rail);
      const lCanvas = relLuma(panes.canvas);
      const lInsp = relLuma(panes.inspector);
      assert.equal(panes.rail, panes.inspector, `J-STU-01 (${appearance}) sidebar & computer drawer must match --yg-surface (${JSON.stringify(panes)})`);
      if (appearance === "light") {
        assert(lRail < lCanvas,
          `J-STU-01 Light polarity failed: ${JSON.stringify(panes)} -> [${lRail.toFixed(4)}, ${lCanvas.toFixed(4)}]`);
      } else {
        assert(lRail !== lCanvas,
          `J-STU-01 Dark polarity failed: ${JSON.stringify(panes)} -> [${lRail.toFixed(4)}, ${lCanvas.toFixed(4)}]`);
      }

      // J-STU-02: Monochrome Send vs Ink Blue Approve brief
      const inverseRgb = await resolveVarRgb(page, ".studio-demo", "--yg-inverse");
      const brandRgb = await resolveVarRgb(page, ".studio-demo", "--yg-brand");

      await page.locator(".studio-thread .yg-composer textarea").fill("Verify source");
      await page.locator('.studio-thread .yg-composer button[type="submit"]').evaluate((el) =>
        Promise.allSettled(el.getAnimations().map((a) => a.finished))
      );
      const btnColors = await page.evaluate(() => {
        const send = document.querySelector('.studio-thread .yg-composer button[type="submit"]');
        const approve = [...document.querySelectorAll(".studio-gate-card button")].find(b => b.textContent.includes("Approve brief"));
        return {
          sendBg: getComputedStyle(send).backgroundColor,
          sendRadius: getComputedStyle(send).borderRadius,
          approveBg: getComputedStyle(approve).backgroundColor,
          approveRadius: getComputedStyle(approve).borderRadius,
        };
      });
      assert.equal(btnColors.sendBg, inverseRgb, `J-STU-02 (${appearance}) Send must equal --yg-inverse`);
      assert.equal(btnColors.sendRadius, "999px", `J-STU-02 (${appearance}) Send must be circular pill`);
      assert.equal(btnColors.approveBg, brandRgb, `J-STU-02 (${appearance}) Approve brief must equal --yg-brand`);
      assert.equal(btnColors.approveBg, "rgb(23, 81, 116)", `J-STU-02 (${appearance}) Approve brief must lock to logo primary #175174`);
      assert.equal(btnColors.approveRadius, "999px", `J-STU-02 (${appearance}) Approve brief must be full pill`);

      // J-STU-04: Active Bot Roster item clean hairline & zero shadow
      const activeBot = await page.evaluate(() => {
        const row = document.querySelector('.studio-bot-list .yg-agent-row[aria-current="true"]');
        const cs = getComputedStyle(row);
        return { bg: cs.backgroundColor, bw: cs.borderTopWidth, sh: cs.boxShadow, avatars: document.querySelectorAll(".studio-bot-list .yg-agent-avatar").length };
      });
      assert.equal(activeBot.bw, "1px", "J-STU-04 active bot row 1px hairline border");
      assert.equal(activeBot.sh, "none", "J-STU-04 active bot row shadowless");
      assert(activeBot.avatars >= 3, `J-STU-04 bot roster must render 3 live AgentAvatars (got ${activeBot.avatars})`);

      // J-TOK-08: Static cards/panels shadowless
      const shadowChecks = await page.evaluate(() => {
        const sels = [".yg-card", ".yg-surface", ".yg-receipt", ".yg-trace", ".studio-gate-card", ".yg-composer"];
        const bad = [];
        for (const s of sels) {
          for (const el of document.querySelectorAll(s)) {
            if (el.matches(":focus, :focus-within")) continue;
            const sh = getComputedStyle(el).boxShadow;
            if (sh !== "none") bad.push({ s, sh });
          }
        }
        return bad;
      });
      assert.deepEqual(shadowChecks, [], `J-TOK-08 (${appearance}) static panels must have boxShadow: none`);

      // J-STU-05: Calm Held/Approved gate state transitions
      await page.getByRole("button", { name: "Hold REG-04", exact: true }).click();
      assert.equal(await page.locator('.studio-gate-card[data-state="held"]').count(), 1, `J-STU-05 (${appearance}) held gate state`);
      await page.getByRole("button", { name: "Approve brief", exact: true }).click();
      assert.equal(await page.locator('.studio-gate-card[data-state="approved"]').count(), 1, `J-STU-05 (${appearance}) approved gate state`);

      // J-STU-06: Sent bubble radius + Files inspector heading <= 14px
      const sentStyle = await page.evaluate(() => {
        const el = document.querySelector('.yg-message[data-variant="sent"] .yg-message-content');
        const cs = getComputedStyle(el);
        return {
          corners: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius],
          bw: cs.borderTopWidth,
        };
      });
      assert.deepEqual(sentStyle.corners, ["20px", "20px", "6px", "20px"], "J-STU-06 sent bubble radius");
      assert.equal(sentStyle.bw, "1px", "J-STU-06 sent bubble border");
      await page.getByRole("button", { name: "Open workspace files" }).click();
      const fileHeadingSize = await page.evaluate(() => {
        const h = document.querySelector(".studio-inspector .yg-heading:not(.studio-inspector-heading .yg-heading)");
        return h ? parseFloat(getComputedStyle(h).fontSize) : 0;
      });
      assert(fileHeadingSize > 0 && fileHeadingSize <= 14, `J-STU-06 Files inspector heading <= 14px (got ${fileHeadingSize})`);

      // J-STU-07: Sidebar search row compact height
      const searchRowH = await page.evaluate(() => document.querySelector(".studio-search-row").getBoundingClientRect().height);
      assert(searchRowH <= 36, `J-STU-07 search row <= 36px (got ${searchRowH})`);

      // J-STU-10: Unified 52px toolbar height & zero overflow
      const toolbarH = await page.evaluate(() => document.querySelector(".studio-toolbar").getBoundingClientRect().height);
      assert(toolbarH >= 48 && toolbarH <= 56, `J-STU-10 desktop toolbar height 48-56px (got ${toolbarH})`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `J-STU-10 1440px overflow`);

      // J-STU-08: 10 auxiliary views structural checks
      if (appearance === "light") {
        await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Workflows", exact: true }).click();
        const wfLists = await page.evaluate(() => ({
          splitLists: document.querySelectorAll('[data-view="workflows"] .studio-workflow-canvas ul.yg-list').length,
          singleOl: document.querySelectorAll('[data-view="workflows"] ol.studio-workflow-steps li').length,
        }));
        assert.equal(wfLists.splitLists, 0, "J-STU-08 Workflows must not split ul.yg-list per step");
        assert(wfLists.singleOl >= 3, "J-STU-08 Workflows single semantic <ol>");

        await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Files", exact: true }).click();
        const nestedFileUl = await page.evaluate(() => document.querySelectorAll('[data-view="library"] li > ul').length);
        assert.equal(nestedFileUl, 0, "J-STU-08 Files must have zero li > ul nesting");

        await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Customers", exact: true }).click();
        const customerRows = await page.evaluate(() => document.querySelectorAll('[data-view="customers"] tbody tr').length);
        assert(customerRows >= 3, `J-STU-08 Customers must have >= 3 rows (got ${customerRows})`);

        await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Settings", exact: true }).click();
        const saveDisabled = await page.locator('[data-view="settings"]').getByRole("button", { name: "Save preferences", exact: true }).isDisabled();
        assert.equal(saveDisabled, true, "J-STU-08 Settings Save preferences must be initially disabled");
      }

      assert.deepEqual(errors, [], `Studio (${appearance}) errors: ${errors.join("; ")}`);
    } finally {
      await page.close();
    }
  }

  // J-STU-03 & J-STU-10: 1150px & 390px Stream | Trace | Diff accessibility + zero overflow
  for (const width of [1150, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: "light" });
    try {
      await page.goto(`${origin}/examples`);
      await page.locator(".studio-demo").waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `J-STU-10 ${width}px overflow`);
      const traceRadio = page.getByRole("radio", { name: "Trace", exact: true });
      const diffRadio = page.getByRole("radio", { name: "Diff", exact: true });
      assert.equal(await traceRadio.isVisible(), true, `J-STU-03 Trace must be visible at ${width}px`);
      assert.equal(await diffRadio.isVisible(), true, `J-STU-03 Diff must be visible at ${width}px`);
      await traceRadio.click();
      await page.getByText("Worked on Kai’s computer").first().waitFor();
      await diffRadio.click();
      await page.getByText("diff · Morning brief.md").waitFor();
    } finally {
      await page.close();
    }
  }
}

async function checkRecipesRubric(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    // J-REC-02: agent-profile
    await page.goto(`${origin}/patterns/agent-profile`);
    await page.locator(".template-stage .yg-card").waitFor();
    const ap = await page.evaluate(() => {
      const cardTitle = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-card-header .yg-heading")).fontSize);
      const legend = getComputedStyle(document.querySelector(".template-stage .yg-field-group-legend"));
      const avatar = document.querySelector(".template-stage .yg-agent-avatar").getBoundingClientRect().height;
      const saveTone = [...document.querySelectorAll(".template-stage button")].find(b => b.textContent.includes("Save profile")).getAttribute("data-tone");
      return { cardTitle, legendFs: parseFloat(legend.fontSize), legendTransform: legend.textTransform, avatar, saveTone };
    });
    assert.equal(ap.cardTitle, 14, `J-REC-02 CardTitle 14px (${JSON.stringify(ap)})`);
    assert(ap.legendFs <= 11 && ap.legendTransform === "uppercase", `J-REC-02 legend <= 11px uppercase (${JSON.stringify(ap)})`);
    assert(ap.avatar <= 28.5, `J-REC-02 avatar <= 28px (${JSON.stringify(ap)})`);
    assert.equal(ap.saveTone, "brand", "J-REC-02 Save profile tone=brand");

    // J-REC-03: agent-sidebar
    await page.goto(`${origin}/patterns/agent-sidebar`);
    await page.locator(".template-stage .yg-sidebar-item").first().waitFor();
    const as = await page.evaluate(() => {
      const headers = document.querySelectorAll(".template-stage .yg-sidebar-header").length;
      const item = document.querySelector(".template-stage .yg-sidebar-item");
      const active = document.querySelector('.template-stage .yg-sidebar-item[aria-current="page"]');
      const unreadBadges = [...document.querySelectorAll(".template-stage .yg-badge")].filter(b => b.textContent.trim() === "Unread").length;
      const dots = document.querySelectorAll('.template-stage .yg-signal-dot[aria-label="Unread"]').length;
      const asCs = getComputedStyle(active);
      return { headers, itemH: Math.round(item.getBoundingClientRect().height), activeBw: asCs.borderTopWidth, activeSh: asCs.boxShadow, unreadBadges, dots };
    });
    assert(as.headers <= 1, `J-REC-03 headers <= 1 (${JSON.stringify(as)})`);
    assert(as.itemH >= 28 && as.itemH <= 32, `J-REC-03 item height 28-32px (${JSON.stringify(as)})`);
    assert.equal(as.activeBw, "1px", "J-REC-03 active border");
    assert.notEqual(as.activeSh, "none", "J-REC-03 active shadow");
    assert.equal(as.unreadBadges, 0, "J-REC-03 literal Unread badge == 0");

    // J-REC-04: agent-workspace
    await page.goto(`${origin}/patterns/agent-workspace`);
    await page.locator(".template-stage .yg-agent-detail-header").waitFor();
    const invRgb = await resolveVarRgb(page, ".template-stage", "--yg-inverse");
    await page.locator(".template-stage .yg-agent-detail-header").getByRole("button", { name: "Computer" }).click();
    await page.locator(".template-stage .yg-composer textarea").fill("Verify source");
    await page.locator('.template-stage .yg-composer button[type="submit"]').evaluate((el) =>
      Promise.allSettled(el.getAnimations().map((a) => a.finished))
    );
    const aw = await page.evaluate(() => {
      const headerH = document.querySelector(".template-stage .yg-agent-detail-header").getBoundingClientRect().height;
      const inspTitle = document.querySelector(".template-stage .yg-agent-inspector-head .yg-heading").getBoundingClientRect();
      const inspClose = document.querySelector('.template-stage .yg-agent-inspector-head button[aria-label="Close computer"]').getBoundingClientRect();
      const row = document.querySelector(".template-stage .yg-agent-row");
      const rowName = document.querySelector(".template-stage .yg-agent-row-name");
      const send = document.querySelector('.template-stage .yg-composer button[type="submit"]');
      return {
        headerH,
        inspTopDiff: Math.abs((inspTitle.top + inspTitle.bottom) / 2 - (inspClose.top + inspClose.bottom) / 2),
        rowH: row.getBoundingClientRect().height,
        nameWeight: parseFloat(getComputedStyle(rowName).fontWeight),
        sendBg: send ? getComputedStyle(send).backgroundColor : null,
      };
    });
    assert(aw.headerH <= 44.5, `J-REC-04 header <= 44px (${JSON.stringify(aw)})`);
    assert(aw.inspTopDiff <= 6, `J-REC-04 inspector title & close single row (${JSON.stringify(aw)})`);
    assert(aw.rowH <= 44.5 && aw.nameWeight >= 530, `J-REC-04 AgentRow <= 44px & weight >= 530 (${JSON.stringify(aw)})`);
    if (aw.sendBg) assert.equal(aw.sendBg, invRgb, "J-REC-04 Send bg == --yg-inverse");

    // J-REC-05: artifact-library
    await page.goto(`${origin}/patterns/artifact-library`);
    await page.locator(".template-stage .yg-artifact-library").waitFor();
    const al = await page.evaluate(() => {
      const root = getComputedStyle(document.querySelector(".template-stage .yg-artifact-library"));
      const searchH = Math.round(document.querySelector(".template-stage .yg-artifact-filter .yg-input").getBoundingClientRect().height);
      const selectH = Math.round(document.querySelector(".template-stage .yg-artifact-filter .yg-select-trigger").getBoundingClientRect().height);
      return { bw: root.borderTopWidth, radius: root.borderRadius, searchH, selectH };
    });
    assert.equal(al.bw, "1px", "J-REC-05 framed root 1px border");
    assert.equal(al.radius, "16px", "J-REC-05 framed root 16px radius");
    assert(al.searchH >= 27 && al.searchH <= 32 && al.selectH >= 27 && al.selectH <= 32, `J-REC-05 filters 28-32px (${JSON.stringify(al)})`);

    // J-REC-06: attention-inbox (badge cap <= 1/row & Receipt heading hierarchy)
    await page.goto(`${origin}/patterns/attention-inbox`);
    await page.locator(".template-stage .yg-attention-item").first().waitFor();
    await page.locator(".template-stage").getByRole("button", { name: /^Review / }).first().click();
    await page.locator("dialog.yg-dialog[open]").getByRole("button", { name: "Approve draft" }).click();
    await page.locator(".template-stage .yg-receipt").first().waitFor();
    const ai = await page.evaluate(() => {
      const maxBadges = Math.max(...[...document.querySelectorAll(".template-stage li.yg-attention-item")].map(
        li => li.querySelectorAll(".yg-badge, .yg-status").length
      ));
      const headerFs = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-section-line .yg-heading")).fontSize);
      const eventFs = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-operations-title-line strong")).fontSize);
      const receiptFs = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-receipt .yg-heading")).fontSize);
      return { maxBadges, headerFs, eventFs, receiptFs };
    });
    assert(ai.maxBadges <= 1, `J-REC-06 max badges per row <= 1 (${JSON.stringify(ai)})`);
    assert(ai.headerFs > ai.eventFs && ai.eventFs >= ai.receiptFs, `J-REC-06 heading hierarchy (${JSON.stringify(ai)})`);

    // J-REC-07: collection-browser
    await page.goto(`${origin}/patterns/collection-browser`);
    await page.locator(".template-stage .yg-collection-browser").waitFor();
    const cb = await page.evaluate(() => {
      const root = getComputedStyle(document.querySelector(".template-stage .yg-collection-browser"));
      const header = getComputedStyle(document.querySelector(".template-stage .yg-section-line .yg-heading"));
      const rowTitle = getComputedStyle(document.querySelector(".template-stage .yg-row-title"));
      const rowH = document.querySelector(".template-stage .yg-row").getBoundingClientRect().height;
      return { bw: root.borderTopWidth, radius: root.borderRadius, hFs: parseFloat(header.fontSize), hFw: parseFloat(header.fontWeight), rFs: parseFloat(rowTitle.fontSize), rowH };
    });
    assert.equal(cb.bw, "1px", "J-REC-07 root border");
    assert.equal(cb.radius, "16px", "J-REC-07 root radius");
    assert(cb.hFs >= 14 && cb.hFw >= 520 && cb.hFs > cb.rFs, `J-REC-07 ListHeader > ListRow (${JSON.stringify(cb)})`);

    // J-REC-08: conversation-panel
    await page.goto(`${origin}/patterns/conversation-panel`);
    await page.locator(".template-stage .yg-conversation-panel").waitFor();
    const cp = await page.evaluate(() => {
      const root = getComputedStyle(document.querySelector(".template-stage .yg-conversation-panel"));
      const sent = getComputedStyle(document.querySelector('.template-stage .yg-message[data-variant="sent"] .yg-message-content'));
      const send = document.querySelector('.template-stage .yg-composer button[type="submit"]');
      return {
        bw: root.borderTopWidth,
        sentCorners: [sent.borderTopLeftRadius, sent.borderTopRightRadius, sent.borderBottomRightRadius, sent.borderBottomLeftRadius],
        sentBw: sent.borderTopWidth,
        sendTone: send.getAttribute("data-tone"),
      };
    });
    assert.equal(cp.bw, "1px", "J-REC-08 root border");
    assert.deepEqual(cp.sentCorners, ["20px", "20px", "6px", "20px"], "J-REC-08 sent radius");
    assert.equal(cp.sentBw, "1px", "J-REC-08 sent border");
    assert.equal(cp.sendTone, "neutral", "J-REC-08 monochrome Send");

    // J-REC-09: decision-review
    await page.goto(`${origin}/patterns/decision-review`);
    await page.locator(".template-stage .yg-decision-card").waitFor();
    const dr = await page.evaluate(() => {
      const title = document.querySelector(".template-stage .yg-card-header .yg-heading");
      const btn = document.querySelector(".template-stage .yg-card-footer button");
      const card = getComputedStyle(document.querySelector(".template-stage .yg-decision-card"));
      return { titleFs: title ? parseFloat(getComputedStyle(title).fontSize) : 0, tone: btn.getAttribute("data-tone"), bw: card.borderTopWidth, radius: card.borderRadius };
    });
    assert.equal(dr.titleFs, 14, `J-REC-09 CardTitle 14px (${JSON.stringify(dr)})`);
    assert.notEqual(dr.tone, "danger", `J-REC-09 non-destructive default != danger (${JSON.stringify(dr)})`);
    assert.equal(dr.bw, "1px", `J-REC-09 calm 1px hairline border (${JSON.stringify(dr)})`);
    assert.equal(dr.radius, "16px", `J-REC-09 16px card radius (${JSON.stringify(dr)})`);
    await page.locator(".template-stage .yg-card-footer button").click();
    await page.locator("dialog.yg-dialog[open]").waitFor();
    const confirmTone = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("dialog.yg-dialog[open] button")].find(b => b.textContent.trim() === "Archive review");
      return btn ? btn.getAttribute("data-tone") : null;
    });
    assert.equal(confirmTone, "brand", `J-REC-09 non-destructive ConfirmDialog button must be brand (got ${confirmTone})`);
    await page.keyboard.press("Escape");

    // J-REC-10: operations-library
    await page.goto(`${origin}/patterns/operations-library`);
    await page.locator(".template-stage .yg-operations-library li").first().waitFor();
    const ol = await page.evaluate(() => {
      const cardTop = document.querySelector(".template-stage .yg-operations-library").getBoundingClientRect().top;
      const firstRowTop = document.querySelector(".template-stage .yg-operations-library li").getBoundingClientRect().top;
      const runBtn = [...document.querySelectorAll(".template-stage button")].find(b => b.textContent.trim() === "Run now");
      return { offset: Math.round(firstRowTop - cardTop), runH: Math.round(runBtn.getBoundingClientRect().height) };
    });
    assert(ol.offset <= 88, `J-REC-10 header offset <= 88px (got ${ol.offset}px)`);
    assert.equal(ol.runH, 28, `J-REC-10 Run now 28px (got ${ol.runH}px)`);

    // J-REC-11: project-access
    await page.goto(`${origin}/patterns/project-access`);
    await page.locator(".template-stage .yg-access-invite").waitFor();
    const pa = await page.evaluate(() => {
      const email = document.querySelector(".template-stage .yg-access-invite .yg-input").getBoundingClientRect();
      const role = document.querySelector(".template-stage .yg-access-invite .yg-select-trigger").getBoundingClientRect();
      const invite = document.querySelector('.template-stage .yg-access-invite button[type="submit"]').getBoundingClientRect();
      const ownerTone = document.querySelector(".template-stage .yg-row-inline-meta .yg-badge").getAttribute("data-tone");
      const mSel = document.querySelector(".template-stage .yg-access-member-controls .yg-select-trigger").getBoundingClientRect().height;
      const mMenu = document.querySelector(".template-stage .yg-access-member-controls .yg-menu-more-trigger").getBoundingClientRect().height;
      const mRow = document.querySelector(".template-stage .yg-access-list .yg-row").getBoundingClientRect().height;
      return {
        inviteH: [Math.round(email.height), Math.round(role.height), Math.round(invite.height)],
        bottomDiff: Math.max(Math.abs(email.bottom - role.bottom), Math.abs(email.bottom - invite.bottom)),
        ownerTone,
        mSel: Math.round(mSel),
        mMenu: Math.round(mMenu),
        mRow: Math.round(mRow),
      };
    });
    assert.deepEqual(pa.inviteH, [32, 32, 32], `J-REC-11 invite heights (${JSON.stringify(pa)})`);
    assert(pa.bottomDiff <= 1.5, `J-REC-11 invite bottom alignment (${JSON.stringify(pa)})`);
    assert.equal(pa.ownerTone, "neutral", `J-REC-11 Owner badge neutral (${JSON.stringify(pa)})`);
    assert(Math.abs(pa.mSel - 28) <= 1 && Math.abs(pa.mMenu - 28) <= 1, `J-REC-11 member controls 28px (${JSON.stringify(pa)})`);
    assert(pa.mRow <= 48, `J-REC-11 member row <= 48px (${JSON.stringify(pa)})`);

    // J-REC-12: project-settings
    await page.goto(`${origin}/patterns/project-settings`);
    await page.locator(".template-stage .yg-card").waitFor();
    const ps = await page.evaluate(() => {
      const cardTitle = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-card-header .yg-heading")).fontSize);
      const legendFs = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-field-group-legend")).fontSize);
      const saveTone = [...document.querySelectorAll(".template-stage button")].find(b => b.textContent.includes("Save changes")).getAttribute("data-tone");
      return { cardTitle, legendFs, saveTone };
    });
    assert.equal(ps.cardTitle, 14, `J-REC-12 CardTitle 14px (${JSON.stringify(ps)})`);
    assert(ps.legendFs <= 11, `J-REC-12 legend <= 11px (${JSON.stringify(ps)})`);
    assert.equal(ps.saveTone, "brand", "J-REC-12 Save changes brand");

    // J-REC-13: project-sidebar
    await page.goto(`${origin}/patterns/project-sidebar`);
    await page.locator(".template-stage .yg-sidebar-item").first().waitFor();
    const psb = await page.evaluate(() => {
      const headers = document.querySelectorAll(".template-stage .yg-sidebar-header").length;
      const itemH = Math.round(document.querySelector(".template-stage .yg-sidebar-item").getBoundingClientRect().height);
      const parentLeft = document.querySelector(".template-stage .yg-sidebar-submenu > .yg-sidebar-item").getBoundingClientRect().left;
      const childLeft = document.querySelector(".template-stage .yg-sidebar-submenu-content .yg-sidebar-item").getBoundingClientRect().left;
      return { headers, itemH, indent: Math.round(childLeft - parentLeft) };
    });
    assert(psb.headers <= 1, `J-REC-13 headers <= 1 (${JSON.stringify(psb)})`);
    assert(psb.itemH >= 28 && psb.itemH <= 32, `J-REC-13 item 28-32px (${JSON.stringify(psb)})`);
    assert(psb.indent <= 14, `J-REC-13 submenu indent <= 14px (${JSON.stringify(psb)})`);

    // J-REC-14: project-workspace & run-inspector
    await page.goto(`${origin}/patterns/project-workspace`);
    await page.locator(".template-stage .yg-project-main").waitFor();
    const pw = await page.evaluate(() => {
      const padL = parseFloat(getComputedStyle(document.querySelector(".template-stage .yg-project-main")).paddingLeft);
      const unreadBadges = [...document.querySelectorAll(".template-stage .yg-thread-row .yg-badge")].filter(b => b.textContent.trim() === "Unread").length;
      return { padL, unreadBadges };
    });
    assert(pw.padL >= 12, `J-REC-14 project-workspace paddingLeft >= 12px (${JSON.stringify(pw)})`);
    assert.equal(pw.unreadBadges, 0, "J-REC-14 ThreadRow zero Unread badge");

    await page.goto(`${origin}/patterns/run-inspector`);
    await page.locator(".template-stage .yg-run-inspector-layout").waitFor();
    await page.locator(".template-stage").getByRole("button", { name: /Release checklist · run 2/ }).click();
    const ri = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".template-stage .yg-run-inspector-layout > .yg-card")];
      const topDiff = Math.abs(cards[0].getBoundingClientRect().top - cards[1].getBoundingClientRect().top);
      const cardTitleFs = parseFloat(getComputedStyle(cards[1].querySelector(".yg-card-header .yg-heading")).fontSize);
      const resultHeading = [...cards[1].querySelectorAll(".yg-heading")].find(h => h.textContent.trim() === "Result");
      const resultFs = resultHeading ? parseFloat(getComputedStyle(resultHeading).fontSize) : 0;
      return { topDiff, cardTitleFs, resultFs };
    });
    assert(ri.topDiff <= 4, `J-REC-14 RunInspector 2-col side-by-side (${JSON.stringify(ri)})`);
    assert(ri.cardTitleFs === 14 && ri.resultFs > 0 && ri.resultFs <= 13.5, `J-REC-14 CardTitle > ResultHeading (${JSON.stringify(ri)})`);

    assert.deepEqual(errors, [], `Recipes errors: ${errors.join("; ")}`);
  } finally {
    await page.close();
  }
}

async function checkGuideRubric(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    // J-GUI-01 & J-GUI-02: Brand Landing (/)
    await page.goto(`${origin}/`);
    await page.locator(".guide-brand-title h1").waitFor();
    const brand = await page.evaluate(() => {
      const masthead = document.querySelector(".guide-masthead");
      const mCs = getComputedStyle(masthead);
      const h1Fs = parseFloat(getComputedStyle(document.querySelector(".guide-brand-title h1")).fontSize);
      const ctas = [...document.querySelectorAll(".guide-brand-intro .yg-button")];
      const bodyGap = parseFloat(getComputedStyle(document.querySelector(".guide-brand-body")).rowGap);
      return {
        mastheadH: Math.round(masthead.getBoundingClientRect().height),
        mastheadBorder: mCs.borderBottomWidth,
        wrapBorder: getComputedStyle(document.querySelector(".guide-masthead-wrap")).borderBottomWidth,
        hasKbd: !!document.querySelector(".guide-masthead .guide-kbd-button"),
        hasMaterial: !!document.querySelector('.guide-masthead [aria-label="Surface material"]'),
        hasAppearance: !!document.querySelector('.guide-masthead [aria-label*="appearance"]'),
        h1Fs,
        ctaCount: ctas.length,
        primaryH: Math.round(ctas[1].getBoundingClientRect().height),
        primaryTone: ctas[1].getAttribute("data-tone"),
        secondaryEmph: ctas[0].getAttribute("data-emphasis"),
        bodyGap,
      };
    });
    assert(brand.mastheadH >= 42 && brand.mastheadH <= 46, `J-GUI-01 masthead 42-46px (${JSON.stringify(brand)})`);
    assert.equal(brand.mastheadBorder, "1px", "J-GUI-01 masthead 1px bottom hairline");
    assert.equal(brand.wrapBorder, "0px", "J-GUI-01 masthead wrapper must not stack a duplicate 2px border");
    assert(brand.hasKbd && brand.hasMaterial && brand.hasAppearance, `J-GUI-01 3 global controls (${JSON.stringify(brand)})`);
    assert(brand.h1Fs >= 40 && brand.h1Fs <= 64, `J-GUI-02 hero h1 40-64px (${JSON.stringify(brand)})`);
    assert.equal(brand.primaryH, 32, `J-GUI-02 primary CTA 32px (${JSON.stringify(brand)})`);
    assert.equal(brand.primaryTone, "brand", "J-GUI-02 primary CTA brand");
    assert.equal(brand.secondaryEmph, "soft", "J-GUI-02 secondary CTA soft");
    assert(brand.bodyGap <= 40, `J-GUI-08 brand body gap <= 40px (${JSON.stringify(brand)})`);

    // J-GUI-03 & J-GUI-04: /components/button
    await page.goto(`${origin}/components/button`);
    await page.locator(".specimen").first().waitFor();
    const cat = await page.evaluate(() => {
      const body = getComputedStyle(document.querySelector(".catalog-body"));
      const aside = document.querySelector(".catalog-body > aside");
      const asideCs = getComputedStyle(aside);
      const spec = getComputedStyle(document.querySelector(".specimen"));
      const chip = document.querySelector(".guide-chip-link, .related-actions .yg-link, .catalog-guidance-links .yg-link");
      const rootCs = getComputedStyle(document.querySelector(".yg-root"));
      return {
        colGap: body.columnGap,
        asideW: Math.round(aside.getBoundingClientRect().width),
        asideBorderR: asideCs.borderRightWidth,
        specPad: spec.paddingTop,
        specRadius: spec.borderRadius,
        chipRadius: chip ? getComputedStyle(chip).borderRadius : null,
        text: document.body.innerText,
        fontFamily: rootCs.fontFamily,
        fontFeature: rootCs.fontFeatureSettings,
      };
    });
    assert.equal(cat.colGap, "0px", `J-GUI-03 catalog columnGap 0px (${cat.colGap})`);
    assert(cat.asideW >= 200 && cat.asideW <= 224, `J-GUI-03 aside width 200-224px (${cat.asideW})`);
    assert.equal(cat.asideBorderR, "1px", "J-GUI-03 aside 1px right border");
    assert.equal(cat.specPad, "16px", `J-GUI-03 specimen padding 16px (${cat.specPad})`);
    assert.equal(cat.specRadius, "16px", `J-GUI-03 specimen radius 16px (${cat.specRadius})`);
    if (cat.chipRadius) assert.equal(cat.chipRadius, "999px", `J-GUI-03 chip radius 999px (${cat.chipRadius})`);
    assert(cat.text.includes("32 px high · pill corners"), "J-GUI-04 Button live specimen label matches brand.json");
    assert(cat.fontFamily.includes("Rethink Sans"), `J-TOK-10 Rethink Sans (${cat.fontFamily})`);
    assert(cat.fontFeature.includes("cv02") && cat.fontFeature.includes("ss01"), `J-TOK-10 fontFeatureSettings (${cat.fontFeature})`);

    // Global material propagation onto /components & /examples
    await page.locator(".guide-masthead").getByRole("radio", { name: "Paper" }).click();
    const matSync = await page.evaluate(() => ({
      catalogMat: document.querySelector(".catalog")?.dataset.material,
      specMat: document.querySelector(".specimen")?.dataset.material,
    }));
    assert.equal(matSync.catalogMat, "paper", "Global Paper switcher must propagate to /components .catalog");
    assert.equal(matSync.specMat, "paper", "Global Paper switcher must propagate to /components .specimen");
    await page.locator(".guide-masthead").getByRole("link", { name: "Examples" }).click();
    await page.locator(".studio-demo").waitFor();
    const studioMat = await page.evaluate(() => document.querySelector(".studio-demo")?.dataset.material);
    assert.equal(studioMat, "paper", "Global Paper switcher must propagate to /examples .studio-demo");
    await page.locator(".guide-masthead").getByRole("radio", { name: "Neutral" }).click();

    // J-GUI-05: /patterns badge cap <= 2
    await page.goto(`${origin}/patterns`);
    await page.locator(".guide-pattern-card").first().waitFor();
    const maxPatternBadges = await page.evaluate(() =>
      Math.max(...[...document.querySelectorAll(".guide-pattern-card")].map(c => c.querySelectorAll(".yg-badge").length))
    );
    assert(maxPatternBadges <= 2, `J-GUI-05 max badges per pattern card <= 2 (got ${maxPatternBadges})`);

    // J-GUI-06: SVG donut chart
    await page.goto(`${origin}/patterns/traffic-mix`);
    await page.locator(".template-donut svg circle").first().waitFor();
    const donutCircles = await page.evaluate(() =>
      [...document.querySelectorAll(".template-donut svg circle")].map(c => c.getAttribute("stroke-dasharray")).filter(Boolean)
    );
    assert(donutCircles.length >= 3, `J-GUI-06 SVG donut circles with stroke-dasharray (got ${donutCircles.length})`);

    // J-GUI-08: /tokens editorial section gap <= 40px
    await page.goto(`${origin}/tokens`);
    await page.locator(".guide-editorial-sections").waitFor();
    const tokGap = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".guide-editorial-sections")).rowGap));
    assert(tokGap <= 40, `J-GUI-08 tokens editorial rowGap <= 40px (got ${tokGap})`);

    assert.deepEqual(errors, [], `Guide errors: ${errors.join("; ")}`);
  } finally {
    await page.close();
  }

  // Dark mode SVG donut contrast >= 3.0:1 & mobile 390px /components single gutter
  const darkPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  try {
    await darkPage.goto(`${origin}/patterns/traffic-mix`);
    await darkPage.locator(".template-donut svg circle").first().waitFor();
    const donut = await darkPage.evaluate(() => ({
      cardBg: getComputedStyle(document.querySelector(".template-stage .yg-card")).backgroundColor,
      strokes: [...document.querySelectorAll(".template-donut svg circle")].map(c => getComputedStyle(c).stroke),
    }));
    for (const stroke of donut.strokes) {
      const ratio = contrastRatio(stroke, donut.cardBg);
      assert(ratio >= 3.0, `J-GUI-06 Dark mode SVG donut stroke ${stroke} on ${donut.cardBg} contrast ${ratio.toFixed(2)} < 3.0`);
    }
  } finally {
    await darkPage.close();
  }

  const mobPage = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
  try {
    await mobPage.goto(`${origin}/components/button`);
    await mobPage.locator(".specimen").first().waitFor();
    const mob = await mobPage.evaluate(() => ({
      mainPadL: getComputedStyle(document.querySelector(".catalog-body > main")).paddingLeft,
      mainPadR: getComputedStyle(document.querySelector(".catalog-body > main")).paddingRight,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    assert.equal(mob.mainPadL, "0px", `390px /components main must not double-pad horizontally (got ${mob.mainPadL})`);
    assert.equal(mob.mainPadR, "0px", `390px /components main must not double-pad horizontally (got ${mob.mainPadR})`);
    assert.equal(mob.overflow, false, "390px /components must not overflow horizontally");
  } finally {
    await mobPage.close();
  }
}

async function checkCoreAndTouchRubric(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  try {
    // J-CORE-02, 03, 05, 06, 07, 08, 09, 10, 11
    await page.goto(`${componentsUrl}#button`);
    const invRgb = await resolveVarRgb(page, ".catalog", "--yg-inverse");
    const filledBg = await page.evaluate(() => getComputedStyle(document.querySelector('.specimen .yg-button[data-emphasis="filled"]')).backgroundColor);
    assert.equal(filledBg, invRgb, "J-CORE-03 default filled Button == --yg-inverse");

    await page.goto(`${componentsUrl}#heading`);
    const headingSizes = await page.evaluate(() => {
      const host = document.querySelector(".specimen-inner");
      const wrap = document.createElement("div");
      for (const lvl of [1, 2, 3, 4, 5, 6]) {
        const el = document.createElement(`h${lvl}`);
        el.className = "yg-heading";
        el.dataset.level = String(lvl);
        el.textContent = `H${lvl}`;
        wrap.appendChild(el);
      }
      host.appendChild(wrap);
      const out = [...wrap.children].map(el => parseFloat(getComputedStyle(el).fontSize));
      wrap.remove();
      return out;
    });
    const expectedH = [24, 18, 16, 14, 13, 12];
    expectedH.forEach((exp, i) => assert(Math.abs(headingSizes[i] - exp) <= 0.5, `J-CORE-02 h${i + 1} expected ${exp} got ${headingSizes[i]}`));

    await page.goto(`${componentsUrl}#surface`);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".specimen .yg-surface")).borderTopWidth), "1px", "J-CORE-02 Surface 1px border");

    await page.goto(`${componentsUrl}#badge`);
    const badgeMetrics = await page.evaluate(() => {
      const b = getComputedStyle(document.querySelector('.specimen .yg-badge'));
      return { bw: b.borderTopWidth, radius: b.borderRadius };
    });
    assert.equal(badgeMetrics.bw, "1px", "J-CORE-09 Badge 1px border");
    assert.equal(badgeMetrics.radius, "999px", "J-CORE-09 Badge 999px pill radius");

    await page.goto(`${componentsUrl}#count`);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".specimen .yg-count")).borderRadius), "6px", "J-CORE-08 Count 6px radius");

    await page.goto(`${componentsUrl}#checkbox`);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.specimen [role="checkbox"]')).borderRadius), "4px", "J-CORE-05 Checkbox 4px radius");

    await page.goto(`${componentsUrl}#disclosure-row`);
    const discH = await page.evaluate(() => document.querySelector(".specimen .yg-disclosure summary").getBoundingClientRect().height);
    assert(discH >= 31 && discH <= 37, `J-CORE-07 DisclosureRow desktop 32-36px (got ${discH})`);

    await page.goto(`${componentsUrl}#code-block`);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".specimen .yg-code")).borderTopWidth), "1px", "J-CORE-11 CodeBlock 1px border");

    await page.goto(`${componentsUrl}#composer`);
    assert.equal(await page.evaluate(() => document.querySelector('.specimen .yg-composer button[type="submit"]').getAttribute("data-tone")), "neutral", "J-CORE-10 Composer default sendTone=neutral");
  } finally {
    await page.close();
  }

  // J-CORE-14: pointer: coarse / touch >= 44px
  const touchCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const touchPage = await touchCtx.newPage();
  try {
    for (const [hash, sel] of [
      ["#button", ".specimen .yg-button"],
      ["#text-field", ".specimen .yg-input"],
      ["#list-row", ".specimen .yg-row"],
      ["#disclosure-row", ".specimen .yg-disclosure summary"],
    ]) {
      await touchPage.goto(`${componentsUrl}${hash}`);
      const h = await touchPage.evaluate((s) => document.querySelector(s).getBoundingClientRect().height, sel);
      assert(h >= 43.5, `J-CORE-14 touch target ${hash} (${sel}) must be >= 44px (got ${h})`);
    }
  } finally {
    await touchCtx.close();
  }
}

(async () => {
  const hosted = await startSiteServer();
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await checkCoreAndTouchRubric(browser);
    await checkRecipesRubric(browser, hosted.origin);
    await checkStudioRubric(browser, hosted.origin);
    await checkGuideRubric(browser, hosted.origin);
    console.log("All Agent-as-Judge runtime surface rubric gates passed (Core, Touch, 14 Recipes, Studio, Guide).");
  } finally {
    await browser.close();
    hosted.server.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
