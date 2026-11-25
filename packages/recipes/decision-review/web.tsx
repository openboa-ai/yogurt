"use client";
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  ConfirmDialog,
  RecordFacts,
  Status,
  type Decision,
  type DecisionRef,
  type Fact,
  type Observation,
} from "@openboa/yogurt";

export function DecisionReview({
  title,
  facts,
  observation,
  decision,
  onConfirm,
  onHold,
  pending = false,
  result,
  state,
}: {
  title: string;
  facts: Fact[];
  observation: Observation;
  decision: Decision;
  onConfirm: (original: DecisionRef) => void;
  onHold?: () => void;
  pending?: boolean;
  result?: string;
  state?: "pending" | "held" | "approved" | "rejected";
}) {
  const [open, setOpen] = useState(false);
  const destructive = Boolean(decision.destructive);
  const cardState =
    state ?? (result ? "approved" : destructive ? "destructive" : "pending");
  return (
    <Card
      title={title}
      className="yg-decision-card"
      data-state={cardState}
      headerAction={result ? <Status tone="success">{result}</Status> : undefined}
      action={
        <ButtonGroup label="Decision actions" justify="end">
          {onHold && (
            <Button
              emphasis="soft"
              tone="neutral"
              disabled={!decision.available || pending}
              onClick={onHold}
            >
              Hold
            </Button>
          )}
          <Button
            emphasis="filled"
            tone={destructive ? "danger" : "brand"}
            disabled={!decision.available}
            pending={pending}
            onClick={() => setOpen(true)}
          >
            {decision.confirmLabel}
          </Button>
        </ButtonGroup>
      }
    >
      <RecordFacts facts={facts} {...observation} />
      <ConfirmDialog
        decision={decision}
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        pending={pending}
      />
    </Card>
  );
}
