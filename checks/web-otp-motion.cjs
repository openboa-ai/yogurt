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
      await input.fill("123456");
      await page.getByRole("status").getByText("Verified").waitFor();
      if (reducedMotion === "no-preference") {
        await page.waitForFunction(() => {
          const merge = parseFloat(document.querySelector(".yg-otp").style.getPropertyValue("--yg-otp-merge"));
          return merge > 0.02 && merge < 0.9;
        });
        await input.press("Backspace");
        await page.getByRole("status").waitFor({ state: "detached" });
        assert.equal(await input.inputValue(), "12345");
        await page.waitForFunction(() => parseFloat(document.querySelector(".yg-otp").style.getPropertyValue("--yg-otp-merge")) < 0.01);
        await input.fill("123456");
      }
      await page.waitForFunction(() => {
        const node = document.querySelector(".yg-otp");
        return parseFloat(node.style.getPropertyValue("--yg-otp-merge")) > 0.99 &&
          parseFloat(node.style.getPropertyValue("--yg-otp-confirm")) > 0.99;
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log("OTP confirmation interruption and reduced motion verified.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
