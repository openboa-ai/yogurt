import { useState } from "react";
import {
  AgentAvatar, Asset, ButtonGroup, Card, Inline, Link, ProjectMark,
  SegmentedControl, Select, Stack, Surface, Table, Text, type GazeState,
} from "@openboa/yogurt";
import food from "../../../../design/assets/projects/emoji.json";
import shapes from "../../../../design/assets/agents/silhouettes.json";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const chapters = [
  ["general-emoji", "General emoji"], ["applications", "Applications"], ["emoji", "Project emoji"],
  ["icons", "Icons"], ["agents", "Agent shapes"], ["motion", "Motion"], ["data", "Charts"],
] as const;
const samples = [
  ["1f60a", "Smiling face"], ["1f44d", "Thumbs up"], ["1f525", "Fire"], ["1f680", "Rocket"],
  ["1f3a8", "Artist palette"], ["1f992", "Giraffe"], ["1f52d", "Telescope"], ["1f433", "Spouting whale"],
] as const;
const ids = ["yogurt", "sourdough", "meatball"] as const;
const states = [
  ["ready", "Ready"], ["thinking", "Thinking"], ["working", "Working"], ["waiting", "Waiting for you"],
  ["blocked", "Blocked"], ["done", "Finished"],
] as const;

function ProjectEmoji() {
  const [ink, setInk] = useState("paper");
  const [contour, setContour] = useState("notch");
  return <Stack gap={16}>
    <Inline gap={16}>
      <SegmentedControl label="Surface" options={[{id: "paper", label: "Paper"}, {id: "ink", label: "Ink"}]} value={ink} onValueChange={setInk} />
      <SegmentedControl label="Contour at detail size" options={[{id: "notch", label: "With notch"}, {id: "plain", label: "Plain"}]} value={contour} onValueChange={setContour} />
    </Inline>
    <GuideGrid>
      {ids.map(id => {
        const drawing = food.projects.find(project => project.name === id)!;
        return <Card key={id} title={id} description={drawing.description}>
          <Stack gap={12}>
            <Surface className="guide-proof" data-ink={ink === "ink" || undefined}>
              <Stack gap={8}>
                {contour === "notch" ? <ProjectMark project={id} size={96} label="" /> :
                  <svg width="96" height="96" viewBox={food.viewBox} aria-hidden="true">
                    {drawing.layers.map(layer => <path key={layer.name} d={layer.path} fill={"var(--boa-color-" + layer.color.replace(".", "-") + ")"} />)}
                  </svg>}
                <Inline gap={8}>{[16, 24, 32].map(size => <ProjectMark key={size} project={id} size={size} label="" />)}</Inline>
              </Stack>
            </Surface>
            <Inline gap={12}>
              <Link href={"/assets/projects/" + id + ".svg"} download>SVG</Link>
              <Link href={"/assets/projects/" + id + ".png"} download>PNG</Link>
            </Inline>
          </Stack>
        </Card>;
      })}
    </GuideGrid>
  </Stack>;
}

function Motion() {
  const [state, setState] = useState<GazeState>("ready");
  return <Surface className="guide-panel" id="motion-demo">
    <Stack gap={16}>
      <Select label="Agent state" options={states.map(([id, label]) => ({id, label}))} value={state} onValueChange={next => setState(next as GazeState)} />
      <Inline gap={24}><AgentAvatar agent="Kai" state={state} size={96} /><AgentAvatar agent="Kai" state={state} size={24} /></Inline>
      <Text role="status">Kai · {states.find(([id]) => id === state)?.[1]}</Text>
    </Stack>
  </Surface>;
}

export default function DesignSources() {
  return <GuidePage title="Design sources" detail="Start with the file you can edit. A food emoji identifies a project, a face identifies an agent, an icon names an action, and a chart answers a question."
    chapters={chapters} action={<ButtonGroup label="Explore design sources">
      <Link href="/agents" emphasis="soft" size="touch">Explore agent motion</Link>
      <Link href="/emoji" emphasis="filled" size="touch">Browse emoji</Link>
    </ButtonGroup>}>
    <GuideSection id="general-emoji" title="General emoji">
      <Text>Find faces, gestures, animals, places, activities, objects, symbols and flags. Each sequence has an editable drawing and a transparent chat export.</Text>
      <Inline className="guide-emoji-preview-strip" gap={8}>{samples.map(([id, label]) => <Link key={id} href={"/emoji?emoji=" + id} aria-label={label} emphasis="quiet">
        <Asset size={28}><img src={"/assets/emoji/svg/" + id + ".svg"} width="28" height="28" alt="" /></Asset>
      </Link>)}</Inline>
      <Link href="/emoji">Open the complete emoji catalog</Link>
    </GuideSection>
    <GuideSection id="applications" title="Brand applications">
      <Text>Introduce the company on a cover with the full signature and a single thought. In this 16:9 example, the wordmark stays outlined and the headline stays editable in Rethink Sans.</Text>
      <Card title="Company opener" action={<Link href="/assets/applications/company-opener.svg" download>Download editable SVG</Link>}>
        <img src="/assets/applications/company-opener.svg" alt="OpenBoa cover reading Every limit has a shelf life." width={640} height={360} loading="lazy" />
      </Card>
      <Link href="/tokens#catalog">Product component catalog</Link>
    </GuideSection>
    <GuideSection id="emoji" title="Project emoji">
      <Text>A peeled lid identifies yogurt. One long score identifies sourdough. Three flecks of cracked pepper finish the round meatball.</Text>
      <ProjectEmoji />
    </GuideSection>
    <GuideSection id="icons" title="Icons">
      <Text>Use icons to support a clear action. Give an icon-only control a label that describes its effect.</Text>
      <Inline gap={12}>{["search", "expand", "check", "close"].map(id => <Link key={id} href={"/assets/icons/" + id + ".svg"} emphasis="soft" download>
        <Asset size={16}><img src={"/assets/icons/" + id + ".svg"} width="16" height="16" alt="" /></Asset>{id}
      </Link>)}</Inline>
    </GuideSection>
    <GuideSection id="agents" title="Agent shapes">
      <Text>A rounded silhouette and a shallow notch identify an agent at roster and detail sizes. Use the named shape and approved palette together.</Text>
      <Inline gap={16}>{shapes.shapes.map(shape => <Link key={shape.file} href={"/assets/agents/" + shape.file} aria-label={"Download " + shape.name} emphasis="quiet" download>
        <Asset size={32}><img src={"/assets/agents/" + shape.file} width="32" height="32" alt="" /></Asset>
      </Link>)}</Inline>
      <Inline gap={16}><Link href="/agents">Open the agent family</Link><Link href="/assets/agents/silhouettes.json" download>Shape inventory</Link></Inline>
    </GuideSection>
    <GuideSection id="motion" title="Agent motion">
      <Text>Compare the same state at 96 and 24 px. Read the text label alongside the motion.</Text>
      <Motion />
      <Link href="/assets/agents/eye-motion.json" download>Motion values and eye anchors</Link>
    </GuideSection>
    <GuideSection id="data" title="Data visualization">
      <Text>A bar compares a count from a common zero. Blue identifies the same measure on each row.</Text>
      <GuideGrid>
        <Card title="Fitted notch positions" action={<Link href="/assets/charts/notch-positions.svg" download>Download SVG</Link>}>
          <img src="/assets/charts/notch-positions.svg" alt="Kai four, Sol three, Round star two." width="390" height="147" />
        </Card>
        <Table caption="Positions by shape"><thead><tr><th scope="col">Shape</th><th scope="col">Positions</th></tr></thead>
          <tbody>{["Kai", "Sol", "Round star"].map(name => <tr key={name}><th scope="row">{name}</th><td>{shapes.shapes.find(shape => shape.name === name)?.positions.length}</td></tr>)}</tbody>
        </Table>
      </GuideGrid>
      <Link href="/assets/charts/notch-positions.csv" download>Download data</Link>
    </GuideSection>
  </GuidePage>;
}
