const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

(async () => {
  const { Chart } = await import(pathToFileURL(join(process.cwd(), "packages/web/dist/entries/chart.js")).href);
  const common = { title: "Observed series", series: "Readings", unit: "units", source: "Source", asOf: "2026-01-01" };
  const readings = [
    { id: "a", label: "First", value: 0 },
    { id: "b", label: "Missing", value: null },
    { id: "c", label: "Last", value: 3 },
  ];
  const markup = renderToStaticMarkup(React.createElement(Chart, { ...common, points: readings }));
  const missing = renderToStaticMarkup(React.createElement(Chart, { ...common, points: [{ id: "n", label: "Missing", value: null }] }));
  const empty = renderToStaticMarkup(React.createElement(Chart, { ...common, points: [] }));
  const extremes = renderToStaticMarkup(React.createElement(Chart, { ...common, points: [
    { id: "low", label: "Low", value: -1e308 }, { id: "high", label: "High", value: 1e308 },
  ] }));
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const width of [320, 1440]) {
      for (const colorScheme of ["light", "dark"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
        await page.goto(pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href + "#chart");
        const specimen = page.locator('.specimen[data-component="chart"]');
        await specimen.waitFor();
        await specimen.evaluate((node, html) => {
          const host = document.createElement("div");
          host.className = "chart-check";
          host.style.inlineSize = "100%";
          host.innerHTML = html;
          node.appendChild(host);
        }, markup + missing + empty + extremes);
        const charts = specimen.locator(".chart-check .yg-chart");
        const chart = charts.nth(0);
        assert.equal(await chart.locator(".yg-chart-line").getAttribute("d").then(d => (d.match(/M/g) || []).length), 2, "missing samples break the line");
        assert.equal(await chart.locator(".yg-chart-plot circle").count(), 2, "only observed values are plotted");
        assert.deepEqual(await chart.locator(".yg-chart-scale span").allTextContents(), ["3", "0"]);
        await chart.locator("summary").click();
        const rows = chart.locator("tbody tr");
        assert.equal(await rows.count(), 3);
        assert.match(await rows.nth(0).innerText(), /First\s+0/);
        assert.match(await rows.nth(1).innerText(), /Missing\s+No reading/);
        assert.match(await rows.nth(2).innerText(), /Last\s+3/);
        for (const index of [1, 2]) {
          const noReadings = charts.nth(index).getByText("No readings", { exact: true });
          assert.equal(await noReadings.count(), 1, "empty state occurs once");
          assert.equal(await noReadings.isVisible(), true);
          assert.equal(await noReadings.evaluate(node => node.closest('[aria-hidden="true"], [hidden], [inert]') === null), true,
            "empty state must be available to accessibility APIs");
          assert.equal(await charts.nth(index).locator("svg").getAttribute("aria-hidden"), "true");
          assert.equal(await charts.nth(index).locator(".yg-chart-scale").getAttribute("aria-hidden"), "true");
          assert.equal(await charts.nth(index).locator(".yg-chart-range").getAttribute("aria-hidden"), "true");
        }
        assert.equal(await chart.getByText("No readings", { exact: true }).count(), 0, "an observed zero is not an empty state");
        const path = await charts.nth(3).locator(".yg-chart-line").getAttribute("d");
        assert(!/NaN|Infinity/.test(path), "finite extreme readings retain finite coordinates");
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, "chart must fit the viewport");
        const layout = await chart.evaluate(node => {
          const plot = node.querySelector(".yg-chart-plot").getBoundingClientRect();
          const svg = node.querySelector("svg").getBoundingClientRect();
          const dots = [...node.querySelectorAll(".yg-chart-plot circle")].map(dot => {
            const box = dot.getBoundingClientRect();
            return { width: box.width, height: box.height, centerX: (box.left + box.right) / 2 };
          });
          const labels = [...node.querySelectorAll(".yg-chart-range > span")].map(label => {
            const box = label.getBoundingClientRect();
            return { left: box.left, right: box.right };
          });
          return { plotWidth: plot.width, svgWidth: svg.width, plotLeft: plot.left, svgLeft: svg.left, plotRight: plot.right, svgRight: svg.right, dots, labels };
        });
        assert(layout.svgWidth > 0 && layout.svgLeft >= layout.plotLeft && layout.svgRight <= layout.plotRight + 1);
        assert.equal(layout.dots.length, 2);
        for (const dot of layout.dots) {
          assert(dot.width > 0 && Math.abs(dot.width - dot.height) <= 1,
            `plot markers must remain circular at ${width}px`);
        }
        assert.equal(layout.labels.length, 3);
        assert.match(await chart.locator(".yg-chart-interior-tick").innerText(), /Missing\s+No reading/);
        assert(Math.abs(layout.labels[0].left - layout.dots[0].centerX) <= 2,
          `first label should align with the first point at ${width}px`);
        assert(Math.abs(layout.labels.at(-1).right - layout.dots[1].centerX) <= 2,
          `last label should align with the last point at ${width}px`);
        await page.close();
      }
    }
    console.log("Chart gap, zero, missing values, finite extremes and layout verified at 320 and 1440 px.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
