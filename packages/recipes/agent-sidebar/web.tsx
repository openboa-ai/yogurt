"use client";

import { useState, type ReactNode } from "react";
import {
  AgentAvatar, Button, Heading, Inline, ProjectMark, SearchField,
  SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem,
  SidebarSubmenu, Stack, Text, type AgentSummary,
} from "@openboa/yogurt";

export function AgentSidebar({
  agents, currentId, onSelect, onNew, footer,
}: {
  agents: readonly AgentSummary[];
  currentId?: string;
  onSelect: (id: string) => void;
  onNew?: () => void;
  footer?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const available = agents.filter((agent) => (agent.name + " " + (agent.role ?? "")).toLowerCase().includes(term));
  const pinned = available.filter((agent) => agent.pinned);
  const team = available.filter((agent) => !agent.pinned);
  const rows = (members: readonly AgentSummary[]) => members.map((agent) => (
    <SidebarItem key={agent.id} label={agent.name} active={agent.id === currentId}
      icon={agent.avatar ?? (agent.art && <AgentAvatar agent={agent.art} state={agent.state} size={20} label="" />)}
      badge={agent.unread && <span className="yg-signal-dot" role="img" aria-label="Unread" />} onSelect={() => onSelect(agent.id)} />
  ));

  return (
    <>
      <SidebarHeader compact={<ProjectMark project="openboa" size={24} label="" />}>
        <Stack gap={8}>
          <Inline gap={8}><ProjectMark project="openboa" size={20} label="" /><Heading level={4}>Agents</Heading></Inline>
          <SearchField label="Find an agent" placeholder="Find an agent" hiddenLabel size="compact" value={query} onValueChange={setQuery} />
        </Stack>
      </SidebarHeader>
      <SidebarContent label="Agents">
        {pinned.length > 0 && <SidebarGroup label="Pinned">{rows(pinned)}</SidebarGroup>}
        {team.length > 0 && <SidebarSubmenu label="Team" containsCurrent={team.some((agent) => agent.id === currentId)} defaultOpen>{rows(team)}</SidebarSubmenu>}
        {!available.length && <Text variant="help">{term ? "No matching agents." : "No agents available."}</Text>}
      </SidebarContent>
      {(onNew || footer) && (
        <SidebarFooter>
          {onNew && <Button emphasis="soft" onClick={onNew}>New conversation</Button>}
          {footer}
        </SidebarFooter>
      )}
    </>
  );
}
