"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

import { Icon } from '../foundation/foundation.js';

type ConfirmProps = { label: string; onConfirm: () => void };

function useConfirmation(onConfirm: () => void) {
  const [done, setDone] = useState(false);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const confirm = () => {
    if (locked.current) return;
    locked.current = true;
    setDone(true);
    timer.current = setTimeout(() => { locked.current = false; setDone(false); }, 1800);
    onConfirm();
  };
  return { done, locked, confirm };
}

export function HoldButton({ label, onConfirm }: ConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [holding, setHolding] = useState(false);
  const active = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const callback = useRef(onConfirm);
  callback.current = onConfirm;
  const { done, locked, confirm } = useConfirmation(() => callback.current());
  const cancel = () => {
    active.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
    setProgress(0);
  };
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const start = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0 || active.current !== null || locked.current) return;
    setArmed(false);
    setHolding(true);
    active.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const started = performance.now();
    const tick = (now: number) => {
      if (active.current === null) return;
      const next = Math.min(1, (now - started) / 1200);
      setProgress(next);
      if (next === 1) {
        active.current = null;
        frame.current = null;
        setHolding(false);
        confirm();
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return <button type="button" aria-label={armed ? `Confirm ${label}` : label} className="yg-hold-confirm" data-holding={holding || undefined} data-done={done || undefined} style={{ '--yg-confirm-progress': progress } as CSSProperties}
    onPointerDown={start}
    onPointerMove={(event) => {
      if (active.current !== event.pointerId) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancel();
    }}
    onPointerUp={cancel} onPointerCancel={cancel} onLostPointerCapture={cancel}
    onBlur={() => { cancel(); setArmed(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape') { cancel(); setArmed(false); } }}
    onClick={(event) => {
      if (event.detail !== 0 || locked.current) return;
      if (armed) { setArmed(false); confirm(); } else setArmed(true);
    }}>
    <span className="yg-confirm-fill" aria-hidden="true" /><span className="yg-confirm-label">{done ? <Icon name="check" /> : armed ? `Confirm ${label}` : label}</span>
  </button>;
}

export function SlideConfirm({ label, onConfirm }: ConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = useRef<{
    id: number; start: number; width: number; samples: { x: number; time: number }[];
  } | null>(null);
  const value = useRef(0);
  const { done, locked, confirm } = useConfirmation(onConfirm);
  const reset = () => { active.current = null; value.current = 0; setProgress(0); setDragging(false); };
  const update = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = active.current;
    if (!drag || drag.id !== event.pointerId) return;
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) / drag.width));
    drag.samples = drag.samples.filter(sample => event.timeStamp - sample.time <= 80);
    drag.samples.push({ x: event.clientX, time: event.timeStamp });
    setProgress(value.current);
  };
  return <button type="button" aria-label={armed ? `Confirm ${label}` : label} className="yg-slide-confirm" data-dragging={dragging || undefined} data-done={done || undefined} style={{ '--yg-confirm-progress': done ? 1 : progress } as CSSProperties}
    onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0 || active.current || locked.current) return;
      setArmed(false);
      const handle = event.currentTarget.querySelector<HTMLElement>('.yg-slide-confirm-handle');
      const bounds = handle?.getBoundingClientRect();
      if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right) return;
      const width = event.currentTarget.clientWidth - bounds.width - 8;
      if (width <= 0) return;
      active.current = {
        id: event.pointerId, start: event.clientX, width,
        samples: [{ x: event.clientX, time: event.timeStamp }],
      };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={update}
    onPointerUp={(event) => {
      const drag = active.current;
      if (drag?.id !== event.pointerId) return;
      update(event);
      const first = drag.samples[0];
      const elapsed = event.timeStamp - first.time;
      const speed = elapsed > 0 ? (event.clientX - first.x) * 1000 / elapsed : 0;
      const complete = value.current >= 0.9 || (value.current > 0.45 && speed > 900);
      reset();
      if (complete) confirm();
    }}
    onPointerCancel={reset} onLostPointerCapture={reset}
    onBlur={() => { reset(); setArmed(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape') { reset(); setArmed(false); } }}
    onClick={(event) => {
      if (event.detail !== 0 || locked.current) return;
      if (armed) { setArmed(false); confirm(); } else setArmed(true);
    }}>
    <span className="yg-confirm-label">{armed ? `Confirm ${label}` : label}</span>
    <span className="yg-confirm-fill" aria-hidden="true">{done ? "Confirmed" : label}</span>
    <span className="yg-slide-confirm-handle" aria-hidden="true"><Icon name={done ? "check" : "arrow"} /></span>
  </button>;
}
