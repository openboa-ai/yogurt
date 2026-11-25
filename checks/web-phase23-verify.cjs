const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { dirname, join, resolve } = require("node:path");
const { build } = require("esbuild");
const { chromium } = require("playwright-core");

const root = resolve(__dirname, "..");

function inlineStyles(filePath) {
  return readFileSync(filePath, "utf8").replace(
    /^@import "\.\/([^"]+)";$/gm,
    (_, imported) => inlineStyles(join(dirname(filePath), imported)),
  );
}

async function buildBundleHtml(entrySource, extraCssFiles = [], title = "Yogurt 0.2.0 Phase 2+3 Verification") {
  const js = await build({
    stdin: {
      contents: entrySource,
      resolveDir: root,
      loader: "tsx",
    },
    write: false,
    bundle: true,
    format: "iife",
    jsx: "automatic",
    target: "es2022",
    alias: {
      "@openboa/yogurt": join(root, "packages/web/src/index.ts"),
    },
    define: { "process.env.NODE_ENV": '"production"' },
  });

  const css = [join(root, "design/styles/ui.css"), ...extraCssFiles]
    .map(inlineStyles)
    .join("\n")
    .replace(
      /url\("\.\.\/(assets\/fonts\/[^"]+)"\)/g,
      (_, p) =>
        'url("data:font/woff2;base64,' +
        readFileSync(join(root, "design", p)).toString("base64") +
        '")',
    );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script>
</body>
</html>`;
}

const recipesHarnessSource = `
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Yogurt,
  Stack,
  Inline,
  Heading,
  Text,
  Badge,
  Button,
  Card,
  Popover,
  Toggle,
  ToggleGroup,
  Slider,
  SelectionList,
  Progress,
  DataTable,
  Avatar,
  ActionMenu,
  SidebarLayout,
  SidebarContent,
  SidebarItem,
  IconButton,
  Notice,
  Toast,
} from "@openboa/yogurt";
import { ProjectAccess, type ProjectRole } from "./packages/recipes/project-access/web.tsx";
import { ProjectSettings, type Preferences } from "./packages/recipes/project-settings/web.tsx";
import { AgentProfile, type AgentProfileDraft } from "./packages/recipes/agent-profile/web.tsx";
import { OperationsLibrary } from "./packages/recipes/operations-library/web.tsx";
import { AttentionInbox, type AttentionItem } from "./packages/recipes/attention-inbox/web.tsx";
import { ConversationPanel, type ThreadMessage } from "./packages/recipes/conversation-panel/web.tsx";
import { DecisionReview } from "./packages/recipes/decision-review/web.tsx";
import { CollectionBrowser } from "./packages/recipes/collection-browser/web.tsx";
import { RunInspector, type RunRecord } from "./packages/recipes/run-inspector/web.tsx";
import { AgentWorkspace } from "./packages/recipes/agent-workspace/web.tsx";

function RecipesAuditApp() {
  const params = new URLSearchParams(location.search);
  const appearance = params.get("appearance") === "dark" ? "dark" : "light";

  // Phase 2 controls state
  const [popOpen, setPopOpen] = useState(false);
  const [toggleOn, setToggleOn] = useState(false);
  const [toggleGroup, setToggleGroup] = useState(["daily"]);
  const [sliderVal, setSliderVal] = useState(64);
  const [selItems, setSelItems] = useState(["read"]);
  const [toastOpen, setToastOpen] = useState(true);

  // ProjectAccess state
  const [revision, setRevision] = useState(1);
  const [members, setMembers] = useState<{ id: string; name: string; detail?: string; role: "owner" | ProjectRole }[]>([
    { id: "usr_maya", name: "Maya Chen", detail: "maya@openboa.ai", role: "owner" },
    { id: "usr_devon", name: "Devon Park", detail: "devon@openboa.ai", role: "edit" },
    { id: "usr_jules", name: "Jules Reed", detail: "jules@openboa.ai", role: "view" },
  ]);

  // ProjectSettings state
  const initialPrefs: Preferences = { notify: true, digest: "weekly" };
  const [prefsDraft, setPrefsDraft] = useState<Preferences>({ notify: true, digest: "daily" });
  const [prefsSaved, setPrefsSaved] = useState<Preferences>(initialPrefs);

  // AgentProfile state
  const initialProfile: AgentProfileDraft = {
    name: "Kai",
    appearance: "Kai",
    scopeId: "sourdough",
    instructions: "Ground all review summaries in observed project records.",
  };
  const [profileDraft, setProfileDraft] = useState<AgentProfileDraft>({
    ...initialProfile,
    instructions: "Ground all review summaries in observed project records and flag missing timestamps.",
  });
  const [profileSaved, setProfileSaved] = useState<AgentProfileDraft>(initialProfile);

  // ConversationPanel state
  const [messages, setMessages] = useState<ThreadMessage[]>([
    { id: "m1", speaker: "Kai", body: "Three observations are verified. One reading is missing a timestamp.", time: "09:14" },
    { id: "m2", speaker: "You", body: "Hold that reading until the source confirms it.", time: "09:15" },
  ]);
  const [draft, setDraft] = useState("");

  // AttentionInbox state
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([
    {
      id: "att1",
      kind: "review",
      title: "Approve quarterly operating brief",
      detail: "Ready for final sign-off before sharing.",
      time: "10m ago",
      state: "waiting",
      unread: true,
      attention: true,
      review: {
        revision: "r4",
        consequence: "Publishes the brief to all workspace members.",
        confirmLabel: "Approve brief",
        available: true,
      },
    },
    {
      id: "att2",
      kind: "routine",
      title: "Morning source check finished",
      detail: "All 4 feeds synchronized without warnings.",
      time: "1h ago",
      state: "ready",
      unread: false,
      attention: false,
    },
  ]);

  // RunInspector state
  const runs: RunRecord[] = [
    {
      id: "run_1",
      title: "Morning source review",
      time: "Today · 09:00",
      state: "complete",
      summary: "Checked 4 sources and drafted summary.",
      steps: [
        { id: "s1", title: "Fetch register entries", state: "complete", detail: "Loaded 4 source records." },
        { id: "s2", title: "Verify timestamps", state: "complete", detail: "3 of 4 confirmed with signed dates." },
      ],
    },
    {
      id: "run_2",
      title: "Connector health probe",
      time: "Yesterday · 18:30",
      state: "failed",
      summary: "Timed out waiting for secondary feed.",
      steps: [{ id: "s3", title: "Ping feed", state: "failed", detail: "Timeout after 10s." }],
      canRetry: true,
    },
  ];
  const [selectedRun, setSelectedRun] = useState("run_1");

  // AgentWorkspace state
  const [activeAgent, setActiveAgent] = useState("kai");
  const [wsDraft, setWsDraft] = useState("");
  const [wsMessages, setWsMessages] = useState<ThreadMessage[]>([
    { id: "wm1", speaker: "Kai", body: "Morning brief is ready for review.", time: "09:12" },
  ]);

  return (
    <Yogurt appearance={appearance} className="p3-root">
      <div className="p3-page">
        <header className="p3-header">
          <Stack gap={4}>
            <Heading level={1}>Yogurt 0.2.0 · Phase 2 Controls &amp; Phase 3 Recipes ({appearance === "dark" ? "Dark" : "Light"})</Heading>
            <Text variant="help">Unified Popover · Bordered Toggle · Warm Ink Slider &amp; Progress · DataTable · Rebuilt Core Recipes</Text>
          </Stack>
          <Inline gap={8}>
            <Badge tone="brand">0.2.0-local.1</Badge>
            <Badge tone="neutral" variant="outline">{appearance === "dark" ? "Dark Mode" : "Light Mode"}</Badge>
          </Inline>
        </header>

        <section className="p3-grid">
          <div id="probe-project-access">
            <ProjectAccess
              project={{ id: "sourdough", name: "Sourdough" }}
              revision={String(revision)}
              members={members}
              onInvite={(_pid, email, role) => {
                setMembers((all) => [...all, { id: email, name: email.split("@")[0] || email, detail: email, role }]);
                setRevision((v) => v + 1);
              }}
              onChangeRole={(_pid, id, role) => {
                setMembers((all) => all.map((m) => (m.id === id ? { ...m, role } : m)));
                setRevision((v) => v + 1);
              }}
              onRemove={(_pid, id) => {
                setMembers((all) => all.filter((m) => m.id !== id));
                setRevision((v) => v + 1);
              }}
            />
          </div>

          <div id="probe-phase2-controls">
            <Card title="Phase 2 Core Controls" description="Unified Popover, bordered Toggle, Warm Ink Slider & Progress, SelectionList select-all, DataTable.">
              <Stack gap={14}>
                <Inline gap={8} align="center">
                  <Popover label="Quick details">
                    <Stack gap={6}>
                      <Text>Backward-compatible Popover content.</Text>
                      <Button size="compact" emphasis="soft">Action</Button>
                    </Stack>
                  </Popover>
                  <Popover
                    label="Controlled filters"
                    open={popOpen}
                    onOpenChange={setPopOpen}
                    side="bottom"
                    align="end"
                    trigger={<Button id="pop-custom-trigger" emphasis="soft">Controlled Popover</Button>}
                  >
                    <Stack gap={6}>
                      <Text>Controlled popover with custom trigger.</Text>
                      <Button id="pop-close-btn" size="compact" emphasis="quiet" onClick={() => setPopOpen(false)}>Done</Button>
                    </Stack>
                  </Popover>
                  <Toggle pressed={toggleOn} onPressedChange={setToggleOn}>Archived</Toggle>
                  <ToggleGroup
                    label="Cadence"
                    items={[{ id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }]}
                    value={toggleGroup}
                    onValueChange={setToggleGroup}
                  />
                </Inline>
                <Slider label="Review confidence" value={sliderVal} onValueChange={setSliderVal} unit="%" />
                <Progress label="Source verification" value={72} />
                <SelectionList
                  label="Permissions"
                  selectAllLabel="Select all scopes"
                  options={[
                    { id: "read", label: "Read files" },
                    { id: "write", label: "Edit drafts" },
                    { id: "publish", label: "Publish briefs" },
                  ]}
                  selected={selItems}
                  onValueChange={setSelItems}
                />
                <DataTable
                  caption="Access matrix (DataTable)"
                  columns={[
                    { id: "member", label: "Member", kind: "identity" },
                    { id: "role", label: "Role", kind: "role" },
                    { id: "runs", label: "Runs", kind: "numeric" },
                    { id: "actions", label: "Actions", kind: "actions" },
                  ]}
                  rows={[
                    { id: "m1", cells: { member: <Inline gap={6} wrap={false}><Avatar label="Maya Chen" size={24} /><Text>Maya Chen</Text></Inline>, role: <Badge tone="neutral">Owner</Badge>, runs: 14, actions: <Text variant="meta">—</Text> } },
                    { id: "m2", cells: { member: <Inline gap={6} wrap={false}><Avatar label="Devon Park" size={24} /><Text>Devon Park</Text></Inline>, role: <Badge tone="neutral" variant="outline">Can edit</Badge>, runs: 8, actions: <ActionMenu label="Devon table actions" triggerVariant="more" triggerSize="compact" items={[{ id: "copy", label: "Copy member ID" }, { id: "remove", label: "Remove", tone: "danger", separatorBefore: true }]} onSelect={() => {}} /> } },
                  ]}
                />
                <Notice title="Warm Neutral verified" tone="brand">All controls share the unified Ink Blue focus ring.</Notice>
                {toastOpen && <Toast message="Changes synced to workspace." onDismiss={() => setToastOpen(false)} />}
              </Stack>
            </Card>
          </div>

          <div id="probe-project-settings">
            <ProjectSettings
              draft={prefsDraft}
              saved={prefsSaved}
              onChange={setPrefsDraft}
              onSave={setPrefsSaved}
            />
          </div>

          <div id="probe-agent-profile">
            <AgentProfile
              agentId="kai"
              draft={profileDraft}
              saved={profileSaved}
              scopes={[
                { id: "sourdough", label: "Sourdough workspace" },
                { id: "private", label: "Private desk" },
              ]}
              onChange={setProfileDraft}
              onSave={(_id, next) => setProfileSaved(next)}
            />
          </div>

          <div id="probe-operations">
            <OperationsLibrary
              routines={[
                { id: "r1", title: "Morning brief", cadence: "Weekdays · 09:00", state: "scheduled", nextRun: "Tomorrow 09:00" },
                { id: "r2", title: "Feed audit", cadence: "Hourly", state: "failed", lastRun: "12m ago" },
              ]}
              skills={[
                { id: "sk1", title: "Verify citations", detail: "Checks source dates before publish.", state: "ready" },
              ]}
              connections={[
                { id: "c1", title: "Research register", detail: "Read-only feed.", state: "connected" },
              ]}
              onInspect={() => {}}
              onEditRoutine={() => {}}
              onRunRoutine={() => {}}
            />
          </div>

          <div id="probe-attention">
            <AttentionInbox
              items={attentionItems}
              onMarkRead={(id) => setAttentionItems((list) => list.map((i) => (i.id === id ? { ...i, unread: false } : i)))}
              onReview={() => {}}
            />
          </div>

          <div id="probe-conversation">
            <Card title="Conversation panel" description="Adopts Yogurt's elevated Composer with Ink Blue Send CTA.">
              <ConversationPanel
                messages={messages}
                revision={messages.length}
                draft={draft}
                onDraftChange={setDraft}
                onSend={(body) => {
                  setMessages((prev) => [...prev, { id: "m" + (prev.length + 1), speaker: "You", body, time: "Just now" }]);
                  setDraft("");
                }}
              />
            </Card>
          </div>

          <div id="probe-decision-collection">
            <Stack gap={16}>
              <div id="probe-decision">
                <DecisionReview
                  title="Weekly operating brief"
                  facts={[
                    { id: "project", label: "Project", value: "Sourdough" },
                    { id: "owner", label: "Owner", value: "Maya Chen" },
                    { id: "readings", label: "Verified readings", value: "3 of 4" },
                  ]}
                  observation={{ source: "Research register", asOf: "2026-11-23", timeLabel: "Nov 23" }}
                  decision={{
                    id: "rev-3",
                    revision: "3",
                    title: "Archive this brief?",
                    consequence: "Moves the brief out of active reviews.",
                    confirmLabel: "Archive review",
                    available: true,
                  }}
                  onConfirm={() => {}}
                />
              </div>
              <div id="probe-collection">
                <Card>
                  <CollectionBrowser
                    title="Project views"
                    records={[
                      { id: "rec-release-01", title: "Release review", detail: "Sourdough" },
                      { id: "rec-intake-02", title: "Project intake", detail: "Meatball" },
                      { id: "rec-oct-03", title: "October notes", detail: "Yogurt", archived: true },
                    ]}
                    selectedId="rec-release-01"
                    onOpen={() => {}}
                  />
                </Card>
              </div>
            </Stack>
          </div>

          <div id="probe-run-inspector">
            <RunInspector
              runs={runs}
              selectedId={selectedRun}
              onSelect={setSelectedRun}
              onRetry={() => {}}
              onCancel={() => {}}
            />
          </div>

          <div id="probe-sidebar-stops">
            <Card title="Sidebar separate focus stops">
              <div style={{ height: 180 }}>
                <SidebarLayout
                  label="Quick nav"
                  variant="flat"
                  width="13rem"
                  compactAt={260}
                  navigation={
                    <SidebarContent label="Items">
                      <SidebarItem
                        label="Sourdough"
                        href="#sourdough"
                        active
                        action={<IconButton size="compact" icon="more" label="Sourdough options" />}
                      />
                    </SidebarContent>
                  }
                >
                  <div style={{ padding: 12 }}><Text variant="help">Destination link and row action are sibling focus stops.</Text></div>
                </SidebarLayout>
              </div>
            </Card>
          </div>
        </section>

        <section id="probe-agent-workspace">
          <AgentWorkspace
            agents={[
              { id: "kai", name: "Kai", art: "Kai", state: "waiting", role: "Research reviewer", preview: "Morning brief is ready for review.", time: "09:12", pinned: true, unread: true },
              { id: "sol", name: "Sol", art: "Sol", state: "ready", role: "Operations planner", preview: "All routines scheduled.", time: "08:40", group: "Operations" },
            ]}
            currentId={activeAgent}
            onSelectAgent={setActiveAgent}
            renderConversation={() => (
              <ConversationPanel
                messages={wsMessages}
                revision={wsMessages.length}
                draft={wsDraft}
                onDraftChange={setWsDraft}
                onSend={(body) => {
                  setWsMessages((prev) => [...prev, { id: "wm" + (prev.length + 1), speaker: "You", body, time: "Just now" }]);
                  setWsDraft("");
                }}
              />
            )}
            renderRuntime={() => <Text variant="help">Simulated computer runtime.</Text>}
          />
        </section>
      </div>
    </Yogurt>
  );
}

createRoot(document.getElementById("root")).render(<RecipesAuditApp />);
`;

const recipesPageCss = `
html, body { margin: 0; padding: 0; }
.p3-root { min-height: 100vh; }
.p3-page { max-width: 1380px; margin: 0 auto; padding: 24px 28px 48px; display: grid; gap: 20px; }
.p3-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--yg-border-subtle); }
.p3-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }
@media (max-width: 900px) { .p3-grid { grid-template-columns: minmax(0, 1fr); } }
`;

const studioHarnessSource = `
import React from "react";
import { createRoot } from "react-dom/client";
import { StudioWorkspace } from "./apps/guide/examples/studio/workspace.tsx";

function StudioAuditApp() {
  const params = new URLSearchParams(location.search);
  const appearance = params.get("appearance") === "dark" ? "dark" : "light";
  return (
    <div style={{ padding: "16px 20px", minHeight: "100vh", background: appearance === "dark" ? "#161513" : "#FAF9F7" }}>
      <StudioWorkspace appearance={appearance} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<StudioAuditApp />);
`;

(async () => {
  const recipesHtml = (await buildBundleHtml(recipesHarnessSource, [], "Yogurt 0.2.0 Phase 2+3 Recipes Audit"))
    .replace("</style>", `\n${recipesPageCss}\n</style>`);
  const studioHtml = await buildBundleHtml(
    studioHarnessSource,
    [join(root, "apps/guide/vite/studio.css")],
    "Yogurt 0.2.0 Sourdough Studio Audit",
  );

  const auditDir = process.env.YOGURT_AUDIT_DIR;
  const browser = await chromium.launch({
    channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome",
  });

  try {
    // 1. Verify Recipes & Phase 2 controls across Light & Dark (1440px) + 390px narrow
    for (const appearance of ["light", "dark"]) {
      const context = await browser.newContext({
        colorScheme: appearance,
        viewport: { width: 1440, height: 1100 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: recipesHtml }),
      );
      await page.goto(`http://yogurt.local/recipes?appearance=${appearance}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector("#probe-project-access .yg-card");

      // Capture clean resting screenshot BEFORE mutating state via interactive tests
      if (auditDir) {
        await page.screenshot({
          path: join(auditDir, `p3-recipes-${appearance}.png`),
          fullPage: true,
        });
      }

      // Check A: ProjectAccess invite & member row height + right-edge alignment + Owner inline badge
      const accessMetrics = await page.evaluate(() => {
        const root = document.querySelector("#probe-project-access");
        const inviteBtn = root.querySelector('.yg-access-invite button[type="submit"]');
        const inviteSelect = root.querySelector(".yg-access-invite .yg-select-trigger");
        const memberRow = root.querySelector(".yg-access-list .yg-access-member-controls");
        const memberSelect = memberRow.querySelector(".yg-select-trigger");
        const moreBtn = memberRow.querySelector(".yg-menu-more-trigger");
        const ownerInlineBadge = root.querySelector(".yg-row-inline-meta .yg-badge");
        return {
          inviteBtnH: inviteBtn.getBoundingClientRect().height,
          inviteSelectH: inviteSelect.getBoundingClientRect().height,
          inviteSelectW: inviteSelect.getBoundingClientRect().width,
          memberSelectH: memberSelect.getBoundingClientRect().height,
          memberSelectW: memberSelect.getBoundingClientRect().width,
          moreBtnH: moreBtn.getBoundingClientRect().height,
          inviteRight: inviteBtn.getBoundingClientRect().right,
          memberRight: moreBtn.getBoundingClientRect().right,
          ownerBadgeText: ownerInlineBadge?.textContent?.trim(),
          inviteTone: inviteBtn.getAttribute("data-tone"),
        };
      });
      assert.equal(accessMetrics.ownerBadgeText, "Owner", "Maya Chen must have inline Owner badge");
      assert.equal(accessMetrics.inviteTone, "brand", "Invite button must use tone=brand");
      assert(Math.abs(accessMetrics.inviteBtnH - 32) <= 1.5 && Math.abs(accessMetrics.inviteSelectH - 32) <= 1.5, `Invite bar height must be 32px: ${JSON.stringify(accessMetrics)}`);
      assert(Math.abs(accessMetrics.memberSelectH - 28) <= 1.5 && Math.abs(accessMetrics.moreBtnH - 28) <= 1.5, `Member controls must be 28px compact: ${JSON.stringify(accessMetrics)}`);
      assert(Math.abs(accessMetrics.inviteSelectW - accessMetrics.memberSelectW) <= 1.5, `Role select width mismatch: ${JSON.stringify(accessMetrics)}`);
      assert(Math.abs(accessMetrics.memberSelectH - accessMetrics.moreBtnH) <= 1.5, `Member control height mismatch: ${JSON.stringify(accessMetrics)}`);
      assert(Math.abs(accessMetrics.inviteRight - accessMetrics.memberRight) <= 2, `Right edge misaligned: ${JSON.stringify(accessMetrics)}`);

      // Check B: ProjectAccess ActionMenu `...` removal flow (opens ConfirmDialog and removes Devon Park)
      await page.locator('#probe-project-access button[aria-label="Actions for Devon Park"]').click();
      const accessMenu = page.locator(".yg-popup-menu[data-open]");
      await accessMenu.waitFor({ state: "visible" });
      await accessMenu.getByRole("menuitem", { name: "Remove" }).click();
      const confirmDlg = page.locator("dialog.yg-dialog[open]");
      await confirmDlg.waitFor({ state: "visible" });
      await confirmDlg.getByRole("button", { name: "Remove access" }).click();
      await page.waitForTimeout(80);
      const devonCount = await page.locator('#probe-project-access button[aria-label="Actions for Devon Park"]').count();
      assert.equal(devonCount, 0, "Devon Park must be removed after ConfirmDialog confirmation");

      // Check C: Unified Popover API (backward-compat & controlled custom trigger)
      const compatPopBtn = page.getByRole("button", { name: "Quick details" });
      await compatPopBtn.click();
      await page.locator('.yg-popover[data-open]').waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.locator("#pop-custom-trigger").click();
      await page.locator("#pop-close-btn").waitFor({ state: "visible" });
      await page.locator("#pop-close-btn").click();
      assert.equal(await page.locator('.yg-popover[data-open]').count(), 0, "Controlled Popover must close");

      // Check D: Toggle resting visible border + surface, SelectionList select-all indeterminate, Slider focus ring
      const controlChecks = await page.evaluate(() => {
        const toggle = document.querySelector("#probe-phase2-controls .yg-toggle");
        const tcs = getComputedStyle(toggle);
        const selAll = document.querySelector('#probe-phase2-controls .yg-selection-list-all [role="checkbox"]');
        const composerTa = document.querySelector("#probe-conversation .yg-composer textarea");
        const composerSend = document.querySelector('#probe-conversation .yg-composer button[type="submit"]');
        const tableWrap = document.querySelector("#probe-phase2-controls .yg-table-scroll");
        return {
          toggleBorderStyle: tcs.borderTopStyle,
          toggleBorderWidth: tcs.borderTopWidth,
          toggleBg: tcs.backgroundColor,
          selAllChecked: selAll.getAttribute("aria-checked"),
          composerResize: getComputedStyle(composerTa).resize,
          composerSendTone: composerSend.getAttribute("data-tone"),
          tableBorderStyle: getComputedStyle(tableWrap).borderTopStyle,
          hasNumericCell: Boolean(document.querySelector('#probe-phase2-controls td[data-kind="numeric"][data-align="end"]')),
        };
      });
      assert.equal(controlChecks.toggleBorderStyle, "solid", "Toggle must have visible resting border");
      assert.notEqual(controlChecks.toggleBg, "rgba(0, 0, 0, 0)", "Toggle must have visible resting surface");
      assert.equal(controlChecks.selAllChecked, "mixed", "SelectionList master checkbox must start indeterminate");
      assert.equal(controlChecks.composerResize, "none", "Composer textarea must have resize: none");
      assert.equal(controlChecks.composerSendTone, "neutral", "Composer Send button must use monochrome tone=neutral");
      assert.equal(controlChecks.tableBorderStyle, "solid", "DataTable must have bordered card container");
      assert.equal(controlChecks.hasNumericCell, true, "DataTable must apply data-kind=numeric and data-align=end");

      // Check E: ProjectSettings & AgentProfile unified right-aligned footer [Discard (quiet)] [Save (filled brand)]
      for (const probeId of ["probe-project-settings", "probe-agent-profile"]) {
        const footer = await page.evaluate((id) => {
          const btns = [...document.querySelectorAll(`#${id} .yg-card-footer button`)];
          return btns.map((b) => ({
            text: b.textContent.trim(),
            emphasis: b.getAttribute("data-emphasis"),
            tone: b.getAttribute("data-tone"),
            left: b.getBoundingClientRect().left,
          }));
        }, probeId);
        assert.equal(footer.length, 2, `${probeId} must have 2 footer buttons`);
        assert.equal(footer[0].text, "Discard");
        assert.equal(footer[0].emphasis, "quiet");
        assert.equal(footer[1].emphasis, "filled");
        assert.equal(footer[1].tone, "brand");
        assert(footer[0].left < footer[1].left, `${probeId} must place Discard before Save`);
      }

      // Check F: OperationsLibrary & AttentionInbox — framed Card, inline status badges, trailing actions strictly buttons, underline Tabs
      const opsCheck = await page.evaluate(() => {
        const opsBadgesInActions = document.querySelectorAll("#probe-operations .yg-operations-actions .yg-badge, #probe-attention .yg-operations-actions .yg-badge").length;
        const opsInlineBadges = document.querySelectorAll("#probe-operations .yg-operations-title-line .yg-badge").length;
        const attInlineBadges = document.querySelectorAll("#probe-attention .yg-operations-title-line .yg-badge").length;
        const opsTabsPres = document.querySelector("#probe-operations .yg-tabs").getAttribute("data-presentation");
        const attTabsPres = document.querySelector("#probe-attention .yg-tabs")?.getAttribute("data-presentation");
        const attFramed = Boolean(document.querySelector("#probe-attention .yg-card.yg-attention-inbox"));
        return { opsBadgesInActions, opsInlineBadges, attInlineBadges, opsTabsPres, attTabsPres, attFramed };
      });
      assert.equal(opsCheck.opsBadgesInActions, 0, "Status badges must never live inside trailing actions");
      assert(opsCheck.opsInlineBadges >= 2, "Routine status badges must sit inline beside titles");
      assert(opsCheck.attInlineBadges >= 2, "Attention status badges must sit inline beside titles");
      assert.equal(opsCheck.opsTabsPres, "underline", "OperationsLibrary must use underline Tabs");
      assert.equal(opsCheck.attTabsPres, "underline", "AttentionInbox must use underline Tabs");
      assert.equal(opsCheck.attFramed, true, "AttentionInbox must be framed in Card");

      // Check G: ConversationPanel sends via Composer
      await page.locator("#probe-conversation .yg-composer textarea").fill("Confirmed source timestamp.");
      await page.locator('#probe-conversation .yg-composer button[type="submit"]').click();
      await page.waitForTimeout(80);
      const convText = await page.locator("#probe-conversation .yg-transcript").innerText();
      assert(convText.includes("Confirmed source timestamp."), "ConversationPanel must send via Composer");

      // Check H: DecisionReview intrinsic right-aligned button (not 100%-stretched)
      const decCheck = await page.evaluate(() => {
        const card = document.querySelector("#probe-decision .yg-card");
        const btn = document.querySelector("#probe-decision .yg-card-footer button");
        return { cardW: card.getBoundingClientRect().width, btnW: btn.getBoundingClientRect().width };
      });
      assert(decCheck.btnW < decCheck.cardW * 0.5, `DecisionReview button stretched: ${JSON.stringify(decCheck)}`);

      // Check I: CollectionBrowser ID search
      await page.locator('#probe-collection input[type="search"]').fill("rec-intake-02");
      await page.waitForTimeout(50);
      const colRows = await page.locator("#probe-collection .yg-list .yg-row").allInnerTexts();
      assert.equal(colRows.length, 1, "CollectionBrowser ID search must match single item");
      assert(colRows[0].includes("Project intake"), `CollectionBrowser ID search mismatch: ${colRows}`);

      // Check J: RunInspector framed Card + ListRow current without injecting "Selected · " text + styled Trace steps
      const runCheck = await page.evaluate(() => {
        const text = document.querySelector("#probe-run-inspector").innerText;
        const currentCount = document.querySelectorAll('#probe-run-inspector .yg-row[aria-current="true"]').length;
        const cardCount = document.querySelectorAll("#probe-run-inspector .yg-card").length;
        const traceBadges = document.querySelectorAll("#probe-run-inspector .yg-trace summary .yg-badge").length;
        return { hasSelectedPrefix: text.includes("Selected ·"), currentCount, cardCount, traceBadges };
      });
      assert.equal(runCheck.hasSelectedPrefix, false, 'RunInspector must not inject "Selected · "');
      assert.equal(runCheck.currentCount, 1, "RunInspector must set aria-current=true on active ListRow");
      assert(runCheck.cardCount >= 2, "RunInspector must frame both Run history list and detail panel in Cards");
      assert(runCheck.traceBadges >= 2, "RunInspector Trace steps must render styled Badges");

      // Check K: Sidebar separate focus stops & AgentWorkspace frame + soft compact Computer button
      const wsCheck = await page.evaluate(() => {
        const nested = [...document.querySelectorAll("#probe-sidebar-stops button, #probe-sidebar-stops a")]
          .some((el) => el.parentElement.closest("button, a"));
        const ws = document.querySelector("#probe-agent-workspace .yg-agent-workspace");
        const compBtn = [...document.querySelectorAll("#probe-agent-workspace header button[aria-expanded]")]
          .find((b) => b.textContent.includes("Computer"));
        return {
          nested,
          wsBorder: getComputedStyle(ws).borderTopStyle,
          compEmphasis: compBtn?.getAttribute("data-emphasis"),
          compSize: compBtn?.getAttribute("data-control-size"),
        };
      });
      assert.equal(wsCheck.nested, false, "SidebarItem must keep link and action as separate focus stops");
      assert.equal(wsCheck.wsBorder, "solid", "AgentWorkspace must render as framed 2-pane surface");
      assert.equal(wsCheck.compEmphasis, "soft", "AgentWorkspace Computer button must be soft");
      assert.equal(wsCheck.compSize, "compact", "AgentWorkspace Computer button must be compact");

      assert.deepEqual(errors, [], `Console/page errors in recipes (${appearance}): ${errors.join("; ")}`);
      console.log(`Phase 2+3 Recipes (${appearance}) verified.`);
      await context.close();
    }

    // 2. Narrow 390px responsiveness check on Recipes (no horizontal overflow)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme: "light" });
      const page = await context.newPage();
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: recipesHtml }),
      );
      await page.goto("http://yogurt.local/recipes?appearance=light");
      await page.waitForSelector("#probe-project-access");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 2, `390px recipes viewport overflowed horizontally by ${overflow}px`);
      await context.close();
    }

    // 3. Verify Sourdough Studio (Light & Dark 1440px + 390px) & capture Studio screenshots
    for (const appearance of ["light", "dark"]) {
      const context = await browser.newContext({
        colorScheme: appearance,
        viewport: { width: 1440, height: 920 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: studioHtml }),
      );
      await page.goto(`http://yogurt.local/studio?appearance=${appearance}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector(".studio-demo .yg-composer");
      await page.waitForTimeout(250);

      // Verify framed shell, active bot card, monochrome circular Send CTA & compact toolbar buttons
      const studioMetrics = await page.evaluate(() => {
        const shell = document.querySelector(".studio-demo");
        const activeAgent = document.querySelector('.studio-bot-list .yg-agent-row[aria-current="true"]');
        const sendBtn = document.querySelector('.studio-thread .yg-composer button[type="submit"]');
        const toolbarBtns = [...document.querySelectorAll(".studio-toolbar button")].map((b) => Math.round(b.getBoundingClientRect().height));
        return {
          shellBorder: getComputedStyle(shell).borderTopStyle,
          activeBorder: getComputedStyle(activeAgent).borderTopStyle,
          sendTone: sendBtn.getAttribute("data-tone"),
          toolbarBtnHeights: toolbarBtns,
        };
      });
      assert.equal(studioMetrics.shellBorder, "solid", "Studio shell must be framed");
      assert.equal(studioMetrics.activeBorder, "solid", "Active Studio agent item must have hairline border");
      assert.equal(studioMetrics.sendTone, "neutral", "Studio Composer Send button must be monochrome tone=neutral");
      assert(studioMetrics.toolbarBtnHeights.every((h) => h <= 34), `Studio toolbar buttons must share compact height: ${JSON.stringify(studioMetrics.toolbarBtnHeights)}`);

      if (auditDir) {
        await page.screenshot({
          path: join(auditDir, `p3-studio-${appearance}.png`),
          fullPage: false,
        });
      }

      // Exercise Studio views: Tasks, Workflows, Schedule, Files, Usage, Customers, Extensions, Model providers, Settings, Help
      for (const label of ["Tasks", "Workflows", "Schedule", "Files", "Usage", "Customers", "Extensions", "Model providers", "Settings", "Help"]) {
        await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: label, exact: true }).click();
      }
      await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Customers", exact: true }).click();
      await page.waitForSelector('[data-view="customers"]:not([hidden]) .yg-table-scroll');
      await page.locator(".studio-demo > .yg-sidebar-layout > .yg-sidebar-panel").getByRole("button", { name: "Settings", exact: true }).click();
      await page.waitForSelector('[data-view="settings"]:not([hidden]) .yg-card-footer');
      await page.locator('[data-view="settings"]').getByRole("switch", { name: "Show agent steps" }).click();
      await page.locator('[data-view="settings"]').getByRole("button", { name: "Save preferences" }).click();
      await page.locator('[data-view="settings"]').getByText("Preferences saved.").waitFor({ state: "visible" });

      assert.deepEqual(errors, [], `Console/page errors in Studio (${appearance}): ${errors.join("; ")}`);
      console.log(`Sourdough Studio (${appearance}) verified.`);
      await context.close();
    }

    // 4. Studio 390px narrow check
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
      const page = await context.newPage();
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: studioHtml }),
      );
      await page.goto("http://yogurt.local/studio?appearance=light");
      await page.waitForSelector(".studio-demo");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 2, `390px Studio viewport overflowed horizontally by ${overflow}px`);
      await context.close();
    }

    // 5. Interactive coverage of remaining Phase 2 controls, ProjectWorkspace, ArtifactLibrary & reduced-motion 0s
    {
      const extraSource = `
        import React, { useState } from "react";
        import { createRoot } from "react-dom/client";
        import {
          Yogurt, Stack, Button, Breadcrumb, Combobox, ContextMenu, Dialog, Sheet,
          Tooltip, DisclosureRow, Progress, DataTable, Calendar, Text,
        } from "@openboa/yogurt";
        import { ProjectWorkspace } from "./packages/recipes/project-workspace/web.tsx";
        import { ArtifactLibrary } from "./packages/recipes/artifact-library/web.tsx";

        function ExtraSuite() {
          const [combo, setCombo] = useState("a");
          const [ctxAction, setCtxAction] = useState("");
          const [dlg, setDlg] = useState(false);
          const [sheet, setSheet] = useState(false);
          const [date, setDate] = useState("2026-11-23");
          const [projId, setProjId] = useState("p1");
          const [artId, setArtId] = useState("a1");
          const [pinned, setPinned] = useState(false);
          return (
            <Yogurt appearance="light">
              <Stack gap={16} id="extra-root">
                <Breadcrumb items={[{ id: "home", label: "Home", href: "#home" }, { id: "cur", label: "Project", href: "#cur" }]} />
                <Combobox label="Model" value={combo} onValueChange={setCombo} options={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]} />
                <Calendar label="Due date" value={date} onValueChange={setDate} />
                <ContextMenu label="Row menu" items={[{ id: "archive", label: "Archive" }]} onSelect={setCtxAction}>
                  <div id="extra-ctx">Target ({ctxAction})</div>
                </ContextMenu>
                <Button id="extra-dlg-btn" onClick={() => setDlg(true)}>Open Dialog</Button>
                <Dialog open={dlg} onOpenChange={setDlg} title="Extra Dialog"><Text>Body</Text></Dialog>
                <Button id="extra-sheet-btn" onClick={() => setSheet(true)}>Open Sheet</Button>
                <Sheet open={sheet} onOpenChange={setSheet} title="Extra Sheet"><Text>Body</Text></Sheet>
                <Tooltip label="Helpful tip">{(props) => <Button id="extra-tip-btn" {...props}>Tip</Button>}</Tooltip>
                <DisclosureRow label="More info"><Text>Hidden content</Text></DisclosureRow>
                <Progress label="Sync" value={60} />
                <Progress label="Scanning" />
                <DataTable
                  caption="Sortable runs"
                  columns={[
                    { id: "name", label: "Name", kind: "identity", sortValue: (r) => String(r.cells.name) },
                    { id: "count", label: "Count", kind: "numeric", sortValue: (r) => Number(r.cells.count) },
                  ]}
                  rows={[
                    { id: "1", cells: { name: "Beta", count: 2 } },
                    { id: "2", cells: { name: "Alpha", count: 9 } },
                  ]}
                />
                <ProjectWorkspace
                  projects={[{
                    id: "p1", title: "Sourdough", mark: "sourdough",
                    threads: [{ id: "t1", title: "Morning brief", unread: true, updatedAt: { dateTime: "2026-11-23", label: "09:00" } }],
                    sources: [{ id: "s1", title: "Brief.md", kind: "file", detail: "2 KB", pinned }],
                  }]}
                  projectId={projId}
                  onProjectChange={setProjId}
                  onPinSource={(_p, _s, next) => setPinned(next)}
                />
                <ArtifactLibrary
                  artifacts={[{ id: "a1", name: "Spec", kind: "page", detail: "Today", pinned }]}
                  selectedId={artId}
                  onOpen={setArtId}
                  onPinChange={(_id, next) => setPinned(next)}
                />
              </Stack>
            </Yogurt>
          );
        }
        createRoot(document.getElementById("root")).render(<ExtraSuite />);
      `;
      const extraHtml = await buildBundleHtml(extraSource, [], "Yogurt 0.2.0 Phase 2+3 Extra Coverage");
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: extraHtml }),
      );
      await page.goto("http://yogurt.local/extra");
      await page.waitForSelector("#extra-root");

      // Combobox keyboard select
      await page.locator(".yg-combobox-input").click();
      await page.locator(".yg-combobox-popup .yg-select-option", { hasText: "Beta" }).click();
      assert.equal(await page.locator(".yg-combobox-input").inputValue(), "Beta");

      // Calendar grid renders cleanly
      await page.locator(".yg-calendar").waitFor({ state: "visible" });

      // ContextMenu
      await page.locator("#extra-ctx").click({ button: "right" });
      await page.getByRole("menuitem", { name: "Archive" }).click();
      assert.equal(await page.locator("#extra-ctx").textContent(), "Target (archive)");

      // Dialog & Sheet
      await page.locator("#extra-dlg-btn").click();
      await page.locator("dialog.yg-dialog[open]").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.locator("#extra-sheet-btn").click();
      await page.locator("dialog.yg-dialog.yg-sheet[open]").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");

      // Tooltip, DisclosureRow, DataTable sort
      await page.locator("#extra-tip-btn").focus();
      await page.locator(".yg-tip[data-open]").waitFor({ state: "visible" });
      await page.locator(".yg-disclosure summary").click();
      assert.notEqual(await page.locator(".yg-disclosure").getAttribute("open"), null);
      await page.locator(".yg-table-sort", { hasText: "Name" }).click();
      assert.equal(await page.locator(".yg-table tbody tr td").first().textContent(), "Alpha");

      // ProjectWorkspace underline tabs + inline unread signal dot + ArtifactLibrary pin
      assert.equal(await page.locator(".yg-project-workspace .yg-tabs").getAttribute("data-presentation"), "underline");
      assert.equal(await page.locator('.yg-thread-row .yg-row-title-line .yg-signal-dot[aria-label="Unread"]').count(), 1);
      await page.locator(".yg-artifact-library .yg-resource-row button[aria-pressed]").click();
      assert.equal(await page.locator(".yg-artifact-library .yg-resource-row button[aria-pressed]").getAttribute("aria-pressed"), "true");

      // Reduced motion 0s check on animated Phase 2 controls
      const rm = await page.evaluate(() => ({
        progBar: getComputedStyle(document.querySelector(".yg-progress-track > span")).transitionDuration,
        progSweep: getComputedStyle(document.querySelector(".yg-progress progress:not([value]) + .yg-progress-track > span")).animationName,
        discIcon: getComputedStyle(document.querySelector(".yg-disclosure summary svg")).transitionDuration,
      }));
      assert.equal(rm.progBar, "0s", `Progress transition not reduced: ${JSON.stringify(rm)}`);
      assert.equal(rm.progSweep, "none", `Indeterminate progress animation not reduced: ${JSON.stringify(rm)}`);
      assert.equal(rm.discIcon, "0s", `Disclosure icon transition not reduced: ${JSON.stringify(rm)}`);
      assert.deepEqual(errors, [], `Console/page errors in extra coverage: ${errors.join("; ")}`);
      console.log("Phase 2+3 extra interactive & reduced-motion coverage verified.");
      await context.close();
    }

    console.log("All Phase 2+3 Playwright checks passed.");
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
