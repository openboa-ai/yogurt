import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

type ConfirmProps = { label: string; onConfirm: () => void };
const HOLD_MS = 1000;

/** A pointer hold confirms after one second; keyboard activation requires a second activation. */
export function HoldButton({ label, onConfirm }: ConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const active = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const callback = useRef(onConfirm);
  callback.current = onConfirm;
  const cancel = () => {
    active.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setProgress(0);
  };
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const start = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0 || active.current !== null) return;
    setArmed(false);
    active.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const started = performance.now();
    const tick = (now: number) => {
      if (active.current === null) return;
      const next = Math.min(1, (now - started) / HOLD_MS);
      setProgress(next);
      if (next === 1) {
        active.current = null;
        frame.current = null;
        callback.current();
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return <button type="button" className="yg-hold-confirm" style={{ '--yg-confirm-progress': progress } as CSSProperties}
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
      if (event.detail !== 0) return;
      if (armed) { setArmed(false); callback.current(); } else setArmed(true);
    }}>
    <span className="yg-confirm-fill" aria-hidden="true" /><span className="yg-confirm-label">{armed ? `Confirm ${label}` : label}</span>
  </button>;
}

/** Drag the handle to the end and release; keyboard activation requires a second activation. */
export function SlideConfirm({ label, onConfirm }: ConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const active = useRef<{ id: number; start: number; width: number } | null>(null);
  const value = useRef(0);
  const reset = () => { active.current = null; value.current = 0; setProgress(0); };
  const update = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = active.current;
    if (!drag || drag.id !== event.pointerId) return;
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) / drag.width));
    setProgress(value.current);
  };
  return <button type="button" className="yg-slide-confirm" style={{ '--yg-confirm-progress': progress } as CSSProperties}
    onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0 || active.current) return;
      setArmed(false);
      const handle = event.currentTarget.querySelector<HTMLElement>('.yg-slide-confirm-handle');
      const width = event.currentTarget.clientWidth - (handle?.offsetWidth ?? 0);
      if (width <= 0) return;
      active.current = { id: event.pointerId, start: event.clientX, width };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={update}
    onPointerUp={(event) => {
      if (active.current?.id !== event.pointerId) return;
      update(event);
      const complete = value.current >= 0.95;
      reset();
      if (complete) onConfirm();
    }}
    onPointerCancel={reset} onLostPointerCapture={reset}
    onBlur={() => { reset(); setArmed(false); }}
    onKeyDown={(event) => { if (event.key === 'Escape') { reset(); setArmed(false); } }}
    onClick={(event) => {
      if (event.detail !== 0) return;
      if (armed) { setArmed(false); onConfirm(); } else setArmed(true);
    }}>
    <span className="yg-confirm-fill" aria-hidden="true" /><span className="yg-confirm-label">{armed ? `Confirm ${label}` : label}</span><span className="yg-slide-confirm-handle" aria-hidden="true">→</span>
  </button>;
}
