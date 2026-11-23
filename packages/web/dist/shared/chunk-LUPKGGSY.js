"use client";
import {
  Button
} from "./chunk-JHTLYLR5.js";
import {
  Icon
} from "./chunk-A5HC7UHE.js";

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
  const dimensions = {
    "--yg-island-w": `min(100%, ${open ? compact ? 280 : 340 : compact ? 184 : 244}px)`,
    "--yg-island-h": open ? "auto" : `${compact ? 36 : 44}px`,
    "--yg-island-radius": open ? "32px" : `${compact ? 18 : 22}px`,
    "--yg-island-copy": Number(open)
  };
  return /* @__PURE__ */ jsxs("section", { className: "yg-activity-island", style: dimensions, "data-open": open, "data-compact": compact || void 0, children: [
    /* @__PURE__ */ jsxs("button", { type: "button", "aria-expanded": open, "aria-controls": id, onClick: () => setOpen((value) => !value), children: [
      /* @__PURE__ */ jsx(Icon, { name: "clock" }),
      /* @__PURE__ */ jsx("span", { children: label }),
      /* @__PURE__ */ jsx("span", { className: "yg-island-summary", children: summary }),
      /* @__PURE__ */ jsx(Icon, { name: "down" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "yg-island-reveal", id, inert: !open, children: /* @__PURE__ */ jsx("div", { className: "yg-island-content", children }) })
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
  const pending = state === "pending", success = state === "success", result = success || state === "error";
  const ref = useRef(null);
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button || !pending || !fluid) return;
    const sync = () => {
      button.style.setProperty("--yg-result-width", `${button.offsetHeight}px`);
    };
    const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(sync);
    observer?.observe(button);
    sync();
    return () => observer?.disconnect();
  }, [pending, fluid]);
  const settledStyle = {
    "--yg-result-width": pending ? "56px" : fluid ? "100%" : result ? "140px" : "168px",
    "--yg-result-label": Number(state === "idle"),
    "--yg-result-spinner": Number(pending),
    "--yg-result-result": Number(result),
    "--yg-result-color": Number(success),
    "--yg-result-check": Number(success)
  };
  const accessible = pending ? pendingLabel : success ? successLabel : result ? errorLabel : label;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "yg-result-morph",
      ref,
      style: settledStyle,
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
function CopyButton({ value, onCopy, presentation = "standard", errorLabel = "Try again" }) {
  const [state, setState] = useState("idle");
  const [copied, setCopied] = useState(0);
  const request = useRef(0);
  const pending = useRef(null);
  const mounted = useRef(false);
  const roll = useRef(null);
  const ready = useRef(null);
  const done = useRef(null);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    request.current++;
    setState(pending.current === null ? "idle" : "pending");
    return () => {
      request.current++;
    };
  }, [value]);
  useLayoutEffect(() => {
    const label = state === "success" ? done.current : ready.current;
    const node = roll.current;
    if (!label || !node) return;
    const sync = () => {
      node.style.inlineSize = `${label.offsetWidth}px`;
    };
    const resize = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(sync);
    resize?.observe(label);
    if (!resize) window.addEventListener("resize", sync);
    sync();
    return () => {
      resize?.disconnect();
      if (!resize) window.removeEventListener("resize", sync);
    };
  }, [state, errorLabel]);
  useEffect(() => {
    if (state !== "success") return;
    const reset = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(reset);
  }, [copied, state]);
  async function copy() {
    if (pending.current !== null) return;
    const current = ++request.current;
    pending.current = current;
    setState("pending");
    try {
      await (onCopy ? onCopy(value) : navigator.clipboard.writeText(value));
      if (request.current === current) {
        setState("success");
        setCopied((count) => count + 1);
      }
    } catch {
      if (request.current === current) setState("error");
    } finally {
      if (pending.current === current) {
        pending.current = null;
        if (request.current !== current && mounted.current) setState("idle");
      }
    }
  }
  const actionLabel = state === "success" ? "Copied" : state === "error" ? errorLabel : "Copy";
  return /* @__PURE__ */ jsxs("div", { className: "yg-copy-action", "data-presentation": presentation, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "yg-copy-button",
        style: { "--yg-copy-roll": Number(state === "success"), "--yg-copy-icon": Number(state === "success") },
        type: "button",
        "aria-label": actionLabel,
        "aria-disabled": state === "pending" || void 0,
        "data-outcome": state,
        onClick: copy,
        children: [
          /* @__PURE__ */ jsxs("span", { className: "yg-copy-icons", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx(Icon, { name: "copy" }),
            /* @__PURE__ */ jsx(Icon, { name: "check" })
          ] }),
          /* @__PURE__ */ jsx("span", { ref: roll, className: "yg-copy-roll", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { ref: ready, children: state === "error" ? errorLabel : "Copy" }),
            /* @__PURE__ */ jsx("span", { ref: done, children: "Copied" })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx("span", { role: "status", className: "yg-help", children: state === "error" ? "Copy failed. Select and copy the text." : state === "success" ? "Copied to clipboard." : "" })
  ] });
}

export {
  StorageMeter,
  ActivityIsland,
  LoadingSuccessButton,
  CopyButton
};
