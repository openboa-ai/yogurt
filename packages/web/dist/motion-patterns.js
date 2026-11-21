"use client";
"use client";
import {
  CartButton,
  ExpandCard,
  FanCards,
  HoldButton,
  ProfileCard,
  SlideConfirm,
  StatCard
} from "./shared/chunk-GMWNRVEV.js";
import {
  MentionOptions,
  PromptAction,
  PromptEditor,
  useMention
} from "./shared/chunk-LKB52XNS.js";
import {
  Command
} from "./shared/chunk-ZUN2HDKK.js";
import {
  Slider
} from "./shared/chunk-CWY6JECX.js";
import {
  ActivityIsland,
  CopyButton,
  LoadingSuccessButton,
  StorageMeter,
  advanceSprings,
  snap,
  spring
} from "./shared/chunk-ALIDK7RZ.js";
import {
  dist_exports7 as dist_exports
} from "./shared/chunk-F374JVJP.js";
import "./shared/chunk-Y34L4C5K.js";
import {
  Checkbox,
  Textarea
} from "./shared/chunk-72QPUJK5.js";
import "./shared/chunk-5GJUJT3P.js";
import {
  Button
} from "./shared/chunk-4IPCB3MM.js";
import {
  Icon
} from "./shared/chunk-GW3HPY4O.js";
import "./shared/chunk-5ZXHC2QO.js";

// packages/web/src/patterns/motion-inputs.tsx
import { useId, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function MentionPicker({ label, people, value, onChange }) {
  const mention = useMention({ people, value, onChange });
  return /* @__PURE__ */ jsxs("div", { className: "yg-mention", children: [
    /* @__PURE__ */ jsx("label", { className: "yg-label", htmlFor: mention.id, children: label }),
    /* @__PURE__ */ jsxs("div", { className: "yg-mention-surface", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: mention.id,
          ref: mention.input,
          value,
          rows: 2,
          placeholder: "Write a comment",
          "aria-describedby": `${mention.id}-hint`,
          ...mention.editorProps
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "yg-mention-hint", id: `${mention.id}-hint`, children: "Type @ to mention" }),
      /* @__PURE__ */ jsx(MentionOptions, { mention })
    ] })
  ] });
}
function acceptsFile(file, accept) {
  const rules = accept?.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return rules.some((rule) => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}
function FileDrop({ label, onFiles, accept, multiple = false, progress }) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const percent = accepted && progress !== void 0 && Number.isFinite(progress) ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : null;
  const processing = percent !== null && percent < 100;
  const complete = accepted && !processing;
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
        "data-processing": processing || void 0,
        "data-accepted": complete || void 0,
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
          /* @__PURE__ */ jsxs("span", { className: "yg-file-drop-core", children: [
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
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "yg-file-drop-check",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2.2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": "true",
                children: /* @__PURE__ */ jsx("path", { d: "m5 12.5 4.5 4.5L19 7.5", pathLength: "24" })
              }
            ),
            percent !== null && /* @__PURE__ */ jsxs(
              "span",
              {
                className: "yg-file-drop-progress",
                "data-complete": !processing || void 0,
                role: "progressbar",
                "aria-label": "Preparing selected files",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": percent,
                "aria-hidden": !processing || void 0,
                children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 72 72", "aria-hidden": "true", children: /* @__PURE__ */ jsx("circle", { cx: "36", cy: "36", r: "33", pathLength: "100", style: { strokeDashoffset: 100 - percent } }) }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    percent,
                    "%"
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "yg-file-drop-copy", children: [
            /* @__PURE__ */ jsx("strong", { children: processing ? "Preparing files" : complete ? "Files selected" : "Drop files here" }, processing ? "processing" : complete ? "complete" : "idle"),
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
import { useEffect, useId as useId2, useRef as useRef2, useState as useState2 } from "react";
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
  const editor = useRef2(null);
  const end = useRef2(null);
  const [rejected, setRejected] = useState2();
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  const progress = maximum > 0 ? Math.min(1, value.length / maximum) : 0;
  const state = remaining <= 0 ? "full" : remaining <= Math.max(10, maximum * 0.1) ? "near" : "normal";
  useEffect(() => {
    const field = editor.current;
    const card = field?.parentElement;
    if (!field || !card) return;
    const reject = (text) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const space = Math.max(0, maximum - field.value.length + field.selectionEnd - field.selectionStart);
      const letters = Array.from(text.slice(space, space + 24)).filter((letter) => letter.trim()).slice(0, 12);
      const marker = end.current?.getBoundingClientRect();
      if (!letters.length || !marker) return;
      const frame = card.getBoundingClientRect();
      const y = Math.max(field.offsetTop, marker.top - frame.top - field.scrollTop);
      const floor = Math.min(frame.height + 46, innerHeight - frame.top - 14);
      setRejected((previous) => ({
        key: (previous?.key ?? 0) + 1,
        letters,
        x: marker.left - frame.left,
        y,
        fall: Math.max(0, floor - y)
      }));
    };
    const insert = (event) => {
      if (!event.isComposing && event.inputType !== "insertFromPaste" && event.data) reject(event.data);
    };
    const paste = (event) => reject(event.clipboardData?.getData("text/plain") ?? "");
    field.addEventListener("beforeinput", insert);
    field.addEventListener("paste", paste);
    return () => {
      field.removeEventListener("beforeinput", insert);
      field.removeEventListener("paste", paste);
    };
  }, [maximum]);
  return /* @__PURE__ */ jsxs2("div", { className: "yg-letter-limit", "data-limit-state": state, children: [
    /* @__PURE__ */ jsx2(
      "textarea",
      {
        ref: editor,
        id,
        "aria-label": label,
        placeholder,
        value,
        maxLength: maximum,
        onChange: (event) => {
          if (event.currentTarget.value.length < value.length) setRejected(void 0);
          onChange(event.currentTarget.value);
        },
        "aria-describedby": `${id}-count`
      }
    ),
    /* @__PURE__ */ jsxs2("span", { className: "yg-letter-measure", "aria-hidden": "true", children: [
      value,
      /* @__PURE__ */ jsx2("span", { ref: end, children: "\u200B" })
    ] }),
    rejected && /* @__PURE__ */ jsx2(
      "span",
      {
        className: "yg-letter-rejected",
        "aria-hidden": "true",
        style: { left: rejected.x, top: rejected.y, "--yg-letter-fall": `${rejected.fall}px` },
        children: rejected.letters.map((letter, index) => /* @__PURE__ */ jsx2("span", { style: {
          "--yg-letter-order": index,
          "--yg-letter-drift": `${(index % 5 - 2) * 12}px`
        }, children: letter }, index))
      },
      rejected.key
    ),
    /* @__PURE__ */ jsxs2("div", { className: "yg-letter-footer", children: [
      /* @__PURE__ */ jsxs2("svg", { className: "yg-letter-meter", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9.5" }),
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9.5", pathLength: "1", strokeDasharray: "1 1", strokeDashoffset: 1 - progress })
      ] }),
      /* @__PURE__ */ jsx2("span", { className: "yg-letter-count", id: `${id}-count`, children: remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining` }),
      onSubmit && /* @__PURE__ */ jsx2(Button, { onClick: () => {
        setRejected(void 0);
        onSubmit(value);
      }, disabled: remaining < 0 || !value.trim(), children: "Post" })
    ] })
  ] });
}

// packages/web/src/patterns/motion-layers.tsx
import { useId as useId3, useState as useState3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function MorphTooltip({ label, detail }) {
  const id = useId3();
  const [hovered, setHovered] = useState3(false);
  const [focused, setFocused] = useState3(false);
  const [dismissed, setDismissed] = useState3(false);
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
  const [portal, setPortal] = useState3(null);
  const [open, setOpen] = useState3(false);
  const selected = options.find((option) => option.id === value);
  const settledStyle = {
    "--yg-picker-open": 1,
    "--yg-picker-opacity": 1,
    "--yg-picker-row": 1,
    "--yg-picker-chevron-now": open ? "180deg" : "0deg"
  };
  return /* @__PURE__ */ jsxs3("div", { ref: setPortal, className: "yg-spring-dropdown", "data-open": open, "data-value": value, style: settledStyle, children: [
    /* @__PURE__ */ jsx3("label", { id, className: "yg-spring-label", children: label }),
    /* @__PURE__ */ jsxs3(dist_exports.Root, { value, onValueChange: onChange, open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxs3(dist_exports.Trigger, { className: "yg-spring-trigger", "aria-labelledby": id, children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-value", children: /* @__PURE__ */ jsxs3("span", { className: "yg-spring-value-roll", children: [
          /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "data-marker": selected?.marker, "aria-hidden": "true" }),
          /* @__PURE__ */ jsx3("span", { className: "yg-spring-value-label", children: /* @__PURE__ */ jsx3(dist_exports.Value, { placeholder: "Choose an option" }) })
        ] }, value) }),
        /* @__PURE__ */ jsx3(dist_exports.Icon, { asChild: true, children: /* @__PURE__ */ jsx3(
          "svg",
          {
            className: "yg-spring-chevron",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx3("path", { d: "m6 9 6 6 6-6" })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx3(dist_exports.Portal, { container: portal, children: /* @__PURE__ */ jsx3(dist_exports.Content, { className: "yg-spring-menu", style: { animation: "none" }, position: "popper", sideOffset: 8, collisionPadding: 16, children: /* @__PURE__ */ jsx3(dist_exports.Viewport, { className: "yg-spring-viewport", children: options.map((option) => /* @__PURE__ */ jsxs3(dist_exports.Item, { value: option.id, className: "yg-spring-option", children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "data-marker": option.marker, "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3(dist_exports.ItemText, { children: option.label }),
        /* @__PURE__ */ jsx3(
          "svg",
          {
            className: "yg-spring-check",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2.2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
            children: /* @__PURE__ */ jsx3("path", { d: "m5 12.5 4.5 4.5L19 7.5", pathLength: "22" })
          }
        )
      ] }, option.id)) }) }) })
    ] })
  ] });
}
function CommandButton({ label, items, onSelect }) {
  return /* @__PURE__ */ jsx3("div", { className: "yg-command-button", children: /* @__PURE__ */ jsx3(Command, { label, items, onSelect }) });
}

// packages/web/src/patterns/tooltip-bar.tsx
import { useEffect as useEffect2, useId as useId4, useLayoutEffect, useRef as useRef3, useState as useState4 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function MorphTooltipBar({ label, tools, value, onChange }) {
  const id = useId4();
  const bar = useRef3(null);
  const hide = useRef3(void 0);
  const [active, setActive] = useState4(null);
  useEffect2(() => () => clearTimeout(hide.current), []);
  useLayoutEffect(() => {
    const root = bar.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll("button[data-tool]"));
    const labels = Array.from(root.querySelectorAll("[data-tooltip-label]"));
    const arrange = () => {
      const current = buttons.findIndex((button) => button.dataset.tool === active);
      const selected = buttons[current], description = labels[current];
      root.style.setProperty("--yg-tooltip-open", String(Number(Boolean(selected && description))));
      labels.forEach((node) => {
        node.style.setProperty("--yg-tooltip-copy", String(Number(node.dataset.tooltipLabel === active)));
        node.style.setProperty("--yg-tooltip-copy-x", "0px");
      });
      if (!selected || !description) return;
      const center = selected.offsetLeft + selected.offsetWidth / 2;
      const half = Math.min(description.offsetWidth / 2, root.clientWidth / 2);
      const left = Math.min(root.clientWidth - half * 2, Math.max(0, center - half));
      const width = Math.max(30, half * 2);
      const start = Math.min(Math.max(0, left), Math.max(0, root.clientWidth - width));
      const tail = Math.max(start + 8, Math.min(start + width - 8, center));
      root.style.setProperty("--yg-tooltip-left", `${start}px`);
      root.style.setProperty("--yg-tooltip-width", `${width}px`);
      root.style.setProperty("--yg-tooltip-tail", `${tail}px`);
      root.style.setProperty("--yg-tooltip-marker", `${selected.offsetLeft}px`);
      root.style.setProperty("--yg-tooltip-marker-width", `${selected.offsetWidth}px`);
    };
    arrange();
    const resize = new ResizeObserver(arrange);
    resize.observe(root);
    labels.forEach((node) => resize.observe(node));
    return () => resize.disconnect();
  }, [active, tools]);
  function reveal(tool) {
    clearTimeout(hide.current);
    setActive(tool);
  }
  function leave() {
    clearTimeout(hide.current);
    hide.current = setTimeout(() => setActive(null), 140);
  }
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: "yg-tooltip-bar",
      ref: bar,
      role: "toolbar",
      "aria-label": label,
      style: { gridTemplateColumns: `repeat(${Math.max(1, tools.length)}, minmax(0, 1fr))` },
      onPointerLeave: leave,
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) leave();
      },
      onKeyDown: (event) => {
        if (event.key !== "Escape") return;
        clearTimeout(hide.current);
        setActive(null);
      },
      children: [
        /* @__PURE__ */ jsx4("span", { className: "yg-tooltip-bar-marker", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx4("span", { className: "yg-tooltip-bar-tail", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx4("span", { className: "yg-tooltip-bar-bubble", id, role: "tooltip", "aria-hidden": active === null, children: tools.map((tool) => /* @__PURE__ */ jsx4("span", { "data-tooltip-label": tool.id, "aria-hidden": tool.id !== active, children: tool.detail }, tool.id)) }),
        tools.map((tool) => /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            "data-tool": tool.id,
            "aria-label": tool.label,
            "aria-pressed": value === tool.id,
            "aria-describedby": active === tool.id ? id : void 0,
            onPointerEnter: () => reveal(tool.id),
            onFocus: () => reveal(tool.id),
            onClick: () => {
              reveal(tool.id);
              onChange(tool.id);
            },
            children: /* @__PURE__ */ jsx4(Icon, { name: tool.icon })
          },
          tool.id
        ))
      ]
    }
  );
}

// packages/web/src/patterns/motion-conversation.tsx
import { useId as useId5, useLayoutEffect as useLayoutEffect2, useRef as useRef4 } from "react";
import { Fragment, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function StreamingReply({ value, active = false }) {
  const surface = useRef4(null);
  const reply = useRef4(null);
  const wait = useRef4(null);
  const wasActive = useRef4(active);
  const streaming = active || wasActive.current;
  useLayoutEffect2(() => {
    const box = surface.current, words = reply.current, thinking = wait.current;
    if (!box || !words || !thinking) return;
    const resize = () => {
      const max = box.clientWidth;
      box.style.setProperty("--yg-reply-available", `${max}px`);
      const inline = value ? max : Math.min(max, thinking.offsetWidth + 28);
      const block = Math.max(40, words.offsetHeight + 18);
      const waitOpacity = Number(active && !value);
      box.style.setProperty("--yg-reply-width", `${inline}px`);
      box.style.setProperty("--yg-reply-height", `${block}px`);
      box.style.setProperty("--yg-reply-waiting", String(waitOpacity));
    };
    if (active) wasActive.current = true;
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(words);
    observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [active, value]);
  return /* @__PURE__ */ jsx5("div", { ref: surface, className: "yg-streaming-shell", children: /* @__PURE__ */ jsxs5("div", { className: "yg-streaming-reply", "aria-busy": active || void 0, "data-streaming": streaming || void 0, children: [
    /* @__PURE__ */ jsx5("span", { ref: wait, className: "yg-streaming-wait", "aria-hidden": !active || !!value, children: active || value ? "Thinking" : "" }),
    /* @__PURE__ */ jsx5("div", { ref: reply, className: "yg-streaming-body", children: value && value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part : /* @__PURE__ */ jsx5("span", { className: "yg-streaming-word", children: part }, index)) })
  ] }) });
}
function GhostSuggestion({ value, suggestion, onChange }) {
  return /* @__PURE__ */ jsx5("div", { className: "yg-ghost-field", children: /* @__PURE__ */ jsx5(
    Textarea,
    {
      label: "Your message",
      rows: 2,
      value,
      autoComplete: "off",
      suggestion,
      onChange: (event) => onChange(event.currentTarget.value)
    }
  ) });
}
function PromptBox({ value, onChange, onSubmit, busy = false, onCancel }) {
  return /* @__PURE__ */ jsxs5(
    "form",
    {
      className: "yg-prompt-box yg-prompt-shared",
      "aria-label": "Prompt",
      "aria-busy": busy || void 0,
      onSubmit: (event) => {
        event.preventDefault();
        if (!busy && value.trim()) onSubmit();
      },
      children: [
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-panel", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status-slot", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status", role: "status", children: busy && /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx5("span", { className: "yg-prompt-indicator", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx5("span", { children: "Thinking" })
        ] }) }) }) }),
        /* @__PURE__ */ jsx5(
          PromptEditor,
          {
            presentation: "prompt",
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
        ),
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-actions", children: /* @__PURE__ */ jsx5(PromptAction, { presentation: "prompt", busy, ready: Boolean(value.trim()), onStop: onCancel }) })
      ]
    }
  );
}
function ThinkingIndicator({ label = "Thinking", active = true }) {
  const filter = useId5();
  const node = useRef4(null);
  useLayoutEffect2(() => {
    if (!active || !node.current) return;
    const dots = Array.from(node.current.querySelectorAll("i"));
    const axes = dots.map(() => spring(0, 420, 14));
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, clock = 0, previous = performance.now(), hop = 0.3, index = 0;
    function tick(time) {
      const elapsed = Math.min(1 / 30, (time - previous) / 1e3);
      previous = time;
      clock += elapsed;
      if (clock >= hop) {
        axes[index % axes.length].velocity = -95;
        index++;
        hop += index % axes.length ? 0.16 : 0.46;
      }
      advanceSprings(axes, elapsed);
      dots.forEach((dot, i) => {
        dot.style.translate = `0 ${axes[i].position}px`;
      });
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        axes.forEach((axis) => snap(axis, 0));
        dots.forEach((dot) => dot.style.removeProperty("translate"));
      } else {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, [active]);
  if (!active) return null;
  return /* @__PURE__ */ jsxs5("div", { className: "yg-thinking", role: "status", "aria-label": label, children: [
    /* @__PURE__ */ jsx5("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsx5("defs", { children: /* @__PURE__ */ jsxs5("filter", { id: filter, children: [
      /* @__PURE__ */ jsx5("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2", result: "blur" }),
      /* @__PURE__ */ jsx5("feColorMatrix", { in: "blur", mode: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" })
    ] }) }) }),
    /* @__PURE__ */ jsxs5("span", { ref: node, className: "yg-thinking-dots", "aria-hidden": "true", style: { filter: `url(#${filter})` }, children: [
      /* @__PURE__ */ jsx5("i", {}),
      /* @__PURE__ */ jsx5("i", {}),
      /* @__PURE__ */ jsx5("i", {})
    ] })
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { useId as useId7, useLayoutEffect as useLayoutEffect4, useRef as useRef6, useState as useState5 } from "react";

// packages/web/src/patterns/elastic-range.tsx
import { useId as useId6, useLayoutEffect as useLayoutEffect3, useRef as useRef5 } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
var radius = 12;
function animateRange(element, initial) {
  const thumb = spring(0, 900, 50), dropX = spring(0, 260, 18);
  const dropY = spring(16, 420, 22), dropScale = spring(0.5, 420, 22), press = spring(1, 520, 16);
  let ratio = initial, width = 0;
  const x = () => radius + ratio * Math.max(1, width - radius * 2);
  function paint() {
    const stretch = 1 + Math.min(Math.abs(thumb.velocity) / 2400, 0.4);
    element.style.setProperty("--yg-elastic-thumb", `${thumb.position}px`);
    element.style.setProperty("--yg-elastic-fill", `${clamp(thumb.position, 0, width) * clamp((thumb.position - radius) / radius, 0, 1)}px`);
    element.style.setProperty("--yg-elastic-stretch", String(stretch * press.position));
    element.style.setProperty("--yg-elastic-squash", String(press.position / stretch));
    element.style.setProperty("--yg-elastic-drop-x", `${dropX.position}px`);
    element.style.setProperty("--yg-elastic-drop-y", `${dropY.position}px`);
    element.style.setProperty("--yg-elastic-drop-scale", String(dropScale.position));
    element.style.setProperty("--yg-elastic-tilt", `${clamp((dropX.position - thumb.position) * 0.9, -28, 28)}deg`);
    element.style.setProperty("--yg-elastic-label-opacity", String(clamp((dropScale.position - 0.7) / 0.25, 0, 1)));
  }
  function wake() {
    snap(thumb, thumb.target);
    snap(dropX, thumb.position);
    [dropY, dropScale, press].forEach((track) => snap(track, track.target));
    paint();
  }
  function resize() {
    const next = element.clientWidth;
    if (!next || width === next) return;
    width = next;
    snap(thumb, x());
    snap(dropX, x());
    paint();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(element);
  resize();
  return {
    controlled(next, dragging) {
      ratio = next;
      if (dragging) return;
      thumb.stiffness = 420;
      thumb.damping = 34;
      thumb.target = x();
      wake();
    },
    drag(next, raw) {
      ratio = next;
      thumb.stiffness = 900;
      thumb.damping = 50;
      const limit = Math.max(radius, width - radius);
      const edge = clamp(raw, radius, limit);
      const off = raw - edge;
      thumb.target = edge + Math.sign(off) * 18 * (1 - 1 / (Math.abs(off) * 0.55 / 18 + 1));
      wake();
    },
    release(next) {
      ratio = next;
      thumb.stiffness = 300;
      thumb.damping = 14;
      thumb.target = x();
      wake();
    },
    presence(dragging, lifted, hovered) {
      dropY.target = dragging || lifted ? -22 : 16;
      dropScale.target = dragging || lifted ? 1 : 0.5;
      press.target = dragging ? 1.16 : hovered ? 1.08 : 1;
      wake();
    },
    dispose() {
      observer.disconnect();
    }
  };
}
function ElasticRange({ label, value, min, max, step, onChange, formatValue }) {
  const id = useId6(), filter = useId6();
  const rail = useRef5(null), hit = useRef5(null);
  const motion = useRef5(null);
  const drag = useRef5(null);
  const hover = useRef5(false), focused = useRef5(false);
  const ratio = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const valueOnMount = useRef5(ratio);
  useLayoutEffect3(() => {
    if (!rail.current) return;
    const controller = animateRange(rail.current, valueOnMount.current);
    motion.current = controller;
    return () => {
      controller.dispose();
      motion.current = null;
    };
  }, []);
  useLayoutEffect3(() => {
    motion.current?.controlled(ratio, drag.current !== null);
  }, [ratio]);
  function sync() {
    motion.current?.presence(drag.current !== null, focused.current, hover.current);
  }
  function aim(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const raw = rtl ? rect.right - event.clientX : event.clientX - rect.left;
    const next = clamp((raw - radius) / Math.max(1, rect.width - radius * 2), 0, 1);
    const increment = Number.isFinite(step) && step > 0 ? step : 1;
    const value2 = clamp(min + Math.round((max - min) * next / increment) * increment, min, max);
    motion.current?.drag(next, raw);
    onChange(Number(value2.toFixed(10)));
  }
  function stop(event) {
    if (event.pointerId !== drag.current) return;
    drag.current = null;
    motion.current?.release(ratio);
    sync();
  }
  function key(event) {
    const offsets = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 2, PageDown: -2 };
    if (!(event.key in offsets) && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? min : event.key === "End" ? max : clamp(value + offsets[event.key] * step, min, max);
    focused.current = true;
    sync();
    onChange(Number(next.toFixed(10)));
  }
  return /* @__PURE__ */ jsxs6("div", { className: "yg-elastic-range", children: [
    /* @__PURE__ */ jsx6("label", { htmlFor: id, children: label }),
    /* @__PURE__ */ jsx6("svg", { width: "0", height: "0", "aria-hidden": "true", children: /* @__PURE__ */ jsx6("defs", { children: /* @__PURE__ */ jsxs6("filter", { id: filter, x: "-30%", y: "-100%", width: "160%", height: "240%", children: [
      /* @__PURE__ */ jsx6("feGaussianBlur", { stdDeviation: "8", result: "blur" }),
      /* @__PURE__ */ jsx6("feColorMatrix", { in: "blur", type: "matrix", values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10" })
    ] }) }) }),
    /* @__PURE__ */ jsxs6(
      "div",
      {
        ref: rail,
        className: "yg-elastic-rail",
        onPointerDown: (event) => {
          if (!event.isPrimary || event.button !== 0 || drag.current !== null) return;
          drag.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          hit.current?.focus({ preventScroll: true });
          aim(event);
          sync();
        },
        onPointerMove: (event) => {
          if (drag.current === event.pointerId) aim(event);
        },
        onPointerUp: stop,
        onPointerCancel: stop,
        onLostPointerCapture: stop,
        onPointerEnter: (event) => {
          hover.current = event.pointerType === "mouse";
          sync();
        },
        onPointerLeave: () => {
          hover.current = false;
          sync();
        },
        children: [
          /* @__PURE__ */ jsx6("span", { className: "yg-elastic-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx6("i", {}) }),
          /* @__PURE__ */ jsxs6("span", { className: "yg-elastic-goo", "aria-hidden": "true", style: { filter: `url(#${filter})` }, children: [
            /* @__PURE__ */ jsx6("i", { className: "yg-elastic-thumb" }),
            /* @__PURE__ */ jsx6("i", { className: "yg-elastic-drop" })
          ] }),
          /* @__PURE__ */ jsx6("span", { className: "yg-elastic-value", "aria-hidden": "true", children: formatValue(value) }),
          /* @__PURE__ */ jsx6(
            "button",
            {
              ref: hit,
              type: "button",
              role: "slider",
              id,
              "aria-label": label,
              "aria-valuemin": min,
              "aria-valuemax": max,
              "aria-valuenow": value,
              "aria-valuetext": formatValue(value),
              onKeyDown: key,
              onFocus: (event) => {
                focused.current = event.currentTarget.matches(":focus-visible");
                sync();
              },
              onBlur: () => {
                focused.current = false;
                sync();
              }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx6("div", { className: "yg-elastic-marks", "aria-hidden": "true", children: Array.from({ length: 21 }, (_, i) => /* @__PURE__ */ jsx6(
      "i",
      {
        "data-major": i % 5 === 0 || void 0,
        "data-passed": i / 20 <= ratio && ratio > 0 || void 0
      },
      i
    )) }),
    /* @__PURE__ */ jsx6("div", { className: "yg-elastic-labels", "aria-hidden": "true", children: [0, 0.25, 0.5, 0.75, 1].map((position) => /* @__PURE__ */ jsx6("span", { style: { "--yg-scale-position": position }, children: formatValue(min + position * (max - min)) }, position)) })
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
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
  formatValue = String,
  presentation = "standard",
  minThumbGap = 0
}) {
  const id = useId7();
  const interval = useRef6(null);
  const activeDrag = useRef6(null);
  const [trackWidth, setTrackWidth] = useState5(0);
  const percent = (number) => max > min ? Math.max(0, Math.min(100, (number - min) / (max - min) * 100)) : 0;
  const first = percent(value);
  const last = end === void 0 ? first : percent(end);
  const [motion] = useState5(() => ({
    start: spring(first, 260, 24),
    end: spring(last, 260, 24),
    merge: spring(0, 300, 26)
  }));
  useLayoutEffect4(() => {
    const rail = interval.current;
    const root = rail?.parentElement;
    if (!rail || !root) return;
    const firstTip = rail.querySelector('[data-tip="start"]');
    const lastTip = rail.querySelector('[data-tip="end"]');
    const joinedTip = rail.querySelector('[data-tip="joined"]');
    let width = 0, need = 0;
    let startInset = 0, endInset = 0;
    let firstWidth = 0, lastWidth = 0, joinedWidth = 0;
    function contain(position2, tipWidth) {
      const half = tipWidth / 2 + 6;
      const start = half - startInset;
      const end2 = width + endInset - half;
      const x = position2 * width / 100;
      return end2 < start ? (start + end2) / 2 : Math.max(start, Math.min(end2, x));
    }
    function paint() {
      const a = motion.start.position, b = motion.end.position;
      const middle = (a + b) / 2;
      const amount = Math.max(0, Math.min(1, motion.merge.position));
      const tilt = (velocity) => Math.max(-12, Math.min(12, -velocity * width / 100 * 0.02));
      const settings = {
        "--yg-range-start": `${a}%`,
        "--yg-range-end": `${b}%`,
        "--yg-tip-first": `${contain(a + (middle - a) * amount, firstWidth)}px`,
        "--yg-tip-last": `${contain(b + (middle - b) * amount, lastWidth)}px`,
        "--yg-tip-middle": `${contain(middle, joinedWidth)}px`,
        "--yg-tip-first-tilt": `${tilt(motion.start.velocity)}deg`,
        "--yg-tip-last-tilt": `${tilt(motion.end.velocity)}deg`,
        "--yg-tip-middle-tilt": `${tilt((motion.start.velocity + motion.end.velocity) / 2)}deg`,
        "--yg-tip-merge": String(amount)
      };
      for (const [key, value2] of Object.entries(settings)) root?.style.setProperty(key, value2);
    }
    function targetMerge() {
      motion.merge.target = Number((motion.end.position - motion.start.position) * width / 100 < need);
    }
    function work() {
      if (!rail || !root) return;
      const bounds = root.getBoundingClientRect(), inner = rail.getBoundingClientRect();
      const rtl = getComputedStyle(rail).direction === "rtl";
      startInset = rtl ? bounds.right - inner.right : inner.left - bounds.left;
      endInset = rtl ? inner.left - bounds.left : bounds.right - inner.right;
      width = rail.clientWidth;
      setTrackWidth(width);
      root.style.setProperty("--yg-tip-max-width", `${Math.max(0, bounds.width - 12)}px`);
      firstWidth = firstTip?.offsetWidth ?? 0;
      lastWidth = lastTip?.offsetWidth ?? 0;
      joinedWidth = joinedTip?.offsetWidth ?? 0;
      need = (firstWidth + lastWidth) / 2 + 8;
      snap(motion.start, first);
      snap(motion.end, last);
      targetMerge();
      snap(motion.merge, motion.merge.target);
      paint();
    }
    work();
    const size = new ResizeObserver(work);
    size.observe(rail);
    if (firstTip) size.observe(firstTip);
    if (lastTip) size.observe(lastTip);
    if (joinedTip) size.observe(joinedTip);
    return () => {
      size.disconnect();
    };
  }, [first, last, motion]);
  if (end === void 0 || !onEndChange) {
    if (presentation === "elastic") {
      return /* @__PURE__ */ jsx7(ElasticRange, { label, value, onChange, min, max, step, formatValue });
    }
    return /* @__PURE__ */ jsx7(
      Slider,
      {
        label,
        value,
        min,
        max,
        step,
        onValueChange: onChange,
        formatValue,
        presentation: "card"
      }
    );
  }
  const joined = last - first < 25;
  const increment = step > 0 && Number.isFinite(step) ? step : 1;
  const separation = trackWidth > 0 && max > min && Number.isFinite(minThumbGap) && minThumbGap > 0 ? Math.min(max - min, Math.ceil(minThumbGap * (max - min) / trackWidth / increment) * increment) : 0;
  const maxStart = Math.max(min, end - separation);
  const minEnd = Math.min(max, value + separation);
  const set = (thumb, next) => {
    const snapped = Number((min + Math.round((next - min) / increment) * increment).toFixed(10));
    if (thumb === "start") onChange(Math.max(min, Math.min(maxStart, snapped)));
    else onEndChange(Math.max(minEnd, Math.min(max, snapped)));
  };
  const position = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const direction = getComputedStyle(event.currentTarget).direction;
    const x = direction === "rtl" ? box.right - event.clientX : event.clientX - box.left;
    return min + Math.max(0, Math.min(1, x / Math.max(1, box.width))) * (max - min);
  };
  const onThumbKey = (event, side, at) => {
    const bounds = side === "start" ? [min, maxStart] : [minEnd, max];
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
            ref: interval,
            "data-joined": joined || void 0,
            "data-spring": "",
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
                  "aria-valuemax": Math.max(value, maxStart),
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
                  "aria-valuemin": Math.min(end, minEnd),
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
  const id = useId7();
  const [shown, setShown] = useState5(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password", "data-score": score, children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: "Create a password" }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password-field", children: [
      /* @__PURE__ */ jsx7(
        "input",
        {
          id,
          type: shown ? "text" : "password",
          autoComplete: "new-password",
          value,
          onChange: (event) => onChange(event.currentTarget.value),
          "aria-describedby": `${id}-checks`
        }
      ),
      /* @__PURE__ */ jsx7(
        "button",
        {
          type: "button",
          className: "yg-motion-password-eye",
          "aria-label": shown ? "Hide password" : "Show password",
          "aria-pressed": shown,
          onMouseDown: (event) => {
            if (event.currentTarget.previousElementSibling === document.activeElement) event.preventDefault();
          },
          onClick: () => setShown((current) => !current),
          children: /* @__PURE__ */ jsxs7("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx7("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
            /* @__PURE__ */ jsx7("circle", { cx: "12", cy: "12", r: "2.8" }),
            /* @__PURE__ */ jsx7("path", { className: "yg-motion-password-slash", d: "M4.5 4.5l15 15" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx7("div", { className: "yg-motion-password-meter", "aria-hidden": "true", children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsx7("span", { children: /* @__PURE__ */ jsx7("i", { style: { scale: `${Number(index < score)} 1` } }) }, index)) }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password-checks", children: [
      /* @__PURE__ */ jsx7("span", { role: "status", children: /* @__PURE__ */ jsx7("strong", { children: word }, word) }),
      /* @__PURE__ */ jsx7("span", { id: `${id}-checks`, children: "8+ characters, mixed case, a number and a symbol" })
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
    options.map(
      (option) => /* @__PURE__ */ jsx7(
        Checkbox,
        {
          className: "yg-motion-checklist-item",
          label: option.label,
          checked: value.includes(option.id),
          onCheckedChange: (checked) => onChange(checked === true ? [...value, option.id] : value.filter((id) => id !== option.id))
        },
        option.id
      )
    )
  ] });
}
function DetentDial({ options, value, onChange }) {
  const id = useId7();
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

// packages/web/src/patterns/motion-task-list.tsx
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed"
};
function TaskLine({ task }) {
  const showState = task.state === "failed";
  return /* @__PURE__ */ jsxs8(Fragment2, { children: [
    /* @__PURE__ */ jsx8("span", { className: "yg-task-marker", "aria-hidden": "true", children: task.state === "done" ? /* @__PURE__ */ jsx8("svg", { viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx8("path", { pathLength: "1", d: "M5 12.5l4.2 4.2L19 7" }) }) : task.state === "failed" ? /* @__PURE__ */ jsx8(Icon, { name: "close" }) : null }),
    /* @__PURE__ */ jsx8("span", { className: "yg-task-copy", children: /* @__PURE__ */ jsx8("strong", { children: task.label }) }),
    /* @__PURE__ */ jsxs8("span", { className: "yg-task-meta", children: [
      task.detail && !showState && /* @__PURE__ */ jsx8("span", { className: "yg-task-note", children: task.detail }),
      /* @__PURE__ */ jsx8("span", { className: showState ? "yg-task-state" : "yg-task-sr", children: stateName[task.state] })
    ] })
  ] });
}
function TaskList({ label, tasks }) {
  const complete = tasks.filter((task) => task.state === "done").length;
  const active = tasks.find((task) => task.state === "running")?.id;
  return /* @__PURE__ */ jsxs8("section", { className: "yg-task-list", "aria-label": label, children: [
    /* @__PURE__ */ jsxs8("header", { children: [
      /* @__PURE__ */ jsx8("strong", { children: label }),
      /* @__PURE__ */ jsxs8("span", { role: "status", children: [
        /* @__PURE__ */ jsxs8("span", { className: "yg-task-sr", children: [
          complete,
          " of ",
          tasks.length,
          " done"
        ] }),
        /* @__PURE__ */ jsxs8("span", { "aria-hidden": "true", children: [
          complete,
          "/",
          tasks.length
        ] })
      ] })
    ] }),
    tasks.length === 0 && /* @__PURE__ */ jsx8("p", { className: "yg-help", children: "No steps yet." }),
    /* @__PURE__ */ jsx8("ol", { children: tasks.map((task) => /* @__PURE__ */ jsx8("li", { "data-state": task.state, "data-active": active === task.id || void 0, children: task.steps?.length ? /* @__PURE__ */ jsxs8("details", { open: true, children: [
      /* @__PURE__ */ jsx8("summary", { className: "yg-task-line", children: /* @__PURE__ */ jsx8(TaskLine, { task }) }),
      /* @__PURE__ */ jsx8("ol", { className: "yg-task-children", children: task.steps.map((step) => /* @__PURE__ */ jsx8("li", { "data-state": step.state, className: "yg-task-line", children: /* @__PURE__ */ jsx8(TaskLine, { task: step }) }, step.id)) })
    ] }) : /* @__PURE__ */ jsx8("div", { className: "yg-task-line", children: /* @__PURE__ */ jsx8(TaskLine, { task }) }) }, task.id)) })
  ] });
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
  MorphTooltipBar,
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
