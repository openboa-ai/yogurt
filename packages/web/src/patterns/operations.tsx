"use client";
import { useId } from "react";
import { Button } from "../controls/actions.js";
import { Badge } from "../controls/feedback.js";
import { Icon, Text, type IconName, type Tone } from "../foundation/foundation.js";

const eventKinds = {
  task: { label: "Task", icon: "check" },
  handoff: { label: "Handoff", icon: "arrow" },
  artifact: { label: "Output", icon: "copy" },
  review: { label: "Review", icon: "info" },
  voice: { label: "Voice note", icon: "info" },
  routine: { label: "Routine", icon: "clock" },
} satisfies Record<string, { label: string; icon: IconName }>;

const eventStates = {
  running: { label: "In progress", tone: "brand" },
  ready: { label: "Ready", tone: "success" },
  waiting: { label: "Waiting", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  done: { label: "Complete", tone: "neutral" },
} satisfies Record<string, { label: string; tone: Tone }>;

export interface WorkEventRecord {
  id: string;
  kind: keyof typeof eventKinds;
  title: string;
  detail?: string;
  time?: string;
  dateTime?: string;
  state?: keyof typeof eventStates;
}

export function WorkEvent({
  event,
  onOpen,
}: {
  event: WorkEventRecord;
  onOpen?: (id: string) => void;
}) {
  const titleId = useId();
  const kind = eventKinds[event.kind];
  const state = event.state && eventStates[event.state];
  return (
    <article className="yg-work-event" aria-labelledby={titleId} data-state={event.state}>
      <span className="yg-work-event-icon">
        <Icon name={kind.icon} />
      </span>
      <div className="yg-work-event-content">
        <div className="yg-operations-line">
          <Text variant="meta">{kind.label}</Text>
          {event.time && (
            <time className="yg-meta" dateTime={event.dateTime}>
              {event.time}
            </time>
          )}
        </div>
        <strong id={titleId}>{event.title}</strong>
        {event.detail && <Text variant="help">{event.detail}</Text>}
      </div>
      {(state || onOpen) && (
        <div className="yg-operations-actions">
          {state && <Badge tone={state.tone}>{state.label}</Badge>}
          {onOpen && (
            <Button
              emphasis="quiet"
              size="compact"
              aria-label={`Open ${event.title}`}
              onClick={() => onOpen(event.id)}
            >
              Open
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

const routineStates = {
  scheduled: { label: "Scheduled", tone: "success" },
  paused: { label: "Paused", tone: "neutral" },
  running: { label: "Running", tone: "brand" },
  failed: { label: "Needs attention", tone: "danger" },
} satisfies Record<string, { label: string; tone: Tone }>;

export interface RoutineRecord {
  id: string;
  title: string;
  cadence: string;
  state: keyof typeof routineStates;
  nextRun?: string;
  lastRun?: string;
  canRun?: boolean;
}

export function RoutineRow({
  routine,
  onInspect,
  onEdit,
  onRun,
}: {
  routine: RoutineRecord;
  onInspect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRun?: (id: string) => void;
}) {
  const titleId = useId();
  const state = routineStates[routine.state];
  return (
    <article className="yg-routine-row" aria-labelledby={titleId}>
      <div className="yg-work-event-content">
        <strong id={titleId}>{routine.title}</strong>
        <Text variant="help">{routine.cadence}</Text>
        {(routine.nextRun || routine.lastRun) && (
          <div className="yg-operations-line">
            {routine.nextRun && (
              <Text variant="meta">Next · {routine.nextRun}</Text>
            )}
            {routine.lastRun && (
              <Text variant="meta">Last · {routine.lastRun}</Text>
            )}
          </div>
        )}
      </div>
      <div className="yg-operations-actions">
        <Badge tone={state.tone}>{state.label}</Badge>
        {onInspect && (
          <Button
            emphasis="quiet"
            size="compact"
            aria-label={`Inspect ${routine.title}`}
            onClick={() => onInspect(routine.id)}
          >
            Details
          </Button>
        )}
        {onEdit && (
          <Button
            emphasis="quiet"
            size="compact"
            aria-label={`Edit ${routine.title}`}
            onClick={() => onEdit(routine.id)}
          >
            Edit
          </Button>
        )}
        {onRun && (
          <Button
            emphasis="soft"
            size="compact"
            aria-label={`Run ${routine.title}`}
            disabled={routine.canRun === false || routine.state === "running"}
            onClick={() => onRun(routine.id)}
          >
            Run now
          </Button>
        )}
      </div>
    </article>
  );
}
