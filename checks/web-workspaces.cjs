const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const { resolve, join } = require("node:path");
const { pathToFileURL } = require("node:url");

const gallery = pathToFileURL(resolve(__dirname, "../components.html")).href;

async function checkWorkspaces(browser, width, theme) {
  const page = await browser.newPage({
    viewport: { width, height: 940 }, colorScheme: theme, hasTouch: width < 500,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.setDefaultTimeout(4000);
  const capture = process.env.YOGURT_CAPTURE_DIR;
  async function show(id) {
    await page.goto(gallery + "#" + id);
    const sample = page.locator('.specimen[data-component="' + id + '"]');
    await sample.waitFor();
    return sample;
  }
  async function button(root, name) {
    const control = root.getByRole("button", { name, exact: true });
    await control.click();
  }
  async function saveCapture(root, name) {
    if (capture) await root.screenshot({ path: join(capture, name + "-" + theme + ".png") });
  }

  try {
    let root = await show("agent-avatar");
    const face = root.locator("svg.yg-agent-avatar");
    const silhouette = await face.evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      radius: getComputedStyle(node).borderRadius,
      shadow: getComputedStyle(node).boxShadow,
      paths: node.querySelectorAll(".yg-avatar-body > path").length,
    }));
    assert.deepEqual(silhouette, { background: "rgba(0, 0, 0, 0)", radius: "0px", shadow: "none", paths: 1 });

    root = await show("agent-workspace");
    await saveCapture(root, "agent-workspace");
    const roster = root.getByRole("searchbox", { name: "Find an agent" });
    async function browse() {
      if (!await roster.isVisible()) await button(root, "Browse agents");
    }
    await root.getByRole("textbox", { name: "Message Kai" }).fill("Draft for Kai");
    await browse();
    await roster.fill("nobody");
    await root.getByText("No matching agents.", { exact: true }).waitFor();
    await button(root, "Show all agents");
    await button(root, "Sol");
    assert.equal(await root.getByRole("textbox", { name: "Message Sol" }).inputValue(), "");
    await browse();
    await button(root, "Kai");
    assert.equal(await root.getByRole("textbox", { name: "Message Kai" }).inputValue(), "Draft for Kai");
    await button(root, "Computer");
    await button(root, "Request control");
    await root.getByText("You are in control", { exact: true }).waitFor();
    await button(root, "Return control");
    await root.getByRole("button", { name: "Watch screen", exact: true }).waitFor();

    root = await show("project-workspace");
    await saveCapture(root, "project-workspace");
    await root.getByRole("tab", { name: /Sources/ }).click();
    await root.getByText("Production handoff.pdf", { exact: true }).waitFor();
    if (!await root.getByRole("button", { name: "Meatball", exact: true }).isVisible()) {
      await button(root, "Projects");
    }
    await button(root, "Meatball");
    await root.getByRole("tab", { name: /Sources/ }).click();
    await root.getByText("Meatball onboarding", { exact: true }).waitFor();
    assert.equal(await root.getByText("Production handoff.pdf", { exact: true }).count(), 0);

    root = await show("composer");
    await button(root, "Remove Launch brief.pdf");
    await button(root, "Attach");
    await root.getByText("Research notes.md", { exact: true }).waitFor();
    await root.getByRole("textbox", { name: "Message Kai" }).fill("A source for review");
    await button(root, "Send");
    await root.getByText("Draft sent: A source for review", { exact: true }).waitFor();

    root = await show("attention-inbox");
    await saveCapture(root, "attention-inbox");
    await button(root, "Review Release note drafted");
    await button(root, "Cancel");
    assert.equal(await root.getByText("Draft approved in this preview.", { exact: true }).count(), 0);
    await button(root, "Review Release note drafted");
    await button(root, "Approve draft");
    await root.getByText("Draft approved in this preview.", { exact: true }).waitFor();

    root = await show("operations-library");
    await button(root, "Edit Workspace digest");
    await root.getByRole("combobox", { name: "Run schedule" }).selectOption("Monday at 10:00");
    await button(root, "Save schedule");
    await root.getByText("Monday at 10:00", { exact: true }).waitFor();

    root = await show("artifact-library");
    await button(root, "Open November review, Page");
    await root.getByRole("region", { name: "November review preview" }).waitFor();
    await root.getByRole("combobox", { name: "Type" }).selectOption("file");
    assert.equal(await root.getByRole("region", { name: "November review preview" }).count(), 0);

    root = await show("project-access");
    await button(root, "Remove Jules Reed");
    await button(root, "Cancel");
    await root.getByText("Jules Reed", { exact: true }).waitFor();
    await button(root, "Remove Jules Reed");
    await button(root, "Remove access");
    await root.getByText("Access removed.", { exact: true }).waitFor();
    assert.equal(await root.getByText("Jules Reed", { exact: true }).count(), 0);

    root = await show("agent-profile");
    const name = root.getByRole("textbox", { name: "Name", exact: true });
    await name.fill("Kai · Release lead");
    await button(root, "Discard");
    assert.equal(await name.inputValue(), "Kai");
    await name.fill("Kai · Release lead");
    await root.getByRole("combobox", { name: "Silhouette" }).selectOption("Sol");
    await button(root, "Save profile");
    await root.getByText("Profile saved", { exact: true }).waitFor();

    root = await show("run-inspector");
    await button(root, "Retry run");
    await root.getByText("Retry queued in this preview.", { exact: true }).waitFor();
    await button(root, "Cancel run");
    await root.getByText("Run cancelled in this preview.", { exact: true }).waitFor();
    await root.getByRole("button", { name: /run 2/ }).click();
    await root.getByText(/4 reviewed · 2 open/).waitFor();
    assert.deepEqual(errors, []);
    return { width, theme, avatar: silhouette, interactionGroups: 9 };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome" });
  try {
    for (const [width, theme] of [[1280, "light"], [390, "dark"]]) {
      console.log(JSON.stringify(await checkWorkspaces(browser, width, theme)));
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
