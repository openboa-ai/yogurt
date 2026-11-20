"use client";
import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  RecordFacts,
  Stack,
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
  pending = false,
  result,
}: {
  title: string;
  facts: Fact[];
  observation: Observation;
  decision: Decision;
  onConfirm: (original: DecisionRef) => void;
  pending?: boolean;
  result?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={16}>
      <RecordFacts title={title} facts={facts} {...observation} />
      {result && <Status>{result}</Status>}
      <Button
        emphasis="soft"
        tone="danger"
        disabled={!decision.available}
        pending={pending}
        onClick={() => setOpen(true)}
      >
        {decision.confirmLabel}
      </Button>
      <ConfirmDialog
        decision={decision}
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        pending={pending}
      />
    </Stack>
  );
}
