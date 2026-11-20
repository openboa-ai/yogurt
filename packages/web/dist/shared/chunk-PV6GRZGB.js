"use client";
import {
  Toast
} from "./chunk-FUHQGU5Y.js";
import {
  dist_exports
} from "./chunk-5SWGMKHQ.js";
import {
  Button,
  IconButton
} from "./chunk-4A4FGE4R.js";
import {
  Heading,
  Icon,
  cx
} from "./chunk-3EP3O3HY.js";

// packages/web/src/patterns/editorial.tsx
import {
  useEffect,
  useId,
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
function Card({ title, description, children, action }) {
  return /* @__PURE__ */ jsxs("section", { className: "yg-card", children: [
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
  tone = "brand"
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
  return /* @__PURE__ */ jsx("section", { className: "yg-stack", "aria-label": label, children: items.map((item) => /* @__PURE__ */ jsx(
    Toast,
    {
      message: item.message,
      onDismiss: () => onDismiss(item.id)
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
