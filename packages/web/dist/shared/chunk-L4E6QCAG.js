"use client";
import {
  MentionOptions,
  PromptAction,
  PromptEditor,
  useMention
} from "./chunk-LKB52XNS.js";
import {
  Disclosure
} from "./chunk-2TEZLIKS.js";
import {
  Checkbox,
  Textarea
} from "./chunk-SBJ7U7LP.js";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Button
} from "./chunk-BMOTQIAZ.js";
import {
  Icon
} from "./chunk-XELXU7JZ.js";

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

// packages/web/src/controls/choice-cards.tsx
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function ChoiceCards({
  label,
  value,
  onChange,
  options,
  groupClass,
  itemClass,
  children
}) {
  return /* @__PURE__ */ jsx3(
    RadioGroup,
    {
      className: groupClass,
      "aria-label": label,
      value,
      onValueChange: (next) => {
        if (next !== null) onChange(next);
      },
      children: options.map((option) => /* @__PURE__ */ jsxs3("label", { className: itemClass, "data-selected": value === option.id || void 0, children: [
        /* @__PURE__ */ jsx3(Radio, { value: option.id }),
        children(option)
      ] }, option.id))
    }
  );
}
function FocusPicker(props) {
  return /* @__PURE__ */ jsx3(ChoiceCards, { ...props, label: "Focus", groupClass: "yg-focus-picker", itemClass: "yg-focus-choice", children: (option) => /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsx3("span", { className: "yg-focus-orbit", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs3("span", { className: "yg-choice-copy", children: [
      /* @__PURE__ */ jsx3("strong", { children: option.label }),
      /* @__PURE__ */ jsx3("span", { children: option.description })
    ] }),
    /* @__PURE__ */ jsx3("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
  ] }) });
}
function PlanSwitch(props) {
  return /* @__PURE__ */ jsx3(ChoiceCards, { ...props, label: "Plan", groupClass: "yg-plan-switch", itemClass: "yg-plan-choice", children: (option) => /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsxs3("span", { className: "yg-plan-heading", children: [
      /* @__PURE__ */ jsx3("strong", { children: option.label }),
      /* @__PURE__ */ jsx3("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
    ] }),
    /* @__PURE__ */ jsx3("span", { className: "yg-plan-price", children: option.price }),
    /* @__PURE__ */ jsx3("span", { className: "yg-plan-description", children: option.description })
  ] }) });
}

// packages/web/src/patterns/tooltip-bar.tsx
import { useEffect as useEffect2, useId as useId3, useLayoutEffect, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function MorphTooltipBar({ label, tools, value, onChange }) {
  const id = useId3();
  const bar = useRef3(null);
  const hide = useRef3(void 0);
  const [active, setActive] = useState3(null);
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
import { useId as useId4, useLayoutEffect as useLayoutEffect2, useRef as useRef4 } from "react";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
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
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-panel", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status-slot", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status", role: "status", children: busy && /* @__PURE__ */ jsxs5(Fragment2, { children: [
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
  const filter = useId4();
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

// packages/web/src/patterns/motion-cards.tsx
import { useLayoutEffect as useLayoutEffect3, useRef as useRef5, useState as useState4 } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function ExpandCard({ title, children }) {
  const card = useRef5(null);
  const [open, setOpen] = useState4(false);
  useLayoutEffect3(() => {
    const root = card.current;
    if (!root) return;
    root.style.setProperty("--yg-card-expansion", String(Number(open)));
    root.style.setProperty("--yg-card-content", String(Number(open)));
  }, [open]);
  return /* @__PURE__ */ jsxs6("details", { ref: card, className: "yg-expand-card", onToggle: (event) => setOpen(event.currentTarget.open), children: [
    /* @__PURE__ */ jsxs6("summary", { children: [
      /* @__PURE__ */ jsx6("span", { className: "yg-expand-art", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx6("span", { className: "yg-expand-title", children: title }),
      /* @__PURE__ */ jsx6("span", { className: "yg-card-disclosure", children: /* @__PURE__ */ jsx6(Icon, { name: "plus" }) })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "yg-expand-card-body", children })
  ] });
}
function FanCards({ items }) {
  const [selectedId, setSelectedId] = useState4(null);
  const [highlight, setHighlight] = useState4(null);
  const [pointer, setPointer] = useState4(false);
  const [keyboard, setKeyboard] = useState4(false);
  const selected = items.find((item) => item.id === selectedId);
  const list = useRef5(null);
  useLayoutEffect3(() => {
    const root = list.current;
    if (!root || items.length > 3) return;
    const buttons = Array.from(root.querySelectorAll("button[data-card]"));
    const active = pointer || keyboard;
    const rows = buttons.map((button, index) => {
      const id = button.dataset.card;
      const featured = highlight ?? selectedId ?? items[Math.floor(items.length / 2)]?.id;
      const hot = active && id === featured;
      button.toggleAttribute("data-front", id === featured);
      button.style.zIndex = id === featured ? "5" : index === 1 ? "3" : "2";
      return { button, hot, index: index - (items.length - 1) / 2 };
    });
    const render = () => {
      const width = root.offsetWidth;
      const room = Math.min(66, Math.max(0, (width - 208) / 2));
      const angle = 9;
      rows.forEach(({ button, hot, index }) => {
        const x = index * (active ? room : 6);
        const y = Math.abs(index) * (active ? 12 : 0) + (hot ? -22 : 0);
        button.style.setProperty("--yg-fan-transform", `translate(calc(-50% + ${x}px), ${y}px) rotate(${index * (3 + (active ? angle : 0))}deg) scale(${hot ? 1.06 : 1})`);
      });
    };
    render();
    const sizes = new ResizeObserver(render);
    sizes.observe(root);
    return () => sizes.disconnect();
  }, [highlight, items, keyboard, pointer, selectedId]);
  return /* @__PURE__ */ jsxs6("div", { className: "yg-fan-cards", children: [
    /* @__PURE__ */ jsx6(
      "div",
      {
        className: "yg-fan-cards-list",
        ref: list,
        "aria-label": "Cards",
        "data-many": items.length > 3 || void 0,
        onPointerEnter: () => setPointer(true),
        onPointerLeave: () => {
          setPointer(false);
          setHighlight(null);
        },
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setKeyboard(false);
        },
        children: items.map((item, index) => /* @__PURE__ */ jsxs6(
          "button",
          {
            type: "button",
            "data-card": item.id,
            style: { "--yg-fan-offset": index - (items.length - 1) / 2 },
            "aria-pressed": item.id === selected?.id,
            onPointerEnter: () => setHighlight(item.id),
            onFocus: (event) => {
              if (event.currentTarget.matches(":focus-visible")) {
                setKeyboard(true);
                setHighlight(item.id);
              }
            },
            onClick: () => setSelectedId(item.id === selectedId ? null : item.id),
            children: [
              /* @__PURE__ */ jsx6("span", { className: "yg-fan-art", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx6("span", { className: "yg-fan-index", "aria-hidden": "true", children: String(index + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsx6("span", { className: "yg-fan-label", children: item.label }),
              /* @__PURE__ */ jsx6(Icon, { name: "next" })
            ]
          },
          item.id
        ))
      }
    ),
    selected && /* @__PURE__ */ jsxs6("p", { className: "yg-fan-detail", children: [
      /* @__PURE__ */ jsx6("strong", { children: selected.label }),
      /* @__PURE__ */ jsx6("span", { children: selected.detail })
    ] })
  ] });
}
function StatSeries({ values }) {
  const stroke = useRef5(null), fill = useRef5(null);
  const dot = useRef5(null);
  useLayoutEffect3(() => {
    const safe = values.map((value) => Number.isFinite(value) ? value : 0);
    if (!safe.length) return;
    const coordinates = safe.map((position, i) => [
      4 + i / Math.max(1, safe.length - 1) * 288,
      8 + (1 - Math.min(1.05, Math.max(-0.05, position))) * 80
    ]);
    let curve = `M${coordinates[0].join(" ")}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const a = coordinates[i - 1] ?? coordinates[i], b = coordinates[i];
      const c = coordinates[i + 1], d = coordinates[i + 2] ?? c;
      const first = b.map((value, axis) => value + (c[axis] - a[axis]) / 6);
      const second = c.map((value, axis) => value - (d[axis] - b[axis]) / 6);
      curve += ` C${first.join(" ")} ${second.join(" ")} ${c.join(" ")}`;
    }
    const last = coordinates[coordinates.length - 1];
    stroke.current?.setAttribute("d", curve);
    fill.current?.setAttribute("d", `${curve} L${last[0]} 96 L4 96 Z`);
    dot.current?.setAttribute("cx", String(last[0]));
    dot.current?.setAttribute("cy", String(last[1]));
  }, [values]);
  return /* @__PURE__ */ jsxs6("svg", { viewBox: "0 0 296 96", className: "yg-stat-series", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx6("path", { ref: fill, className: "yg-stat-area" }),
    /* @__PURE__ */ jsx6("path", { ref: stroke, className: "yg-stat-line" }),
    /* @__PURE__ */ jsx6("circle", { ref: dot, r: "4" })
  ] });
}
function StatCard({ label, value, detail, series }) {
  return /* @__PURE__ */ jsxs6("section", { className: "yg-stat-card", "aria-label": label, children: [
    /* @__PURE__ */ jsxs6("div", { className: "yg-stat-heading", children: [
      /* @__PURE__ */ jsxs6("div", { children: [
        /* @__PURE__ */ jsx6("span", { className: "yg-stat-label", children: label }),
        /* @__PURE__ */ jsx6("strong", { className: "yg-stat-value", children: value.toLocaleString() })
      ] }),
      detail && /* @__PURE__ */ jsx6("span", { className: "yg-stat-detail", children: detail })
    ] }),
    series && series.length > 1 && /* @__PURE__ */ jsx6(StatSeries, { values: series })
  ] });
}
function ProfileCard({ name, detail, initials, children, actions }) {
  return /* @__PURE__ */ jsxs6("section", { className: "yg-profile-card", children: [
    /* @__PURE__ */ jsxs6("div", { className: "yg-profile-header", children: [
      /* @__PURE__ */ jsx6("span", { className: "yg-profile-avatar", "aria-hidden": "true", children: initials }),
      /* @__PURE__ */ jsxs6("div", { children: [
        /* @__PURE__ */ jsx6("strong", { children: name }),
        /* @__PURE__ */ jsx6("p", { children: detail })
      ] })
    ] }),
    children != null && /* @__PURE__ */ jsx6(Disclosure, { label: `More about ${name}`, children: /* @__PURE__ */ jsx6("div", { className: "yg-profile-extra", children }) }),
    actions
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { useId as useId5, useState as useState5 } from "react";
import { Input as SDKInput } from "@ui-sdk/react/input";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function PasswordStrength({ value, onChange }) {
  const id = useId5();
  const [shown, setShown] = useState5(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password", "data-score": score, children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: "Create a password" }),
    /* @__PURE__ */ jsxs7("div", { className: "yg-motion-password-field", children: [
      /* @__PURE__ */ jsx7(
        SDKInput,
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
        Button,
        {
          type: "button",
          emphasis: "quiet",
          className: "yg-motion-password-eye",
          "data-icon-only": "",
          size: "comfortable",
          "aria-label": shown ? "Hide password" : "Show password",
          "aria-pressed": shown,
          onMouseDown: (event) => {
            if (event.currentTarget.parentElement?.querySelector("input") === document.activeElement) event.preventDefault();
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
  const id = useId5();
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
import { useEffect as useEffect3, useRef as useRef6, useState as useState6 } from "react";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function useConfirmation(onConfirm) {
  const [done, setDone] = useState6(false);
  const locked = useRef6(false);
  const timer = useRef6(null);
  useEffect3(() => () => {
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
  const [progress, setProgress] = useState6(0);
  const [armed, setArmed] = useState6(false);
  const [holding, setHolding] = useState6(false);
  const [showHolding, setShowHolding] = useState6(false);
  const amount = useRef6(0);
  const fill = useRef6(null);
  const drain = useRef6(void 0);
  const active = useRef6(null);
  const frame = useRef6(null);
  const callback = useRef6(onConfirm);
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
  useEffect3(() => () => {
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
        /* @__PURE__ */ jsx8("span", { ref: fill, className: "yg-confirm-fill", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx8("span", { className: "yg-confirm-label", children: done ? /* @__PURE__ */ jsx8("svg", { className: "yg-hold-check", width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ jsx8(
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
  const [progress, setProgress] = useState6(0);
  const [armed, setArmed] = useState6(false);
  const [dragging, setDragging] = useState6(false);
  const active = useRef6(null);
  const value = useRef6(0);
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
    value.current = Math.max(0, Math.min(1, (event.clientX - drag.start) * drag.direction / drag.width));
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
          direction: getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1,
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
        const speed = elapsed > 0 ? (event.clientX - first.x) * drag.direction * 1e3 / elapsed : 0;
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
import { useEffect as useEffect4, useLayoutEffect as useLayoutEffect4, useRef as useRef7, useState as useState7 } from "react";
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var holdDelay = 380;
var initialRepeat = 150;
var minimumRepeat = 55;
var limitNoticeDuration = 1600;
function CartButton({ label, quantity, onQuantityChange, max = 99, addLabel = "Add" }) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const count = Number.isFinite(quantity) ? Math.max(0, Math.min(limit, Math.floor(quantity))) : 0;
  const previous = useRef7(count);
  const goingDown = count < previous.current;
  const lastCount = previous.current;
  useLayoutEffect4(() => {
    previous.current = count;
  }, [count]);
  const [showLimit, setShowLimit] = useState7(false);
  const notice = useRef7(void 0);
  const open = count > 0;
  const reachedLimit = count >= limit;
  const latest = useRef7({ count, limit, onQuantityChange });
  latest.current = { count, limit, onQuantityChange };
  const increase = useRef7(null);
  const pointer = useRef7(void 0);
  const timer = useRef7(void 0);
  const skipClick = useRef7(false);
  function stop() {
    clearTimeout(timer.current);
    pointer.current = void 0;
  }
  useEffect4(() => {
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
  MentionPicker,
  FileDrop,
  LetterLimit,
  FocusPicker,
  PlanSwitch,
  MorphTooltipBar,
  StreamingReply,
  GhostSuggestion,
  PromptBox,
  ThinkingIndicator,
  ExpandCard,
  FanCards,
  StatCard,
  ProfileCard,
  PasswordStrength,
  CheckboxList,
  DetentDial,
  HoldButton,
  SlideConfirm,
  TaskList,
  CartButton
};
