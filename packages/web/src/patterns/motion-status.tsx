"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Icon } from "../foundation/foundation.js";

type StorageCategory = {
  id: string;
  label: string;
  amount: number;
  detail?: ReactNode;
};

function StorageAmount({ value }: { value: number }) {
  const [whole, fraction] = String(value).split(".");
  const groups = [{digits: whole, decimal: false}, {digits: fraction, decimal: true}];
  return <strong className="yg-storage-count" aria-hidden="true">
    {groups.map(({digits, decimal}) => digits && <span key={String(decimal)}>
      {decimal && "."}
      {Array.from(digits, (digit, index) => {
        const column = digits.length - index - 1;
        if (!/^[0-9]$/.test(digit)) return <span key={column}>{digit}</span>;
        return <span className="yg-storage-reel" key={column} style={{
          "--yg-reel-digit": Number(digit), "--yg-reel-delay": column + (decimal ? 0 : fraction?.length ?? 0),
        } as CSSProperties}>
          <span>{Array.from("0123456789", number => <span key={number}>{number}</span>)}</span>
        </span>;
      })}
    </span>)}
  </strong>;
}

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
            <StorageAmount value={used} /><b aria-hidden="true">{unit}</b>
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

export function ActivityIsland({ label, summary, children, compact = false }: {
  label: string;
  summary: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const dimensions = {
    "--yg-island-w": `min(100%, ${open ? (compact ? 280 : 340) : (compact ? 184 : 244)}px)`,
    "--yg-island-h": open ? "auto" : `${compact ? 36 : 44}px`,
    "--yg-island-radius": open ? "32px" : `${compact ? 18 : 22}px`,
    "--yg-island-copy": Number(open),
  } as CSSProperties;
  return (
    <section className="yg-activity-island" style={dimensions} data-open={open} data-compact={compact || undefined}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
        <Icon name="clock" />
        <span>{label}</span>
        <span className="yg-island-summary">{summary}</span>
        <Icon name="down" />
      </button>
      <div className="yg-island-reveal" id={id} inert={!open}>
        <div className="yg-island-content">{children}</div>
      </div>
    </section>
  );
}

type ActionState = "idle" | "pending" | "success" | "error";
type ResultActionProps = {
  label: string; pendingLabel: string; successLabel: string; errorLabel: string;
  state: ActionState; onAction: () => void;
};

export function LoadingSuccessButton({ presentation, ...props }: ResultActionProps & {
  presentation?: "fitted" | "morphing";
  fluid?: boolean;
}) {
  if (presentation === "morphing") return <MorphingResultAction {...props} />;
  const { label, pendingLabel, successLabel, errorLabel, state, onAction } = props;
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

function MorphingResultAction({ label, pendingLabel, successLabel, errorLabel, state, onAction, fluid }: ResultActionProps & {fluid?: boolean}) {
  const pending = state === "pending", success = state === "success", result = success || state === "error";
  const ref = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button || !pending || !fluid) return;
    const sync = () => { button.style.setProperty("--yg-result-width", `${button.offsetHeight}px`); };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(sync);
    observer?.observe(button);
    sync();
    return () => observer?.disconnect();
  }, [pending, fluid]);
  const settledStyle = {
    "--yg-result-width": pending ? "56px" : fluid ? "100%" : result ? "140px" : "168px",
    "--yg-result-label": Number(state === "idle"),
    "--yg-result-spinner": Number(pending),
    "--yg-result-result": Number(result),
    "--yg-result-color": Number(success),
    "--yg-result-check": Number(success),
  } as CSSProperties;
  const accessible = pending ? pendingLabel : success ? successLabel : result ? errorLabel : label;
  return <button className="yg-result-morph" ref={ref} style={settledStyle} type="button" aria-label={accessible}
    aria-busy={pending || undefined} disabled={pending} data-outcome={state} onClick={onAction}>
    <span className="yg-result-morph-label" aria-hidden="true">{label}</span>
    <span className="yg-result-morph-spinner" aria-hidden="true"><i /></span>
    <span className="yg-result-morph-feedback" aria-hidden="true">
      {state === "error" ? <Icon name="close" /> :
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4.5 12 5 5L20 7" pathLength="22" />
        </svg>}
      {state === "error" ? errorLabel : successLabel}
    </span>
  </button>;
}

export function CopyButton({ value, onCopy, presentation = "standard", errorLabel = "Try again" }: {
  value: string;
  onCopy?: (text: string) => Promise<void>;
  presentation?: "standard" | "quiet";
  errorLabel?: string;
}) {
  const [state, setState] = useState<ActionState>("idle");
  const [copied, setCopied] = useState(0);
  const request = useRef(0);
  const pending = useRef<number | null>(null);
  const mounted = useRef(false);
  const roll = useRef<HTMLSpanElement>(null);
  const ready = useRef<HTMLSpanElement>(null);
  const done = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useLayoutEffect(() => {
    request.current++;
    setState(pending.current === null ? "idle" : "pending");
    return () => { request.current++; };
  }, [value]);
  useLayoutEffect(() => {
    const label = state === "success" ? done.current : ready.current;
    const node = roll.current;
    if (!label || !node) return;
    const sync = () => { node.style.inlineSize = `${label.offsetWidth}px`; };
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(sync);
    resize?.observe(label);
    if (!resize) window.addEventListener("resize", sync);
    sync();
    return () => { resize?.disconnect(); if (!resize) window.removeEventListener("resize", sync); };
  }, [state, errorLabel]);
  useEffect(() => {
    if (state !== "success") return;
    const reset = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(reset);
  }, [copied, state]);
  async function copy() {
    if (pending.current !== null) return;
    const current = ++request.current;
    pending.current = current;
    setState("pending");
    try {
      await (onCopy ? onCopy(value) : navigator.clipboard.writeText(value));
      if (request.current === current) {
        setState("success");
        setCopied(count => count + 1);
      }
    } catch {
      if (request.current === current) setState("error");
    } finally {
      if (pending.current === current) {
        pending.current = null;
        if (request.current !== current && mounted.current) setState("idle");
      }
    }
  }
  const actionLabel = state === "success" ? "Copied" : state === "error" ? errorLabel : "Copy";
  return (
    <div className="yg-copy-action" data-presentation={presentation}>
      <button className="yg-copy-button" style={{ "--yg-copy-roll": Number(state === "success"), "--yg-copy-icon": Number(state === "success") } as CSSProperties} type="button" aria-label={actionLabel} aria-disabled={state === "pending" || undefined}
        data-outcome={state} onClick={copy}>
        <span className="yg-copy-icons" aria-hidden="true"><Icon name="copy" /><Icon name="check" /></span>
        <span ref={roll} className="yg-copy-roll" aria-hidden="true">
          <span><span ref={ready}>{state === "error" ? errorLabel : "Copy"}</span><span ref={done}>Copied</span></span>
        </span>
      </button>
      <span role="status" className="yg-help">
        {state === "error" ? "Copy failed. Select and copy the text." :
          state === "success" ? "Copied to clipboard." : ""}
      </span>
    </div>
  );
}
