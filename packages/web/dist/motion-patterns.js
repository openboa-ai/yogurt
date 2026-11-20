"use client";
"use client";
import {
  Command
} from "./shared/chunk-I4YIUKTP.js";
import "./shared/chunk-OQUAFXG7.js";
import "./shared/chunk-UJUDQD47.js";
import "./shared/chunk-5GJUJT3P.js";
import {
  dist_exports10 as dist_exports
} from "./shared/chunk-5SWGMKHQ.js";
import {
  Button
} from "./shared/chunk-P4D5QO3L.js";
import {
  Icon
} from "./shared/chunk-3EP3O3HY.js";

// packages/web/src/patterns/motion-inputs.tsx
import { useId, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function MentionPicker({ label, people, value, onChange }) {
  const id = useId();
  const input = useRef(null);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(null);
  const [active, setActive] = useState(0);
  const before = value.slice(0, caret);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? caret - match[1].length - 1 : -1;
  const end = start < 0 ? caret : caret + (value.slice(caret).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${caret}:${value}`;
  const options = match ? people.filter((person) => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = focused && !!match && dismissed !== tokenKey && options.length > 0;
  const index = Math.min(active, options.length - 1);
  function select(person) {
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    onChange(value.slice(0, start) + replacement + space + suffix);
    setDismissed(null);
    setActive(0);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "yg-mention", children: [
    /* @__PURE__ */ jsx("label", { className: "yg-label", htmlFor: id, children: label }),
    /* @__PURE__ */ jsxs("div", { className: "yg-mention-surface", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id,
          ref: input,
          value,
          rows: 2,
          placeholder: "Write a comment",
          "aria-describedby": `${id}-hint`,
          "aria-autocomplete": "list",
          "aria-expanded": open,
          "aria-controls": open ? `${id}-list` : void 0,
          "aria-activedescendant": open ? `${id}-option-${index}` : void 0,
          onFocus: (event) => {
            setFocused(true);
            setCaret(event.currentTarget.selectionStart);
          },
          onBlur: () => setFocused(false),
          onSelect: (event) => {
            setCaret(event.currentTarget.selectionStart);
            setActive(0);
          },
          onChange: (event) => {
            setCaret(event.currentTarget.selectionStart);
            setActive(0);
            setDismissed(null);
            onChange(event.currentTarget.value);
          },
          onKeyDown: (event) => {
            if (!open || event.nativeEvent.isComposing) return;
            if (event.key === "Escape") {
              event.preventDefault();
              setDismissed(tokenKey);
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
            } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              select(options[index]);
            }
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "yg-mention-hint", id: `${id}-hint`, children: "Type @ to mention" }),
      open && /* @__PURE__ */ jsx("div", { id: `${id}-list`, className: "yg-mention-list", role: "listbox", "aria-label": "People", children: options.map((person, i) => /* @__PURE__ */ jsxs("button", { id: `${id}-option-${i}`, role: "option", "aria-selected": i === index, type: "button", onMouseDown: (event) => event.preventDefault(), onClick: () => select(person), children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: Array.from(person.label)[0]?.toLocaleUpperCase() }),
        person.label
      ] }, person.id)) })
    ] })
  ] });
}
function acceptsFile(file, accept) {
  const rules = accept?.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return rules.some((rule) => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}
function FileDrop({ label, onFiles, accept, multiple = false }) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  function receive(files) {
    if (!files.length) return;
    const allowed = files.filter((file) => acceptsFile(file, accept));
    const selected = multiple ? allowed : allowed.slice(0, 1);
    const rejected = files.length - selected.length;
    setAccepted(selected.length > 0);
    setMessage(rejected ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added${accept ? ` (accepted: ${accept})` : ""}.` : `${selected.length} ${selected.length === 1 ? "file" : "files"} selected.`);
    if (selected.length) onFiles(selected);
  }
  const formats = accept?.split(",").map((rule) => rule.trim()).filter(Boolean).map((rule) => rule.endsWith("/*") ? rule.split("/")[0] + " files" : (rule.split("/").at(-1) ?? rule).replace(/^\./, "").toUpperCase()).join(", ");
  return /* @__PURE__ */ jsxs("div", { className: "yg-file-drop-wrap", children: [
    /* @__PURE__ */ jsx("span", { className: "yg-label", id: `${id}-label`, children: label }),
    /* @__PURE__ */ jsxs(
      "label",
      {
        htmlFor: id,
        className: "yg-file-drop",
        "data-dragging": dragging || void 0,
        "data-accepted": accepted || void 0,
        onDragEnter: (event) => {
          event.preventDefault();
          depth.current++;
          setDragging(true);
        },
        onDragOver: (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: (event) => {
          event.preventDefault();
          depth.current = Math.max(0, depth.current - 1);
          if (!depth.current) setDragging(false);
        },
        onDrop: (event) => {
          event.preventDefault();
          depth.current = 0;
          setDragging(false);
          receive(Array.from(event.dataTransfer.files));
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "yg-file-drop-core", children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "yg-file-drop-mark",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 1.7,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx("path", { d: "M12 16V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" })
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "yg-file-drop-copy", children: [
            /* @__PURE__ */ jsx("strong", { children: "Drop files here" }),
            /* @__PURE__ */ jsx("span", { id: `${id}-formats`, children: formats || "Choose a file from your device" })
          ] }),
          /* @__PURE__ */ jsx("input", { id, type: "file", "aria-labelledby": `${id}-label`, "aria-describedby": `${id}-formats`, accept, multiple, onChange: (event) => {
            receive(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          } })
        ]
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "yg-file-drop-status", role: "status", children: message })
  ] });
}

// packages/web/src/patterns/motion-choices.tsx
import { useId as useId2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function FocusPicker({ value, onChange, options }) {
  const name = useId2();
  return /* @__PURE__ */ jsx2("div", { className: "yg-focus-picker", role: "radiogroup", "aria-label": "Focus", children: options.map((option) => /* @__PURE__ */ jsxs2("label", { className: "yg-focus-choice", "data-selected": value === option.id || void 0, children: [
    /* @__PURE__ */ jsx2("input", { type: "radio", name, value: option.id, checked: value === option.id, onChange: () => onChange(option.id) }),
    /* @__PURE__ */ jsx2("span", { className: "yg-focus-orbit", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs2("span", { className: "yg-choice-copy", children: [
      /* @__PURE__ */ jsx2("strong", { children: option.label }),
      /* @__PURE__ */ jsx2("span", { children: option.description })
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
  ] }, option.id)) });
}
function PlanSwitch({ value, onChange, options }) {
  const name = useId2();
  return /* @__PURE__ */ jsx2("div", { className: "yg-plan-switch", role: "radiogroup", "aria-label": "Plan", children: options.map((option) => /* @__PURE__ */ jsxs2("label", { className: "yg-plan-choice", "data-selected": value === option.id || void 0, children: [
    /* @__PURE__ */ jsx2("input", { type: "radio", name, value: option.id, checked: value === option.id, onChange: () => onChange(option.id) }),
    /* @__PURE__ */ jsxs2("span", { className: "yg-plan-heading", children: [
      /* @__PURE__ */ jsx2("strong", { children: option.label }),
      /* @__PURE__ */ jsx2("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "yg-plan-price", children: option.price }),
    /* @__PURE__ */ jsx2("span", { className: "yg-plan-description", children: option.description })
  ] }, option.id)) });
}
function LetterLimit({ label, value, onChange, limit, placeholder, onSubmit }) {
  const id = useId2();
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  const progress = maximum > 0 ? Math.min(1, value.length / maximum) : 0;
  const state = remaining <= 0 ? "full" : remaining <= Math.max(10, maximum * 0.1) ? "near" : "normal";
  return /* @__PURE__ */ jsxs2("div", { className: "yg-letter-limit", "data-limit-state": state, children: [
    /* @__PURE__ */ jsx2(
      "textarea",
      {
        id,
        "aria-label": label,
        placeholder,
        value,
        maxLength: maximum,
        onChange: (event) => onChange(event.currentTarget.value),
        "aria-describedby": `${id}-count`
      }
    ),
    /* @__PURE__ */ jsxs2("div", { className: "yg-letter-footer", children: [
      /* @__PURE__ */ jsxs2("svg", { className: "yg-letter-meter", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9.5" }),
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9.5", pathLength: "1", strokeDasharray: "1 1", strokeDashoffset: 1 - progress })
      ] }),
      /* @__PURE__ */ jsx2("span", { className: "yg-letter-count", id: `${id}-count`, children: remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining` }),
      onSubmit && /* @__PURE__ */ jsx2(Button, { onClick: () => onSubmit(value), disabled: remaining < 0 || !value.trim(), children: "Post" })
    ] })
  ] });
}

// packages/web/src/patterns/motion-layers.tsx
import { useId as useId3, useState as useState2 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function MorphTooltip({ label, detail }) {
  const id = useId3();
  const [hovered, setHovered] = useState2(false);
  const [focused, setFocused] = useState2(false);
  const [dismissed, setDismissed] = useState2(false);
  const open = !dismissed && (hovered || focused);
  return /* @__PURE__ */ jsxs3(
    "span",
    {
      className: "yg-morph-tooltip",
      onPointerEnter: () => {
        setHovered(true);
        setDismissed(false);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
      onFocus: () => {
        setFocused(true);
        setDismissed(false);
      },
      onBlur: () => {
        setFocused(false);
        setDismissed(false);
      },
      onKeyDown: (event) => {
        if (event.key === "Escape") setDismissed(true);
      },
      children: [
        /* @__PURE__ */ jsxs3("button", { type: "button", className: "yg-morph-tooltip-trigger", "aria-describedby": open ? id : void 0, children: [
          label,
          /* @__PURE__ */ jsx3("span", { "aria-hidden": "true", children: "i" })
        ] }),
        /* @__PURE__ */ jsx3("span", { id, role: "tooltip", className: "yg-morph-tooltip-card", "data-open": open, "aria-hidden": !open, children: /* @__PURE__ */ jsx3("span", { children: detail }) })
      ]
    }
  );
}
function SpringDropdown({ label, value, onChange, options }) {
  const id = useId3();
  const [portal, setPortal] = useState2(null);
  return /* @__PURE__ */ jsxs3("div", { ref: setPortal, className: "yg-spring-dropdown", children: [
    /* @__PURE__ */ jsx3("label", { id, className: "yg-spring-label", children: label }),
    /* @__PURE__ */ jsxs3(dist_exports.Root, { value, onValueChange: onChange, children: [
      /* @__PURE__ */ jsxs3(dist_exports.Trigger, { className: "yg-spring-trigger", "aria-labelledby": id, children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-value", children: /* @__PURE__ */ jsx3("span", { className: "yg-spring-value-roll", children: /* @__PURE__ */ jsx3(dist_exports.Value, { placeholder: "Choose an option" }) }, value) }),
        /* @__PURE__ */ jsx3(dist_exports.Icon, { className: "yg-spring-chevron", "aria-hidden": "true", children: "\u2304" })
      ] }),
      /* @__PURE__ */ jsx3(dist_exports.Portal, { container: portal, children: /* @__PURE__ */ jsx3(dist_exports.Content, { className: "yg-spring-menu", position: "popper", sideOffset: 8, children: /* @__PURE__ */ jsx3(dist_exports.Viewport, { className: "yg-spring-viewport", children: options.map((option) => /* @__PURE__ */ jsxs3(dist_exports.Item, { value: option.id, className: "yg-spring-option", children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-option-symbol", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3(dist_exports.ItemText, { children: option.label }),
        /* @__PURE__ */ jsx3(dist_exports.ItemIndicator, { className: "yg-spring-check", "aria-hidden": "true", children: "\u2713" })
      ] }, option.id)) }) }) })
    ] })
  ] });
}
function CommandButton({ label, items, onSelect }) {
  return /* @__PURE__ */ jsx3("div", { className: "yg-command-button", children: /* @__PURE__ */ jsx3(Command, { label, items, onSelect }) });
}

// packages/web/src/patterns/motion-status.tsx
import { useId as useId4, useState as useState3 } from "react";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function StorageMeter({ label, used, capacity, unit, categories = [] }) {
  const id = useId4();
  const [expanded, setExpanded] = useState3(null);
  const known = Number.isFinite(used) && Number.isFinite(capacity) && capacity > 0 && used >= 0;
  const ratio = known ? Math.min(1, used / capacity) : 0;
  let available = known ? Math.min(used, capacity) : 0;
  const breakdown = categories.filter((category) => Number.isFinite(category.amount) && category.amount > 0);
  const bars = breakdown.map((category, index) => {
    const amount = Math.min(category.amount, available);
    available -= amount;
    return { id: category.id, fraction: known ? amount / capacity : 0, tone: index % 3 };
  });
  if (available > 0) bars.push({ fraction: available / capacity, tone: categories.length === 0 ? 0 : 2 });
  return /* @__PURE__ */ jsxs4("section", { className: "yg-storage-meter", "data-full": ratio === 1 || void 0, children: [
    /* @__PURE__ */ jsx4("strong", { id, className: "yg-storage-heading", children: label }),
    known ? /* @__PURE__ */ jsxs4(Fragment, { children: [
      /* @__PURE__ */ jsxs4("div", { className: "yg-storage-amount", children: [
        /* @__PURE__ */ jsx4("strong", { children: used }, used),
        /* @__PURE__ */ jsx4("b", { children: unit }),
        /* @__PURE__ */ jsxs4("span", { children: [
          "of ",
          capacity,
          " ",
          unit
        ] })
      ] }),
      /* @__PURE__ */ jsx4(
        "div",
        {
          className: "yg-storage-bar",
          role: "meter",
          "aria-labelledby": id,
          "aria-valuemin": 0,
          "aria-valuemax": capacity,
          "aria-valuenow": Math.min(used, capacity),
          "aria-valuetext": `${used} of ${capacity} ${unit} used`,
          "data-highlight": breakdown.some((category) => category.id === expanded) || void 0,
          children: bars.map(({ id: categoryId, fraction, tone }) => /* @__PURE__ */ jsx4(
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
      breakdown.length > 0 && /* @__PURE__ */ jsx4("ul", { className: "yg-storage-categories", children: breakdown.map((category, index) => {
        const opened = expanded === category.id;
        const detailId = `${id}-category-${index}`;
        return /* @__PURE__ */ jsxs4("li", { "data-open": opened || void 0, children: [
          /* @__PURE__ */ jsxs4(
            "button",
            {
              type: "button",
              onClick: () => setExpanded(opened ? null : category.id),
              "aria-expanded": category.detail ? opened : void 0,
              "aria-pressed": category.detail ? void 0 : opened,
              "aria-controls": category.detail ? detailId : void 0,
              children: [
                /* @__PURE__ */ jsx4("span", { className: "yg-storage-dot", "data-tone": index % 3, "aria-hidden": "true" }),
                /* @__PURE__ */ jsx4("span", { children: category.label }),
                /* @__PURE__ */ jsxs4("span", { className: "yg-storage-category-amount", children: [
                  category.amount,
                  " ",
                  unit
                ] })
              ]
            }
          ),
          category.detail && /* @__PURE__ */ jsx4("div", { className: "yg-storage-reveal", id: detailId, inert: !opened, children: /* @__PURE__ */ jsx4("div", { children: /* @__PURE__ */ jsx4("div", { className: "yg-storage-category-detail", children: category.detail }) }) })
        ] }, category.id);
      }) })
    ] }) : /* @__PURE__ */ jsx4("span", { className: "yg-help", children: "Capacity unavailable" })
  ] });
}
function ActivityIsland({ label, summary, children }) {
  const id = useId4();
  const [open, setOpen] = useState3(false);
  return /* @__PURE__ */ jsxs4("section", { className: "yg-activity-island", "data-open": open, children: [
    /* @__PURE__ */ jsxs4("button", { type: "button", "aria-expanded": open, "aria-controls": id, onClick: () => setOpen((value) => !value), children: [
      /* @__PURE__ */ jsx4(Icon, { name: "clock" }),
      /* @__PURE__ */ jsx4("span", { children: label }),
      /* @__PURE__ */ jsx4("span", { className: "yg-island-summary", children: summary }),
      /* @__PURE__ */ jsx4(Icon, { name: "down" })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "yg-island-reveal", id, inert: !open, children: /* @__PURE__ */ jsx4("div", { children: /* @__PURE__ */ jsx4("div", { className: "yg-island-content", children }) }) })
  ] });
}
function LoadingSuccessButton({ label, pendingLabel, successLabel, errorLabel, state, onAction }) {
  const result = state === "success" ? successLabel : state === "error" ? errorLabel : null;
  return /* @__PURE__ */ jsx4(
    Button,
    {
      className: "yg-result-action",
      "data-outcome": state,
      pending: state === "pending",
      pendingLabel,
      onClick: onAction,
      children: /* @__PURE__ */ jsxs4("span", { className: "yg-result-action-label", children: [
        /* @__PURE__ */ jsx4("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: label }),
        /* @__PURE__ */ jsxs4("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: [
          /* @__PURE__ */ jsx4(Icon, { name: "check" }),
          " ",
          successLabel
        ] }),
        /* @__PURE__ */ jsxs4("span", { "aria-hidden": "true", className: "yg-result-action-measure", children: [
          /* @__PURE__ */ jsx4(Icon, { name: "close" }),
          " ",
          errorLabel
        ] }),
        /* @__PURE__ */ jsxs4("span", { "data-result": result !== null || void 0, children: [
          result && /* @__PURE__ */ jsx4(Icon, { name: state === "success" ? "check" : "close" }),
          result ?? label
        ] }, state)
      ] })
    }
  );
}
function CopyButton({ value }) {
  const [state, setState] = useState3("idle");
  async function copy() {
    setState("pending");
    try {
      await navigator.clipboard.writeText(value);
      setState("success");
    } catch {
      setState("error");
    }
  }
  return /* @__PURE__ */ jsxs4("div", { className: "yg-copy-action", children: [
    /* @__PURE__ */ jsx4(
      LoadingSuccessButton,
      {
        label: "Copy",
        pendingLabel: "Copying",
        successLabel: "Copied",
        errorLabel: "Try again",
        state,
        onAction: copy
      }
    ),
    /* @__PURE__ */ jsx4("span", { role: "status", className: "yg-help", children: state === "error" ? "Clipboard unavailable. Select and copy the text." : state === "success" ? "Copied to clipboard." : "" })
  ] });
}

// packages/web/src/patterns/motion-conversation.tsx
import { useId as useId5, useLayoutEffect, useRef as useRef2, useState as useState4 } from "react";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function StreamingReply({ value, active = false }) {
  return /* @__PURE__ */ jsx5("div", { className: "yg-streaming-reply", "aria-busy": active || void 0, children: value ? /* @__PURE__ */ jsx5("span", { children: value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part : /* @__PURE__ */ jsx5("span", { className: "yg-streaming-word", children: part }, index)) }) : active ? /* @__PURE__ */ jsx5("span", { className: "yg-streaming-wait", children: "Thinking" }) : null });
}
function GhostSuggestion({ value, suggestion, onChange }) {
  const id = useId5();
  const [atEnd, setAtEnd] = useState4(true);
  const mirror = useRef2(null);
  const suffix = value && suggestion.startsWith(value) ? suggestion.slice(value.length) : "";
  const show = atEnd && !!suffix;
  return /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-field", children: [
    /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-head", children: [
      /* @__PURE__ */ jsx5("label", { htmlFor: id, children: "Your message" }),
      show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-key", "aria-hidden": "true", children: "Tab \u21B9" })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-input", children: [
      /* @__PURE__ */ jsxs5("div", { ref: mirror, className: "yg-ghost-mirror", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx5("span", { children: value }),
        show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-suffix", children: Array.from(suffix).map((letter, index) => /* @__PURE__ */ jsx5("span", { style: { animationDelay: `${Math.min(index * 8, 200)}ms` }, children: letter }, index)) })
      ] }),
      /* @__PURE__ */ jsx5(
        "input",
        {
          id,
          value,
          autoComplete: "off",
          "aria-describedby": show ? `${id}-hint` : void 0,
          onScroll: (event) => {
            if (mirror.current) mirror.current.scrollLeft = event.currentTarget.scrollLeft;
          },
          onChange: (event) => {
            onChange(event.currentTarget.value);
            setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length);
          },
          onSelect: (event) => setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length),
          onKeyDown: (event) => {
            if (show && (event.key === "Tab" || event.key === "ArrowRight") && !event.nativeEvent.isComposing) {
              event.preventDefault();
              onChange(suggestion);
            }
          }
        }
      )
    ] }),
    show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-hint", id: `${id}-hint`, children: "Press Tab or right arrow to accept" })
  ] });
}
function PromptBox({ value, onChange, onSubmit, busy = false, onCancel }) {
  const editor = useRef2(null);
  const measure = useRef2(null);
  useLayoutEffect(() => {
    const target = editor.current;
    const source = measure.current;
    if (!target || !source) return;
    const resize = () => target.style.setProperty("--yg-prompt-editor-height", `${Math.min(source.offsetHeight, 88)}px`);
    const observer = new ResizeObserver(resize);
    observer.observe(source);
    resize();
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs5(
    "form",
    {
      className: "yg-prompt-box",
      "aria-label": "Prompt",
      "aria-busy": busy || void 0,
      onSubmit: (event) => {
        event.preventDefault();
        if (!busy && value.trim()) onSubmit();
      },
      children: [
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-panel", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status-slot", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status", role: "status", children: busy && /* @__PURE__ */ jsxs5(Fragment2, { children: [
          /* @__PURE__ */ jsx5("span", { className: "yg-prompt-indicator", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx5("span", { children: "Thinking" })
        ] }) }) }) }),
        /* @__PURE__ */ jsxs5("div", { className: "yg-prompt-editor", ref: editor, children: [
          /* @__PURE__ */ jsxs5("span", { className: "yg-prompt-measure", ref: measure, "aria-hidden": "true", children: [
            value,
            " "
          ] }),
          /* @__PURE__ */ jsx5(
            "textarea",
            {
              "aria-label": "Prompt",
              placeholder: "Ask anything",
              rows: 1,
              value,
              onChange: (event) => onChange(event.currentTarget.value),
              onKeyDown: (event) => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                event.preventDefault();
                if (!busy && value.trim()) event.currentTarget.form?.requestSubmit();
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-actions", children: /* @__PURE__ */ jsxs5(
          "button",
          {
            className: "yg-prompt-action",
            type: busy && onCancel ? "button" : "submit",
            "aria-label": busy && onCancel ? "Stop" : "Send",
            "data-busy": busy && onCancel ? true : void 0,
            disabled: busy ? !onCancel : !value.trim(),
            onClick: busy && onCancel ? onCancel : void 0,
            children: [
              /* @__PURE__ */ jsx5("span", { className: "yg-prompt-arrow", "aria-hidden": "true", children: /* @__PURE__ */ jsx5("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx5("path", { d: "M12 19V5M6 11l6-6 6 6" }) }) }),
              /* @__PURE__ */ jsx5("span", { className: "yg-prompt-stop", "aria-hidden": "true" })
            ]
          }
        ) })
      ]
    }
  );
}
function ThinkingIndicator({ label = "Thinking", active = true }) {
  const filter = useId5();
  if (!active) return null;
  return /* @__PURE__ */ jsxs5("div", { className: "yg-thinking", role: "status", "aria-label": label, children: [
    /* @__PURE__ */ jsx5("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsx5("defs", { children: /* @__PURE__ */ jsxs5("filter", { id: filter, children: [
      /* @__PURE__ */ jsx5("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2", result: "blur" }),
      /* @__PURE__ */ jsx5("feColorMatrix", { in: "blur", mode: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" })
    ] }) }) }),
    /* @__PURE__ */ jsxs5("span", { className: "yg-thinking-dots", "aria-hidden": "true", style: { filter: `url(#${filter})` }, children: [
      /* @__PURE__ */ jsx5("i", {}),
      /* @__PURE__ */ jsx5("i", {}),
      /* @__PURE__ */ jsx5("i", {})
    ] })
  ] });
}

// packages/web/src/patterns/motion-cards.tsx
import { useState as useState5 } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function ExpandCard({ title, children }) {
  return /* @__PURE__ */ jsxs6("details", { className: "yg-expand-card", children: [
    /* @__PURE__ */ jsxs6("summary", { children: [
      /* @__PURE__ */ jsx6("span", { className: "yg-expand-art", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx6("span", { className: "yg-expand-title", children: title }),
      /* @__PURE__ */ jsx6("span", { className: "yg-card-disclosure", children: /* @__PURE__ */ jsx6(Icon, { name: "plus" }) })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "yg-expand-card-body", children })
  ] });
}
function FanCards({ items }) {
  const [selectedId, setSelectedId] = useState5(null);
  const selected = items.find((item) => item.id === selectedId);
  return /* @__PURE__ */ jsxs6("div", { className: "yg-fan-cards", children: [
    /* @__PURE__ */ jsx6("div", { className: "yg-fan-cards-list", "aria-label": "Cards", "data-many": items.length > 3 || void 0, children: items.map((item, index) => /* @__PURE__ */ jsxs6(
      "button",
      {
        type: "button",
        style: { "--yg-fan-offset": index - (items.length - 1) / 2 },
        "aria-pressed": item.id === selected?.id,
        onClick: () => setSelectedId(item.id === selectedId ? null : item.id),
        children: [
          /* @__PURE__ */ jsx6("span", { className: "yg-fan-art", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx6("span", { className: "yg-fan-index", "aria-hidden": "true", children: String(index + 1).padStart(2, "0") }),
          /* @__PURE__ */ jsx6("span", { className: "yg-fan-label", children: item.label }),
          /* @__PURE__ */ jsx6(Icon, { name: "next" })
        ]
      },
      item.id
    )) }),
    selected && /* @__PURE__ */ jsxs6("p", { className: "yg-fan-detail", children: [
      /* @__PURE__ */ jsx6("strong", { children: selected.label }),
      /* @__PURE__ */ jsx6("span", { children: selected.detail })
    ] })
  ] });
}
function StatCard({ label, value, detail }) {
  return /* @__PURE__ */ jsx6("section", { className: "yg-stat-card", "aria-label": label, children: /* @__PURE__ */ jsxs6("div", { className: "yg-stat-heading", children: [
    /* @__PURE__ */ jsxs6("div", { children: [
      /* @__PURE__ */ jsx6("span", { className: "yg-stat-label", children: label }),
      /* @__PURE__ */ jsx6("strong", { className: "yg-stat-value", children: value.toLocaleString() }, value)
    ] }),
    detail && /* @__PURE__ */ jsx6("span", { className: "yg-stat-detail", children: detail })
  ] }) });
}
function ProfileCard({ name, detail, initials, children }) {
  return /* @__PURE__ */ jsxs6("section", { className: "yg-profile-card", children: [
    /* @__PURE__ */ jsxs6("div", { className: "yg-profile-header", children: [
      /* @__PURE__ */ jsx6("span", { className: "yg-profile-avatar", "aria-hidden": "true", children: initials }),
      /* @__PURE__ */ jsxs6("div", { children: [
        /* @__PURE__ */ jsx6("strong", { children: name }),
        /* @__PURE__ */ jsx6("p", { children: detail })
      ] })
    ] }),
    children != null && /* @__PURE__ */ jsxs6("details", { children: [
      /* @__PURE__ */ jsxs6("summary", { children: [
        "More about ",
        name
      ] }),
      /* @__PURE__ */ jsx6("div", { className: "yg-profile-extra", children })
    ] })
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { useId as useId6, useRef as useRef3, useState as useState6 } from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function RangeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  end,
  onEndChange,
  detail,
  formatValue = String
}) {
  const id = useId6();
  const activeDrag = useRef3(null);
  const percent = (number) => max > min ? Math.max(0, Math.min(100, (number - min) / (max - min) * 100)) : 0;
  const first = percent(value);
  if (end === void 0 || !onEndChange) {
    return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range", style: { "--yg-range-fill": `${first}%` }, children: [
      /* @__PURE__ */ jsx7("div", { className: "yg-motion-range-heading", children: /* @__PURE__ */ jsx7("label", { htmlFor: id, children: label }) }),
      /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range-area", children: [
        /* @__PURE__ */ jsx7("span", { className: "yg-motion-range-tip", "aria-hidden": "true", style: { left: `${first}%` }, children: formatValue(value) }),
        /* @__PURE__ */ jsx7(
          "input",
          {
            id,
            type: "range",
            min,
            max,
            step,
            value,
            onChange: (event) => onChange(event.currentTarget.valueAsNumber)
          }
        )
      ] })
    ] });
  }
  const last = percent(end);
  const joined = last - first < 25;
  const increment = step > 0 && Number.isFinite(step) ? step : 1;
  const set = (thumb, next) => {
    const snapped = Number((min + Math.round((next - min) / increment) * increment).toFixed(10));
    if (thumb === "start") onChange(Math.max(min, Math.min(end, snapped)));
    else onEndChange(Math.max(value, Math.min(max, snapped)));
  };
  const position = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const direction = getComputedStyle(event.currentTarget).direction;
    const x = direction === "rtl" ? box.right - event.clientX : event.clientX - box.left;
    return min + Math.max(0, Math.min(1, x / Math.max(1, box.width))) * (max - min);
  };
  const onThumbKey = (event, side, at) => {
    const bounds = side === "start" ? [min, end] : [value, max];
    const keys = {
      ArrowDown: at - increment,
      ArrowLeft: at - increment,
      ArrowUp: at + increment,
      ArrowRight: at + increment,
      Home: bounds[0],
      End: bounds[1]
    };
    if (keys[event.key] === void 0) return;
    event.preventDefault();
    set(side, keys[event.key]);
  };
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      className: "yg-motion-range",
      "data-interval": "",
      role: "group",
      "aria-labelledby": id,
      style: { "--yg-range-start": `${first}%`, "--yg-range-end": `${last}%` },
      children: [
        /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range-heading", children: [
          /* @__PURE__ */ jsx7("strong", { id, children: label }),
          detail && /* @__PURE__ */ jsx7("span", { children: detail })
        ] }),
        /* @__PURE__ */ jsxs7(
          "div",
          {
            className: "yg-motion-range-area",
            "data-joined": joined || void 0,
            onPointerDown: (event) => {
              if (!event.isPrimary || event.button !== 0 || activeDrag.current) return;
              const at = position(event);
              const target = event.target.closest("[data-thumb]");
              const side = target?.dataset.thumb === "start" || target?.dataset.thumb === "end" ? target.dataset.thumb : Math.abs(at - value) <= Math.abs(at - end) ? "start" : "end";
              activeDrag.current = { id: event.pointerId, thumb: side };
              (target ?? event.currentTarget.querySelector(`[data-thumb="${side}"]`))?.focus();
              event.currentTarget.setPointerCapture(event.pointerId);
              if (!target) set(side, at);
            },
            onPointerMove: (event) => {
              const drag = activeDrag.current;
              if (drag?.id === event.pointerId) set(drag.thumb, position(event));
            },
            onPointerUp: (event) => {
              if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
            },
            onPointerCancel: (event) => {
              if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
            },
            onLostPointerCapture: (event) => {
              if (activeDrag.current?.id === event.pointerId) activeDrag.current = null;
            },
            children: [
              /* @__PURE__ */ jsx7("span", { className: "yg-motion-interval-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx7("span", {}) }),
              /* @__PURE__ */ jsx7("span", { className: "yg-motion-range-tip", "data-tip": "start", "aria-hidden": "true", children: formatValue(value) }),
              /* @__PURE__ */ jsx7("span", { className: "yg-motion-range-tip", "data-tip": "end", "aria-hidden": "true", children: formatValue(end) }),
              /* @__PURE__ */ jsxs7("span", { className: "yg-motion-range-tip", "data-tip": "joined", "aria-hidden": "true", children: [
                formatValue(value),
                "\u2013",
                formatValue(end)
              ] }),
              /* @__PURE__ */ jsx7(
                "button",
                {
                  type: "button",
                  role: "slider",
                  "data-thumb": "start",
                  "aria-label": `Minimum ${label.toLowerCase()}`,
                  "aria-valuemin": min,
                  "aria-valuemax": end,
                  "aria-valuenow": value,
                  "aria-valuetext": formatValue(value),
                  onKeyDown: (event) => onThumbKey(event, "start", value)
                }
              ),
              /* @__PURE__ */ jsx7(
                "button",
                {
                  type: "button",
                  role: "slider",
                  "data-thumb": "end",
                  "aria-label": `Maximum ${label.toLowerCase()}`,
                  "aria-valuemin": value,
                  "aria-valuemax": max,
                  "aria-valuenow": end,
                  "aria-valuetext": formatValue(end),
                  onKeyDown: (event) => onThumbKey(event, "end", end)
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function PasswordStrength({ value, onChange }) {
  const id = useId6();
  const [shown, setShown] = useState6(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password", "data-score": score, children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: "Create a password" }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password-field", children: [
      /* @__PURE__ */ jsx7("input", { id, type: shown ? "text" : "password", autoComplete: "new-password", value, onChange: (event) => onChange(event.currentTarget.value), "aria-describedby": `${id}-checks` }),
      /* @__PURE__ */ jsx7("button", { type: "button", className: "yg-motion-password-eye", "aria-label": shown ? "Hide password" : "Show password", "aria-pressed": shown, onClick: () => setShown(!shown), children: /* @__PURE__ */ jsxs7("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx7("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
        /* @__PURE__ */ jsx7("circle", { cx: "12", cy: "12", r: "2.8" }),
        /* @__PURE__ */ jsx7("path", { className: "yg-motion-password-slash", d: "M4.5 4.5l15 15" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx7("div", { className: "yg-motion-password-meter", "aria-hidden": "true", children: [0, 1, 2, 3].map((index) => /* @__PURE__ */ jsx7("span", { style: { "--yg-bar-index": index }, children: /* @__PURE__ */ jsx7("i", { "data-active": index < score || void 0 }) }, index)) }),
    /* @__PURE__ */ jsxs7("div", { id: `${id}-checks`, className: "yg-motion-password-checks", children: [
      /* @__PURE__ */ jsx7("strong", { children: word }, word),
      /* @__PURE__ */ jsx7("span", { children: "8+ characters, mixed case, a number and a symbol" })
    ] })
  ] });
}
function CheckboxList({ options, value, onChange }) {
  const count = options.filter((option) => value.includes(option.id)).length;
  return /* @__PURE__ */ jsxs7("fieldset", { className: "yg-motion-checklist", children: [
    /* @__PURE__ */ jsx7("legend", { children: "Choose options" }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-checklist-heading", children: [
      /* @__PURE__ */ jsx7("strong", { children: "Today" }),
      /* @__PURE__ */ jsxs7("span", { children: [
        /* @__PURE__ */ jsx7("b", { children: count }),
        " of ",
        options.length,
        " done"
      ] })
    ] }),
    options.map((option) => /* @__PURE__ */ jsxs7("label", { className: "yg-motion-checklist-item", children: [
      /* @__PURE__ */ jsx7("input", { type: "checkbox", checked: value.includes(option.id), onChange: (event) => onChange(event.currentTarget.checked ? [...value, option.id] : value.filter((id) => id !== option.id)) }),
      /* @__PURE__ */ jsx7("span", { className: "yg-motion-checklist-box", "aria-hidden": "true", children: /* @__PURE__ */ jsx7("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx7("path", { d: "M6 12.5l4 4L18 8" }) }) }),
      /* @__PURE__ */ jsx7("span", { className: "yg-motion-checklist-text", children: option.label })
    ] }, option.id))
  ] });
}
function DetentDial({ options, value, onChange }) {
  const id = useId6();
  const index = options.findIndex((option) => option.id === value);
  const selected = Math.max(0, index);
  const choose = (next) => {
    if (options.length) onChange(options[(next + options.length) % options.length].id);
  };
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-dial", children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: "Selection" }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-dial-face", style: { "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` }, children: [
      /* @__PURE__ */ jsx7("span", { className: "yg-motion-dial-marker", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx7("span", { className: "yg-motion-dial-value", children: options[index]?.label ?? "No selection" })
    ] }),
    /* @__PURE__ */ jsx7("input", { id, type: "range", min: 0, max: Math.max(0, options.length - 1), step: 1, value: selected, disabled: !options.length, "aria-valuetext": options[index]?.label ?? "No selection", onChange: (event) => choose(event.currentTarget.valueAsNumber), onKeyDown: (event) => {
      if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) {
        event.preventDefault();
        choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1));
      }
    } }),
    /* @__PURE__ */ jsx7("div", { className: "yg-motion-dial-options", "aria-hidden": "true", children: options.map((option) => /* @__PURE__ */ jsx7("span", { "data-selected": option.id === value || void 0, children: option.label }, option.id)) })
  ] });
}

// packages/web/src/patterns/motion-confirm.tsx
import { useEffect, useRef as useRef4, useState as useState7 } from "react";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function useConfirmation(onConfirm) {
  const [done, setDone] = useState7(false);
  const locked = useRef4(false);
  const timer = useRef4(null);
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
  const [progress, setProgress] = useState7(0);
  const [armed, setArmed] = useState7(false);
  const [holding, setHolding] = useState7(false);
  const active = useRef4(null);
  const frame = useRef4(null);
  const callback = useRef4(onConfirm);
  callback.current = onConfirm;
  const { done, locked, confirm } = useConfirmation(() => callback.current());
  const cancel = () => {
    active.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
    setProgress(0);
  };
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);
  const start = (event) => {
    if (!event.isPrimary || event.button !== 0 || active.current !== null || locked.current) return;
    setArmed(false);
    setHolding(true);
    active.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const started = performance.now();
    const tick = (now) => {
      if (active.current === null) return;
      const next = Math.min(1, (now - started) / 1200);
      setProgress(next);
      if (next === 1) {
        active.current = null;
        frame.current = null;
        setHolding(false);
        confirm();
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return /* @__PURE__ */ jsxs8(
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
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-label", children: done ? /* @__PURE__ */ jsx8(Icon, { name: "check" }) : armed ? `Confirm ${label}` : label })
      ]
    }
  );
}
function SlideConfirm({ label, onConfirm }) {
  const [progress, setProgress] = useState7(0);
  const [armed, setArmed] = useState7(false);
  const [dragging, setDragging] = useState7(false);
  const active = useRef4(null);
  const value = useRef4(0);
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
  return /* @__PURE__ */ jsxs8(
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
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-label", children: armed ? `Confirm ${label}` : label }),
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-fill", "aria-hidden": "true", children: done ? "Confirmed" : label }),
        /* @__PURE__ */ jsx8("span", { className: "yg-slide-confirm-handle", "aria-hidden": "true", children: /* @__PURE__ */ jsx8(Icon, { name: done ? "check" : "arrow" }) })
      ]
    }
  );
}

// packages/web/src/patterns/motion-task-list.tsx
import { Fragment as Fragment3, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed"
};
function TaskLine({ task }) {
  const showState = task.state === "failed";
  return /* @__PURE__ */ jsxs9(Fragment3, { children: [
    /* @__PURE__ */ jsx9("span", { className: "yg-task-marker", "aria-hidden": "true", children: task.state === "done" ? /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx9("path", { pathLength: "1", d: "M5 12.5l4.2 4.2L19 7" }) }) : task.state === "failed" ? /* @__PURE__ */ jsx9(Icon, { name: "close" }) : null }),
    /* @__PURE__ */ jsx9("span", { className: "yg-task-copy", children: /* @__PURE__ */ jsx9("strong", { children: task.label }) }),
    /* @__PURE__ */ jsxs9("span", { className: "yg-task-meta", children: [
      task.detail && !showState && /* @__PURE__ */ jsx9("span", { className: "yg-task-note", children: task.detail }),
      /* @__PURE__ */ jsx9("span", { className: showState ? "yg-task-state" : "yg-task-sr", children: stateName[task.state] })
    ] })
  ] });
}
function TaskList({ label, tasks }) {
  const complete = tasks.filter((task) => task.state === "done").length;
  const active = tasks.find((task) => task.state === "running")?.id;
  return /* @__PURE__ */ jsxs9("section", { className: "yg-task-list", "aria-label": label, children: [
    /* @__PURE__ */ jsxs9("header", { children: [
      /* @__PURE__ */ jsx9("strong", { children: label }),
      /* @__PURE__ */ jsxs9("span", { role: "status", children: [
        /* @__PURE__ */ jsxs9("span", { className: "yg-task-sr", children: [
          complete,
          " of ",
          tasks.length,
          " done"
        ] }),
        /* @__PURE__ */ jsxs9("span", { "aria-hidden": "true", children: [
          complete,
          "/",
          tasks.length
        ] })
      ] })
    ] }),
    tasks.length === 0 && /* @__PURE__ */ jsx9("p", { className: "yg-help", children: "No steps yet." }),
    /* @__PURE__ */ jsx9("ol", { children: tasks.map((task) => /* @__PURE__ */ jsx9("li", { "data-state": task.state, "data-active": active === task.id || void 0, children: task.steps?.length ? /* @__PURE__ */ jsxs9("details", { open: true, children: [
      /* @__PURE__ */ jsx9("summary", { className: "yg-task-line", children: /* @__PURE__ */ jsx9(TaskLine, { task }) }),
      /* @__PURE__ */ jsx9("ol", { className: "yg-task-children", children: task.steps.map((step) => /* @__PURE__ */ jsx9("li", { "data-state": step.state, className: "yg-task-line", children: /* @__PURE__ */ jsx9(TaskLine, { task: step }) }, step.id)) })
    ] }) : /* @__PURE__ */ jsx9("div", { className: "yg-task-line", children: /* @__PURE__ */ jsx9(TaskLine, { task }) }) }, task.id)) })
  ] });
}

// packages/web/src/patterns/motion-cart.tsx
import { useEffect as useEffect2, useLayoutEffect as useLayoutEffect2, useRef as useRef5, useState as useState8 } from "react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var holdDelay = 380;
var initialRepeat = 150;
var minimumRepeat = 55;
var limitNoticeDuration = 1600;
function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef5(count);
  const goingDown = count < previous.current;
  const lastCount = previous.current;
  useLayoutEffect2(() => {
    previous.current = count;
  }, [count]);
  const [showLimit, setShowLimit] = useState8(false);
  const notice = useRef5(void 0);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef5({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef5(null);
  const pointer = useRef5(void 0);
  const timer = useRef5(void 0);
  const skipClick = useRef5(false);
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
  return /* @__PURE__ */ jsxs10(
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
        /* @__PURE__ */ jsx10("span", { className: "yg-cart-limit", role: "status", children: showLimit && reachedLimit ? `Limit ${limit} per order` : null }),
        /* @__PURE__ */ jsxs10("div", { className: "yg-cart-stepper", children: [
          /* @__PURE__ */ jsx10(
            "button",
            {
              type: "button",
              className: "yg-cart-decrease",
              hidden: !open,
              "aria-label": count === 1 ? `Remove ${label}` : `Decrease quantity of ${label}`,
              ...pointerHandlers,
              onPointerDown: (event) => start(event, -1),
              onClick: (event) => activate(-1, event.detail),
              children: /* @__PURE__ */ jsx10(
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
                  children: /* @__PURE__ */ jsx10("path", { d: count === 1 ? "M4 6h16M9 6V4h6v2m3 0-1 14H7L6 6m4 4v6m4-6v6" : "M5 12h14" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx10("output", { className: "yg-cart-quantity", "aria-label": `Quantity of ${label}`, "data-quantity": count, hidden: !open, children: /* @__PURE__ */ jsxs10("span", { className: "yg-cart-roll", "data-direction": goingDown ? "down" : "up", children: [
            lastCount !== count && lastCount > 0 && /* @__PURE__ */ jsx10("span", { className: "yg-cart-previous", "aria-hidden": "true", children: lastCount }),
            /* @__PURE__ */ jsx10("span", { className: "yg-cart-current", children: count })
          ] }, count) }),
          /* @__PURE__ */ jsxs10(
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
                !open && /* @__PURE__ */ jsx10("span", { children: addLabel }),
                /* @__PURE__ */ jsx10(Icon, { name: "plus" })
              ]
            }
          )
        ] })
      ]
    }
  );
}
export {
  ActivityIsland,
  CartButton,
  CheckboxList,
  CommandButton,
  CopyButton,
  DetentDial,
  ExpandCard,
  FanCards,
  FileDrop,
  FocusPicker,
  GhostSuggestion,
  HoldButton,
  LetterLimit,
  LoadingSuccessButton,
  MentionPicker,
  MorphTooltip,
  PasswordStrength,
  PlanSwitch,
  ProfileCard,
  PromptBox,
  RangeSlider,
  SlideConfirm,
  SpringDropdown,
  StatCard,
  StorageMeter,
  StreamingReply,
  TaskList,
  ThinkingIndicator
};
