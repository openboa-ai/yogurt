"use client";
import {
  Disclosure
} from "./chunk-ZGIHH6ZE.js";
import {
  Icon
} from "./chunk-H36QHH35.js";

// packages/web/src/patterns/motion-confirm.tsx
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function useConfirmation(onConfirm) {
  const [done, setDone] = useState(false);
  const locked = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const confirm = () => {
    if (locked.current) return;
    locked.current = true;
    setDone(true);
    timer.current = setTimeout(() => {
      locked.current = false;
      setDone(false);
    }, 1800);
    onConfirm();
  };
  return { done, locked, confirm };
}
function HoldButton({ label, onConfirm }) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [showHolding, setShowHolding] = useState(false);
  const amount = useRef(0);
  const fill = useRef(null);
  const drain = useRef(void 0);
  const active = useRef(null);
  const frame = useRef(null);
  const callback = useRef(onConfirm);
  callback.current = onConfirm;
  const { done, locked, confirm } = useConfirmation(() => callback.current());
  const cancel = () => {
    if (active.current === null) return;
    const releasedAt = amount.current;
    if (releasedAt > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drain.current = fill.current?.animate([
        { transform: `scaleX(${releasedAt})` },
        { transform: "scaleX(0)" }
      ], { duration: releasedAt * 300, easing: "cubic-bezier(.23, 1, .32, 1)" });
    }
    active.current = null;
    amount.current = 0;
    setShowHolding(false);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
    setProgress(0);
  };
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    drain.current?.cancel();
  }, []);
  const start = (event) => {
    if (!event.isPrimary || event.button !== 0 || active.current !== null || locked.current) return;
    drain.current?.cancel();
    setArmed(false);
    setHolding(true);
    active.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const started = performance.now();
    const tick = (now) => {
      if (active.current === null) return;
      const elapsed = now - started;
      const next = Math.min(1, elapsed / 1200);
      amount.current = next;
      setProgress(next);
      if (elapsed >= 150) setShowHolding(true);
      if (next === 1) {
        active.current = null;
        frame.current = null;
        setHolding(false);
        setShowHolding(false);
        setProgress(0);
        amount.current = 0;
        confirm();
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      "aria-label": armed ? `Confirm ${label}` : label,
      className: "yg-hold-confirm",
      "data-holding": holding || void 0,
      "data-done": done || void 0,
      style: { "--yg-confirm-progress": progress },
      onPointerDown: start,
      onPointerMove: (event) => {
        if (active.current !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
      onBlur: () => {
        cancel();
        setArmed(false);
      },
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          cancel();
          setArmed(false);
        }
      },
      onClick: (event) => {
        if (event.detail !== 0 || locked.current) return;
        if (armed) {
          setArmed(false);
          confirm();
        } else setArmed(true);
      },
      children: [
        /* @__PURE__ */ jsx("span", { ref: fill, className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "yg-confirm-label", children: done ? /* @__PURE__ */ jsx("svg", { className: "yg-hold-check", width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ jsx(
          "path",
          {
            d: "m3.5 8.5 3 3 6-7",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            pathLength: "1"
          }
        ) }) : armed ? `Confirm ${label}` : showHolding ? "Keep holding" : label }, done ? "complete" : showHolding ? "holding" : armed ? "armed" : "ready")
      ]
    }
  );
}
function SlideConfirm({ label, onConfirm }) {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const active = useRef(null);
  const value = useRef(0);
  const { done, locked, confirm } = useConfirmation(onConfirm);
  const reset = () => {
    active.current = null;
    value.current = 0;
    setProgress(0);
    setDragging(false);
  };
  const update = (event) => {
    const drag = active.current;
    if (!drag || drag.id !== event.pointerId) return;
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) * drag.direction / drag.width));
    drag.samples = drag.samples.filter((sample) => event.timeStamp - sample.time <= 80);
    drag.samples.push({ x: event.clientX, time: event.timeStamp });
    setProgress(value.current);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      "aria-label": armed ? `Confirm ${label}` : label,
      className: "yg-slide-confirm",
      "data-dragging": dragging || void 0,
      "data-done": done || void 0,
      style: { "--yg-confirm-progress": done ? 1 : progress },
      onPointerDown: (event) => {
        if (!event.isPrimary || event.button !== 0 || active.current || locked.current) return;
        setArmed(false);
        const handle = event.currentTarget.querySelector(".yg-slide-confirm-handle");
        const bounds = handle?.getBoundingClientRect();
        if (!bounds || event.clientX < bounds.left || event.clientX > bounds.right) return;
        const width = event.currentTarget.clientWidth - bounds.width - 8;
        if (width <= 0) return;
        active.current = {
          id: event.pointerId,
          start: event.clientX,
          width,
          direction: getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1,
          samples: [{ x: event.clientX, time: event.timeStamp }]
        };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: update,
      onPointerUp: (event) => {
        const drag = active.current;
        if (drag?.id !== event.pointerId) return;
        update(event);
        const first = drag.samples[0];
        const elapsed = event.timeStamp - first.time;
        const speed = elapsed > 0 ? (event.clientX - first.x) * drag.direction * 1e3 / elapsed : 0;
        const complete = value.current >= 0.9 || value.current > 0.45 && speed > 900;
        reset();
        if (complete) confirm();
      },
      onPointerCancel: reset,
      onLostPointerCapture: reset,
      onBlur: () => {
        reset();
        setArmed(false);
      },
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          reset();
          setArmed(false);
        }
      },
      onClick: (event) => {
        if (event.detail !== 0 || locked.current) return;
        if (armed) {
          setArmed(false);
          confirm();
        } else setArmed(true);
      },
      children: [
        /* @__PURE__ */ jsx("span", { className: "yg-confirm-label", children: armed ? `Confirm ${label}` : label }),
        /* @__PURE__ */ jsx("span", { className: "yg-confirm-fill", "aria-hidden": "true", children: done ? "Confirmed" : label }),
        /* @__PURE__ */ jsx("span", { className: "yg-slide-confirm-handle", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Icon, { name: done ? "check" : "arrow" }) })
      ]
    }
  );
}

// packages/web/src/patterns/motion-cart.tsx
import { useEffect as useEffect2, useLayoutEffect, useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var holdDelay = 380;
var initialRepeat = 150;
var minimumRepeat = 55;
var limitNoticeDuration = 1600;
function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef2(count);
  const goingDown = count < previous.current;
  const lastCount = previous.current;
  useLayoutEffect(() => {
    previous.current = count;
  }, [count]);
  const [showLimit, setShowLimit] = useState2(false);
  const notice = useRef2(void 0);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef2({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef2(null);
  const pointer = useRef2(void 0);
  const timer = useRef2(void 0);
  const skipClick = useRef2(false);
  function stop() {
    clearTimeout(timer.current);
    pointer.current = void 0;
  }
  useEffect2(() => {
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("blur", stop);
      clearTimeout(notice.current);
      stop();
    };
  }, []);
  function change(direction, repeat) {
    const { count: count2, limit: limit2, onQuantityChange: onQuantityChange2 } = latest.current;
    const next = count2 + direction;
    if (next > limit2) {
      clearTimeout(notice.current);
      setShowLimit(true);
      notice.current = setTimeout(() => setShowLimit(false), limitNoticeDuration);
      return false;
    }
    if (next < (repeat ? 1 : 0)) return false;
    clearTimeout(notice.current);
    setShowLimit(false);
    if (next === 0) increase.current?.focus();
    onQuantityChange2(next);
    return true;
  }
  function start(event, direction) {
    if (!event.isPrimary || event.button !== 0) return;
    skipClick.current = false;
    if (!open || pointer.current !== void 0) return;
    pointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    let interval = initialRepeat;
    function repeat() {
      skipClick.current = true;
      if (!change(direction, true)) return;
      timer.current = setTimeout(repeat, interval);
      interval = Math.max(minimumRepeat, interval * 0.82);
    }
    timer.current = setTimeout(repeat, holdDelay);
  }
  function stayInControl(event) {
    if (pointer.current !== event.pointerId) return;
    const { top, right, bottom, left } = event.currentTarget.getBoundingClientRect();
    if (event.clientY < top || event.clientX > right || event.clientY > bottom || event.clientX < left) {
      skipClick.current = true;
      stop();
    }
  }
  function end(event) {
    if (pointer.current === event.pointerId) stop();
  }
  const pointerHandlers = {
    onPointerMove: stayInControl,
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end
  };
  function activate(direction, detail) {
    if (detail === 0 || !skipClick.current) change(direction, false);
    skipClick.current = false;
  }
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: "yg-cart-control",
      role: "group",
      "aria-label": label,
      "data-open": open,
      onKeyDown: (event) => {
        if (event.key === "Escape" && pointer.current !== void 0) {
          skipClick.current = true;
          stop();
        }
      },
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) stop();
      },
      children: [
        /* @__PURE__ */ jsx2("span", { className: "yg-cart-limit", role: "status", children: showLimit && reachedLimit ? `Limit ${limit} per order` : null }),
        /* @__PURE__ */ jsxs2("div", { className: "yg-cart-stepper", children: [
          /* @__PURE__ */ jsx2(
            "button",
            {
              type: "button",
              className: "yg-cart-decrease",
              hidden: !open,
              "aria-label": count === 1 ? `Remove ${label}` : `Decrease quantity of ${label}`,
              ...pointerHandlers,
              onPointerDown: (event) => start(event, -1),
              onClick: (event) => activate(-1, event.detail),
              children: /* @__PURE__ */ jsx2(
                "svg",
                {
                  className: "yg-icon",
                  "aria-hidden": "true",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 1.7,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ jsx2("path", { d: count === 1 ? "M4 6h16M9 6V4h6v2m3 0-1 14H7L6 6m4 4v6m4-6v6" : "M5 12h14" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx2("output", { className: "yg-cart-quantity", "aria-label": `Quantity of ${label}`, "data-quantity": count, hidden: !open, children: /* @__PURE__ */ jsxs2("span", { className: "yg-cart-roll", "data-direction": goingDown ? "down" : "up", children: [
            lastCount !== count && lastCount > 0 && /* @__PURE__ */ jsx2("span", { className: "yg-cart-previous", "aria-hidden": "true", children: lastCount }),
            /* @__PURE__ */ jsx2("span", { className: "yg-cart-current", children: count })
          ] }, count) }),
          /* @__PURE__ */ jsxs2(
            "button",
            {
              ref: increase,
              type: "button",
              className: "yg-cart-increase",
              "aria-disabled": reachedLimit || void 0,
              "aria-label": open ? `Increase quantity of ${label}` : `${addLabel} ${label}`,
              ...pointerHandlers,
              onPointerDown: (event) => start(event, 1),
              onClick: (event) => activate(1, event.detail),
              children: [
                !open && /* @__PURE__ */ jsx2("span", { children: addLabel }),
                /* @__PURE__ */ jsx2(Icon, { name: "plus" })
              ]
            }
          )
        ] })
      ]
    }
  );
}

// packages/web/src/patterns/motion-cards.tsx
import { useLayoutEffect as useLayoutEffect2, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function ExpandCard({ title, children }) {
  const card = useRef3(null);
  const [open, setOpen] = useState3(false);
  useLayoutEffect2(() => {
    const root = card.current;
    if (!root) return;
    root.style.setProperty("--yg-card-expansion", String(Number(open)));
    root.style.setProperty("--yg-card-content", String(Number(open)));
  }, [open]);
  return /* @__PURE__ */ jsxs3("details", { ref: card, className: "yg-expand-card", onToggle: (event) => setOpen(event.currentTarget.open), children: [
    /* @__PURE__ */ jsxs3("summary", { children: [
      /* @__PURE__ */ jsx3("span", { className: "yg-expand-art", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx3("span", { className: "yg-expand-title", children: title }),
      /* @__PURE__ */ jsx3("span", { className: "yg-card-disclosure", children: /* @__PURE__ */ jsx3(Icon, { name: "plus" }) })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "yg-expand-card-body", children })
  ] });
}
function FanCards({ items }) {
  const [selectedId, setSelectedId] = useState3(null);
  const [highlight, setHighlight] = useState3(null);
  const [pointer, setPointer] = useState3(false);
  const [keyboard, setKeyboard] = useState3(false);
  const selected = items.find((item) => item.id === selectedId);
  const list = useRef3(null);
  useLayoutEffect2(() => {
    const root = list.current;
    if (!root || items.length > 3) return;
    const buttons = Array.from(root.querySelectorAll("button[data-card]"));
    const active = pointer || keyboard;
    const rows = buttons.map((button, index) => {
      const id = button.dataset.card;
      const featured = highlight ?? selectedId ?? items[Math.floor(items.length / 2)]?.id;
      const hot = active && id === featured;
      button.toggleAttribute("data-front", id === featured);
      button.style.zIndex = id === featured ? "5" : index === 1 ? "3" : "2";
      return { button, hot, index: index - (items.length - 1) / 2 };
    });
    const render = () => {
      const width = root.offsetWidth;
      const room = Math.min(66, Math.max(0, (width - 208) / 2));
      const angle = 9;
      rows.forEach(({ button, hot, index }) => {
        const x = index * (active ? room : 6);
        const y = Math.abs(index) * (active ? 12 : 0) + (hot ? -22 : 0);
        button.style.setProperty("--yg-fan-transform", `translate(calc(-50% + ${x}px), ${y}px) rotate(${index * (3 + (active ? angle : 0))}deg) scale(${hot ? 1.06 : 1})`);
      });
    };
    render();
    const sizes = new ResizeObserver(render);
    sizes.observe(root);
    return () => sizes.disconnect();
  }, [highlight, items, keyboard, pointer, selectedId]);
  return /* @__PURE__ */ jsxs3("div", { className: "yg-fan-cards", children: [
    /* @__PURE__ */ jsx3(
      "div",
      {
        className: "yg-fan-cards-list",
        ref: list,
        "aria-label": "Cards",
        "data-many": items.length > 3 || void 0,
        onPointerEnter: () => setPointer(true),
        onPointerLeave: () => {
          setPointer(false);
          setHighlight(null);
        },
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setKeyboard(false);
        },
        children: items.map((item, index) => /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            "data-card": item.id,
            style: { "--yg-fan-offset": index - (items.length - 1) / 2 },
            "aria-pressed": item.id === selected?.id,
            onPointerEnter: () => setHighlight(item.id),
            onFocus: (event) => {
              if (event.currentTarget.matches(":focus-visible")) {
                setKeyboard(true);
                setHighlight(item.id);
              }
            },
            onClick: () => setSelectedId(item.id === selectedId ? null : item.id),
            children: [
              /* @__PURE__ */ jsx3("span", { className: "yg-fan-art", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx3("span", { className: "yg-fan-index", "aria-hidden": "true", children: String(index + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsx3("span", { className: "yg-fan-label", children: item.label }),
              /* @__PURE__ */ jsx3(Icon, { name: "next" })
            ]
          },
          item.id
        ))
      }
    ),
    selected && /* @__PURE__ */ jsxs3("p", { className: "yg-fan-detail", children: [
      /* @__PURE__ */ jsx3("strong", { children: selected.label }),
      /* @__PURE__ */ jsx3("span", { children: selected.detail })
    ] })
  ] });
}
function StatSeries({ values }) {
  const stroke = useRef3(null), fill = useRef3(null);
  const dot = useRef3(null);
  useLayoutEffect2(() => {
    const safe = values.map((value) => Number.isFinite(value) ? value : 0);
    if (!safe.length) return;
    const coordinates = safe.map((position, i) => [
      4 + i / Math.max(1, safe.length - 1) * 288,
      8 + (1 - Math.min(1.05, Math.max(-0.05, position))) * 80
    ]);
    let curve = `M${coordinates[0].join(" ")}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const a = coordinates[i - 1] ?? coordinates[i], b = coordinates[i];
      const c = coordinates[i + 1], d = coordinates[i + 2] ?? c;
      const first = b.map((value, axis) => value + (c[axis] - a[axis]) / 6);
      const second = c.map((value, axis) => value - (d[axis] - b[axis]) / 6);
      curve += ` C${first.join(" ")} ${second.join(" ")} ${c.join(" ")}`;
    }
    const last = coordinates[coordinates.length - 1];
    stroke.current?.setAttribute("d", curve);
    fill.current?.setAttribute("d", `${curve} L${last[0]} 96 L4 96 Z`);
    dot.current?.setAttribute("cx", String(last[0]));
    dot.current?.setAttribute("cy", String(last[1]));
  }, [values]);
  return /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 296 96", className: "yg-stat-series", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx3("path", { ref: fill, className: "yg-stat-area" }),
    /* @__PURE__ */ jsx3("path", { ref: stroke, className: "yg-stat-line" }),
    /* @__PURE__ */ jsx3("circle", { ref: dot, r: "4" })
  ] });
}
function StatCard({ label, value, detail, series }) {
  return /* @__PURE__ */ jsxs3("section", { className: "yg-stat-card", "aria-label": label, children: [
    /* @__PURE__ */ jsxs3("div", { className: "yg-stat-heading", children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-stat-label", children: label }),
        /* @__PURE__ */ jsx3("strong", { className: "yg-stat-value", children: value.toLocaleString() })
      ] }),
      detail && /* @__PURE__ */ jsx3("span", { className: "yg-stat-detail", children: detail })
    ] }),
    series && series.length > 1 && /* @__PURE__ */ jsx3(StatSeries, { values: series })
  ] });
}
function ProfileCard({ name, detail, initials, children, actions }) {
  return /* @__PURE__ */ jsxs3("section", { className: "yg-profile-card", children: [
    /* @__PURE__ */ jsxs3("div", { className: "yg-profile-header", children: [
      /* @__PURE__ */ jsx3("span", { className: "yg-profile-avatar", "aria-hidden": "true", children: initials }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx3("strong", { children: name }),
        /* @__PURE__ */ jsx3("p", { children: detail })
      ] })
    ] }),
    children != null && /* @__PURE__ */ jsx3(Disclosure, { label: `More about ${name}`, children: /* @__PURE__ */ jsx3("div", { className: "yg-profile-extra", children }) }),
    actions
  ] });
}

export {
  HoldButton,
  SlideConfirm,
  CartButton,
  ExpandCard,
  FanCards,
  StatCard,
  ProfileCard
};
