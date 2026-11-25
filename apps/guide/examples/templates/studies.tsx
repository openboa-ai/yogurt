import { useState } from "react";
import {
  Button, ButtonGroup, Card, Chart, CodeBlock, Heading, Inline,
  RecordFacts, SegmentedControl, Select, Stack, Status, Switch, Text, Yogurt,
  type Appearance, type Material,
} from "@openboa/yogurt";

const source = { source: "Sample release register", asOf: "2026-11-21T12:00:00Z" };
const choices = (entries: string[]) => entries.map(label => ({ id: label.toLowerCase().replaceAll(" ", "-"), label }));

export function ChartStudy() {
  const [view, setView] = useState("trend");
  const [period, setPeriod] = useState("week");
  const values = period === "week" ? [3, 8, 6, 12] : [9, 18, 24, 28];
  const trend = values.map((value, index) => ({ id: String(index), label: period === "week" ? ["Mon", "Tue", "Wed", "Thu"][index] : "Week " + (index + 1), value }));
  const categories = [{ id: "briefs", label: "Briefs", value: 8 }, { id: "reviews", label: "Reviews", value: 12 }, { id: "releases", label: "Releases", value: 4 }];
  return <Stack gap={24} className="template-study">
    <SegmentedControl label="Chart example" options={choices(["Trend", "Compare categories", "Missing readings"])} value={view} onValueChange={setView} />
    {view === "compare-categories" ? <Chart title="Completed work by type" series="Completed" unit="items" points={categories} {...source} /> :
      <Stack gap={12}>
        <SegmentedControl label="Chart period" options={choices(["Week", "Month"])} value={period} onValueChange={setPeriod} />
        <Chart title="Completed work over time" series="Completed" unit="items"
          points={view === "missing-readings" ? trend.map((point, index) => index === 1 ? { ...point, value: null } : point) : trend} {...source} />
        {view === "missing-readings" && <Text variant="help">The source has no reading for {trend[1].label}.</Text>}
      </Stack>}
  </Stack>;
}

export function TypeStudy() {
  const [view, setView] = useState("documentation");
  const [density, setDensity] = useState("regular");
  const [measure, setMeasure] = useState("standard");
  return <Stack gap={24} className="template-study">
    <Inline className="template-study-controls">
      <Select label="Content" options={choices(["Documentation", "Record", "Conversation"])} value={view} onValueChange={setView} />
      <Select label="Rhythm" options={choices(["Compact", "Regular", "Spacious"])} value={density} onValueChange={setDensity} />
      <Select label="Reading measure" options={choices(["Narrow", "Standard", "Wide"])} value={measure} onValueChange={setMeasure} />
    </Inline>
    <div className="yg-post template-prose" data-measure={measure}>
      <Stack gap={density === "compact" ? 8 : density === "spacious" ? 24 : 16}>
        <Heading>{view === "documentation" ? "Prepare a release brief" : view === "record" ? "Workspace 2.4" : "Review notes"}</Heading>
        <Text variant="meta">Updated November 21 · Studio</Text>
        <Text>{view === "conversation" ? "I checked the release notes and found two decisions that need your input. The rest is ready for review." :
          "Start with the outcome, then name the changes the reader needs to understand. Keep the owner and support information close to the work."}</Text>
        <Heading level={3}>{view === "record" ? "Release facts" : "Before you publish"}</Heading>
        <ul><li>Check the latest revision.</li><li>Resolve the remaining owner question.</li><li>Share the brief with reviewers.</li></ul>
        <Text variant="help">Keep the next step near the material it affects.</Text>
      </Stack>
    </div>
  </Stack>;
}

export function ComposeStudy({ guideAppearance }: { guideAppearance: "light" | "dark" }) {
  const [task, setTask] = useState("review");
  const [material, setMaterial] = useState<Material>("neutral");
  const [appearance, setAppearance] = useState<Appearance>(guideAppearance);
  const [density, setDensity] = useState<"compact" | "regular" | "spacious">("regular");
  const [size, setSize] = useState<"compact" | "regular" | "touch">("regular");
  const [shape, setShape] = useState<"rounded" | "pill">("rounded");
  const [tone, setTone] = useState<"neutral" | "brand">("neutral");
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState("Draft");
  const items = {
    review: { title: "Review the release", description: "Check the scope and handoff before sharing.", action: "Mark ready" },
    settings: { title: "Review preferences", description: "Choose how your team receives review reminders.", action: "Save preferences" },
    register: { title: "Release register", description: "Keep the current version and owner easy to inspect.", action: "Pin release" },
  } as const;
  const current = items[task as keyof typeof items];
  const code = [
    'import "@openboa/yogurt/styles.css";',
    'import { Button, ButtonGroup, Card, Stack, Text, Yogurt } from "@openboa/yogurt";',
    '',
    'export function ReviewCard({ onCommit, onDismiss }: { onCommit: () => void; onDismiss: () => void }) {',
    '  return (',
    '    <Yogurt appearance="' + appearance + '" material="' + material + '">',
    '      <Card title=' + JSON.stringify(current.title) + ' density="' + density + '">',
    '        <Stack gap={12}>',
    '          <Text>' + current.description + '</Text>',
    '          <ButtonGroup label="Actions">',
    '            <Button emphasis="soft" size="' + size + '" shape="' + shape + '" onClick={onDismiss}>Dismiss</Button>',
    '            <Button size="' + size + '" shape="' + shape + '" tone="' + tone + '" onClick={onCommit}>' + current.action + '</Button>',
    '          </ButtonGroup>',
    '        </Stack>',
    '      </Card>',
    '    </Yogurt>',
    '  );',
    '}',
  ].join("\n");
  return <Stack gap={24} className="template-study">
    <Inline className="template-study-controls template-composition-controls">
      <Select label="Task" options={choices(["Review", "Settings", "Register"])} value={task} onValueChange={next => { setTask(next); setStatus("Draft"); }} />
      <Select label="Appearance" options={choices(["Light", "Dark"])} value={appearance} onValueChange={next => setAppearance(next as Appearance)} />
      <Select label="Surface" options={choices(["Neutral", "Paper", "Mist"])} value={material} onValueChange={next => setMaterial(next as Material)} />
      <Select label="Density" options={choices(["Compact", "Regular", "Spacious"])} value={density} onValueChange={next => setDensity(next as typeof density)} />
      <Select label="Action size" options={choices(["Compact", "Regular", "Touch"])} value={size} onValueChange={next => setSize(next as typeof size)} />
      <Select label="Action shape" options={choices(["Rounded", "Pill"])} value={shape} onValueChange={next => setShape(next as typeof shape)} />
      <Select label="Action color" options={choices(["Neutral", "Brand"])} value={tone} onValueChange={next => setTone(next as typeof tone)} />
    </Inline>
    <Yogurt appearance={appearance} material={material} className="template-composition-canvas">
      <Card title={current.title} description={current.description} density={density}>
        <Stack gap={12}>
          {task === "settings" && <Switch label="Review reminders" checked={enabled} onCheckedChange={setEnabled} />}
          {task === "register" && <RecordFacts title="Current release" facts={[
            { id: "version", label: "Version", value: "2.4" }, { id: "owner", label: "Owner", value: "Studio" },
          ]} {...source} />}
          <Status>{status}</Status>
          <ButtonGroup label="Actions">
            <Button emphasis="soft" size={size} shape={shape} onClick={() => setStatus("Dismissed")}>Dismiss</Button>
            <Button size={size} shape={shape} tone={tone} onClick={() => setStatus(task === "review" ? "Ready for review" : task === "settings" ? "Preferences saved" : "Release pinned")}>{current.action}</Button>
          </ButtonGroup>
        </Stack>
      </Card>
    </Yogurt>
    <Stack gap={8}><Heading>Card and action group</Heading><CodeBlock language="tsx" code={code} /></Stack>
  </Stack>;
}
