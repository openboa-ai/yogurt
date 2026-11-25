import { useState } from "react";
import {
  ActionMenu, Badge, Card, Disclosure, Heading, Inline, Link, ProjectMark,
  Select, Stack, Surface, Table, Text,
} from "@openboa/yogurt";
import catalog from "../../../../catalog/patterns.json";
import examples from "../../../../examples/project-use/scenarios.json";
import { GuideGrid, GuidePage, GuideSection } from "./layout";

const marks = { meatball: "meatball", sourdough: "sourdough", yogurt: "yogurt" } as const;
const projects = examples.map(example => ({id: example.id, label: example.project + " · " + example.task}));
const patterns = new Map(catalog.patterns.map(pattern => [pattern.id, pattern]));
const components = new Map(catalog.components.map(component => [component.id, component]));
function patternUrl(pattern: string, state: string) {
  const example = examples.find(item => item.scenes.some(scene => scene.pattern === pattern && scene.state === state));
  return example ? "/playbook?" + new URLSearchParams({project: example.id, pattern, state}) : undefined;
}

export default function Playbook() {
  const params = new URLSearchParams(location.search);
  const [project, setProject] = useState(() => examples.find(item => item.id === params.get("project")) ?? examples[0]);
  const [index, setIndex] = useState(() => Math.max(0, project.scenes.findIndex(scene =>
    scene.state === params.get("state") && (!params.get("pattern") || scene.pattern === params.get("pattern")))));
  const [guide, setGuide] = useState({ id: location.hash.slice(1), revision: 0 });
  const scene = project.scenes[index];
  const pattern = patterns.get(scene.pattern)!;
  const rule = pattern.states.find(item => item.id === scene.state)!;
  function openGuide(id: string) {
    setGuide(previous => ({ id, revision: previous.revision + 1 }));
    requestAnimationFrame(() => document.getElementById(id)?.querySelector<HTMLElement>("summary")?.focus());
  }

  return <GuidePage title="Product playbook" id="playbook"
    detail="Choose the job your screen needs to do. See which facts the product supplies and how Yogurt turns them into an interface."
    action={<Link href="#pb-directory-section" emphasis="soft" size="touch">Browse all task patterns</Link>}>
    <GuideGrid split>
      <Card title="Choose a task">
        <Stack gap={16}>
          <Select id="pb-project" label="Product brief" value={project.id} options={projects}
            onValueChange={value => {
              const next = examples.find(item => item.id === value);
              if (next) { setProject(next); setIndex(0); }
            }} />
          <Select id="pb-state" label="Product condition" value={String(index)}
            options={project.scenes.map((item, position) => ({id: String(position), label: item.label}))}
            onValueChange={value => setIndex(Number(value))} />
          <Heading level={4}>Product inputs</Heading>
          <Text>{project.inputs}</Text>
        </Stack>
      </Card>
      <Surface className="guide-panel">
        <Stack gap={16}>
          <Inline gap={8}><ProjectMark project={marks[project.id as keyof typeof marks]} label="" size={32} />
            <Text>{project.project}</Text><Badge>Example data</Badge></Inline>
          <Heading id="example-title" level={3} aria-live="polite" aria-atomic="true">{scene.headline}</Heading>
          <Text>{scene.body}</Text>
          <Table caption="Product facts">
            <tbody>{scene.facts.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody>
          </Table>
          <Heading level={4}>Available next step</Heading>
          <Text>{scene.action}</Text>
        </Stack>
      </Surface>
    </GuideGrid>
    <GuideSection id="usage" title="What Yogurt supplies">
      <Inline gap={16}>
        <Text variant="help">{pattern.id} / {rule.id}</Text>
        <ActionMenu label="Guide options" items={[{id: "parts", label: "Component choices"}, {id: "proof", label: "Review checks"}]} onSelect={openGuide} />
      </Inline>
      <Text>{rule.show} {rule.action}</Text>
      <Stack id="parts">
        <Disclosure key={guide.id === "parts" ? guide.revision : 0} label="Component choices" initiallyOpen={guide.id === "parts"}>
          <Stack gap={8}>
            {pattern.components.map(id => {
              const component = components.get(id)!;
              return <Text key={id}><strong>{component.name}.</strong> {component.use} ({component.web.replaceAll("-", " ")})</Text>;
            })}
            <Text>{pattern.support.web.detail}</Text>
          </Stack>
        </Disclosure>
      </Stack>
      <Stack id="proof">
        <Disclosure key={guide.id === "proof" ? guide.revision : 0} label="Review checks" initiallyOpen={guide.id === "proof"}>
          <Stack gap={8}><Text>{rule.acceptance}</Text><Text>{pattern.keyboard}</Text></Stack>
        </Disclosure>
      </Stack>
    </GuideSection>
    <GuideSection id="pb-directory-section" title="Task patterns">
      <GuideGrid>{catalog.patterns.map(pattern => <Card key={pattern.id} title={pattern.name} description={pattern.when}>
        <Stack gap={8}>{pattern.states.map(state => {
          const href = patternUrl(pattern.id, state.id);
          return href ? <Link key={state.id} href={href}>{state.label}</Link> : <Text key={state.id} variant="help">{state.label} · example unavailable</Text>;
        })}</Stack>
      </Card>)}</GuideGrid>
    </GuideSection>
    <Inline gap={16}>
      <Link href="/DESIGN.md">Agent entry</Link><Link href="/docs/repository.md">Repository blueprint</Link>
      <Link href="/catalog/patterns.json">Pattern catalog</Link><Link href="/adoption#setup">Project setup</Link>
    </Inline>
  </GuidePage>;
}
