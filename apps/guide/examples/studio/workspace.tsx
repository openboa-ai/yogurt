import { useEffect, useState, type ReactNode } from "react";
import * as Y from "@openboa/yogurt";
import { commands, conversations, options, studioFiles, workspaceViews, type Conversation, type View } from "./fixtures";
import { Inbox, type GateState } from "./inbox";
import { Schedule, Tasks, Usage, Workflows } from "./operations";
import { Customers, Library } from "./records";
import { Connections, Help, Settings } from "./settings";

const primaryWorkspaceIds: readonly View[] = ["tasks", "workflows", "schedule", "library", "usage"];
const systemViewIds: readonly View[] = ["customers", "extensions", "providers", "settings", "help"];
const searchKinds = ["All", "Agents", "Channels", "Messages", "Files", "Routines"];

export function StudioWorkspace({ appearance, material = "neutral" }: { appearance: "light" | "dark"; material?: Y.Material }) {
  const [trail, setTrail] = useState<{ views: View[]; index: number }>({ views: ["conversations"], index: 0 });
  const view = trail.views[trail.index];
  const [items, setItems] = useState<Conversation[]>(conversations);
  const [selected, setSelected] = useState("kai");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [gateState, setGateState] = useState<GateState>("pending");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [conversationToolbar, setConversationToolbar] = useState<HTMLDivElement | null>(null);
  const [files, setFiles] = useState(studioFiles);
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
  const [createOpen, setCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<typeof commands[number]["id"]>("agent");

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

  function selectConversation(id: string) {
    setSelected(id);
    navigate("conversations");
  }

  function gazeFor(id: string): Y.GazeState {
    if (Object.entries(busy).some(([key, pending]) => pending && key.startsWith(id + "/"))) return "working";
    if (id === "kai") return gateState === "approved" ? "done" : "waiting";
    if (id === "sol") return "working";
    return "ready";
  }

  function statusFor(item: Conversation): { label: string; tone: "warning" | "brand" | "success" | "neutral" } {
    const gaze = gazeFor(item.id);
    if (gaze === "waiting") return { label: gateState === "held" ? "Held" : "Review gate", tone: "warning" };
    if (gaze === "working") return { label: "Working", tone: "brand" };
    if (gaze === "done") return { label: "Approved", tone: "success" };
    return { label: "Ready", tone: "neutral" };
  }

  function saveNewConversation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) return;
    if (createKind === "folder") {
      setNotice(`Folder "${name}" created.`);
    } else {
      const next: Conversation = {
        id: crypto.randomUUID(),
        name,
        role: createKind === "agent" ? "Studio agent" : "Channel",
        topic: createKind === "agent" ? "New session" : "Team thread",
        time: "Now",
        summary: createKind === "agent" ? "I’m ready to review a sample with you." : "This conversation is ready for the team.",
        kind: createKind,
        art: "Sol",
      };
      setItems(previous => [...previous, next]);
      selectConversation(next.id);
      setSidebarQuery("");
    }
    setCreateOpen(false);
  }

  const baseSearchItems = [
    ...workspaceViews.map(item => ({ id: item.id, title: item.label, kind: "Views", view: item.id })),
    ...items.map(item => ({ id: item.id, title: item.name, kind: item.kind === "agent" ? "Agents" : "Channels", view: "conversations" as const })),
    ...items.map(item => ({ id: item.id, title: item.summary, kind: "Messages", view: "conversations" as const })),
    { id: "morning-routine", title: "Morning source review", kind: "Routines", view: "schedule" as const },
  ];
  const fileSearchItems = files.map(item => ({ id: item.id, title: item.name, kind: "Files", view: "library" as const }));
  const matches = [...baseSearchItems, ...fileSearchItems].filter(
    item => (kind === "All" || item.kind === kind) && item.title.toLowerCase().includes(query.toLowerCase()),
  );

  const filterTerm = sidebarQuery.trim().toLowerCase();
  const visibleBots = items.filter(
    item => item.kind === "agent" && (!filterTerm || (item.name + " " + item.topic + " " + item.role).toLowerCase().includes(filterTerm)),
  );
  const visibleChannels = items.filter(
    item => item.kind === "channel" && (!filterTerm || (item.name + " " + item.topic).toLowerCase().includes(filterTerm)),
  );

  const workspaceMenuItems = [
    { id: "previous", label: "Previous view", disabled: trail.index === 0 },
    { id: "next", label: "Next view", disabled: trail.index >= trail.views.length - 1 },
    ...workspaces.map(name => ({ id: "workspace:" + name, label: name })),
    { id: "add", label: "Add sample workspace" },
    { id: "settings", label: "Workspace settings" },
    { id: "restart", label: "Restart sample" },
    { id: "remove", label: "Remove sample workspace", disabled: server === "Sourdough Studio" },
  ];

  function handleWorkspaceMenu(id: string) {
    setNotice("");
    if (id === "previous") setTrail(previous => ({ ...previous, index: Math.max(0, previous.index - 1) }));
    else if (id === "next") setTrail(previous => ({ ...previous, index: Math.min(previous.views.length - 1, previous.index + 1) }));
    else if (id === "add") setManage(true);
    else if (id === "settings") navigate("settings");
    else if (id === "restart") setRestart(true);
    else if (id === "remove") setRemove(true);
    else if (id.startsWith("workspace:")) setServer(id.slice("workspace:".length));
  }

  const panels: Record<View, ReactNode> = {
    conversations: (
      <Inbox
        items={items}
        setItems={setItems}
        selected={selected}
        active={view === "conversations"}
        toolbarTarget={conversationToolbar}
        gateState={gateState}
        setGateState={setGateState}
        busy={busy}
        setBusy={setBusy}
        gazeFor={gazeFor}
        onOpenLibrary={() => navigate("library")}
      />
    ),
    tasks: <Tasks />,
    workflows: <Workflows />,
    schedule: <Schedule />,
    library: <Library files={files} target={fileTarget} onRemove={ids => setFiles(previous => previous.filter(item => !ids.includes(item.id)))} />,
    usage: <Usage />,
    customers: <Customers />,
    extensions: <Connections />,
    providers: <Connections providers />,
    settings: <Settings onAppearance={setScheme} />,
    help: <Help />,
  };

  return (
    <Y.Yogurt appearance={scheme ?? appearance} material={material} className="studio-demo">
      <Y.SidebarLayout
        label="Studio navigation"
        width="16.75rem"
        compactAt={860}
        variant="flat"
        collapse="hide"
        navigation={
          <>
            <Y.SidebarHeader>
              <Y.Inline justify="between" align="center" gap={8} wrap={false} className="studio-brand-bar">
                <Y.Inline gap={8} align="center" wrap={false}>
                  <Y.ProjectMark project="sourdough" size={26} label="" />
                  <Y.Text className="studio-brand-title">{server === "Sourdough Studio" ? "Sourdough" : server}</Y.Text>
                </Y.Inline>
                <span data-sidebar-dismiss="">
                  <Y.IconButton
                    size="compact"
                    emphasis="soft"
                    icon="plus"
                    label="New agent or channel"
                    onClick={() => {
                      setCreateKind("agent");
                      setCreateOpen(true);
                    }}
                  />
                </span>
              </Y.Inline>
            </Y.SidebarHeader>
            <div className="studio-sidebar-search">
              <Y.Inline gap={6} wrap={false} className="studio-search-row">
                <Y.SearchField
                  label="Filter bots or runs"
                  hiddenLabel
                  placeholder="Filter bots or runs..."
                  size="compact"
                  value={sidebarQuery}
                  onValueChange={setSidebarQuery}
                />
                <span data-sidebar-dismiss="">
                  <Y.Button emphasis="soft" size="compact" className="studio-kbd-trigger" aria-label="Search" onClick={() => setSearch(true)}>
                    ⌘K
                  </Y.Button>
                </span>
              </Y.Inline>
            </div>
            <Y.SidebarContent label="Studio sections">
              <Y.SidebarGroup label="Bot roster">
                <div className="studio-bot-list">
                  {visibleBots.map(bot => {
                    const gaze = gazeFor(bot.id);
                    const status = statusFor(bot);
                    const isCurrent = view === "conversations" && selected === bot.id;
                    return (
                      <Y.AgentRow
                        key={bot.id}
                        current={isCurrent}
                        onSelect={() => selectConversation(bot.id)}
                        agent={{
                          id: bot.id,
                          name: bot.name,
                          state: gaze,
                          time: bot.time,
                          preview: bot.topic,
                          avatar: (
                            <span className="studio-bot-avatar">
                              <Y.AgentAvatar agent={bot.art} color={bot.color} size={32} state={gaze} label="" />
                              <span className="studio-bot-presence" data-tone={status.tone} aria-hidden="true" />
                            </span>
                          ),
                        }}
                      />
                    );
                  })}
                  {!visibleBots.length && <Y.Text variant="help" className="studio-empty-filter">No matching bots.</Y.Text>}
                </div>
              </Y.SidebarGroup>

              <Y.SidebarGroup label="Workspace">
                {workspaceViews
                  .filter(item => primaryWorkspaceIds.includes(item.id))
                  .map(item => (
                    <Y.SidebarItem
                      key={item.id}
                      label={item.label}
                      icon={<Y.Icon name={item.icon} />}
                      active={view === item.id}
                      badge={"count" in item && item.count ? <span className="studio-nav-count" aria-hidden="true">{item.count}</span> : undefined}
                      onSelect={() => navigate(item.id)}
                    />
                  ))}
              </Y.SidebarGroup>

              {!!visibleChannels.length && (
                <Y.SidebarGroup label="Channels">
                  {visibleChannels.map(channel => (
                    <Y.SidebarItem
                      key={channel.id}
                      label={"# " + channel.name}
                      icon={<Y.Icon name="chat" />}
                      active={view === "conversations" && selected === channel.id}
                      onSelect={() => selectConversation(channel.id)}
                    />
                  ))}
                </Y.SidebarGroup>
              )}

              <Y.SidebarGroup label="System">
                {workspaceViews
                  .filter(item => systemViewIds.includes(item.id))
                  .map(item => (
                    <Y.SidebarItem
                      key={item.id}
                      label={item.label}
                      icon={<Y.Icon name={item.icon} />}
                      active={view === item.id}
                      onSelect={() => navigate(item.id)}
                    />
                  ))}
              </Y.SidebarGroup>
            </Y.SidebarContent>
            <Y.SidebarFooter>
              <Y.Inline justify="between" align="center" gap={8} className="studio-rail-footer">
                <Y.Text className="studio-rail-user">Mina Park</Y.Text>
                <Y.Badge tone="success">Online</Y.Badge>
              </Y.Inline>
            </Y.SidebarFooter>
          </>
        }
      >
        <div className="studio-main">
          <header className="studio-toolbar" data-conversation={view === "conversations"}>
            <Y.Inline className="studio-toolbar-lead" gap={6} wrap={false}>
              <span className="studio-sidebar-toggle-slot">
                <Y.SidebarTrigger size="compact" label="Browse workspace" />
              </span>
              {view === "conversations" ? (
                <div className="studio-conversation-slot" ref={setConversationToolbar} />
              ) : (
                <>
                  <Y.Heading level={2} className="studio-view-title">
                    {workspaceViews.find(item => item.id === view)?.label}
                  </Y.Heading>
                  <Y.Inline className="studio-workspace-menu" gap={6}>
                    <Y.Button emphasis="quiet" size="compact" onClick={() => navigate("conversations")}>
                      Back to Kai
                    </Y.Button>
                    <Y.ActionMenu label="Workspace menu" triggerText="Workspace" triggerSize="compact" items={workspaceMenuItems} onSelect={handleWorkspaceMenu} />
                  </Y.Inline>
                </>
              )}
            </Y.Inline>
          </header>
          {notice && <Y.Text className="studio-workspace-note" variant="help" role="status">{notice}</Y.Text>}
          {workspaceViews.map(item => (
            <section key={item.id} hidden={item.id !== view} aria-label={item.label} className="studio-view" data-view={item.id}>
              {panels[item.id]}
            </section>
          ))}
        </div>
      </Y.SidebarLayout>

      <Y.Dialog title="Search workspace" open={search} onOpenChange={setSearch}>
        <Y.Stack gap={12}>
          <Y.SearchField label="Search people, files and views" value={query} onValueChange={setQuery} />
          <Y.SegmentedControl label="Match type" options={options(...searchKinds)} value={kind} onValueChange={setKind} />
          {matches.length ? (
            <Y.ScrollArea label="Search results" className="studio-search-results">
              <Y.List label="Matching items">
                {matches.map(item => (
                  <Y.ListRow
                    key={item.kind + "/" + item.id}
                    title={item.title}
                    description={item.kind}
                    onActivate={() => {
                      if (item.kind === "Agents" || item.kind === "Channels" || item.kind === "Messages") setSelected(item.id);
                      if (item.kind === "Files") setFileTarget({ id: item.id });
                      navigate(item.view);
                      setSearch(false);
                    }}
                  />
                ))}
              </Y.List>
            </Y.ScrollArea>
          ) : (
            <Y.EmptyResult query={query || kind} onClear={() => { setQuery(""); setKind("All"); }} />
          )}
        </Y.Stack>
      </Y.Dialog>

      <Y.Dialog title="New conversation" open={createOpen} onOpenChange={setCreateOpen}>
        <form onSubmit={saveNewConversation}>
          <Y.Stack gap={12}>
            <Y.SegmentedControl
              label="Kind"
              value={createKind}
              onValueChange={next => setCreateKind(next as typeof commands[number]["id"])}
              options={[
                { id: "agent", label: "Agent" },
                { id: "channel", label: "Channel" },
                { id: "folder", label: "Folder" },
              ]}
            />
            <Y.TextField label="Name" name="name" required />
            <Y.Button type="submit" tone="brand">Create {createKind}</Y.Button>
          </Y.Stack>
        </form>
      </Y.Dialog>

      <Y.Dialog title="Add sample workspace" open={manage} onOpenChange={setManage}>
        <form
          onSubmit={event => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
            if (name) {
              setWorkspaces(previous => [...new Set([...previous, name])]);
              setServer(name);
              setManage(false);
            }
          }}
        >
          <Y.Stack gap={12}>
            <Y.TextField label="Workspace name" name="name" required />
            <Y.Button type="submit" tone="brand">Add workspace</Y.Button>
          </Y.Stack>
        </form>
      </Y.Dialog>

      <Y.Dialog
        title={restart ? "Restart sample workspace?" : "Remove sample workspace?"}
        open={restart || remove}
        onOpenChange={open => {
          if (!open) {
            setRestart(false);
            setRemove(false);
          }
        }}
      >
        <Y.Stack gap={12}>
          <Y.Text>{restart ? "The sample will return to Conversations." : "This removes the workspace from the example menu."}</Y.Text>
          <Y.ButtonGroup label="Workspace decision">
            <Y.Button emphasis="soft" onClick={() => { setRestart(false); setRemove(false); }}>Cancel</Y.Button>
            <Y.Button
              tone="brand"
              onClick={() => {
                if (restart) {
                  navigate("conversations");
                  setNotice("Sample restarted.");
                } else {
                  setWorkspaces(previous => previous.filter(name => name !== server));
                  setServer("Sourdough Studio");
                  setNotice("Sample workspace removed.");
                }
                setRestart(false);
                setRemove(false);
              }}
            >
              {restart ? "Restart sample" : "Remove workspace"}
            </Y.Button>
          </Y.ButtonGroup>
        </Y.Stack>
      </Y.Dialog>
    </Y.Yogurt>
  );
}
