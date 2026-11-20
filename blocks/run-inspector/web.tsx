"use client";
import { useId, type ReactNode } from "react";
import {
  Button,
  ButtonGroup,
  Heading,
  List,
  ListRow,
  Result,
  Skeleton,
  Stack,
  Status,
  Text,
  Trace,
  type Tone,
  type TraceEvent,
} from "@openboa/yogurt";

const states = {
  queued: { label: "Queued", tone: "neutral" },
  running: { label: "Running", tone: "brand" },
  blocked: { label: "Blocked", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  complete: { label: "Complete", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
} satisfies Record<string, { label: string; tone: Tone }>;

export interface RunRecord {
  id: string;
  title: string;
  time?: string;
  state: keyof typeof states;
  summary?: string;
  steps: readonly TraceEvent[];
  result?: ReactNode;
  canRetry?: boolean;
  canCancel?: boolean;
  pending?: boolean;
}

export function RunInspector({
  runs,
  selectedId,
  onSelect,
  onRetry,
  onCancel,
  renderResult,
  loading,
}: {
  runs: readonly RunRecord[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  renderResult?: (run: RunRecord) => ReactNode;
  loading?: boolean;
}) {
  const headingId = useId();
  const detailId = useId();
  const current = runs.find((run) => run.id === selectedId);
  const status = current && states[current.state];
  const canRetry =
    current?.canRetry && (current.state === "blocked" || current.state === "failed");
  const canCancel =
    current?.canCancel &&
    (current.state === "queued" || current.state === "running" || current.state === "blocked");
  return (
    <Stack role="region" aria-labelledby={headingId} gap={16}>
      <Heading id={headingId}>Run history</Heading>
      {loading ? (
        <Skeleton label="Loading runs" />
      ) : runs.length === 0 ? (
        <Result title="No runs yet" />
      ) : (
        <>
          <List label="Runs">
            {runs.map((run) => (
              <ListRow
                key={run.id}
                title={run.title}
                description={run.time}
                trailing={
                  <Text variant="meta">
                    {run.id === selectedId && "Selected · "}
                    {states[run.state].label}
                  </Text>
                }
                onActivate={() => onSelect(run.id)}
              />
            ))}
          </List>
          {current && status ? (
            <Stack key={current.id} role="region" aria-labelledby={detailId} gap={12}>
              <Stack gap={4}>
                <Heading id={detailId} level={3}>{current.title}</Heading>
                <Status tone={status.tone}>{status.label}</Status>
                {current.summary && <Text variant="help">{current.summary}</Text>}
              </Stack>
              {current.steps.length > 0 && <Trace label="Steps" events={[...current.steps]} />}
              {(current.result != null || renderResult) && (
                <Stack gap={4}>
                  <Heading level={3}>Result</Heading>
                  {current.result}
                  {renderResult?.(current)}
                </Stack>
              )}
              {((canRetry && onRetry) || (canCancel && onCancel)) && (
                <ButtonGroup label="Run actions">
                  {canRetry && onRetry && (
                    <Button
                      emphasis="soft"
                      pending={current.pending}
                      onClick={() => onRetry(current.id)}
                    >
                      Retry run
                    </Button>
                  )}
                  {canCancel && onCancel && (
                    <Button
                      emphasis="quiet"
                      pending={current.pending}
                      onClick={() => onCancel(current.id)}
                    >
                      Cancel run
                    </Button>
                  )}
                </ButtonGroup>
              )}
            </Stack>
          ) : (
            <Result title="Select a run to see its details" />
          )}
        </>
      )}
    </Stack>
  );
}
