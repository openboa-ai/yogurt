const assert = require("node:assert/strict");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width: 320, height: 850 }, reducedMotion });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(join(__dirname, "../apps/guide/generated/motion-patterns.html")).href + "#otp");
      const input = page.getByRole("textbox", { name: "Verification code" });
      const otp = page.locator(".yg-otp");
      await input.fill("123456");
      await otp.getByRole("status").getByText("Verified").waitFor();
      assert.equal(await otp.getAttribute("data-verified"), "true");
      assert.equal(await otp.getAttribute("data-complete"), "true");
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
    console.log("OTP input, confirmation, reversal and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
