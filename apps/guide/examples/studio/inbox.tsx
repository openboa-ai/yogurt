import { useEffect, useRef, useState } from "react";
import * as Y from "@openboa/yogurt";
import { commands, conversations, options, studioFiles, type Conversation, type Entry } from "./fixtures";

type Panel = "Files" | "Threads" | "Agent settings" | "Pinned messages" | "Members" | "Computer";
type CreateKind = typeof commands[number]["id"];

export function Inbox({ selected, setSelected, active }: { selected: string; setSelected: (id: string) => void; active: boolean }) {
  const [items, setItems] = useState(conversations);
  const [folders, setFolders] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [threads, setThreads] = useState<Record<string, string[]>>({});
  const [thread, setThread] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pinned, setPinned] = useState<Record<string, string[]>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [panel, setPanel] = useState<Panel | null>(null);
  const [inspectorInline, setInspectorInline] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  function openPanel(next: Panel, source?: HTMLElement) {
    opener.current = source ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPanel(next);
  }
  function closePanel() {
    setPanel(null);
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    });
  }
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setInspectorInline(entry.contentRect.width >= 720);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const [file, setFile] = useState<typeof studioFiles[number]>();
  const [attachments, setAttachments] = useState<Record<string, string[]>>({});
  const [attach, setAttach] = useState(false);
  const [voice, setVoice] = useState<Y.VoiceState>();
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [model, setModel] = useState<Record<string, string>>({});
  const [create, setCreate] = useState<CreateKind>();
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(timer => window.clearTimeout(timer));
  }, []);

  const current = items.find(item => item.id === selected) ?? items[0];
  const threadKey = current.id + "/" + thread;
  const opening = [
    ...(current.id === "kai" ? [{ id: "kai-request", author: "You", text: "What needs a second look before we share the morning brief?" }] : []),
    { id: current.id + "-start", author: current.kind === "agent" ? current.name : "Kai", text: current.summary },
  ];
  const channelMembers = members[current.id] ?? ["kai"];
  const messages = [...(!thread ? opening : []), ...(entries[threadKey] ?? [])];
  const lastEntry = (id: string) => entries[id + "/"]?.at(-1)?.text;
  const results = items.filter(item => (filter === "All" || filter === "Agents" && item.kind === "agent" || filter === "Channels" && item.kind === "channel")
    && (item.name + " " + item.role).toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setThread("");
    setReply("");
    setFile(undefined);
    setPanel(null);
  }, [selected]);

  function gazeFor(id: string) {
    if (Object.entries(busy).some(([key, pending]) => pending && key.startsWith(id + "/"))) return "working";
    if (id === "kai") return "waiting";
    if (id === "sol") return "done";
    return "ready";
  }

  function choose(id: string) {
    setSelected(id);
    setThread("");
    setReply("");
    setFile(undefined);
  }

  function append(key: string, author: string, text: string) {
    const message = { id: crypto.randomUUID(), author, text };
    setEntries(previous => ({ ...previous, [key]: [...(previous[key] ?? []), message] }));
  }

  function send(text: string, fileIds: string[] = []) {
    if (timers.current[threadKey]) return;
    const names = studioFiles.filter(item => fileIds.includes(item.id)).map(item => item.name);
    const content = [text, names.length ? "Attached: " + names.join(", ") : ""].filter(Boolean).join(" · ");
    append(threadKey, "You", reply ? content + " (in reply to " + reply + ")" : content);
    setAttachments(previous => ({ ...previous, [threadKey]: [] }));
    setReply("");
    setDrafts(previous => ({ ...previous, [threadKey]: "" }));
    setBusy(previous => ({ ...previous, [threadKey]: true }));
    timers.current[threadKey] = window.setTimeout(() => {
      append(threadKey, current.kind === "agent" ? current.name : "Kai", "I added your note to the sample review. The source brief is available under Files.");
      delete timers.current[threadKey];
      setBusy(previous => ({ ...previous, [threadKey]: false }));
    }, 780);
  }

  function startThread() {
    const name = "Thread " + ((threads[current.id]?.length ?? 0) + 1);
    setThreads(previous => ({ ...previous, [current.id]: [...(previous[current.id] ?? []), name] }));
    setThread(name);
    setReply("");
  }

  function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name || !create) return;
    if (create === "folder") setFolders(previous => [...new Set([...previous, name])]);
    else {
      const item: Conversation = { id: crypto.randomUUID(), name, role: create === "agent" ? "Studio agent" : "Channel",
        summary: create === "agent" ? "I’m ready to review a sample with you." : "This conversation is ready for the team.", kind: create, art: "Sol" };
      setItems(previous => [...previous, item]);
      choose(item.id);
      setQuery("");
      setFilter("All");
    }
    setCreate(undefined);
  }

  function inspectorContents() {
    return <Y.Stack gap={12}>
      {panel === "Files" && (file ? <Y.Stack gap={12}>
        <Y.Inline><Y.Button emphasis="quiet" size="compact" onClick={() => setFile(undefined)}><Y.Icon name="back" /> All conversation files</Y.Button></Y.Inline>
        <Y.Heading level={4}>{file.name}</Y.Heading>
        {file.kind === "Document" ? <Y.Text>{file.detail}</Y.Text> : <Y.CodeBlock language={file.kind === "Spreadsheet" ? "CSV" : "Sample code"} code={file.detail} />}
      </Y.Stack>
        : <Y.List label="Conversation files">{studioFiles.filter(item => item.owner === current.name || current.kind === "channel").map(item => <Y.ListRow key={item.id} title={item.name} description={item.kind} onActivate={() => setFile(item)} />)}</Y.List>)}
      {panel === "Threads" && <Y.List label="Threads"><Y.ListRow title="Main conversation" onActivate={() => setThread("")} />
        {(threads[current.id] ?? []).map(name => <Y.ListRow key={name} title={name} onActivate={() => setThread(name)} />)}</Y.List>}
      {panel === "Pinned messages" && <Y.Stack>
        {[...opening, ...Object.entries(entries).filter(([key]) => key.startsWith(current.id + "/")).flatMap(([, value]) => value)]
          .filter(item => pinned[current.id]?.includes(item.id)).map(item => <Y.Text key={item.id}>{item.text}</Y.Text>)}
        {!pinned[current.id]?.length && <Y.Text variant="help">No messages pinned.</Y.Text>}
      </Y.Stack>}
      {panel === "Computer" && <Y.RuntimePanel title="Review inspector" state="available" detail="Sample environment"
        preview={<Y.RecordFacts title="Morning brief" source="Research register" asOf="2026-11-21" timeLabel="Nov 21" facts={[
          { id: "coverage", label: "Reviewed", value: "3 of 4 readings" }, { id: "next", label: "Next step", value: "Confirm timestamp" },
        ]} />} />}
      {panel === "Members" && <Y.List label="Channel members">
        {items.filter(item => item.kind === "agent").map(item => <Y.ListRow key={item.id} title={item.name}
          trailing={<Y.Button emphasis="quiet" onClick={() => setMembers(previous => ({ ...previous, [current.id]: channelMembers.includes(item.id) ? channelMembers.filter(id => id !== item.id) : [...channelMembers, item.id] }))}>{channelMembers.includes(item.id) ? "Remove" : "Invite"}</Y.Button>} />)}
      </Y.List>}
      {panel === "Agent settings" && <Y.Stack key={current.id}>
        <Y.TextField label="Display name" value={current.name} onChange={event => setItems(previous => previous.map(item => item.id === current.id ? { ...item, name: event.target.value } : item))} />
        <Y.TextField label="Role" value={current.role} onChange={event => setItems(previous => previous.map(item => item.id === current.id ? { ...item, role: event.target.value } : item))} />
        <Y.Select label="Model" value={model[current.id] ?? "Studio Standard"} options={options("Studio Standard", "Studio Fast")} onChange={event => setModel(previous => ({ ...previous, [current.id]: event.target.value }))} />
        <Y.Select label="Backup model" options={options("Ask first", "Studio Fast")} />
        <Y.Textarea label="Instructions" defaultValue="Ground conclusions in available evidence." />
        <Y.Switch label="Remember review preferences" />
      </Y.Stack>}
    </Y.Stack>;
  }

  return <Y.SidebarLayout label="Conversation list" width="14.5rem" compactAt={760} variant="flat" collapse="hide" className="studio-inbox"
    navigation={<Y.SidebarContent label="Conversations">
      <Y.Stack gap={12}>
        <Y.SearchField label="Filter conversations" value={query} onValueChange={setQuery} />
        <Y.Inline><Y.ActionMenu label="Filter" items={options("All", "Agents", "Channels")} onSelect={setFilter} />
          <Y.ActionMenu label="New" items={[...commands]} onSelect={id => setCreate(id as CreateKind)} /></Y.Inline>
      </Y.Stack>
      {(["agent", "channel"] as const).map(group => {
        const rows = results.filter(item => item.kind === group);
        if (!rows.length) return null;
        return <Y.SidebarGroup key={group} label={group === "agent" ? "Agents" : "Channels"}>
          {rows.map(item => {
            const gaze = gazeFor(item.id);
            const preview = lastEntry(item.id) ?? item.summary;
            const description = gaze === "working" ? "Preparing a reply" : gaze === "waiting" ? "Needs review · " + preview : preview;
            return <Y.SidebarItem key={item.id} label={item.kind === "channel" ? "# " + item.name : item.name}
              description={description} active={item.id === current.id} onSelect={() => choose(item.id)}
              badge={gaze === "waiting" ? <span className="studio-attention-dot" role="img" aria-label="Needs review" /> : undefined}
              icon={item.kind === "agent" ? <Y.AgentAvatar agent={item.art} size={32} state={gaze} /> : <Y.Icon name="chat" />} />;
          })}
        </Y.SidebarGroup>;
      })}
      {!results.length && <Y.Text variant="help">No matching conversations.</Y.Text>}
      {!!folders.length && <Y.SidebarGroup label="Folders">{folders.map(name => <Y.SidebarItem key={name} label={name}
        icon={<Y.Icon name="copy" />} onSelect={() => { setQuery(""); setFilter("All"); }} />)}</Y.SidebarGroup>}
    </Y.SidebarContent>}>
    <div className="studio-conversation" ref={frame}>
      <Y.Inline className="studio-conversation-head">
        <Y.Inline><Y.SidebarTrigger label="Browse conversations" />
          {current.kind === "agent" && <Y.AgentAvatar agent={current.art} size={44} state={gazeFor(current.id)} />}
          <Y.Stack gap={2}><Y.Heading level={2}>{thread || current.name}</Y.Heading><Y.Text variant="help">{thread ? current.name : current.role}</Y.Text></Y.Stack>
        </Y.Inline>
        <Y.Inline>
          <Y.IconButton icon="plus" label="New thread" onClick={startThread} />
          <Y.IconButton icon="bookmark" label="Pinned messages" aria-pressed={panel === "Pinned messages"} onClick={event => { setFile(undefined); if (panel === "Pinned messages") closePanel(); else openPanel("Pinned messages", event.currentTarget); }} />
          <Y.ActionMenu label="Conversation details" triggerText="Details" items={options("Files", "Threads", "Computer", current.kind === "agent" ? "Agent settings" : "Members")} onSelect={id => { setFile(undefined); openPanel(id as Panel); }} />
        </Y.Inline>
      </Y.Inline>
      <div className="studio-thread-layout" data-panel={Boolean(panel) && inspectorInline}>
        <Y.Stack gap={12} className="studio-thread">
          <Y.Transcript label={current.name + " transcript"} revision={messages.length} readingAnchor="when-away" key={threadKey}>
            {!messages.length && <Y.Text variant="help">Start this thread with a note.</Y.Text>}
            {messages.map(message => <Y.Message key={message.id} speaker={message.author}
              variant={message.author === "You" ? "sent" : "received"}
              avatar={message.author === "You" ? undefined : <Y.AgentAvatar agent={current.art} size={24} animated={false} />}
              actions={<Y.Inline gap={2}>
                <Y.IconButton size="compact" icon="check" label="Acknowledge message" aria-pressed={!!reactions[message.id]}
                  onClick={() => setReactions(previous => ({ ...previous, [message.id]: !previous[message.id] }))} />
                <Y.IconButton size="compact" icon="back" label="Reply to message" onClick={() => setReply(message.author)} />
                <Y.IconButton size="compact" icon="bookmark" label="Pin message" aria-pressed={pinned[current.id]?.includes(message.id) ?? false}
                  onClick={() => setPinned(previous => ({ ...previous, [current.id]: previous[current.id]?.includes(message.id)
                    ? previous[current.id].filter(id => id !== message.id) : [...(previous[current.id] ?? []), message.id] }))} />
              </Y.Inline>}>
              <Y.Stack gap={8}>
                <Y.Text>{message.text}</Y.Text>
                {message.id === "kai-start" && <Y.Surface className="studio-evidence">
                  <Y.Inline className="studio-split"><Y.Status tone="warning">Source check needed</Y.Status><Y.Text variant="meta">3 of 4 reviewed</Y.Text></Y.Inline>
                  <Y.Text variant="help">The last reading needs a timestamp.</Y.Text>
                  <Y.Inline><Y.Button emphasis="quiet" size="compact" onClick={event => { openPanel("Files", event.currentTarget); setFile(studioFiles[0]); }}>Open morning brief <Y.Icon name="arrow" /></Y.Button></Y.Inline>
                </Y.Surface>}
              </Y.Stack>
            </Y.Message>)}
            {busy[threadKey] && <Y.Text variant="help" role="status">{current.name} is preparing a sample reply.</Y.Text>}
          </Y.Transcript>
          {reply && <Y.Inline><Y.Text variant="help">Replying to {reply}</Y.Text><Y.IconButton icon="close" label="Cancel reply" onClick={() => setReply("")} /></Y.Inline>}
          <Y.Composer label={"Message " + (thread || current.name)} value={drafts[threadKey] ?? ""} onValueChange={value => setDrafts(previous => ({ ...previous, [threadKey]: value }))}
            pending={!!busy[threadKey]} onSend={message => send(message.text, message.attachmentIds)}
            mentionPeople={items.filter(item => item.kind === "agent").map(item => ({ id: item.id, label: item.name }))}
            attachments={studioFiles.filter(item => attachments[threadKey]?.includes(item.id)).map(item => ({ id: item.id, name: item.name, detail: "Sample file" }))}
            onAddAttachment={() => setAttach(true)}
            onRemoveAttachment={id => setAttachments(previous => ({ ...previous, [threadKey]: previous[threadKey].filter(item => item !== id) }))}
            tools={options("Review sample sources", "Voice note")} onTool={tool => {
              if (tool === "Voice note") setVoice("idle");
              else setDrafts(previous => ({ ...previous, [threadKey]: "Review the sample sources in the morning brief." }));
            }} onStop={() => {
              window.clearTimeout(timers.current[threadKey]); delete timers.current[threadKey];
              setBusy(previous => ({ ...previous, [threadKey]: false }));
            }} />
        </Y.Stack>
        <div className="studio-inspector-track">
          {panel && (inspectorInline ? <aside className="studio-inspector" aria-label="Conversation inspector">
            <Y.Inline className="studio-inspector-heading"><Y.Heading level={3}>{panel}</Y.Heading><Y.IconButton icon="close" label="Close conversation details" onClick={closePanel} /></Y.Inline>
            {inspectorContents()}
          </aside> : active && <Y.Sheet title={panel} open onOpenChange={open => { if (!open) closePanel(); }}>{inspectorContents()}</Y.Sheet>)}
        </div>
      </div>
    </div>
    <Y.Dialog title="Attach a sample file" open={attach} onOpenChange={setAttach}>
      <Y.List label="Available attachments">{studioFiles.map(item => <Y.ListRow key={item.id} title={item.name} description={item.kind}
        onActivate={() => { setAttachments(previous => ({ ...previous, [threadKey]: [...new Set([...(previous[threadKey] ?? []), item.id])] })); setAttach(false); }} />)}</Y.List>
    </Y.Dialog>
    <Y.Dialog title="Voice note preview" open={!!voice} onOpenChange={open => { if (!open) setVoice(undefined); }}>
      {voice && <Y.Stack gap={12}><Y.Text variant="help">Uses a prerecorded sample transcript.</Y.Text>
        <Y.VoiceControl state={voice} onStart={() => setVoice("recording")} onStop={() => setVoice("review")}
          preview={<Y.Text>Review the source date before sharing the brief.</Y.Text>} onDiscard={() => setVoice(undefined)}
          onSend={() => { setVoice(undefined); setDrafts(previous => ({ ...previous, [threadKey]: "Review the source date before sharing the brief." })); }} />
      </Y.Stack>}
    </Y.Dialog>
    <Y.Dialog title={commands.find(item => item.id === create)?.label ?? "New conversation"} open={!!create} onOpenChange={open => { if (!open) setCreate(undefined); }}>
      {create && <form key={create} onSubmit={saveEntry}><Y.Stack gap={12}><Y.TextField label="Name" name="name" required /><Y.Button type="submit">Create {create}</Y.Button></Y.Stack></form>}
    </Y.Dialog>
  </Y.SidebarLayout>;
}
