"use client";
import {
  IconButton,
  clsx_default,
  wrapTextNodeSiblings
} from "./chunk-XHKWNKXE.js";
import {
  Heading,
  Icon,
  Stack
} from "./chunk-3EP3O3HY.js";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Badge/index.js
import { jsx as _jsx } from "react/jsx-runtime";
import {} from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Badge/Badge.module.css
var Badge_default = { "Badge": "yg-sdk-Badge-Badge" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Badge/index.js
var Badge = ({ children, className, variant = "soft", color = "secondary", size = "sm", pill, ...restMaybeAsChildProps }) => {
  return _jsx("div", { className: clsx_default(Badge_default.Badge, className), "data-color": color, "data-size": size, "data-pill": pill ? "" : void 0, "data-variant": variant, ...restMaybeAsChildProps, children: wrapTextNodeSiblings(children) });
};

// packages/web/src/controls/feedback.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Badge2({
  children,
  tone = "neutral"
}) {
  return /* @__PURE__ */ jsx(Badge, { className: "yg-badge", "data-tone": tone, children });
}
function Status({
  children,
  tone = "neutral"
}) {
  return /* @__PURE__ */ jsxs("span", { className: "yg-status", "data-tone": tone, role: "status", children: [
    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "yg-status-dot" }),
    children
  ] });
}
function Notice({
  title,
  children,
  tone = "neutral",
  action,
  urgent = false
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "yg-notice",
      "data-tone": tone,
      role: urgent ? "alert" : "note",
      children: [
        /* @__PURE__ */ jsx(Icon, { name: "info" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: title }),
          children && /* @__PURE__ */ jsx("div", { children }),
          action
        ] })
      ]
    }
  );
}
function Skeleton({
  label = "Loading",
  lines = 2
}) {
  return /* @__PURE__ */ jsx("div", { role: "status", "aria-label": label, className: "yg-skeleton", children: Array.from({ length: Math.min(8, Math.max(1, lines)) }, (_, i) => /* @__PURE__ */ jsx("span", { "aria-hidden": "true" }, i)) });
}
function Progress({
  label,
  value,
  max = 100
}) {
  const limit = Number.isFinite(max) ? Math.max(1, max) : 100;
  const current = value !== void 0 && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : void 0;
  const completion = current === void 0 ? void 0 : current / limit;
  return /* @__PURE__ */ jsxs("label", { className: "yg-progress", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      label,
      completion !== void 0 && /* @__PURE__ */ jsxs("span", { className: "yg-meta", "aria-hidden": "true", children: [
        Math.round(completion * 100),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("progress", { value: current, max: limit }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "yg-progress-track",
        "aria-hidden": "true",
        style: { "--yg-progress-completion": completion },
        children: /* @__PURE__ */ jsx("span", {})
      }
    )
  ] });
}
function Toast({
  message,
  onDismiss
}) {
  return /* @__PURE__ */ jsxs("div", { className: "yg-toast", children: [
    /* @__PURE__ */ jsx("span", { role: "status", children: message }),
    /* @__PURE__ */ jsx(
      IconButton,
      {
        label: "Dismiss notification",
        icon: "close",
        onClick: onDismiss
      }
    )
  ] });
}
function Result({
  title,
  children,
  action
}) {
  return /* @__PURE__ */ jsxs(Stack, { className: "yg-result", gap: 8, children: [
    /* @__PURE__ */ jsx(Heading, { level: 3, children: title }),
    children && /* @__PURE__ */ jsx("div", { className: "yg-help", children }),
    action && /* @__PURE__ */ jsx("div", { children: action })
  ] });
}

export {
  Badge2 as Badge,
  Status,
  Notice,
  Skeleton,
  Progress,
  Toast,
  Result
};
