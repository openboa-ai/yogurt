"use client";
import {
  useContext, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode,
} from "react";
import {
  Accordion as A,
  ContextMenu as C,
  Menubar as M,
  NavigationMenu as N,
  Popover as P,
  HoverCard as H,
} from "radix-ui";
import { DayPicker } from "react-day-picker";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Icon, type IconName, type Option } from "../foundation/foundation.js";
import { Button, IconButton } from "./actions.js";
import { Dialog } from "./layers.js";
import type { Destination } from "./navigation.js";
import { Checkbox, RadioGroup, Textarea } from "./forms.js";
import { CarouselMotionReview } from "./motion-review-context.js";

export function Accordion({
  label,
  items,
  multiple = false,
}: {
  label: string;
  items: {
    id: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
  }[];
  multiple?: boolean;
}) {
  const children = items.map((i) => (
    <A.Item key={i.id} value={i.id} disabled={i.disabled}>
      <A.Header>
        <A.Trigger>
          {i.title}
          <Icon name="down" />
        </A.Trigger>
      </A.Header>
      <A.Content className="yg-accordion-content">{i.content}</A.Content>
    </A.Item>
  ));
  return multiple ? (
    <A.Root type="multiple" className="yg-accordion" aria-label={label}>
      {children}
    </A.Root>
  ) : (
    <A.Root
      type="single"
      collapsible
      className="yg-accordion"
      aria-label={label}
    >
      {children}
    </A.Root>
  );
}
type CommandProps = {
  label: string;
  title?: string;
  items: (Option & { hint?: string; icon?: IconName; shortcut?: string })[];
  onSelect: (id: string) => void;
};
export function ContextMenu({
  label,
  items,
  onSelect,
  children,
}: CommandProps & { children: ReactNode }) {
  return (
    <C.Root>
      <C.Trigger asChild>
        <div
          className="yg-context-target"
          tabIndex={0}
          aria-label={label}
          aria-haspopup="menu"
          onKeyDown={(e) => {
            if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.dispatchEvent(
                new MouseEvent("contextmenu", {
                  bubbles: true,
                  cancelable: true,
                  clientX: rect.left + 12,
                  clientY: rect.bottom,
                }),
              );
            }
          }}
        >
          {children}
        </div>
      </C.Trigger>
      <C.Content className="yg-flyout" aria-label={label}>
        {items.map((i) => (
          <C.Item
            key={i.id}
            disabled={i.disabled}
            onSelect={() => onSelect(i.id)}
          >
            {i.label}
          </C.Item>
        ))}
      </C.Content>
    </C.Root>
  );
}
export function HoverCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false),
    id = useId();
  return (
    <H.Root open={open} onOpenChange={setOpen} openDelay={150} closeDelay={120}>
      <H.Trigger asChild>
        <button
          type="button"
          className="yg-link"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {label}
        </button>
      </H.Trigger>
      <H.Content
        id={id}
        className="yg-flyout yg-hover-content"
        sideOffset={4}
        onEscapeKeyDown={() => setOpen(false)}
      >
        {children}
      </H.Content>
    </H.Root>
  );
}
export function Command({
  label, title = label, items, onSelect, presentation = "dialog", triggerText = label,
}: CommandProps & { presentation?: "dialog" | "inline"; triggerText?: string }) {
  const inline = presentation === "inline";
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const previousOpen = useRef(false);
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [active, setActive] = useState(""),
    list = useId();
  const shown = items.filter((i) =>
      i.label.toLowerCase().includes(query.trim().toLowerCase()),
    ),
    enabled = shown.filter((i) => !i.disabled);
  const current = enabled.find((i) => i.id === active) ?? enabled[0];
  useLayoutEffect(() => {
    if (!inline) return;
    if (open) input.current?.focus();
    else if (previousOpen.current) trigger.current?.focus();
    previousOpen.current = open;
  }, [inline, open]);

  function start() {
    setQuery("");
    setActive("");
    setOpen(true);
  }

  function choose(item?: Option) {
    if (item && !item.disabled) {
      setOpen(false);
      onSelect(item.id);
    }
  }
  function move(direction: number) {
    if (!enabled.length) return;
    const index = enabled.findIndex((i) => i.id === current?.id);
    const next = enabled[(index + direction + enabled.length) % enabled.length];
    setActive(next.id);
    document
      .getElementById(list + next.id)
      ?.scrollIntoView({ block: "nearest" });
  }
  const panel = <>
    <div className="yg-command-search">
      <Icon name="search" />
      <input
        ref={input}
        autoFocus={!inline}
        role="combobox"
        aria-label="Find a command"
        placeholder={inline ? "Type a command" : "Find a command"}
        aria-expanded={open}
        aria-controls={list}
        aria-autocomplete="list"
        aria-activedescendant={current ? list + current.id : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive("");
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (inline && e.key === "Escape") {
            e.stopPropagation();
            setOpen(false);
          }
          if (inline && e.altKey) {
            const key = e.code.startsWith("Key") ? e.code.slice(3) : e.key;
            const shortcut = shown.find(item => !item.disabled && item.shortcut?.toLowerCase() === key.toLowerCase());
            if (shortcut) {
              e.preventDefault();
              choose(shortcut);
              return;
            }
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            move(e.key === "ArrowDown" ? 1 : -1);
          }
          if (e.key === "Enter") {
            e.preventDefault();
            choose(current);
          }
        }}
      />
    </div>
    <div
      className="yg-command-list"
      id={list}
      role="listbox"
      aria-label="Commands"
      style={inline && current ? { "--yg-command-index": shown.indexOf(current) } as CSSProperties : undefined}
    >
      {inline && current && <span className="yg-inline-command-marker" aria-hidden="true" />}
      {shown.map((i) => (
        <div
          key={i.id}
          id={list + i.id}
          role="option"
          aria-label={i.label}
          aria-describedby={i.hint ? list + i.id + "-hint" : undefined}
          aria-selected={current?.id === i.id}
          aria-disabled={i.disabled}
          aria-keyshortcuts={inline && i.shortcut ? `Alt+${i.shortcut}` : undefined}
          onPointerMove={() => !i.disabled && setActive(i.id)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => choose(i)}
        >
          {!inline && i.icon && <Icon name={i.icon} />}
          <span className="yg-command-copy">
            <span>{i.label}</span>
            {i.hint && <span className="yg-help" id={list + i.id + "-hint"} hidden={inline}>{i.hint}</span>}
          </span>
          {inline && i.shortcut ? <kbd aria-hidden="true" title={`Alt + ${i.shortcut}`}>{i.shortcut}</kbd>
            : current?.id === i.id && <kbd aria-hidden="true">↵</kbd>}
        </div>
      ))}
    </div>
    {!shown.length && (
      <p className="yg-help" role="status">
        No matching commands
      </p>
    )}
  </>;

  if (inline) return <div className="yg-inline-command" data-open={open} onKeyDown={event => {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (open) setOpen(false);
      else start();
    }
  }}>
    <button ref={trigger} className="yg-inline-command-trigger" type="button" onClick={start}
      inert={open} aria-label={label} aria-expanded={open} aria-controls={list + "-panel"} aria-keyshortcuts="Meta+K Control+K">
      <Icon name="search" /><span>{triggerText}</span><kbd>⌘K</kbd>
    </button>
    <div className="yg-inline-command-panel" id={list + "-panel"} inert={!open}>{panel}</div>
  </div>;

  return <>
    <Button emphasis="soft" onClick={start}>{label}</Button>
    <Dialog open={open} onOpenChange={setOpen} title={title}>{panel}</Dialog>
  </>;
}
export function Menubar({
  label,
  menus,
  onSelect,
}: {
  label: string;
  menus: { id: string; label: string; items: Option[] }[];
  onSelect: (id: string) => void;
}) {
  return (
    <M.Root className="yg-menu-bar" aria-label={label}>
      {menus.map((m) => (
        <M.Menu key={m.id} value={m.id}>
          <M.Trigger>{m.label}</M.Trigger>
          <M.Content
            className="yg-flyout"
            sideOffset={4}
            align="start"
            aria-label={m.label}
          >
            {m.items.map((i) => (
              <M.Item
                key={i.id}
                disabled={i.disabled}
                onSelect={() => onSelect(i.id)}
              >
                {i.label}
              </M.Item>
            ))}
          </M.Content>
        </M.Menu>
      ))}
    </M.Root>
  );
}
export function NavigationMenu({
  label,
  groups,
}: {
  label: string;
  groups: { id: string; label: string; links: Destination[] }[];
}) {
  return (
    <N.Root className="yg-navigation-menu" aria-label={label}>
      <N.List>
        {groups.map((group) => (
          <N.Item key={group.id}>
            <N.Trigger>
              {group.label}
              <Icon name="down" />
            </N.Trigger>
            <N.Content className="yg-flyout">
              {group.links.map((l) => (
                <N.Link key={l.id} href={l.href}>
                  {l.label}
                </N.Link>
              ))}
            </N.Content>
          </N.Item>
        ))}
      </N.List>
    </N.Root>
  );
}
export function Sidebar({
  label,
  links,
  current,
}: {
  label: string;
  links: Destination[];
  current?: string;
}) {
  const [open, setOpen] = useState(true),
    id = useId();
  return (
    <aside className="yg-sidebar">
      <header>
        <strong>{label}</strong>
        <IconButton
          icon="menu"
          label={open ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        />
      </header>
      <nav id={id} aria-label={label} hidden={!open}>
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            aria-current={l.id === current ? "page" : undefined}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
export function Navbar({
  label,
  onBack,
  action,
}: {
  label: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="yg-navbar">
      <IconButton icon="back" label="Go back" onClick={onBack} />
      <strong>{label}</strong>
      {action}
    </header>
  );
}
type CarouselItem = { id: string; label: string; content: ReactNode };

function CarouselStrip({ items, current, move }: {
  items: CarouselItem[];
  current: number;
  move: (delta: number) => void;
}) {
  const gesture = useRef<{
    pointer: number; x: number; y: number; direction: number; width: number; active: boolean; distance: number;
  } | null>(null);
  const [drag, setDrag] = useState<{ pixels: number; fraction: number } | null>(null);

  function begin(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 ||
        (event.target as Element).closest("a, button, input, select, textarea, [contenteditable]")) return;
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      direction: event.currentTarget.matches(":dir(rtl)") ? -1 : 1,
      width: event.currentTarget.clientWidth,
      active: false,
      distance: 0,
    };
  }

  function track(event: PointerEvent<HTMLDivElement>) {
    const next = gesture.current;
    if (!next || next.pointer !== event.pointerId) return;
    const x = event.clientX - next.x;
    if (!next.active) {
      const y = Math.abs(event.clientY - next.y);
      if (y >= 6 && y >= Math.abs(x)) {
        gesture.current = null;
        return;
      }
      if (Math.abs(x) < 6) return;
      next.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    next.distance = x * next.direction;
    const forward = next.distance < 0;
    const atEdge = forward ? current >= items.length - 1 : current === 0;
    const pixels = atEdge ? x * 0.24 : Math.max(-next.width, Math.min(next.width, x));
    setDrag({ pixels, fraction: next.width ? pixels * next.direction / next.width : 0 });
  }

  function finish(event: PointerEvent<HTMLDivElement>, commit = false) {
    const previous = gesture.current;
    if (!previous || previous.pointer !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (!commit || !previous.active) return;

    const delta = previous.distance;
    const threshold = Math.min(64, previous.width * 0.24);
    if (Math.abs(delta) >= threshold) move(delta < 0 ? 1 : -1);
  }

  return (
    <div
      className="yg-slide yg-carousel-viewport"
      onPointerDown={begin}
      onPointerMove={track}
      onPointerUp={(event) => finish(event, true)}
      onPointerCancel={finish}
      onLostPointerCapture={(event) => {
        if (event.target === event.currentTarget) finish(event);
      }}
      onPointerLeave={(event) => {
        if (!gesture.current?.active) finish(event);
      }}
    >
      <div
        className="yg-carousel-strip"
        data-dragging={drag !== null || undefined}
        style={{ "--yg-carousel-page": current, "--yg-carousel-drag": `${drag?.pixels ?? 0}px` } as CSSProperties}
      >
        {items.map((item, index) => {
          const distance = Math.min(1, Math.abs(index - current + (drag?.fraction ?? 0)));
          return (
            <div key={item.id} inert={index !== current} aria-hidden={index !== current || undefined}>
              <div className="yg-carousel-card" style={{"--yg-carousel-distance": distance} as CSSProperties}>
                {Math.abs(index - current) <= 1 ? item.content : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Carousel({
  label,
  items,
}: {
  label: string;
  items: { id: string; label: string; content: ReactNode }[];
}) {
  const [index, setIndex] = useState(0),
    start = useRef<number | null>(null),
    current = Math.max(0, Math.min(index, items.length - 1));
  const useStrip = useContext(CarouselMotionReview);
  function move(delta: number) {
    setIndex(Math.max(0, Math.min(current + delta, items.length - 1)));
  }
  return (
    <section
      className="yg-carousel"
      aria-label={label}
      aria-roledescription="carousel"
    >
      {useStrip ? <CarouselStrip items={items} current={current} move={move} /> : (
        <div
          className="yg-slide"
          onTouchStart={(e) => {
            start.current = e.touches[0].clientX;
          }}
          onTouchCancel={() => {
            start.current = null;
          }}
          onTouchEnd={(e) => {
            if (start.current !== null) {
              const delta = e.changedTouches[0].clientX - start.current;
              if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
            }
            start.current = null;
          }}
        >
          {items[current]?.content}
        </div>
      )}
      <footer>
        <span aria-live="polite">
          {items.length
            ? items[current].label +
              " · " +
              (current + 1) +
              " / " +
              items.length
            : "No items"}
        </span>
        <div className="yg-carousel-nav">
          <IconButton
            icon="back"
            label="Previous slide"
            aria-disabled={!current || undefined}
            onClick={() => move(-1)}
          />
          <IconButton
            icon="next"
            label="Next slide"
            aria-disabled={current >= items.length - 1 || undefined}
            onClick={() => move(1)}
          />
        </div>
      </footer>
    </section>
  );
}
export function Stepper({
  label,
  steps,
  current,
  variant = "list",
}: {
  label: string;
  steps: { id: string; label: string; detail?: string; action?: ReactNode }[];
  current: string;
  variant?: "list" | "progress";
}) {
  const at = steps.findIndex((s) => s.id === current);
  return (
    <div className="yg-stage-list">
      {variant === "progress" && (
        <progress
          aria-label={label}
          value={at + 1}
          max={Math.max(1, steps.length)}
        />
      )}
      <ol className="yg-stepper" aria-label={label} data-variant={variant}>
        {steps.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === at ? "step" : undefined}
            data-complete={i < at || undefined}
          >
            <span
              className="yg-step-number"
              aria-label={i < at ? "Completed" : undefined}
            >
              {i < at ? <Icon name="check" /> : i + 1}
            </span>
            <div>
              <strong>{s.label}</strong>
              {s.detail && <p className="yg-help">{s.detail}</p>}
            </div>
            {s.action}
          </li>
        ))}
      </ol>
    </div>
  );
}
export function Resizable({
  label,
  first,
  second,
  initial = 40,
}: {
  label: string;
  first: ReactNode;
  second: ReactNode;
  initial?: number;
}) {
  const start = Math.max(15, Math.min(85, initial));
  return (
    <PanelGroup direction="horizontal" className="yg-resizable">
      <Panel defaultSize={start} minSize={15}>
        {first}
      </Panel>
      <PanelResizeHandle aria-label={label} className="yg-resize-handle" />
      <Panel defaultSize={100 - start} minSize={15}>
        {second}
      </Panel>
    </PanelGroup>
  );
}
type DateValue = {
  label: string;
  value?: string;
  onValueChange: (date: string) => void;
  min?: string;
  max?: string;
};
function civil(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(y, m - 1, d);
  return civilText(date) === value ? date : undefined;
}
function civilText(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
export function Calendar({ label, value, min, max, onValueChange }: DateValue) {
  const selected = civil(value),
    lower = civil(min),
    upper = civil(max);
  return (
    <DayPicker
      aria-label={label}
      className="yg-calendar"
      mode="single"
      selected={selected}
      defaultMonth={selected ?? lower}
      startMonth={lower}
      endMonth={upper}
      disabled={[
        ...(lower ? [{ before: lower }] : []),
        ...(upper ? [{ after: upper }] : []),
      ]}
      onSelect={(d) => {
        if (d) onValueChange(civilText(d));
      }}
    />
  );
}
export function DatePicker(props: DateValue) {
  const [open, setOpen] = useState(false),
    id = useId();
  return (
    <div className="yg-field">
      <label htmlFor={id} className="yg-label">
        {props.label}
      </label>
      <P.Root open={open} onOpenChange={setOpen}>
        <P.Trigger id={id} className="yg-date-trigger">
          {props.value ?? "Choose a date"}
          <Icon name="down" />
        </P.Trigger>
        <P.Content
          aria-label={props.label}
          className="yg-flyout yg-date-popup"
          sideOffset={4}
          align="start"
        >
          <Calendar
            {...props}
            onValueChange={(value) => {
              props.onValueChange(value);
              setOpen(false);
            }}
          />
        </P.Content>
      </P.Root>
    </div>
  );
}
export interface Question {
  id: string;
  label: string;
  kind: "single" | "multiple" | "text";
  options?: Option[];
  optional?: boolean;
}
export type Answers = Record<string, string | string[]>;
export function Questionnaire({
  questions,
  onComplete,
}: {
  questions: Question[];
  onComplete: (answers: Answers) => void;
}) {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Answers>({});
  const at = Math.min(index, questions.length - 1),
    q = questions[at];
  if (!q) return null;
  const value = answers[q.id] ?? (q.kind === "multiple" ? [] : ""),
    valid =
      q.optional || (Array.isArray(value) ? value.length > 0 : !!value.trim());
  const edit = (v: string | string[]) =>
    setAnswers((a) => ({ ...a, [q.id]: v }));
  function advance() {
    if (!valid) return;
    if (at < questions.length - 1) setIndex(at + 1);
    else
      onComplete(
        Object.fromEntries(
          questions
            .filter((i) => answers[i.id] !== undefined)
            .map((i) => [i.id, answers[i.id]]),
        ),
      );
  }
  return (
    <section className="yg-stack yg-question">
      <span className="yg-meta" aria-live="polite">
        Question {at + 1} of {questions.length}
      </span>
      {q.kind === "text" ? (
        <Textarea
          label={q.label}
          value={String(value)}
          onChange={(e) => edit(e.target.value)}
        />
      ) : q.kind === "single" ? (
        <RadioGroup
          label={q.label}
          options={q.options ?? []}
          value={String(value)}
          onValueChange={edit}
        />
      ) : (
        <fieldset className="yg-fieldset">
          <legend className="yg-label">{q.label}</legend>
          {(q.options ?? []).map((o) => (
            <Checkbox
              key={o.id}
              label={o.label}
              disabled={o.disabled}
              checked={Array.isArray(value) && value.includes(o.id)}
              onCheckedChange={(v) => {
                const selected = Array.isArray(value) ? value : [];
                edit(
                  v
                    ? [...selected, o.id]
                    : selected.filter((id) => id !== o.id),
                );
              }}
            />
          ))}
        </fieldset>
      )}
      <div className="yg-inline">
        <Button
          emphasis="quiet"
          disabled={at === 0}
          onClick={() => setIndex(at - 1)}
        >
          Back
        </Button>
        <Button disabled={!valid} onClick={advance}>
          {at === questions.length - 1 ? "Finish" : "Continue"}
        </Button>
      </div>
    </section>
  );
}
