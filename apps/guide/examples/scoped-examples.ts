import type { ComponentType } from "react";
import { AgentWorkspaceExample } from "./agent-workspace-examples";
import { ProjectWorkspaceExample } from "./project-workspace-examples";
import { OperationsExample } from "./operations-examples";
import { WorkspaceExample } from "./workspace-examples";
import { AgentProfileExample } from "./agent-profile-example";
import { RunInspectorExample } from "./run-inspector-example";
import { SidebarExample } from "./sidebar-example";

export const scopedExamples: Readonly<Partial<Record<string, ComponentType<{ id: string }>>>> = {
  "agent-row": AgentWorkspaceExample,
  "runtime-panel": AgentWorkspaceExample,
  "agent-workspace": AgentWorkspaceExample,
  "resource-row": ProjectWorkspaceExample,
  "thread-row": ProjectWorkspaceExample,
  "project-workspace": ProjectWorkspaceExample,
  "work-event": OperationsExample,
  "routine-row": OperationsExample,
  "operations-library": OperationsExample,
  "attention-inbox": OperationsExample,
  "composer": WorkspaceExample,
  "voice-control": WorkspaceExample,
  "artifact-library": WorkspaceExample,
  "project-access": WorkspaceExample,
  "agent-profile": AgentProfileExample,
  "run-inspector": RunInspectorExample,
  "sidebar-layout": SidebarExample,
  "agent-sidebar": SidebarExample,
  "project-sidebar": SidebarExample,
};
