"use client";

import { useState, type ReactNode } from "react";
import {
  Button,
  EmptyResult,
  FilterBar,
  Heading,
  List,
  ProjectMark,
  ResourceRow,
  Result,
  SearchField,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarTrigger,
  Stack,
  Tabs,
  ThreadRow,
  resourceLabels,
  type Project,
  type WorkspaceResource,
  type WorkspaceThread,
} from "@openboa/yogurt";

export interface WorkspaceProject {
  id: string;
  title: string;
  description?: string;
  mark?: Project;
  threads: readonly WorkspaceThread[];
  sources: readonly WorkspaceResource[];
  instructions?: string;
}

export interface ProjectWorkspaceProps {
  projects: readonly WorkspaceProject[];
  projectId: string | null;
  onProjectChange: (projectId: string) => void;
  selection?: { projectId: string; threadId?: string; sourceId?: string };
  onOpenThread?: (projectId: string, threadId: string) => void;
  onOpenSource?: (projectId: string, sourceId: string) => void;
  onPinSource?: (projectId: string, sourceId: string, pinned: boolean) => void;
  onNewChat?: (projectId: string) => void;
  onAddSource?: (projectId: string) => void;
  onEditInstructions?: (projectId: string) => void;
  onShare?: (projectId: string) => void;
  onCreateProject?: () => void;
  composer?: (projectId: string) => ReactNode;
}

function matches(query: string, ...fields: (string | undefined)[]) {
  return fields.join(" ").toLowerCase().includes(query.trim().toLowerCase());
}

function ProjectView({
  project,
  selection,
  onOpenThread,
  onOpenSource,
  onPinSource,
  onNewChat,
  onAddSource,
  onEditInstructions,
  onShare,
  composer,
}: Omit<ProjectWorkspaceProps, "projects" | "projectId" | "onProjectChange" | "onCreateProject"> & {
  project: WorkspaceProject;
}) {
  const [tab, setTab] = useState("chats");
  const [threadSearch, setThreadSearch] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const threads = project.threads.filter((row) => matches(threadSearch, row.title, row.preview));
  const sources = project.sources.filter((row) => matches(sourceSearch, row.title, resourceLabels[row.kind], row.detail));
  const current = selection?.projectId === project.id ? selection : undefined;
  const newChat = onNewChat && (
    <Button emphasis="soft" onClick={() => onNewChat(project.id)}>New chat</Button>
  );
  const addSource = onAddSource && (
    <Button emphasis="soft" onClick={() => onAddSource(project.id)}>Add source</Button>
  );
  const editInstructions = onEditInstructions && (
    <Button emphasis="soft" onClick={() => onEditInstructions(project.id)}>Edit instructions</Button>
  );

  return (
    <Stack gap={24} className="yg-project-view">
      <header className="yg-project-header">
        <div className="yg-project-identity">
          {project.mark && <ProjectMark project={project.mark} label="" />}
          <div>
            <Heading>{project.title}</Heading>
            {project.description && <p className="yg-project-description">{project.description}</p>}
          </div>
        </div>
        {onShare && (
          <Button emphasis="quiet" onClick={() => onShare(project.id)}>Share</Button>
        )}
      </header>
      <Tabs
        label="Project content"
        value={tab}
        onValueChange={setTab}
        items={[
          {
            id: "chats",
            label: "Chats",
            panel: (
              <Stack gap={12}>
                {composer?.(project.id)}
                {project.threads.length > 0 && (
                  <FilterBar label="Find a project chat" query={threadSearch} onQueryChange={setThreadSearch}>
                    {newChat}
                  </FilterBar>
                )}
                {threads.length > 0 ? (
                  <List label={project.title + " chats"}>
                    {threads.map((thread) => (
                      <ThreadRow
                        key={thread.id}
                        thread={thread}
                        selected={thread.id === current?.threadId}
                        onOpen={onOpenThread && ((id) => onOpenThread(project.id, id))}
                      />
                    ))}
                  </List>
                ) : threadSearch.trim() ? (
                  <EmptyResult query={threadSearch} onClear={() => setThreadSearch("")} />
                ) : (
                  <Result title="No project chats yet" action={newChat}>
                    Start a chat with this project's context.
                  </Result>
                )}
              </Stack>
            ),
          },
          {
            id: "sources",
            label: "Sources",
            panel: (
              <Stack gap={12}>
                {project.sources.length > 0 && (
                  <FilterBar label="Find a project source" query={sourceSearch} onQueryChange={setSourceSearch}>
                    {addSource}
                  </FilterBar>
                )}
                {sources.length > 0 ? (
                  <List label={project.title + " sources"}>
                    {sources.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        selected={resource.id === current?.sourceId}
                        onOpen={onOpenSource && ((id) => onOpenSource(project.id, id))}
                        onPinChange={onPinSource && ((id, pinned) => onPinSource(project.id, id, pinned))}
                      />
                    ))}
                  </List>
                ) : sourceSearch.trim() ? (
                  <EmptyResult query={sourceSearch} onClear={() => setSourceSearch("")} />
                ) : (
                  <Result title="No project sources yet" action={addSource}>
                    Add files, links or saved work for this project.
                  </Result>
                )}
              </Stack>
            ),
          },
          {
            id: "instructions",
            label: "Instructions",
            panel: project.instructions ? (
              <Stack gap={12}>
                <p className="yg-project-instructions">{project.instructions}</p>
                {editInstructions && <div>{editInstructions}</div>}
              </Stack>
            ) : (
              <Result title="No instructions yet" action={editInstructions}>
                Set guidelines for conversations in this project.
              </Result>
            ),
          },
        ]}
      />
    </Stack>
  );
}

export function ProjectWorkspace({
  projects,
  projectId,
  onProjectChange,
  onCreateProject,
  ...view
}: ProjectWorkspaceProps) {
  const [query, setQuery] = useState("");
  const project = projects.find((row) => row.id === projectId);
  const shown = projects.filter((row) => matches(query, row.title, row.description));
  return (
    <section aria-label="Project workspace" className="yg-project-workspace">
      <SidebarLayout label="Project directory" width="13rem" navigation={
        <>
          <SidebarHeader><Heading level={3}>Projects</Heading></SidebarHeader>
          {projects.length > 0 && (
            <SidebarHeader><SearchField label="Find a project" value={query} onValueChange={setQuery} /></SidebarHeader>
          )}
          <SidebarContent label="Available projects">
            {shown.map((row) => (
              <SidebarItem key={row.id} label={row.title} active={row.id === projectId}
                icon={row.mark && <ProjectMark project={row.mark} label="" size={20} />}
                onSelect={() => onProjectChange(row.id)} />
            ))}
            {!shown.length && query.trim() && <EmptyResult query={query} onClear={() => setQuery("")} />}
          </SidebarContent>
          {onCreateProject && (
            <SidebarFooter><Button emphasis="quiet" onClick={onCreateProject}>New project</Button></SidebarFooter>
          )}
        </>
      }>
        <Stack gap={12}>
          <div><SidebarTrigger label="Projects" showLabel /></div>
          {project ? (
          <ProjectView key={project.id} project={project} {...view} />
          ) : (
          <Result title={projects.length ? "Choose a project" : "No projects available"}>
            {projects.length
              ? "Pick an available project to see its chats and sources."
              : "A project will appear here once it is available to you."}
          </Result>
          )}
        </Stack>
      </SidebarLayout>
    </section>
  );
}
