"use client";
import {
  Toast
} from "./chunk-QVZBBQIY.js";
import {
  CopyButton
} from "./chunk-F4E3YYJ6.js";
import {
  dist_exports
} from "./chunk-F374JVJP.js";
import {
  playSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Button,
  IconButton
} from "./chunk-4IPCB3MM.js";
import {
  Heading,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/patterns/editorial.tsx
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function AspectRatio({
  ratio = 16 / 9,
  children
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "yg-aspect",
      style: { aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 1 },
      children
    }
  );
}
function Direction({
  dir = "ltr",
  children
}) {
  return /* @__PURE__ */ jsx(dist_exports.Provider, { dir, children: /* @__PURE__ */ jsx("div", { dir, children }) });
}
function Card({ title, description, children, action, density = "regular" }) {
  return /* @__PURE__ */ jsxs("section", { className: "yg-card", "data-density": density, children: [
    /* @__PURE__ */ jsx(Heading, { level: 3, children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "yg-help", children: description }),
    /* @__PURE__ */ jsx("div", { children }),
    action && /* @__PURE__ */ jsx("footer", { children: action })
  ] });
}
function Asset({
  children,
  size = 40,
  framed = false
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "yg-asset",
      "data-framed": framed || void 0,
      style: { inlineSize: size, blockSize: size },
      children
    }
  );
}
function Gradient({
  children,
  tone = "neutral"
}) {
  return /* @__PURE__ */ jsx("div", { className: "yg-gradient", "data-tone": tone, children });
}
function Elevation({
  children,
  level = "raised"
}) {
  return /* @__PURE__ */ jsx("div", { className: "yg-elevation", "data-level": level, children });
}
function KeyboardShortcut({
  keys,
  label
}) {
  return /* @__PURE__ */ jsx("span", { className: "yg-shortcut", role: "img", "aria-label": label, children: keys.map((key, index) => /* @__PURE__ */ jsx("kbd", { "aria-hidden": "true", children: key }, index)) });
}
function Post({ children, ...props }) {
  return /* @__PURE__ */ jsx("article", { ...props, className: cx("yg-post", props.className), children });
}
function GridList({
  label,
  items,
  minWidth = 128
}) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      className: "yg-grid-list",
      "aria-label": label,
      style: { "--yg-cell": Math.max(1, minWidth) + "px" },
      children: items.map((item) => /* @__PURE__ */ jsx("li", { children: item.content }, item.id))
    }
  );
}
function ListHeader({
  title,
  detail,
  action
}) {
  return /* @__PURE__ */ jsxs("header", { className: "yg-section-line", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Heading, { level: 3, children: title }),
      detail && /* @__PURE__ */ jsx("span", { className: "yg-help", children: detail })
    ] }),
    action
  ] });
}
function ListFooter({
  children,
  action
}) {
  return /* @__PURE__ */ jsxs("footer", { className: "yg-section-line yg-help", children: [
    children,
    action
  ] });
}
function PageHeader({
  title,
  detail,
  eyebrow,
  action
}) {
  return /* @__PURE__ */ jsxs("header", { className: "yg-section-line", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      eyebrow && /* @__PURE__ */ jsx("p", { className: "yg-meta", children: eyebrow }),
      /* @__PURE__ */ jsx(Heading, { level: 1, children: title }),
      detail && /* @__PURE__ */ jsx("p", { className: "yg-help", children: detail })
    ] }),
    action
  ] });
}
function BottomInfo({ label, children }) {
  return /* @__PURE__ */ jsx("aside", { className: "yg-bottom-info", "aria-label": label, children });
}
function Highlight({ children }) {
  return /* @__PURE__ */ jsx("mark", { className: "yg-highlight", children });
}
function Spinner({ label = "Loading" }) {
  return /* @__PURE__ */ jsx("span", { className: "yg-loading", role: "status", "aria-label": label, children: /* @__PURE__ */ jsx("span", { className: "yg-spinner", "aria-hidden": "true" }) });
}
function SwipeToast({ message, disabled, exiting, onDismiss }) {
  const card = useRef(null);
  const motion = useRef(spring(0, 520, 2 * Math.sqrt(520)));
  const stop = useRef(void 0);
  const active = useRef(null);
  const wasDisabled = useRef(disabled);
  useEffect(() => () => {
    active.current = null;
    stop.current?.();
  }, []);
  useLayoutEffect(() => {
    if (disabled) {
      active.current = null;
      stop.current?.();
    }
    if (disabled && !exiting || !disabled && wasDisabled.current) {
      snap(motion.current, 0);
      if (card.current) {
        card.current.style.translate = "0px 0";
        card.current.style.opacity = "1";
      }
    }
    wasDisabled.current = disabled;
  }, [disabled, exiting]);
  function paint(x) {
    if (!card.current) return;
    card.current.style.translate = `${x}px 0`;
    card.current.style.opacity = String(Math.max(0.3, 1 - Math.abs(x) / 240));
  }
  function settle(velocity = 0) {
    const state = motion.current;
    stop.current?.();
    state.target = 0;
    state.velocity = velocity * 1e3;
    stop.current = playSprings([state], () => paint(state.position));
  }
  function release(event) {
    const gesture = active.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    active.current = null;
    if (gesture.axis !== "x") {
      settle();
      return;
    }
    const first = gesture.samples[0], last = gesture.samples.at(-1) ?? first;
    const elapsed = last.time - first.time;
    const velocity = elapsed > 0 && event.timeStamp - last.time <= 80 ? (last.x - first.x) / elapsed : 0;
    const x = motion.current.position;
    const committed = event.type === "pointerup" && (Math.abs(x) > 100 || Math.abs(velocity) > 0.11 && Math.sign(x) === Math.sign(velocity));
    settle(velocity);
    if (committed && !disabled) onDismiss();
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: card,
      className: "yg-toast-swipe",
      onPointerDown: (event) => {
        if (disabled || active.current || !event.isPrimary || event.button !== 0 || event.target instanceof Element && event.target.closest("button, a, input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
        stop.current?.();
        active.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          start: motion.current.position,
          samples: [{ time: event.timeStamp, x: motion.current.position }]
        };
      },
      onPointerMove: (event) => {
        const gesture = active.current;
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6) {
          gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (gesture.axis === "x") event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (gesture.axis !== "x") return;
        snap(motion.current, gesture.start + dx);
        paint(motion.current.position);
        gesture.samples.push({ time: event.timeStamp, x: motion.current.position });
        while (gesture.samples.length > 2 && event.timeStamp - gesture.samples[0].time > 80) gesture.samples.shift();
      },
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
      onPointerLeave: (event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) release(event);
      },
      children: /* @__PURE__ */ jsx(Toast, { message, onDismiss })
    }
  );
}
function ToastStack({
  items,
  onDismiss,
  label = "Notifications",
  presentation = "list",
  defaultExpanded = false,
  swipe = false
}) {
  const [entries, setEntries] = useState(() => items.map((item) => ({ ...item, exiting: false })));
  const currentIds = useRef(new Set(items.map((item) => item.id)));
  const currentEntries = useRef(entries);
  const root = useRef(null);
  const timers = useRef(/* @__PURE__ */ new Map());
  const collectionId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [heights, setHeights] = useState({});
  const [stackGap, setStackGap] = useState(8);
  const priorPositions = useRef(/* @__PURE__ */ new Map());
  const toggleNode = useRef(null);
  const restoreToggleFocus = useRef(false);
  const setToggleNode = useCallback((node) => {
    if (!node && toggleNode.current?.ownerDocument.activeElement === toggleNode.current) {
      restoreToggleFocus.current = true;
    }
    toggleNode.current = node;
  }, []);
  useLayoutEffect(() => {
    currentIds.current = new Set(items.map((item) => item.id));
    currentEntries.current = entries;
  }, [items, entries]);
  const finish = (id, expected) => {
    if (currentEntries.current.find((entry) => entry.id === id) !== expected) return;
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    if (!currentIds.current.has(id)) setEntries((previous) => previous.filter((entry) => entry.id !== id || !entry.exiting));
  };
  useLayoutEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    for (const id of ids) {
      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
    const active2 = items.map((item) => {
      const existing = entries.find((entry) => entry.id === item.id && !entry.exiting && entry.message === item.message);
      return existing ?? { ...item, exiting: false };
    });
    const leaving = entries.filter((entry) => !ids.has(entry.id)).map((entry) => entry.exiting ? entry : { ...entry, exiting: true });
    const next = [...active2, ...leaving];
    if (next.length === entries.length && next.every((entry, index) => entry.id === entries[index].id && entry.message === entries[index].message && entry.exiting === entries[index].exiting)) return;
    const focus = root.current?.ownerDocument.activeElement;
    const focusedEntry = focus instanceof Element ? focus.closest("[data-yg-toast-id]") : null;
    if (focusedEntry && root.current?.contains(focusedEntry) && !ids.has(focusedEntry.dataset.ygToastId ?? "")) {
      const targets = [...root.current.querySelectorAll("[data-yg-toast-id]")];
      const replacement = targets.find((node) => ids.has(node.dataset.ygToastId ?? "") && !node.closest("[inert]"))?.querySelector("button:not(:disabled)");
      replacement?.focus();
      if (!replacement || root.current.ownerDocument.activeElement !== replacement) root.current.focus();
    }
    setEntries(next);
  }, [items, entries]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (!media.matches) return;
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
      setEntries((previous) => previous.filter((entry) => !entry.exiting || currentIds.current.has(entry.id)));
    };
    media.addEventListener("change", settle);
    settle();
    return () => {
      media.removeEventListener("change", settle);
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };
  }, []);
  useEffect(() => {
    const exiting = new Set(entries.filter((entry) => entry.exiting).map((entry) => entry.id));
    for (const [id, timer] of timers.current) {
      if (!exiting.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (exiting.size) setEntries((previous) => previous.filter((entry) => !entry.exiting || currentIds.current.has(entry.id)));
      return;
    }
    for (const entry of entries.filter((item) => item.exiting)) {
      if (timers.current.has(entry.id)) continue;
      const element = [...root.current?.querySelectorAll("[data-yg-toast-id]") ?? []].find((node) => node.dataset.ygToastId === entry.id);
      const style = element && getComputedStyle(element);
      const milliseconds = (value) => value.trim().endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1e3;
      const durations = style?.animationDuration.split(",").map(milliseconds) ?? [0];
      const delays = style?.animationDelay.split(",").map(milliseconds) ?? [0];
      const iterations = style?.animationIterationCount.split(",").map((value) => Number(value.trim())) ?? [1];
      const total = durations.reduce((longest, duration, index) => {
        const count = iterations[index % iterations.length];
        return Number.isFinite(count) ? Math.max(longest, duration * count + delays[index % delays.length]) : Infinity;
      }, 0);
      if (Number.isFinite(total)) timers.current.set(entry.id, setTimeout(() => finish(entry.id, entry), Math.max(0, total) + 100));
    }
  }, [entries]);
  useLayoutEffect(() => {
    if (presentation !== "stacked" || !root.current) return;
    const nodes = [...root.current.querySelectorAll("[data-yg-toast-id]")];
    const measure = () => {
      const host = root.current;
      if (!host) return;
      const next = Object.fromEntries(nodes.map((node) => [node.dataset.ygToastId, node.offsetHeight]));
      setHeights((previous) => Object.keys(previous).length === Object.keys(next).length && Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next);
      const gap = parseFloat(getComputedStyle(host).rowGap);
      if (Number.isFinite(gap)) setStackGap(gap);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(measure);
    nodes.forEach((node) => observer?.observe(node));
    return () => observer?.disconnect();
  }, [entries, presentation]);
  const active = entries.filter((entry) => !entry.exiting);
  const showToggle = presentation === "stacked" && active.length > 1;
  useLayoutEffect(() => {
    const host = root.current;
    if (!restoreToggleFocus.current || !host) return;
    restoreToggleFocus.current = false;
    const focused = host.ownerDocument.activeElement;
    if (focused && focused !== host.ownerDocument.body && focused.isConnected) return;
    const remaining = [...host.querySelectorAll("[data-yg-toast-id]")].find((node) => currentIds.current.has(node.dataset.ygToastId ?? "") && !node.closest("[inert]"));
    const target = remaining?.querySelector("button:not(:disabled)") ?? host;
    target.focus();
    if (host.ownerDocument.activeElement !== target) host.focus();
  }, [showToggle, presentation, active.length]);
  const compact = presentation === "stacked" && !expanded && active.length > 1;
  const firstHeight = heights[active[0]?.id] ?? 0;
  let offset = 0;
  const positions = /* @__PURE__ */ new Map();
  active.forEach((entry, index) => {
    const depth = Math.min(index, 2);
    positions.set(entry.id, compact ? { y: depth * stackGap, scale: 1 - depth * 0.05, depth: index } : { y: offset, scale: 1, depth: index });
    offset += (heights[entry.id] ?? 0) + stackGap;
  });
  const stackHeight = compact ? firstHeight + Math.min(active.length - 1, 2) * stackGap : Math.max(0, offset - stackGap);
  useLayoutEffect(() => {
    if (presentation !== "stacked") return;
    priorPositions.current = positions;
  });
  const renderEntry = (item, obscured = false) => /* @__PURE__ */ jsx(
    "div",
    {
      "data-yg-toast-id": item.id,
      "data-exiting": item.exiting || void 0,
      "aria-hidden": item.exiting || void 0,
      inert: item.exiting || void 0,
      onAnimationEnd: (event) => {
        if (event.target === event.currentTarget && item.exiting) finish(item.id, item);
      },
      children: swipe ? /* @__PURE__ */ jsx(
        SwipeToast,
        {
          message: item.message,
          disabled: item.exiting || obscured,
          exiting: item.exiting,
          onDismiss: () => {
            if (!item.exiting) onDismiss(item.id);
          }
        }
      ) : /* @__PURE__ */ jsx(Toast, { message: item.message, onDismiss: () => {
        if (!item.exiting) onDismiss(item.id);
      } })
    },
    item.id
  );
  if (presentation === "stacked") {
    return /* @__PURE__ */ jsxs("section", { ref: root, className: "yg-stack yg-toast-stack", "aria-label": label, tabIndex: -1, children: [
      showToggle && /* @__PURE__ */ jsx(
        Button,
        {
          ref: setToggleNode,
          emphasis: "quiet",
          size: "compact",
          "aria-controls": collectionId,
          "aria-expanded": expanded,
          onClick: () => setExpanded((value) => !value),
          children: expanded ? "Show fewer" : `Show all ${active.length}`
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          id: collectionId,
          className: "yg-toast-stack-stage",
          "data-expanded": !compact,
          style: { height: `${stackHeight}px` },
          onFocusCapture: (event) => {
            const entry = event.target.closest("[data-yg-toast-id]");
            if (compact && entry && entry.dataset.ygToastId !== active[0]?.id) setExpanded(true);
          },
          children: entries.map((item) => {
            const position = positions.get(item.id) ?? priorPositions.current.get(item.id) ?? { y: 0, scale: 1, depth: 0 };
            return /* @__PURE__ */ jsx(
              "div",
              {
                className: "yg-toast-stack-slot",
                "data-behind": compact && position.depth > 0 || void 0,
                style: {
                  transform: `translateY(${position.y}px) scale(${position.scale})`,
                  zIndex: entries.length - position.depth,
                  maxHeight: compact && position.depth > 0 ? `${firstHeight}px` : void 0
                },
                children: renderEntry(item, compact && position.depth > 0)
              },
              item.id
            );
          })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx("section", { ref: root, className: "yg-stack", "aria-label": label, tabIndex: -1, children: entries.map((item) => renderEntry(item)) });
}
function TableRow({ label, children }) {
  return /* @__PURE__ */ jsxs("dl", { className: "yg-value-row", children: [
    /* @__PURE__ */ jsx("dt", { children: label }),
    /* @__PURE__ */ jsx("dd", { children })
  ] });
}
function AmountTop({
  label,
  value,
  unit,
  detail
}) {
  return /* @__PURE__ */ jsxs("section", { className: "yg-amount", children: [
    /* @__PURE__ */ jsx("span", { className: "yg-help", children: label }),
    /* @__PURE__ */ jsxs("strong", { children: [
      value,
      unit && /* @__PURE__ */ jsxs("small", { children: [
        " ",
        unit
      ] })
    ] }),
    detail && /* @__PURE__ */ jsx("span", { className: "yg-meta", children: detail })
  ] });
}
function BarChart({
  title,
  points,
  unit,
  source,
  asOf,
  timeLabel
}) {
  const finite = points.flatMap(
    (p) => p.value !== null && Number.isFinite(p.value) ? [p.value] : []
  );
  const min = Math.min(0, ...finite), max = Math.max(0, ...finite), range = max - min || 1, zero = -min / range * 100;
  return /* @__PURE__ */ jsxs("figure", { className: "yg-bars", children: [
    /* @__PURE__ */ jsx("figcaption", { children: title }),
    /* @__PURE__ */ jsx("ul", { children: points.map((p) => {
      const n = p.value !== null && Number.isFinite(p.value) ? p.value : null;
      return /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("span", { children: p.label }),
        /* @__PURE__ */ jsx("span", { className: "yg-bar-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx(
          "i",
          {
            style: {
              insetInlineStart: (n !== null && n < 0 ? (n - min) / range * 100 : zero) + "%",
              inlineSize: (n === null ? 0 : Math.abs(n) / range * 100) + "%"
            }
          }
        ) }),
        /* @__PURE__ */ jsx("span", { children: n === null ? "No reading" : n + " " + unit })
      ] }, p.id);
    }) }),
    /* @__PURE__ */ jsxs("small", { children: [
      source,
      " \xB7 ",
      /* @__PURE__ */ jsx("time", { dateTime: asOf, children: timeLabel ?? asOf })
    ] })
  ] });
}
function Avatar({
  label,
  src,
  size = 36
}) {
  const [failed, setFailed] = useState();
  const initials = label.trim().split(/\s+/).slice(0, 2).map((s) => Array.from(s)[0]).join("").toUpperCase();
  return /* @__PURE__ */ jsx(
    "span",
    {
      role: "img",
      "aria-label": label,
      className: "yg-avatar",
      style: { inlineSize: size, blockSize: size },
      children: src && failed !== src ? /* @__PURE__ */ jsx("img", { src, alt: "", onError: () => setFailed(src) }) : /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: initials })
    }
  );
}
function Bubble({
  children,
  outgoing = false
}) {
  return /* @__PURE__ */ jsx("div", { className: "yg-bubble", "data-outgoing": outgoing || void 0, children });
}
function Attachment({
  name,
  detail,
  preview,
  onOpen,
  onRemove,
  progress
}) {
  const info = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("strong", { children: name }),
    detail && /* @__PURE__ */ jsx("small", { children: detail })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "yg-attachment", children: [
    preview && /* @__PURE__ */ jsx(Asset, { children: preview }),
    onOpen ? /* @__PURE__ */ jsx("button", { type: "button", className: "yg-file-name", onClick: onOpen, children: info }) : /* @__PURE__ */ jsx("span", { className: "yg-file-name", children: info }),
    progress !== void 0 && /* @__PURE__ */ jsx("progress", { "aria-label": "Upload " + name, value: progress, max: 100 }),
    " ",
    onRemove && /* @__PURE__ */ jsx(IconButton, { icon: "close", label: "Remove " + name, onClick: onRemove })
  ] });
}
function Marker({
  children,
  tone = "neutral"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "yg-marker", "data-tone": tone, children: [
    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "yg-status-dot" }),
    children
  ] });
}
function CodeBlock({
  code,
  language,
  onCopy
}) {
  return /* @__PURE__ */ jsxs("section", { className: "yg-code", "aria-label": language + " code", children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("span", { children: language }),
      /* @__PURE__ */ jsx(CopyButton, { value: code, onCopy, presentation: "quiet", errorLabel: "Copy failed" })
    ] }),
    /* @__PURE__ */ jsx("pre", { tabIndex: 0, children: /* @__PURE__ */ jsx("code", { children: code }) })
  ] });
}
function Trace({
  label,
  events
}) {
  const id = useId();
  return /* @__PURE__ */ jsxs("section", { className: "yg-trace", "aria-labelledby": id, children: [
    /* @__PURE__ */ jsx(Heading, { id, level: 3, children: label }),
    /* @__PURE__ */ jsx("ol", { children: events.map((e) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("details", { children: [
      /* @__PURE__ */ jsxs("summary", { children: [
        e.title,
        e.state && /* @__PURE__ */ jsx("small", { children: e.state })
      ] }),
      /* @__PURE__ */ jsx("div", { children: e.detail })
    ] }) }, e.id)) })
  ] });
}

export {
  AspectRatio,
  Direction,
  Card,
  Asset,
  Gradient,
  Elevation,
  KeyboardShortcut,
  Post,
  GridList,
  ListHeader,
  ListFooter,
  PageHeader,
  BottomInfo,
  Highlight,
  Spinner,
  ToastStack,
  TableRow,
  AmountTop,
  BarChart,
  Avatar,
  Bubble,
  Attachment,
  Marker,
  CodeBlock,
  Trace
};
