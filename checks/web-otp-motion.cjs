const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium, webkit } = require("playwright-core");

(async () => {
  const browser = process.argv[2] === "webkit" ? await webkit.launch() : await chromium.launch({ channel: "chrome" });
  try {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width: 320, height: 850 }, reducedMotion });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(join(__dirname, "../apps/guide/generated/motion-patterns.html")).href + "#otp");
      const input = page.getByRole("textbox", { name: "Verification code" });
      const otp = page.locator(".yg-otp");
      await otp.waitFor();
      const cells = otp.locator("[data-slot=otp-input-slot]");
      assert.equal(await cells.count(), 6);
      const backgrounds = () => cells.evaluateAll(nodes => nodes.map(node => getComputedStyle(node, "::before").backgroundColor));
      const resting = await backgrounds();
      async function checkFirstSlot() {
        assert.equal(await cells.first().getAttribute("data-active"), "");
        assert.equal(await otp.locator("[data-active]").count(), 1);
        assert.deepEqual((await backgrounds()).slice(1), resting.slice(1));
        assert.notEqual((await backgrounds())[0], resting[0]);
        assert.equal(await otp.evaluate(node => getComputedStyle(node).outlineStyle), "none");
      }
      await input.click();
      await checkFirstSlot();
      await input.press("Shift+Tab");
      assert.equal(await otp.locator("[data-active]").count(), 0);
      await page.waitForFunction(expected =>
        [...document.querySelectorAll(".yg-otp [data-slot=otp-input-slot]")].every((node, index) =>
          getComputedStyle(node, "::before").backgroundColor === expected[index]), resting);
      assert.deepEqual(await backgrounds(), resting);
      await page.keyboard.press("Tab");
      await checkFirstSlot();
      await input.fill("12a345678");
      assert.equal(await input.inputValue(), "123456");
      await otp.getByRole("status").getByText("Verified").waitFor();
      assert.equal(await otp.getAttribute("data-verified"), "true");
      assert.equal(await otp.getAttribute("data-complete"), "");
      await input.press("Backspace");
      await otp.getByRole("status").waitFor({ state: "detached" });
      assert.equal(await input.inputValue(), "12345");
      assert.equal(await otp.getAttribute("data-verified"), null);
      assert.equal(await otp.getAttribute("data-complete"), null);
      assert.equal(await input.evaluate(node => node === document.activeElement), true);
      await input.press("6");
      await otp.getByRole("status").getByText("Verified").waitFor();
      assert.equal(await input.inputValue(), "123456");
      assert.equal(await otp.getAttribute("data-verified"), "true");
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("OTP mixed direct input, pointer and keyboard focus, confirmation, reversal and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
