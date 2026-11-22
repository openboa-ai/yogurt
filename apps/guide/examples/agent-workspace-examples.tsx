"use client";

import samples from "../../../catalog/specimens/components.json";
import { useEffect, useRef, useState } from "react";
import {
  AgentAvatar,
  AgentRow,
  Button,
  Composer,
  Message,
  RuntimePanel,
  Stack,
  Status,
  Text,
  Transcript,
  type AgentSummary,
  type AgentPresence,
  type RuntimeState,
} from "@openboa/yogurt";
import { AgentWorkspace } from "../../../packages/recipes/agent-workspace/web";

const roster: AgentSummary[] = [
  {
    id: "kai",
    name: samples["agent-row"].name,
    art: "Kai",
    role: "Release lead",
    state: "waiting",
    preview: samples["agent-row"].preview,
    time: samples["agent-row"].time,
    dateTime: "2026-11-20T09:41:00+09:00",
    pinned: true,
    unread: true,
  },
  {
    id: "sol",
    name: "Sol",
    art: "Sol",
    role: "Research lead",
    state: "working",
    preview: "Comparing the November records.",
    time: "9:34 AM",
    dateTime: "2026-11-20T09:34:00+09:00",
    group: "Sourdough",
  },
];

interface SampleMessage {
  id: string;
  speaker: string;
  text: string;
}

const initial: Record<string, SampleMessage[]> = {
  kai: [
    {
      id: "k1",
      speaker: "Kai",
      text: "The release notes are ready. Two entries need your review before I can close the checklist.",
    },
  ],
  sol: [
    {
      id: "s1",
      speaker: "Sol",
      text: "I have the November records. I’ll check the two missing readings first.",
    },
  ],
};

function RuntimePreview({ name }: { name: string }) {
  return (
    <div className="yg-runtime-sample" aria-label={name + " workspace preview"}>
      <Text variant="meta">Release notebook</Text>
      <div className="yg-runtime-sample-item">
        <Text>Changelog</Text>
        <Text variant="meta">Draft</Text>
      </div>
      <div className="yg-runtime-sample-item">
        <Text>Release checklist</Text>
        <Text variant="meta">2 open</Text>
      </div>
    </div>
  );
}

export function AgentWorkspaceExample({ id }: { id: string }) {
  const [currentId, setCurrentId] = useState("kai");
  const [selected, setSelected] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState(initial);
  const [runtime, setRuntime] = useState<Record<string, RuntimeState>>({
    kai: "waiting",
    sol: "working",
  });
  const [watching, setWatching] = useState<Record<string, boolean>>({});
  const [presence, setPresence] = useState<Record<string, AgentPresence>>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>[]>());
  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((entries) => entries.forEach(clearTimeout));
  }, []);
  const agents = roster.map((agent) => ({ ...agent, state: presence[agent.id] ?? agent.state }));

  function report(id: string, state: AgentPresence) {
    setPresence((previous) => ({ ...previous, [id]: state }));
  }

  function stop(id: string) {
    timers.current.get(id)?.forEach(clearTimeout);
    timers.current.delete(id);
    report(id, "ready");
  }

  function run(id: string) {
    timers.current.get(id)?.forEach(clearTimeout);
    report(id, "thinking");
    timers.current.set(id, [
      setTimeout(() => report(id, "working"), 540),
      setTimeout(() => {
        report(id, "done");
        timers.current.delete(id);
      }, 2480),
    ]);
  }

  function setRuntimeFor(agent: string, state: RuntimeState) {
    setRuntime((previous) => ({ ...previous, [agent]: state }));
    setWatching((previous) => ({ ...previous, [agent]: false }));
  }

  function renderComputer(agent: AgentSummary) {
    const state = runtime[agent.id];
    const isWatching = watching[agent.id];
    return (
      <RuntimePanel
        state={state}
        title={agent.name + "’s computer"}
        detail={
          state === "offline"
            ? "The preview is temporarily unavailable."
            : isWatching
              ? "Live preview is open."
              : "The agent’s work stays here while you read the conversation."
        }
        preview={<RuntimePreview name={agent.name} />}
        onWatch={() => setWatching((previous) => ({ ...previous, [agent.id]: true }))}
        onRequestControl={() => setRuntimeFor(agent.id, "controlled")}
        onReturnControl={() => setRuntimeFor(agent.id, "working")}
        onReconnect={() => setRuntimeFor(agent.id, "available")}
      />
    );
  }

  if (id === "agent-row") {
    return (
      <Stack gap={12}>
        <AgentRow agent={agents[0]} current={selected} onSelect={() => setSelected(true)} />
        {selected && <Status>Kai selected</Status>}
      </Stack>
    );
  }

  if (id === "runtime-panel") {
    return (
      <Stack gap={12}>
        {renderComputer(agents[0])}
        {runtime.kai !== "offline" && (
          <Button emphasis="quiet" onClick={() => setRuntimeFor("kai", "offline")}>
            Simulate connection loss
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <AgentWorkspace
      agents={agents}
      currentId={currentId}
      onSelectAgent={setCurrentId}
      renderRuntime={renderComputer}
      renderConversation={(agent) => {
        const messages = threads[agent.id];
        const status = presence[agent.id];
        const busy = status === "thinking" || status === "working";
        return (
          <Stack gap={16}>
            <Transcript label={"Conversation with " + agent.name} revision={messages.length + ":" + (status === undefined ? "previous" : "current")}>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  speaker={message.speaker}
                  avatar={message.speaker === agent.name && agent.art ? <AgentAvatar agent={agent.art} size={24} label="" animated={false} /> : undefined}
                >
                  {message.text}
                </Message>
              ))}
              {busy && agent.art && (
                <div className="yg-conversation-presence" aria-hidden="true">
                  <AgentAvatar agent={agent.art} state={status} size={32} label="" />
                </div>
              )}
            </Transcript>
            <Composer
              label={"Message " + agent.name}
              value={drafts[agent.id] ?? ""}
              pending={busy}
              onStop={() => stop(agent.id)}
              onValueChange={(value) => setDrafts((previous) => ({ ...previous, [agent.id]: value }))}
              onSend={({ text }) => {
                setThreads((previous) => ({
                  ...previous,
                  [agent.id]: [...previous[agent.id], {
                    id: crypto.randomUUID(),
                    speaker: "You",
                    text,
                  }],
                }));
                setDrafts((previous) => ({ ...previous, [agent.id]: "" }));
                run(agent.id);
              }}
            />
          </Stack>
        );
      }}
    />
  );
}
