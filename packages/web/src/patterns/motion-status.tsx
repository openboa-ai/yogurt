"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Icon } from "../foundation/foundation.js";
import { playSprings, snap, spring } from "../foundation/spring-motion.js";

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

export function ActivityIsland({ label, summary, children }: {
  label: string;
  summary: string;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const capsule = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [tracks] = useState(() => ({
    width: spring(244,380,24), height: spring(44,300,22),
    press: spring(1,520,18), copy: spring(0,260,28),
  }));
  useLayoutEffect(() => {
    const visible = capsule.current, content = panel.current;
    if (!visible || !content) return;
    let stop: (() => void) | undefined;
    const sync = () => {
      const room = visible.parentElement?.clientWidth ?? 340;
      tracks.width.target = Math.min(room, open ? 340 : 244);
      tracks.height.target = 44 + (open ? content.offsetHeight : 0);
      tracks.height.stiffness = open ? 300 : 390;
      tracks.copy.target = Number(open);
      stop?.();
      stop = playSprings(Object.values(tracks), () => {
        const h = Math.max(44, tracks.height.position);
        const give = Math.min(.05, Math.max(-.05, -tracks.height.velocity/7000));
        visible.style.setProperty("--yg-island-w", `${tracks.width.position * (1+give)}px`);
        visible.style.setProperty("--yg-island-h", `${h}px`);
        visible.style.setProperty("--yg-island-radius", `${Math.min(32,h/2)}px`);
        visible.style.setProperty("--yg-island-press", String(tracks.press.position));
        visible.style.setProperty("--yg-island-copy", String(Math.min(1, Math.max(0, tracks.copy.position))));
      });
    };
    sync();
    let parentWidth = visible.parentElement?.clientWidth;
    const changes = new ResizeObserver(entries => {
      const width = visible.parentElement?.clientWidth;
      if (width === parentWidth && entries.every(entry => entry.target !== content)) return;
      parentWidth = width;
      sync();
    });
    changes.observe(content);
    if (visible.parentElement) changes.observe(visible.parentElement);
    return () => { changes.disconnect(); stop?.(); };
  }, [open, tracks]);
  return (
    <section ref={capsule} className="yg-activity-island" data-open={open}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => {
        tracks.press.velocity -= open ? 1 : 1.6;
        setOpen(value => !value);
      }}>
        <Icon name="clock" />
        <span>{label}</span>
        <span className="yg-island-summary">{summary}</span>
        <Icon name="down" />
      </button>
      <div className="yg-island-reveal" id={id} inert={!open}>
        <div className="yg-island-content" ref={panel}>{children}</div>
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

function MorphingResultAction({ label, pendingLabel, successLabel, errorLabel, state, onAction }: ResultActionProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [motion] = useState(() => ({
    width: spring(168, 300, 22), label: spring(1, 400, 30), spinner: spring(0, 300, 28),
    result: spring(0, 220, 20), color: spring(0, 200, 30), check: spring(0, 120, 20),
  }));
  const pending = state === "pending", success = state === "success", result = success || state === "error";
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button) return;
    const tracked = Object.values(motion);
    motion.width.target = pending ? 56 : result ? 140 : 168;
    const restore = state === "idle" && motion.result.position > .05;
    motion.label.target = state === "idle" && !restore ? 1 : 0;
    motion.spinner.target = Number(pending);
    motion.result.target = Number(result);
    motion.color.target = Number(success);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!success || reduced) motion.check.target = Number(success);
    if (restore && reduced) motion.label.target = 1;
    const paint = () => {
      for (const [name, track] of Object.entries(motion)) {
        button.style.setProperty(`--yg-result-${name}`, name === "width" ? `${track.position}px` : String(track.position));
      }
    };
    let stop = playSprings(tracked, paint);
    const delay = reduced ? 0 : success ? 150 : restore ? 120 : 0;
    const timed = delay ? setTimeout(() => {
      if (success) motion.check.target = 1;
      else motion.label.target = 1;
      stop();
      stop = playSprings(tracked, paint);
    }, delay) : undefined;
    return () => { clearTimeout(timed); stop(); };
  }, [motion, pending, result, state, success]);
  const accessible = pending ? pendingLabel : success ? successLabel : result ? errorLabel : label;
  return <button className="yg-result-morph" ref={ref} type="button" aria-label={accessible}
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

export function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState<ActionState>("idle");
  const [copied, setCopied] = useState(0);
  const pending = useRef(false);
  const roll = useRef<HTMLSpanElement>(null);
  const ready = useRef<HTMLSpanElement>(null);
  const done = useRef<HTMLSpanElement>(null);
  const [motion] = useState(() => ({label: spring(0, 260, 20), icon: spring(0, 420, 18), width: spring(0, 300, 24)}));
  useLayoutEffect(() => {
    const label = state === "success" ? done.current : ready.current;
    const node = roll.current;
    if (!label || !node) return;
    const sync = () => {
      motion.label.target = motion.icon.target = Number(state === "success");
      motion.width.target = label.offsetWidth;
      if (motion.width.position === 0) snap(motion.width, motion.width.target);
      stop?.();
      stop = playSprings(Object.values(motion), () => {
        node.parentElement?.style.setProperty("--yg-copy-roll", String(motion.label.position));
        node.parentElement?.style.setProperty("--yg-copy-icon", String(motion.icon.position));
        node.style.inlineSize = `${motion.width.position}px`;
      });
    };
    let stop: (() => void) | undefined;
    const resize = new ResizeObserver(sync);
    resize.observe(label);
    sync();
    return () => { resize.disconnect(); stop?.(); };
  }, [motion, state]);
  useEffect(() => {
    if (state !== "success") return;
    const reset = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(reset);
  }, [copied, state]);
  async function copy() {
    if (pending.current) return;
    pending.current = true;
    setState(current => current === "success" ? current : "pending");
    try {
      await navigator.clipboard.writeText(value);
      setState("success");
      setCopied(count => count + 1);
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }
  const actionLabel = state === "success" ? "Copied" : state === "error" ? "Try again" : "Copy";
  return (
    <div className="yg-copy-action">
      <button className="yg-copy-button" type="button" aria-label={actionLabel} disabled={state === "pending"}
        data-outcome={state} onClick={copy}>
        <span className="yg-copy-icons" aria-hidden="true"><Icon name="copy" /><Icon name="check" /></span>
        <span ref={roll} className="yg-copy-roll" aria-hidden="true">
          <span><span ref={ready}>{state === "error" ? "Try again" : "Copy"}</span><span ref={done}>Copied</span></span>
        </span>
      </button>
      <span role="status" className="yg-help">
        {state === "error" ? "Clipboard unavailable. Select and copy the text." :
          state === "success" ? "Copied to clipboard." : ""}
      </span>
    </div>
  );
}
