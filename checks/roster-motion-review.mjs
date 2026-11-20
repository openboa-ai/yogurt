import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright-core";

const [consumerArg, outputArg] = process.argv.slice(2);
if (!consumerArg || !outputArg) throw Error("Usage: node checks/roster-motion-review.mjs <installed-web-consumer> <new-output-dir>");
const consumer = resolve(consumerArg);
const output = resolve(outputArg);
const kit = "node_modules/@openboa/yogurt";
const { packages } = JSON.parse(await readFile(join(consumer, "package-lock.json"), "utf8"));
const installed = JSON.parse(await readFile(join(consumer, kit, "package.json"), "utf8"));
const pin = packages?.[kit];
assert(pin?.resolved && pin.version === installed.version, "The roster review requires a locked SDK install.");

const labels = { thinking: "Thinking", working: "Working", waiting: "Waiting for you" };
const order = Object.keys(labels);
for (let index = order.length - 1; index > 0; index--) {
  const selected = randomInt(index + 1);
  [order[index], order[selected]] = [order[selected], order[index]];
}
const rows = order.map((state, index) => ({ letter: "ABC"[index], state }));

const contents = `
  import { useEffect, useState } from "react";
  import { createRoot } from "react-dom/client";
  import { agentPresenceLabels } from "@openboa/yogurt";
  import { AgentAvatar } from "@openboa/yogurt/agent-avatar";
  import { Button } from "@openboa/yogurt/button";
  import { Heading } from "@openboa/yogurt/heading";
  import { Stack } from "@openboa/yogurt/stack";
  import { Text } from "@openboa/yogurt/text";
  import { Yogurt } from "@openboa/yogurt/yogurt";
  import "@openboa/yogurt/styles.css";
  const rows = ${JSON.stringify(rows)};
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  function Roster() {
    const [sequence, replay] = useState(0);
    const [reduced, setReduced] = useState(preference.matches);
    useEffect(() => {
      const update = event => setReduced(event.matches);
      preference.addEventListener("change", update);
      return () => preference.removeEventListener("change", update);
    }, []);
    return <Yogurt appearance="auto">
      <main>
        <Stack gap={16}>
          <Heading level={1}>Agent presence at 24 px</Heading>
          <Text>{reduced ? "Reduced-motion status labels" :
            "Which row is waiting for you, which is working, and which is thinking?"}</Text>
          <ul aria-label="Roster" key={sequence}>
            {rows.map(({letter, state}) => <li key={letter}>
              <AgentAvatar agent="Kai" size={24} state={state} label="" />
              <Text>{letter}</Text>
              {reduced && <Text variant="meta">{agentPresenceLabels[state]}</Text>}
            </li>)}
          </ul>
          {!reduced && <Button emphasis="soft" size="compact" onClick={() => replay(sequence + 1)}>Replay</Button>}
        </Stack>
      </main>
    </Yogurt>;
  }
  createRoot(document.getElementById("app")).render(<Roster />);
`;
await mkdir(output);
const bundled = await build({
  absWorkingDir: consumer, stdin: { contents, sourcefile: "roster.tsx", loader: "tsx", resolveDir: consumer },
  bundle: true, write: false, minify: true, jsx: "automatic",
  loader: { ".woff2": "dataurl" }, outfile: join(output, "roster.js"),
});
const source = extension => bundled.outputFiles.find(file => file.path.endsWith(extension)).text;
const html = join(output, "roster.html");
await writeFile(html, `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yogurt roster review</title><style>${source(".css")}
body{margin:0}.yg-root{min-height:100vh}main{max-width:27rem;margin-inline:auto;padding:var(--boa-space-24)}
ul{list-style:none;margin:0;padding:0}li{display:flex;align-items:center;gap:var(--boa-space-12);min-height:40px}
</style><div id="app"></div><script>${source(".js").replace(/<\/script/gi, "<\\/script")}</script></html>`);

const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
try {
  const evidence = { version: installed.version, resolved: pin.resolved, browser: browser.version(), order: rows, observations: [] };
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ colorScheme: "dark", viewport: { width: 390, height: 560 }, reducedMotion });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    try {
      await page.goto(pathToFileURL(html).href);
      const roster = page.getByRole("list", { name: "Roster" });
      const avatars = roster.locator(".yg-agent-avatar");
      await avatars.last().waitFor();
      assert.deepEqual(await avatars.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width)), [24, 24, 24]);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const visibleLabels = await roster.getByRole("listitem").allTextContents();
      const accessible = await roster.ariaSnapshot();
      if (reducedMotion === "reduce") {
        for (const { state } of rows) assert.match(accessible, new RegExp(labels[state]));
        assert.deepEqual(await avatars.evaluateAll(nodes => nodes.map(node => node.getAnimations({ subtree: true }).length)), [0, 0, 0]);
      } else {
        assert.deepEqual(visibleLabels, ["A", "B", "C"]);
        assert.doesNotMatch(accessible, /thinking|working|waiting for you/i);
        await avatars.evaluateAll(async nodes => {
          const tracks = nodes.map(node => node.getAnimations({ subtree: true }).find(track => track.id === "yg-avatar-body"));
          if (tracks.some(track => !track)) throw Error("An avatar lacks a live body track.");
          await Promise.all(tracks.map(track => track.ready));
          const first = tracks.map(track => track.currentTime);
          await new Promise(resolve => setTimeout(resolve, 180));
          if (tracks.some((track, index) => track.playbackRate !== 1 || track.currentTime - first[index] < 100)) {
            throw Error("An avatar did not advance at normal speed.");
          }
        });
        const first = await avatars.first().elementHandle();
        await page.getByRole("button", { name: "Replay" }).click();
        await avatars.last().waitFor();
        assert.equal(await first.evaluate(node => node.isConnected), false);
        await page.waitForFunction(() => {
          const nodes = [...document.querySelectorAll(".yg-agent-avatar")];
          return nodes.length === 3 && nodes.every(node => node.getAnimations({ subtree: true }).some(track =>
            track.id === "yg-avatar-body" && track.playbackRate === 1 && track.playState === "running"));
        });
        await first.dispose();
      }
      assert.deepEqual(errors, []);
      const screenshot = `${reducedMotion}.png`;
      await page.screenshot({ path: join(output, screenshot) });
      evidence.observations.push({ reducedMotion, width: 24, visibleLabels, accessible, screenshot });
    } finally {
      await page.close();
    }
  }
  await writeFile(join(output, "reviewer-key.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log("Verified an unlabelled 24 px replay and labelled reduced-motion roster with " + browser.version());
} finally {
  await browser.close();
}
