import { useEffect, useRef, useState } from "react";
import * as Y from "@openboa/yogurt";
import { commands, conversations, options, studioFiles, type Conversation, type Entry } from "./fixtures";

type Panel = "Files" | "Threads" | "Agent settings" | "Pinned messages" | "Members" | "Computer";
type CreateKind = typeof commands[number]["id"];

export function Inbox({ selected, setSelected }: { selected: string; setSelected: (id: string) => void }) {
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
  const results = items.filter(item => (filter === "All" || filter === "Agents" && item.kind === "agent" || filter === "Channels" && item.kind === "channel")
    && (item.name + " " + item.role).toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setThread("");
    setReply("");
    setFile(undefined);
    setPanel(null);
  }, [selected]);

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

  return <Y.SidebarLayout label="Conversation list" width="15rem" compactAt={760} variant="flat" collapse="hide" className="studio-inbox"
    navigation={<Y.SidebarContent label="Conversations">
      <Y.Stack gap={12}>
        <Y.SearchField label="Filter conversations" value={query} onValueChange={setQuery} />
        <Y.Inline><Y.ActionMenu label="Filter" items={options("All", "Agents", "Channels")} onSelect={setFilter} />
          <Y.ActionMenu label="New" items={[...commands]} onSelect={id => setCreate(id as CreateKind)} /></Y.Inline>
      </Y.Stack>
      <Y.SidebarGroup label="Research desk">
        {results.map(item => <Y.SidebarItem key={item.id} label={item.kind === "channel" ? "# " + item.name : item.name}
          active={item.id === current.id} onSelect={() => choose(item.id)}
          icon={item.kind === "agent" ? <Y.AgentAvatar agent={item.art} size={27} state={item.id === current.id && busy[threadKey] ? "working" : "ready"} /> : <Y.Icon name="menu" />} />)}
        {!results.length && <Y.Text variant="help">No matching conversations.</Y.Text>}
      </Y.SidebarGroup>
      {!!folders.length && <Y.SidebarGroup label="Folders">{folders.map(name => <Y.SidebarItem key={name} label={name}
        icon={<Y.Icon name="copy" />} onSelect={() => { setQuery(""); setFilter("All"); }} />)}</Y.SidebarGroup>}
    </Y.SidebarContent>}>
    <Y.Stack gap={16} className="studio-conversation">
      <Y.Inline className="studio-conversation-head">
        <Y.Inline><Y.SidebarTrigger label="Browse conversations" />
          {current.kind === "agent" && <Y.AgentAvatar agent={current.art} size={44} state={busy[threadKey] ? "working" : "ready"} />}
          <Y.Stack gap={2}><Y.Heading level={2}>{thread || current.name}</Y.Heading><Y.Text variant="help">{thread ? current.name : current.role}</Y.Text></Y.Stack>
        </Y.Inline>
        <Y.Inline>
          <Y.IconButton icon="plus" label="New thread" onClick={startThread} />
          <Y.IconButton icon="bookmark" label="Pinned messages" aria-pressed={panel === "Pinned messages"} onClick={() => { setFile(undefined); setPanel(panel === "Pinned messages" ? null : "Pinned messages"); }} />
          <Y.ActionMenu label="Conversation details" items={options("Files", "Threads", "Computer", current.kind === "agent" ? "Agent settings" : "Members")} onSelect={id => { setFile(undefined); setPanel(id as Panel); }} />
        </Y.Inline>
      </Y.Inline>
      <div className="studio-thread-layout" data-panel={Boolean(panel)}>
        <Y.Stack gap={16} className="studio-thread">
          <Y.Transcript label={current.name + " transcript"} revision={messages.length} key={threadKey}>
            {!messages.length && <Y.Text variant="help">Start this thread with a note.</Y.Text>}
            {messages.map(message => <Y.Message key={message.id} speaker={message.author} avatar={message.author === "You" ? undefined : <Y.AgentAvatar agent={current.art} size={24} animated={false} />}>
              <Y.Stack gap={8}>
                <Y.Text>{message.text}</Y.Text>
                {message.id === "kai-start" && <Y.Notice title="Source check needed" tone="warning"
                  action={<Y.Button emphasis="quiet" onClick={() => { setPanel("Files"); setFile(studioFiles[0]); }}>Open morning brief</Y.Button>}>
                  One reading still needs a timestamp.
                </Y.Notice>}
                <Y.Inline>
                  <Y.IconButton size="compact" icon="check" label="Acknowledge message" aria-pressed={!!reactions[message.id]}
                    onClick={() => setReactions(previous => ({ ...previous, [message.id]: !previous[message.id] }))} />
                  <Y.IconButton size="compact" icon="back" label="Reply to message" onClick={() => setReply(message.author)} />
                  <Y.IconButton size="compact" icon="bookmark" label="Pin message" aria-pressed={pinned[current.id]?.includes(message.id) ?? false}
                    onClick={() => setPinned(previous => ({ ...previous, [current.id]: previous[current.id]?.includes(message.id)
                      ? previous[current.id].filter(id => id !== message.id) : [...(previous[current.id] ?? []), message.id] }))} />
                </Y.Inline>
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
        {panel && <Y.Surface className="studio-inspector">
          <Y.Stack gap={12}>
            <Y.Inline className="studio-split"><Y.Heading level={3}>{panel}</Y.Heading><Y.IconButton icon="close" label="Close conversation details" onClick={() => setPanel(null)} /></Y.Inline>
            {panel === "Files" && (file ? <Y.Stack><Y.Button emphasis="quiet" onClick={() => setFile(undefined)}>All conversation files</Y.Button><Y.Text>{file.name}</Y.Text><Y.CodeBlock language="Sample contents" code={file.detail} /></Y.Stack>
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
          </Y.Stack>
        </Y.Surface>}
      </div>
    </Y.Stack>
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
