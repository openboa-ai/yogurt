const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const { join, resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

const gallery = pathToFileURL(resolve(__dirname, "../apps/guide/generated/components.html")).href;
const capture = process.env.YOGURT_CAPTURE_DIR;
const states = require("../design/assets/agents/presence-motion.json");
const promiseToSettle = (node) => Promise.all(node.getAnimations().map((motion) => motion.finished));
const boundsMatch = (a, b) => ["x", "y", "width", "height"].every((key) => Math.abs(a[key] - b[key]) <= 1);

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1120, height: 850 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.setDefaultTimeout(4500);
    async function open(id) {
      await page.goto(gallery + "#" + id);
      const root = page.locator('.specimen[data-component="' + id + '"]');
      await root.waitFor();
      return root;
    }

    const agent = await open("agent-avatar");
    const select = agent.getByRole("combobox", { name: "Agent state" });
    const svg = agent.locator(".yg-agent-avatar");
    const eyes = svg.locator(".yg-eyes");
    const shape = svg.locator(".yg-avatar-body > path");
    const outline = await shape.getAttribute("d");
    const rect = await svg.boundingBox();
    const waitForAnimations = (playState) => page.waitForFunction((state) => {
      const root = document.querySelector('.specimen[data-component="agent-avatar"] .yg-agent-avatar');
      const tracks = root?.getAnimations({ subtree: true }).filter(a => a.id.startsWith("yg-avatar-") && a.id !== "yg-avatar-entry" && a.id !== "yg-avatar-mark");
      return tracks?.length === 3 && tracks.every(a => a.playState === state && !a.pending);
    }, playState);
    const sample = (at) => svg.evaluate(async (root, time) => {
      const parts = [root.querySelector(".yg-avatar-body"), ...root.querySelectorAll(".yg-eye")];
      const animations = root.getAnimations({ subtree: true }).filter(a => a.id !== "yg-avatar-entry");
      for (const animation of root.getAnimations({ subtree: true }))
        if (animation.id === "yg-avatar-entry") animation.cancel();
      for (const animation of animations) animation.pause();
      await Promise.all(animations.map(animation => animation.ready));
      for (const animation of animations) animation.currentTime = time;
      return parts.map((part) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(part).transform);
        const width = Math.hypot(m.a, m.b);
        const round = value => Number(value.toFixed(6));
        return { x: round(m.e), y: round(m.f), angle: round(Math.atan2(m.b, m.a) * 180 / Math.PI), width: round(width),
          opening: round((m.a * m.d - m.b * m.c) / width) };
      });
    }, at);

    const activeMark = () => svg.locator(".yg-eye").evaluateAll(eyes => eyes.map(eye =>
      ["round", "cross", "smile"].find(mark => +getComputedStyle(eye.querySelector(".yg-eye-" + mark)).opacity === 1)));
    for (const [state, clip] of Object.entries(states)) {
      await select.selectOption(state);
      await waitForAnimations("running");
      assert.equal(await agent.getByRole("status").textContent(), clip.label);
      assert.equal(await eyes.getAttribute("data-gaze"), state);
      assert.equal(await shape.getAttribute("d"), outline);
      assert(boundsMatch(await svg.boundingBox(), rect));
      assert.equal(await svg.evaluate((el) => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
    }

    await select.selectOption("ready");
    const neutral = await sample(250);
    const glance = await sample(4430);
    const readyClosed = await sample(1640);
    assert.equal(neutral[0].x, 0);
    assert.deepEqual(glance[0], neutral[0]);
    assert(glance[1].x > 1.5);
    assert.deepEqual(readyClosed.slice(1).map(({ opening }) => opening), [0, 0]);
    assert.deepEqual(await sample(6800), neutral);
    assert((await sample(7900))[1].x < -2);
    assert.deepEqual(await sample(11160), neutral);

    await select.selectOption("thinking");
    const firstLook = await sample(110);
    const upRight = await sample(1660);
    const rightProfile = await sample(2350);
    const back = await sample(2640);
    const leftProfile = await sample(3020);
    const upLeft = await sample(3420);
    const thought = await sample(5640);
    for (const pose of [firstLook, upRight, rightProfile, back, leftProfile, upLeft, thought]) {
      assert.equal(pose[0].x, neutral[0].x);
      assert.equal(pose[0].y, neutral[0].y);
      assert(pose[1].y < -9 && pose[2].y < -9);
    }
    assert(rightProfile[0].width < 0.78 && leftProfile[0].width < 0.78 && back[0].width === 1);
    assert(rightProfile[2].opening < rightProfile[1].opening * 0.15);
    assert(leftProfile[1].opening < leftProfile[2].opening * 0.3);
    for (const time of [2530, 2640, 2780]) {
      const hidden = await sample(time);
      assert(hidden.slice(1).every(eye => eye.opening === 0));
    }
    for (const eye of [1, 2]) {
      assert(upRight[eye].x - upLeft[eye].x > 21);
      assert(rightProfile[eye].x > 18 && leftProfile[eye].x < -18);
    }
    assert(upRight[1].opening < upRight[2].opening);
    assert(upLeft[1].opening > upLeft[2].opening);
    assert(thought[1].opening > thought[1].width * 0.8);
    assert(thought[1].opening < thought[2].opening * 0.78);
    assert(thought[1].y - thought[2].y > 1.8 && thought[1].y - thought[2].y < 3);
    const earlyStudy = await sample(660);
    const squint = await sample(4290);
    assert(earlyStudy[1].x < -5 && earlyStudy[2].y < -10);
    assert.deepEqual(earlyStudy[0], neutral[0]);
    assert(squint[1].opening < 0.7 && squint[2].opening < 0.8);
    await sample(5640);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-thinking.png") });

    await select.selectOption("working");
    const start = await sample(0);
    const early = await sample(85);
    const left = await sample(245);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-left.png") });
    const right = await sample(625);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-right.png") });
    assert(early[1].x < -9 && early[0].x === start[0].x);
    assert(Math.abs(left[0].angle) < 2 && Math.abs(right[0].angle) < 2);
    assert(right[0].x - left[0].x > 11);
    assert(right[1].x - left[1].x > 15);
    const reset = await sample(827);
    assert(reset[1].x < -8 && reset[0].x > 4 && reset[1].y > 6.5);
    assert(reset[0].y > 4 && (await sample(942))[0].x < -5);
    const workingClosed = await sample(1540);
    assert.deepEqual(workingClosed.slice(1).map(({ opening }) => opening), [0, 0]);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-closed.png") });
    const reading = await sample(2175);
    assert(reading.slice(1).every(({ width, opening }) => Math.abs(width / opening - 1) < 0.25));
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-working-light.png") });
    const extraLine = await sample(5310);
    const extraLineEnd = await sample(5690);
    assert(extraLine[1].y > 7 && extraLineEnd[1].x - extraLine[1].x > 15);
    assert.deepEqual(await sample(6160), start);
    assert(start[0].y > 2 && start[1].y > 3);
    const beforeRetarget = await sample(4250);

    await select.selectOption("waiting");
    const interrupted = await svg.evaluate((root) => {
      const body = root.querySelector(".yg-avatar-body");
      const entry = body.getAnimations().find(a => a.id === "yg-avatar-entry");
      return entry?.effect.getKeyframes()[0].transform;
    });
    const fromAngle = Number(interrupted?.match(/rotate\(([-\d.]+)deg\)/)?.[1]);
    assert(Math.abs(fromAngle - beforeRetarget[0].angle) < 0.02, interrupted);
    const seekLeft = await sample(1000);
    const seekRight = await sample(2700);
    const waitingBlink = await sample(4100);
    const waiting = await sample(5000);
    assert(seekLeft[1].x < -9 && seekRight[1].x > 9);
    assert(seekRight[0].x - seekLeft[0].x > 14);
    assert(seekLeft[0].angle < -10 && seekRight[0].angle > 10);
    assert(seekRight[1].opening > seekRight[1].width * 1.2);
    assert.deepEqual(seekLeft, await sample(1300));
    assert.deepEqual(seekRight, await sample(3600));
    assert.deepEqual(waitingBlink.slice(1).map(({ opening }) => opening), [0, 0]);
    assert.deepEqual(waiting, await sample(6420));
    await sample(2700);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-waiting.png") });

    await select.selectOption("blocked");
    const flinch = await sample(115);
    assert.deepEqual(await activeMark(), ["round", "round"]);
    const drop = await sample(450);
    assert(drop[0].y > 4 && drop[0].opening < 0.90 && Math.abs(drop[0].angle) < 3);
    const blocked = await sample(4320);
    assert(blocked[1].y > 7 && blocked[2].opening > 2);
    assert.deepEqual(await sample(750), blocked);
    assert((await sample(2190))[0].y > blocked[0].y + 0.2);
    await sample(4320);
    assert.deepEqual(await activeMark(), ["cross", "cross"]);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-blocked.png") });

    await select.selectOption("done");
    assert.equal(await agent.getByRole("status").textContent(), states.done.label);
    await sample(0);
    assert.deepEqual(await activeMark(), ["cross", "cross"]);
    const beforeSmile = await sample(124);
    assert.deepEqual(await activeMark(), ["round", "round"]);
    assert(beforeSmile.slice(1).every(eye => eye.opening < 0.01));
    const crouch = await sample(125);
    assert(crouch[0].y > 4 && crouch[0].opening < 0.9);
    assert(crouch.slice(1).every(eye => eye.opening === 0));
    assert.deepEqual(await activeMark(), ["smile", "smile"]);
    const smileOpening = await sample(174);
    assert(smileOpening.slice(1).every(eye => eye.opening > 0.6 && eye.opening < 1.4));
    const firstJump = await sample(330);
    const landing = await sample(530);
    const secondJump = await sample(708);
    assert(firstJump[0].y < -10 && firstJump[0].y < secondJump[0].y - 3);
    assert(landing[0].y > 5 && secondJump[0].y < -7);
    const sway = await sample(2090);
    const relaxed = await sample(4270);
    assert(sway[0].angle < -3 && Math.abs(sway[0].y) < 2);
    assert(relaxed[0].angle > 5 && relaxed[0].y < -0.8);
    assert(relaxed[1].angle > 4 && relaxed[2].angle < -4);
    for (const eye of [1, 2]) {
      for (const pose of [firstJump, secondJump, landing, relaxed]) {
        assert(Math.abs(pose[eye].width - relaxed[eye].width) < 0.001);
        assert(Math.abs(pose[eye].opening - relaxed[eye].width) < 0.001);
      }
      assert(firstJump[eye].y < relaxed[eye].y - 1);
      assert(secondJump[eye].y < relaxed[eye].y - 1);
      assert(landing[eye].y > relaxed[eye].y + 1);
    }
    assert.deepEqual(await activeMark(), ["smile", "smile"]);
    if (capture) await agent.screenshot({ path: join(capture, "motion-agent-finished.png") });
    await select.selectOption("working");
    await waitForAnimations("running");
    const attrUpdates = await svg.evaluate((root) => new Promise(resolve => {
      let writes = 0;
      const observer = new MutationObserver(records => { writes += records.length; });
      observer.observe(root, { subtree: true, attributes: true });
      setTimeout(() => { observer.disconnect(); resolve(writes); }, 450);
    }));
    assert.equal(attrUpdates, 0);
    await agent.evaluate((el) => { el.style.marginTop = "200vh"; });
    await waitForAnimations("paused");
    await agent.evaluate((el) => { el.style.removeProperty("margin-top"); });
    await waitForAnimations("running");

    await select.selectOption("blocked");
    await svg.evaluate((root) => Promise.all(root.getAnimations({ subtree: true }).map(a => a.finished)));
    assert.equal(await agent.getByRole("status").textContent(), "Blocked");

    const workspace = await open("agent-workspace");
    const transcript = workspace.getByRole("region", { name: "Conversation with Kai" });
    assert.equal(await transcript.locator(".yg-message .yg-agent-avatar").evaluate((group) =>
      group.getAnimations({ subtree: true }).length), 0);
    const draft = workspace.getByRole("textbox", { name: "Message Kai" });
    await draft.fill("Review the notes");
    await workspace.getByRole("button", { name: "Send", exact: true }).click();
    await transcript.locator(".yg-conversation-presence [data-gaze=thinking]").waitFor();
    await transcript.locator(".yg-conversation-presence [data-gaze=working]").waitFor();
    assert.equal(await transcript.getByText("Review the notes", { exact: true }).count(), 1);
    if (capture) await workspace.screenshot({ path: join(capture, "motion-conversation-working.png") });
    await workspace.getByRole("button", { name: "Stop", exact: true }).click();
    assert.equal(await transcript.locator(".yg-conversation-presence").count(), 0);
    assert.equal(await workspace.locator(".yg-agent-detail-header .yg-eyes").getAttribute("data-gaze"), "ready");

    let nav = await open("segmented-control");
    let marker = nav.locator(".yg-selection-marker[data-ready]");
    await marker.waitFor();
    const first = nav.locator(".yg-segment button").filter({ hasText: "Sourdough" });
    const last = nav.locator(".yg-segment button").filter({ hasText: "Yogurt" });
    await last.press("Space");
    assert.equal(await last.getAttribute("data-state"), "on");
    await first.press("Space");
    await last.press("Space");
    await marker.evaluate(promiseToSettle);
    assert.equal(await last.getAttribute("data-state"), "on");
    assert(boundsMatch(await marker.boundingBox(), await last.boundingBox()));

    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await page.setViewportSize({width:390,height:850});
    const reduced = await open("agent-avatar");
    const reducedSelect = reduced.getByRole("combobox", { name: "Agent state" });
    await reducedSelect.selectOption("working");
    assert.equal(await reduced.getByRole("status").textContent(), "Working");
    assert.equal(await reduced.locator(".yg-avatar-body").evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
    assert(await reduced.locator(".yg-avatar-body").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).f > 2));
    await reducedSelect.selectOption("thinking");
    assert.equal(await reduced.locator(".yg-eye").count(), 2);
    await reducedSelect.selectOption("blocked");
    assert.equal(await reduced.locator(".yg-eye-cross").first().evaluate(el => getComputedStyle(el).opacity), "1");
    await reducedSelect.selectOption("thinking");
    assert(await reduced.locator(".yg-eye").first().evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).f < -4));
    if (capture) await reduced.screenshot({ path: join(capture, "motion-agent-reduced-dark.png") });
    nav = await open("segmented-control");
    marker = nav.locator(".yg-selection-marker[data-ready]");
    await marker.waitFor();
    await nav.locator(".yg-segment button").filter({ hasText: "Yogurt" }).press("Space");
    assert.equal(await marker.evaluate((el) => el.getAnimations().length), 0);

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({
      presence: Object.keys(states), distinctHeldPoses: true, workingLoopSeam: true, waitingSearch: true, finishedJumps: 2, blockedCrossEyes: true, stableSilhouette: true, fullBlinks: ["ready", "working", "waiting"], workingTravel: right[0].x - left[0].x, waitingTurns: [seekLeft[0].angle, seekRight[0].angle], waitingTravel: seekRight[0].x - seekLeft[0].x, attrUpdates,
      conversation: ["acknowledge", "working", "cancel"], navigation: ["keyboard", "retarget", "reduced"],
      pageErrors: errors,
    }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
