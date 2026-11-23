const { chromium } = require("playwright-core");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const esbuild = require("esbuild");

(async () => {
  const { NumericSpinner } = await import(pathToFileURL(join(process.cwd(), "packages/web/dist/entries/numeric-spinner.js")).href);
  const values = [-123456, -123, -9, 0, 9, 123, 123456];
  const fixture = values.map(value => renderToStaticMarkup(React.createElement(NumericSpinner, {
    label: "Long quantity label for layout checking",
    value, min: -1000000, max: 1000000, onValueChange: () => {},
  }))).join("");
  const browserFixture = await esbuild.build({
    stdin: {
      resolveDir: process.cwd(),
      loader: "js",
      contents: `
        import React, { useState } from "react";
        import { createRoot } from "react-dom/client";
        import { NumericSpinner } from "./packages/web/dist/entries/numeric-spinner.js";
        function Fixture() {
          const [value, setValue] = useState(99999);
          const [bounds, setBounds] = useState({ min: -1000000, max: 1000000 });
          return React.createElement("div", null,
            React.createElement("button", { "data-testid": "forward", onClick: () => setValue(100000) }, "Forward"),
            React.createElement("button", { "data-testid": "reverse", onClick: () => setValue(99999) }, "Reverse"),
            React.createElement("button", { "data-testid": "decimal", onClick: () => {
              setBounds({ min: -1e30, max: 1e30 }); setValue(-1234.5678901234567);
            } }, "Decimal"),
            React.createElement("button", { "data-testid": "exponent", onClick: () => setValue(1.2345678901234567e25) }, "Exponent"),
            React.createElement("button", { "data-testid": "bounds", onClick: () => {
              setBounds({ min: -2, max: 2 }); setValue(2);
            } }, "Bounds"),
            React.createElement(NumericSpinner, { label: "Controlled quantity", value, min: bounds.min, max: bounds.max, onValueChange: setValue })
          );
        }
        createRoot(document.getElementById("spinner-controlled-fixture")).render(React.createElement(Fixture));
      `,
    },
    bundle: true, platform: "browser", format: "iife", write: false,
  });
  const browser = await chromium.launch({ channel: "chrome" });
  const gallery = pathToFileURL(join(process.cwd(), "apps/guide/generated/components.html")).href;
  const failures = [];
  const measurements = [];
  try {
    for (const width of [320, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: width === 320 ? "dark" : "light", reducedMotion: "reduce" });
      await page.goto(gallery + "#numeric-spinner");
      const root = page.locator('.specimen[data-component="numeric-spinner"]');
      const more = root.getByRole("button", { name: "Increase Copies" });
      const less = root.getByRole("button", { name: "Decrease Copies" });
      await more.waitFor();

      // The live gallery fixture has a controlled 1–8 range: exercise real
      // keyboard activation, updates, and both ends of that range first.
      await more.focus();
      await page.keyboard.press("Space");
      assert.equal(await root.locator(".yg-quantity output > span:last-child").textContent(), "4");
      for (let value = 4; value < 8; value++) await more.press("Space");
      assert.equal(await root.locator(".yg-quantity output > span:last-child").textContent(), "8");
      assert.equal(await more.isDisabled(), true);
      for (let value = 8; value > 1; value--) await less.press("Space");
      assert.equal(await root.locator(".yg-quantity output > span:last-child").textContent(), "1");
      assert.equal(await less.isDisabled(), true);

      // Render the actual built component with larger signed values. The
      // gallery's interactive fixture does not expose a large range.
      await root.locator(".specimen-inner").evaluate((el, html) => {
        const host = document.createElement("div");
        host.className = "spinner-width-fixtures";
        host.style.cssText = "display:grid;gap:12px;inline-size:100%;min-inline-size:0";
        host.innerHTML = html;
        el.appendChild(host);
      }, fixture);
      const controls = root.locator(".spinner-width-fixtures .yg-quantity");
      assert.equal(await controls.count(), values.length);
      for (let index = 0; index < values.length; index++) {
        const geometry = await controls.nth(index).evaluate(el => {
          const output = el.querySelector("output");
          const ink = output.querySelector("span:last-child");
          const range = document.createRange();
          range.selectNodeContents(ink);
          const text = range.getBoundingClientRect();
          const visible = output.getBoundingClientRect();
          const label = el.querySelector(".yg-quantity-label").getBoundingClientRect();
          const group = output.parentElement.getBoundingClientRect();
          const buttons = [...el.querySelectorAll("button")].map(button => button.getBoundingClientRect());
          const container = el.getBoundingClientRect();
          return {
            textLeft: text.left, textRight: text.right, visibleLeft: visible.left, visibleRight: visible.right,
            labelLeft: label.left, labelRight: label.right, labelTop: label.top, labelBottom: label.bottom,
            controlsLeft: group.left, controlsRight: group.right, controlsTop: group.top, controlsBottom: group.bottom,
            firstRight: buttons[0].right, secondLeft: buttons[1].left,
            containerLeft: container.left, containerRight: container.right,
          };
        });
        measurements.push({ viewport: width, value: values[index], ...geometry });
        if (geometry.textLeft < geometry.visibleLeft - 1 || geometry.textRight > geometry.visibleRight + 1)
          failures.push(`${width}px: ${values[index]} is clipped by the value viewport`);
        if (geometry.firstRight > geometry.visibleLeft + 1 || geometry.visibleRight > geometry.secondLeft + 1)
          failures.push(`${width}px: ${values[index]} overlaps an action button`);
        if (geometry.labelRight > geometry.controlsLeft + 1 && geometry.labelLeft < geometry.controlsRight - 1 &&
            geometry.labelBottom > geometry.controlsTop + 1 && geometry.labelTop < geometry.controlsBottom - 1)
          failures.push(`${width}px: ${values[index]} label overlaps the actions`);
        if (geometry.controlsLeft < geometry.containerLeft - 1 || geometry.controlsRight > geometry.containerRight + 1)
          failures.push(`${width}px: ${values[index]} actions exceed their container`);
      }

      // A separate mounted React fixture changes props and bounds while the
      // actual component remains controlled by its host.
      await root.locator(".specimen-inner").evaluate(el => {
        const host = document.createElement("div");
        host.id = "spinner-controlled-fixture";
        host.style.cssText = "inline-size:100%;min-inline-size:0";
        el.appendChild(host);
      });
      await page.addScriptTag({ content: browserFixture.outputFiles[0].text });
      const controlledHost = root.locator("#spinner-controlled-fixture");
      const controlled = controlledHost.getByRole("group", { name: "Controlled quantity" });
      const result = controlled.locator("output");
      await controlled.waitFor();
      assert.equal(await result.getAttribute("aria-label"), "Controlled quantity");
      assert.equal(await result.getAttribute("aria-live"), "polite");
      assert.equal(await result.locator(".yg-quantity-measure[aria-hidden=true]").count(), 4);
      const stableWidth = (await result.boundingBox()).width;
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await controlledHost.getByTestId("forward").click();
      assert.equal(await result.locator("span:last-child").textContent(), "100000");
      assert.equal((await result.boundingBox()).width, stableWidth);
      await controlledHost.getByTestId("reverse").click();
      assert.equal(await result.locator("span:last-child").textContent(), "99999");
      assert.equal((await result.boundingBox()).width, stableWidth, "reversing within bounds retains the value width");
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await result.locator("span:last-child").evaluate(el => getComputedStyle(el).animationName), "none", "reduced motion settles immediately");

      for (const [name, expected] of [["decimal", String(-1234.5678901234567)], ["exponent", String(1.2345678901234567e25)]]) {
        await controlledHost.getByTestId(name).click();
        const value = result.locator("span:last-child");
        assert.equal(await value.textContent(), expected);
        const fit = await result.evaluate(el => {
          const range = document.createRange();
          range.selectNodeContents(el.querySelector("span:last-child"));
          const text = range.getBoundingClientRect(), viewport = el.getBoundingClientRect();
          return { left: text.left - viewport.left, right: viewport.right - text.right };
        });
        assert(fit.left >= -1 && fit.right >= -1, `${name} value must fit its rolling viewport`);
      }
      await controlledHost.getByTestId("bounds").click();
      const decrease = controlled.getByRole("button", { name: "Decrease Controlled quantity" });
      const increase = controlled.getByRole("button", { name: "Increase Controlled quantity" });
      assert.equal(await increase.isDisabled(), true);
      await decrease.focus();
      await decrease.press("Space");
      assert.equal(await result.locator("span:last-child").textContent(), "1");
      assert.equal(await decrease.evaluate(el => document.activeElement === el), true);
      assert.equal(await decrease.evaluate(el => el.matches(":focus-visible")), true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await controlledHost.getByTestId("forward").click();
      assert.equal(await result.locator("span:last-child").textContent(), "100000");
      const rolling = result.locator(".yg-quantity-in");
      assert.equal(await rolling.evaluate(el => getComputedStyle(el).animationName), "yg-quantity-enter");
      const outgoing = result.locator(".yg-quantity-out");
      assert.equal(await outgoing.getAttribute("aria-hidden"), "true");
      await outgoing.evaluate(node => Promise.allSettled(node.getAnimations().map(animation => animation.finished)));
      assert.equal(await outgoing.evaluate(node => getComputedStyle(node).opacity), "0");
      await page.close();
    }
    console.log(JSON.stringify({ measurements, failures }));
    assert.deepEqual(failures, [], "all signed values must remain legible and separated");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
