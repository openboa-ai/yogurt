import { useState, type CSSProperties } from "react";
import {
  Badge, Button, Checkbox, CodeBlock, CopyButton, Disclosure, Grid, Heading, Inline,
  Link, Result, SearchField, Select, Stack, Surface, Table, Text, Yogurt,
} from "@openboa/yogurt";
import tokens from "../../../../design/tokens/brand.json";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const chapters = [
  ["screen-composition", "Composition"], ["type", "Type"], ["color", "Color"],
  ["dimensions", "Dimensions"], ["controls", "Controls"], ["catalog", "Catalog"],
  ["components", "Agent roster"], ["handoff", "Use in an app"],
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
const colorFamilies = Object.keys(palette).map(id => ({id, label: id.replaceAll("-", " ")}));

function Palette() {
  const [family, setFamily] = useState("slate");
  const [step, setStep] = useState("750");
  const colors = palette[family];
  const name = family + "." + step;
  const variable = "var(--boa-color-" + family + "-" + step + ")";
  return <Surface className="guide-panel" id="palette">
    <Stack gap={16}>
      <Select id="hue" label="Color family" value={family} options={colorFamilies} onChange={event => {
        const next = event.currentTarget.value;
        setFamily(next);
        setStep("500" in palette[next] ? "500" : Object.keys(palette[next])[0]);
      }} />
      <Grid className="guide-swatches" gap={8} id="swatches" role="group" aria-label="Color steps">
        {Object.entries(colors).map(([id, hex]) => <Button key={id} emphasis={id === step ? "soft" : "quiet"} size="touch"
          aria-label={family + " " + id + ", " + hex} aria-pressed={id === step} onClick={() => setStep(id)}>
          <span className="guide-swatch" style={{background: "var(--boa-color-" + family + "-" + id + ")"}} />{id}
        </Button>)}
      </Grid>
      <Inline gap={12}>
        <Text id="color-name">{name}</Text>
        <Text id="color-hex" variant="help">{colors[step]}</Text>
        <CopyButton key={name} value={variable} />
      </Inline>
    </Stack>
  </Surface>;
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
  const spacing = Object.keys(tokens.space).map(step => step + " px").join(" · ");
  return <GuidePage title="Design system" detail="Use these foundations to build a product screen. The agent roster shows how type, color and controls work together." chapters={chapters}>
    <GuideSection id="screen-composition" title="Screen composition">
      <Text>Use PageHeader for the screen’s title and context. Align the title, body and actions to one reading edge.</Text>
      <Text>In an action group, put alternatives first and the single filled action last. Use links to open destinations and buttons to change state.</Text>
      <Inline gap={16}><Link href="/components/top">Inspect PageHeader</Link><Link href="/docs/design-system-rules.md">Web and Native composition rules</Link></Inline>
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
    <GuideSection id="color" title="Color">
      <Text>Pick a hue and a lightness step from the shared palette. Each primitive keeps its value across themes.</Text>
      <Palette />
      <Text>Check foreground and background together. Use a readable status word, such as <Badge tone="success">Ready</Badge>, alongside the color.</Text>
      <Link href="/tokens/brand.json" download>Download tokens</Link>
    </GuideSection>
    <GuideSection id="dimensions" title="Dimensions">
      <Text>Use 4–6 px within a label group, 8–10 px between related controls and 24 px between groups.</Text>
      <Text>Spacing scale · {spacing}</Text>
      <Inline gap={16}><Link href="/components/button">Control sizes and corners</Link><Link href="/components/disclosure-row">Surface motion</Link></Inline>
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
