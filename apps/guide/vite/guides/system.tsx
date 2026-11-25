import { useState, type CSSProperties } from "react";
import {
  Badge, Button, Checkbox, CodeBlock, CopyButton, Disclosure, Grid, GridList, Heading, Inline, RadioGroup,
  Link, Result, ScrollArea, SearchField, Select, SegmentedControl, Stack, Surface, Table, Text, Yogurt,
  type Material,
} from "@openboa/yogurt";
import tokens from "../../../../design/tokens/brand.json";
import uiTokens from "../../../../design/tokens/ui.json";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const chapters = [
  ["color", "Color"], ["semantic-roles", "Semantic roles"], ["type", "Typography"], ["dimensions", "Dimensions"],
  ["screen-composition", "Composition"], ["controls", "Controls"],
  ["catalog", "Catalog"], ["components", "Agent roster"], ["handoff", "Use in an app"],
] as const;

const roles = [
  ["Headline", "headline", "heading", "display"], ["Key metric", "value", "value", "value"],
  ["Title", "title", "heading", "heading"], ["Section", "section", "heading", "heading"],
  ["Subheading", "subheading", "heading", "heading"], ["Body", "body", "body", "body"],
  ["Editor", "editor", "body", "body"], ["Interface body", "interface", "body", "body"],
  ["Regular action", "ui", "ui", "label"], ["Interface label", "help", "ui", "label"],
  ["Supporting text", "help", "body", "body"], ["Caption", "caption", "caption", "meta"],
] as const;
const palette = tokens.color as Record<string, Record<string, string>>;
const colorFamilies = Object.keys(palette).map(id => ({ id, label: id.replaceAll("-", " ") }));
const shades = [...new Set(Object.values(palette).flatMap(colors => Object.keys(colors)))].sort((a, b) => Number(a) - Number(b));
const colorRows = colorFamilies.map(({ id: family, label }) => ({
  family,
  label,
  samples: Object.entries(palette[family]).map(([id, hex]) => ({
    id,
    label: id,
    accessibleLabel: family + " " + id + ", " + hex,
    column: shades.indexOf(id) + 1,
    color: "var(--boa-color-" + family + "-" + id + ")",
  })),
}));
const colorCount = colorRows.reduce((total, row) => total + row.samples.length, 0);

type RoleSpec = string | { readonly token: string; readonly alpha: number };
const uiRoles = uiTokens.roles as Record<string, readonly [RoleSpec, RoleSpec]>;
const uiMaterials = uiTokens.materials as Record<string, Record<string, readonly [RoleSpec, RoleSpec]>>;

function formatRoleRef(ref: RoleSpec): string {
  return typeof ref === "string" ? ref : `${ref.token} · ${Math.round(ref.alpha * 1000) / 10}%`;
}

function resolveTokenColor(ref: RoleSpec): string {
  if (typeof ref !== "string") {
    const hex = resolveTokenColor(ref.token);
    if (/^#[\da-f]{6}$/i.test(hex)) {
      const r = Number.parseInt(hex.slice(1, 3), 16);
      const g = Number.parseInt(hex.slice(3, 5), 16);
      const b = Number.parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${ref.alpha})`;
    }
    return hex;
  }
  const [family, step] = ref.split(".");
  return palette[family]?.[step] ?? ref;
}

const semanticRoleTiers = [
  {
    id: "tier-surfaces",
    title: "Tier 1 · Surface luminance ladder",
    caption: "Light and Dark surface bindings",
    description: "Flat tonal steps separate canvas, sidebars, cards, recessed fields and floating popovers without drop shadows or gradients.",
    roles: [
      { key: "canvas", label: "Canvas", token: "--yg-canvas", purpose: "Primary page and workspace background" },
      { key: "surface", label: "Surface", token: "--yg-surface", purpose: "Secondary rails, recessed tracks and sidebars" },
      { key: "raised", label: "Raised", token: "--yg-raised", purpose: "Static cards, tables and active panels" },
      { key: "elevated", label: "Elevated", token: "--yg-elevated", purpose: "Dialogs, sheets and floating modal planes" },
      { key: "field", label: "Field", token: "--yg-field", purpose: "Secondary buttons, subtle fills and dark inputs" },
      { key: "hover", label: "Hover", token: "--yg-hover", purpose: "Hovered rows and pressed soft fills" },
      { key: "popover", label: "Popover", token: "--yg-popover", purpose: "Transient menus, selects and popovers" },
    ],
  },
  {
    id: "tier-text-borders",
    title: "Tier 2 & 3 · 4-level text and border hierarchy",
    caption: "Light and Dark text and border bindings",
    description: "Four text levels and four border tiers separate hairline architecture from ≥ 3:1 interactive indicator and focus boundaries.",
    roles: [
      { key: "text", label: "Primary text", token: "--yg-text", purpose: "Headings, body copy and active labels (≥ 4.5:1)" },
      { key: "muted", label: "Secondary text", token: "--yg-muted", purpose: "Supporting labels, metadata and help copy (≥ 4.5:1)" },
      { key: "text-subtle", label: "Subtle text", token: "--yg-text-subtle", purpose: "Placeholders, micro-indices and quiet captions" },
      { key: "text-disabled", label: "Disabled text", token: "--yg-text-disabled", purpose: "Unavailable control labels" },
      { key: "border-subtle", label: "Border subtle", token: "--yg-border-subtle", purpose: "Hairline dividers and static card frames" },
      { key: "border-control", label: "Border control", token: "--yg-border-control", purpose: "Resting input, select and outlined control edges" },
      { key: "border-strong", label: "Border strong", token: "--yg-border-strong", purpose: "Hovered and emphasized control boundaries (≥ 3:1)" },
      { key: "border-indicator", label: "Border indicator", token: "--yg-border-indicator", purpose: "Checkbox and radio resting indicators (≥ 3:1)" },
      { key: "focus-ring", label: "Focus ring", token: "--yg-focus-ring", purpose: "Unified Ink Blue keyboard :focus-visible ring (≥ 3:1)" },
    ],
  },
  {
    id: "tier-brand",
    title: "Tier 4A · Monochrome ink, primary Ink Blue & secondary Terracotta",
    caption: "Monochrome ink, primary brand and secondary accent bindings",
    description: "Monochrome Ink drives ordinary controls; OpenBoa Ink Blue carries primary brand actions and focus; muted Warm Terracotta is strictly secondary.",
    roles: [
      { key: "inverse", label: "Monochrome Ink", token: "--yg-inverse", purpose: "Default buttons, switches, checkboxes and sliders" },
      { key: "action", label: "Primary Ink Blue (Fixed)", token: "--yg-action", purpose: "Logo-locked #175174 primary brand CTA fills in Light and Dark" },
      { key: "brand-ink", label: "Ink Blue Text & Icons", token: "--yg-brand-ink", purpose: "Adaptive readable Ink Blue for text, links, badges, icons and charts" },
      { key: "action-soft", label: "Ink Blue soft", token: "--yg-action-soft", purpose: "Tinted brand badges and selected accents" },
      { key: "accent", label: "Secondary Terracotta", token: "--yg-accent", purpose: "Secondary warm clay highlight (never primary CTA)" },
      { key: "accent-soft", label: "Terracotta soft", token: "--yg-accent-soft", purpose: "Warm secondary tint for subtle callouts" },
    ],
  },
  {
    id: "tier-signals",
    title: "Tier 4B · Operational status signals",
    caption: "Operational status signal bindings",
    description: "Operational semantics stay strictly separate from brand color so verification, warnings and destructive errors read unambiguously.",
    roles: [
      { key: "success", label: "Success", token: "--yg-success", purpose: "Verified readings, live runtime and confirmed state" },
      { key: "success-soft", label: "Success soft", token: "--yg-success-soft", purpose: "Soft positive badge and notice fill" },
      { key: "warning", label: "Warning", token: "--yg-warning", purpose: "Flagged gates and items needing attention" },
      { key: "warning-soft", label: "Warning soft", token: "--yg-warning-soft", purpose: "Soft caution badge and notice fill" },
      { key: "danger", label: "Danger", token: "--yg-danger", purpose: "Destructive actions and validation errors" },
      { key: "danger-soft", label: "Danger soft", token: "--yg-danger-soft", purpose: "Soft destructive button and alert fill" },
    ],
  },
] as const;

const materialCards: readonly { id: Material; label: string; note: string }[] = [
  { id: "neutral", label: "Neutral (default)", note: "Crisp alabaster light and deep carbon dark luminance ladder." },
  { id: "paper", label: "Paper", note: "Warm editorial paper tint for reading and documentation surfaces." },
  { id: "mist", label: "Mist", note: "Cool architectural mist tint for analytical and studio panels." },
];

function SemanticRoles() {
  const [materialAppearance, setMaterialAppearance] = useState<"light" | "dark">("light");
  const modeIndex = materialAppearance === "light" ? 0 : 1;
  return <Stack gap={24}>
    <Grid className="guide-tier-preview-grid" gap={12}>
      {(["light", "dark"] as const).map(mode => (
        <Yogurt key={mode} appearance={mode} className="guide-tier-preview-card">
          <Stack gap={10}>
            <Inline justify="between" align="center" gap={8}>
              <Text className="guide-tier-preview-title">{mode === "light" ? "Light · Alabaster" : "Dark · Carbon"}</Text>
              <Badge tone="brand">Ink Blue signal</Badge>
            </Inline>
            <div className="guide-tier-surface-strip">
              {(["canvas", "surface", "raised", "field", "hover"] as const).map(roleKey => (
                <div key={roleKey} className="guide-tier-chip-col">
                  <span className="guide-tier-chip-box" aria-hidden="true" style={{ backgroundColor: resolveTokenColor(uiRoles[roleKey][mode === "light" ? 0 : 1]) }} />
                  <Text variant="meta">{roleKey}</Text>
                </div>
              ))}
            </div>
            <Inline gap={6}>
              <Badge tone="brand">Primary brand</Badge>
              <Badge tone="accent">Terracotta</Badge>
              <Badge tone="success">Verified</Badge>
              <Badge tone="warning">Flagged</Badge>
              <Badge tone="danger">Error</Badge>
            </Inline>
          </Stack>
        </Yogurt>
      ))}
    </Grid>
    {semanticRoleTiers.map(tier => (
      <Stack key={tier.id} gap={8}>
        <Stack gap={2}>
          <Heading level={3}>{tier.title}</Heading>
          <Text variant="help">{tier.description}</Text>
        </Stack>
        <Table caption={tier.caption}>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Light</th>
              <th scope="col">Dark</th>
              <th scope="col">Usage</th>
            </tr>
          </thead>
          <tbody>
            {tier.roles.map(({ key, label, token, purpose }) => {
              const [lightRef, darkRef] = uiRoles[key];
              const lightHex = resolveTokenColor(lightRef);
              const darkHex = resolveTokenColor(darkRef);
              return <tr key={key}>
                <th scope="row">
                  <Stack gap={2}>
                    <Text>{label}</Text>
                    <span className="guide-role-token">{token}</span>
                  </Stack>
                </th>
                <td>
                  <span className="guide-role-swatch-cell">
                    <span className="guide-role-chip" aria-hidden="true" style={{ backgroundColor: lightHex }} />
                    <Stack gap={2}>
                      <Text variant="meta">{formatRoleRef(lightRef)}</Text>
                      <span className="guide-role-token">{lightHex}</span>
                    </Stack>
                  </span>
                </td>
                <td>
                  <span className="guide-role-swatch-cell">
                    <span className="guide-role-chip" aria-hidden="true" style={{ backgroundColor: darkHex }} />
                    <Stack gap={2}>
                      <Text variant="meta">{formatRoleRef(darkRef)}</Text>
                      <span className="guide-role-token">{darkHex}</span>
                    </Stack>
                  </span>
                </td>
                <td><Text variant="help">{purpose}</Text></td>
              </tr>;
            })}
          </tbody>
        </Table>
      </Stack>
    ))}
    <Stack gap={12}>
      <Inline justify="between" align="center" gap={12}>
        <Stack gap={4}>
          <Heading level={3}>Materials: Neutral, Paper and Mist</Heading>
          <Text variant="help">Every material overrides the complete surface, ink, inverse and border role set across Light and Dark appearances.</Text>
        </Stack>
        <SegmentedControl
          label="Material comparison appearance"
          value={materialAppearance}
          onValueChange={(next) => setMaterialAppearance(next as "light" | "dark")}
          options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }]}
        />
      </Inline>
      <Grid className="guide-material-grid" gap={16}>
        {materialCards.map(({ id, label, note }) => {
          const roleSource = id === "neutral" ? uiRoles : { ...uiRoles, ...uiMaterials[id] };
          return <Yogurt key={id} appearance={materialAppearance} material={id} className="guide-material-card">
            <Stack gap={12}>
              <Inline justify="between" align="center" gap={8}>
                <Heading level={4}>{label}</Heading>
                <Badge tone="neutral" variant="outline">{materialAppearance}</Badge>
              </Inline>
              <Text variant="help">{note}</Text>
              <div className="guide-material-surface">
                <Stack gap={8}>
                  <Text variant="meta">Surface · {formatRoleRef(roleSource.surface[modeIndex])}</Text>
                  <div className="guide-material-raised">
                    <Inline justify="between" align="center" gap={8}>
                      <Stack gap={2}>
                        <Text>Raised card</Text>
                        <Text variant="meta">{formatRoleRef(roleSource.raised[modeIndex])}</Text>
                      </Stack>
                      <Button size="compact" tone="brand">Action</Button>
                    </Inline>
                  </div>
                </Stack>
              </div>
              <div className="guide-material-swatches">
                {(["canvas", "surface", "raised", "field"] as const).map(roleKey => {
                  const ref = roleSource[roleKey][modeIndex];
                  const hex = resolveTokenColor(ref);
                  return <div key={roleKey} className="guide-material-swatch">
                    <span aria-hidden="true" style={{ backgroundColor: hex }} />
                    <Text variant="meta">{roleKey}</Text>
                  </div>;
                })}
              </div>
            </Stack>
          </Yogurt>;
        })}
      </Grid>
    </Stack>
  </Stack>;
}

function Palette() {
  const [{ family, step }, select] = useState({ family: "slate", step: "700" });
  const name = family + "." + step;
  const variable = "var(--boa-color-" + family + "-" + step + ")";
  return <Stack gap={16} id="palette">
    <Grid className="guide-palette-heading" gap={16}>
      <Text variant="help">{colorRows.length} families · {colorCount} colors</Text>
      <Select id="hue" label="Color family" value={family} options={colorFamilies} onValueChange={next => {
        select({ family: next, step: "500" in palette[next] ? "500" : Object.keys(palette[next])[0] });
      }} />
    </Grid>
    <Grid gap={16} className="guide-palette-selection">
      <Inline gap={12} aria-live="polite">
        <span className="guide-color-sample" aria-hidden="true" style={{ backgroundColor: variable }} />
        <Stack gap={2}>
          <Text id="color-name">{name}</Text>
          <Text id="color-hex" variant="help">{palette[family][step]}</Text>
        </Stack>
      </Inline>
      <CopyButton key={name} value={variable} />
    </Grid>
    <ScrollArea className="guide-color-scroll" label="Color matrix">
      <Stack className="guide-color-matrix" gap={4} style={{ "--guide-shades": shades.length } as CSSProperties}>
        <Grid className="guide-color-row guide-color-header" gap={8} aria-hidden="true">
          <Text className="guide-color-family" variant="meta">Family</Text>
          <Grid className="guide-color-steps" gap={2}>
            {shades.map(shade => <Text key={shade} variant="meta">{shade}</Text>)}
          </Grid>
        </Grid>
        {colorRows.map(row => <Grid className="guide-color-row" gap={8} key={row.family}>
          <Text className="guide-color-family" aria-hidden="true" variant="help">{row.label}</Text>
          <RadioGroup label={row.label + " shades"} presentation="swatches" columns={shades.length}
            value={row.family === family ? step : ""} options={row.samples}
            onValueChange={step => select({ family: row.family, step })} />
        </Grid>)}
      </Stack>
    </ScrollArea>
  </Stack>;
}

const agents = [
  { id: "014", name: "Kai", state: "Ready" }, { id: "021", name: "Sol", state: "Working" },
];
function Roster() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [dark, setDark] = useState(false);
  const results = agents.filter(agent => (status === "All" || agent.state === status) &&
    (agent.name + " " + agent.id).toLowerCase().includes(query.trim().toLowerCase()));
  function clear() {
    setQuery("");
    setStatus("All");
    document.getElementById("agent-search")?.focus();
  }
  return <Yogurt appearance={dark ? "dark" : "light"}>
    <Surface className="guide-panel" id="roster">
      <Stack gap={16}>
        <Inline gap={16}><Heading level={3}>Agent roster</Heading><Checkbox label="Dark surface" checked={dark} onCheckedChange={value => setDark(value === true)} /></Inline>
        <GuideGrid>
          <SearchField id="agent-search" label="Find an agent" placeholder="Name or ID" value={query} onValueChange={setQuery} />
          <Select id="agent-status" label="Status" value={status}
            options={["All", "Ready", "Working"].map(id => ({id, label: id}))}
            onValueChange={setStatus} />
        </GuideGrid>
        <Stack gap={4} id="agent-list">
          {results.map(agent => <Disclosure key={agent.id} label={agent.name + " · " + agent.state}>
            <Text>Agent ID {agent.id}</Text>
          </Disclosure>)}
          {!results.length && <Result title="No matching agents.">Try another name, ID or status.</Result>}
        </Stack>
        <Inline gap={12}>
          <Text role="status">{results.length} {results.length === 1 ? "agent" : "agents"}</Text>
          <Button emphasis="soft" disabled={!query && status === "All"} onClick={clear}>Clear filters</Button>
        </Inline>
      </Stack>
    </Surface>
  </Yogurt>;
}

export default function SystemGuide() {
  return <GuidePage title="Tokens" detail="The colors, type and dimensions behind OpenBoa products. See how they come together in the live agent roster." chapters={chapters}>
    <GuideSection id="color" title="Color">
      <Text>Compare lightness across all 21 color families on one unified 11-step scale (50–950). Each color keeps its value across themes.</Text>
      <Palette />
      <Text>Check foreground and background together. Use a readable status word, such as <Badge tone="success">Ready</Badge>, alongside the color.</Text>
      <Link href="/tokens/brand.json" download>Download tokens</Link>
    </GuideSection>
    <GuideSection id="semantic-roles" title="Semantic roles">
      <Text>Four semantic tiers separate flat tonal surfaces, text and hairline borders, OpenBoa Ink Blue primary brand plus Warm Terracotta secondary accents, and operational status signals across Light and Dark appearances.</Text>
      <SemanticRoles />
    </GuideSection>
    <GuideSection id="type" title="Typography">
      <Text>Choose the role first. A title introduces a page, body text explains it, and an interface label names an action or value.</Text>
      <Table caption="Rethink Sans type scale">
        <thead><tr><th scope="col">Role</th><th scope="col">Size and line height</th><th scope="col">Weight</th></tr></thead>
        <tbody>{roles.map(([name, size, role, tracking]) => {
          const weight = role === "caption" ? "var(--boa-weight-regular)" : "var(--boa-role-weight-" + role + ")";
          const themeStyle: CSSProperties = {fontSize: "var(--boa-size-" + size + ")",
            lineHeight: "var(--boa-line-height-" + size + ")", fontWeight: weight, letterSpacing: "var(--boa-tracking-" + tracking + ")"};
          return <tr key={name}><th scope="row"><Text style={themeStyle}>{name}</Text></th>
            <td>{tokens.type.size[size]} / {tokens.type.lineHeight[size]}</td>
            <td>{role === "caption" ? tokens.type.weight.regular : tokens.type.roleWeight[role]}</td></tr>;
        })}</tbody>
      </Table>
      <Text>Use tabular figures on comparable IDs, times and amounts. <Link href="/#logo">Choose a logo master</Link>.</Text>
    </GuideSection>
    <GuideSection id="dimensions" title="Dimensions">
      <Text>Use 4–6 px within a label group, 8–10 px between related controls and 24 px between groups.</Text>
      <GridList label="Spacing scale in pixels" minWidth={76} items={Object.keys(tokens.space).map(step => ({
        id: step,
        content: <Stack className="guide-spacing-sample" gap={8}>
          <span aria-hidden="true" style={{inlineSize: "var(--boa-space-" + step + ")"}} />
          <Text variant="meta">{step} px</Text>
        </Stack>,
      }))} />
      <Inline gap={16}><Link href="/components/button">Control sizes and corners</Link><Link href="/components/disclosure-row">Surface motion</Link></Inline>
    </GuideSection>
    <GuideSection id="screen-composition" title="Screen composition">
      <Text>Use PageHeader for the screen’s title and context. Align the title, body and actions to one reading edge.</Text>
      <Text>In an action group, put alternatives first and the single filled action last. Use links to open destinations and buttons to change state.</Text>
      <Inline gap={16}><Link href="/components/top">Inspect PageHeader</Link><Link href="/docs/design-system-rules.md">React composition rules</Link></Inline>
    </GuideSection>
    <GuideSection id="controls" title="Controls">
      <Text>Keep the field label visible as someone types. Use Select for a short fixed list, Checkbox for an independent choice and Disclosure for details that can open in place.</Text>
      <Text>Name a button’s effect with a verb and an object. Pair status color with a visible word.</Text>
    </GuideSection>
    <GuideSection id="catalog" title="Component catalog">
      <Text>Begin with a familiar control. Compose around the task and document what happens when the data, available width or input changes.</Text>
      <Inline gap={16}><Link href="/components">Component library</Link><Link href="/patterns">Patterns</Link></Inline>
    </GuideSection>
    <GuideSection id="components" title="Find an agent">
      <Text>Search narrows the list by name or ID. Status filters the same results. Open a row to reveal the agent’s ID.</Text>
      <Roster />
      <Disclosure label="Keyboard and recovery">
        <Text>Search for 014 and choose Working. Clear filters restores both agents and returns focus to the search field.</Text>
      </Disclosure>
    </GuideSection>
    <GuideSection id="handoff" title="Use in an app">
      <CodeBlock language="TSX" code={'import { Button } from "@openboa/yogurt";\n\n<Button>Save changes</Button>'} />
      <Inline gap={16}><Link href="/adoption#platforms">Browser and desktop setup</Link><Link href="/#files">Files and font license</Link></Inline>
    </GuideSection>
  </GuidePage>;
}
