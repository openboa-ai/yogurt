import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@openboa/yogurt/button";
import { ConfirmDialog } from "@openboa/yogurt/confirm-dialog";
import { Heading } from "@openboa/yogurt/heading";
import { Progress } from "@openboa/yogurt/progress";
import { Receipt } from "@openboa/yogurt/receipt";
import { RecordFacts } from "@openboa/yogurt/record-facts";
import { Stack } from "@openboa/yogurt/stack";
import { Yogurt } from "@openboa/yogurt/yogurt";
import "@openboa/yogurt/styles.css";

// The synthetic host owns these records and the command ledger.
const briefs = [
  { id: "A", name: "Brief", revision: "7" },
  { id: "B", name: "Brief", revision: "9" },
];
type Brief = typeof briefs[number];
type Command = { id: string; revision: string; action: string };
type SubmittedRequest = Command & { receiptId: string };
const commands: Command[] = [];
const lookups: string[] = [];
const requests = new Map<string, SubmittedRequest>();
const accepted = new Map<string, string>();

// The host accepts one request, then drops its acknowledgement before the app sees a final outcome.
function submit(request: SubmittedRequest) {
  const { receiptId, ...command } = request;
  commands.push(command);
  requests.set(receiptId, request);
}

function lookup(receiptId: string) {
  lookups.push(receiptId);
  return accepted.get(receiptId);
}

Object.assign(window, {
  fixture: {
    read: () => ({ commands, lookups }),
    complete: (receiptId: string, revision: string) => {
      if (!requests.has(receiptId)) throw Error("Unknown fixture receipt");
      accepted.set(receiptId, revision);
    },
  },
});

function DecisionClient() {
  const [selected, setSelected] = useState<Brief>();
  const [confirming, setConfirming] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedRequest>();
  const [effectiveRevision, setEffectiveRevision] = useState<string>();
  const receipt = selected && submitted?.id === selected.id ? submitted : undefined;
  const latestRevision = receipt && effectiveRevision ? effectiveRevision : selected?.revision;
  const confirmLabel = "Return for revision";

  return (
    <Yogurt>
      <main>
        <Stack gap={24}>
          <Heading level={1}>Editorial review</Heading>
          {!selected ? (
            <Stack gap={12}>
              {briefs.map(brief => (
                <Button key={brief.id} emphasis="soft" onClick={() => setSelected(brief)}>
                  Review {brief.name} {brief.id}
                </Button>
              ))}
            </Stack>
          ) : (
            <Stack gap={16}>
              <RecordFacts
                title={selected.name}
                facts={[
                  { id: "brief", label: "Record", value: selected.id },
                  { id: "revision", label: "Revision", value: latestRevision },
                ]}
                source="Editorial register"
                asOf="2026-01-12T09:15:00Z"
                timeLabel="09:15 UTC"
              />
              <Progress label="Review progress" value={receipt && effectiveRevision ? 2 : 1} max={2} />
              {receipt ? (
                <Receipt
                  record={{
                    id: receipt.receiptId,
                    state: effectiveRevision ? "confirmed" : "unknown",
                    description: effectiveRevision
                      ? `Brief ${receipt.id} was returned at revision ${effectiveRevision}.`
                      : "The connection closed before confirmation.",
                  }}
                  onLookup={effectiveRevision ? undefined : id => setEffectiveRevision(lookup(id))}
                />
              ) : (
                <Button tone="danger" onClick={() => setConfirming(true)}>{confirmLabel}</Button>
              )}
              <Button emphasis="quiet" onClick={() => setSelected(undefined)}>Back to briefs</Button>
              <ConfirmDialog
                decision={{
                  id: selected.id,
                  revision: selected.revision,
                  title: "Return this brief?",
                  consequence: "The editor will receive the selected brief for revision.",
                  confirmLabel,
                  available: !receipt,
                }}
                open={confirming}
                onOpenChange={setConfirming}
                onConfirm={original => {
                  const request = { ...original, action: confirmLabel, receiptId: "R-14" };
                  setSubmitted(request);
                  submit(request);
                }}
              />
            </Stack>
          )}
        </Stack>
      </main>
    </Yogurt>
  );
}

createRoot(document.getElementById("app")!).render(<DecisionClient />);
