const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

(async () => {
  const { BarChart } = await import(pathToFileURL(join(process.cwd(), "packages/web/dist/entries/bar-chart.js")).href);
  const chart = renderToStaticMarkup(React.createElement(BarChart, {
    title: "Long values",
    points: [{ id: "long", label: "A long label without spaces", value: 1234567890123456 }],
    unit: "unbroken-unit-with-a-long-name-for-layout-checking",
    source: "Sample",
    asOf: "2026-11-20",
  }));
  const browser = await chromium.launch({ channel: "chrome" });
  const gallery = pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href;
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light" });
      await page.goto(gallery + "#post");
      const post = page.locator('.specimen[data-component="post"] .yg-post');
      const paragraph = post.locator(":scope > p").first();
      await paragraph.waitFor();
      const spacing = await paragraph.evaluate(el => {
        const style = getComputedStyle(el);
        return { margin: style.marginBlockStart, token: style.getPropertyValue("--yg-gap-stack").trim() };
      });
      assert.equal(spacing.margin, spacing.token, "paragraph after heading uses the shared stack gap");
      assert.notEqual(parseFloat(spacing.margin), 0, "paragraph spacing is visible");

      await page.goto(gallery + "#bar-chart");
      const specimen = page.locator('.specimen[data-component="bar-chart"] .specimen-inner');
      await specimen.waitFor();
      // The regular gallery chart is short; render the actual component with a
      // long numeric value and unit to exercise the narrow-layout boundary.
      await specimen.evaluate((el, html) => {
        const host = document.createElement("div");
        host.className = "long-chart-fixture";
        host.style.cssText = "inline-size:min(100%,280px);min-inline-size:0";
        host.innerHTML = html;
        el.appendChild(host);
      }, chart);
      const row = specimen.locator(".long-chart-fixture .yg-bars li");
      const geometry = await row.evaluate(el => {
        const label = el.children[0], track = el.children[1], value = el.children[2];
        const box = el.getBoundingClientRect();
        return {
          rowClient: el.clientWidth, rowScroll: el.scrollWidth,
          labelClient: label.clientWidth, labelScroll: label.scrollWidth,
          valueClient: value.clientWidth, valueScroll: value.scrollWidth,
          track: track.getBoundingClientRect().width,
          valueRight: value.getBoundingClientRect().right, rowRight: box.right,
          gap: getComputedStyle(el).columnGap,
          gapToken: getComputedStyle(el).getPropertyValue("--yg-gap-inline").trim(),
        };
      });
      assert(geometry.rowScroll <= geometry.rowClient + 1, "chart row fits its host");
      assert(geometry.labelScroll <= geometry.labelClient + 1, "label wraps within its column");
      assert(geometry.valueScroll <= geometry.valueClient + 1, "long value and unit wrap within their column");
      assert(geometry.valueRight <= geometry.rowRight + 1, "value stays within row");
      assert(geometry.track >= 47, "chart keeps a usable visible track");
      assert.equal(geometry.gap, geometry.gapToken, "chart columns use the shared inline gap");
      await page.close();
    }
    console.log("Post spacing and long BarChart values verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
