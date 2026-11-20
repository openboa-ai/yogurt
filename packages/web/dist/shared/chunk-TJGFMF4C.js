"use client";
import {
  playSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Button
} from "./chunk-XHKWNKXE.js";
import {
  Icon
} from "./chunk-3EP3O3HY.js";

// packages/web/src/patterns/motion-status.tsx
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function StorageAmount({ value }) {
  const [whole, fraction] = String(value).split(".");
  const groups = [{ digits: whole, decimal: false }, { digits: fraction, decimal: true }];
  return /* @__PURE__ */ jsx("strong", { className: "yg-storage-count", "aria-hidden": "true", children: groups.map(({ digits, decimal }) => digits && /* @__PURE__ */ jsxs("span", { children: [
    decimal && ".",
    Array.from(digits, (digit, index) => {
      const column = digits.length - index - 1;
      if (!/^[0-9]$/.test(digit)) return /* @__PURE__ */ jsx("span", { children: digit }, column);
      return /* @__PURE__ */ jsx("span", { className: "yg-storage-reel", style: {
        "--yg-reel-digit": Number(digit),
        "--yg-reel-delay": column + (decimal ? 0 : fraction?.length ?? 0)
      }, children: /* @__PURE__ */ jsx("span", { children: Array.from("0123456789", (number) => /* @__PURE__ */ jsx("span", { children: number }, number)) }) }, column);
    })
  ] }, String(decimal))) });
}
function StorageMeter({ label, used, capacity, unit, categories = [] }) {
  const id = useId();
  const [expanded, setExpanded] = useState(null);
  const known = Number.isFinite(used) && Number.isFinite(capacity) && capacity > 0 && used >= 0;
  const ratio = known ? Math.min(1, used / capacity) : 0;
  let available = known ? Math.min(used, capacity) : 0;
  const breakdown = categories.filter((category) => Number.isFinite(category.amount) && category.amount > 0);
  const bars = breakdown.map((category, index) => {
    const amount = Math.min(category.amount, available);
    available -= amount;
    return { id: category.id, fraction: known ? amount / capacity : 0, tone: index % 3 };
  });
  if (available > 0) bars.push({ fraction: available / capacity });
  const highlighted = bars.some((bar) => bar.id === expanded && bar.fraction > 0);
  return /* @__PURE__ */ jsxs("section", { className: "yg-storage-meter", "data-full": ratio === 1 || void 0, children: [
    /* @__PURE__ */ jsx("strong", { id, className: "yg-storage-heading", children: label }),
    known ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "yg-storage-amount", children: [
        /* @__PURE__ */ jsx(StorageAmount, { value: used }),
        /* @__PURE__ */ jsx("b", { "aria-hidden": "true", children: unit }),
        /* @__PURE__ */ jsxs("span", { children: [
          "of ",
          capacity,
          " ",
          unit
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "yg-storage-bar",
          role: "meter",
          "aria-labelledby": id,
          "aria-valuemin": 0,
          "aria-valuemax": capacity,
          "aria-valuenow": Math.min(used, capacity),
          "aria-valuetext": `${used} of ${capacity} ${unit} used`,
          "data-highlight": highlighted || void 0,
          children: bars.map(({ id: categoryId, fraction, tone }) => /* @__PURE__ */ jsx(
            "span",
            {
              "data-tone": tone,
              "data-selected": categoryId === expanded || void 0,
              style: { inlineSize: `${fraction * 100}%` }
            },
            categoryId ?? id
          ))
        }
      ),
      breakdown.length > 0 && /* @__PURE__ */ jsx("ul", { className: "yg-storage-categories", children: breakdown.map((category, index) => {
        const opened = expanded === category.id;
        const detailId = `${id}-category-${index}`;
        return /* @__PURE__ */ jsxs("li", { "data-open": opened || void 0, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setExpanded(opened ? null : category.id),
              "aria-expanded": category.detail ? opened : void 0,
              "aria-pressed": category.detail ? void 0 : opened,
              "aria-controls": category.detail ? detailId : void 0,
              children: [
                /* @__PURE__ */ jsx("span", { className: "yg-storage-dot", "data-tone": index % 3, "aria-hidden": "true" }),
                /* @__PURE__ */ jsx("span", { children: category.label }),
                /* @__PURE__ */ jsxs("span", { className: "yg-storage-category-amount", children: [
                  category.amount,
                  " ",
                  unit
                ] })
              ]
            }
          ),
          category.detail && /* @__PURE__ */ jsx("div", { className: "yg-storage-reveal", id: detailId, inert: !opened, children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "yg-storage-category-detail", children: category.detail }) }) })
        ] }, category.id);
      }) })
    ] }) : /* @__PURE__ */ jsx("span", { className: "yg-help", children: "Capacity unavailable" })
  ] });
}
function ActivityIsland({ label, summary, children, compact = false }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const capsule = useRef(null);
  const panel = useRef(null);
  const [tracks] = useState(() => ({
    width: spring(compact ? 184 : 244, 380, 24),
    height: spring(compact ? 36 : 44, 300, 22),
    press: spring(1, 520, 18),
    copy: spring(0, 260, 28)
  }));
  useLayoutEffect(() => {
    const visible = capsule.current, content = panel.current;
    if (!visible || !content) return;
    let stop;
    const sync = () => {
      const room = visible.parentElement?.clientWidth ?? 340;
      const header = compact ? 36 : 44;
      tracks.width.target = Math.min(room, open ? compact ? 280 : 340 : compact ? 184 : 244);
      tracks.height.target = header + (open ? content.offsetHeight : 0);
      tracks.height.stiffness = open ? 300 : 390;
      tracks.copy.target = Number(open);
      stop?.();
      stop = playSprings(Object.values(tracks), () => {
        const h = Math.max(header, tracks.height.position);
        const give = Math.min(0.05, Math.max(-0.05, -tracks.height.velocity / 7e3));
        visible.style.setProperty("--yg-island-w", `${tracks.width.position * (1 + give)}px`);
        visible.style.setProperty("--yg-island-h", `${h}px`);
        visible.style.setProperty("--yg-island-radius", `${Math.min(32, h / 2)}px`);
        visible.style.setProperty("--yg-island-press", String(tracks.press.position));
        visible.style.setProperty("--yg-island-copy", String(Math.min(1, Math.max(0, tracks.copy.position))));
      });
    };
    sync();
    let parentWidth = visible.parentElement?.clientWidth;
    const changes = new ResizeObserver((entries) => {
      const width = visible.parentElement?.clientWidth;
      if (width === parentWidth && entries.every((entry) => entry.target !== content)) return;
      parentWidth = width;
      sync();
    });
    changes.observe(content);
    if (visible.parentElement) changes.observe(visible.parentElement);
    return () => {
      changes.disconnect();
      stop?.();
    };
  }, [compact, open, tracks]);
  return /* @__PURE__ */ jsxs("section", { ref: capsule, className: "yg-activity-island", "data-open": open, "data-compact": compact || void 0, children: [
    /* @__PURE__ */ jsxs("button", { type: "button", "aria-expanded": open, "aria-controls": id, onClick: () => {
      tracks.press.velocity -= open ? 1 : 1.6;
      setOpen((value) => !value);
    }, children: [
      /* @__PURE__ */ jsx(Icon, { name: "clock" }),
      /* @__PURE__ */ jsx("span", { children: label }),
      /* @__PURE__ */ jsx("span", { className: "yg-island-summary", children: summary }),
      /* @__PURE__ */ jsx(Icon, { name: "down" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "yg-island-reveal", id, inert: !open, children: /* @__PURE__ */ jsx("div", { className: "yg-island-content", ref: panel, children }) })
  ] });
}
function LoadingSuccessButton({ presentation, ...props }) {
  if (presentation === "morphing") return /* @__PURE__ */ jsx(MorphingResultAction, { ...props });
  const { label, pendingLabel, successLabel, errorLabel, state, onAction } = props;
  const result = state === "success" ? successLabel : state === "error" ? errorLabel : null;
  return /* @__PURE__ */ jsx(
    Button,
    {
      className: "yg-result-action",
      "data-outcome": state,
      pending: state === "pending",
      pendingLabel,
      onClick: onAction,
      children: /* @__PURE__ */ jsxs("span", { className: "yg-result-action-label", children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: label }),
        /* @__PURE__ */ jsxs("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: [
          /* @__PURE__ */ jsx(Icon, { name: "check" }),
          " ",
          successLabel
        ] }),
        /* @__PURE__ */ jsxs("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: [
          /* @__PURE__ */ jsx(Icon, { name: "close" }),
          " ",
          errorLabel
        ] }),
        /* @__PURE__ */ jsxs("span", { "data-result": result !== null || void 0, children: [
          result && /* @__PURE__ */ jsx(Icon, { name: state === "success" ? "check" : "close" }),
          result ?? label
        ] }, state)
      ] })
    }
  );
}
function MorphingResultAction({ label, pendingLabel, successLabel, errorLabel, state, onAction, fluid }) {
  const ref = useRef(null);
  const [motion] = useState(() => ({
    width: spring(168, 300, 22),
    label: spring(1, 400, 30),
    spinner: spring(0, 300, 28),
    result: spring(0, 220, 20),
    color: spring(0, 200, 30),
    check: spring(0, 120, 20)
  }));
  const pending = state === "pending", success = state === "success", result = success || state === "error";
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button) return;
    const tracked = Object.values(motion);
    const parent = button.parentElement;
    const setWidth = () => {
      const room = fluid && parent ? parent.clientWidth : 168;
      motion.width.target = Math.min(room, pending ? fluid ? button.offsetHeight : 56 : result && !fluid ? 140 : room);
    };
    setWidth();
    if (!button.style.getPropertyValue("--yg-result-width") && state === "idle") snap(motion.width, motion.width.target);
    const restore = state === "idle" && motion.result.position > 0.05;
    motion.label.target = state === "idle" && !restore ? 1 : 0;
    motion.spinner.target = Number(pending);
    motion.result.target = Number(result);
    motion.color.target = Number(success);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!success || reduced) motion.check.target = Number(success);
    if (restore && reduced) motion.label.target = 1;
    const idleLabel = button.querySelector(".yg-result-morph-label");
    const resultLabel = button.querySelector(".yg-result-morph-feedback");
    const paint = () => {
      const width2 = Math.min(fluid && parent ? parent.clientWidth : 168, motion.width.position);
      button.style.setProperty("--yg-result-width", `${width2}px`);
      for (const [name, track] of Object.entries(motion)) {
        if (name === "width") continue;
        const label2 = name === "label" ? idleLabel : name === "result" ? resultLabel : null;
        const visible = label2 ? Math.max(0, Math.min(1, (width2 - label2.offsetWidth - 8) / 18)) : 1;
        button.style.setProperty(`--yg-result-${name}`, String(track.position * visible));
      }
    };
    let stop = playSprings(tracked, paint);
    const delay = reduced ? 0 : success ? 150 : restore ? 120 : 0;
    const timed = delay ? setTimeout(() => {
      if (success) motion.check.target = 1;
      else motion.label.target = 1;
      stop();
      stop = playSprings(tracked, paint);
    }, delay) : void 0;
    let width = parent?.clientWidth;
    const observer = fluid && parent ? new ResizeObserver(() => {
      if (width === parent.clientWidth) return;
      width = parent.clientWidth;
      setWidth();
      stop();
      stop = playSprings(tracked, paint);
    }) : null;
    if (observer && parent) observer.observe(parent);
    return () => {
      clearTimeout(timed);
      stop();
      observer?.disconnect();
    };
  }, [fluid, motion, pending, result, state, success]);
  const accessible = pending ? pendingLabel : success ? successLabel : result ? errorLabel : label;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "yg-result-morph",
      ref,
      type: "button",
      "aria-label": accessible,
      "aria-busy": pending || void 0,
      disabled: pending,
      "data-outcome": state,
      onClick: onAction,
      children: [
        /* @__PURE__ */ jsx("span", { className: "yg-result-morph-label", "aria-hidden": "true", children: label }),
        /* @__PURE__ */ jsx("span", { className: "yg-result-morph-spinner", "aria-hidden": "true", children: /* @__PURE__ */ jsx("i", {}) }),
        /* @__PURE__ */ jsxs("span", { className: "yg-result-morph-feedback", "aria-hidden": "true", children: [
          state === "error" ? /* @__PURE__ */ jsx(Icon, { name: "close" }) : /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "m4.5 12 5 5L20 7", pathLength: "22" }) }),
          state === "error" ? errorLabel : successLabel
        ] })
      ]
    }
  );
}
function CopyButton({ value }) {
  const [state, setState] = useState("idle");
  const [copied, setCopied] = useState(0);
  const pending = useRef(false);
  const roll = useRef(null);
  const ready = useRef(null);
  const done = useRef(null);
  const [motion] = useState(() => ({ label: spring(0, 260, 20), icon: spring(0, 420, 18), width: spring(0, 300, 24) }));
  useLayoutEffect(() => {
    const label = state === "success" ? done.current : ready.current;
    const node = roll.current;
    if (!label || !node) return;
    const sync = () => {
      motion.label.target = motion.icon.target = Number(state === "success");
      motion.width.target = label.offsetWidth;
      if (motion.width.position === 0) snap(motion.width, motion.width.target);
      stop?.();
      stop = playSprings(Object.values(motion), () => {
        node.parentElement?.style.setProperty("--yg-copy-roll", String(motion.label.position));
        node.parentElement?.style.setProperty("--yg-copy-icon", String(motion.icon.position));
        node.style.inlineSize = `${motion.width.position}px`;
      });
    };
    let stop;
    const resize = new ResizeObserver(sync);
    resize.observe(label);
    sync();
    return () => {
      resize.disconnect();
      stop?.();
    };
  }, [motion, state]);
  useEffect(() => {
    if (state !== "success") return;
    const reset = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(reset);
  }, [copied, state]);
  async function copy() {
    if (pending.current) return;
    pending.current = true;
    setState((current) => current === "success" ? current : "pending");
    try {
      await navigator.clipboard.writeText(value);
      setState("success");
      setCopied((count) => count + 1);
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }
  const actionLabel = state === "success" ? "Copied" : state === "error" ? "Try again" : "Copy";
  return /* @__PURE__ */ jsxs("div", { className: "yg-copy-action", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "yg-copy-button",
        type: "button",
        "aria-label": actionLabel,
        disabled: state === "pending",
        "data-outcome": state,
        onClick: copy,
        children: [
          /* @__PURE__ */ jsxs("span", { className: "yg-copy-icons", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx(Icon, { name: "copy" }),
            /* @__PURE__ */ jsx(Icon, { name: "check" })
          ] }),
          /* @__PURE__ */ jsx("span", { ref: roll, className: "yg-copy-roll", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { ref: ready, children: state === "error" ? "Try again" : "Copy" }),
            /* @__PURE__ */ jsx("span", { ref: done, children: "Copied" })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx("span", { role: "status", className: "yg-help", children: state === "error" ? "Clipboard unavailable. Select and copy the text." : state === "success" ? "Copied to clipboard." : "" })
  ] });
}

// packages/web/src/patterns/motion-confirm.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function useConfirmation(onConfirm) {
  const [done, setDone] = useState2(false);
  const locked = useRef2(false);
  const timer = useRef2(null);
  useEffect2(() => () => {
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
  const [progress, setProgress] = useState2(0);
  const [armed, setArmed] = useState2(false);
  const [holding, setHolding] = useState2(false);
  const [showHolding, setShowHolding] = useState2(false);
  const amount = useRef2(0);
  const fill = useRef2(null);
  const drain = useRef2(void 0);
  const active = useRef2(null);
  const frame = useRef2(null);
  const callback = useRef2(onConfirm);
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
  useEffect2(() => () => {
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
  return /* @__PURE__ */ jsxs2(
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
        /* @__PURE__ */ jsx2("span", { ref: fill, className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx2("span", { className: "yg-confirm-label", children: done ? /* @__PURE__ */ jsx2("svg", { className: "yg-hold-check", width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ jsx2(
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
  const [progress, setProgress] = useState2(0);
  const [armed, setArmed] = useState2(false);
  const [dragging, setDragging] = useState2(false);
  const active = useRef2(null);
  const value = useRef2(0);
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
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) / drag.width));
    drag.samples = drag.samples.filter((sample) => event.timeStamp - sample.time <= 80);
    drag.samples.push({ x: event.clientX, time: event.timeStamp });
    setProgress(value.current);
  };
  return /* @__PURE__ */ jsxs2(
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
        const speed = elapsed > 0 ? (event.clientX - first.x) * 1e3 / elapsed : 0;
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
        /* @__PURE__ */ jsx2("span", { className: "yg-confirm-label", children: armed ? `Confirm ${label}` : label }),
        /* @__PURE__ */ jsx2("span", { className: "yg-confirm-fill", "aria-hidden": "true", children: done ? "Confirmed" : label }),
        /* @__PURE__ */ jsx2("span", { className: "yg-slide-confirm-handle", "aria-hidden": "true", children: /* @__PURE__ */ jsx2(Icon, { name: done ? "check" : "arrow" }) })
      ]
    }
  );
}

// packages/web/src/patterns/motion-cart.tsx
import { useEffect as useEffect3, useLayoutEffect as useLayoutEffect2, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var holdDelay = 380;
var initialRepeat = 150;
var minimumRepeat = 55;
var limitNoticeDuration = 1600;
function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef3(count);
  const goingDown = count < previous.current;
  const lastCount = previous.current;
  useLayoutEffect2(() => {
    previous.current = count;
  }, [count]);
  const [showLimit, setShowLimit] = useState3(false);
  const notice = useRef3(void 0);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef3({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef3(null);
  const pointer = useRef3(void 0);
  const timer = useRef3(void 0);
  const skipClick = useRef3(false);
  function stop() {
    clearTimeout(timer.current);
    pointer.current = void 0;
  }
  useEffect3(() => {
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
  return /* @__PURE__ */ jsxs3(
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
        /* @__PURE__ */ jsx3("span", { className: "yg-cart-limit", role: "status", children: showLimit && reachedLimit ? `Limit ${limit} per order` : null }),
        /* @__PURE__ */ jsxs3("div", { className: "yg-cart-stepper", children: [
          /* @__PURE__ */ jsx3(
            "button",
            {
              type: "button",
              className: "yg-cart-decrease",
              hidden: !open,
              "aria-label": count === 1 ? `Remove ${label}` : `Decrease quantity of ${label}`,
              ...pointerHandlers,
              onPointerDown: (event) => start(event, -1),
              onClick: (event) => activate(-1, event.detail),
              children: /* @__PURE__ */ jsx3(
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
                  children: /* @__PURE__ */ jsx3("path", { d: count === 1 ? "M4 6h16M9 6V4h6v2m3 0-1 14H7L6 6m4 4v6m4-6v6" : "M5 12h14" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx3("output", { className: "yg-cart-quantity", "aria-label": `Quantity of ${label}`, "data-quantity": count, hidden: !open, children: /* @__PURE__ */ jsxs3("span", { className: "yg-cart-roll", "data-direction": goingDown ? "down" : "up", children: [
            lastCount !== count && lastCount > 0 && /* @__PURE__ */ jsx3("span", { className: "yg-cart-previous", "aria-hidden": "true", children: lastCount }),
            /* @__PURE__ */ jsx3("span", { className: "yg-cart-current", children: count })
          ] }, count) }),
          /* @__PURE__ */ jsxs3(
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
                !open && /* @__PURE__ */ jsx3("span", { children: addLabel }),
                /* @__PURE__ */ jsx3(Icon, { name: "plus" })
              ]
            }
          )
        ] })
      ]
    }
  );
}

export {
  StorageMeter,
  ActivityIsland,
  LoadingSuccessButton,
  CopyButton,
  HoldButton,
  SlideConfirm,
  CartButton
};
