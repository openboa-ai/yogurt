"use client";
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ElasticRange } from "./elastic-range.js";
import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

type Option = { id: string; label: string };

type RangeSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  end?: number;
  onEndChange?: (value: number) => void;
  detail?: string;
  formatValue?: (value: number) => string;
  presentation?: "standard" | "elastic";
  minThumbGap?: number;
};

export function RangeSlider({
  label, value, onChange, min = 0, max = 100, step = 1,
  end, onEndChange, detail, formatValue = String, presentation = "standard", minThumbGap = 0,
}: RangeSliderProps) {
  const id = useId();
  const interval = useRef<HTMLDivElement>(null);
  const activeDrag = useRef<{ id: number; thumb: "start" | "end" } | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const percent = (number: number) => max > min
    ? Math.max(0, Math.min(100, (number - min) / (max - min) * 100)) : 0;
  const first = percent(value);
  const last = end === undefined ? first : percent(end);
  const [motion] = useState(() => ({
    start: spring(first,260,24), end: spring(last,260,24), merge: spring(0,300,26),
  }));
  useLayoutEffect(() => {
    const rail = interval.current;
    const root = rail?.parentElement;
    if (!rail || !root) return;
    const firstTip = rail.querySelector<HTMLElement>('[data-tip="start"]');
    const lastTip = rail.querySelector<HTMLElement>('[data-tip="end"]');
    const joinedTip = rail.querySelector<HTMLElement>('[data-tip="joined"]');
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const tracks = Object.values(motion);
    let frame = 0, previous = performance.now(), width = 0, need = 0;
    let startInset = 0, endInset = 0;
    let firstWidth = 0, lastWidth = 0, joinedWidth = 0;
    function contain(position: number, tipWidth: number) {
      const half = tipWidth / 2 + 6;
      const start = half - startInset;
      const end = width + endInset - half;
      const x = position * width / 100;
      return end < start ? (start + end) / 2 : Math.max(start, Math.min(end, x));
    }
    function paint() {
      const a = motion.start.position, b = motion.end.position;
      const middle = (a+b)/2;
      const amount = Math.max(0, Math.min(1, motion.merge.position));
      const tilt = (velocity: number) => Math.max(-12,Math.min(12,-velocity*width/100*.02));
      const settings = {
        "--yg-range-start": `${a}%`, "--yg-range-end": `${b}%`,
        "--yg-tip-first": `${contain(a + (middle-a)*amount, firstWidth)}px`,
        "--yg-tip-last": `${contain(b + (middle-b)*amount, lastWidth)}px`,
        "--yg-tip-middle": `${contain(middle, joinedWidth)}px`, "--yg-tip-first-tilt": `${tilt(motion.start.velocity)}deg`,
        "--yg-tip-last-tilt": `${tilt(motion.end.velocity)}deg`,
        "--yg-tip-middle-tilt": `${tilt((motion.start.velocity+motion.end.velocity)/2)}deg`,
        "--yg-tip-merge": String(amount),
      };
      for (const [key, value] of Object.entries(settings)) root?.style.setProperty(key,value);
    }
    function targetMerge() { motion.merge.target = Number((motion.end.position-motion.start.position)*width/100<need); }
    function tick(now: number) {
      targetMerge();
      const moving = advanceSprings(tracks,(now-previous)/1000);
      previous = now;
      paint();
      frame = moving ? requestAnimationFrame(tick) : 0;
    }
    function work() {
      if (!rail || !root) return;
      const bounds = root.getBoundingClientRect(), inner = rail.getBoundingClientRect();
      const rtl = getComputedStyle(rail).direction === "rtl";
      startInset = rtl ? bounds.right - inner.right : inner.left - bounds.left;
      endInset = rtl ? inner.left - bounds.left : bounds.right - inner.right;
      width = rail.clientWidth;
      setTrackWidth(width);
      root.style.setProperty("--yg-tip-max-width", `${Math.max(0, bounds.width - 12)}px`);
      firstWidth = firstTip?.offsetWidth ?? 0;
      lastWidth = lastTip?.offsetWidth ?? 0;
      joinedWidth = joinedTip?.offsetWidth ?? 0;
      need = (firstWidth + lastWidth) / 2 + 8;
      motion.start.target=first; motion.end.target=last;
      cancelAnimationFrame(frame);
      if (media.matches) {
        snap(motion.start,first); snap(motion.end,last);
        targetMerge(); snap(motion.merge,motion.merge.target); paint();
      } else {
        previous=performance.now();
        paint();
        frame=requestAnimationFrame(tick);
      }
    }
    work();
    const size=new ResizeObserver(work);
    size.observe(rail);
    if (firstTip) size.observe(firstTip);
    if (lastTip) size.observe(lastTip);
    if (joinedTip) size.observe(joinedTip);
    media.addEventListener("change",work);
    return ()=>{size.disconnect();media.removeEventListener("change",work);cancelAnimationFrame(frame);};
  },[first,last,motion]);

  if (end === undefined || !onEndChange) {
    if (presentation === "elastic") {
      return <ElasticRange label={label} value={value} onChange={onChange} min={min} max={max} step={step} formatValue={formatValue} />;
    }
    return <div className="yg-motion-range" style={{ "--yg-range-fill": `${first}%` } as CSSProperties}>
      <div className="yg-motion-range-heading"><label htmlFor={id}>{label}</label></div>
      <div className="yg-motion-range-area">
        <span className="yg-motion-range-tip" aria-hidden="true" style={{left: `${first}%`}}>{formatValue(value)}</span>
        <input id={id} type="range" min={min} max={max} step={step} value={value}
          onChange={event => onChange(event.currentTarget.valueAsNumber)} />
      </div>
    </div>;
  }

  const joined = last - first < 25;
  const increment = step > 0 && Number.isFinite(step) ? step : 1;
  const separation = trackWidth > 0 && max > min && Number.isFinite(minThumbGap) && minThumbGap > 0
    ? Math.min(max - min, Math.ceil(minThumbGap * (max - min) / trackWidth / increment) * increment) : 0;
  const maxStart = Math.max(min, end - separation);
  const minEnd = Math.min(max, value + separation);
  const set = (thumb: "start" | "end", next: number) => {
    const snapped = Number((min + Math.round((next - min) / increment) * increment).toFixed(10));
    if (thumb === "start") onChange(Math.max(min, Math.min(maxStart, snapped)));
    else onEndChange(Math.max(minEnd, Math.min(max, snapped)));
  };
  const position = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const direction = getComputedStyle(event.currentTarget).direction;
    const x = direction === "rtl" ? box.right - event.clientX : event.clientX - box.left;
    return min + Math.max(0, Math.min(1, x / Math.max(1, box.width))) * (max - min);
  };
  const onThumbKey = (event: KeyboardEvent<HTMLButtonElement>, side: "start" | "end", at: number) => {
    const bounds = side === "start" ? [min, maxStart] : [minEnd, max];
    const keys: Record<string, number> = {
      ArrowDown: at - increment, ArrowLeft: at - increment,
      ArrowUp: at + increment, ArrowRight: at + increment,
      Home: bounds[0], End: bounds[1],
    };
    if (keys[event.key] === undefined) return;
    event.preventDefault();
    set(side, keys[event.key]);
  };

  return <div className="yg-motion-range" data-interval="" role="group" aria-labelledby={id}
    style={{ "--yg-range-start": `${first}%`, "--yg-range-end": `${last}%` } as CSSProperties}>
    <div className="yg-motion-range-heading"><strong id={id}>{label}</strong>{detail && <span>{detail}</span>}</div>
    <div className="yg-motion-range-area" ref={interval} data-joined={joined || undefined} data-spring=""
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || activeDrag.current) return;
        const at = position(event);
        const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-thumb]");
        const side = target?.dataset.thumb === "start" || target?.dataset.thumb === "end"
          ? target.dataset.thumb : Math.abs(at - value) <= Math.abs(at - end) ? "start" : "end";
        activeDrag.current = {id: event.pointerId, thumb: side};
        (target ?? event.currentTarget.querySelector<HTMLButtonElement>(`[data-thumb="${side}"]`))?.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        if (!target) set(side, at);
      }}
      onPointerMove={event => {
        const drag = activeDrag.current;
        if (drag?.id === event.pointerId) set(drag.thumb, position(event));
      }}
      onPointerUp={event => {
        if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
      }}
      onPointerCancel={event => {
        if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
      }}
      onLostPointerCapture={event => {
        if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
      }}>
      <span className="yg-motion-interval-track" aria-hidden="true"><span /></span>
      <span className="yg-motion-range-tip" data-tip="start" aria-hidden="true">{formatValue(value)}</span>
      <span className="yg-motion-range-tip" data-tip="end" aria-hidden="true">{formatValue(end)}</span>
      <span className="yg-motion-range-tip" data-tip="joined" aria-hidden="true">{formatValue(value)}–{formatValue(end)}</span>
      <button type="button" role="slider" data-thumb="start" aria-label={`Minimum ${label.toLowerCase()}`}
        aria-valuemin={min} aria-valuemax={Math.max(value, maxStart)} aria-valuenow={value} aria-valuetext={formatValue(value)}
        onKeyDown={event => onThumbKey(event, "start", value)} />
      <button type="button" role="slider" data-thumb="end" aria-label={`Maximum ${label.toLowerCase()}`}
        aria-valuemin={Math.min(end, minEnd)} aria-valuemax={max} aria-valuenow={end} aria-valuetext={formatValue(end)}
        onKeyDown={event => onThumbKey(event, "end", end)} />
    </div>
  </div>;
}

export function PasswordStrength({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return <div className="yg-motion-password" data-score={score}>
    <label htmlFor={id}>Create a password</label>
    <div className="yg-motion-password-field"><input id={id} type={shown ? "text" : "password"} autoComplete="new-password" value={value} onChange={event => onChange(event.currentTarget.value)} aria-describedby={`${id}-checks`} /><button type="button" className="yg-motion-password-eye" aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown} onClick={() => setShown(!shown)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/><path className="yg-motion-password-slash" d="M4.5 4.5l15 15" /></svg></button></div>
    <div className="yg-motion-password-meter" aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index} style={{ "--yg-bar-index": index } as CSSProperties}><i data-active={index < score || undefined} /></span>)}</div>
    <div id={`${id}-checks`} className="yg-motion-password-checks"><strong key={word}>{word}</strong><span>8+ characters, mixed case, a number and a symbol</span></div>
  </div>;
}

export function CheckboxList({ options, value, onChange }: { options: Option[]; value: string[]; onChange: (value: string[]) => void }) {
  const count = options.filter(option => value.includes(option.id)).length;
  return <fieldset className="yg-motion-checklist"><legend>Choose options</legend><div className="yg-motion-checklist-heading"><strong>Today</strong><span><b>{count}</b> of {options.length} done</span></div>{options.map(option => <label key={option.id} className="yg-motion-checklist-item"><input type="checkbox" checked={value.includes(option.id)} onChange={event => onChange(event.currentTarget.checked ? [...value, option.id] : value.filter(id => id !== option.id))} /><span className="yg-motion-checklist-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4L18 8" /></svg></span><span className="yg-motion-checklist-text">{option.label}</span></label>)}</fieldset>;
}

export function DetentDial({ options, value, onChange }: { options: Option[]; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const index = options.findIndex(option => option.id === value);
  const selected = Math.max(0, index);
  const choose = (next: number) => { if (options.length) onChange(options[(next + options.length) % options.length].id); };
  return <div className="yg-motion-dial"><label htmlFor={id}>Selection</label><div className="yg-motion-dial-face" style={{ "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` } as CSSProperties}><span className="yg-motion-dial-marker" aria-hidden="true" /><span className="yg-motion-dial-value">{options[index]?.label ?? "No selection"}</span></div><input id={id} type="range" min={0} max={Math.max(0, options.length - 1)} step={1} value={selected} disabled={!options.length} aria-valuetext={options[index]?.label ?? "No selection"} onChange={event => choose(event.currentTarget.valueAsNumber)} onKeyDown={event => { if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) { event.preventDefault(); choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1)); } }} /><div className="yg-motion-dial-options" aria-hidden="true">{options.map(option => <span key={option.id} data-selected={option.id === value || undefined}>{option.label}</span>)}</div></div>;
}
