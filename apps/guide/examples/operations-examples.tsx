import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Dialog,
  RoutineRow,
  Select,
  Stack,
  Status,
  Text,
  WorkEvent,
  type RoutineRecord,
} from "@openboa/yogurt";
import {
  AttentionInbox,
  type AttentionItem,
  type AttentionReceipt,
} from "../../../blocks/attention-inbox/web";
import {
  OperationsLibrary,
  type CapabilityRecord,
} from "../../../blocks/operations-library/web";

const initialRoutines: RoutineRecord[] = [
  {
    id: "digest",
    title: "Workspace digest",
    cadence: "Weekdays at 09:30",
    nextRun: "Monday, 09:30",
    lastRun: "Ready at 09:32",
    state: "scheduled",
  },
  {
    id: "check",
    title: "Review the intake queue",
    cadence: "Friday at 14:00",
    lastRun: "Connection expired",
    state: "failed",
    canRun: false,
  },
];

const skills: CapabilityRecord[] = [
  { id: "summarize", title: "Summarize a release", detail: "Produce a digest from approved notes.", state: "ready" },
  { id: "archive", title: "Archive old records", detail: "Only project owners can use it.", state: "restricted" },
];
const connections: CapabilityRecord[] = [
  { id: "calendar", title: "Calendar", detail: "Workspace scheduling", state: "connected" },
  { id: "drive", title: "Team drive", detail: "Reconnect to read shared notes.", state: "disconnected" },
];
const initialItems: AttentionItem[] = [
  {
    id: "release",
    title: "Release note drafted",
    detail: "Kai needs a decision before putting the note into the shared release folder.",
    kind: "review",
    time: "09:42",
    state: "waiting",
    unread: true,
    attention: true,
    review: {
      revision: "release-7",
      consequence: "The revised note will become visible in the shared release folder.",
      available: true,
      confirmLabel: "Approve draft",
    },
  },
  {
    id: "handoff",
    title: "Sol has the handoff",
    detail: "Kai handed the three remaining items on the project checklist to Sol.",
    kind: "handoff",
    time: "09:13",
    state: "done",
    unread: true,
    attention: false,
  },
  {
    id: "review-summary",
    title: "Weekly review summary",
    detail: "Six decisions and two follow-up items.",
    kind: "artifact",
    time: "Yesterday",
    state: "ready",
    unread: false,
    attention: false,
  },
];

type Inspection = {
  title: string;
  detail: string;
};

export function OperationsExample({ id }: { id: string }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [attention, setAttention] = useState(initialItems);
  const [receipts, setReceipts] = useState<Record<string, AttentionReceipt>>({});
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [cadence, setCadence] = useState("");
  const [result, setResult] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  function runRoutine(routineId: string) {
    const routine = routines.find((item) => item.id === routineId);
    if (!routine || routine.state === "running" || routine.canRun === false) return;
    setRoutines((current) =>
      current.map((item) =>
        item.id === routineId
          ? { ...item, state: "running", nextRun: undefined, lastRun: "Started in this preview" }
          : item,
      ),
    );
    setResult(`${routine.title} started in this preview.`);
  }
  function editRoutine(routineId: string) {
    const routine = routines.find((item) => item.id === routineId);
    if (!routine) return;
    setEditing(routineId);
    setCadence(routine.cadence);
    setResult("");
  }
  function saveCadence() {
    setRoutines((current) =>
      current.map((item) =>
        item.id === editing ? { ...item, cadence, nextRun: undefined } : item,
      ),
    );
    setEditing(null);
    setResult("Schedule updated in this preview.");
  }
  function inspect(group: "routines" | "skills" | "connections", key: string) {
    if (group === "routines") {
      const routine = routines.find((item) => item.id === key);
      if (routine)
        setInspection({
          title: routine.title,
          detail: [routine.cadence, routine.nextRun && `Next run: ${routine.nextRun}`, routine.lastRun && `Latest run: ${routine.lastRun}`]
            .filter(Boolean)
            .join(" · "),
        });
      return;
    }
    const item = (group === "skills" ? skills : connections).find((entry) => entry.id === key);
    if (item) setInspection({ title: item.title, detail: item.detail });
  }

  if (id === "work-event") {
    return (
      <Stack gap={12}>
        <WorkEvent event={initialItems[2]} onOpen={() => setShowOutput((open) => !open)} />
        {showOutput && <Text>The release checklist and the culture report are still open.</Text>}
      </Stack>
    );
  }
  if (id === "attention-inbox") {
    return (
      <AttentionInbox
        items={attention}
        receipts={receipts}
        onMarkRead={(itemId) =>
          setAttention((items) =>
            items.map((item) => item.id === itemId ? { ...item, unread: false } : item),
          )
        }
        onReview={({ id: itemId, revision }) => {
          setReceipts((current) => ({
            ...current,
            [itemId]: { id: itemId, revision, state: "confirmed", description: "Draft approved in this preview." },
          }));
          setAttention((items) =>
            items.map((item) => item.id === itemId ? { ...item, attention: false, state: "done" } : item),
          );
        }}
      />
    );
  }
  const cadences = [...new Set([cadence, "Weekdays at 09:30", "Friday at 14:00", "Monday at 10:00"].filter(Boolean))];
  return (
    <Stack gap={12}>
      {id === "routine-row" ? (
        <RoutineRow
          routine={routines[0]}
          onInspect={(key) => inspect("routines", key)}
          onEdit={editRoutine}
          onRun={runRoutine}
        />
      ) : (
        <OperationsLibrary
          routines={routines}
          skills={skills}
          connections={connections}
          onInspect={inspect}
          onEditRoutine={editRoutine}
          onRunRoutine={runRoutine}
        />
      )}
      {result && <Status>{result}</Status>}
      {editing && (
        <Dialog
          title="Edit schedule"
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        >
          <Stack gap={12}>
            <Select
              label="Run schedule"
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
              options={cadences.map((schedule) => ({ id: schedule, label: schedule }))}
            />
            <ButtonGroup label="Schedule actions">
              <Button emphasis="quiet" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveCadence}>Save schedule</Button>
            </ButtonGroup>
          </Stack>
        </Dialog>
      )}
      {inspection && (
        <Dialog
          title={inspection.title}
          open
          onOpenChange={(open) => {
            if (!open) setInspection(null);
          }}
        >
          <Text>{inspection.detail}</Text>
        </Dialog>
      )}
    </Stack>
  );
}
