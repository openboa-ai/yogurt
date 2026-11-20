"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Direction as ReadingDirection } from "radix-ui";
import { Heading, Icon, Stack, cx, type Tone } from "../foundation/foundation.js";
import { Button, IconButton } from "../controls/actions.js";
import { Toast } from "../controls/feedback.js";
import type { Observation, Reading } from "../controls/data.js";

type Content = { children: ReactNode };
type NamedSection = Content & {
  title: string;
  description?: string;
  action?: ReactNode;
};
export function AspectRatio({
  ratio = 16 / 9,
  children,
}: Content & { ratio?: number }) {
  return (
    <div
      className="yg-aspect"
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 1 }}
    >
      {children}
    </div>
  );
}
export function Direction({
  dir = "ltr",
  children,
}: Content & { dir?: "ltr" | "rtl" }) {
  return (
    <ReadingDirection.Provider dir={dir}>
      <div dir={dir}>{children}</div>
    </ReadingDirection.Provider>
  );
}
export function Card({ title, description, children, action, density = "regular" }: NamedSection & { density?: "compact" | "regular" | "spacious" }) {
  return (
    <section className="yg-card" data-density={density}>
      <Heading level={3}>{title}</Heading>
      {description && <p className="yg-help">{description}</p>}
      <div>{children}</div>
      {action && <footer>{action}</footer>}
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
export function Gradient({
  children,
  tone = "neutral",
}: {
  children?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="yg-gradient" data-tone={tone}>
      {children}
    </div>
  );
}
export function Elevation({
  children,
  level = "raised",
}: Content & { level?: "flat" | "raised" | "floating" }) {
  return (
    <div className="yg-elevation" data-level={level}>
      {children}
    </div>
  );
}
export function KeyboardShortcut({
  keys,
  label,
}: {
  keys: string[];
  label: string;
}) {
  return (
    <span className="yg-shortcut" role="img" aria-label={label}>
      {keys.map((key, index) => (
        <kbd key={index} aria-hidden="true">
          {key}
        </kbd>
      ))}
    </span>
  );
}
export function Post({ children, ...props }: ComponentProps<"article">) {
  return (
    <article {...props} className={cx("yg-post", props.className)}>
      {children}
    </article>
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
export function ListFooter({
  children,
  action,
}: Content & { action?: ReactNode }) {
  return (
    <footer className="yg-section-line yg-help">
      {children}
      {action}
    </footer>
  );
}
export function PageHeader({
  title,
  detail,
  eyebrow,
  action,
}: {
  title: string;
  detail?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="yg-section-line">
      <div>
        {eyebrow && <p className="yg-meta">{eyebrow}</p>}
        <Heading level={1}>{title}</Heading>
        {detail && <p className="yg-help">{detail}</p>}
      </div>
      {action}
    </header>
  );
}
export function BottomInfo({ label, children }: Content & { label: string }) {
  return (
    <aside className="yg-bottom-info" aria-label={label}>
      {children}
    </aside>
  );
}
export function Highlight({ children }: Content) {
  return <mark className="yg-highlight">{children}</mark>;
}
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="yg-loading" role="status" aria-label={label}>
      <span className="yg-spinner" aria-hidden="true" />
    </span>
  );
}
export function ToastStack({
  items,
  onDismiss,
  label = "Notifications",
}: {
  items: { id: string; message: string }[];
  onDismiss: (id: string) => void;
  label?: string;
}) {
  return (
    <section className="yg-stack" aria-label={label}>
      {items.map((item) => (
        <Toast
          key={item.id}
          message={item.message}
          onDismiss={() => onDismiss(item.id)}
        />
      ))}
    </section>
  );
}
export function TableRow({ label, children }: Content & { label: string }) {
  return (
    <dl className="yg-value-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </dl>
  );
}
export function AmountTop({
  label,
  value,
  unit,
  detail,
}: {
  label: string;
  value: string;
  unit?: string;
  detail?: string;
}) {
  return (
    <section className="yg-amount">
      <span className="yg-help">{label}</span>
      <strong>
        {value}
        {unit && <small> {unit}</small>}
      </strong>
      {detail && <span className="yg-meta">{detail}</span>}
    </section>
  );
}
export function BarChart({
  title,
  points,
  unit,
  source,
  asOf,
  timeLabel,
}: Observation & { title: string; points: Reading[]; unit: string }) {
  const finite = points.flatMap((p) =>
    p.value !== null && Number.isFinite(p.value) ? [p.value] : [],
  );
  const min = Math.min(0, ...finite),
    max = Math.max(0, ...finite),
    range = max - min || 1,
    zero = (-min / range) * 100;
  return (
    <figure className="yg-bars">
      <figcaption>{title}</figcaption>
      <ul>
        {points.map((p) => {
          const n =
            p.value !== null && Number.isFinite(p.value) ? p.value : null;
          return (
            <li key={p.id}>
              <span>{p.label}</span>
              <span className="yg-bar-track" aria-hidden="true">
                <i
                  style={{
                    insetInlineStart:
                      (n !== null && n < 0 ? ((n - min) / range) * 100 : zero) +
                      "%",
                    inlineSize:
                      (n === null ? 0 : (Math.abs(n) / range) * 100) + "%",
                  }}
                />
              </span>
              <span>{n === null ? "No reading" : n + " " + unit}</span>
            </li>
          );
        })}
      </ul>
      <small>
        {source} · <time dateTime={asOf}>{timeLabel ?? asOf}</time>
      </small>
    </figure>
  );
}
export function Avatar({
  label,
  src,
  size = 36,
}: {
  label: string;
  src?: string;
  size?: number;
}) {
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
      style={{ inlineSize: size, blockSize: size }}
    >
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
export function Bubble({
  children,
  outgoing = false,
}: Content & { outgoing?: boolean }) {
  return (
    <div className="yg-bubble" data-outgoing={outgoing || undefined}>
      {children}
    </div>
  );
}
export function Attachment({
  name,
  detail,
  preview,
  onOpen,
  onRemove,
  progress,
}: {
  name: string;
  detail?: string;
  preview?: ReactNode;
  onOpen?: () => void;
  onRemove?: () => void;
  progress?: number;
}) {
  const info = (
    <>
      <strong>{name}</strong>
      {detail && <small>{detail}</small>}
    </>
  );
  return (
    <div className="yg-attachment">
      {preview && <Asset>{preview}</Asset>}
      {onOpen ? (
        <button type="button" className="yg-file-name" onClick={onOpen}>
          {info}
        </button>
      ) : (
        <span className="yg-file-name">{info}</span>
      )}
      {progress !== undefined && (
        <progress aria-label={"Upload " + name} value={progress} max={100} />
      )}{" "}
      {onRemove && (
        <IconButton icon="close" label={"Remove " + name} onClick={onRemove} />
      )}
    </div>
  );
}
export function Marker({
  children,
  tone = "neutral",
}: Content & { tone?: Tone }) {
  return (
    <div className="yg-marker" data-tone={tone}>
      <span aria-hidden="true" className="yg-status-dot" />
      {children}
    </div>
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
  const [result, setResult] = useState("Copy"),
    version = useRef(0);
  useEffect(() => {
    setResult("Copy");
    return () => {
      version.current++;
    };
  }, [code]);
  async function copy() {
    const current = ++version.current;
    try {
      await (onCopy ? onCopy(code) : navigator.clipboard.writeText(code));
      if (current === version.current) setResult("Copied");
    } catch {
      if (current === version.current) setResult("Copy failed");
    }
  }
  return (
    <section className="yg-code" aria-label={language + " code"}>
      <header>
        <span>{language}</span>
        <Button size="compact" emphasis="quiet" onClick={copy}>
          <Icon name="copy" />
          <span aria-live="polite">{result}</span>
        </Button>
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
  state?: "working" | "complete" | "failed";
}
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
      <Heading id={id} level={3}>
        {label}
      </Heading>
      <ol>
        {events.map((e) => (
          <li key={e.id}>
            <details>
              <summary>
                {e.title}
                {e.state && <small>{e.state}</small>}
              </summary>
              <div>{e.detail}</div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
