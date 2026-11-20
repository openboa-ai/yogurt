import { useState } from "react";
import { Status, Stack, Text } from "@openboa/yogurt";
import { RunInspector, type RunRecord } from "../../../blocks/run-inspector/web";

const initialRuns: RunRecord[] = [
  {
    id: "run-3",
    title: "Release checklist · run 3",
    time: "Today, 10:12",
    state: "blocked",
    summary: "The project notes folder needs to be reconnected.",
    canRetry: true,
    canCancel: true,
    steps: [
      { id: "scope", title: "Read project instructions", state: "complete", detail: "Used the current release instructions." },
      { id: "read", title: "Read release notes", state: "failed", detail: "The project notes connection expired." },
    ],
  },
  {
    id: "run-2",
    title: "Release checklist · run 2",
    time: "Yesterday, 16:04",
    state: "complete",
    summary: "Reviewed four changes and found two open items.",
    result: <Text>Release checklist · 4 reviewed · 2 open</Text>,
    steps: [
      { id: "scope", title: "Read project instructions", state: "complete", detail: "Used the release instructions as of yesterday." },
      { id: "read", title: "Read release notes", state: "complete", detail: "Loaded four project notes." },
      { id: "review", title: "Write the checklist", state: "complete", detail: "Listed two actions for the release owner." },
    ],
  },
];

export function RunInspectorExample() {
  const [runs, setRuns] = useState(initialRuns);
  const [selectedId, setSelectedId] = useState(initialRuns[0].id);
  const [status, setStatus] = useState("");
  return (
    <Stack gap={12}>
      <RunInspector
        runs={runs}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setStatus("");
        }}
        onRetry={(id) => {
          const original = runs.find((run) => run.id === id);
          if (!original) return;
          const retry = {
            ...original,
            id: `${original.id}-retry-${runs.length + 1}`,
            title: "Release checklist · retry",
            time: "Just now",
            state: "queued" as const,
            summary: "Waiting for an available runner.",
            canRetry: false,
            canCancel: true,
            steps: [],
          };
          setRuns([retry, ...runs]);
          setSelectedId(retry.id);
          setStatus("Retry queued in this preview.");
        }}
        onCancel={(id) => {
          setRuns((items) =>
            items.map((run) =>
              run.id === id
                ? { ...run, state: "cancelled", summary: "Cancelled in this preview.", canCancel: false }
                : run,
            ),
          );
          setStatus("Run cancelled in this preview.");
        }}
      />
      {status && <Status>{status}</Status>}
    </Stack>
  );
}
