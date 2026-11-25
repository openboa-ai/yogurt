import { useEffect, useRef, useState } from "react";
import {
  Button, ButtonGroup, Composer, Heading, Inline, Message, Notice, ProjectMark,
  RecordFacts, RuntimePanel, Stack, Text, Transcript, type AgentSummary,
} from "@openboa/yogurt";
import { AgentWorkspace } from "../../../../packages/recipes/agent-workspace/web";

const agents: AgentSummary[] = [
  { id: "kai", name: "Kai", art: "Kai", role: "Research", group: "Research desk", state: "waiting", pinned: true, preview: "Two observations need review." },
  { id: "sol", name: "Sol", art: "Sol", role: "Data review", group: "Research desk", state: "done", preview: "The latest import is ready." },
  { id: "reconciliation", name: "Vale", art: "round-star-right", role: "Reconciliation", group: "Operations", state: "ready", preview: "Ready to compare source records." },
];
const openingNotes: Record<string, string> = {
  kai: "I compared the morning observations against the research register. Two readings still need review before the brief is ready to share.",
  sol: "The latest sample import is reconciled. I’ve kept the source name and observation time with each value.",
  reconciliation: "The reconciliation queue is clear. Send me a note to start a sample review.",
};
const facts = [
  { id: "source", label: "Source", value: "Research register" },
  { id: "revision", label: "Revision", value: "Research brief 2.4" },
  { id: "coverage", label: "Coverage", value: "18 of 20 observations" },
];

export function SourdoughPreview() {
  const [current, setCurrent] = useState("kai");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState<Record<string, { speaker: string; body: string }[]>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [reviewed, setReviewed] = useState(false);
  const timers = useRef<Record<string, number>>({});
  useEffect(() => {
    const active = timers.current;
    return () => Object.values(active).forEach(id => window.clearTimeout(id));
  }, []);

  function append(id: string, speaker: string, body: string) {
    setThreads(previous => ({ ...previous, [id]: [...(previous[id] ?? []), { speaker, body }] }));
  }
  function send(text: string) {
    if (timers.current[current] !== undefined) return;
    const id = current;
    const agent = agents.find(item => item.id === id)!;
    append(id, "You", text);
    setDrafts(previous => ({ ...previous, [id]: "" }));
    setPending(previous => ({ ...previous, [id]: true }));
    timers.current[id] = window.setTimeout(() => {
      append(id, agent.name, "Sample response: I’ve added this to the review context. The original observations remain available in the inspector.");
      delete timers.current[id];
      setPending(previous => ({ ...previous, [id]: false }));
    }, 950);
  }

  return <Stack gap={16} className="template-sourdough">
    <Inline className="template-sourdough-title">
      <ProjectMark project="sourdough" label="" size={48} />
      <Stack gap={4}><Heading>Sourdough</Heading><Text variant="help">Research workspace · Sample data</Text></Stack>
    </Inline>
    <AgentWorkspace agents={agents.map(agent => ({ ...agent, state: pending[agent.id] ? "working" : reviewed && agent.id === "kai" ? "done" : agent.state }))}
      currentId={current} onSelectAgent={setCurrent}
      renderConversation={agent => <Stack gap={16} key={agent.id}>
        <Transcript label={agent.name + " conversation"} revision={threads[agent.id]?.length ?? 0}>
          <Message speaker={agent.name} time="12:00">
            <Stack gap={12}>
              <Text>{openingNotes[agent.id]}</Text>
              {agent.id === "kai" && <Notice title={reviewed ? "Review recorded" : "Review needed"} tone={reviewed ? "success" : "warning"}
                action={!reviewed ? <ButtonGroup label="Research review">
                  <Button emphasis="soft" onClick={() => append(agent.id, "You", "I’ll review the observations later.")}>Review later</Button>
                  <Button onClick={() => setReviewed(true)}>Mark reviewed</Button>
                </ButtonGroup> : undefined}>
                18 of 20 readings are available for this draft.
              </Notice>}
            </Stack>
          </Message>
          {(threads[agent.id] ?? []).map((message, index) => <Message key={index} speaker={message.speaker}>{message.body}</Message>)}
          {pending[agent.id] && <Text variant="help" role="status">{agent.name} is preparing a reply.</Text>}
        </Transcript>
        <Composer label={"Message " + agent.name} sendTone="neutral" value={drafts[agent.id] ?? ""}
          onValueChange={value => setDrafts(previous => ({ ...previous, [agent.id]: value }))}
          pending={pending[agent.id]}
          onSend={message => send(message.text)}
          onStop={() => {
            window.clearTimeout(timers.current[agent.id]);
            delete timers.current[agent.id];
            append(agent.id, agent.name, "Reply stopped.");
            setPending(previous => ({ ...previous, [agent.id]: false }));
          }} />
      </Stack>}
      renderRuntime={agent => <RuntimePanel title="Review inspector" state="available" detail={"Source context for " + agent.name + "."}
        preview={<RecordFacts title="Research brief" facts={facts} source="Research register" asOf="2026-11-21T12:00:00Z" />} />}
    />
  </Stack>;
}
