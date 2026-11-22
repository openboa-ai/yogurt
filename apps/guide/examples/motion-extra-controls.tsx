import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import * as Y from "@openboa/yogurt";
import { playSprings, snap, spring } from "../../../packages/web/src/foundation/spring-motion.js";

function InvitePeople() {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  return <form className="motion-invite" onSubmit={e => { e.preventDefault(); const next = email.trim(); if (next && !invites.includes(next)) setInvites([...invites, next]); setEmail(""); }}>
    <strong>Invite people</strong><span className="motion-invite-count">{invites.length} {invites.length === 1 ? "person" : "people"} added</span>
    <div className="motion-invite-stack">{invites.map((name, index) => <button type="button" key={name} style={{left: `${index * 30}px`, zIndex: invites.length - index}} onClick={() => setInvites(invites.filter(item => item !== name))} aria-label={`Remove ${name}`} title={name}>{name.slice(0, 1).toUpperCase()}<span aria-hidden="true">×</span></button>)}</div>
    <div className="motion-invite-entry"><label className="motion-extra-sr" htmlFor="motion-invite-email">Email address</label><input id="motion-invite-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /><button type="submit">Add person</button></div><small>People added here are a local preview.</small>
  </form>;
}
type Tag = {label: string; fresh?: boolean; departing?: boolean};
function TagChip({tag, remove}: {tag: Tag; remove: () => void}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [motion] = useState(() => ({
    width: spring(0, 340, 26),
    scale: spring(tag.fresh ? .5 : 1, 420, 16),
    alpha: spring(tag.fresh ? 0 : 1, 300, 26),
  }));
  useLayoutEffect(() => {
    const node = wrap.current, chip = inner.current;
    if (!node || !chip) return;
    let stop: (() => void) | undefined;
    const sync = () => {
      const full = chip.offsetWidth;
      motion.width.target = tag.departing ? 0 : full;
      motion.scale.target = tag.departing ? .6 : 1;
      motion.alpha.target = tag.departing ? 0 : 1;
      if (!tag.fresh && !tag.departing && !motion.width.position) snap(motion.width, full);
      stop?.();
      stop = playSprings(Object.values(motion), () => {
        node.style.inlineSize = `${Math.max(0, motion.width.position)}px`;
        node.style.marginInlineEnd = tag.departing ? `${-6 * (1 - Math.min(1, motion.width.position / Math.max(1, full)))}px` : "";
        node.style.opacity = String(Math.min(1, Math.max(0, motion.alpha.position)));
        chip.style.scale = String(motion.scale.position);
      });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(chip);
    return () => { observer.disconnect(); stop?.(); };
  }, [motion, tag.departing, tag.fresh]);
  return <span ref={wrap} className="motion-tag-travel" inert={tag.departing}>
    <span ref={inner} className="motion-tag-chip">{tag.label}
      <button type="button" onClick={remove} aria-label={`Remove ${tag.label}`}>×</button>
    </span>
  </span>;
}

function TagInput() {
  const [text, setText] = useState("");
  const [tags, setTags] = useState<Tag[]>([{label: "Ideas"}, {label: "Research"}]);
  const field = useRef<HTMLInputElement>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  function add() {
    const next = text.trim();
    if (next && !tags.some(tag => tag.label === next)) setTags(current => [...current, {label:next, fresh:true}]);
    setText("");
  }
  function remove(tag: Tag) {
    if (tag.departing || timers.current.has(tag.label)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setTags(current => current.filter(t => t.label !== tag.label));
    else {
      setTags(current => current.map(t => t.label === tag.label ? {...t, departing: true} : t));
      timers.current.set(tag.label, setTimeout(() => {
        timers.current.delete(tag.label);
        setTags(current => current.filter(t => t.label !== tag.label));
      }, 450));
    }
    field.current?.focus();
  }
  return <form className="motion-tag" onSubmit={event => { event.preventDefault(); add(); }}>
    <label htmlFor="motion-tag-input">Tags</label>
    <div className="motion-tag-field">
      {tags.map(tag => <TagChip key={tag.label} tag={tag} remove={() => remove(tag)} />)}
      <input ref={field} id="motion-tag-input" value={text} onChange={event => setText(event.target.value)}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === ",") { event.preventDefault(); add(); }
          if (event.key === "Backspace" && !text) {
            const last = tags.findLast(tag => !tag.departing);
            if (last) remove(last);
          }
        }} placeholder="Add a tag" />
    </div>
    <Y.Button type="submit" size="compact" emphasis="quiet">Add tag</Y.Button>
  </form>;
}
function Stepper() {
  const [value, setValue] = useState(3);
  return <Y.NumericSpinner label="Guests" help="Choose up to 12 guests" value={value} min={0} max={12}
    decreaseLabel="Remove guest" increaseLabel="Add guest" onValueChange={setValue} />;
}
const times = ["Morning", "Midday", "Afternoon", "Evening"];
const wheelRowHeight = 36;
const wheelAngle = 20;
const wheelRadius = 102.08;
const clampIndex = (index: number) => Math.max(0, Math.min(index, times.length - 1));

function WheelPicker() {
  const [index, setIndex] = useState(0);
  const [wheel] = useState(() => spring(0, 235, 26));
  const track = useRef<HTMLDivElement>(null);
  const animation = useRef<(() => void) | undefined>(undefined);
  const scrollEnd = useRef<number | undefined>(undefined);
  const drag = useRef<{id: number; y: number; position: number; moved: boolean; samples: {time: number; position: number}[]} | null>(null);
  function paint() {
    track.current?.style.setProperty("--wheel-turn", `${wheel.position * wheelAngle}deg`);
    setIndex(clampIndex(Math.round(wheel.position)));
  }
  function jump(position: number) {
    snap(wheel, position);
    paint();
  }
  function settle(position: number, velocity = 0) {
    animation.current?.();
    wheel.target = clampIndex(Math.round(position + velocity * .32));
    wheel.stiffness = velocity ? 140 : 235;
    wheel.damping = velocity ? 24 : 26;
    wheel.velocity = velocity;
    animation.current = playSprings([wheel], paint);
  }
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    function onWheel(event: WheelEvent) {
      if (drag.current) return;
      event.preventDefault();
      animation.current?.();
      const next = wheel.position + event.deltaY / wheelRowHeight * .4;
      jump(Math.max(-.4, Math.min(next, times.length - .6)));
      clearTimeout(scrollEnd.current);
      scrollEnd.current = window.setTimeout(() => settle(wheel.position), 120);
    }
    node.addEventListener("wheel", onWheel, {passive: false});
    return () => {
      node.removeEventListener("wheel", onWheel);
      clearTimeout(scrollEnd.current);
      animation.current?.();
    };
  }, [wheel]);
  function release(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (active?.id !== event.pointerId) return;
    drag.current = null;
    if (event.type !== "pointerup") {
      settle(wheel.position);
      return;
    }
    if (!active.moved) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientY - bounds.top - bounds.height / 2) / wheelRadius;
      const rows = Math.asin(Math.max(-1, Math.min(ratio, 1))) * 180 / Math.PI / wheelAngle;
      settle(Math.round(wheel.position) + Math.round(rows));
      return;
    }
    const first = active.samples[0], last = active.samples.at(-1) ?? first;
    const elapsed = last.time - first.time;
    const velocity = elapsed > 0 && event.timeStamp - last.time <= 80
      ? (last.position - first.position) * 1000 / elapsed : 0;
    const canCoast = wheel.position >= 0 && wheel.position <= times.length - 1
      && Math.abs(velocity) >= 2 && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    settle(wheel.position, canCoast ? velocity : 0);
  }
  return <div className="motion-wheel-wrap">
    <span>Preferred time</span>
    <div ref={track} className="motion-wheel" role="listbox" tabIndex={0} aria-label="Preferred time"
      aria-activedescendant={`motion-wheel-${index}`}
      onKeyDown={event => {
        let next: number;
        switch (event.key) {
          case "ArrowDown": next = index + 1; break;
          case "ArrowUp": next = index - 1; break;
          case "Home": next = 0; break;
          case "End": next = times.length - 1; break;
          default: return;
        }
        event.preventDefault();
        animation.current?.();
        clearTimeout(scrollEnd.current);
        jump(clampIndex(next));
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || drag.current) return;
        animation.current?.();
        clearTimeout(scrollEnd.current);
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {id: event.pointerId, y: event.clientY, position: wheel.position, moved: false,
          samples: [{time: event.timeStamp, position: wheel.position}]};
      }}
      onPointerMove={event => {
        const active = drag.current;
        if (active?.id !== event.pointerId) return;
        const delta = active.y - event.clientY;
        if (!active.moved && Math.abs(delta) < 4) return;
        active.moved = true;
        const raw = active.position + delta / wheelRowHeight;
        const excess = raw - clampIndex(raw);
        jump(raw - excess + Math.sign(excess) * 1.2 * (1 - Math.exp(-Math.abs(excess) / 1.2)));
        active.samples.push({time: event.timeStamp, position: raw});
        while (active.samples.length > 2 && event.timeStamp - active.samples[0].time > 80) active.samples.shift();
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      <div className="motion-wheel-highlight" />
      <div className="motion-wheel-perspective">
        <div className="motion-wheel-items">
          {times.map((option, row) => <div id={`motion-wheel-${row}`} role="option" aria-selected={index === row}
            key={option} style={{transform: `rotateX(${-row * wheelAngle}deg) translateZ(${wheelRadius}px)`}}>{option}</div>)}
        </div>
      </div>
    </div>
    <output aria-live="polite">{times[index]}</output>
  </div>;
}

function Scrubber() {
  const [position, setPosition] = useState(36);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const activePointer = useRef<number | null>(null);
  function fromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / Math.max(1, bounds.width);
    const progress = getComputedStyle(event.currentTarget).direction === "rtl" ? 1 - ratio : ratio;
    setPosition(Math.min(100, Math.max(0, Math.round(progress * 100))));
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    setDragging(false);
  }
  return <div className="motion-scrubber">
    <div className="motion-scrubber-bar" role="slider" tabIndex={0} aria-label="Preview position"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} aria-valuetext={`${position}%`}
      data-dragging={dragging || undefined} data-active={(dragging || hovered) || undefined}
      style={{"--scrub-progress": `${position}%`} as CSSProperties}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || activePointer.current !== null) return;
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        fromPointer(event);
      }}
      onPointerMove={event => {
        if (activePointer.current === event.pointerId) fromPointer(event);
      }}
      onPointerUp={release} onLostPointerCapture={release} onPointerCancel={release}
      onKeyDown={event => {
        let next: number;
        switch (event.key) {
          case "ArrowRight": case "ArrowUp": next = position + 1; break;
          case "ArrowLeft": case "ArrowDown": next = position - 1; break;
          case "Home": next = 0; break;
          case "End": next = 100; break;
          default: return;
        }
        event.preventDefault();
        setPosition(Math.min(100, Math.max(0, next)));
      }}>
      <span className="motion-scrubber-fill" aria-hidden="true" />
      <span className="motion-scrubber-ticks" aria-hidden="true" />
      <span className="motion-scrubber-handle" aria-hidden="true"><i /></span>
      <span className="motion-scrubber-label" aria-hidden="true">Preview position</span>
      <span className="motion-scrubber-value" aria-hidden="true">{position}%</span>
    </div>
  </div>;
}
function UndoAction() {
  const [phase, setPhase] = useState<"saved" | "pending" | "removed">("saved");
  useEffect(() => { if (phase !== "pending") return; const timer = window.setTimeout(() => setPhase("removed"), 5000); return () => window.clearTimeout(timer); }, [phase]);
  return <div className="motion-undo"><strong>{phase === "removed" ? "Removed from reading list" : "Saved to reading list"}</strong><button type="button" className="motion-undo-button" data-pending={phase === "pending" || undefined} onClick={() => setPhase(phase === "saved" ? "pending" : "saved")}><span key={phase}>{phase === "saved" ? "Remove" : phase === "pending" ? "Undo removal" : "Save again"}</span>{phase === "pending" && <i aria-hidden="true" />}</button><span role="status">{phase === "pending" ? "You can undo this change" : phase === "removed" ? "Removed" : "Available for later"}</span></div>;
}
function Refresh() {
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const origin = useRef<{id: number; y: number} | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function distance(delta: number) {
    return delta <= 180 ? Math.max(0, delta * .55) : 99 + 60 * (1 - 1 / ((delta - 180) * .55 / 60 + 1));
  }
  function refresh() {
    if (pending) return;
    setPending(true); setOffset(64);
    timer.current = setTimeout(() => {
      setCount(value => value + 1); setPending(false); setOffset(0);
    }, 1300);
  }
  function cancel() { origin.current = null; setDragging(false); setOffset(0); }
  return <div className="motion-extra">
    <div className="motion-refresh-panel" data-dragging={dragging || undefined}
      data-armed={dragging && offset >= 88 || undefined} data-pending={pending || undefined}
      style={{"--refresh-offset": `${offset}px`, "--refresh-stretch": Math.min(offset / 88, 1)} as CSSProperties}
      onPointerDown={event => {
        if (pending || origin.current || !event.isPrimary || event.button !== 0) return;
        origin.current = {id: event.pointerId, y: event.clientY};
        setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (origin.current?.id === event.pointerId) setOffset(distance(event.clientY - origin.current.y));
      }}
      onPointerUp={event => {
        const drag = origin.current;
        if (drag?.id !== event.pointerId) return;
        cancel();
        if (distance(event.clientY - drag.y) >= 88) refresh();
      }}
      onPointerCancel={cancel}
      onLostPointerCapture={event => { if (origin.current?.id === event.pointerId) cancel(); }}>
      <span className="motion-refresh-drop" aria-hidden="true">↻</span>
      <div className="motion-refresh-content">
        <strong key={count}>Activity is up to date</strong>
        <span role="status">{pending ? "Updating…" : dragging ? (offset >= 88 ? "Release to refresh" : "Pull to refresh") :
          count ? `Refreshed ${count} ${count === 1 ? "time" : "times"} in this preview` : "Ready to refresh"}</span>
      </div>
    </div>
    <Y.Button emphasis="soft" disabled={pending} onClick={refresh}>Refresh activity</Y.Button>
  </div>;
}
const formattingTools = ["Bold", "Italic", "Underline"];

function Toolbar() {
  const [selected, setSelected] = useState(0);
  const [bounds] = useState(() => [spring(0, 430, 33), spring(0, 430, 33)]);
  const group = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const frame = group.current, plate = mark.current;
    if (!frame || !plate) return;
    const row = frame.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row) return;
    let stop: (() => void) | undefined;
    const sync = () => {
      bounds[0].target = row.offsetLeft;
      bounds[1].target = row.offsetWidth;
      if (!bounds[1].position) {
        bounds.forEach(axis => snap(axis, axis.target));
      }
      stop?.();
      stop = playSprings(bounds, () => {
        plate.style.left = `${bounds[0].position}px`;
        plate.style.width = `${bounds[1].position}px`;
      });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(frame); observer.observe(row);
    return () => {observer.disconnect(); stop?.();};
  }, [bounds, selected]);
  return <div className="motion-extra">
    <span>Formatting preview</span>
    <div ref={group} role="toolbar" aria-label="Formatting preview" className="motion-format-tools">
      <span ref={mark} className="motion-format-marker" aria-hidden="true" />
      {formattingTools.map((item, index) => <button key={item} type="button" aria-pressed={index === selected}
        onClick={() => setSelected(index)}>{item}</button>)}
    </div>
    <span role="status">{formattingTools[selected]} selected</span>
  </div>;
}
function Rating() {
  const [value, setValue] = useState(0);
  return <div className="motion-extra"><Y.Rating label="How was your experience?" value={value} onValueChange={setValue} showStatus /></div>;
}
export const extraControls: { id: string; title: string; body: ReactNode }[] = [
  { id: "invite-people", title: "Invite people", body: <InvitePeople /> },
  { id: "tag-input", title: "Tag input", body: <TagInput /> },
  { id: "number-stepper", title: "Number stepper", body: <Stepper /> },
  { id: "wheel-picker", title: "Wheel picker", body: <WheelPicker /> },
  { id: "scrubber", title: "Scrubber", body: <Scrubber /> },
  { id: "undo-action", title: "Undo action", body: <UndoAction /> },
  { id: "refresh-activity", title: "Refresh activity", body: <Refresh /> },
  { id: "formatting-toolbar", title: "Formatting toolbar", body: <Toolbar /> },
  { id: "rating", title: "Rating", body: <Rating /> },
];
