"use client";

import { useId, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const radius = 12;

type ElasticRangeProps = {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (value: number) => void; formatValue: (value: number) => string;
};

function animateRange(element: HTMLDivElement, initial: number) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const thumb = spring(0, 900, 50), dropX = spring(0, 260, 18);
  const dropY = spring(16, 420, 22), dropScale = spring(.5, 420, 22), press = spring(1, 520, 16);
  const tracks = [thumb, dropX, dropY, dropScale, press];
  let ratio = initial, width = 0, frame = 0, previous = 0;
  const x = () => radius + ratio * Math.max(1, width - radius * 2);

  function paint() {
    const stretch = 1 + Math.min(Math.abs(thumb.velocity) / 2400, .4);
    element.style.setProperty("--yg-elastic-thumb", `${thumb.position}px`);
    element.style.setProperty("--yg-elastic-fill", `${clamp(thumb.position, 0, width) * clamp((thumb.position - radius) / radius, 0, 1)}px`);
    element.style.setProperty("--yg-elastic-stretch", String(stretch * press.position));
    element.style.setProperty("--yg-elastic-squash", String(press.position / stretch));
    element.style.setProperty("--yg-elastic-drop-x", `${dropX.position}px`);
    element.style.setProperty("--yg-elastic-drop-y", `${dropY.position}px`);
    element.style.setProperty("--yg-elastic-drop-scale", String(dropScale.position));
    element.style.setProperty("--yg-elastic-tilt", `${clamp((dropX.position - thumb.position) * .9, -28, 28)}deg`);
    element.style.setProperty("--yg-elastic-label-opacity", String(clamp((dropScale.position - .7) / .25, 0, 1)));
  }

  function tick(time: number) {
    dropX.target = thumb.position;
    const moving = advanceSprings(tracks, (time - previous) / 1000);
    previous = time;
    paint();
    frame = moving ? requestAnimationFrame(tick) : 0;
  }
  function wake() {
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      snap(thumb, x()); snap(dropX, thumb.position);
      [dropY, dropScale, press].forEach(track => snap(track, track.target));
      paint();
    } else if (!frame) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function resize() {
    const next = element.clientWidth;
    if (!next || width === next) return;
    width = next;
    snap(thumb, x()); snap(dropX, x());
    paint();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(element);
  preference.addEventListener("change", wake);
  resize();

  return {
    controlled(next: number, dragging: boolean) {
      ratio = next;
      if (dragging) return;
      thumb.stiffness = 420; thumb.damping = 34;
      thumb.target = x();
      wake();
    },
    drag(next: number, raw: number) {
      ratio = next;
      thumb.stiffness = 900; thumb.damping = 50;
      const limit = Math.max(radius, width - radius);
      const edge = clamp(raw, radius, limit);
      const off = raw - edge;
      thumb.target = edge + Math.sign(off) * 18 * (1 - 1 / (Math.abs(off) * .55 / 18 + 1));
      wake();
    },
    release(next: number) {
      ratio = next;
      thumb.stiffness = 300; thumb.damping = 14;
      thumb.target = x();
      wake();
    },
    presence(dragging: boolean, lifted: boolean, hovered: boolean) {
      dropY.target = dragging || lifted ? -22 : 16;
      dropScale.target = dragging || lifted ? 1 : .5;
      press.target = dragging ? 1.16 : hovered ? 1.08 : 1;
      wake();
    },
    dispose() {
      observer.disconnect();
      preference.removeEventListener("change", wake);
      cancelAnimationFrame(frame);
    },
  };
}

export function ElasticRange({label, value, min, max, step, onChange, formatValue}: ElasticRangeProps) {
  const id = useId(), filter = useId();
  const rail = useRef<HTMLDivElement>(null), hit = useRef<HTMLButtonElement>(null);
  const motion = useRef<ReturnType<typeof animateRange> | null>(null);
  const drag = useRef<number | null>(null);
  const hover = useRef(false), focused = useRef(false);
  const ratio = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const valueOnMount = useRef(ratio);
  useLayoutEffect(() => {
    if (!rail.current) return;
    const controller = animateRange(rail.current, valueOnMount.current);
    motion.current = controller;
    return () => { controller.dispose(); motion.current = null; };
  }, []);
  useLayoutEffect(() => { motion.current?.controlled(ratio, drag.current !== null); }, [ratio]);

  function sync() { motion.current?.presence(drag.current !== null, focused.current, hover.current); }
  function aim(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const raw = rtl ? rect.right - event.clientX : event.clientX - rect.left;
    const next = clamp((raw - radius) / Math.max(1, rect.width - radius * 2), 0, 1);
    const increment = Number.isFinite(step) && step > 0 ? step : 1;
    const value = clamp(min + Math.round((max - min) * next / increment) * increment, min, max);
    motion.current?.drag(next, raw);
    onChange(Number(value.toFixed(10)));
  }
  function stop(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerId !== drag.current) return;
    drag.current = null;
    motion.current?.release(ratio);
    sync();
  }
  function key(event: KeyboardEvent<HTMLButtonElement>) {
    const offsets: Record<string, number> = {ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 2, PageDown: -2};
    if (!(event.key in offsets) && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? min : event.key === "End" ? max :
      clamp(value + offsets[event.key] * step, min, max);
    focused.current = true;
    sync();
    onChange(Number(next.toFixed(10)));
  }
  return <div className="yg-elastic-range">
    <label htmlFor={id}>{label}</label>
    <svg width="0" height="0" aria-hidden="true"><defs>
      <filter id={filter} x="-30%" y="-100%" width="160%" height="240%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10" />
      </filter>
    </defs></svg>
    <div ref={rail} className="yg-elastic-rail"
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || drag.current !== null) return;
        drag.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        hit.current?.focus({preventScroll: true});
        aim(event); sync();
      }}
      onPointerMove={event => { if (drag.current === event.pointerId) aim(event); }}
      onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
      onPointerEnter={event => { hover.current = event.pointerType === "mouse"; sync(); }}
      onPointerLeave={() => { hover.current = false; sync(); }}>
      <span className="yg-elastic-track" aria-hidden="true"><i /></span>
      <span className="yg-elastic-goo" aria-hidden="true" style={{filter: `url(#${filter})`}}>
        <i className="yg-elastic-thumb" /><i className="yg-elastic-drop" />
      </span>
      <span className="yg-elastic-value" aria-hidden="true">{formatValue(value)}</span>
      <button ref={hit} type="button" role="slider" id={id} aria-label={label}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={formatValue(value)}
        onKeyDown={key} onFocus={event => { focused.current = event.currentTarget.matches(":focus-visible"); sync(); }}
        onBlur={() => { focused.current = false; sync(); }} />
    </div>
    <div className="yg-elastic-marks" aria-hidden="true">
      {Array.from({length: 21}, (_, i) => <i key={i} data-major={i % 5 === 0 || undefined}
        data-passed={i / 20 <= ratio && ratio > 0 || undefined} />)}
    </div>
    <div className="yg-elastic-labels" aria-hidden="true">
      {[0, .25, .5, .75, 1].map(position => <span style={{"--yg-scale-position": position} as CSSProperties} key={position}>
        {formatValue(min + position * (max - min))}
      </span>)}
    </div>
  </div>;
}
