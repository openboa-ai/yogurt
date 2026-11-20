"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Icon } from "../foundation/foundation.js";

export function StorageMeter({ label, used, capacity, unit }: {
  label: string;
  used: number;
  capacity: number;
  unit: string;
}) {
  const id = useId();
  const known = Number.isFinite(used) && Number.isFinite(capacity) && capacity > 0 && used >= 0;
  const ratio = known ? Math.min(1, used / capacity) : 0;
  const ticks = 24;
  return (
    <div className="yg-storage-meter" data-full={ratio === 1 || undefined}>
      <strong id={id} className="yg-storage-heading">{label}</strong>
      {known ? (
        <div className="yg-storage-amount">
          <strong>{used} {unit}</strong>
          <span>of {capacity} {unit}</span>
        </div>
      ) : <span className="yg-help">Capacity unavailable</span>}
      {known && (
        <div className="yg-storage-ticks" role="meter" aria-labelledby={id}
          aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={Math.min(used, capacity)}
          aria-valuetext={`${used} of ${capacity} ${unit} used`}>
          {Array.from({length: ticks}, (_, index) => (
            <span key={index} data-filled={index + 0.5 <= ratio * ticks || undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityIsland({ label, summary, children }: {
  label: string;
  summary: string;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <section className="yg-activity-island" data-open={open}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
        <Icon name="clock" />
        <span>{label}</span>
        <span className="yg-island-summary">{summary}</span>
        <Icon name="down" />
      </button>
      <div className="yg-island-reveal" id={id} inert={!open}>
        <div><div className="yg-island-content">{children}</div></div>
      </div>
    </section>
  );
}

type ActionState = "idle" | "pending" | "success" | "error";

export function LoadingSuccessButton({ label, pendingLabel, successLabel, errorLabel, state, onAction }: {
  label: string;
  pendingLabel: string;
  successLabel: string;
  errorLabel: string;
  state: ActionState;
  onAction: () => void;
}) {
  const result = state === "success" ? successLabel : state === "error" ? errorLabel : null;
  return (
    <Button
      className="yg-result-action"
      data-outcome={state}
      pending={state === "pending"}
      pendingLabel={pendingLabel}
      onClick={onAction}
    >
      <span className="yg-result-action-label">
        <span aria-hidden="true" className="yg-result-action-measure">{label}</span>
        <span aria-hidden="true" className="yg-result-action-measure"><Icon name="check" /> {successLabel}</span>
        <span aria-hidden="true" className="yg-result-action-measure"><Icon name="close" /> {errorLabel}</span>
        <span key={state} data-result={result !== null || undefined}>
          {result && <Icon name={state === "success" ? "check" : "close"} />}
          {result ?? label}
        </span>
      </span>
    </Button>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState<ActionState>("idle");
  async function copy() {
    setState("pending");
    try {
      await navigator.clipboard.writeText(value);
      setState("success");
    } catch {
      setState("error");
    }
  }
  return (
    <div className="yg-copy-action">
      <LoadingSuccessButton label="Copy" pendingLabel="Copying" successLabel="Copied" errorLabel="Try again"
        state={state} onAction={copy} />
      <span role="status" className="yg-help">
        {state === "error" ? "Clipboard unavailable. Select and copy the text." :
          state === "success" ? "Copied to clipboard." : ""}
      </span>
    </div>
  );
}
