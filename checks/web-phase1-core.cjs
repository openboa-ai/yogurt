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

async function buildAuditHtml() {
  const entrySource = `
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Yogurt,
  Text,
  Heading,
  Stack,
  Inline,
  Grid,
  Surface,
  Divider,
  Icon,
  Button,
  IconButton,
  ButtonGroup,
  Field,
  FieldGroup,
  FormRow,
  TextField,
  SearchField,
  Select,
  Switch,
  Checkbox,
  RadioGroup,
  InputOTP,
  Tabs,
  SegmentedControl,
  ActionMenu,
  Card,
  List,
  ListRow,
  Badge,
} from "./packages/web/src/index.ts";

const roles = [
  { id: "owner", label: "Owner" },
  { id: "editor", label: "Editor" },
  { id: "viewer", label: "Viewer" },
  { id: "guest", label: "Guest (locked)", disabled: true },
];

const sw = [
  { name: "Canvas", var: "--yg-canvas" },
  { name: "Surface", var: "--yg-surface" },
  { name: "Raised", var: "--yg-raised" },
  { name: "Field", var: "--yg-field" },
  { name: "Hover", var: "--yg-hover" },
  { name: "Warm Ink", var: "--yg-inverse" },
  { name: "Ink Blue", var: "--yg-action" },
  { name: "Ink Hover", var: "--yg-action-hover" },
  { name: "Border Ctrl", var: "--yg-border-control" },
  { name: "Focus Ring", var: "--yg-focus-ring" },
];

function AuditApp() {
  const params = new URLSearchParams(location.search);
  const appearance = params.get("appearance") === "dark" ? "dark" : "light";
  const material = params.get("material") || "neutral";
  const dir = params.get("dir") || "ltr";
  const [search, setSearch] = useState("quarterly");
  const [role, setRole] = useState("editor");
  const [inviteRole, setInviteRole] = useState("editor");
  const [memberRole, setMemberRole] = useState("editor");
  const [sw1, setSw1] = useState(true);
  const [sw2, setSw2] = useState(false);
  const [swInset, setSwInset] = useState(true);
  const [chk1, setChk1] = useState(true);
  const [chk2, setChk2] = useState(false);
  const [chkMixed, setChkMixed] = useState("indeterminate");
  const [radio, setRadio] = useState("warm");
  const [otp, setOtp] = useState("482");
  const [tab, setTab] = useState("overview");
  const [pillTab, setPillTab] = useState("all");
  const [seg, setSeg] = useState("grid");
  const [menuSel, setMenuSel] = useState("copy");
  const [rowStatus, setRowStatus] = useState("idle");

  return (
    <div dir={dir}>
    <Yogurt appearance={appearance} material={material} className="audit-root">
      <div className="audit-page">
        <header className="audit-header">
          <Stack gap={4}>
            <Heading level={1} className="audit-title">
              Yogurt 0.2.0 · Phase 1 Core 20 Audit ({appearance === "dark" ? "Dark" : "Light"})
            </Heading>
            <Text id="audit-subtitle" variant="help">
              Warm Neutral default · Warm Ink controls + scoped Ink Blue CTA &amp; focus ring · Soft-Precision geometry · 5-layer CSS @layer
            </Text>
          </Stack>
          <Inline gap={8}>
            <Badge tone="brand">0.2.0 Phase 1</Badge>
            <Badge tone="neutral" variant="outline">{appearance === "dark" ? "Dark Mode" : "Light Mode"}</Badge>
          </Inline>
        </header>

        <section className="audit-swatches">
          {sw.map((s) => (
            <div className="audit-swatch" key={s.name}>
              <span className="audit-chip" style={{ background: "var(" + s.var + ")" }} />
              <span className="yg-meta">{s.name}</span>
            </div>
          ))}
        </section>

        <div className="audit-grid">
          <Card title="Buttons & Stack Flex" description="Warm Ink monochrome, scoped Ink Blue CTA, crisp disabled hierarchy, intrinsic Stack sizing.">
            <Stack gap={12}>
              <Inline gap={8}>
                <Button id="btn-neutral" emphasis="filled" tone="neutral">Primary</Button>
                <Button id="btn-brand" emphasis="filled" tone="brand">Brand CTA</Button>
                <Button emphasis="filled" tone="danger">Delete</Button>
                <Button emphasis="soft">Secondary</Button>
                <Button emphasis="quiet">Cancel</Button>
              </Inline>
              <Inline gap={8}>
                <Button emphasis="soft" tone="brand">Brand soft</Button>
                <Button emphasis="quiet" tone="brand">Brand quiet</Button>
                <Button emphasis="soft" tone="danger">Danger soft</Button>
                <Button emphasis="quiet" tone="danger">Danger quiet</Button>
              </Inline>
              <Inline gap={8}>
                <Button id="btn-dis-filled" emphasis="filled" tone="brand" disabled>Disabled CTA</Button>
                <Button id="btn-dis-soft" emphasis="soft" disabled>Disabled Soft</Button>
                <Button id="btn-dis-quiet" emphasis="quiet" disabled>Disabled Quiet</Button>
                <Button emphasis="filled" pending pendingLabel="Saving">Save</Button>
              </Inline>
              <Inline gap={8} align="center">
                <Button size="compact">Compact 26</Button>
                <Button size="regular">Regular 30</Button>
                <Button size="comfortable">Comfort 36</Button>
                <Button size="touch" shape="pill">Touch 44</Button>
                <IconButton icon="more" label="More options" emphasis="soft" />
                <IconButton icon="plus" label="Add item" emphasis="quiet" />
              </Inline>
              <div id="stack-probe">
                <Stack gap={8}>
                  <Button id="stack-btn" emphasis="soft">Intrinsic inside Stack</Button>
                </Stack>
              </div>
            </Stack>
          </Card>

          <Card title="Fields, Inputs & Unified Select" description="WCAG 3:1 resting control borders, custom @ui-sdk/react Select, FormRow baseline alignment.">
            <form id="audit-form" onSubmit={(e) => e.preventDefault()}>
            <Stack gap={12}>
              <FormRow>
                <TextField id="fld-email" name="email" label="Email" placeholder="name@openboa.ai" defaultValue="maya@openboa.ai" />
                <Select id="sel-invite" name="inviteRole" label="Role" options={roles} value={inviteRole} onValueChange={setInviteRole} />
                <Button emphasis="filled" tone="brand">Invite</Button>
              </FormRow>
              <Inline gap={12} align="start">
                <div style={{ flex: "1 1 12rem" }}>
                  <SearchField label="Search" value={search} onValueChange={setSearch} placeholder="Filter workspace" />
                </div>
                <div style={{ flex: "1 1 10rem" }}>
                  <Select id="sel-main" name="workspaceRole" data-probe="unified-select" label="Workspace Role" options={roles} value={role} onValueChange={setRole} />
                </div>
              </Inline>
              <Inline gap={12} align="start">
                <div style={{ flex: "1 1 11rem" }}>
                  <TextField label="Error state" defaultValue="bad@" error="Enter a valid domain address." />
                </div>
                <div style={{ flex: "1 1 11rem" }}>
                  <TextField label="Disabled" defaultValue="Read-only value" disabled />
                </div>
              </Inline>
              <FieldGroup legend="Responsive Field Layout">
                <TextField label="Workspace ID" layout="responsive" defaultValue="ws_sourdough_01" help="Immutable identifier." />
              </FieldGroup>
            </Stack>
            </form>
          </Card>

          <Card title="Switch, Checkbox, Radio & InputOTP" description="Warm Ink active controls (no green switch), crisp resting borders, unified focus ring.">
            <Stack gap={12}>
              <Switch id="sw-on" label="Auto-approve paper runs" help="Warm Ink ON state" checked={sw1} onCheckedChange={setSw1} />
              <Switch id="sw-off" label="Require manual sign-off" checked={sw2} onCheckedChange={setSw2} />
              <Switch id="sw-inset" presentation="inset" label="Inset switch surface" help="Hover works cleanly" checked={swInset} onCheckedChange={setSwInset} />
              <Divider />
              <Inline gap={16}>
                <Checkbox id="chk-on" label="Checked" checked={chk1} onCheckedChange={(v) => setChk1(v === true)} />
                <Checkbox id="chk-off" label="Unchecked" checked={chk2} onCheckedChange={(v) => setChk2(v === true)} />
                <Checkbox id="chk-mixed" label="Mixed" checked={chkMixed} onCheckedChange={(v) => setChkMixed(v)} />
                <Checkbox label="Disabled" disabled checked={false} />
              </Inline>
              <RadioGroup
                label="Surface tone"
                value={radio}
                onValueChange={setRadio}
                options={[
                  { id: "warm", label: "Warm Neutral" },
                  { id: "paper", label: "Paper" },
                  { id: "locked", label: "Legacy", disabled: true },
                ]}
              />
              <Inline gap={16} align="end">
                <div id="otp-partial-wrap"><InputOTP label="Verification code" length={6} value={otp} onValueChange={setOtp} /></div>
                <div id="otp-verified-wrap"><InputOTP label="Confirmed" length={4} value="9204" onValueChange={() => {}} verified /></div>
              </Inline>
            </Stack>
          </Card>

          <Card title="Tabs, SegmentedControl & ActionMenu" description="Underline Tabs default, elevated SegmentedControl pill with zero fly-in, leading check rail ActionMenu.">
            <Stack gap={16}>
              <Tabs
                label="Workspace sections"
                value={tab}
                onValueChange={setTab}
                items={[
                  { id: "overview", label: "Overview", panel: <Text variant="help">Underline presentation is the default tab language.</Text> },
                  { id: "members", label: "Members", panel: <Text variant="help">Member roles and access policies.</Text> },
                  { id: "audit", label: "Audit log", panel: <Text variant="help">Immutable event trail.</Text> },
                ]}
              />
              <Inline gap={12} align="center" justify="between">
                <SegmentedControl
                  label="View mode"
                  value={seg}
                  onValueChange={setSeg}
                  options={[
                    { id: "list", label: "List" },
                    { id: "grid", label: "Grid" },
                    { id: "board", label: "Board" },
                  ]}
                />
                <Tabs
                  label="Filter pill"
                  presentation="pill"
                  value={pillTab}
                  onValueChange={setPillTab}
                  items={[
                    { id: "all", label: "All", panel: null },
                    { id: "active", label: "Active", panel: null },
                  ]}
                />
              </Inline>
              <Inline gap={12} align="center">
                <ActionMenu
                  label="Sort menu"
                  triggerText="View options"
                  selectionIndicator="leading"
                  onSelect={setMenuSel}
                  items={[
                    { id: "copy", label: "Compact density", checked: menuSel === "copy" },
                    { id: "comfort", label: "Comfortable density", checked: menuSel === "comfort" },
                    { id: "archive", label: "Remove workspace", tone: "danger", separatorBefore: true },
                  ]}
                />
                <ActionMenu
                  label="Row actions"
                  triggerVariant="more"
                  selectionIndicator="leading"
                  onSelect={setMenuSel}
                  items={[
                    { id: "copy", label: "Copy member ID", checked: menuSel === "copy" },
                    { id: "remove", label: "Remove member", tone: "danger", separatorBefore: true },
                  ]}
                />
                <Text variant="meta" id="menu-result">Selected: {menuSel}</Text>
              </Inline>
            </Stack>
          </Card>

          <Card
            title="Project access"
            description="Card + ListRow semantic slots (inlineMeta, actions) + right-aligned footer."
            headerAction={<Badge tone="brand">3 members</Badge>}
            action={
              <ButtonGroup label="Card actions" justify="end">
                <Button emphasis="quiet">Discard</Button>
                <Button emphasis="filled" tone="brand">Save changes</Button>
              </ButtonGroup>
            }
          >
            <List label="Members" divided>
              <ListRow
                title="Maya Chen"
                inlineMeta={<Badge tone="neutral">Owner</Badge>}
                description="maya@openboa.ai"
                value="Full control"
              />
              <ListRow
                title="Devon Park"
                description="devon@openboa.ai"
                onActivate={() => setRowStatus("activated")}
                actions={
                  <Inline gap={6} wrap={false}>
                    <Select label="Devon role" hiddenLabel size="compact" options={roles} value={memberRole} onValueChange={setMemberRole} />
                    <ActionMenu
                      label="Devon actions"
                      triggerVariant="more"
                      triggerSize="compact"
                      onSelect={(id) => setRowStatus(id)}
                      items={[
                        { id: "copy-id", label: "Copy member ID" },
                        { id: "remove", label: "Remove", tone: "danger", separatorBefore: true },
                      ]}
                    />
                  </Inline>
                }
              />
              <ListRow
                title="Sora Lim"
                inlineMeta={<Badge tone="success">Active</Badge>}
                description="sora@openboa.ai"
                value="Viewer"
              />
            </List>
            <span id="row-status" className="yg-sr-only">{rowStatus}</span>
          </Card>

          <Card title="Surfaces, Card Variants & Pure Badges" description="Working Surface density, Card outlined/subtle variants, zero-dependency Yogurt Badges.">
            <Stack gap={12}>
              <Grid gap={8}>
                <Surface id="surf-compact" density="compact" variant="surface"><Text variant="meta">Compact 12px</Text></Surface>
                <Surface id="surf-regular" density="regular" variant="raised"><Text variant="meta">Raised 16px</Text></Surface>
                <Surface id="surf-spacious" density="spacious" variant="outlined"><Text variant="meta">Outlined 20px</Text></Surface>
              </Grid>
              <Divider />
              <Stack gap={8}>
                <Inline gap={6}>
                  <Badge tone="neutral">Neutral</Badge>
                  <Badge tone="brand">Brand</Badge>
                  <Badge tone="success">Success</Badge>
                  <Badge tone="warning">Warning</Badge>
                  <Badge tone="danger">Danger</Badge>
                  <Badge tone="accent">Accent</Badge>
                </Inline>
                <Inline gap={6}>
                  <Badge tone="neutral" variant="outline">Neutral</Badge>
                  <Badge tone="brand" variant="outline">Brand</Badge>
                  <Badge tone="success" variant="outline">Success</Badge>
                  <Badge tone="warning" variant="outline">Warning</Badge>
                  <Badge tone="danger" variant="outline">Danger</Badge>
                  <Badge tone="accent" variant="outline">Accent</Badge>
                </Inline>
              </Stack>
              <Inline gap={8}>
                <Card variant="outlined" density="compact" title="Outlined card">
                  <Text variant="help">Crisp 3:1 edge on canvas.</Text>
                </Card>
                <Card variant="subtle" density="compact" title="Subtle card">
                  <Text variant="help">Recessed secondary container.</Text>
                </Card>
              </Inline>
            </Stack>
          </Card>
        </div>
      </div>
    </Yogurt>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<AuditApp />);
`;

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
    define: { "process.env.NODE_ENV": '"production"' },
  });

  const css = inlineStyles(join(root, "design/styles/ui.css")).replace(
    /url\("\.\.\/(assets\/fonts\/[^"]+)"\)/g,
    (_, p) =>
      'url("data:font/woff2;base64,' +
      readFileSync(join(root, "design", p)).toString("base64") +
      '")',
  );

  const pageCss = `
    html, body { margin: 0; padding: 0; }
    .audit-root { min-height: 100vh; }
    .audit-page { max-width: 1280px; margin: 0 auto; padding: 28px 32px 40px; display: grid; gap: 20px; }
    .audit-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--yg-border-subtle); }
    .audit-title { font-size: 1.5rem; line-height: 1.25; }
    .audit-swatches { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 8px; }
    .audit-swatch { display: grid; gap: 4px; }
    .audit-chip { display: block; height: 28px; border-radius: 7px; border: 1px solid var(--yg-border-subtle); }
    .audit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Yogurt 0.2.0 Phase 1 Audit</title>
<style>${css}\n${pageCss}</style>
</head>
<body>
<div id="root"></div>
<script>${js.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script>
</body>
</html>`;
}

(async () => {
  const html = await buildAuditHtml();
  const browser = await chromium.launch({
    channel: process.env.YOGURT_BROWSER_CHANNEL || "chrome",
  });
  const auditDir = process.env.YOGURT_AUDIT_DIR;
  try {
    for (const appearance of ["light", "dark"]) {
      const context = await browser.newContext({
        colorScheme: appearance,
        viewport: { width: 1360, height: 1100 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.route("http://yogurt.local/**", (route) => {
        route.fulfill({ status: 200, contentType: "text/html", body: html });
      });
      await page.goto(`http://yogurt.local/audit?appearance=${appearance}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector("#btn-brand");

      // 0. Every non-comment CSS stylesheet imported by ui.css is inside @layer
      const uiCssSrc = readFileSync(join(root, "design/styles/ui.css"), "utf8");
      for (const [, imported] of uiCssSrc.matchAll(/^@import "\.\/([^"]+)";$/gm)) {
        const body = readFileSync(join(root, "design/styles", imported), "utf8")
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .trim();
        if (body.length > 0) {
          assert(body.includes("@layer"), `Unlayered stylesheet imported by ui.css: ${imported}`);
        }
      }

      // 1. Warm Neutral surface: zero pure white #FFFFFF & Text variants render muted
      const surfaces = await page.evaluate(() => {
        const root = document.querySelector(".yg-root");
        const card = document.querySelector(".yg-card");
        const subtitle = document.querySelector("#audit-subtitle");
        const meta = document.querySelector("#menu-result");
        return {
          canvas: getComputedStyle(root).backgroundColor,
          card: getComputedStyle(card).backgroundColor,
          subtitleSize: getComputedStyle(subtitle).fontSize,
          subtitleColor: getComputedStyle(subtitle).color,
          metaSize: getComputedStyle(meta).fontSize,
          rootColor: getComputedStyle(root).color,
        };
      });
      if (appearance === "light") {
        assert.equal(surfaces.canvas, "rgb(255, 255, 255)", "Light canvas must be crisp #FFFFFF");
        assert.equal(surfaces.card, "rgb(255, 255, 255)", "Light raised card must be crisp #FFFFFF");
      } else {
        assert.notEqual(surfaces.canvas, "rgb(255, 255, 255)", "Dark canvas must not be pure #FFFFFF");
        assert.notEqual(surfaces.card, "rgb(255, 255, 255)", "Dark raised card must not be pure #FFFFFF");
      }
      assert.equal(surfaces.subtitleSize, "12px", "Text variant=help must render at 12px");
      assert.equal(surfaces.metaSize, "11px", "Text variant=meta must render at 11px");
      assert.notEqual(surfaces.subtitleColor, surfaces.rootColor, "Text variant=help must use muted ink");

      // 1b. Field layout="responsive" must switch to 2 columns in desktop container (>= 28rem)
      const desktopRespCols = await page.evaluate(() =>
        getComputedStyle(document.querySelector(".yg-field[data-layout=responsive]")).gridTemplateColumns,
      );
      assert.equal(
        desktopRespCols.split(" ").length,
        2,
        `Responsive field must be 2-column horizontal at desktop width: ${desktopRespCols}`,
      );

      // 2. .yg-stack is flex and does not stretch direct Buttons to 100%
      const stackMetrics = await page.evaluate(() => {
        const probe = document.querySelector("#stack-probe .yg-stack");
        const btn = document.querySelector("#stack-btn");
        return {
          display: getComputedStyle(probe).display,
          direction: getComputedStyle(probe).flexDirection,
          probeWidth: probe.getBoundingClientRect().width,
          btnWidth: btn.getBoundingClientRect().width,
        };
      });
      assert.equal(stackMetrics.display, "flex");
      assert.equal(stackMetrics.direction, "column");
      assert(
        stackMetrics.btnWidth < stackMetrics.probeWidth * 0.65,
        `Button stretched inside Stack: ${JSON.stringify(stackMetrics)}`,
      );

      // 3. Button disabled hierarchy & scale press transition
      const btnStates = await page.evaluate(() => {
        const filled = getComputedStyle(document.querySelector("#btn-dis-filled"));
        const soft = getComputedStyle(document.querySelector("#btn-dis-soft"));
        const quiet = getComputedStyle(document.querySelector("#btn-dis-quiet"));
        const active = getComputedStyle(document.querySelector("#btn-brand"));
        return {
          activeBg: active.backgroundColor,
          filledBg: filled.backgroundColor,
          filledOpacity: parseFloat(filled.opacity),
          softBg: soft.backgroundColor,
          softOpacity: parseFloat(soft.opacity),
          quietBg: quiet.backgroundColor,
          transition: active.transitionProperty,
        };
      });
      assert.equal(btnStates.quietBg, "rgba(0, 0, 0, 0)", "Disabled quiet button must stay transparent");
      assert.notEqual(btnStates.filledBg, btnStates.activeBg, "Disabled filled must step down to neutral disabled surface");
      assert.notEqual(btnStates.filledBg, btnStates.softBg, "Disabled filled and soft must remain visually distinct");
      assert.equal(btnStates.filledOpacity, 1, "Disabled filled uses opaque neutral surface without washed-out alpha");
      assert(btnStates.softOpacity < 0.6 && btnStates.softOpacity > 0.3, "Disabled soft retains reduced opacity");
      assert(btnStates.transition.includes("scale"), `Button transition missing scale: ${btnStates.transition}`);

      // 4. Switch: Warm Ink ON (no green) & inset hover works
      const swInfo = await page.evaluate(() => {
        const sw = document.querySelector("#sw-on");
        const bg = getComputedStyle(sw).backgroundColor;
        const inset = document.querySelector("#sw-inset").closest(".yg-switch");
        return { bg, insetRestBg: getComputedStyle(inset).backgroundColor };
      });
      assert.notEqual(swInfo.bg, "rgb(0, 111, 54)", "Switch ON must not be green");
      await page.locator("#sw-inset").locator("..").hover();
      await page.waitForFunction(
        (restBg) =>
          getComputedStyle(document.querySelector("#sw-inset").closest(".yg-switch"))
            .backgroundColor !== restBg,
        swInfo.insetRestBg,
      );
      const insetHoverBg = await page.evaluate(() =>
        getComputedStyle(document.querySelector("#sw-inset").closest(".yg-switch")).backgroundColor,
      );
      assert.notEqual(insetHoverBg, swInfo.insetRestBg, "Switch inset must change background on hover");

      // 5. Surface density actually works
      const pads = await page.evaluate(() => ({
        compact: parseFloat(getComputedStyle(document.querySelector("#surf-compact")).paddingTop),
        regular: parseFloat(getComputedStyle(document.querySelector("#surf-regular")).paddingTop),
        spacious: parseFloat(getComputedStyle(document.querySelector("#surf-spacious")).paddingTop),
      }));
      assert.equal(pads.compact, 12);
      assert.equal(pads.regular, 16);
      assert.equal(pads.spacious, 20);

      // 6. SegmentedControl mounts indicator directly on active option with zero fly-in
      const segMetrics = await page.evaluate(() => {
        const root = document.querySelector(".yg-segment");
        const active = root.querySelector('button[data-state="on"]');
        const marker = root.querySelector(".yg-selection-marker");
        return {
          dir: marker.getAttribute("data-activation-direction"),
          transition: getComputedStyle(marker).transitionProperty,
          m: marker.getBoundingClientRect(),
          a: active.getBoundingClientRect(),
        };
      });
      assert.equal(segMetrics.dir, "none");
      assert(
        Math.abs(segMetrics.m.x - segMetrics.a.x) < 2 &&
          Math.abs(segMetrics.m.width - segMetrics.a.width) < 2,
        `SegmentedControl indicator misaligned on mount: ${JSON.stringify(segMetrics)}`,
      );

      // 7. Tabs default to pill presentation
      const tabsPres = await page.evaluate(() =>
        document.querySelector(".yg-tabs").getAttribute("data-presentation"),
      );
      assert.equal(tabsPres, "pill");

      // 8. Pure Yogurt Badge (no @openai/apps-sdk-ui)
      const badgeCheck = await page.evaluate(() => {
        const badges = [...document.querySelectorAll(".yg-badge")];
        return {
          count: badges.length,
          allSpans: badges.every((b) => b.tagName === "SPAN"),
          hasSdkClass: badges.some((b) => b.className.includes("yg-sdk")),
        };
      });
      assert(badgeCheck.count >= 12);
      assert.equal(badgeCheck.allSpans, true);
      assert.equal(badgeCheck.hasSdkClass, false);

      // 9. ListRow interactive sibling focus stops (no button nested inside button)
      const nestedInteractive = await page.evaluate(() => {
        const buttons = [...document.querySelectorAll(".yg-list button")];
        return buttons.some((b) => b.parentElement.closest("button, a"));
      });
      assert.equal(nestedInteractive, false, "ListRow must never nest buttons inside buttons");

      // 10. Custom @ui-sdk/react Select (zero native <select>, FormData, prop forwarding, typeahead, popup)
      assert.equal(await page.locator("select").count(), 0, "Unified Select must not render native <select>");
      const selTrigger = page.locator("#sel-main");
      assert.equal(await selTrigger.getAttribute("data-probe"), "unified-select", "Select must forward trigger attributes");
      const initialFormRole = await page.evaluate(() => new FormData(document.getElementById("audit-form")).get("workspaceRole"));
      assert.equal(initialFormRole, "editor", "Unified Select must submit value via FormData");
      await selTrigger.focus();
      await page.keyboard.press("v");
      await page.waitForTimeout(80);
      assert.match(await selTrigger.innerText(), /Viewer/, "Select closed-trigger typeahead must select Viewer");
      await selTrigger.click();
      const popup = page.locator(".yg-select-popup[data-open]");
      await popup.waitFor({ state: "visible" });
      const popupBg = await popup.evaluate((el) => getComputedStyle(el).backgroundColor);
      assert.notEqual(popupBg, "rgba(0, 0, 0, 0)", "Select popup must have opaque themed background");
      await popup.getByRole("option", { name: "Editor" }).click();
      assert.match(await selTrigger.innerText(), /Editor/);

      // 11. ActionMenu with triggerVariant="more", leading check rail, valid WAI-ARIA roles
      const moreBtn = page.getByRole("button", { name: "Row actions" });
      await moreBtn.click();
      const openMenu = page.locator(".yg-popup-menu[data-open]");
      await openMenu.waitFor({ state: "visible" });
      assert(await openMenu.locator(".yg-menu-check-rail").count() >= 2);
      assert.equal(await openMenu.locator(".yg-menu-separator").count(), 1);
      assert.equal(await openMenu.locator('[data-tone="danger"]').count(), 1);
      const menuAria = await openMenu.evaluate((el) => ({
        checkboxItems: el.querySelectorAll('[role="menuitemcheckbox"][aria-checked]').length,
        invalidMenuItemChecked: el.querySelectorAll('[role="menuitem"][aria-checked]').length,
      }));
      assert.equal(menuAria.checkboxItems, 1, "Checkable ActionMenu item must use role=menuitemcheckbox");
      assert.equal(menuAria.invalidMenuItemChecked, 0, "Plain role=menuitem must never carry aria-checked");
      await page.keyboard.press("Escape");

      // 12. Unified :focus-visible ring across Core 20 interactive controls (including partial & verified InputOTP)
      const focusTargets = [
        "#btn-brand",
        "#sel-main",
        "#sw-on",
        "#chk-on",
        '.yg-tabs[data-presentation="pill"] [role="tab"][aria-selected="true"]',
        '.yg-segment button[data-state="on"]',
      ];
      for (const selector of focusTargets) {
        await page.keyboard.press("Tab");
        const style = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          el.focus({ focusVisible: true });
          const cs = getComputedStyle(el);
          return {
            matches: el.matches(":focus-visible"),
            outlineStyle: cs.outlineStyle,
            boxShadow: cs.boxShadow,
          };
        }, selector);
        assert.equal(style.outlineStyle, "none", `Unified focus ring must not double-outline on ${selector}: ${JSON.stringify(style)}`);
        assert(style.boxShadow && style.boxShadow !== "none", `Missing unified boxShadow focus ring on ${selector}: ${JSON.stringify(style)}`);
      }
      for (const wrapId of ["otp-partial-wrap", "otp-verified-wrap"]) {
        await page.keyboard.press("Tab");
        const otpStyle = await page.evaluate((id) => {
          const input = document.querySelector(`#${id} input`);
          input.focus({ focusVisible: true });
          const otp = input.closest(".yg-otp");
          const active = otp.querySelector("[data-active]");
          const slots = otp.querySelector(".yg-otp-slots");
          return {
            activeShadow: active ? getComputedStyle(active, "::before").boxShadow : "none",
            slotsShadow: getComputedStyle(slots).boxShadow,
          };
        }, wrapId);
        assert(
          (otpStyle.activeShadow && otpStyle.activeShadow !== "none") ||
            (otpStyle.slotsShadow && otpStyle.slotsShadow !== "none"),
          `InputOTP #${wrapId} missing visible focus ring: ${JSON.stringify(otpStyle)}`,
        );
      }

      // Clear any stray hover and focus Brand CTA visibly before capturing audit sheet
      await page.mouse.move(0, 0);
      await page.evaluate(() => {
        document.querySelector("#btn-brand").focus({ focusVisible: true });
      });
      await page.waitForTimeout(300);

      if (auditDir) {
        await page.screenshot({
          path: join(auditDir, `p1-core-${appearance}.png`),
          fullPage: true,
        });
      }

      assert.deepEqual(errors, [], `Console/page errors in ${appearance}: ${errors.join("; ")}`);
      console.log(`Phase 1 Core 20 (${appearance}) verified:`, surfaces);
      await context.close();
    }

    // 13. Reduced motion verification (all Core 20 animated controls resolve to 0s)
    {
      const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: html }),
      );
      await page.goto("http://yogurt.local/audit?appearance=light");
      await page.waitForSelector("#btn-brand");
      const durs = await page.evaluate(() =>
        [".yg-input", ".yg-select-trigger", ".yg-switch [role=switch]", ".yg-switch [role=switch] > span", ".yg-checkbox [role=checkbox]", "#btn-brand"].map((s) => ({
          s,
          dur: getComputedStyle(document.querySelector(s)).transitionDuration,
        })),
      );
      for (const { s, dur } of durs) {
        assert(dur.split(",").every((v) => parseFloat(v) === 0), `Reduced motion violated on ${s}: ${dur}`);
      }
      await context.close();
    }

    // 14. Narrow 320px @container reflow + RTL + paper/mist popup opacity
    {
      const context = await browser.newContext({ viewport: { width: 320, height: 900 }, colorScheme: "light" });
      const page = await context.newPage();
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: html }),
      );
      await page.goto("http://yogurt.local/audit?appearance=light");
      await page.waitForSelector(".yg-field[data-layout=responsive]");
      const respCols = await page.evaluate(() =>
        getComputedStyle(document.querySelector(".yg-field[data-layout=responsive]")).gridTemplateColumns,
      );
      assert.equal(respCols.split(" ").length, 1, `Responsive field must stack at 320px: ${respCols}`);
      await context.close();
    }
    {
      const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, colorScheme: "light" });
      const page = await context.newPage();
      await page.route("http://yogurt.local/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/html", body: html }),
      );
      await page.goto("http://yogurt.local/audit?appearance=light&dir=rtl");
      await page.waitForSelector("#sw-on");
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(50);
      const rtl = await page.evaluate(() => {
        const sw = document.querySelector("#sw-on");
        const swR = sw.getBoundingClientRect();
        const thR = sw.querySelector("span").getBoundingClientRect();
        const seg = document.querySelector(".yg-segment");
        const segOn = seg.querySelector('button[data-state="on"]').getBoundingClientRect();
        const segMk = seg.querySelector(".yg-selection-marker").getBoundingClientRect();
        const tabOn = document.querySelector('.yg-tabs [aria-selected="true"]').getBoundingClientRect();
        const tabMk = document.querySelector(".yg-tabs .yg-selection-marker").getBoundingClientRect();
        return {
          leftDist: thR.left - swR.left,
          rightDist: swR.right - thR.right,
          segDiffX: Math.abs(segMk.x - segOn.x),
          tabDiffX: Math.abs(tabMk.x - tabOn.x),
        };
      });
      assert(rtl.leftDist < rtl.rightDist, `RTL ON switch thumb must align to end/left: ${JSON.stringify(rtl)}`);
      assert(rtl.segDiffX < 2, `RTL SegmentedControl marker misaligned: ${JSON.stringify(rtl)}`);
      assert(rtl.tabDiffX < 2, `RTL Tabs marker misaligned: ${JSON.stringify(rtl)}`);
      await context.close();
    }
    for (const material of ["paper", "mist"]) {
      for (const appearance of ["light", "dark"]) {
        const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, colorScheme: appearance });
        const page = await context.newPage();
        await page.route("http://yogurt.local/**", (route) =>
          route.fulfill({ status: 200, contentType: "text/html", body: html }),
        );
        await page.goto(`http://yogurt.local/audit?appearance=${appearance}&material=${material}`);
        await page.click("#sel-main");
        const bg = await page.locator(".yg-select-popup[data-open]").evaluate((el) => getComputedStyle(el).backgroundColor);
        assert.notEqual(bg, "rgba(0, 0, 0, 0)", `Select popup transparent in ${material}/${appearance}`);
        await context.close();
      }
    }
    console.log("Phase 1 Core 20 edge cases (reduced-motion, 320px, RTL, paper/mist) verified.");
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
