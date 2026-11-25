"use client";
import { useId, type ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
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
  running: { label: "Running", tone: "neutral" },
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
  const detailId = useId();
  const current = runs.find((run) => run.id === selectedId);
  const status = current && states[current.state];
  const canRetry =
    current?.canRetry && (current.state === "blocked" || current.state === "failed");
  const canCancel =
    current?.canCancel &&
    (current.state === "queued" || current.state === "running" || current.state === "blocked");
  return (
    <div className="yg-run-inspector">
      <div role="region" aria-label="Run history" className="yg-run-inspector-layout">
      <Card title="Run history" density="compact">
        {loading ? (
          <Skeleton label="Loading runs" />
        ) : runs.length === 0 ? (
          <Result title="No runs yet" />
        ) : (
          <List label="Runs" divided>
            {runs.map((run) => (
              <ListRow
                key={run.id}
                title={run.title}
                inlineMeta={
                  <Badge tone={states[run.state].tone}>
                    {states[run.state].label}
                  </Badge>
                }
                description={run.time}
                current={run.id === selectedId}
                onActivate={() => onSelect(run.id)}
              />
            ))}
          </List>
        )}
      </Card>
      {!loading && runs.length > 0 && (
        current && status ? (
          <Card
            key={current.id}
            title={current.title}
            description={current.summary}
            headerAction={<Status tone={status.tone}>{status.label}</Status>}
            action={
              ((canRetry && onRetry) || (canCancel && onCancel)) ? (
                <ButtonGroup label="Run actions" justify="end">
                  {canCancel && onCancel && (
                    <Button
                      emphasis="quiet"
                      size="compact"
                      pending={current.pending}
                      onClick={() => onCancel(current.id)}
                    >
                      Cancel run
                    </Button>
                  )}
                  {canRetry && onRetry && (
                    <Button
                      emphasis="filled"
                      tone="brand"
                      pending={current.pending}
                      onClick={() => onRetry(current.id)}
                    >
                      Retry run
                    </Button>
                  )}
                </ButtonGroup>
              ) : undefined
            }
          >
            <Stack role="region" aria-labelledby={detailId} gap={12}>
              <span id={detailId} className="yg-sr-only">{current.title}</span>
              {current.steps.length > 0 && <Trace label="Steps" events={[...current.steps]} />}
              {(current.result != null || renderResult) && (
                <Stack gap={4}>
                  <Heading level={4}>Result</Heading>
                  {current.result}
                  {renderResult?.(current)}
                </Stack>
              )}
            </Stack>
          </Card>
        ) : (
          <Card density="compact">
            <Result title="Select a run to see its details" />
          </Card>
        )
      )}
      </div>
    </div>
  );
}
