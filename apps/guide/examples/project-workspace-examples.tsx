import { useRef, useState } from "react";
import {
  Composer,
  List,
  ResourceRow,
  Stack,
  Status,
  ThreadRow,
  type WorkspaceResource,
  type WorkspaceThread,
} from "@openboa/yogurt";
import {
  ProjectWorkspace,
  type WorkspaceProject,
} from "../../../packages/recipes/project-workspace/web";

const sampleThread: WorkspaceThread = {
  id: "release-review",
  title: "Review the release brief",
  preview: "Which changes need a second look?",
  updatedAt: { dateTime: "2026-11-20T14:00:00+09:00", label: "Today" },
  unread: true,
};
const sampleResource: WorkspaceResource = {
  id: "handoff",
  title: "Production handoff.pdf",
  kind: "file",
  detail: "Added Nov 20",
};

const initialProjects: WorkspaceProject[] = [
  {
    id: "sourdough",
    mark: "sourdough",
    title: "Sourdough",
    description: "Product releases and the decisions behind them.",
    threads: [
      sampleThread,
      {
        id: "labelling",
        title: "Test the label hierarchy",
        preview: "Compare the review and ready states.",
        updatedAt: { dateTime: "2026-11-19", label: "Nov 19" },
      },
      {
        id: "summary-branch",
        title: "Explore a shorter release note",
        preview: "Branched from Review the release brief.",
        updatedAt: { dateTime: "2026-11-18", label: "Nov 18" },
      },
    ],
    sources: [
      sampleResource,
      { id: "guide", title: "Review guidelines", kind: "page", pinned: true },
      { id: "still", title: "Release artwork", kind: "image" },
      { id: "notes", title: "Current release notes", kind: "link" },
      { id: "queue", title: "Review queue", kind: "app", detail: "Shared workspace" },
      { id: "decision", title: "Release decision", kind: "output" },
    ],
    instructions: "Bring forward the decision and its source. Flag open questions before sending a draft.",
  },
  {
    id: "meatball",
    mark: "meatball",
    title: "Meatball",
    description: "Plan handoffs and follow ongoing work.",
    threads: [],
    sources: [{ id: "handoff", title: "Meatball onboarding", kind: "page" }],
  },
  {
    id: "yogurt",
    mark: "yogurt",
    title: "Yogurt",
    description: "Design decisions and component notes.",
    threads: [],
    sources: [],
  },
];

type Selection = { projectId: string; threadId?: string; sourceId?: string };

export function ProjectWorkspaceExample({ id }: { id: string }) {
  const [projects, setProjects] = useState(initialProjects);
  const [projectId, setProjectId] = useState("sourdough");
  const [selection, setSelection] = useState<Selection>();
  const [status, setStatus] = useState("");
  const [pinned, setPinned] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const sequence = useRef(0);
  function updateProject(projectId: string, change: (project: WorkspaceProject) => WorkspaceProject) {
    setProjects((current) => current.map((project) => project.id === projectId ? change(project) : project));
  }
  function addThread(projectId: string, draft?: string) {
    const threadId = "draft-" + ++sequence.current;
    const title = draft?.trim().split("\n")[0].slice(0, 80) || "New project chat";
    updateProject(projectId, (project) => ({
      ...project,
      threads: [{ id: threadId, title, preview: draft }, ...project.threads],
    }));
    setDrafts((current) => ({ ...current, [projectId]: "" }));
    setSelection({ projectId, threadId });
    setStatus("Project chat created");
  }

  if (id === "resource-row") {
    return (
      <Stack gap={12}>
        <List label="Sample project resources">
          <ResourceRow
            resource={{ ...sampleResource, pinned }}
            onOpen={() => setStatus("Production handoff.pdf opened")}
            onPinChange={(_, value) => {
              setPinned(value);
              setStatus(value ? "Resource pinned" : "Resource unpinned");
            }}
          />
        </List>
        {status && <Status>{status}</Status>}
      </Stack>
    );
  }

  if (id === "thread-row") {
    return (
      <Stack gap={12}>
        <List label="Sample project chats">
          <ThreadRow
            thread={sampleThread}
            selected={Boolean(status)}
            onOpen={() => setStatus("Release brief opened")}
          />
        </List>
        {status && <Status>{status}</Status>}
      </Stack>
    );
  }

  return (
    <Stack gap={12}>
      <ProjectWorkspace
        projects={projects}
        projectId={projectId}
        selection={selection}
        onProjectChange={(next) => {
          setProjectId(next);
          setSelection(undefined);
          setStatus("");
        }}
        onNewChat={(projectId) => addThread(projectId)}
        onAddSource={(projectId) => {
          const sourceId = "source-" + ++sequence.current;
          updateProject(projectId, (project) => ({
            ...project,
            sources: [{ id: sourceId, title: "Project reference", kind: "link" }, ...project.sources],
          }));
          setStatus("Project source added");
        }}
        onOpenThread={(projectId, threadId) => {
          setSelection({ projectId, threadId });
          setStatus("Project chat opened");
        }}
        onOpenSource={(projectId, sourceId) => {
          setSelection({ projectId, sourceId });
          setStatus("Project source opened");
        }}
        onPinSource={(projectId, sourceId, pinned) => {
          updateProject(projectId, (project) => ({
            ...project,
            sources: project.sources.map((row) => row.id === sourceId ? { ...row, pinned } : row),
          }));
          setStatus(pinned ? "Resource pinned" : "Resource unpinned");
        }}
        onShare={() => setStatus("Project sharing selected")}
        composer={(id) => {
          const draft = drafts[id] ?? "";
          const title = projects.find((project) => project.id === id)?.title ?? "project";
          return (
            <Composer
              label={"Message in " + title}
              value={draft}
              onValueChange={(value) => setDrafts((current) => ({ ...current, [id]: value }))}
              onSend={({ text }) => addThread(id, text)}
            />
          );
        }}
      />
      {status && <Status>{status}</Status>}
    </Stack>
  );
}
