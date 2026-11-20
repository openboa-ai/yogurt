"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Icon } from "../foundation/foundation.js";

type StorageCategory = {
  id: string;
  label: string;
  amount: number;
  detail?: ReactNode;
};

export function StorageMeter({ label, used, capacity, unit, categories = [] }: {
  label: string;
  used: number;
  capacity: number;
  unit: string;
  categories?: readonly StorageCategory[];
}) {
  const id = useId();
  const [expanded, setExpanded] = useState<string | null>(null);
  const known = Number.isFinite(used) && Number.isFinite(capacity) && capacity > 0 && used >= 0;
  const ratio = known ? Math.min(1, used / capacity) : 0;
  let available = known ? Math.min(used, capacity) : 0;
  const breakdown = categories.filter(category => Number.isFinite(category.amount) && category.amount > 0);
  const bars = breakdown.map<{id?: string; fraction: number; tone?: number}>((category, index) => {
    const amount = Math.min(category.amount, available);
    available -= amount;
    return { id: category.id, fraction: known ? amount / capacity : 0, tone: index % 3 };
  });
  if (available > 0) bars.push({fraction: available / capacity});
  const highlighted = bars.some(bar => bar.id === expanded && bar.fraction > 0);

  return (
    <section className="yg-storage-meter" data-full={ratio === 1 || undefined}>
      <strong id={id} className="yg-storage-heading">{label}</strong>
      {known ? (
        <>
          <div className="yg-storage-amount">
            <strong key={used}>{used}</strong><b>{unit}</b>
            <span>of {capacity} {unit}</span>
          </div>
          <div className="yg-storage-bar" role="meter" aria-labelledby={id}
            aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={Math.min(used, capacity)}
            aria-valuetext={`${used} of ${capacity} ${unit} used`} data-highlight={highlighted || undefined}>
            {bars.map(({id: categoryId, fraction, tone}) => (
              <span key={categoryId ?? id} data-tone={tone} data-selected={categoryId === expanded || undefined}
                style={{inlineSize: `${fraction * 100}%`}} />
            ))}
          </div>
          {breakdown.length > 0 && <ul className="yg-storage-categories">
            {breakdown.map((category, index) => {
              const opened = expanded === category.id;
              const detailId = `${id}-category-${index}`;
              return <li key={category.id} data-open={opened || undefined}>
                <button type="button" onClick={() => setExpanded(opened ? null : category.id)}
                  aria-expanded={category.detail ? opened : undefined} aria-pressed={category.detail ? undefined : opened} aria-controls={category.detail ? detailId : undefined}>
                  <span className="yg-storage-dot" data-tone={index % 3} aria-hidden="true" />
                  <span>{category.label}</span>
                  <span className="yg-storage-category-amount">{category.amount} {unit}</span>
                </button>
                {category.detail && <div className="yg-storage-reveal" id={detailId} inert={!opened}>
                  <div><div className="yg-storage-category-detail">{category.detail}</div></div>
                </div>}
              </li>;
            })}
          </ul>}
        </>
      ) : <span className="yg-help">Capacity unavailable</span>}
    </section>
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
