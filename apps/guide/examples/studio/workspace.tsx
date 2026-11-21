import { useEffect, useState, type ReactNode } from "react";
import * as Y from "@openboa/yogurt";
import { conversations, options, studioFiles, workspaceViews, type View } from "./fixtures";
import { Inbox } from "./inbox";
import { Schedule, Tasks, Usage, Workflows } from "./operations";
import { Customers, Library } from "./records";
import { Connections, Help, Settings } from "./settings";

const groups = [
  { label: "Desk", ids: ["conversations", "tasks", "workflows", "schedule"] },
  { label: "Records", ids: ["library", "usage", "customers"] },
  { label: "Workspace", ids: ["extensions", "providers", "settings", "help"] },
];
const searchKinds = ["All", "Agents", "Channels", "Messages", "Files", "Routines"];
const searchItems = [
  ...workspaceViews.map(item => ({ id: item.id, title: item.label, kind: "Views", view: item.id })),
  ...conversations.map(item => ({ id: item.id, title: item.name, kind: item.kind === "agent" ? "Agents" : "Channels", view: "conversations" as const })),
  ...conversations.map(item => ({ id: item.id, title: item.summary, kind: "Messages", view: "conversations" as const })),
  ...studioFiles.map(item => ({ id: item.id, title: item.name, kind: "Files", view: "library" as const })),
  { id: "morning-routine", title: "Morning source review", kind: "Routines", view: "schedule" as const },
];

export function StudioWorkspace({ appearance }: { appearance: "light" | "dark" }) {
  const [trail, setTrail] = useState<{ views: View[]; index: number }>({ views: ["conversations"], index: 0 });
  const view = trail.views[trail.index];
  const [selected, setSelected] = useState("kai");
  const [fileTarget, setFileTarget] = useState<{ id: string }>();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [scheme, setScheme] = useState<"light" | "dark">();
  const [server, setServer] = useState("Sourdough Studio");
  const [workspaces, setWorkspaces] = useState(["Sourdough Studio", "Local workspace"]);
  const [manage, setManage] = useState(false);
  const [notice, setNotice] = useState("");
  const [restart, setRestart] = useState(false);
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setSearch(true);
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  function navigate(next: View) {
    setTrail(previous => next === previous.views[previous.index] ? previous : { views: [...previous.views.slice(0, previous.index + 1), next], index: previous.index + 1 });
  }

  const matches = searchItems.filter(item => (kind === "All" || item.kind === kind) && item.title.toLowerCase().includes(query.toLowerCase()));
  const panels: Record<View, ReactNode> = {
    conversations: <Inbox selected={selected} setSelected={setSelected} />,
    tasks: <Tasks />, workflows: <Workflows />, schedule: <Schedule />, usage: <Usage />,
    library: <Library target={fileTarget} />, customers: <Customers />, extensions: <Connections />,
    providers: <Connections providers />, settings: <Settings onAppearance={setScheme} />, help: <Help />,
  };

  return <Y.Yogurt appearance={scheme ?? appearance} className="studio-demo">
    <Y.SidebarLayout label="Studio navigation" width="13rem" compactAt={780} variant="flat" collapse="rail"
      navigation={<>
        <Y.SidebarHeader compact={<Y.ProjectMark project="sourdough" label={server} size={30} />}>
          <Y.Inline><Y.ProjectMark project="sourdough" size={34} label="" /><Y.Stack gap={2}><Y.Text>{server}</Y.Text><Y.Text variant="meta">Sample workspace</Y.Text></Y.Stack></Y.Inline>
        </Y.SidebarHeader>
        <Y.SidebarContent label="Studio sections">
          {groups.map(group => <Y.SidebarGroup key={group.label} label={group.label}>
            {workspaceViews.filter(item => group.ids.includes(item.id)).map(item =>
              <Y.SidebarItem key={item.id} label={item.label} icon={<Y.Icon name={item.icon} />} active={view === item.id} onSelect={() => navigate(item.id)} />)}
          </Y.SidebarGroup>)}
        </Y.SidebarContent>
      </>}>
      <div className="studio-main">
        <header className="studio-toolbar">
          <Y.Inline>
            <Y.SidebarTrigger label="Browse workspace" />
            <Y.IconButton label="Previous view" icon="back" disabled={trail.index === 0} onClick={() => setTrail(previous => ({ ...previous, index: previous.index - 1 }))} />
            <Y.IconButton label="Next view" icon="next" disabled={trail.index >= trail.views.length - 1} onClick={() => setTrail(previous => ({ ...previous, index: previous.index + 1 }))} />
            <Y.Heading level={2} className="studio-view-title">{workspaceViews.find(item => item.id === view)?.label}</Y.Heading>
          </Y.Inline>
          <Y.Inline>
            <Y.Button emphasis="quiet" onClick={() => setSearch(true)}><Y.Icon name="search" /> Search</Y.Button>
            <Y.ActionMenu label="Workspace menu" items={[
              ...workspaces.map(name => ({ id: "workspace:" + name, label: name })),
              { id: "add", label: "Add sample workspace" }, { id: "settings", label: "Workspace settings" },
              { id: "restart", label: "Restart sample" }, { id: "remove", label: "Remove sample workspace", disabled: server === "Sourdough Studio" },
            ]} onSelect={id => {
              setNotice("");
              if (id === "add") setManage(true);
              else if (id === "settings") navigate("settings");
              else if (id === "restart") setRestart(true);
              else if (id === "remove") setRemove(true);
              else setServer(id.slice("workspace:".length));
            }} />
          </Y.Inline>
        </header>
        {notice && <Y.Text className="studio-workspace-note" variant="help" role="status">{notice}</Y.Text>}
        {workspaceViews.map(item => <section key={item.id} hidden={item.id !== view} aria-label={item.label} className="studio-view" data-view={item.id}>
          {panels[item.id]}
        </section>)}
      </div>
    </Y.SidebarLayout>
    <Y.Dialog title="Search workspace" open={search} onOpenChange={setSearch}>
      <Y.Stack gap={12}>
        <Y.SearchField label="Search people, files and views" value={query} onValueChange={setQuery} />
        <Y.SegmentedControl label="Match type" options={options(...searchKinds)} value={kind} onValueChange={setKind} />
        {matches.length ? <Y.ScrollArea label="Search results" className="studio-search-results">
          <Y.List label="Matching items">{matches.map(item => <Y.ListRow key={item.kind + "/" + item.id} title={item.title} description={item.kind} onActivate={() => {
            if (item.kind === "Agents" || item.kind === "Channels" || item.kind === "Messages") setSelected(item.id);
            if (item.kind === "Files") setFileTarget({ id: item.id });
            navigate(item.view); setSearch(false);
          }} />)}</Y.List></Y.ScrollArea> : <Y.EmptyResult query={query || kind} onClear={() => { setQuery(""); setKind("All"); }} />}
      </Y.Stack>
    </Y.Dialog>
    <Y.Dialog title="Add sample workspace" open={manage} onOpenChange={setManage}>
      <form onSubmit={event => {
        event.preventDefault(); const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        if (name) { setWorkspaces(previous => [...new Set([...previous, name])]); setServer(name); setManage(false); }
      }}><Y.Stack gap={12}><Y.TextField label="Workspace name" name="name" required /><Y.Button type="submit">Add workspace</Y.Button></Y.Stack></form>
    </Y.Dialog>
    <Y.Dialog title={restart ? "Restart sample workspace?" : "Remove sample workspace?"} open={restart || remove} onOpenChange={open => { if (!open) { setRestart(false); setRemove(false); } }}>
      <Y.Stack gap={12}><Y.Text>{restart ? "The sample will return to Conversations." : "This removes the workspace from the example menu."}</Y.Text>
        <Y.ButtonGroup label="Workspace decision"><Y.Button emphasis="soft" onClick={() => { setRestart(false); setRemove(false); }}>Cancel</Y.Button>
          <Y.Button onClick={() => {
            if (restart) { navigate("conversations"); setNotice("Sample restarted."); }
            else { setWorkspaces(previous => previous.filter(name => name !== server)); setServer("Sourdough Studio"); setNotice("Sample workspace removed."); }
            setRestart(false); setRemove(false);
          }}>{restart ? "Restart sample" : "Remove workspace"}</Y.Button>
        </Y.ButtonGroup></Y.Stack>
    </Y.Dialog>
  </Y.Yogurt>;
}
