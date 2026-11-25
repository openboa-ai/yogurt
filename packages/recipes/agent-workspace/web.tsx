"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  AgentAvatar,
  AgentRow,
  Button,
  Heading,
  IconButton,
  SearchField,
  Stack,
  Text,
  agentPresenceLabels,
  type AgentSummary,
} from "@openboa/yogurt";

interface WorkspaceDetailProps {
  agent: AgentSummary;
  rosterId: string;
  rosterOpen: boolean;
  onOpenRoster: () => void;
  renderConversation: (agent: AgentSummary) => ReactNode;
  renderRuntime?: (agent: AgentSummary) => ReactNode;
}

function WorkspaceDetail({
  agent,
  rosterId,
  rosterOpen,
  onOpenRoster,
  renderConversation,
  renderRuntime,
}: WorkspaceDetailProps) {
  const headingId = useId();
  const inspectorId = useId();
  const inspectorButton = useRef<HTMLButtonElement>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const runtime = inspectorOpen && renderRuntime?.(agent);
  const avatar = agent.avatar ?? (agent.art && (
    <AgentAvatar
      agent={agent.art}
      size={24}
      state={agent.state}
    />
  ));
  return (
    <section aria-labelledby={headingId} className="yg-agent-detail">
      <div className="yg-agent-detail-grid" data-inspector={!!runtime}>
        <header className="yg-agent-detail-header">
          <IconButton
            label="Browse agents"
            icon="menu"
            size="compact"
            className="yg-agent-roster-toggle"
            aria-controls={rosterId}
            aria-expanded={rosterOpen}
            onClick={onOpenRoster}
          />
          {avatar && <span className="yg-agent-detail-art" aria-hidden="true">{avatar}</span>}
          <div className="yg-agent-detail-identity">
            <Heading id={headingId} data-agent-heading="" level={4} tabIndex={-1}>{agent.name}</Heading>
            <Text variant="help" role="status">
              {agent.role ? agent.role + " · " : ""}{agentPresenceLabels[agent.state]}
            </Text>
          </div>
          {renderRuntime && (
            <Button
              ref={inspectorButton}
              emphasis="soft"
              size="compact"
              aria-expanded={inspectorOpen}
              aria-controls={inspectorId}
              onClick={() => setInspectorOpen((value) => !value)}
            >
              {inspectorOpen ? "Hide computer" : "Computer"}
            </Button>
          )}
        </header>
        {renderRuntime && (
          <aside id={inspectorId} className="yg-agent-inspector" aria-label="Computer inspector" hidden={!runtime}>
            {runtime && (
              <>
                <header className="yg-agent-inspector-head">
                  <Heading level={5}>Computer</Heading>
                  <IconButton
                    label="Close computer"
                    icon="close"
                    size="compact"
                    onClick={() => {
                      setInspectorOpen(false);
                      inspectorButton.current?.focus();
                    }}
                  />
                </header>
                <div className="yg-agent-inspector-body">{runtime}</div>
              </>
            )}
          </aside>
        )}
        <div className="yg-agent-conversation">{renderConversation(agent)}</div>
      </div>
    </section>
  );
}

export function AgentWorkspace({
  agents,
  currentId,
  onSelectAgent,
  renderConversation,
  renderRuntime,
}: {
  agents: readonly AgentSummary[];
  currentId?: string;
  onSelectAgent: (id: string) => void;
  renderConversation: (agent: AgentSummary) => ReactNode;
  renderRuntime?: (agent: AgentSummary) => ReactNode;
}) {
  const rosterId = useId();
  const workspace = useRef<HTMLElement>(null);
  const roster = useRef<HTMLElement>(null);
  const focusOnClose = useRef(false);
  const [query, setQuery] = useState("");
  const [rosterOpen, setRosterOpen] = useState(false);
  const current = agents.find((agent) => agent.id === currentId);
  const term = query.trim().toLocaleLowerCase("en");
  const pinned: AgentSummary[] = [];
  const grouped = new Map<string, AgentSummary[]>();
  for (const agent of agents) {
    const searchable = [agent.name, agent.role, agent.group].join(" ").toLocaleLowerCase("en");
    if (!searchable.includes(term)) continue;
    if (agent.pinned) {
      pinned.push(agent);
    } else {
      const group = agent.group ?? "";
      const groupAgents = grouped.get(group) ?? [];
      groupAgents.push(agent);
      grouped.set(group, groupAgents);
    }
  }
  const sections = [
    ...(pinned.length ? [{ key: "pinned", title: "Pinned", agents: pinned }] : []),
    ...Array.from(grouped, ([title, groupAgents]) => ({ key: "group-" + title, title, agents: groupAgents })),
  ];

  useLayoutEffect(() => {
    if (rosterOpen) roster.current?.querySelector<HTMLInputElement>("input[type='search']")?.focus();
    else if (focusOnClose.current) {
      focusOnClose.current = false;
      workspace.current?.querySelector<HTMLElement>("[data-agent-heading]")?.focus();
    }
  }, [rosterOpen, currentId]);

  function closeRoster() {
    if (rosterOpen) focusOnClose.current = true;
    setRosterOpen(false);
  }

  return (
    <section
      ref={workspace}
      aria-label="Agent workspace"
      className="yg-agent-workspace"
      data-roster-open={rosterOpen}
      data-has-agent={!!current}
    >
      <div className="yg-agent-workspace-grid">
        <nav id={rosterId} ref={roster} aria-label="Agent roster" className="yg-agent-roster">
          <Stack gap={12}>
            <header className="yg-agent-roster-header">
              <Heading level={4}>Agents</Heading>
              {current && rosterOpen && (
                <IconButton icon="close" size="compact" label="Close agent roster" className="yg-agent-roster-toggle" onClick={closeRoster} />
              )}
            </header>
            <SearchField label="Find an agent" placeholder="Find an agent" hiddenLabel size="compact" value={query} onValueChange={setQuery} />
            {sections.length === 0 && (
              <Stack gap={8} className="yg-agent-empty">
                <Text variant="help">{term ? "No matching agents." : "No agents available."}</Text>
                {term && <Button emphasis="soft" onClick={() => setQuery("")}>Show all agents</Button>}
              </Stack>
            )}
            {sections.map((section) => (
              <section key={section.key} className="yg-agent-group" aria-label={section.title || "Available agents"}>
                {section.title && <h4>{section.title}</h4>}
                <ul>
                  {section.agents.map((agent) => (
                    <li key={agent.id}>
                      <AgentRow
                        agent={agent}
                        current={agent.id === current?.id}
                        onSelect={(id) => {
                          closeRoster();
                          onSelectAgent(id);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </Stack>
        </nav>
        {current ? (
          <WorkspaceDetail
            key={current.id}
            agent={current}
            rosterId={rosterId}
            rosterOpen={rosterOpen}
            onOpenRoster={() => setRosterOpen(true)}
            renderConversation={renderConversation}
            renderRuntime={renderRuntime}
          />
        ) : agents.length > 0 && (
          <div className="yg-agent-empty yg-agent-empty-selection">
            <Text variant="help">Choose an agent to open its conversation.</Text>
          </div>
        )}
      </div>
    </section>
  );
}
