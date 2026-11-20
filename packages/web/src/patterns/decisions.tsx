"use client";
import { words } from "../foundation/words.js";
import { useEffect, useRef, type ReactNode } from "react";
import { Dialog } from "../controls/layers.js";
import { Button, ButtonGroup } from "../controls/actions.js";
import { Stack, Heading } from "../foundation/foundation.js";

export interface Decision {
  id: string;
  revision: string;
  title: string;
  consequence: string;
  confirmLabel: string;
  available: boolean;
}
export interface DecisionRef {
  id: string;
  revision: string;
}
export function ConfirmDialog({
  decision,
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: {
  decision: Decision;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (original: DecisionRef) => void;
  pending?: boolean;
}) {
  const sent = useRef(false);
  const opened = useRef<DecisionRef | null>(null);
  useEffect(() => {
    if (!open) {
      opened.current = null;
      sent.current = false;
    } else if (!opened.current)
      opened.current = { id: decision.id, revision: decision.revision };
  }, [open, decision.id, decision.revision]);
  const changed =
    opened.current &&
    (opened.current.id !== decision.id ||
      opened.current.revision !== decision.revision);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={decision.title}
      description={decision.consequence}
    >
      <Stack gap={12}>
        {changed && (
          <p className="yg-error" role="status">
            This decision changed. Close and review it again.
          </p>
        )}
        <ButtonGroup label="Decision">
          <Button emphasis="quiet" onClick={() => onOpenChange(false)}>
            {words["action.cancel"]}
          </Button>
          <Button
            tone="danger"
            pending={pending}
            disabled={!decision.available || !!changed}
            onClick={() => {
              if (
                sent.current ||
                !decision.available ||
                !opened.current ||
                opened.current.id !== decision.id ||
                opened.current.revision !== decision.revision
              )
                return;
              sent.current = true;
              onOpenChange(false);
              onConfirm({ ...opened.current });
            }}
          >
            {decision.confirmLabel}
          </Button>
        </ButtonGroup>
      </Stack>
    </Dialog>
  );
}
export interface ReceiptRecord {
  id: string;
  state: "pending" | "confirmed" | "failed" | "unknown";
  description: ReactNode;
}
export function Receipt({
  record,
  onLookup,
  pending = false,
}: {
  record: ReceiptRecord;
  onLookup?: (originalId: string) => void;
  pending?: boolean;
}) {
  const titles = {
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    failed: "Request failed",
    unknown: words["state.unknown"],
  };
  return (
    <Stack className="yg-receipt" gap={8}>
      <Heading level={3}>{titles[record.state]}</Heading>
      <span className="yg-meta">Request {record.id}</span>
      <div>{record.description}</div>
      {onLookup && (
        <div>
          <Button
            emphasis="soft"
            pending={pending}
            onClick={() => onLookup(record.id)}
          >
            {words["action.lookup-original"]}
          </Button>
        </div>
      )}
    </Stack>
  );
}
