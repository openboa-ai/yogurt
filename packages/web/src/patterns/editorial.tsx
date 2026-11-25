"use client";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Heading, Icon, cx, type Tone } from "../foundation/foundation.js";
import { Button } from "../controls/actions.js";
import { Badge, Toast } from "../controls/feedback.js";
import { playSprings, snap, spring } from "../foundation/spring-motion.js";
import { CopyButton } from "./motion-status.js";

type Content = { children: ReactNode };
type NamedSection = Content & {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  action?: ReactNode;
};
export function Card({
  title,
  description,
  headerAction,
  children,
  action,
  density = "regular",
  variant = "raised",
  className,
  "data-state": dataState,
}: NamedSection & {
  density?: "compact" | "regular" | "spacious";
  variant?: "raised" | "outlined" | "subtle";
  className?: string;
  "data-state"?: string;
}) {
  const hasHeader = Boolean(title || description || headerAction);
  return (
    <section
      className={cx("yg-card", className)}
      data-density={density}
      data-variant={variant}
      data-state={dataState}
    >
      {hasHeader && (
        <header className="yg-card-header">
          <div className="yg-card-header-copy">
            {title && <Heading level={3}>{title}</Heading>}
            {description && <p className="yg-help">{description}</p>}
          </div>
          {headerAction && (
            <div className="yg-card-header-action">{headerAction}</div>
          )}
        </header>
      )}
      <div className="yg-card-body">{children}</div>
      {action && <footer className="yg-card-footer">{action}</footer>}
    </section>
  );
}
export function Asset({
  children,
  size = 40,
  framed = false,
}: Content & { size?: number; framed?: boolean }) {
  return (
    <span
      className="yg-asset"
      data-framed={framed || undefined}
      style={{ inlineSize: size, blockSize: size }}
    >
      {children}
    </span>
  );
}
export function GridList({
  label,
  items,
  minWidth = 128,
}: {
  label: string;
  items: { id: string; content: ReactNode }[];
  minWidth?: number;
}) {
  return (
    <ul
      className="yg-grid-list"
      aria-label={label}
      style={{ "--yg-cell": Math.max(1, minWidth) + "px" } as CSSProperties}
    >
      {items.map((item) => (
        <li key={item.id}>{item.content}</li>
      ))}
    </ul>
  );
}
export function ListHeader({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <header className="yg-section-line">
      <div>
        <Heading level={3}>{title}</Heading>
        {detail && <span className="yg-help">{detail}</span>}
      </div>
      {action}
    </header>
  );
}
export function PageHeader({
  title,
  detail,
  eyebrow,
  subtitle,
  leading,
  action,
  featured = false,
  className,
}: {
  title: string;
  detail?: string;
  eyebrow?: string;
  subtitle?: string;
  leading?: ReactNode;
  action?: ReactNode;
  featured?: boolean;
  className?: string;
}) {
  return (
    <header className={cx("yg-section-line", "yg-page-header", className)} data-featured={featured || undefined}>
      <div>
        {eyebrow && <p className="yg-meta">{eyebrow}</p>}
        <div className="yg-page-header-title">
          {leading}
          <Heading level={1} tabIndex={-1}>{title}</Heading>
        </div>
        {subtitle && <p className="yg-page-header-subtitle">{subtitle}</p>}
        {detail && <p className="yg-page-header-detail">{detail}</p>}
      </div>
      {action && <div className="yg-page-header-actions">{action}</div>}
    </header>
  );
}
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="yg-loading" role="status" aria-label={label}>
      <span className="yg-spinner" aria-hidden="true" />
    </span>
  );
}
type SwipeSample = { time: number; x: number };

function SwipeToast({ message, disabled, exiting, onDismiss }: { message: string; disabled: boolean; exiting: boolean; onDismiss: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const motion = useRef(spring(0, 520, 2 * Math.sqrt(520)));
  const stop = useRef<(() => void) | undefined>(undefined);
  const active = useRef<{ id: number; x: number; y: number; start: number; axis?: "x" | "y"; samples: SwipeSample[] } | null>(null);
  const wasDisabled = useRef(disabled);

  useEffect(() => () => { active.current = null; stop.current?.(); }, []);
  useLayoutEffect(() => {
    if (disabled) {
      active.current = null;
      stop.current?.();
    }
    // A host-confirmed exit retains the last dragged position. Obscured or
    // re-added notices instead return to a neutral, interactive position.
    if ((disabled && !exiting) || (!disabled && wasDisabled.current)) {
      snap(motion.current, 0);
      if (card.current) { card.current.style.translate = "0px 0"; card.current.style.opacity = "1"; }
    }
    wasDisabled.current = disabled;
  }, [disabled, exiting]);

  function paint(x: number) {
    if (!card.current) return;
    card.current.style.translate = `${x}px 0`;
    card.current.style.opacity = String(Math.max(.3, 1 - Math.abs(x) / 240));
  }
  function settle(velocity = 0) {
    const state = motion.current;
    stop.current?.();
    state.target = 0;
    state.velocity = velocity * 1000;
    stop.current = playSprings([state], () => paint(state.position));
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    const gesture = active.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    active.current = null;
    if (gesture.axis !== "x") { settle(); return; }
    const first = gesture.samples[0], last = gesture.samples.at(-1) ?? first;
    const elapsed = last.time - first.time;
    const velocity = elapsed > 0 && event.timeStamp - last.time <= 80 ? (last.x - first.x) / elapsed : 0;
    const x = motion.current.position;
    const committed = event.type === "pointerup" &&
      (Math.abs(x) > 100 || Math.abs(velocity) > .11 && Math.sign(x) === Math.sign(velocity));
    settle(velocity);
    if (committed && !disabled) onDismiss();
  }
  return <div ref={card} className="yg-toast-swipe" onPointerDown={event => {
    if (disabled || active.current || !event.isPrimary || event.button !== 0 ||
      (event.target instanceof Element && event.target.closest("button, a, input, textarea, select, [contenteditable]:not([contenteditable='false'])"))) return;
    stop.current?.();
    active.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: motion.current.position,
      samples: [{ time: event.timeStamp, x: motion.current.position }] };
  }} onPointerMove={event => {
    const gesture = active.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (gesture.axis === "x") event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (gesture.axis !== "x") return;
    snap(motion.current, gesture.start + dx);
    paint(motion.current.position);
    gesture.samples.push({ time: event.timeStamp, x: motion.current.position });
    while (gesture.samples.length > 2 && event.timeStamp - gesture.samples[0].time > 80) gesture.samples.shift();
  }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onPointerLeave={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) release(event); }}>
    <Toast message={message} onDismiss={onDismiss} />
  </div>;
}

export function ToastStack({
  items,
  onDismiss,
  label = "Notifications",
  presentation = "list",
  defaultExpanded = false,
  swipe = false,
}: {
  items: { id: string; message: string }[];
  onDismiss: (id: string) => void;
  label?: string;
  presentation?: "list" | "stacked";
  defaultExpanded?: boolean;
  swipe?: boolean;
}) {
  type Entry = { id: string; message: string; exiting: boolean };
  const [entries, setEntries] = useState<Entry[]>(() => items.map((item) => ({ ...item, exiting: false })));
  const currentIds = useRef(new Set(items.map((item) => item.id)));
  const currentEntries = useRef(entries);
  const root = useRef<HTMLElement>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const collectionId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [stackGap, setStackGap] = useState(8);
  const priorPositions = useRef(new Map<string, { y: number; scale: number; depth: number }>());
  const toggleNode = useRef<HTMLButtonElement | null>(null);
  const restoreToggleFocus = useRef(false);
  const setToggleNode = useCallback((node: HTMLButtonElement | null) => {
    if (!node && toggleNode.current?.ownerDocument.activeElement === toggleNode.current) {
      restoreToggleFocus.current = true;
    }
    toggleNode.current = node;
  }, []);
  useLayoutEffect(() => {
    currentIds.current = new Set(items.map((item) => item.id));
    currentEntries.current = entries;
  }, [items, entries]);
  const finish = (id: string, expected: Entry) => {
    if (currentEntries.current.find((entry) => entry.id === id) !== expected) return;
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    if (!currentIds.current.has(id)) setEntries((previous) => previous.filter((entry) => entry.id !== id || !entry.exiting));
  };
  useLayoutEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    for (const id of ids) {
      const timer = timers.current.get(id);
      if (timer) { clearTimeout(timer); timers.current.delete(id); }
    }
    const active = items.map((item) => {
      const existing = entries.find((entry) => entry.id === item.id && !entry.exiting && entry.message === item.message);
      return existing ?? { ...item, exiting: false };
    });
    const leaving = entries.filter((entry) => !ids.has(entry.id)).map((entry) => entry.exiting ? entry : { ...entry, exiting: true });
    const next = [...active, ...leaving];
    if (next.length === entries.length && next.every((entry, index) =>
      entry.id === entries[index].id && entry.message === entries[index].message && entry.exiting === entries[index].exiting)) return;
    const focus = root.current?.ownerDocument.activeElement;
    const focusedEntry = focus instanceof Element ? focus.closest<HTMLElement>("[data-yg-toast-id]") : null;
    if (focusedEntry && root.current?.contains(focusedEntry) && !ids.has(focusedEntry.dataset.ygToastId ?? "")) {
      const targets = [...root.current.querySelectorAll<HTMLElement>("[data-yg-toast-id]")];
      const replacement = targets.find((node) => ids.has(node.dataset.ygToastId ?? "") && !node.closest("[inert]"))?.querySelector<HTMLButtonElement>("button:not(:disabled)");
      replacement?.focus();
      if (!replacement || root.current.ownerDocument.activeElement !== replacement) root.current.focus();
    }
    setEntries(next);
  }, [items, entries]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (!media.matches) return;
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
      setEntries((previous) => previous.filter((entry) => !entry.exiting || currentIds.current.has(entry.id)));
    };
    media.addEventListener("change", settle);
    settle();
    return () => {
      media.removeEventListener("change", settle);
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };
  }, []);
  useEffect(() => {
    const exiting = new Set(entries.filter((entry) => entry.exiting).map((entry) => entry.id));
    for (const [id, timer] of timers.current) {
      if (!exiting.has(id)) { clearTimeout(timer); timers.current.delete(id); }
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (exiting.size) setEntries((previous) => previous.filter((entry) => !entry.exiting || currentIds.current.has(entry.id)));
      return;
    }
    for (const entry of entries.filter((item) => item.exiting)) {
      if (timers.current.has(entry.id)) continue;
      const element = [...(root.current?.querySelectorAll<HTMLElement>("[data-yg-toast-id]") ?? [])]
        .find((node) => node.dataset.ygToastId === entry.id);
      const style = element && getComputedStyle(element);
      const milliseconds = (value: string) => value.trim().endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
      const durations = style?.animationDuration.split(",").map(milliseconds) ?? [0];
      const delays = style?.animationDelay.split(",").map(milliseconds) ?? [0];
      const iterations = style?.animationIterationCount.split(",").map((value) => Number(value.trim())) ?? [1];
      const total = durations.reduce((longest, duration, index) => {
        const count = iterations[index % iterations.length];
        return Number.isFinite(count) ? Math.max(longest, duration * count + delays[index % delays.length]) : Infinity;
      }, 0);
      if (Number.isFinite(total)) timers.current.set(entry.id, setTimeout(() => finish(entry.id, entry), Math.max(0, total) + 100));
    }
  }, [entries]);
  useLayoutEffect(() => {
    if (presentation !== "stacked" || !root.current) return;
    const nodes = [...root.current.querySelectorAll<HTMLElement>("[data-yg-toast-id]")];
    const measure = () => {
      const host = root.current;
      if (!host) return;
      const next = Object.fromEntries(nodes.map((node) => [node.dataset.ygToastId!, node.offsetHeight]));
      setHeights((previous) => Object.keys(previous).length === Object.keys(next).length &&
        Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next);
      const gap = parseFloat(getComputedStyle(host).rowGap);
      if (Number.isFinite(gap)) setStackGap(gap);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    nodes.forEach((node) => observer?.observe(node));
    return () => observer?.disconnect();
  }, [entries, presentation]);

  const active = entries.filter((entry) => !entry.exiting);
  const showToggle = presentation === "stacked" && active.length > 1;
  useLayoutEffect(() => {
    const host = root.current;
    if (!restoreToggleFocus.current || !host) return;
    restoreToggleFocus.current = false;
    const focused = host.ownerDocument.activeElement;
    if (focused && focused !== host.ownerDocument.body && focused.isConnected) return;
    const remaining = [...host.querySelectorAll<HTMLElement>("[data-yg-toast-id]")]
      .find((node) => currentIds.current.has(node.dataset.ygToastId ?? "") && !node.closest("[inert]"));
    const target = remaining?.querySelector<HTMLButtonElement>("button:not(:disabled)") ?? host;
    target.focus();
    if (host.ownerDocument.activeElement !== target) host.focus();
  }, [showToggle, presentation, active.length]);
  const compact = presentation === "stacked" && !expanded && active.length > 1;
  const firstHeight = heights[active[0]?.id] ?? 0;
  let offset = 0;
  const positions = new Map<string, { y: number; scale: number; depth: number }>();
  active.forEach((entry, index) => {
    const depth = Math.min(index, 2);
    positions.set(entry.id, compact ? { y: depth * stackGap, scale: 1 - depth * .05, depth: index }
      : { y: offset, scale: 1, depth: index });
    offset += (heights[entry.id] ?? 0) + stackGap;
  });
  const stackHeight = compact ? firstHeight + Math.min(active.length - 1, 2) * stackGap
    : Math.max(0, offset - stackGap);
  useLayoutEffect(() => {
    if (presentation !== "stacked") return;
    priorPositions.current = positions;
  });
  const renderEntry = (item: Entry, obscured = false) => (
    <div key={item.id} data-yg-toast-id={item.id} data-exiting={item.exiting || undefined}
      aria-hidden={item.exiting || undefined} inert={item.exiting || undefined}
      onAnimationEnd={(event) => { if (event.target === event.currentTarget && item.exiting) finish(item.id, item); }}>
      {swipe ? <SwipeToast message={item.message} disabled={item.exiting || obscured} exiting={item.exiting}
        onDismiss={() => { if (!item.exiting) onDismiss(item.id); }} />
        : <Toast message={item.message} onDismiss={() => { if (!item.exiting) onDismiss(item.id); }} />}
    </div>
  );
  if (presentation === "stacked") {
    return (
      <section ref={root} className="yg-stack yg-toast-stack" aria-label={label} tabIndex={-1}>
        {showToggle && <Button ref={setToggleNode} emphasis="quiet" size="compact" aria-controls={collectionId}
          aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show fewer" : `Show all ${active.length}`}
        </Button>}
        <div id={collectionId} className="yg-toast-stack-stage" data-expanded={!compact}
          style={{ height: `${stackHeight}px` }} onFocusCapture={(event) => {
            const entry = (event.target as HTMLElement).closest<HTMLElement>("[data-yg-toast-id]");
            if (compact && entry && entry.dataset.ygToastId !== active[0]?.id) setExpanded(true);
          }}>
          {entries.map((item) => {
            const position = positions.get(item.id) ?? priorPositions.current.get(item.id) ?? { y: 0, scale: 1, depth: 0 };
            return <div key={item.id} className="yg-toast-stack-slot" data-behind={compact && position.depth > 0 || undefined}
              style={{ transform: `translateY(${position.y}px) scale(${position.scale})`, zIndex: entries.length - position.depth,
                maxHeight: compact && position.depth > 0 ? `${firstHeight}px` : undefined }}>
              {renderEntry(item, compact && position.depth > 0)}
            </div>;
          })}
        </div>
      </section>
    );
  }
  return (
    <section ref={root} className="yg-stack" aria-label={label} tabIndex={-1}>
      {entries.map(item => renderEntry(item))}
    </section>
  );
}
const avatarSizes = { compact: 26, regular: 36, large: 44 } as const;
export function Avatar({
  label,
  src,
  size = 36,
}: {
  label: string;
  src?: string;
  size?: number | keyof typeof avatarSizes;
}) {
  const px = typeof size === "number" ? size : avatarSizes[size];
  const [failed, setFailed] = useState<string>();
  const initials = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => Array.from(s)[0])
    .join("")
    .toUpperCase();
  return (
    <span
      role="img"
      aria-label={label}
      className="yg-avatar"
      style={{ inlineSize: px, blockSize: px }}
    >
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
export function CodeBlock({
  code,
  language,
  onCopy,
}: {
  code: string;
  language: string;
  onCopy?: (text: string) => Promise<void>;
}) {
  return (
    <section className="yg-code" aria-label={language + " code"}>
      <header>
        <span>{language}</span>
        <CopyButton value={code} onCopy={onCopy} presentation="quiet" errorLabel="Copy failed" />
      </header>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </section>
  );
}
export interface TraceEvent {
  id: string;
  title: string;
  detail: ReactNode;
  state?: "working" | "complete" | "failed" | "flagged";
  latency?: string;
  index?: string;
}
const traceStateMeta: Record<NonNullable<TraceEvent["state"]>, { label: string; tone: Tone }> = {
  working: { label: "Running", tone: "brand" },
  complete: { label: "Done", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  flagged: { label: "Flagged", tone: "warning" },
};
export function Trace({
  label,
  events,
}: {
  label: string;
  events: TraceEvent[];
}) {
  const id = useId();
  return (
    <section className="yg-trace" aria-labelledby={id}>
      <div className="yg-trace-header">
        <Heading id={id} level={4}>
          {label}
        </Heading>
        <span className="yg-trace-count">
          {events.length} {events.length === 1 ? "step" : "steps"}
        </span>
      </div>
      <ol>
        {events.map((e, i) => {
          const state = e.state && traceStateMeta[e.state];
          const stepIndex = e.index ?? String(i + 1).padStart(2, "0");
          return (
            <li key={e.id}>
              <details>
                <summary>
                  <span className="yg-trace-index">{stepIndex}</span>
                  <span className="yg-trace-title">{e.title}</span>
                  {e.latency && <span className="yg-trace-latency">{e.latency}</span>}
                  {state && <Badge tone={state.tone}>{state.label}</Badge>}
                  <Icon name="down" />
                </summary>
                <div>{e.detail}</div>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
