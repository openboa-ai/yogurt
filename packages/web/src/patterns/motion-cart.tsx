"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { Icon } from "../foundation/foundation.js";

type CartButtonProps = {
  label: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  addLabel?: string;
};

const holdDelay = 380;
const initialRepeat = 150;
const minimumRepeat = 55;
const limitNoticeDuration = 1600;

export function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }: CartButtonProps) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef(count);
  const goingDown = count < previous.current;
  const lastCount = previous.current;
  useLayoutEffect(() => { previous.current = count; }, [count]);
  const [showLimit, setShowLimit] = useState(false);
  const notice = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef<HTMLButtonElement>(null);
  const pointer = useRef<number | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipClick = useRef(false);

  function stop() {
    clearTimeout(timer.current);
    pointer.current = undefined;
  }

  useEffect(() => {
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("blur", stop);
      clearTimeout(notice.current);
      stop();
    };
  }, []);

  function change(direction: 1 | -1, repeat: boolean) {
    const { count, limit, onQuantityChange } = latest.current;
    const next = count + direction;
    if (next > limit) {
      clearTimeout(notice.current);
      setShowLimit(true);
      notice.current = setTimeout(() => setShowLimit(false), limitNoticeDuration);
      return false;
    }
    if (next < (repeat ? 1 : 0)) return false;
    clearTimeout(notice.current);
    setShowLimit(false);
    if (next === 0) increase.current?.focus();
    onQuantityChange(next);
    return true;
  }

  function start(event: PointerEvent<HTMLButtonElement>, direction: 1 | -1) {
    if (!event.isPrimary || event.button !== 0) return;
    skipClick.current = false;
    if (!open || pointer.current !== undefined) return;
    pointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    let interval = initialRepeat;
    function repeat() {
      skipClick.current = true;
      if (!change(direction, true)) return;
      timer.current = setTimeout(repeat, interval);
      interval = Math.max(minimumRepeat, interval * .82);
    }
    timer.current = setTimeout(repeat, holdDelay);
  }

  function stayInControl(event: PointerEvent<HTMLButtonElement>) {
    if (pointer.current !== event.pointerId) return;
    const { top, right, bottom, left } = event.currentTarget.getBoundingClientRect();
    if (event.clientY < top || event.clientX > right || event.clientY > bottom || event.clientX < left) {
      skipClick.current = true;
      stop();
    }
  }

  function end(event: PointerEvent<HTMLButtonElement>) {
    if (pointer.current === event.pointerId) stop();
  }

  const pointerHandlers = {
    onPointerMove: stayInControl,
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
  };

  function activate(direction: 1 | -1, detail: number) {
    if (detail === 0 || !skipClick.current) change(direction, false);
    skipClick.current = false;
  }

  return (
    <div className="yg-cart-control" role="group" aria-label={label} data-open={open}
      onKeyDown={event => {
        if (event.key === "Escape" && pointer.current !== undefined) {
          skipClick.current = true;
          stop();
        }
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) stop();
      }}>
      <span className="yg-cart-limit" role="status">{showLimit && reachedLimit ? `Limit ${limit} per order` : null}</span>
      <div className="yg-cart-stepper">
        <button type="button" className="yg-cart-decrease" hidden={!open}
          aria-label={count === 1 ? `Remove ${label}` : `Decrease quantity of ${label}`}
          {...pointerHandlers} onPointerDown={event => start(event, -1)}
          onClick={event => activate(-1, event.detail)}>
          <svg className="yg-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d={count === 1 ? "M4 6h16M9 6V4h6v2m3 0-1 14H7L6 6m4 4v6m4-6v6" : "M5 12h14"} />
          </svg>
        </button>
        <output className="yg-cart-quantity" aria-label={`Quantity of ${label}`} data-quantity={count} hidden={!open}>
          <span className="yg-cart-roll" key={count} data-direction={goingDown ? "down" : "up"}>
            {lastCount !== count && lastCount > 0 && <span className="yg-cart-previous" aria-hidden="true">{lastCount}</span>}
            <span className="yg-cart-current">{count}</span>
          </span>
        </output>
        <button ref={increase} type="button" className="yg-cart-increase" aria-disabled={reachedLimit || undefined}
          aria-label={open ? `Increase quantity of ${label}` : `${addLabel} ${label}`}
          {...pointerHandlers} onPointerDown={event => start(event, 1)}
          onClick={event => activate(1, event.detail)}>
          {!open && <span>{addLabel}</span>}
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
}
