"use client";
import {
  Toast
} from "./chunk-QVZBBQIY.js";
import {
  dist_exports
} from "./chunk-F374JVJP.js";
import {
  Button,
  IconButton
} from "./chunk-4IPCB3MM.js";
import {
  Heading,
  Icon,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/patterns/editorial.tsx
import {
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
function ToastStack({
  items,
  onDismiss,
  label = "Notifications"
}) {
  const [entries, setEntries] = useState(() => items.map((item) => ({ ...item, exiting: false })));
  const currentIds = useRef(new Set(items.map((item) => item.id)));
  const currentEntries = useRef(entries);
  const root = useRef(null);
  const timers = useRef(/* @__PURE__ */ new Map());
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
    const active = items.map((item) => {
      const existing = entries.find((entry) => entry.id === item.id && !entry.exiting && entry.message === item.message);
      return existing ?? { ...item, exiting: false };
    });
    const leaving = entries.filter((entry) => !ids.has(entry.id)).map((entry) => entry.exiting ? entry : { ...entry, exiting: true });
    const next = [...active, ...leaving];
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
  return /* @__PURE__ */ jsx("section", { ref: root, className: "yg-stack", "aria-label": label, tabIndex: -1, children: entries.map((item) => /* @__PURE__ */ jsx(
    "div",
    {
      "data-yg-toast-id": item.id,
      "data-exiting": item.exiting || void 0,
      "aria-hidden": item.exiting || void 0,
      inert: item.exiting || void 0,
      onAnimationEnd: (event) => {
        if (event.target === event.currentTarget && item.exiting) finish(item.id, item);
      },
      children: /* @__PURE__ */ jsx(Toast, { message: item.message, onDismiss: () => {
        if (!item.exiting) onDismiss(item.id);
      } })
    },
    item.id
  )) });
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
  const [result, setResult] = useState("Copy"), version = useRef(0);
  useEffect(() => {
    setResult("Copy");
    return () => {
      version.current++;
    };
  }, [code]);
  async function copy() {
    const current = ++version.current;
    try {
      await (onCopy ? onCopy(code) : navigator.clipboard.writeText(code));
      if (current === version.current) setResult("Copied");
    } catch {
      if (current === version.current) setResult("Copy failed");
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "yg-code", "aria-label": language + " code", children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("span", { children: language }),
      /* @__PURE__ */ jsxs(Button, { size: "compact", emphasis: "quiet", onClick: copy, children: [
        /* @__PURE__ */ jsx(Icon, { name: "copy" }),
        /* @__PURE__ */ jsx("span", { "aria-live": "polite", children: result })
      ] })
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
