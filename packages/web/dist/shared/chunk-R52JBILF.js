"use client";
import {
  MentionOptions,
  PromptAction,
  PromptEditor,
  useMention
} from "./chunk-LKB52XNS.js";
import {
  Checkbox,
  Textarea
} from "./chunk-YFEC5KYD.js";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Button
} from "./chunk-JHTLYLR5.js";
import {
  Icon
} from "./chunk-A5HC7UHE.js";

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

// packages/web/src/patterns/tooltip-bar.tsx
import { useEffect as useEffect2, useId as useId3, useLayoutEffect, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs3(
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
        /* @__PURE__ */ jsx3("span", { className: "yg-tooltip-bar-marker", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3("span", { className: "yg-tooltip-bar-tail", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3("span", { className: "yg-tooltip-bar-bubble", id, role: "tooltip", "aria-hidden": active === null, children: tools.map((tool) => /* @__PURE__ */ jsx3("span", { "data-tooltip-label": tool.id, "aria-hidden": tool.id !== active, children: tool.detail }, tool.id)) }),
        tools.map((tool) => /* @__PURE__ */ jsx3(
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
            children: /* @__PURE__ */ jsx3(Icon, { name: tool.icon })
          },
          tool.id
        ))
      ]
    }
  );
}

// packages/web/src/patterns/motion-conversation.tsx
import { useId as useId4, useLayoutEffect as useLayoutEffect2, useRef as useRef4 } from "react";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx4("div", { ref: surface, className: "yg-streaming-shell", children: /* @__PURE__ */ jsxs4("div", { className: "yg-streaming-reply", "aria-busy": active || void 0, "data-streaming": streaming || void 0, children: [
    /* @__PURE__ */ jsx4("span", { ref: wait, className: "yg-streaming-wait", "aria-hidden": !active || !!value, children: active || value ? "Thinking" : "" }),
    /* @__PURE__ */ jsx4("div", { ref: reply, className: "yg-streaming-body", children: value && value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part : /* @__PURE__ */ jsx4("span", { className: "yg-streaming-word", children: part }, index)) })
  ] }) });
}
function GhostSuggestion({ value, suggestion, onChange }) {
  return /* @__PURE__ */ jsx4("div", { className: "yg-ghost-field", children: /* @__PURE__ */ jsx4(
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
  return /* @__PURE__ */ jsxs4(
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
        /* @__PURE__ */ jsx4("div", { className: "yg-prompt-panel", children: /* @__PURE__ */ jsx4("div", { className: "yg-prompt-status-slot", children: /* @__PURE__ */ jsx4("div", { className: "yg-prompt-status", role: "status", children: busy && /* @__PURE__ */ jsxs4(Fragment, { children: [
          /* @__PURE__ */ jsx4("span", { className: "yg-prompt-indicator", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx4("span", { children: "Thinking" })
        ] }) }) }) }),
        /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsx4("div", { className: "yg-prompt-actions", children: /* @__PURE__ */ jsx4(PromptAction, { presentation: "prompt", busy, ready: Boolean(value.trim()), onStop: onCancel }) })
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
  return /* @__PURE__ */ jsxs4("div", { className: "yg-thinking", role: "status", "aria-label": label, children: [
    /* @__PURE__ */ jsx4("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false", children: /* @__PURE__ */ jsx4("defs", { children: /* @__PURE__ */ jsxs4("filter", { id: filter, children: [
      /* @__PURE__ */ jsx4("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2", result: "blur" }),
      /* @__PURE__ */ jsx4("feColorMatrix", { in: "blur", mode: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" })
    ] }) }) }),
    /* @__PURE__ */ jsxs4("span", { ref: node, className: "yg-thinking-dots", "aria-hidden": "true", style: { filter: `url(#${filter})` }, children: [
      /* @__PURE__ */ jsx4("i", {}),
      /* @__PURE__ */ jsx4("i", {}),
      /* @__PURE__ */ jsx4("i", {})
    ] })
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { useId as useId5, useState as useState4 } from "react";
import { Input as SDKInput } from "@ui-sdk/react/input";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function PasswordStrength({ value, onChange }) {
  const id = useId5();
  const [shown, setShown] = useState4(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return /* @__PURE__ */ jsxs5("div", { className: "yg-motion-password", "data-score": score, children: [
    /* @__PURE__ */ jsx5("label", { htmlFor: id, children: "Create a password" }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-motion-password-field", children: [
      /* @__PURE__ */ jsx5(
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
      /* @__PURE__ */ jsx5(
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
          children: /* @__PURE__ */ jsxs5("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx5("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
            /* @__PURE__ */ jsx5("circle", { cx: "12", cy: "12", r: "2.8" }),
            /* @__PURE__ */ jsx5("path", { className: "yg-motion-password-slash", d: "M4.5 4.5l15 15" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "yg-motion-password-meter", "aria-hidden": "true", children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsx5("span", { children: /* @__PURE__ */ jsx5("i", { style: { scale: `${Number(index < score)} 1` } }) }, index)) }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-motion-password-checks", children: [
      /* @__PURE__ */ jsx5("span", { role: "status", children: /* @__PURE__ */ jsx5("strong", { children: word }, word) }),
      /* @__PURE__ */ jsx5("span", { id: `${id}-checks`, children: "8+ characters, mixed case, a number and a symbol" })
    ] })
  ] });
}
function CheckboxList({ options, value, onChange }) {
  const count = options.filter((option) => value.includes(option.id)).length;
  return /* @__PURE__ */ jsxs5("fieldset", { className: "yg-motion-checklist", children: [
    /* @__PURE__ */ jsx5("legend", { children: "Choose options" }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-motion-checklist-heading", children: [
      /* @__PURE__ */ jsx5("strong", { children: "Today" }),
      /* @__PURE__ */ jsxs5("span", { children: [
        /* @__PURE__ */ jsx5("b", { children: count }),
        " of ",
        options.length,
        " done"
      ] })
    ] }),
    options.map(
      (option) => /* @__PURE__ */ jsx5(
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
  return /* @__PURE__ */ jsxs5("div", { className: "yg-motion-dial", children: [
    /* @__PURE__ */ jsx5("label", { htmlFor: id, children: "Selection" }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-motion-dial-face", style: { "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` }, children: [
      /* @__PURE__ */ jsx5("span", { className: "yg-motion-dial-marker", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx5("span", { className: "yg-motion-dial-value", children: options[index]?.label ?? "No selection" })
    ] }),
    /* @__PURE__ */ jsx5("input", { id, type: "range", min: 0, max: Math.max(0, options.length - 1), step: 1, value: selected, disabled: !options.length, "aria-valuetext": options[index]?.label ?? "No selection", onChange: (event) => choose(event.currentTarget.valueAsNumber), onKeyDown: (event) => {
      if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) {
        event.preventDefault();
        choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1));
      }
    } }),
    /* @__PURE__ */ jsx5("div", { className: "yg-motion-dial-options", "aria-hidden": "true", children: options.map((option) => /* @__PURE__ */ jsx5("span", { "data-selected": option.id === value || void 0, children: option.label }, option.id)) })
  ] });
}

// packages/web/src/patterns/motion-task-list.tsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed"
};
function TaskLine({ task }) {
  const showState = task.state === "failed";
  return /* @__PURE__ */ jsxs6(Fragment2, { children: [
    /* @__PURE__ */ jsx6("span", { className: "yg-task-marker", "aria-hidden": "true", children: task.state === "done" ? /* @__PURE__ */ jsx6("svg", { viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx6("path", { pathLength: "1", d: "M5 12.5l4.2 4.2L19 7" }) }) : task.state === "failed" ? /* @__PURE__ */ jsx6(Icon, { name: "close" }) : null }),
    /* @__PURE__ */ jsx6("span", { className: "yg-task-copy", children: /* @__PURE__ */ jsx6("strong", { children: task.label }) }),
    /* @__PURE__ */ jsxs6("span", { className: "yg-task-meta", children: [
      task.detail && !showState && /* @__PURE__ */ jsx6("span", { className: "yg-task-note", children: task.detail }),
      /* @__PURE__ */ jsx6("span", { className: showState ? "yg-task-state" : "yg-task-sr", children: stateName[task.state] })
    ] })
  ] });
}
function TaskList({ label, tasks }) {
  const complete = tasks.filter((task) => task.state === "done").length;
  const active = tasks.find((task) => task.state === "running")?.id;
  return /* @__PURE__ */ jsxs6("section", { className: "yg-task-list", "aria-label": label, children: [
    /* @__PURE__ */ jsxs6("header", { children: [
      /* @__PURE__ */ jsx6("strong", { children: label }),
      /* @__PURE__ */ jsxs6("span", { role: "status", children: [
        /* @__PURE__ */ jsxs6("span", { className: "yg-task-sr", children: [
          complete,
          " of ",
          tasks.length,
          " done"
        ] }),
        /* @__PURE__ */ jsxs6("span", { "aria-hidden": "true", children: [
          complete,
          "/",
          tasks.length
        ] })
      ] })
    ] }),
    tasks.length === 0 && /* @__PURE__ */ jsx6("p", { className: "yg-help", children: "No steps yet." }),
    /* @__PURE__ */ jsx6("ol", { children: tasks.map((task) => /* @__PURE__ */ jsx6("li", { "data-state": task.state, "data-active": active === task.id || void 0, children: task.steps?.length ? /* @__PURE__ */ jsxs6("details", { open: true, children: [
      /* @__PURE__ */ jsx6("summary", { className: "yg-task-line", children: /* @__PURE__ */ jsx6(TaskLine, { task }) }),
      /* @__PURE__ */ jsx6("ol", { className: "yg-task-children", children: task.steps.map((step) => /* @__PURE__ */ jsx6("li", { "data-state": step.state, className: "yg-task-line", children: /* @__PURE__ */ jsx6(TaskLine, { task: step }) }, step.id)) })
    ] }) : /* @__PURE__ */ jsx6("div", { className: "yg-task-line", children: /* @__PURE__ */ jsx6(TaskLine, { task }) }) }, task.id)) })
  ] });
}

export {
  MentionPicker,
  FileDrop,
  LetterLimit,
  MorphTooltipBar,
  StreamingReply,
  GhostSuggestion,
  PromptBox,
  ThinkingIndicator,
  PasswordStrength,
  CheckboxList,
  DetentDial,
  TaskList
};
