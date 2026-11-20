const assert = require("node:assert/strict");
const { chromium } = require("playwright-core");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const beats = {
  ready: [1630, "round"],
  thinking: [2640, "round"],
  working: [625, "round"],
  waiting: [2700, "round"],
  blocked: [2190, "cross"],
  done: [330, "smile"],
};

async function sample(avatars, state, width) {
  const [time, mark] = beats[state];
  await avatars.last().waitFor({ state: "visible" });
  const result = await avatars.evaluateAll(async (all, data) => {
    const [state, time, mark] = data;
    const tracks = [];
    for (const svg of all) {
      const animations = svg.getAnimations({ subtree: true });
      for (const animation of animations) {
        if (animation.id === "yg-avatar-entry") animation.cancel();
        else {
          animation.pause();
          tracks.push(animation);
        }
      }
      if (!animations.some(animation => animation.id === "yg-avatar-body")) throw Error("No avatar track for " + svg.parentElement.outerHTML.slice(0, 64));
    }
    await Promise.all(tracks.map(track => track.ready));
    for (const track of tracks) track.currentTime = time;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return all.map(svg => {
      const body = new DOMMatrixReadOnly(getComputedStyle(svg.querySelector(".yg-avatar-body")).transform);
      const roll = Math.atan2(body.b, body.a) * 180 / Math.PI;
      const eyes = [...svg.querySelectorAll(".yg-eye")];
      return {
        width: svg.getBoundingClientRect().width,
        correctState: svg.querySelector(".yg-eyes").dataset.gaze === state,
        correctEyes: eyes.length === 2 && eyes.every(eye => {
          if (+getComputedStyle(eye.querySelector(".yg-eye-" + mark)).opacity !== 1) return false;
          const shape = new DOMMatrixReadOnly(getComputedStyle(eye).transform);
          return !["ready", "thinking"].includes(state) || Math.abs(shape.a * shape.d - shape.b * shape.c) < 0.000001;
        }),
        distinct: state === "waiting" ? body.e > 3 && roll > 6
          : state === "working" ? body.f > 1 && Math.abs(roll) < 2
          : state === "done" ? body.f < -6 : true,
      };
    });
  }, [state, time, mark]);
  for (const pose of result) assert.deepEqual(pose, { width, correctState: true, correctEyes: true, distinct: true }, state);
  return result.length;
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const filename = process.env.YOGURT_FAMILY_HTML || join(__dirname, "../agents.html");
    const capture = process.env.YOGURT_CAPTURE_DIR;
    const wrapped = !!process.env.YOGURT_FAMILY_HTML;
    const tests = [];
    for (const [width, colorScheme] of [[736, "light"], [320, "dark"]]) {
      const page = await browser.newPage({ viewport: { width, height: 1300 }, colorScheme, deviceScaleFactor: 1 });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(pathToFileURL(filename).href);
      const root = (wrapped ? page.frameLocator("iframe") : page).locator("#yogurt-agent-family");
      const roster = root.getByRole("region", { name: "Roster preview" });
      const rosterAvatars = roster.locator(".yg-agent-avatar");
      const detail = root.getByRole("region", { name: "Detail preview" });
      const detailAvatars = detail.locator(".yg-agent-avatar");
      const states = root.getByRole("combobox", { name: "Agent state" });
      const palette = root.getByRole("combobox", { name: "Color" });
      await rosterAvatars.last().waitFor();
      assert.equal(await rosterAvatars.count(), 45);
      assert.equal(await palette.locator("option").count(), 27);
      assert.equal(await roster.getByRole("button").count(), 15);
      assert.equal(await root.evaluate(element => element.ownerDocument.documentElement.scrollWidth - element.ownerDocument.defaultView.innerWidth), 0);

      let compactPoses = 0;
      for (const state of Object.keys(beats)) {
        await states.selectOption(state);
        await rosterAvatars.last().evaluate(svg => new Promise(resolve => requestAnimationFrame(resolve)));
        compactPoses += await sample(rosterAvatars, state, 24);
      }
      let detailPoses = 0;
      const groups = roster.getByRole("button");
      for (let i = 0; i < (width === 736 ? await groups.count() : 1); i += 1) {
        await groups.nth(i).click();
        for (const state of Object.keys(beats)) {
          await states.selectOption(state);
          await detailAvatars.last().evaluate(svg => new Promise(resolve => requestAnimationFrame(resolve)));
          detailPoses += await sample(detailAvatars, state, 96);
        }
      }

      await roster.getByRole("button", { name: "Round star", exact: true }).click();
      assert.equal(await detailAvatars.count(), 2);
      const path = detailAvatars.first().locator(".yg-avatar-body > path");
      const original = await path.getAttribute("d");
      await palette.selectOption("blue.300");
      assert.equal(await path.getAttribute("fill"), "#86C0FE");
      assert.equal(await path.getAttribute("d"), original);
      await palette.selectOption("");
      await states.selectOption("waiting");
      await sample(detailAvatars, "waiting", 96);
      await sample(rosterAvatars, "waiting", 24);
      if (capture) await root.screenshot({ path: join(capture, "motion-agent-family-" + colorScheme + ".png") });

      await root.getByRole("button", { name: "Play sequence" }).click();
      assert.equal(await states.inputValue(), "thinking");
      await root.getByRole("button", { name: "Stop sequence" }).click();
      assert.equal(await states.inputValue(), "ready");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await states.selectOption("done");
      await detailAvatars.first().evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      assert(await detailAvatars.evaluateAll(all => all.every(svg => svg.getAnimations({subtree:true}).length === 0 &&
        +getComputedStyle(svg.querySelector(".yg-eye-smile")).opacity === 1)));
      assert.deepEqual(errors, []);
      tests.push({ width, colorScheme, compactPoses, detailPoses, errors });
      await page.close();
    }
    console.log(JSON.stringify(tests));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
