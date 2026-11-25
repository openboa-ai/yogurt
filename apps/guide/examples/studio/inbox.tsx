import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as Y from "@openboa/yogurt";
import { options, studioFiles, type Conversation, type Entry } from "./fixtures";

export type GateState = "pending" | "held" | "approved";
type Panel = "Context" | "Files" | "Threads" | "Agent settings" | "Pinned messages" | "Members" | "Computer";
type StreamTab = "Stream" | "Trace" | "Diff";

const kaiTraceEvents: Y.TraceEvent[] = [
  {
    id: "fetch-register",
    index: "01",
    title: "Fetch research register",
    latency: "120ms",
    state: "complete",
    detail: "Loaded 4 observations for Nov 24 morning brief from shared research register.",
  },
  {
    id: "reconcile-readings",
    index: "02",
    title: "Reconcile morning readings",
    latency: "210ms",
    state: "complete",
    detail: "REG-01, REG-02 and REG-03 align within 0.4% variance across primary sensors.",
  },
  {
    id: "verify-timestamp",
    index: "03",
    title: "Verify source timestamp · REG-04",
    latency: "84ms",
    state: "flagged",
    detail: "REG-04 is missing a verified collection timestamp. Gate held pending operator review.",
  },
];

const briefDiffSample = `--- a/Morning brief.md
+++ b/Morning brief.md
@@ -12,4 +12,4 @@
 REG-01  2026-11-24T07:50Z  verified
 REG-02  2026-11-24T07:58Z  verified
 REG-03  2026-11-24T08:04Z  verified
-REG-04  pending timestamp  needs-attention
+REG-04  2026-11-24T08:15Z  verified`;

const attachedSources = [
  { id: "REG-01", fileId: "brief", name: "Morning brief.md", state: "Verified", tone: "success" as const },
  { id: "REG-02", fileId: "log", name: "Observation log.csv", state: "Verified", tone: "success" as const },
  { id: "REG-03", fileId: "guide", name: "Release checklist.md", state: "Verified", tone: "success" as const },
  { id: "REG-04", fileId: "script", name: "Field sensor reading", state: "Flagged", tone: "warning" as const },
];

export function Inbox({
  items,
  setItems,
  selected,
  active,
  toolbarTarget,
  gateState,
  setGateState,
  busy,
  setBusy,
  gazeFor,
  onOpenLibrary,
}: {
  items: Conversation[];
  setItems: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selected: string;
  active: boolean;
  toolbarTarget: HTMLDivElement | null;
  gateState: GateState;
  setGateState: React.Dispatch<React.SetStateAction<GateState>>;
  busy: Record<string, boolean>;
  setBusy: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  gazeFor: (id: string) => Y.GazeState;
  onOpenLibrary: () => void;
}) {
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [threads, setThreads] = useState<Record<string, string[]>>({});
  const [thread, setThread] = useState("");
  const [streamTab, setStreamTab] = useState<StreamTab>("Stream");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pinned, setPinned] = useState<Record<string, string[]>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [reply, setReply] = useState("");
  const [panel, setPanel] = useState<Panel | null>(() =>
    typeof window !== "undefined" && window.innerWidth < 1120 ? null : "Context",
  );
  const [inspectorInline, setInspectorInline] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1120,
  );
  const frame = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const initializedInline = useRef(false);

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

  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return;
    function sync(w: number) {
      if (w > 0) {
        const inline = w >= 860;
        setInspectorInline(inline);
        if (!initializedInline.current) {
          initializedInline.current = true;
          if (!inline) setPanel(null);
        }
      }
    }
    sync(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => sync(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const [file, setFile] = useState<typeof studioFiles[number]>();
  const [attachments, setAttachments] = useState<Record<string, string[]>>({});
  const [attach, setAttach] = useState(false);
  const [voice, setVoice] = useState<Y.VoiceState>();
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [model, setModel] = useState<Record<string, string>>({});
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(timer => window.clearTimeout(timer));
  }, []);

  const current = items.find(item => item.id === selected) ?? items[0];
  const isKai = current.id === "kai";
  const isSol = current.id === "sol";
  const isNoa = current.id === "noa";

  const runMeta = isKai
    ? {
        id: "RUN-409",
        latency: "414ms",
        tokens: "14.2k / 32k",
        gate: gateState === "approved" ? "Approved" : gateState === "held" ? "Held REG-04" : "Source review",
        badgeTone: (gateState === "approved" ? "success" : gateState === "held" ? "warning" : "brand") as Y.Tone,
        badgeLabel: gateState === "approved" ? "Approved" : gateState === "held" ? "Held" : "Review gate",
        chips: [{ id: "doc", label: "Morning brief.md", tone: "brand" as const }],
      }
    : isSol
      ? {
          id: "RUN-408",
          latency: "268ms",
          tokens: "8.6k / 32k",
          gate: "Active check",
          badgeTone: "brand" as Y.Tone,
          badgeLabel: "Working",
          chips: [{ id: "doc", label: "Observation log.csv", tone: "brand" as const }],
        }
      : isNoa
        ? {
            id: "RUN-405",
            latency: "190ms",
            tokens: "5.4k / 32k",
            gate: "Ready",
            badgeTone: "success" as Y.Tone,
            badgeLabel: "Ready",
            chips: [{ id: "doc", label: "Release checklist.md", tone: "brand" as const }],
          }
        : {
            id: "CH-" + current.id.slice(0, 3).toUpperCase(),
            latency: "185ms",
            tokens: "4.1k / 32k",
            gate: "Channel",
            badgeTone: "neutral" as Y.Tone,
            badgeLabel: "Active",
            chips: [{ id: "channel", label: "# " + current.name }],
          };

  const threadKey = current.id + "/" + thread;
  const opening = [
    ...(current.id === "kai"
      ? [{ id: "kai-request", author: "You", text: "What needs a second look before we share the morning brief?" }]
      : []),
    { id: current.id + "-start", author: current.kind === "agent" ? current.name : "Kai", text: current.summary },
  ];
  const channelMembers = members[current.id] ?? ["kai", "sol"];
  const messages = [...(!thread ? opening : []), ...(entries[threadKey] ?? [])];

  useEffect(() => {
    setThread("");
    setReply("");
    setFile(undefined);
    setStreamTab("Stream");
  }, [selected]);

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
      append(
        threadKey,
        current.kind === "agent" ? current.name : "Kai",
        "I added your note to the sample review. The source brief is available under Files.",
      );
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

  const contextTitle = current.kind === "agent" ? `${current.name}’s computer` : "Channel context";
  const panelTitle = panel === "Context" ? contextTitle : panel ?? "";

  function inspectorContents() {
    return (
      <div className="studio-inspector-body">
        {panel === "Context" && (
          <div className="studio-computer-pane">
            <Y.Stack gap={16}>
              <div className="studio-telemetry-card">
                <dl className="studio-kv-list">
                  <div>
                    <dt>Run</dt>
                    <dd className="studio-mono">{runMeta.id}</dd>
                  </div>
                  <div>
                    <dt>Model</dt>
                    <dd>{model[current.id] ?? "Studio Standard"}</dd>
                  </div>
                  <div>
                    <dt>Context</dt>
                    <dd className="studio-mono">{runMeta.tokens}</dd>
                  </div>
                  <div>
                    <dt>Gate</dt>
                    <dd>{runMeta.gate}</dd>
                  </div>
                </dl>
              </div>
              <Y.Stack gap={8}>
                <Y.Text variant="meta" className="studio-inspector-kicker">Attached sources</Y.Text>
                <div className="studio-sources-list">
                  <Y.List label="Attached sources">
                    {attachedSources.map(src => {
                      const resolvedTone = src.id === "REG-04" && gateState === "approved" ? "success" : src.tone;
                      const resolvedState =
                        src.id === "REG-04" && gateState === "approved"
                          ? "Verified"
                          : src.id === "REG-04" && gateState === "held"
                            ? "Held"
                            : src.state;
                      const targetFile = studioFiles.find(item => item.id === src.fileId);
                      return (
                        <Y.ListRow
                          key={src.id}
                          title={src.name}
                          description={src.id}
                          trailing={<Y.Badge tone={resolvedTone}>{resolvedState}</Y.Badge>}
                          onActivate={() => {
                            if (targetFile) {
                              setFile(targetFile);
                              openPanel("Files");
                            }
                          }}
                        />
                      );
                    })}
                  </Y.List>
                </div>
              </Y.Stack>
            </Y.Stack>
            <Y.Stack gap={8} align="stretch" className="studio-drawer-actions">
              <Y.Button emphasis="soft" onClick={event => openPanel("Computer", event.currentTarget)}>
                Watch {current.name}’s screen
              </Y.Button>
              <Y.Button
                emphasis="soft"
                onClick={() => {
                  setFile(studioFiles[0]);
                  openPanel("Files");
                }}
              >
                Open workspace files
              </Y.Button>
            </Y.Stack>
          </div>
        )}
        {panel === "Files" &&
          (file ? (
            <Y.Stack gap={12}>
              <Y.Inline>
                <Y.Button emphasis="quiet" size="compact" onClick={() => setFile(undefined)}>
                  <Y.Icon name="back" /> All conversation files
                </Y.Button>
              </Y.Inline>
              <Y.Heading level={4}>{file.name}</Y.Heading>
              {file.kind === "Document" ? (
                <Y.Text>{file.detail}</Y.Text>
              ) : (
                <Y.CodeBlock language={file.kind === "Spreadsheet" ? "CSV" : "Sample code"} code={file.detail} />
              )}
              <Y.Button emphasis="soft" size="compact" onClick={onOpenLibrary}>
                Open full file library
              </Y.Button>
            </Y.Stack>
          ) : (
            <Y.List label="Conversation files">
              {studioFiles
                .filter(item => item.owner === current.name || current.kind === "channel")
                .map(item => (
                  <Y.ListRow key={item.id} title={item.name} description={item.kind} onActivate={() => setFile(item)} />
                ))}
            </Y.List>
          ))}
        {panel === "Threads" && (
          <Y.Stack gap={10}>
            <Y.Button emphasis="soft" size="compact" onClick={startThread}>
              <Y.Icon name="plus" /> New thread
            </Y.Button>
            <Y.List label="Threads">
              <Y.ListRow title="Main conversation" onActivate={() => setThread("")} />
              {(threads[current.id] ?? []).map(name => (
                <Y.ListRow key={name} title={name} onActivate={() => setThread(name)} />
              ))}
            </Y.List>
          </Y.Stack>
        )}
        {panel === "Pinned messages" && (
          <Y.Stack gap={8}>
            {[
              ...opening,
              ...Object.entries(entries)
                .filter(([key]) => key.startsWith(current.id + "/"))
                .flatMap(([, value]) => value),
            ]
              .filter(item => pinned[current.id]?.includes(item.id))
              .map(item => (
                <Y.Text key={item.id}>{item.text}</Y.Text>
              ))}
            {!pinned[current.id]?.length && <Y.Text variant="help">No messages pinned.</Y.Text>}
          </Y.Stack>
        )}
        {panel === "Computer" && (
          <Y.Stack gap={12}>
            <Y.Inline>
              <Y.Button emphasis="quiet" size="compact" onClick={() => setPanel("Context")}>
                <Y.Icon name="back" /> Back to {contextTitle}
              </Y.Button>
            </Y.Inline>
            <Y.RuntimePanel
              title={contextTitle}
              state="available"
              detail="Isolated workspace"
              preview={
                <Y.RecordFacts
                  title="Morning brief"
                  source="Research register"
                  asOf="2026-11-24"
                  timeLabel="Nov 24"
                  facts={[
                    { id: "coverage", label: "Reviewed", value: gateState === "approved" ? "4 of 4 readings" : "3 of 4 readings" },
                    { id: "next", label: "Next step", value: gateState === "approved" ? "Ready for handoff" : "Confirm timestamp" },
                  ]}
                />
              }
            />
          </Y.Stack>
        )}
        {panel === "Members" && (
          <Y.List label="Channel members">
            {items
              .filter(item => item.kind === "agent")
              .map(item => (
                <Y.ListRow
                  key={item.id}
                  title={item.name}
                  trailing={
                    <Y.Button
                      emphasis="quiet"
                      size="compact"
                      onClick={() =>
                        setMembers(previous => ({
                          ...previous,
                          [current.id]: channelMembers.includes(item.id)
                            ? channelMembers.filter(id => id !== item.id)
                            : [...channelMembers, item.id],
                        }))
                      }
                    >
                      {channelMembers.includes(item.id) ? "Remove" : "Invite"}
                    </Y.Button>
                  }
                />
              ))}
          </Y.List>
        )}
        {panel === "Agent settings" && (
          <Y.Stack key={current.id} gap={10}>
            <Y.TextField
              label="Display name"
              size="compact"
              value={current.name}
              onChange={event =>
                setItems(previous => previous.map(item => (item.id === current.id ? { ...item, name: event.target.value } : item)))
              }
            />
            <Y.TextField
              label="Role"
              size="compact"
              value={current.role}
              onChange={event =>
                setItems(previous => previous.map(item => (item.id === current.id ? { ...item, role: event.target.value } : item)))
              }
            />
            <Y.Select
              label="Model"
              size="compact"
              value={model[current.id] ?? "Studio Standard"}
              options={options("Studio Standard", "Studio Fast")}
              onValueChange={next => setModel(previous => ({ ...previous, [current.id]: next }))}
            />
            <Y.Select label="Backup model" size="compact" options={options("Ask first", "Studio Fast")} />
            <Y.Textarea label="Instructions" defaultValue="Ground conclusions in available evidence." />
            <Y.Switch label="Remember review preferences" />
          </Y.Stack>
        )}
      </div>
    );
  }

  return (
    <div className="studio-conversation" ref={frame}>
      {active &&
        toolbarTarget &&
        createPortal(
          <Y.Inline className="studio-conversation-head" align="center" gap={12}>
            <Y.Inline className="studio-conversation-identity" align="center" gap={8}>
              {current.kind === "agent" && (
                <Y.AgentAvatar agent={current.art} color={current.color} size={24} state={gazeFor(current.id)} label="" />
              )}
              <Y.Inline gap={6} align="center" wrap={false} className="studio-breadcrumb-line">
                <Y.Heading level={2}>{thread || current.name}</Y.Heading>
                <span className="studio-crumb-sep" aria-hidden="true">/</span>
                <span className="studio-topic-crumb">{current.topic}</span>
                <Y.Badge tone={runMeta.badgeTone}>{runMeta.badgeLabel}</Y.Badge>
              </Y.Inline>
            </Y.Inline>
            <Y.Inline className="studio-conversation-actions" align="center" gap={6}>
              <span className="studio-stream-switcher">
                <Y.SegmentedControl
                  label="Stream view"
                  value={streamTab}
                  onValueChange={next => setStreamTab(next as StreamTab)}
                  options={options("Stream", "Trace", "Diff")}
                />
              </span>
              <Y.ActionMenu
                label="Conversation details"
                triggerText="Details"
                triggerSize="compact"
                align="end"
                items={[
                  { id: "Context", label: contextTitle },
                  { id: "Files", label: "Files" },
                  { id: "Threads", label: "Threads" },
                  { id: "new-thread", label: "New thread" },
                  { id: "Computer", label: "Screen preview" },
                  { id: current.kind === "agent" ? "Agent settings" : "Members", label: current.kind === "agent" ? "Agent settings" : "Members" },
                  { id: "Pinned messages", label: "Pinned messages" },
                ]}
                onSelect={id => {
                  setFile(undefined);
                  if (id === "new-thread") startThread();
                  else openPanel(id as Panel);
                }}
              />
            </Y.Inline>
          </Y.Inline>,
          toolbarTarget,
        )}

      <div className="studio-thread-layout" data-panel={Boolean(panel) && inspectorInline}>
        <div className="studio-thread">
          {streamTab === "Trace" ? (
            <Y.ScrollArea label="Execution trace view" className="studio-alt-view">
              <Y.Stack gap={14}>
                <Y.Trace label="Worked on Kai’s computer" events={kaiTraceEvents} />
                <Y.RecordFacts
                  title="Run telemetry"
                  source="Sourdough runtime"
                  asOf="2026-11-24"
                  timeLabel="08:15Z"
                  facts={[
                    { id: "dur", label: "Total duration", value: "414 ms" },
                    { id: "tok", label: "Token usage", value: "14,210" },
                    { id: "gate", label: "Active gate", value: gateState === "approved" ? "Cleared" : "REG-04 timestamp" },
                  ]}
                />
              </Y.Stack>
            </Y.ScrollArea>
          ) : streamTab === "Diff" ? (
            <Y.ScrollArea label="Brief diff view" className="studio-alt-view">
              <Y.Stack gap={14}>
                <Y.CodeBlock language="diff · Morning brief.md" code={briefDiffSample} />
              </Y.Stack>
            </Y.ScrollArea>
          ) : (
            <Y.Transcript label={current.name + " transcript"} revision={messages.length} readingAnchor="when-away" key={threadKey}>
              {!messages.length && <Y.Text variant="help">Start this thread with a note.</Y.Text>}
              {messages.map(message => (
                <Y.Message
                  key={message.id}
                  speaker={message.author}
                  time={message.id === "kai-start" ? `${runMeta.id} · ${runMeta.latency}` : undefined}
                  variant={message.author === "You" ? "sent" : "received"}
                  actions={
                    <Y.Inline gap={2}>
                      <Y.IconButton
                        size="compact"
                        icon="check"
                        label="Acknowledge message"
                        aria-pressed={!!reactions[message.id]}
                        onClick={() => setReactions(previous => ({ ...previous, [message.id]: !previous[message.id] }))}
                      />
                      <Y.IconButton size="compact" icon="back" label="Reply to message" onClick={() => setReply(message.author)} />
                      <Y.IconButton
                        size="compact"
                        icon="bookmark"
                        label="Pin message"
                        aria-pressed={pinned[current.id]?.includes(message.id) ?? false}
                        onClick={() =>
                          setPinned(previous => ({
                            ...previous,
                            [current.id]: previous[current.id]?.includes(message.id)
                              ? previous[current.id].filter(id => id !== message.id)
                              : [...(previous[current.id] ?? []), message.id],
                          }))
                        }
                      />
                    </Y.Inline>
                  }
                >
                  <Y.Stack gap={14}>
                    <Y.Text className="studio-msg-copy">{message.text}</Y.Text>
                    {message.id === "kai-start" && (
                      <>
                        <Y.Trace label="Worked on Kai’s computer" events={kaiTraceEvents} />
                        <div className="studio-inline-diff" aria-label="Morning brief diff summary">
                          <div className="studio-inline-diff-head">
                            <span>Morning brief.md</span>
                            <span className="studio-mono">
                              <span className="studio-diff-stat-add">+2</span>{" "}
                              <span className="studio-diff-stat-del">-1</span>
                            </span>
                          </div>
                          <div className="studio-inline-diff-line" data-kind="del">
                            - REG-04 field reading: pending confirmation
                          </div>
                          <div className="studio-inline-diff-line" data-kind="add">
                            + REG-04 field reading: flagged (missing source timestamp)
                          </div>
                          <div className="studio-inline-diff-line" data-kind="add">
                            + Coverage: 3 of 4 sources verified before release
                          </div>
                        </div>
                        <div className="studio-gate-card" data-state={gateState}>
                          <Y.Inline className="studio-split" align="center" gap={8}>
                            <Y.Inline gap={8} align="center">
                              <Y.Heading level={4}>Source verification gate</Y.Heading>
                              <Y.Badge tone={gateState === "approved" ? "success" : "warning"}>
                                {gateState === "approved" ? "Verified" : gateState === "held" ? "Held" : "Needs decision"}
                              </Y.Badge>
                            </Y.Inline>
                            <Y.Text variant="meta" className="studio-mono">
                              {gateState === "approved" ? "4 / 4 verified" : "3 / 4 verified"}
                            </Y.Text>
                          </Y.Inline>
                          <Y.Text variant="help">
                            {gateState === "approved"
                              ? "All four morning readings have verified timestamps and are ready to share."
                              : gateState === "held"
                                ? "REG-04 held pending source timestamp confirmation from Field notes."
                                : "Approve to share the brief with REG-04 flagged, or hold REG-04 while Kai retries the sensor feed."}
                          </Y.Text>
                          <Y.Inline justify="between" align="center" gap={8} className="studio-gate-actions">
                            <Y.Button
                              emphasis="quiet"
                              size="compact"
                              onClick={event => {
                                openPanel("Files", event.currentTarget);
                                setFile(studioFiles[0]);
                              }}
                            >
                              Inspect brief <Y.Icon name="arrow" />
                            </Y.Button>
                            <Y.Inline gap={8}>
                              <Y.Button emphasis="soft" size="compact" onClick={() => setGateState("held")}>
                                Hold REG-04
                              </Y.Button>
                              <Y.Button emphasis="filled" tone="brand" size="compact" onClick={() => setGateState("approved")}>
                                {gateState === "approved" ? "Brief approved" : "Approve brief"}
                              </Y.Button>
                            </Y.Inline>
                          </Y.Inline>
                        </div>
                      </>
                    )}
                  </Y.Stack>
                </Y.Message>
              ))}
              {busy[threadKey] && (
                <Y.Text variant="help" role="status">
                  {current.name} is preparing a sample reply.
                </Y.Text>
              )}
            </Y.Transcript>
          )}
          {reply && (
            <Y.Inline className="studio-reply-bar" gap={6}>
              <Y.Text variant="help">Replying to {reply}</Y.Text>
              <Y.IconButton size="compact" icon="close" label="Cancel reply" onClick={() => setReply("")} />
            </Y.Inline>
          )}
          <div className="studio-composer-dock">
            <Y.Composer
              label={"Message " + (thread || current.name)}
              placeholder={`Message ${thread || current.name} · Type @ to mention a file or bot...`}
              sendTone="neutral"
              value={drafts[threadKey] ?? ""}
              onValueChange={value => setDrafts(previous => ({ ...previous, [threadKey]: value }))}
              pending={!!busy[threadKey]}
              onSend={message => send(message.text, message.attachmentIds)}
              contextChips={runMeta.chips}
              mentionPeople={items.filter(item => item.kind === "agent").map(item => ({ id: item.id, label: item.name }))}
              attachments={studioFiles
                .filter(item => attachments[threadKey]?.includes(item.id))
                .map(item => ({ id: item.id, name: item.name, detail: "Sample file" }))}
              onAddAttachment={() => setAttach(true)}
              onRemoveAttachment={id =>
                setAttachments(previous => ({ ...previous, [threadKey]: previous[threadKey].filter(item => item !== id) }))
              }
              tools={options("Review sample sources", "Voice note")}
              onTool={tool => {
                if (tool === "Voice note") setVoice("idle");
                else setDrafts(previous => ({ ...previous, [threadKey]: "Review the sample sources in the morning brief." }));
              }}
              onStop={() => {
                window.clearTimeout(timers.current[threadKey]);
                delete timers.current[threadKey];
                setBusy(previous => ({ ...previous, [threadKey]: false }));
              }}
            />
          </div>
        </div>

        <div className="studio-inspector-track">
          {panel &&
            (inspectorInline ? (
              <aside className="studio-inspector" aria-label="Conversation inspector">
                <Y.Inline className="studio-inspector-heading" align="center" gap={8}>
                  <Y.Heading level={3}>{panelTitle}</Y.Heading>
                  <Y.Inline gap={6} align="center">
                    {panel === "Context" && <Y.Badge tone="success">Live</Y.Badge>}
                    <Y.IconButton size="compact" icon="close" label="Close conversation details" onClick={closePanel} />
                  </Y.Inline>
                </Y.Inline>
                {inspectorContents()}
              </aside>
            ) : (
              active && (
                <Y.Sheet title={panelTitle} open onOpenChange={open => { if (!open) closePanel(); }}>
                  {inspectorContents()}
                </Y.Sheet>
              )
            ))}
        </div>
      </div>

      <Y.Dialog title="Attach a sample file" open={attach} onOpenChange={setAttach}>
        <Y.List label="Available attachments">
          {studioFiles.map(item => (
            <Y.ListRow
              key={item.id}
              title={item.name}
              description={item.kind}
              onActivate={() => {
                setAttachments(previous => ({ ...previous, [threadKey]: [...new Set([...(previous[threadKey] ?? []), item.id])] }));
                setAttach(false);
              }}
            />
          ))}
        </Y.List>
      </Y.Dialog>

      <Y.Dialog title="Voice note preview" open={!!voice} onOpenChange={open => { if (!open) setVoice(undefined); }}>
        {voice && (
          <Y.Stack gap={12}>
            <Y.Text variant="help">Uses a prerecorded sample transcript.</Y.Text>
            <Y.VoiceControl
              state={voice}
              onStart={() => setVoice("recording")}
              onStop={() => setVoice("review")}
              preview={<Y.Text>Review the source date before sharing the brief.</Y.Text>}
              onDiscard={() => setVoice(undefined)}
              onSend={() => {
                setVoice(undefined);
                setDrafts(previous => ({ ...previous, [threadKey]: "Review the source date before sharing the brief." }));
              }}
            />
          </Y.Stack>
        )}
      </Y.Dialog>
    </div>
  );
}
