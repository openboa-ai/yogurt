"use client";

import { useState, type ReactNode } from "react";
import {
  Badge, Heading, IconButton, Inline, ProjectMark, SearchField, SidebarContent,
  SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, SidebarSubmenu, Text,
  type Project,
} from "@openboa/yogurt";

type Destination = { id: string; title: string; href?: string; unread?: number };

export function ProjectSidebar({
  title, mark, sections, currentId, onSelect, onAdd, footer,
}: {
  title: string;
  mark: Project;
  sections: readonly { id: string; title: string; icon?: ReactNode; items: readonly Destination[] }[];
  currentId?: string;
  onSelect?: (id: string) => void;
  onAdd?: () => void;
  footer?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const visible = sections.map((section) => ({
    ...section,
    items: section.title.toLowerCase().includes(term) ? section.items :
      section.items.filter((item) => item.title.toLowerCase().includes(term)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      <SidebarHeader compact={<ProjectMark project={mark} label="" size={24} />}>
        <Inline gap={8}><ProjectMark project={mark} label="" size={24} /><Heading level={3}>{title}</Heading></Inline>
      </SidebarHeader>
      <SidebarHeader><SearchField label="Find a view" value={query} onValueChange={setQuery} /></SidebarHeader>
      <SidebarContent label={title + " views"}>
        <SidebarGroup label="Workspace" action={onAdd &&
          <IconButton icon="plus" size="compact" label="Add project view" onClick={onAdd} />}>
          {visible.map((section) => (
            <SidebarSubmenu key={section.id} label={section.title} icon={section.icon}
              containsCurrent={section.items.some((item) => item.id === currentId)} defaultOpen>
              {section.items.map((item) => (
                <SidebarItem key={item.id} label={item.title} href={item.href}
                  active={item.id === currentId} onSelect={onSelect && (() => onSelect(item.id))}
                  badge={item.unread ? <Badge>{item.unread}</Badge> : undefined} />
              ))}
            </SidebarSubmenu>
          ))}
          {!visible.length && <Text variant="help">{term ? "No matching views." : "No project views yet."}</Text>}
        </SidebarGroup>
      </SidebarContent>
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </>
  );
}
