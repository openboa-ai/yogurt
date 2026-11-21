import { useState } from "react";
import * as Y from "@openboa/yogurt";
import { options } from "./fixtures";

type CatalogItem = { id: string; title: string; detail: string; category: string; initial?: boolean };
const catalog: CatalogItem[] = [
  { id: "research-register", title: "Research register", detail: "Read shared observations and their source notes.", category: "Tools", initial: true },
  { id: "calendar", title: "Studio calendar", detail: "Read the review schedule.", category: "Tools" },
  { id: "reviewer", title: "Source reviewer", detail: "Check readings for missing dates and sources.", category: "Agents" },
  { id: "editor", title: "Brief editor", detail: "Prepare a concise handoff from approved readings.", category: "Agents" },
  { id: "check-sources", title: "Check sources", detail: "Flag observations that lack evidence.", category: "Skills" },
  { id: "write-brief", title: "Write a review brief", detail: "Bring verified facts into a short summary.", category: "Skills" },
];
const modelProviders: CatalogItem[] = [
  { id: "studio", title: "Studio models", detail: "Studio Standard and Studio Fast", category: "Providers", initial: true },
  { id: "local", title: "Local runtime", detail: "Models hosted on a sample workstation.", category: "Providers" },
  { id: "managed", title: "Managed runtime", detail: "Models managed for the sample team.", category: "Providers" },
];

export function Connections({ providers = false }: { providers?: boolean }) {
  const [tab, setTab] = useState(providers ? "Providers" : "Tools");
  const [items, setItems] = useState(providers ? modelProviders : catalog);
  const [enabled, setEnabled] = useState(() => items.filter(item => item.initial).map(item => item.id));
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [adding, setAdding] = useState(false);
  const isConnected = selected ? enabled.includes(selected.id) : false;
  const matching = items.filter(item => item.category === tab && item.title.toLowerCase().includes(filter.toLowerCase()));
  return <Y.Stack gap={16}>
    {!providers && <Y.SegmentedControl label="Catalog type" options={options("Tools", "Agents", "Skills")} value={tab} onValueChange={id => { setTab(id); setFilter(""); }} />}
    <Y.Inline className="studio-split">
      <Y.SearchField label={providers ? "Find a provider" : "Find extensions"} value={filter} onValueChange={setFilter} />
      <Y.Button emphasis="soft" onClick={() => setAdding(true)}>{providers ? "Add sample provider" : "Create " + (tab === "Tools" ? "tool" : tab === "Agents" ? "agent" : "skill")}</Y.Button>
    </Y.Inline>
    <div className="studio-card-grid">
      {matching.map(item => <Y.Card key={item.id} title={item.title} description={item.detail} density="compact">
        <Y.Inline className="studio-split"><Y.Status tone={enabled.includes(item.id) ? "success" : "neutral"}>{enabled.includes(item.id) ? "Enabled" : "Available"}</Y.Status>
          <Y.Button emphasis="soft" onClick={() => setSelected(item)}>{enabled.includes(item.id) ? "Manage" : tab === "Tools" || providers ? "Configure" : "Add"}</Y.Button></Y.Inline>
      </Y.Card>)}
    </div>
    {!matching.length && <Y.EmptyResult query={filter} onClear={() => setFilter("")} />}
    <Y.Dialog title={selected?.title ?? "Configure"} open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
      {selected && <Y.Stack gap={12}><Y.Text>{selected.detail}</Y.Text>
        <Y.Notice title="Sample connection">Changes apply to this example session.</Y.Notice>
        <Y.ButtonGroup label="Connection actions"><Y.Button emphasis="quiet" onClick={() => setSelected(null)}>Cancel</Y.Button>
          <Y.Button onClick={() => { setEnabled(current => isConnected ? current.filter(id => id !== selected.id) : [...current, selected.id]); setSelected(null); }}>{isConnected ? "Disable" : "Enable sample"}</Y.Button>
        </Y.ButtonGroup></Y.Stack>}
    </Y.Dialog>
    <Y.Dialog title={providers ? "Add sample provider" : "New extension"} open={adding} onOpenChange={setAdding}>
      <form onSubmit={event => {
        event.preventDefault(); const data = new FormData(event.currentTarget);
        const title = String(data.get("name") ?? "").trim();
        if (!title) return;
        setItems(previous => [...previous, { id: crypto.randomUUID(), title, detail: String(data.get("detail") ?? ""), category: tab }]);
        setAdding(false); setFilter("");
      }}><Y.Stack gap={12}><Y.TextField label="Name" name="name" required />
        <Y.Textarea label="Description" name="detail" />
        <Y.Button type="submit">Add to sample</Y.Button></Y.Stack></form>
    </Y.Dialog>
  </Y.Stack>;
}

const settings = [
  { label: "Preferences", values: ["General", "Appearance", "Notifications", "Voice"] },
  { label: "Account", values: ["Profile", "Billing", "Invites", "Mobile connection"] },
  { label: "Device", values: ["App behavior", "Live activity", "Agent dock", "Computer use", "Updates"] },
  { label: "Workspace", values: ["Workspace access"] },
];

const fields: Record<string, { choices?: Record<string, string[]>; toggles?: string[]; detail?: string }> = {
  General: { choices: { "Send shortcut": ["Enter", "Command + Enter"], "Sort conversations": ["Recent activity", "Unread first", "Manual"] }, toggles: ["Show agent steps", "Compact message actions"] },
  Appearance: { choices: { "Color scheme": ["System", "Light", "Dark"], "Density": ["Comfortable", "Compact"] } },
  Notifications: { toggles: ["Task review requests", "Channel mentions", "Workflow completion"] },
  Voice: { choices: { "Input mode": ["Push to talk", "Hands-free"], "Sample voice": ["Clear", "Warm"] }, toggles: ["Voice feedback"], detail: "This preview never requests microphone access." },
  Billing: { detail: "Sample plan · $20 monthly allowance", toggles: ["Notify me when the sample allowance reaches 80%"] },
  Invites: { detail: "Invite teammates to review the studio’s shared work.", choices: { "Default invite role": ["Reviewer", "Member"] } },
  "Mobile connection": { detail: "Pair a sample device to review the workspace on the go.", toggles: ["Allow sample pairing"] },
  "App behavior": { toggles: ["Restore the latest view", "Keep the workspace open"] },
  "Live activity": { toggles: ["Show active tasks", "Show approval requests"] },
  "Agent dock": { choices: { "Dock position": ["Leading", "Trailing"] }, toggles: ["Show pinned agents"] },
  "Computer use": { toggles: ["Ask before opening a workspace tool", "Show an action history"], detail: "The studio uses a simulated inspector." },
  Updates: { choices: { "Update channel": ["Stable", "Preview"] }, toggles: ["Show release notes"] },
  "Workspace access": { choices: { "Default role": ["Viewer", "Reviewer", "Member"] }, toggles: ["Require approval for shared runs"] },
};

export function Settings({ onAppearance }: { onAppearance: (value: "light" | "dark" | undefined) => void }) {
  const [current, setCurrent] = useState("General");
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({ "Display name": "Mina Park" });
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const section = fields[current];
  return <div className="studio-settings">
    <Y.Surface><Y.Stack gap={12}>{settings.map(group => <Y.Stack key={group.label} gap={4}>
      <Y.Text variant="meta">{group.label}</Y.Text>
      <Y.List label={group.label}>{group.values.map(title => <Y.ListRow key={title} title={title} current={current === title}
        onActivate={() => { setCurrent(title); setSaved(false); }} />)}</Y.List>
    </Y.Stack>)}</Y.Stack></Y.Surface>
    <Y.Card title={current} description={section?.detail}><Y.Stack gap={16}>
      {current === "Profile" && <Y.TextField label="Display name" value={values["Display name"]} onChange={event => {
        setValues(previous => ({ ...previous, "Display name": event.target.value })); setSaved(false);
      }} />}
      {Object.entries(section?.choices ?? {}).map(([label, choices]) => <Y.Select key={label} label={label} options={options(...choices)} value={values[label] ?? choices[0]}
        onChange={event => { const next = event.target.value; setValues(previous => ({ ...previous, [label]: next })); setSaved(false);
          if (label === "Color scheme") onAppearance(next === "Dark" ? "dark" : next === "Light" ? "light" : undefined); }} />)}
      {(section?.toggles ?? []).map(label => <Y.Switch key={label} label={label} checked={!!enabled[label]} onCheckedChange={checked => {
        setEnabled(previous => ({ ...previous, [label]: checked })); setSaved(false);
      }} />)}
      {current === "Invites" && <Y.CodeBlock language="Sample invitation code" code="STUDIO-REVIEW" />}
      {current === "Mobile connection" && enabled["Allow sample pairing"] && <Y.CodeBlock language="Sample pairing code" code="452-801" />}
      <Y.Inline><Y.Button onClick={() => setSaved(true)}>Save preferences</Y.Button>{saved && <Y.Status tone="success">Preferences saved.</Y.Status>}</Y.Inline>
    </Y.Stack></Y.Card>
  </div>;
}

export function Help() {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  return <Y.Stack gap={16}>
    <Y.Card title="What’s new"><Y.Accordion label="Recent updates" items={[
      { id: "review", title: "Review a workflow result", content: "Open Workflows, choose Morning brief and run the sample to see its review decision." },
      { id: "files", title: "Find an observation file", content: "Use the Files view and filter by owner or file type." },
      { id: "thread", title: "Keep a follow-up in its own thread", content: "Open a conversation and use New thread." },
    ]} /></Y.Card>
    <Y.Card title="Share feedback"><form onSubmit={event => {
      event.preventDefault(); if (!draft.trim()) return; setDraft(""); setSent(true);
    }}><Y.Stack gap={12}><Y.Textarea label="Feedback" value={draft} onChange={event => { setDraft(event.target.value); setSent(false); }} required />
      <Y.Inline><Y.Button type="submit">Save sample feedback</Y.Button>{sent && <Y.Status tone="success">Feedback saved for this session.</Y.Status>}</Y.Inline>
    </Y.Stack></form></Y.Card>
  </Y.Stack>;
}
