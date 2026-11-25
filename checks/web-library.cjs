const { chromium } = require("playwright-core");
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url");
const catalog = [
    ...require("../catalog/components.json"),
    ...require("../catalog/blocks.json"),
  ],
  url = pathToFileURL(path.resolve(__dirname, "../apps/guide/generated/components.html")).href;
(async () => {
  const browser = await chromium.launch({
      channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome",
    }),
    failures = [],
    ink = [];
  let renders = 0;
  try {
    for (const [scheme, width] of [
      ["light", 1120],
      ["dark", 390],
      ["light", 320],
      ["dark", 1120],
    ]) {
      const ctx = await browser.newContext({
        colorScheme: scheme,
        viewport: { width, height: 850 },
        hasTouch: width < 500,
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      page.setDefaultTimeout(3500);
      page.on("pageerror", (e) => failures.push(String(e)));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      for (const entry of catalog) {
        await page.evaluate((id) => {
          location.hash = id;
        }, entry.id);
        const example = page.locator(
          '.specimen[data-component="' + entry.id + '"] .specimen-inner',
        );
        try {
          await example.waitFor({ state: "visible" });
          assert.ok((await example.locator("*").count()) > 0);
          let overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          );
          if (overflow > 1)
            failures.push([scheme, width, entry.id, "overflow", overflow]);
          const misalignment = await example.evaluate(inner => {
            const content = inner.getBoundingClientRect();
            const stage = inner.parentElement.getBoundingClientRect();
            const heading = document.querySelector(".catalog-intro").getBoundingClientRect();
            const midpoint = Math.abs((content.left + content.right) - (stage.left + stage.right)) / 2;
            return Math.max(midpoint, Math.abs(stage.left - heading.left));
          });
          if (misalignment > 1)
            failures.push([scheme, width, entry.id, "misalignment", misalignment]);
          renders++;
        } catch (e) {
          failures.push([scheme, width, entry.id, String(e).slice(0, 160)]);
          break;
        }
      }
      if (scheme === "light" && width === 1120) {
        async function show(id) {
          await page.evaluate((id) => {
            location.hash = id;
          }, id);
          const root = page.locator('.specimen[data-component="' + id + '"]');
          await root.waitFor();
          return root;
        }
        let root = await show("data-table");
        const table = root.getByRole("table", { name: "Weekly readings" });
        const header = table.getByRole("columnheader", { name: "Reviews" });
        const sort = header.getByRole("button");
        await sort.click();
        const readings = table.locator("tbody tr td:last-child");
        assert.deepEqual(await readings.allTextContents(), [
          "4",
          "6",
          "8",
          "10",
          "No reading",
        ]);
        assert.equal(await header.getAttribute("aria-sort"), "ascending");
        await sort.press("Enter");
        assert.deepEqual(await readings.allTextContents(), [
          "10",
          "8",
          "6",
          "4",
          "No reading",
        ]);
        assert.equal(await header.getAttribute("aria-sort"), "descending");
        root = await show("accordion");
        await root
          .getByRole("button", { name: "Who can open this view?" })
          .click();
        assert.ok(
          await root.getByText("People with access to Sourdough.").isVisible(),
        );
        await root
          .getByRole("button", { name: "Where are archived reviews?" })
          .click();
        await root.getByText("People with access to Sourdough.").waitFor({ state: "detached" });
        root = await show("slider");
        let slider = root.getByRole("slider", { name: "Preview volume" });
        await slider.focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await slider.inputValue(), "31");
        root = await show("input-otp");
        let otp = root.getByRole("textbox", { name: "Verification code" });
        await otp.fill("12a345678");
        assert.equal(await otp.inputValue(), "123456");
        root = await show("calendar");
        await root.getByRole("button", { name: /next month/i }).click();
        await root.getByText("December 2026").waitFor();
        root = await show("context-menu");
        await root.getByText("Weekly review").click({ button: "right" });
        await root.getByRole("menuitem", { name: "Pin review" }).click();
        await root.getByText("Review pinned", { exact: true }).waitFor();
        root = await show("toggle-group");
        let toggle = root.getByRole("button", { name: "Meatball" });
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-pressed"), "true");
        root = await show("sidebar");
        await root.getByRole("button", { name: "Collapse navigation" }).click();
        assert.equal(await root.getByRole("link").count(), 0);
        root = await show("project-settings");
        const frequency = root.getByRole("combobox", { name: "Frequency" });
        await frequency.click();
        await page.getByRole("option", { name: "Daily", exact: true }).click();
        assert.ok(
          await root.getByRole("button", { name: "Save changes" }).isEnabled(),
        );
        await root.getByRole("button", { name: "Discard" }).click();
        assert.match(await frequency.innerText(), /Weekly/);
        await frequency.click();
        await page.getByRole("option", { name: "Daily", exact: true }).click();
        await root.getByRole("button", { name: "Save changes" }).click();
        await root.getByText("Settings saved", { exact: true }).waitFor();
        root = await show("collection-browser");
        await root
          .getByRole("searchbox", { name: "Find a view" })
          .fill("missing");
        await root.getByRole("button", { name: /clear/i }).last().click();
        await root.getByRole("button", { name: "Include archived" }).click();
        await root.getByRole("button", { name: /October notes/ }).click();
        await root.getByText("October notes opened", { exact: true }).waitFor();
        root = await show("decision-review");
        await root.getByRole("button", { name: "Archive review" }).click();
        await root
          .getByRole("dialog")
          .getByRole("button", { name: "Cancel" })
          .click();
        assert.equal(await root.getByRole("status").count(), 0);
        await root.getByRole("button", { name: "Archive review" }).click();
        await root
          .getByRole("dialog")
          .getByRole("button", { name: "Archive review" })
          .click();
        await root.getByText("Review archived", { exact: true }).waitFor();
        root = await show("conversation-panel");
        await root
          .getByRole("textbox", { name: "Message" })
          .fill("Ready to publish");
        await root.getByRole("button", { name: "Send" }).click();
        await root.getByText("Ready to publish", { exact: true }).waitFor();
        assert.equal(
          await root.getByRole("textbox", { name: "Message" }).inputValue(),
          "",
        );
        root = await show("calendar");
        if (process.env.YOGURT_CAPTURE_DIR)
          await root.screenshot({
            path: path.join(process.env.YOGURT_CAPTURE_DIR, "calendar.png"),
          });
        ink.push("Component and block interactions");
        const lookup = page.getByRole("searchbox", { name: "Find a component" });
        for (const [query, name] of [
          ["IconButton", "IconButton"],
          ["icón–button", "IconButton"],
          ["icon b", "IconButton"],
          ["Accordion", "Accordion"],
        ]) {
          await lookup.fill(query);
          await page.getByRole("link", { name, exact: true }).waitFor();
        }
        await lookup.fill("Unused component alias");
        await page.getByText("No matching components.", {exact: true}).waitFor();
      }
      await ctx.close();
    }
    console.log(
      JSON.stringify(
        { browser: browser.version(), renders, failures, checks: ink },
        null,
        2,
      ),
    );
    assert.deepEqual(failures, []);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
