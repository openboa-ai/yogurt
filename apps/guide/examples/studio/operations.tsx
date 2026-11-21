import { useState } from "react";
import * as Y from "@openboa/yogurt";
import { options } from "./fixtures";

const sample = { source: "Sample workspace", asOf: "2026-11-21", timeLabel: "Nov 21" };
const initialTasks = [
  { id: "sources", title: "Review the missing source", agent: "Sol", state: "Needs you", note: "The fourth reading has no timestamp. Keep it out of the published brief until its source confirms it." },
  { id: "brief", title: "Prepare the research brief", agent: "Kai", state: "Working", note: "The draft incorporates three confirmed observations." },
  { id: "release", title: "Send release notes to the team", agent: "Kai", state: "Waiting", note: "Waiting on the review of the missing source." },
];

export function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selected, setSelected] = useState("sources");
  const [filter, setFilter] = useState("All");
  const [create, setCreate] = useState(false);
  const task = tasks.find(item => item.id === selected);
  const matches = tasks.filter(item => filter === "All" || filter === item.state);
  return <Y.Stack gap={16}>
    <Y.Inline className="studio-split"><Y.SegmentedControl label="Task status" options={["All", "Needs you", "Working", "Waiting", "Done"].map(id => ({ id, label: id + " · " + tasks.filter(item => id === "All" || item.state === id).length }))} value={filter} onValueChange={setFilter} />
      <Y.Button onClick={() => setCreate(true)}>New task</Y.Button></Y.Inline>
    <div className="studio-split-pane">
      <Y.Surface><Y.List label="Tasks">{matches.map(item =>
        <Y.ListRow key={item.id} title={item.title} description={item.agent} current={item.id === selected}
          trailing={<Y.Badge tone={item.state === "Needs you" ? "warning" : "neutral"}>{item.state}</Y.Badge>} onActivate={() => setSelected(item.id)} />)}
        {!matches.length && <li><Y.Text variant="help">No matching tasks.</Y.Text></li>}</Y.List></Y.Surface>
      {task && <div key={task.id} className="studio-detail"><Y.Card title={task.title} description={task.agent}>
        <Y.Stack gap={12}><Y.Text>{task.note}</Y.Text>
          {task.state === "Done" ? <Y.Status tone="success">Review recorded</Y.Status> : <Y.Inline><Y.Button onClick={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, state: "Done" } : item))}>Mark complete</Y.Button></Y.Inline>}
        </Y.Stack>
      </Y.Card></div>}
    </div>
    <Y.Dialog title="New task" open={create} onOpenChange={setCreate}>
      <form onSubmit={event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        if (!title) return;
        const id = crypto.randomUUID();
        setTasks(current => [...current, { id, title, agent: String(form.get("agent")), state: "Waiting", note: "Queued in the sample workspace." }]);
        setSelected(id); setFilter("All"); setCreate(false);
      }}><Y.Stack gap={12}>
        <Y.TextField label="Task" name="title" required />
        <Y.Select label="Assign to" name="agent" options={options("Kai", "Sol")} />
        <Y.Button type="submit">Create task</Y.Button>
      </Y.Stack></form>
    </Y.Dialog>
  </Y.Stack>;
}

const nodeTypes = ["Schedule", "Prompt", "Asset", "Model", "Agent", "Image", "Video", "Condition", "Approval", "Output"];
type Node = { id: string; type: string; label: string; instructions: string };
const defaultNodes = [
  { id: "schedule", type: "Schedule", label: "Weekdays at 09:00", instructions: "Review the morning observations." },
  { id: "agent", type: "Agent", label: "Prepare the morning brief", instructions: "Ask Kai to summarize the reviewed readings." },
  { id: "approval", type: "Approval", label: "Approve the brief", instructions: "Confirm the evidence before showing the output." },
];

export function Workflows() {
  const [flows, setFlows] = useState([{ id: "morning", name: "Morning brief", nodes: defaultNodes }]);
  const [current, setCurrent] = useState("morning");
  const [selected, setSelected] = useState("");
  const [run, setRun] = useState<"idle" | "review" | "done" | "cancelled">("idle");
  const [confirmed, setConfirmed] = useState(false);
  const flow = flows.find(item => item.id === current)!;
  const step = flow.nodes.find(item => item.id === selected);
  const stepIndex = flow.nodes.findIndex(item => item.id === selected);
  function moveStep(delta: -1 | 1) {
    const nodes = [...flow.nodes];
    const target = stepIndex + delta;
    if (stepIndex < 0 || target < 0 || target >= nodes.length) return;
    [nodes[stepIndex], nodes[target]] = [nodes[target], nodes[stepIndex]];
    updateNodes(nodes);
  }
  function updateNodes(nodes: Node[]) {
    setFlows(previous => previous.map(item => item.id === current ? { ...item, nodes } : item));
    setRun("idle");
  }
  function newFlow() {
    const id = crypto.randomUUID();
    setFlows(previous => [...previous, { id, name: "Untitled workflow " + (previous.length + 1), nodes: [] }]);
    setCurrent(id); setSelected(""); setRun("idle");
  }
  function add(type: string) {
    const id = crypto.randomUUID();
    updateNodes([...flow.nodes, { id, type, label: type, instructions: "" }]);
    setSelected(id);
  }
  return <Y.Stack gap={16}>
    <Y.Inline className="studio-split">
      <Y.Select label="Workflow" options={flows.map(item => ({ id: item.id, label: item.name }))} value={current} onChange={event => { setCurrent(event.target.value); setSelected(""); setRun("idle"); }} />
      <Y.ButtonGroup label="Workflow actions"><Y.Button emphasis="soft" onClick={newFlow}>New workflow</Y.Button>
        <Y.Button disabled={!flow.nodes.length || run === "review"} onClick={() => setRun(flow.nodes.some(node => node.type === "Approval") ? "review" : "done")}>Run sample</Y.Button></Y.ButtonGroup>
    </Y.Inline>
    <div className="studio-split-pane">
      <Y.Surface className="studio-workflow-canvas"><Y.Stack gap={12}>
        <Y.Text variant="meta">Workflow steps</Y.Text>
        {flow.nodes.map((node, index) => <div key={node.id} className="studio-workflow-step"><Y.List label={"Step " + (index + 1)}>
          <Y.ListRow title={node.label} description={node.type} current={node.id === selected}
            leading={<span className="studio-step-number" aria-hidden="true">{index + 1}</span>} onActivate={() => setSelected(node.id)} />
        </Y.List></div>)}
        {!flow.nodes.length && <Y.Text>Start with a trigger or add a step.</Y.Text>}
        <Y.Inline><Y.ActionMenu label="Add step" items={options(...nodeTypes)} onSelect={add} /></Y.Inline>
      </Y.Stack></Y.Surface>
      <div className="studio-detail" key={step?.id ?? "workflow"}><Y.Card title={step ? "Edit " + step.type.toLowerCase() : "Workflow details"}>
        <Y.Stack gap={12}>
          <Y.TextField label="Workflow name" value={flow.name} onChange={event => setFlows(previous => previous.map(item => item.id === current ? { ...item, name: event.target.value } : item))} />
          {step && <>
            <Y.TextField label="Step label" value={step.label} onChange={event => updateNodes(flow.nodes.map(node => node.id === step.id ? { ...node, label: event.target.value } : node))} />
            <Y.Textarea label="Instructions" value={step.instructions} onChange={event => updateNodes(flow.nodes.map(node => node.id === step.id ? { ...node, instructions: event.target.value } : node))} />
            <Y.ButtonGroup label="Step actions">
              <Y.Button emphasis="quiet" disabled={stepIndex <= 0} onClick={() => moveStep(-1)}>Move up</Y.Button>
              <Y.Button emphasis="quiet" disabled={stepIndex >= flow.nodes.length - 1} onClick={() => moveStep(1)}>Move down</Y.Button>
              <Y.Button emphasis="quiet" onClick={() => { updateNodes(flow.nodes.filter(node => node.id !== step.id)); setSelected(""); }}>Remove step</Y.Button>
            </Y.ButtonGroup>
          </>}
        </Y.Stack>
      </Y.Card></div>
    </div>
    {run === "review" && <Y.Notice title="Approval required" tone="warning" action={<Y.ButtonGroup label="Run decision">
      <Y.Button emphasis="soft" onClick={() => setRun("cancelled")}>Stop run</Y.Button>
      <Y.Button onClick={() => setConfirmed(true)}>Review output</Y.Button></Y.ButtonGroup>}>The sample output is ready to review.</Y.Notice>}
    {run === "done" && <Y.Notice title="Sample run complete" tone="success">The reviewed brief is ready to share.</Y.Notice>}
    {run === "cancelled" && <Y.Status>Run stopped.</Y.Status>}
    <Y.Dialog title="Approve the sample brief?" open={confirmed} onOpenChange={setConfirmed}>
      <Y.Stack><Y.Text>Three observations were reviewed. One remains marked as missing.</Y.Text>
        <Y.ButtonGroup label="Approval actions"><Y.Button emphasis="quiet" onClick={() => setConfirmed(false)}>Cancel</Y.Button>
          <Y.Button onClick={() => { setConfirmed(false); setRun("done"); }}>Approve sample</Y.Button></Y.ButtonGroup>
      </Y.Stack>
    </Y.Dialog>
  </Y.Stack>;
}

export function Schedule() {
  const [date, setDate] = useState("2026-11-21");
  const [events, setEvents] = useState([{ id: "review", date: "2026-11-21", title: "Morning source review", time: "09:00", enabled: true }]);
  const [open, setOpen] = useState(false);
  return <Y.Stack gap={16}>
    <div className="studio-split-pane">
      <Y.Card title="Calendar"><Y.Calendar label="Schedule date" value={date} onValueChange={setDate} /></Y.Card>
      <Y.Card title={new Intl.DateTimeFormat("en", { dateStyle: "full", timeZone: "UTC" }).format(new Date(date + "T00:00:00Z"))} action={<Y.Button onClick={() => setOpen(true)}>Add routine</Y.Button>}>
        <Y.Stack>{events.filter(item => item.date === date).map(item =>
          <Y.Switch key={item.id} label={item.time + " · " + item.title} checked={item.enabled}
            onCheckedChange={enabled => setEvents(previous => previous.map(event => event.id === item.id ? { ...event, enabled } : event))} />)}
          {!events.some(item => item.date === date) && <Y.Text variant="help">Nothing scheduled.</Y.Text>}
        </Y.Stack>
      </Y.Card>
    </div>
    <Y.Dialog title="Add routine" open={open} onOpenChange={setOpen}>
      <form onSubmit={event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        if (!title) return;
        setEvents(previous => [...previous, { id: crypto.randomUUID(), date, title, time: String(form.get("time")), enabled: true }]);
        setOpen(false);
      }}><Y.Stack gap={12}><Y.TextField label="Routine name" name="title" required />
        <Y.TextField label="Time" name="time" type="time" defaultValue="09:00" required />
        <Y.Button type="submit">Save routine</Y.Button></Y.Stack></form>
    </Y.Dialog>
  </Y.Stack>;
}

export function Usage() {
  const [agent, setAgent] = useState("All agents");
  const [period, setPeriod] = useState("7 days");
  const [metric, setMetric] = useState("Cost");
  const [breakdown, setBreakdown] = useState("Agent");
  const base = agent === "All agents" ? 1 : agent === "Kai" ? .6 : .4;
  const size = base * (period === "7 days" ? 1 : 3.4);
  const value = metric === "Cost" ? 4.8 : 320;
  const summary = metric === "Cost" ? "$" + (value * size).toFixed(2) : Math.round(value * size) + "K tokens";
  return <Y.Stack gap={16}>
    <Y.Inline><Y.Select label="Agent" value={agent} options={options("All agents", "Kai", "Sol")} onChange={event => setAgent(event.target.value)} />
      <Y.Select label="Period" value={period} options={options("7 days", "30 days")} onChange={event => setPeriod(event.target.value)} />
      <Y.Select label="Metric" value={metric} options={options("Cost", "Tokens")} onChange={event => setMetric(event.target.value)} /></Y.Inline>
    <div className="studio-split-pane">
      <Y.Card title={"Total " + metric.toLowerCase()}><Y.Heading className="studio-metric" level={4}>{summary}</Y.Heading></Y.Card>
      <Y.Card title="Workspace resources"><Y.Stack><Y.Progress label="CPU" value={27} /><Y.Progress label="Memory" value={48} /></Y.Stack></Y.Card>
    </div>
    <Y.Surface className="studio-usage-chart"><Y.Chart title={metric + " over time"} series={agent} unit={metric === "Cost" ? "USD" : "K tokens"} points={["Mon", "Tue", "Wed", "Thu", "Fri"].map((label, index) =>
      ({ id: label, label, value: Math.round(value * size * [.15, .22, .12, .2, .31][index] * 100) / 100 }))} {...sample} /></Y.Surface>
    <Y.Card title="Breakdown"><Y.Stack gap={12}>
      <Y.SegmentedControl label="Group usage by" options={options("Agent", "Model", "Day", "Skill")} value={breakdown} onValueChange={setBreakdown} />
      <Y.List label="Usage breakdown">{(breakdown === "Agent" ? ["Kai", "Sol"] : breakdown === "Model" ? ["Studio Standard", "Studio Fast"] : breakdown === "Day" ? ["Today", "Earlier"] : ["Source review", "Brief writing"])
        .map((label, index) => <Y.ListRow key={label} title={label} trailing={<Y.Text>{index === 0 ? "60%" : "40%"}</Y.Text>} />)}</Y.List>
    </Y.Stack></Y.Card>
  </Y.Stack>;
}
