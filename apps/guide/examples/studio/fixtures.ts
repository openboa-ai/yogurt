export const workspaceViews = [
  { id: "conversations", label: "Conversations", icon: "chat" },
  { id: "tasks", label: "Tasks", icon: "check" },
  { id: "workflows", label: "Workflows", icon: "workflow" },
  { id: "schedule", label: "Schedule", icon: "calendar" },
  { id: "library", label: "Files", icon: "folder" },
  { id: "usage", label: "Usage", icon: "chart" },
  { id: "customers", label: "Customers", icon: "person" },
  { id: "extensions", label: "Extensions", icon: "puzzle" },
  { id: "providers", label: "Model providers", icon: "sliders" },
  { id: "settings", label: "Settings", icon: "sliders" },
  { id: "help", label: "Help", icon: "info" },
] as const;

export type View = typeof workspaceViews[number]["id"];
export type Conversation = { id: string; name: string; role: string; summary: string; kind: "agent" | "channel"; art: "Kai" | "Sol" };
export type Entry = { id: string; author: string; text: string };

export const conversations: Conversation[] = [
  { id: "kai", name: "Kai", role: "Research lead", summary: "The morning brief is ready for a source check.", kind: "agent", art: "Kai" },
  { id: "sol", name: "Sol", role: "Evidence review", summary: "I reconciled the observation log.", kind: "agent", art: "Sol" },
  { id: "release", name: "Studio releases", role: "Channel", summary: "Two checks remain before the release.", kind: "channel", art: "Sol" },
  { id: "field-notes", name: "Field notes", role: "Channel", summary: "Friday’s readings are now in the register.", kind: "channel", art: "Kai" },
];

export const studioFiles = [
  { id: "brief", name: "Morning brief.md", kind: "Document", owner: "Kai", detail: "Three sources agree on the morning reading. The fourth source is still pending.", size: "4 KB" },
  { id: "log", name: "Observation log.csv", kind: "Spreadsheet", owner: "Sol", detail: "Date, Observations, Reviewed\nNov 19, 20, 18\nNov 20, 22, 22\nNov 21, 24, 21", size: "12 KB" },
  { id: "guide", name: "Release checklist.md", kind: "Document", owner: "Kai", detail: "Check the source dates, complete review and prepare the handoff.", size: "2 KB" },
  { id: "script", name: "validate-observations.ts", kind: "Code", owner: "Sol", detail: "const reviewed = 21;\nconst total = 24;\nreturn reviewed / total;", size: "1 KB" },
];

export const commands = [
  { id: "agent", label: "New agent" },
  { id: "channel", label: "New channel" },
  { id: "folder", label: "New folder" },
] as const;

export const options = (...labels: string[]) => labels.map(label => ({ id: label, label }));
