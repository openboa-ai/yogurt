import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const text = name => ({ role: "text", name });
const image = name => ({ role: "image", name });
const button = name => ({ role: "button", name });
const item = name => ({ role: "listitem", name });
const field = name => ({ role: "textbox", name });
const click = (role, name) => ({ action: "click", role, name });
const set = (name, value) => ({ action: "set_text", ...field(name), value });
const see = (role, name, state) => ({ role, name, state });
const gone = (role, name) => ({ role, name, absent: true });
const status = name => text(name);

const marks = ["Sourdough", "Meatball", "Yogurt"].map(image);
const staticExamples = {
  yogurt: [image("Sourdough"), text("Weekly review")],
  text: [text("Weekly review"), text("Shared with your team"), text("Updated Friday")],
  heading: [text("Saved views"), text("Three views in Sourdough.")],
  icon: ["search", "check", "chevron-down", "arrow-right", "clock"].map(image),
  stack: marks, inline: marks, grid: marks,
  surface: [image("Sourdough"), text("A saved view in Sourdough.")],
  divider: [text("Current review"), text("Archived on Friday")],
  count: [text("Weekly review")],
  "empty-result": [text("No records found"), text("Try a different search or create a new view.")],
  badge: [text("Draft")],
  status: [image("circle-dot"), text("Saved")],
  notice: [text("View updated"), text("Your team can use the new view.")],
  result: [text("Could not load records"), text("Your saved view is still here.")],
  "record-facts": [text("Last updated today"), text("Sample · 09:00")],
  legend: [text("Weekly review")],
  "project-mark": marks,
  message: [text("Kai"), text("Ready to review")],
  activity: [text("Weekly review")],
  transcript: [text("Review the notes and summarize the decisions.")],
  "aspect-ratio": [text("Details")],
  direction: [text("Weekly view"), text("Details")],
  asset: marks,
  gradient: [image("Neutral gradient"), image("Yogurt"), text("Yogurt")],
  elevation: [text("Details")],
  kbd: [text("Weekly view")],
  post: [text("Review"), text("Shared the latest project notes.")],
  "grid-list": [text("Weekly review"), text("Planning notes"), text("Project updates")],
  "list-header": [text("Review"), text("Three records"), text("Recently updated")],
  "list-footer": [text("All records are up to date")],
  top: [text("Review"), text("Three records"), text("Details")],
  "bottom-info": [text("Changes are saved locally.")],
  highlight: [text("Weekly view")],
  "table-row": [text("Weekly review"), text("Weekly view")],
  "amount-top": [text("Weekly view"), text("Three records")],
  "bar-chart": [text("Net change"), text("4 views"), text("-2 views"), text("No reading")],
  avatar: [image("Weekly review")],
  bubble: [text("The review is ready when you are.")],
  marker: [image("circle-dot"), text("Weekly review")],
};

const activated = status("Action received locally; no external effect");
const actions = {
  "button-group": [click("button", "Cancel"), activated, click("button", "Save view"), activated],
  "bottom-action": [click("button", "Save view"), activated],
  combobox: [set("Weekly review", "reviews"), see("textbox", "Weekly review", 'text="reviews"'),
    click("listitem", "Meatball"), see("textbox", "Weekly review", 'text="Meatball"')],
  link: [click("button", "View record details"), status("Record details"), click("button", "Close details"), gone("button", "Close details")],
  breadcrumb: [click("button", "Library"), status("Record details"), click("button", "Close details"),
    click("button", "Records"), status("Record details")],
  "navigation-list": [click("listitem", "Records"), activated, click("listitem", "Facts"), activated],
  "filter-bar": [set("Weekly review", "release"), see("textbox", "Weekly review", 'text="release"'),
    click("button", "All records"), activated],
  list: [click("listitem", "Field notes"), activated, click("listitem", "Release checklist"), activated],
  "selection-list": [click("checkbox", "Weekly digest"), status("Weekly digest cleared"),
    click("checkbox", "Product updates"), status("Product updates selected")],
  table: [see("gridcell", "No reading"), { action: "focus", role: "gridcell", name: "No reading" },
    see("gridcell", "No reading", "focused=true")],
  "data-table": [see("gridcell", "No reading"), { action: "focus", role: "gridcell", name: "No reading" },
    see("gridcell", "No reading", "focused=true")],
  "confirm-dialog": [click("button", "Review change"), button("Cancel"),
    click("button", "Cancel"), gone("button", "Cancel"), click("button", "Review change"),
    click("button", "Archive view"), status("Choice confirmed in this example.")],
  receipt: [click("button", "Check original request"), status("Original request"),
    click("button", "Close details"), gone("button", "Close details")],
  "reading-anchor": [click("button", "Weekly review"), status("Latest sample activity")],
  "toast-stack": [click("button", "Dismiss notification"), status("Notification dismissed"),
    click("button", "Dismiss notification"), status("No sample notifications")],
  attachment: [click("button", "Weekly review"), activated,
    click("button", "Remove"), gone("button", "Remove")],
  "code-block": [click("button", "Copy"), status("Sample copy acknowledged")],
  trace: [click("listitem", "Meatball"), status("state updated")],
  agreement: [click("checkbox", "Select all"), status("All choices selected"), see("checkbox", "Yogurt", "value=1"),
    see("checkbox", "Meatball", "value=1"), click("checkbox", "Yogurt"), see("checkbox", "Select all", "value=0"),
    status("Selection updated")],
  keypad: [click("button", "1"), status("1"), click("button", "2"), status("12"), click("button", "Delete"), status("1")],
  "toggle-group": [click("button", "Meatball"), status("Meatball selected"), click("button", "Yogurt"), status("Yogurt selected")],
  "context-menu": [click("button", "Weekly review"), click("menuitem", "Meatball"), status("state updated"), gone("menuitem", "Meatball")],
  command: [set("Find a command", "meatball"), see("textbox", "Find a command", 'text="meatball"'),
    click("listitem", "Meatball"), status("state updated")],
  menubar: [click("button", "Meatball"), click("menuitem", "Meatball"), status("state updated"), gone("menuitem", "Meatball")],
  "navigation-menu": [click("listitem", "Meatball"), status("state updated")],
  navbar: [click("button", "Back"), status("You returned to the sample parent view.")],
  "date-picker": [click("button", "Weekly review"), status("November 2026"), click("button", "12"),
    status("Nov 12, 2026"), gone("button", "12")],
  questionnaire: [click("button", "Continue"), status("Sample page changed; dates are illustrative"),
    see("button", "Back", "enabled=true"), click("button", "Back"), see("button", "Back", "enabled=false")],
  "runtime-panel": [click("button", "Request control"), status("Sample control active"), click("button", "Return control"),
    status("Read-only preview")],
  "resource-row": [click("listitem", "Weekly review"), status("Sample record opened"), click("button", "Pin Weekly review")],
  "thread-row": [click("listitem", "Weekly review"), status("Sample thread opened")],
  "work-event": [click("button", "Review details"), status("Reviewing the sample activity")],
  "routine-row": [click("button", "Run now"), status("Sample routine completed"),
    click("button", "Edit schedule"), status("Sample schedule")],
  "voice-control": [click("button", "Start call"), status("Sample call active"),
    click("button", "Mute"), status("Sample microphone muted"), click("button", "End call"), status("Sample call ended")],
  "project-settings": [click("button", "Frequency"), click("menuitem", "Daily"),
    see("switch", "Send a digest", "value=1"), click("button", "Save changes"), status("Sample settings saved"),
    click("switch", "Send a digest"), see("switch", "Send a digest", "value=0"),
    click("button", "Discard"), status("Sample settings restored"), see("switch", "Send a digest", "value=1")],
  "collection-browser": [set("Find a view", "no match"), status("No matching views"),
    click("button", "Clear search"), item("Meatball"), set("Find a view", "Yogurt"), see("textbox", "Find a view", 'text="Yogurt"'),
    gone("listitem", "Meatball"), click("listitem", "Yogurt"), status("state updated")],
  "conversation-panel": [set("Message", "Native review"), see("textbox", "Message", 'text="Native review"'),
    click("button", "Send"), status("Preparing a sample reply"), see("button", "Send", "enabled=false"),
    click("button", "Stop"), status("Sample reply stopped"), see("button", "Send", "enabled=true")],
  "agent-workspace": [click("listitem", "Sol"), status("Sol selected"), click("listitem", "Kai"), status("Kai selected")],
  "project-workspace": [click("button", "Share project"), status("Sample sharing"),
    click("button", "Close details"), gone("button", "Close details")],
  "operations-library": [click("button", "Run now"), status("Sample routine completed")],
  "attention-inbox": [click("button", "Review details"), status("Reviewing the sample activity")],
  "artifact-library": [click("button", "Download"), status("Sample download acknowledged"), click("button", "Close preview"),
    gone("button", "Close preview")],
  "project-access": [click("button", "Invite a person"), status("Invite preview"), click("button", "Close details"), gone("button", "Close details")],
  "agent-profile": [set("Name", "Native agent"), see("textbox", "Name", 'text="Native agent"'),
    click("button", "Save profile"), status("Sample profile saved"),
    click("button", "Discard"), see("textbox", "Name", 'text="Kai"')],
  "run-inspector": [click("listitem", "Meatball"), status("Two decisions need review.")],
  "agent-sidebar": [click("listitem", "Sol"), status("Sol selected"), click("listitem", "Kai"), status("Kai selected")],
};

const [id, cli, before, after] = process.argv.slice(2);
const contract = actions[id] ?? staticExamples[id];
if (!contract) process.exit(3);

function snapshot() {
  return run("snapshot");
}

function run(...args) {
  const result = spawnSync(cli, ["automate", ...args], { encoding: "utf8", timeout: 6000 });
  if (result.status !== 0) throw new Error(result.stderr || result.error || args.join(" "));
  return result.stdout;
}

function widgets(source) {
  const lines = source.split("\n");
  const start = lines.findIndex(line => line.includes('name="Component preview"'));
  const end = lines.findIndex((line, index) => index > start && line.includes('role=button name="Next"') &&
    /parent=#\d+/.test(line) && index >= lines.length - 3);
  return lines.slice(start + 1, end === -1 ? undefined : end).flatMap(line => {
    const match = line.match(/widget @w1\/main-canvas#(\d+) role=(\S+) name="([^"]*)" bounds=\(([^)]+)\)/);
    if (!match) return [];
    const bounds = match[4].match(/^([-\d.]+),([-\d.]+) ([-\d.]+)x([-\d.]+)$/);
    if (!bounds) return [];
    const [x, y, width, height] = bounds.slice(1).map(Number);
    if (width <= 0 || height <= 0) return [];
    return [{ line, id: match[1], role: match[2], name: match[3], x, y, width, height }];
  });
}

try {
  let current = readFileSync(before, "utf8");
  for (const step of contract) {
    const locate = source => widgets(source).find(widget => widget.role === step.role && widget.name === step.name &&
      (!step.state || widget.line.includes(step.state)) && (!step.action || widget.line.includes("enabled=true")));
    const retry = () => {
      const deadline = Date.now() + 1000;
      while (Date.now() < deadline && Boolean(locate(current)) === Boolean(step.absent)) current = snapshot();
    };
    if (actions[id]) retry();
    let widget = locate(current);
    if (step.absent ? widget : !widget) throw new Error(JSON.stringify(step));
    if (!step.action) continue;
    if (step.action === "click") {
      const preview = current.match(/main-canvas#(\d+) role=group name="Component preview" bounds=\([-\d.]+,([-\d.]+) [-\d.]+x([-\d.]+)\)/);
      const top = Number(preview?.[2]);
      const height = Number(preview?.[3]);
      const outOfView = candidate => candidate && (candidate.y + candidate.height / 2 < top + 4 ||
        candidate.y + candidate.height / 2 >= top + height - 4);
      if (preview && outOfView(widget)) {
        run("widget-wheel", "main-canvas", preview[1], String(Math.round(widget.y - top - height / 2)));
        const deadline = Date.now() + 1200;
        do {
          current = snapshot();
          widget = locate(current);
        } while (Date.now() < deadline && outOfView(widget));
        if (!widget || outOfView(widget)) throw new Error("Could not scroll to " + step.name);
      }
      run("widget-click", "main-canvas", widget.id);
    }
    else run("widget-action", "main-canvas", widget.id, step.action, ...(step.value === undefined ? [] : [step.value]));
    current = snapshot();
  }
  if (/This action is not implemented in this guide|AutomationCommandFailed/.test(current)) throw new Error("Guide action failed");
  writeFileSync(after, current);
  process.stdout.write(actions[id] ? "PASS" : "PRESENTATION");
} catch (error) {
  console.error(id + ": " + error.message);
  try { writeFileSync(after, snapshot()); } catch {}
  process.exitCode = 1;
}
