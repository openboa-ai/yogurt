"use client";
"use client";
import {
  Command
} from "./shared/chunk-KYXPXNTR.js";
import "./shared/chunk-UNNWL6Q6.js";
import "./shared/chunk-FXLGRFQX.js";
import "./shared/chunk-5GJUJT3P.js";
import {
  dist_exports10 as dist_exports
} from "./shared/chunk-PLMP3L2O.js";
import {
  Button
} from "./shared/chunk-A323HUK4.js";
import {
  Icon
} from "./shared/chunk-RUS3W4HJ.js";

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
          rows: 3,
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
      /* @__PURE__ */ jsxs("span", { className: "yg-mention-hint", id: `${id}-hint`, children: [
        /* @__PURE__ */ jsx("kbd", { children: "@" }),
        " Mention someone"
      ] }),
      open && /* @__PURE__ */ jsxs("div", { id: `${id}-list`, className: "yg-mention-list", role: "listbox", "aria-label": "People", children: [
        /* @__PURE__ */ jsxs("div", { className: "yg-mention-list-heading", role: "presentation", children: [
          "People ",
          /* @__PURE__ */ jsx("span", { children: options.length })
        ] }),
        options.map((person, i) => /* @__PURE__ */ jsxs("button", { id: `${id}-option-${i}`, role: "option", "aria-selected": i === index, type: "button", onMouseDown: (event) => event.preventDefault(), onClick: () => select(person), children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: Array.from(person.label)[0]?.toLocaleUpperCase() }),
          person.label
        ] }, person.id))
      ] })
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
  function receive(files) {
    if (!files.length) return;
    const allowed = files.filter((file) => acceptsFile(file, accept));
    const selected = multiple ? allowed : allowed.slice(0, 1);
    const rejected = files.length - selected.length;
    setMessage(rejected ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added${accept ? ` (accepted: ${accept})` : ""}.` : `${selected.length} ${selected.length === 1 ? "file" : "files"} selected.`);
    if (selected.length) onFiles(selected);
  }
  const formats = accept?.split(",").map((rule) => rule.trim()).filter(Boolean).map((rule) => rule.endsWith("/*") ? rule.split("/")[0] + " files" : (rule.split("/").at(-1) ?? rule).replace(/^\./, "").toUpperCase()).join(", ");
  return /* @__PURE__ */ jsxs("div", { className: "yg-file-drop-wrap", children: [
    /* @__PURE__ */ jsx("span", { className: "yg-label", id: `${id}-label`, children: label }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "yg-file-drop",
        "data-dragging": dragging || void 0,
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
          /* @__PURE__ */ jsx(
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
          ),
          /* @__PURE__ */ jsxs("div", { className: "yg-file-drop-copy", children: [
            /* @__PURE__ */ jsx("strong", { children: "Drop files here" }),
            formats && /* @__PURE__ */ jsx("span", { id: `${id}-formats`, children: formats })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "yg-file-drop-button", htmlFor: id, children: [
            "Choose ",
            multiple ? "files" : "a file"
          ] }),
          /* @__PURE__ */ jsx("input", { id, type: "file", "aria-labelledby": `${id}-label`, "aria-describedby": formats ? `${id}-formats` : void 0, accept, multiple, onChange: (event) => {
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
function LetterLimit({ label, value, onChange, limit }) {
  const id = useId2();
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  return /* @__PURE__ */ jsxs2("div", { className: "yg-letter-limit", "data-near": remaining <= Math.max(10, maximum * 0.1) || void 0, children: [
    /* @__PURE__ */ jsx2("label", { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxs2("div", { className: "yg-letter-field", children: [
      /* @__PURE__ */ jsx2("textarea", { id, value, maxLength: maximum, onChange: (event) => onChange(event.currentTarget.value), "aria-describedby": `${id}-count` }),
      /* @__PURE__ */ jsx2("div", { className: "yg-letter-meter", "aria-hidden": "true", children: /* @__PURE__ */ jsx2("span", { style: { width: `${maximum ? Math.min(100, value.length / maximum * 100) : 0}%` } }) })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: "yg-letter-count", id: `${id}-count`, children: remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining` })
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
        /* @__PURE__ */ jsx3("span", { id, role: "tooltip", className: "yg-morph-tooltip-card", "data-open": open, hidden: !open, children: /* @__PURE__ */ jsx3("span", { children: detail }) })
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
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "aria-hidden": "true", children: "\u25C6" }),
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-value", children: /* @__PURE__ */ jsx3(dist_exports.Value, { placeholder: "Choose an option" }) }),
        /* @__PURE__ */ jsx3(dist_exports.Icon, { className: "yg-spring-chevron", "aria-hidden": "true", children: "\u2304" })
      ] }),
      /* @__PURE__ */ jsx3(dist_exports.Portal, { container: portal, children: /* @__PURE__ */ jsx3(dist_exports.Content, { className: "yg-spring-menu", position: "popper", sideOffset: 6, children: /* @__PURE__ */ jsx3(dist_exports.Viewport, { className: "yg-spring-viewport", children: options.map((option) => /* @__PURE__ */ jsxs3(dist_exports.Item, { value: option.id, className: "yg-spring-option", children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-option-symbol", "aria-hidden": "true", children: "\u25C6" }),
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
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function StorageMeter({ label, used, capacity, unit }) {
  const id = useId4();
  const known = Number.isFinite(used) && Number.isFinite(capacity) && capacity > 0 && used >= 0;
  const ratio = known ? Math.min(1, used / capacity) : 0;
  const ticks = 24;
  return /* @__PURE__ */ jsxs4("div", { className: "yg-storage-meter", "data-full": ratio === 1 || void 0, children: [
    /* @__PURE__ */ jsx4("strong", { id, className: "yg-storage-heading", children: label }),
    known ? /* @__PURE__ */ jsxs4("div", { className: "yg-storage-amount", children: [
      /* @__PURE__ */ jsxs4("strong", { children: [
        used,
        " ",
        unit
      ] }),
      /* @__PURE__ */ jsxs4("span", { children: [
        "of ",
        capacity,
        " ",
        unit
      ] })
    ] }) : /* @__PURE__ */ jsx4("span", { className: "yg-help", children: "Capacity unavailable" }),
    known && /* @__PURE__ */ jsx4(
      "div",
      {
        className: "yg-storage-ticks",
        role: "meter",
        "aria-labelledby": id,
        "aria-valuemin": 0,
        "aria-valuemax": capacity,
        "aria-valuenow": Math.min(used, capacity),
        "aria-valuetext": `${used} of ${capacity} ${unit} used`,
        children: Array.from({ length: ticks }, (_, index) => /* @__PURE__ */ jsx4("span", { "data-filled": index + 0.5 <= ratio * ticks || void 0 }, index))
      }
    )
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
import { useId as useId5, useRef as useRef2, useState as useState4 } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function StreamingReply({ value, active = false }) {
  return /* @__PURE__ */ jsxs5("div", { className: "yg-streaming-reply", "aria-busy": active || void 0, children: [
    /* @__PURE__ */ jsx5("span", { children: value }),
    active && /* @__PURE__ */ jsx5("span", { className: "yg-streaming-cursor", "aria-hidden": "true" })
  ] });
}
function GhostSuggestion({ value, suggestion, onChange }) {
  const id = useId5();
  const [atEnd, setAtEnd] = useState4(true);
  const mirror = useRef2(null);
  const suffix = value && suggestion.startsWith(value) ? suggestion.slice(value.length) : "";
  const show = atEnd && !!suffix;
  return /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-field", children: [
    /* @__PURE__ */ jsx5("label", { htmlFor: id, children: "Your message" }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-input", children: [
      /* @__PURE__ */ jsxs5("div", { ref: mirror, className: "yg-ghost-mirror", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx5("span", { children: value }),
        show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-suffix", children: suffix })
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
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-editor", "data-value": value, children: /* @__PURE__ */ jsx5(
          "textarea",
          {
            "aria-label": "Prompt",
            placeholder: "Ask anything",
            rows: 1,
            value,
            onChange: (event) => onChange(event.currentTarget.value)
          }
        ) }),
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-actions", children: /* @__PURE__ */ jsx5(
          "button",
          {
            className: "yg-prompt-action",
            type: busy && onCancel ? "button" : "submit",
            "aria-label": busy && onCancel ? "Stop" : "Send",
            "data-busy": busy || void 0,
            disabled: busy ? !onCancel : !value.trim(),
            onClick: busy && onCancel ? onCancel : void 0,
            children: /* @__PURE__ */ jsx5("span", { className: "yg-prompt-action-mark", "aria-hidden": "true", children: busy && onCancel ? /* @__PURE__ */ jsx5("svg", { viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx5("rect", { x: "4", y: "4", width: "8", height: "8", rx: "1.5", fill: "currentColor" }) }) : /* @__PURE__ */ jsx5("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx5("path", { d: "M8 12V4M4.5 7.5 8 4l3.5 3.5" }) }) })
          }
        ) })
      ]
    }
  );
}
function ThinkingIndicator({ label = "Thinking", active = true }) {
  if (!active) return null;
  return /* @__PURE__ */ jsxs5("div", { className: "yg-thinking", role: "status", children: [
    /* @__PURE__ */ jsx5("span", { className: "yg-thinking-shape", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx5("span", { children: label })
  ] });
}

// packages/web/src/patterns/motion-cards.tsx
import { useState as useState5 } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function ExpandCard({ title, children }) {
  return /* @__PURE__ */ jsxs6("details", { className: "yg-expand-card", children: [
    /* @__PURE__ */ jsxs6("summary", { children: [
      /* @__PURE__ */ jsx6("span", { children: title }),
      /* @__PURE__ */ jsx6("span", { className: "yg-card-disclosure", children: /* @__PURE__ */ jsx6(Icon, { name: "plus" }) })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "yg-expand-card-body", children })
  ] });
}
function FanCards({ items }) {
  const [selectedId, setSelectedId] = useState5(null);
  const selected = items.find((item) => item.id === selectedId);
  return /* @__PURE__ */ jsxs6("div", { className: "yg-fan-cards", children: [
    /* @__PURE__ */ jsx6("div", { className: "yg-fan-cards-list", "aria-label": "Cards", children: items.map((item, index) => /* @__PURE__ */ jsxs6(
      "button",
      {
        type: "button",
        "aria-pressed": item.id === selected?.id,
        onClick: () => setSelectedId(item.id === selectedId ? null : item.id),
        children: [
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
  return /* @__PURE__ */ jsxs6("section", { className: "yg-stat-card", "aria-label": label, children: [
    /* @__PURE__ */ jsx6("span", { className: "yg-stat-label", children: label }),
    /* @__PURE__ */ jsx6("strong", { className: "yg-stat-value", children: value.toLocaleString() }, value),
    detail && /* @__PURE__ */ jsx6("span", { className: "yg-stat-detail", children: detail })
  ] });
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
import { useId as useId6 } from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function RangeSlider({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  const id = useId6();
  const percent = max > min ? Math.max(0, Math.min(100, (value - min) / (max - min) * 100)) : 0;
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range", children: [
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range-heading", children: [
      /* @__PURE__ */ jsx7("label", { htmlFor: id, children: label }),
      /* @__PURE__ */ jsx7("output", { htmlFor: id, children: value })
    ] }),
    /* @__PURE__ */ jsx7("input", { id, type: "range", min, max, step, value, onChange: (event) => onChange(event.currentTarget.valueAsNumber), style: { "--yg-range-fill": `${percent}%` } }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-range-ends", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx7("span", { children: min }),
      /* @__PURE__ */ jsx7("span", { children: max })
    ] })
  ] });
}
function PasswordStrength({ value, onChange }) {
  const id = useId6();
  const checks = [
    { label: "8 or more characters", passed: value.length >= 8 },
    { label: "Uppercase and lowercase", passed: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "A number or symbol", passed: /[^a-zA-Z]/.test(value) }
  ];
  const count = checks.filter((check) => check.passed).length;
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password", children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: "Password" }),
    /* @__PURE__ */ jsx7("input", { id, type: "password", autoComplete: "new-password", value, onChange: (event) => onChange(event.currentTarget.value), "aria-describedby": `${id}-checks` }),
    /* @__PURE__ */ jsx7("div", { className: "yg-motion-password-meter", "aria-hidden": "true", children: checks.map((check, index) => /* @__PURE__ */ jsx7("span", { "data-active": index < count || void 0 }, check.label)) }),
    /* @__PURE__ */ jsxs7("div", { id: `${id}-checks`, className: "yg-motion-password-checks", children: [
      /* @__PURE__ */ jsxs7("span", { children: [
        "Local input checks: ",
        count,
        " of ",
        checks.length,
        " met"
      ] }),
      /* @__PURE__ */ jsx7("ul", { children: checks.map((check) => /* @__PURE__ */ jsxs7("li", { "data-passed": check.passed || void 0, children: [
        /* @__PURE__ */ jsx7("span", { "aria-hidden": "true", children: check.passed ? "\u2713" : "\u25CB" }),
        " ",
        check.label,
        ": ",
        check.passed ? "met" : "not met"
      ] }, check.label)) })
    ] })
  ] });
}
function CheckboxList({ options, value, onChange }) {
  return /* @__PURE__ */ jsxs7("fieldset", { className: "yg-motion-checklist", children: [
    /* @__PURE__ */ jsx7("legend", { children: "Choose options" }),
    options.map((option) => /* @__PURE__ */ jsxs7("label", { className: "yg-motion-checklist-item", children: [
      /* @__PURE__ */ jsx7("input", { type: "checkbox", checked: value.includes(option.id), onChange: (event) => onChange(event.currentTarget.checked ? [...value, option.id] : value.filter((id) => id !== option.id)) }),
      /* @__PURE__ */ jsx7("span", { children: option.label })
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
import { useEffect, useRef as useRef3, useState as useState6 } from "react";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var HOLD_MS = 1e3;
function HoldButton({ label, onConfirm }) {
  const [progress, setProgress] = useState6(0);
  const [armed, setArmed] = useState6(false);
  const active = useRef3(null);
  const frame = useRef3(null);
  const callback = useRef3(onConfirm);
  callback.current = onConfirm;
  const cancel = () => {
    active.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setProgress(0);
  };
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);
  const start = (event) => {
    if (!event.isPrimary || event.button !== 0 || active.current !== null) return;
    setArmed(false);
    active.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const started = performance.now();
    const tick = (now) => {
      if (active.current === null) return;
      const next = Math.min(1, (now - started) / HOLD_MS);
      setProgress(next);
      if (next === 1) {
        active.current = null;
        frame.current = null;
        callback.current();
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return /* @__PURE__ */ jsxs8(
    "button",
    {
      type: "button",
      className: "yg-hold-confirm",
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
        if (event.detail !== 0) return;
        if (armed) {
          setArmed(false);
          callback.current();
        } else setArmed(true);
      },
      children: [
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-label", children: armed ? `Confirm ${label}` : label })
      ]
    }
  );
}
function SlideConfirm({ label, onConfirm }) {
  const [progress, setProgress] = useState6(0);
  const [armed, setArmed] = useState6(false);
  const active = useRef3(null);
  const value = useRef3(0);
  const reset = () => {
    active.current = null;
    value.current = 0;
    setProgress(0);
  };
  const update = (event) => {
    const drag = active.current;
    if (!drag || drag.id !== event.pointerId) return;
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) / drag.width));
    setProgress(value.current);
  };
  return /* @__PURE__ */ jsxs8(
    "button",
    {
      type: "button",
      className: "yg-slide-confirm",
      style: { "--yg-confirm-progress": progress },
      onPointerDown: (event) => {
        if (!event.isPrimary || event.button !== 0 || active.current) return;
        setArmed(false);
        const handle = event.currentTarget.querySelector(".yg-slide-confirm-handle");
        const width = event.currentTarget.clientWidth - (handle?.offsetWidth ?? 0);
        if (width <= 0) return;
        active.current = { id: event.pointerId, start: event.clientX, width };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: update,
      onPointerUp: (event) => {
        if (active.current?.id !== event.pointerId) return;
        update(event);
        const complete = value.current >= 0.95;
        reset();
        if (complete) onConfirm();
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
        if (event.detail !== 0) return;
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      },
      children: [
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-label", children: armed ? `Confirm ${label}` : label }),
        /* @__PURE__ */ jsx8("span", { className: "yg-slide-confirm-handle", "aria-hidden": "true", children: "\u2192" })
      ]
    }
  );
}

// packages/web/src/patterns/motion-task-list.tsx
import { Fragment, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed"
};
function TaskLine({ task }) {
  return /* @__PURE__ */ jsxs9(Fragment, { children: [
    /* @__PURE__ */ jsx9("span", { className: "yg-task-marker", "aria-hidden": "true", children: task.state === "done" ? /* @__PURE__ */ jsx9("svg", { viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx9("path", { pathLength: "1", d: "M5 12.5l4.2 4.2L19 7" }) }) : task.state === "failed" ? /* @__PURE__ */ jsx9(Icon, { name: "close" }) : /* @__PURE__ */ jsx9("span", {}) }),
    /* @__PURE__ */ jsxs9("span", { className: "yg-task-copy", children: [
      /* @__PURE__ */ jsx9("strong", { children: task.label }),
      task.detail && /* @__PURE__ */ jsx9("span", { className: "yg-help", children: task.detail })
    ] }),
    /* @__PURE__ */ jsx9("span", { className: "yg-task-state", children: stateName[task.state] })
  ] });
}
function TaskList({ label, tasks }) {
  const complete = tasks.filter((task) => task.state === "done").length;
  const active = tasks.find((task) => task.state === "running")?.id;
  return /* @__PURE__ */ jsxs9("section", { className: "yg-task-list", "aria-label": label, children: [
    /* @__PURE__ */ jsxs9("header", { children: [
      /* @__PURE__ */ jsx9("strong", { children: label }),
      /* @__PURE__ */ jsxs9("span", { role: "status", children: [
        complete,
        " of ",
        tasks.length,
        " done"
      ] })
    ] }),
    tasks.length > 0 ? /* @__PURE__ */ jsx9("div", { className: "yg-task-progress", "aria-hidden": "true", children: tasks.map((task) => /* @__PURE__ */ jsx9("span", { "data-state": task.state }, task.id)) }) : /* @__PURE__ */ jsx9("p", { className: "yg-help", children: "No steps yet." }),
    /* @__PURE__ */ jsx9("ol", { children: tasks.map((task) => /* @__PURE__ */ jsx9("li", { "data-state": task.state, "data-active": active === task.id || void 0, children: task.steps?.length ? /* @__PURE__ */ jsxs9("details", { children: [
      /* @__PURE__ */ jsxs9("summary", { className: "yg-task-line", children: [
        /* @__PURE__ */ jsx9(TaskLine, { task }),
        /* @__PURE__ */ jsx9(Icon, { name: "down" })
      ] }),
      /* @__PURE__ */ jsx9("ol", { className: "yg-task-children", children: task.steps.map((step) => /* @__PURE__ */ jsx9("li", { "data-state": step.state, className: "yg-task-line", children: /* @__PURE__ */ jsx9(TaskLine, { task: step }) }, step.id)) })
    ] }) : /* @__PURE__ */ jsx9("div", { className: "yg-task-line", children: /* @__PURE__ */ jsx9(TaskLine, { task }) }) }, task.id)) })
  ] });
}

// packages/web/src/patterns/motion-cart.tsx
import { useEffect as useEffect2, useLayoutEffect, useRef as useRef4, useState as useState7 } from "react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var holdDelay = 380;
var initialRepeat = 150;
var minimumRepeat = 55;
var limitNoticeDuration = 1600;
function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef4(count);
  const goingDown = count < previous.current;
  useLayoutEffect(() => {
    previous.current = count;
  }, [count]);
  const [showLimit, setShowLimit] = useState7(false);
  const notice = useRef4(void 0);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef4({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef4(null);
  const pointer = useRef4(void 0);
  const timer = useRef4(void 0);
  const skipClick = useRef4(false);
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
          /* @__PURE__ */ jsx10("output", { className: "yg-cart-quantity", "aria-label": `Quantity of ${label}`, hidden: !open, children: /* @__PURE__ */ jsx10("span", { "data-direction": goingDown ? "down" : "up", children: count }, count) }),
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
