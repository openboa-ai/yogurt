"use client";
import {
  IconButton
} from "./chunk-BMOTQIAZ.js";
import {
  Heading,
  Icon,
  Stack,
  cx
} from "./chunk-XELXU7JZ.js";

// packages/web/src/controls/feedback.tsx
import { Progress as SDKProgress } from "@ui-sdk/react/progress";
import { jsx, jsxs } from "react/jsx-runtime";
function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  dot,
  className
}) {
  const isNumeric = typeof children === "number" || typeof children === "string" && /^\d+$/.test(children.trim());
  const showDot = dot ?? !isNumeric;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cx("yg-badge", className),
      "data-tone": tone,
      "data-variant": variant,
      "data-dot": showDot ? "true" : void 0,
      children: [
        showDot && /* @__PURE__ */ jsx("span", { className: "yg-badge-dot", "aria-hidden": "true" }),
        children
      ]
    }
  );
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
  max = 100,
  presentation = "bar",
  segments = 16,
  valueLabel
}) {
  const limit = Number.isFinite(max) ? Math.max(1, max) : 100;
  const current = value !== void 0 && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : void 0;
  const completion = current === void 0 ? void 0 : current / limit;
  const count = Math.min(32, Math.max(4, Math.round(segments)));
  const filled = completion === void 0 ? 0 : Math.min(count, Math.max(0, Math.round(completion * count)));
  return /* @__PURE__ */ jsxs("label", { className: "yg-progress", "data-presentation": presentation, children: [
    /* @__PURE__ */ jsxs("span", { children: [
      label,
      (valueLabel !== void 0 || completion !== void 0) && /* @__PURE__ */ jsx("span", { className: "yg-meta", "aria-hidden": "true", children: valueLabel ?? `${Math.round((completion ?? 0) * 100)}%` })
    ] }),
    /* @__PURE__ */ jsx(
      SDKProgress,
      {
        value: current ?? null,
        max: limit,
        render: (props) => /* @__PURE__ */ jsx("progress", { ...props, value: current, max: limit })
      }
    ),
    presentation === "segmented" ? /* @__PURE__ */ jsx(
      "span",
      {
        className: "yg-progress-segments",
        "aria-hidden": "true",
        style: { "--yg-progress-segments": count },
        children: Array.from({ length: count }, (_, i) => {
          const state = filled === 0 ? "empty" : i < filled - 1 ? "filled" : i === filled - 1 ? filled === count ? "filled" : "active" : "empty";
          return /* @__PURE__ */ jsx("span", { className: "yg-progress-segment", "data-state": state }, i);
        })
      }
    ) : /* @__PURE__ */ jsx(
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
  Badge,
  Status,
  Notice,
  Skeleton,
  Progress,
  Toast,
  Result
};
