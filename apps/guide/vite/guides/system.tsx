import { useState, type CSSProperties } from "react";
import {
  Badge, Button, Checkbox, CodeBlock, CopyButton, Disclosure, Grid, GridList, Heading, Inline, RadioGroup,
  Link, Result, ScrollArea, SearchField, Select, Stack, Surface, Table, Text, Yogurt,
} from "@openboa/yogurt";
import tokens from "../../../../design/tokens/brand.json";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const chapters = [
  ["color", "Color"], ["type", "Typography"], ["dimensions", "Dimensions"],
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

function Palette() {
  const [{ family, step }, select] = useState({ family: "slate", step: "750" });
  const name = family + "." + step;
  const variable = "var(--boa-color-" + family + "-" + step + ")";
  return <Stack gap={16} id="palette">
    <Grid className="guide-palette-heading" gap={16}>
      <Text variant="help">{colorRows.length} families · {colorCount} colors</Text>
      <Select id="hue" label="Color family" value={family} options={colorFamilies} onChange={event => {
        const next = event.currentTarget.value;
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
        <Grid className="guide-color-row" gap={8} aria-hidden="true">
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
            onChange={event => setStatus(event.currentTarget.value)} />
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
  return <GuidePage title="Design system" detail="The colors, type and dimensions behind OpenBoa products. See how they come together in the live agent roster." chapters={chapters}>
    <GuideSection id="color" title="Color">
      <Text>Compare lightness across color families. Blank cells indicate an unused step. Each color keeps its value across themes.</Text>
      <Palette />
      <Text>Check foreground and background together. Use a readable status word, such as <Badge tone="success">Ready</Badge>, alongside the color.</Text>
      <Link href="/tokens/brand.json" download>Download tokens</Link>
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
      <Inline gap={16}><Link href="/components/top">Inspect PageHeader</Link><Link href="/docs/design-system-rules.md">Web and Native composition rules</Link></Inline>
    </GuideSection>
    <GuideSection id="controls" title="Controls">
      <Text>Keep the field label visible as someone types. Use Select for a short fixed list, Checkbox for an independent choice and Disclosure for details that can open in place.</Text>
      <Text>Name a button’s effect with a verb and an object. Pair status color with a visible word.</Text>
    </GuideSection>
    <GuideSection id="catalog" title="Component catalog">
      <Text>Begin with a familiar control. Compose around the task and document what happens when the data, available width or input changes.</Text>
      <Inline gap={16}><Link href="/components">Component library</Link><Link href="/templates">Compositions</Link><Link href="/playbook">Screen patterns</Link></Inline>
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
      <Inline gap={16}><Link href="/adoption#platforms">Web and Native setup</Link><Link href="/#files">Files and font license</Link></Inline>
    </GuideSection>
  </GuidePage>;
}
