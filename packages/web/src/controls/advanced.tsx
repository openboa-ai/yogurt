"use client";
import {
  useContext, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode,
} from "react";
import {
  Menubar as M,
  NavigationMenu as N,
  Popover as P,
  HoverCard as H,
} from "radix-ui";
import { Button as SDKButton } from "@ui-sdk/react/button";
import { Accordion as SDKAccordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel } from "@ui-sdk/react/accordion";
import { Command as SDKCommand, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui-sdk/react/command";
import { Menu, MenuContent, MenuContextTrigger, MenuItem } from "@ui-sdk/react/menu";
import { DayPicker } from "react-day-picker";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { cx, Icon, type IconName, type Option } from "../foundation/foundation.js";
import { Button, IconButton } from "./actions.js";
import { Dialog } from "./layers.js";
import { NavigationList, type Destination } from "./navigation.js";
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
  const [openItems, setOpenItems] = useState<string[]>([]);
  return <SDKAccordion multiple={multiple} collapsible className="yg-accordion" aria-label={label}
    value={openItems} onValueChange={(next, details) => {
      if (next.some((id) => !openItems.includes(id) && !items.some((item) => item.id === id && !item.disabled))) {
        details.cancel();
        return;
      }
      setOpenItems(next);
    }}
    onKeyDownCapture={(event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const current = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-yg-accordion-id]");
      if (current?.closest(".yg-accordion") !== event.currentTarget) return;
      const enabled = items.filter((item) => !item.disabled);
      const index = enabled.findIndex((item) => item.id === current?.dataset.ygAccordionId);
      if (index < 0) return;
      const next = ({ ArrowDown: (index + 1) % enabled.length,
        ArrowUp: (index + enabled.length - 1) % enabled.length,
        Home: 0, End: enabled.length - 1 } as Record<string, number | undefined>)[event.key];
      if (next === undefined) return;
      event.preventDefault();
      [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-yg-accordion-id]")]
        .find((button) => button.dataset.ygAccordionId === enabled[next].id)?.focus();
    }}>
    {items.map((item) => <AccordionItem key={item.id} value={item.id} disabled={item.disabled}>
      <AccordionHeader><AccordionTrigger data-yg-accordion-id={item.id}
        render={(props, state) => <button {...props} disabled={state.disabled} data-state={state.open ? "open" : "closed"} />}>
        {item.title}<Icon name="down" />
      </AccordionTrigger></AccordionHeader>
      <AccordionPanel className="yg-accordion-content"
        render={(props, state) => <div {...props} data-state={state.open ? "open" : "closed"}
          aria-hidden={!state.open || undefined} inert={!state.open || undefined} />}>
        <div className="yg-accordion-inner">{item.content}</div>
      </AccordionPanel>
    </AccordionItem>)}
  </SDKAccordion>;
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
    <Menu loop>
      <MenuContextTrigger className="yg-context-target" tabIndex={0} aria-label={label}>
        {children}
      </MenuContextTrigger>
      <MenuContent className="yg-popup-menu" aria-label={label} collisionPadding={8}
        render={(props, state) => <div {...props} aria-hidden={!state.open || undefined} inert={!state.open} />}>
        {items.map(item => (
          <MenuItem key={item.id} value={item.id} label={item.label} disabled={item.disabled}
            render={<SDKButton type="button" />} onSelect={() => onSelect(item.id)}>{item.label}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const panelId = useId();
  const shown = inline ? items.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase())) : [];
  const marker = shown.findIndex(item => item.id === highlighted);

  useLayoutEffect(() => {
    if (!inline) return;
    if (open) input.current?.focus();
    else if (previousOpen.current) trigger.current?.focus();
    previousOpen.current = open;
  }, [inline, open]);

  function start() {
    setQuery("");
    setHighlighted(null);
    setOpen(true);
  }

  const panel = (inline || open) && (
    <SDKCommand query={query} onQueryChange={setQuery} onValueChange={inline ? setHighlighted : undefined} filter="contains" loop
      onAction={id => {
        if (!open) return;
        setOpen(false);
        onSelect(id);
      }}
      style={inline ? {
        "--yg-command-index": marker < 0 ? shown.findIndex(item => !item.disabled) : marker,
      } as CSSProperties : undefined}>
      <div className="yg-command-search">
        <Icon name="search" />
        <CommandInput ref={input} autoFocus={!inline} aria-label="Find a command"
          placeholder={inline ? "Type a command" : "Find a command"}
          onKeyDown={event => {
            if (!event.nativeEvent.isComposing && inline && event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
            }
          }} />
      </div>
      <CommandList className="yg-command-list" aria-label="Commands">
        {inline && shown.some(item => !item.disabled) && <span className="yg-inline-command-marker" aria-hidden="true" />}
        {items.map(item => (
          <CommandItem key={item.id} value={item.id} label={item.label} disabled={item.disabled}
            shortcut={inline && open && item.shortcut ? `alt+${item.shortcut}` : undefined}
            aria-describedby={!inline && item.hint ? panelId + "-" + item.id : undefined}>
            {({ highlighted }) => <>
              {!inline && item.icon && <Icon name={item.icon} />}
              <span className="yg-command-copy">
                <span>{item.label}</span>
                {!inline && item.hint && <span className="yg-help" id={panelId + "-" + item.id}>{item.hint}</span>}
              </span>
              {inline && item.shortcut ? <kbd aria-hidden="true" title={`Alt + ${item.shortcut}`}>{item.shortcut}</kbd>
                : highlighted && <kbd aria-hidden="true">↵</kbd>}
            </>}
          </CommandItem>
        ))}
      </CommandList>
      <CommandEmpty className="yg-help">No matching commands</CommandEmpty>
    </SDKCommand>
  );

  if (inline) return <div className="yg-inline-command" data-open={open} onKeyDown={event => {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (open) setOpen(false);
      else start();
    }
  }}>
    <button ref={trigger} className="yg-inline-command-trigger" type="button" onClick={start}
      inert={open} aria-label={label} aria-expanded={open} aria-controls={panelId} aria-keyshortcuts="Meta+K Control+K">
      <Icon name="search" /><span>{triggerText}</span><kbd>⌘K</kbd>
    </button>
    <div className="yg-inline-command-panel" id={panelId} inert={!open} aria-hidden={!open || undefined} data-agent-hidden={!open || undefined}>{panel}</div>
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
          onClick={() => setOpen((value) => !value)}
        />
      </header>
      <nav id={id} aria-label={label} data-expanded={open} aria-hidden={!open} inert={!open}>
        <div className="yg-sidebar-links">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              aria-current={l.id === current ? "page" : undefined}
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
type NavbarProps = { className?: string; action?: ReactNode } & (
  | { variant?: "back"; label: string; onBack: () => void }
  | {
      variant: "sections";
      label: string;
      identity: ReactNode;
      destinations: Destination[];
      current: string;
      currentKind?: "page" | "location";
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
    }
);

export function Navbar(props: NavbarProps) {
  const navigationId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const sectionsOpen = props.variant === "sections" && props.expanded;
  useLayoutEffect(() => {
    if (sectionsOpen && document.activeElement === toggle.current) {
      document.getElementById(navigationId)?.querySelector<HTMLElement>("a")?.focus();
    }
  }, [navigationId, sectionsOpen]);
  const className = cx("yg-navbar", props.className);
  if (props.variant === "sections") {
    return (
      <header className={className} data-variant="sections" onKeyDown={event => {
        if (event.key === "Escape" && props.expanded) {
          props.onExpandedChange(false);
          toggle.current?.focus();
        }
      }}>
        <div className="yg-navbar-identity">{props.identity}</div>
        <NavigationList id={navigationId} label={props.label} items={props.destinations}
          current={props.current} currentKind={props.currentKind}
          orientation="horizontal" expanded={props.expanded} />
        <div className="yg-navbar-actions">
          <IconButton ref={toggle} className="yg-navbar-toggle" icon={props.expanded ? "close" : "menu"}
            label={props.expanded ? "Close menu" : "Open menu"} aria-controls={navigationId}
            aria-expanded={props.expanded} onClick={() => props.onExpandedChange(!props.expanded)} />
          {props.action}
        </div>
      </header>
    );
  }
  return (
    <header className={className}>
      <IconButton icon="back" label="Go back" onClick={props.onBack} />
      <strong>{props.label}</strong>
      {props.action}
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
  const connected = variant === "progress" && steps.length > 1 && steps.length <= 5;
  return (
    <div className="yg-stage-list" data-connected={connected || undefined}
      style={connected ? {"--yg-step-count": steps.length} as CSSProperties : undefined}>
      {variant === "progress" && <div className="yg-step-track">
        <progress aria-label={label} value={at + 1} max={Math.max(1, steps.length)} />
        <span aria-hidden="true" style={{
          "--yg-step-progress": connected ? Math.max(0, at) / (steps.length - 1) : (at + 1) / Math.max(1, steps.length),
        } as CSSProperties} />
      </div>}
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
              <span aria-hidden={i < at || undefined}>{i + 1}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="22" />
              </svg>
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
