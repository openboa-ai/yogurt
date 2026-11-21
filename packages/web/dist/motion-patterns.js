"use client";
"use client";
import {
  ActivityIsland,
  CartButton,
  CopyButton,
  HoldButton,
  LoadingSuccessButton,
  SlideConfirm,
  StorageMeter
} from "./shared/chunk-NY3LGE3P.js";
import {
  Command
} from "./shared/chunk-KSGAYI2H.js";
import {
  Slider
} from "./shared/chunk-APSTFOQ4.js";
import {
  dist_exports8 as dist_exports
} from "./shared/chunk-6N7YZY36.js";
import "./shared/chunk-UNUSCUEY.js";
import {
  advanceSprings,
  playSprings,
  snap,
  spring
} from "./shared/chunk-DRQJWO7S.js";
import {
  Checkbox
} from "./shared/chunk-HFYCA3VK.js";
import "./shared/chunk-5GJUJT3P.js";
import {
  Button
} from "./shared/chunk-4IPCB3MM.js";
import {
  Icon
} from "./shared/chunk-GW3HPY4O.js";
import "./shared/chunk-5ZXHC2QO.js";

// packages/web/src/patterns/motion-inputs.tsx
import { useId, useLayoutEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function MentionPicker({ label, people, value, onChange }) {
  const id = useId();
  const input = useRef(null);
  const followingSelection = useRef(null);
  const marker = useRef(null);
  const [edges] = useState(() => [spring(4, 620, 36), spring(44, 190, 19)]);
  const markerOpen = useRef(false);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(null);
  const [active, setActive] = useState(0);
  const selection = Math.min(caret, value.length);
  const before = value.slice(0, selection);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? selection - match[1].length - 1 : -1;
  const end = start < 0 ? selection : selection + (value.slice(selection).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${selection}:${value}`;
  const options = match ? people.filter((person) => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = focused && !!match && dismissed !== tokenKey && options.length > 0;
  const index = Math.min(active, options.length - 1);
  useLayoutEffect(() => {
    const pill = marker.current;
    const list = pill?.parentElement;
    const row = list?.querySelector('[aria-selected="true"]');
    if (!pill || !list || !row || !open) {
      markerOpen.current = false;
      return;
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const [top, bottom] = edges;
    const y = row.offsetTop, end2 = y + row.offsetHeight;
    const forward = y >= top.target;
    const lead = forward ? bottom : top, trail = forward ? top : bottom;
    lead.stiffness = 620;
    lead.damping = 36;
    trail.stiffness = 190;
    trail.damping = 19;
    top.target = y;
    bottom.target = end2;
    if (!markerOpen.current || preference.matches) {
      snap(top, y);
      snap(bottom, end2);
    }
    markerOpen.current = true;
    if (y < list.scrollTop) list.scrollTop = y;
    else if (end2 > list.scrollTop + list.clientHeight && list.clientHeight > 0) {
      list.scrollTop = end2 - list.clientHeight;
    }
    let frame = 0, previous = performance.now();
    function paint() {
      pill?.style.setProperty("--yg-mention-top", `${top.position}px`);
      pill?.style.setProperty("--yg-mention-height", `${Math.max(0, bottom.position - top.position)}px`);
    }
    function tick(timestamp) {
      const moving = advanceSprings(edges, (timestamp - previous) / 1e3);
      previous = timestamp;
      paint();
      if (moving) frame = requestAnimationFrame(tick);
    }
    function changePreference() {
      if (!preference.matches) return;
      cancelAnimationFrame(frame);
      snap(top, top.target);
      snap(bottom, bottom.target);
      paint();
    }
    paint();
    if (!preference.matches) frame = requestAnimationFrame(tick);
    preference.addEventListener("change", changePreference);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", changePreference);
    };
  }, [edges, index, open, options.length]);
  function moveCaret(next) {
    input.current?.focus({ preventScroll: true });
    input.current?.setSelectionRange(next, next);
    setCaret(next);
  }
  useLayoutEffect(() => {
    const pending = followingSelection.current;
    if (pending?.value !== value) return;
    followingSelection.current = null;
    moveCaret(pending.caret);
  }, [value]);
  function select(person) {
    if (start < 0) return;
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    const next = value.slice(0, start) + replacement + space + suffix;
    setDismissed(null);
    setActive(0);
    if (next === value) moveCaret(nextCaret);
    else {
      followingSelection.current = { value: next, caret: nextCaret };
      onChange(next);
    }
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
            followingSelection.current = null;
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
      /* @__PURE__ */ jsx("div", { className: "yg-mention-layer", "data-open": open, style: { "--yg-mention-count": options.length }, children: /* @__PURE__ */ jsxs("div", { id: `${id}-list`, className: "yg-mention-list", role: "listbox", "aria-label": "People", inert: !open, children: [
        /* @__PURE__ */ jsx("span", { ref: marker, className: "yg-mention-marker", "aria-hidden": "true" }),
        options.map((person, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            id: `${id}-option-${i}`,
            role: "option",
            "aria-selected": i === index,
            type: "button",
            tabIndex: -1,
            style: { "--yg-mention-index": i },
            onPointerMove: (event) => {
              if (event.pointerType === "mouse") setActive(i);
            },
            onMouseDown: (event) => event.preventDefault(),
            onClick: () => select(person),
            children: [
              /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: Array.from(person.label)[0]?.toLocaleUpperCase() }),
              /* @__PURE__ */ jsx("b", { children: person.label })
            ]
          },
          person.id
        ))
      ] }) })
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
import { useId as useId3, useLayoutEffect as useLayoutEffect2, useRef as useRef3, useState as useState3 } from "react";

// packages/web/src/patterns/spring-picker-motion.ts
var clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
function animateSpringPicker(root) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const height = spring(0, 300, 23), lift = spring(0, 260, 24);
  const chevron = spring(0, 300, 18), alpha = spring(0, 400, 34);
  const press = spring(1, 500, 18), roll = spring(1, 340, 26);
  const top = spring(6, 620, 36), bottom = spring(50, 620, 36), highlightAlpha = spring(0, 400, 32);
  const springs = [height, lift, chevron, alpha, press, roll, top, bottom, highlightAlpha];
  let menu = null;
  let marker = null;
  let rows = [], runningSprings = springs;
  let active = -1, maxHeight = 0;
  let open = false, now = 0, frame = 0, value = root.dataset.value;
  function paint() {
    const fraction = maxHeight > 0 ? height.position / maxHeight : 0;
    root.style.setProperty("--yg-picker-lift-now", `${lift.position}px`);
    root.style.setProperty("--yg-picker-chevron-now", `${chevron.position * 180}deg`);
    root.style.setProperty("--yg-picker-press-now", String(press.position));
    root.style.setProperty("--yg-picker-roll-in", String(roll.position));
    if (!menu) return;
    menu.style.setProperty("--yg-picker-open", String(clamp(fraction, 0, 1.06)));
    menu.style.setProperty("--yg-picker-opacity", String(clamp(alpha.position)));
    rows.forEach(({ element, path, amount, check }) => {
      element.style.setProperty("--yg-picker-row", String(amount.position));
      if (path) path.style.strokeDashoffset = `${22 * (1 - clamp(check.position))}px`;
    });
    if (!marker) return;
    const y = clamp(Math.min(top.position, bottom.position - 16), 6, Math.max(6, maxHeight - 22));
    const end = clamp(bottom.position, y + 16, Math.max(y + 16, maxHeight - 6));
    marker.style.setProperty("--yg-spring-active-y", `${y}px`);
    marker.style.setProperty("--yg-spring-active-height", `${end - y}px`);
    marker.style.setProperty("--yg-spring-opacity", String(clamp(highlightAlpha.position)));
  }
  function tick(timestamp) {
    frame = 0;
    const elapsed = now ? (timestamp - now) / 1e3 : 0;
    now = timestamp;
    let waiting = false;
    rows.forEach((row) => {
      if (row.due === Infinity) return;
      if (timestamp < row.due) waiting = true;
      else {
        row.amount.target = Number(open);
        row.due = Infinity;
      }
    });
    const moving = advanceSprings(runningSprings, elapsed);
    paint();
    if (waiting || moving) frame = requestAnimationFrame(tick);
    else now = 0;
  }
  function play() {
    if (preference.matches || frame) return;
    now = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function highlight(index, immediately) {
    const row = rows[index]?.element;
    if (!row || index === active && !immediately) return;
    const y = row.offsetTop, end = y + row.offsetHeight;
    if (immediately || active < 0) {
      snap(top, y);
      snap(bottom, end);
    } else {
      const leading = index > active ? bottom : top;
      const trailing = index > active ? top : bottom;
      leading.stiffness = 620;
      leading.damping = 36;
      trailing.stiffness = 200;
      trailing.damping = 20;
      top.target = y;
      bottom.target = end;
    }
    active = index;
    highlightAlpha.target = 1;
    marker?.setAttribute("data-ready", "");
  }
  function update() {
    const list = root.querySelector(".yg-spring-menu");
    const trigger = root.querySelector(".yg-spring-trigger");
    const next = root.dataset.open === "true";
    let selected = -1;
    if (list !== menu) {
      if (menu) size.unobserve(menu);
      menu = list;
      if (menu) size.observe(menu);
      marker = list?.querySelector(".yg-spring-highlight") ?? null;
      active = -1;
    }
    if (list) {
      const elements = Array.from(list.querySelectorAll(".yg-spring-option"));
      const oldRows = new Map(rows.map((row) => [row.element, row]));
      selected = elements.findIndex((row) => row.dataset.state === "checked");
      rows = elements.map((element, index) => {
        const existing = oldRows.get(element);
        const checked = Number(index === selected);
        const row = existing ?? {
          element,
          path: element.querySelector(".yg-spring-check path"),
          amount: spring(open && !next ? 1 : 0, 300, 24),
          check: spring(checked, 260, 26),
          due: next ? performance.now() + 50 + index * 45 : Infinity
        };
        row.check.target = checked;
        return row;
      });
      maxHeight = list.offsetHeight;
    } else {
      rows = [];
    }
    runningSprings = [...springs, ...rows.flatMap((row) => [row.amount, row.check])];
    if (value !== root.dataset.value) {
      value = root.dataset.value;
      snap(roll, 0);
      roll.target = 1;
    }
    if (next !== open) {
      open = next;
      const time = performance.now();
      rows.forEach((row, index) => {
        row.due = time + (open ? 50 + index * 45 : (rows.length - 1 - index) * 20);
      });
      if (open) highlight(Math.max(0, selected), true);
      else {
        active = -1;
        highlightAlpha.target = 0;
      }
    }
    const shown = open && !!list;
    height.target = shown ? maxHeight : 0;
    alpha.target = chevron.target = Number(shown);
    const room = Math.max(0, (trigger?.getBoundingClientRect().top ?? 0) - lift.position - 16);
    lift.target = shown && list?.dataset.side === "bottom" ? -Math.min(room, (8 + maxHeight) / 2) : 0;
    if (shown) {
      const hovered = rows.findIndex((row) => row.element.hasAttribute("data-highlighted"));
      highlight(hovered >= 0 ? hovered : active >= 0 ? active : Math.max(0, selected), active < 0);
    }
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = now = 0;
      springs.forEach((s) => snap(s, s.target));
      rows.forEach((row) => {
        snap(row.amount, Number(open));
        snap(row.check, row.check.target);
      });
    }
    paint();
    play();
  }
  const changes = new MutationObserver(update);
  const size = new ResizeObserver(update);
  changes.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-open", "data-value", "data-side", "data-state", "data-highlighted"]
  });
  preference.addEventListener("change", update);
  update();
  return {
    press(scale) {
      if (preference.matches) return;
      press.position = scale;
      paint();
      play();
    },
    dispose() {
      changes.disconnect();
      size.disconnect();
      preference.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    }
  };
}

// packages/web/src/patterns/motion-layers.tsx
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
  const dismissTimer = useRef3(void 0);
  const keepSelectionVisible = useRef3(false);
  const motion = useRef3(null);
  const [open, setOpen] = useState3(false);
  const selected = options.find((option) => option.id === value);
  const [roll, setRoll] = useState3({ value, previous: void 0 });
  if (roll.value !== value) setRoll({ value, previous: roll.value });
  const previous = options.find((option) => option.id === roll.previous);
  useLayoutEffect2(() => {
    if (!portal) return;
    const controller = animateSpringPicker(portal);
    motion.current = controller;
    return () => {
      controller.dispose();
      motion.current = null;
    };
  }, [portal]);
  useLayoutEffect2(() => () => clearTimeout(dismissTimer.current), []);
  function changeOpen(open2) {
    if (!open2 && keepSelectionVisible.current) {
      keepSelectionVisible.current = false;
      return;
    }
    clearTimeout(dismissTimer.current);
    setOpen(open2);
    if (open2) motion.current?.press(0.965);
  }
  function select(next) {
    if (open && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      motion.current?.press(0.955);
      keepSelectionVisible.current = true;
      clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setOpen(false), 240);
    }
    onChange(next);
  }
  return /* @__PURE__ */ jsxs3("div", { ref: setPortal, className: "yg-spring-dropdown", "data-open": open, "data-value": value, children: [
    /* @__PURE__ */ jsx3("label", { id, className: "yg-spring-label", children: label }),
    /* @__PURE__ */ jsxs3(dist_exports.Root, { value, onValueChange: select, open, onOpenChange: changeOpen, children: [
      /* @__PURE__ */ jsxs3(dist_exports.Trigger, { className: "yg-spring-trigger", "aria-labelledby": id, children: [
        /* @__PURE__ */ jsxs3("span", { className: "yg-spring-value", children: [
          previous && /* @__PURE__ */ jsxs3("span", { className: "yg-spring-value-roll", "data-outgoing": true, "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "data-marker": previous.marker }),
            /* @__PURE__ */ jsx3("span", { className: "yg-spring-value-label", children: previous.label })
          ] }, `previous-${value}`),
          /* @__PURE__ */ jsxs3("span", { className: "yg-spring-value-roll", "data-incoming": previous ? "" : void 0, children: [
            /* @__PURE__ */ jsx3("span", { className: "yg-spring-symbol", "data-marker": selected?.marker, "aria-hidden": "true" }),
            /* @__PURE__ */ jsx3("span", { className: "yg-spring-value-label", children: /* @__PURE__ */ jsx3(dist_exports.Value, { placeholder: "Choose an option" }) })
          ] }, value)
        ] }),
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
      /* @__PURE__ */ jsx3(dist_exports.Portal, { container: portal, children: /* @__PURE__ */ jsx3(dist_exports.Content, { className: "yg-spring-menu", position: "popper", sideOffset: 8, collisionPadding: 16, children: /* @__PURE__ */ jsxs3(dist_exports.Viewport, { className: "yg-spring-viewport", children: [
        /* @__PURE__ */ jsx3("span", { className: "yg-spring-highlight", "aria-hidden": "true" }),
        options.map((option) => /* @__PURE__ */ jsxs3(dist_exports.Item, { value: option.id, className: "yg-spring-option", children: [
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
        ] }, option.id))
      ] }) }) })
    ] })
  ] });
}
function CommandButton({ label, items, onSelect }) {
  return /* @__PURE__ */ jsx3("div", { className: "yg-command-button", children: /* @__PURE__ */ jsx3(Command, { label, items, onSelect }) });
}

// packages/web/src/patterns/tooltip-bar.tsx
import { useEffect as useEffect2, useId as useId4, useLayoutEffect as useLayoutEffect3, useRef as useRef4, useState as useState4 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var unit = (value) => Math.min(1, Math.max(0, value));
function MorphTooltipBar({ label, tools, value, onChange }) {
  const id = useId4();
  const bar = useRef4(null);
  const hide = useRef4(void 0);
  const [active, setActive] = useState4(null);
  const lastActive = useRef4(null);
  const [dial] = useState4(() => ({
    tipLeft: spring(0, 620, 36),
    tipRight: spring(0, 620, 36),
    tail: spring(0, 300, 22),
    left: spring(0, 620, 36),
    right: spring(0, 620, 36),
    opacity: spring(0, 420, 24),
    labels: /* @__PURE__ */ new Map()
  }));
  useEffect2(() => () => clearTimeout(hide.current), []);
  useLayoutEffect3(() => {
    const root = bar.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll("button[data-tool]"));
    const labels = Array.from(root.querySelectorAll("[data-tooltip-label]"));
    let stop;
    const arrange = () => {
      const current = buttons.findIndex((button) => button.dataset.tool === active);
      const previous = buttons.findIndex((button) => button.dataset.tool === lastActive.current);
      const selected = buttons[current], description = labels[current];
      const inPlace = dial.opacity.position < 0.3;
      const direction = previous < 0 ? 0 : Math.sign((selected?.offsetLeft ?? 0) - (buttons[previous]?.offsetLeft ?? 0));
      if (selected && description) {
        const center = selected.offsetLeft + selected.offsetWidth / 2;
        const half = Math.min(description.offsetWidth / 2, root.clientWidth / 2);
        const left = Math.min(root.clientWidth - half * 2, Math.max(0, center - half));
        const tracks = [
          [dial.tipLeft, left],
          [dial.tipRight, left + half * 2],
          [dial.left, selected.offsetLeft],
          [dial.right, selected.offsetLeft + selected.offsetWidth],
          [dial.tail, center]
        ];
        for (const [track, target] of tracks) {
          if (inPlace) snap(track, target);
          else track.target = target;
        }
        if (direction) {
          const leading = direction > 0 ? [dial.tipRight, dial.right] : [dial.tipLeft, dial.left];
          const trailing = direction > 0 ? [dial.tipLeft, dial.left] : [dial.tipRight, dial.right];
          leading.forEach((track) => {
            track.stiffness = 620;
            track.damping = 36;
          });
          trailing.forEach((track) => {
            track.stiffness = 190;
            track.damping = 19;
          });
        }
        lastActive.current = active;
      }
      for (const node of labels) {
        const tool = node.dataset.tooltipLabel;
        const track = dial.labels.get(tool) ?? { visibility: spring(0, 420, 32), direction: 0 };
        dial.labels.set(tool, track);
        const visible = Number(tool === active);
        if (inPlace && selected) {
          snap(track.visibility, visible);
          track.direction = 0;
        } else if (selected && track.visibility.target !== visible) {
          track.direction = visible ? direction : -direction;
          track.visibility.target = visible;
        }
      }
      dial.opacity.target = Number(current >= 0);
      const axes = [
        dial.tipLeft,
        dial.tipRight,
        dial.tail,
        dial.left,
        dial.right,
        dial.opacity,
        ...labels.map((node) => dial.labels.get(node.dataset.tooltipLabel).visibility)
      ];
      stop?.();
      stop = playSprings(axes, () => {
        const shown = Math.min(1.15, Math.max(0, dial.opacity.position));
        const width = Math.max(30, dial.tipRight.position - dial.tipLeft.position);
        const start = Math.min(Math.max(0, dial.tipLeft.position), Math.max(0, root.clientWidth - width));
        const tail = Math.max(start + 8, Math.min(start + width - 8, dial.tail.position));
        root.style.setProperty("--yg-tooltip-open", String(shown));
        root.style.setProperty("--yg-tooltip-left", `${start}px`);
        root.style.setProperty("--yg-tooltip-width", `${width}px`);
        root.style.setProperty("--yg-tooltip-tail", `${tail}px`);
        root.style.setProperty("--yg-tooltip-marker", `${dial.left.position}px`);
        root.style.setProperty("--yg-tooltip-marker-width", `${Math.max(0, dial.right.position - dial.left.position)}px`);
        labels.forEach((node) => {
          const track = dial.labels.get(node.dataset.tooltipLabel);
          const opacity = unit(track.visibility.position);
          node.style.setProperty("--yg-tooltip-copy", String(opacity));
          node.style.setProperty("--yg-tooltip-copy-x", `${track.direction * (1 - opacity) * 14}px`);
        });
      });
    };
    arrange();
    const resize = new ResizeObserver(arrange);
    resize.observe(root);
    labels.forEach((node) => resize.observe(node));
    return () => {
      resize.disconnect();
      stop?.();
    };
  }, [active, dial, tools]);
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
import { useEffect as useEffect3, useId as useId5, useLayoutEffect as useLayoutEffect4, useRef as useRef5, useState as useState5 } from "react";
import { Fragment, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function StreamingReply({ value, active = false }) {
  const surface = useRef5(null);
  const reply = useRef5(null);
  const wait = useRef5(null);
  const wasActive = useRef5(active);
  const mounted = useRef5(false);
  const [motion] = useState5(() => ({ width: spring(0, 260, 26), height: spring(40, 260, 26), waiting: spring(1, 300, 30) }));
  const streaming = active || wasActive.current;
  useLayoutEffect4(() => {
    const box = surface.current, words = reply.current, thinking = wait.current;
    if (!box || !words || !thinking) return;
    let stop;
    const resize = () => {
      const max = box.clientWidth;
      box.style.setProperty("--yg-reply-available", `${max}px`);
      const inline = value ? max : Math.min(max, thinking.offsetWidth + 28);
      const block = Math.max(40, words.offsetHeight + 18);
      const waitOpacity = Number(active && !value);
      if (!mounted.current) {
        snap(motion.width, inline);
        snap(motion.height, block);
        snap(motion.waiting, waitOpacity);
      } else {
        motion.width.target = inline;
        motion.height.target = block;
        motion.waiting.target = waitOpacity;
      }
      mounted.current = true;
      stop?.();
      stop = playSprings(Object.values(motion), () => {
        box.style.setProperty("--yg-reply-width", `${motion.width.position}px`);
        box.style.setProperty("--yg-reply-height", `${motion.height.position}px`);
        box.style.setProperty("--yg-reply-waiting", String(motion.waiting.position));
      });
    };
    if (active) wasActive.current = true;
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(words);
    return () => {
      observer.disconnect();
      stop?.();
    };
  }, [active, motion, value]);
  return /* @__PURE__ */ jsx5("div", { ref: surface, className: "yg-streaming-shell", children: /* @__PURE__ */ jsxs5("div", { className: "yg-streaming-reply", "aria-busy": active || void 0, "data-streaming": streaming || void 0, children: [
    /* @__PURE__ */ jsx5("span", { ref: wait, className: "yg-streaming-wait", "aria-hidden": !active || !!value, children: active || value ? "Thinking" : "" }),
    /* @__PURE__ */ jsx5("div", { ref: reply, className: "yg-streaming-body", children: value && value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part : /* @__PURE__ */ jsx5("span", { className: "yg-streaming-word", children: part }, index)) })
  ] }) });
}
function SuggestionLetters({ text, interval, cap }) {
  return Array.from(text.matchAll(/\s+|\S+/gu), (match) => {
    const offset = match.index;
    return /^\s/u.test(match[0]) ? /* @__PURE__ */ jsx5("span", { children: match[0] }, offset) : /* @__PURE__ */ jsx5("span", { className: "yg-ghost-word", children: Array.from(match[0], (letter, i) => /* @__PURE__ */ jsx5("span", { style: { animationDelay: `${Math.min((offset + i) * interval, cap)}ms` }, children: letter }, i)) }, offset);
  });
}
function GhostSuggestion({ value, suggestion, onChange }) {
  const id = useId5();
  const [atEnd, setAtEnd] = useState5(true);
  const [accepted, setAccepted] = useState5(null);
  const suffix = value && suggestion.startsWith(value) ? suggestion.slice(value.length) : "";
  const show = atEnd && !!suffix;
  const rolling = accepted && accepted.prefix + accepted.suffix === value;
  useEffect3(() => {
    if (!accepted) return;
    const timer = setTimeout(() => setAccepted(null), Math.min(400, Array.from(accepted.suffix).length * 16) + 420);
    return () => clearTimeout(timer);
  }, [accepted]);
  return /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-field", children: [
    /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-head", children: [
      /* @__PURE__ */ jsx5("label", { htmlFor: id, children: "Your message" }),
      show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-key", "aria-hidden": "true", children: "Tab \u21B9" })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-input", children: [
      /* @__PURE__ */ jsxs5("div", { className: "yg-ghost-mirror", "aria-hidden": "true", "data-accepted": rolling || void 0, children: [
        /* @__PURE__ */ jsx5("span", { children: rolling ? accepted.prefix : value }),
        show && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-suffix", children: /* @__PURE__ */ jsx5(SuggestionLetters, { text: suffix, interval: 8, cap: 200 }) }),
        rolling && /* @__PURE__ */ jsx5("span", { className: "yg-ghost-accepted", children: /* @__PURE__ */ jsx5(SuggestionLetters, { text: accepted.suffix, interval: 16, cap: 400 }) })
      ] }),
      /* @__PURE__ */ jsx5(
        "textarea",
        {
          rows: 2,
          id,
          value,
          autoComplete: "off",
          "aria-describedby": show ? `${id}-hint` : void 0,
          "data-accepted": rolling || void 0,
          onChange: (event) => {
            setAccepted(null);
            onChange(event.currentTarget.value);
            setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length);
          },
          onSelect: (event) => setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length),
          onKeyDown: (event) => {
            if (show && (event.key === "Tab" || event.key === "ArrowRight") && !event.nativeEvent.isComposing) {
              event.preventDefault();
              setAccepted({ prefix: value, suffix });
              onChange(suggestion);
            }
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx5("span", { className: "yg-ghost-hint", id: `${id}-hint`, "aria-hidden": !show, "data-visible": show, children: "Press Tab or right arrow to accept" })
  ] });
}
function PromptBox({ value, onChange, onSubmit, busy = false, onCancel }) {
  const editor = useRef5(null);
  const measure = useRef5(null);
  useLayoutEffect4(() => {
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
        /* @__PURE__ */ jsx5("div", { className: "yg-prompt-panel", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status-slot", children: /* @__PURE__ */ jsx5("div", { className: "yg-prompt-status", role: "status", children: busy && /* @__PURE__ */ jsxs5(Fragment, { children: [
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
  const node = useRef5(null);
  useLayoutEffect4(() => {
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
import { useLayoutEffect as useLayoutEffect5, useRef as useRef6, useState as useState6 } from "react";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function ExpandCard({ title, children }) {
  const card = useRef6(null);
  const [open, setOpen] = useState6(false);
  const [motion] = useState6(() => ({ shape: spring(0, 240, 21), copy: spring(0, 260, 28) }));
  useLayoutEffect5(() => {
    const root = card.current;
    if (!root) return;
    motion.shape.target = Number(open);
    if (!open) motion.copy.target = 0;
    const paint = () => {
      root.style.setProperty("--yg-card-expansion", String(motion.shape.position));
      root.style.setProperty("--yg-card-content", String(motion.copy.position));
    };
    const states = Object.values(motion);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open && reduced) motion.copy.target = 1;
    let stop = playSprings(states, paint);
    const reveal = open && !reduced ? setTimeout(() => {
      motion.copy.target = 1;
      stop();
      stop = playSprings(states, paint);
    }, 160) : void 0;
    return () => {
      clearTimeout(reveal);
      stop();
    };
  }, [motion, open]);
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
  const [selectedId, setSelectedId] = useState6(null);
  const [highlight, setHighlight] = useState6(null);
  const [pointer, setPointer] = useState6(false);
  const [keyboard, setKeyboard] = useState6(false);
  const selected = items.find((item) => item.id === selectedId);
  const list = useRef6(null);
  const [spread] = useState6(() => spring(0, 220, 18));
  const tracks = useRef6(/* @__PURE__ */ new Map());
  const kick = useRef6(null);
  useLayoutEffect5(() => {
    const root = list.current;
    if (!root || items.length > 3) return;
    const buttons = Array.from(root.querySelectorAll("button[data-card]"));
    const active = pointer || keyboard;
    spread.target = Number(active);
    const states = [spread];
    const live = new Set(items.map((item) => item.id));
    tracks.current.forEach((_, id) => {
      if (!live.has(id)) tracks.current.delete(id);
    });
    const rows = buttons.map((button, index) => {
      const id = button.dataset.card;
      const tracksForCard = tracks.current.get(id) ?? { lift: spring(0, 420, 20), scale: spring(1, 420, 22) };
      const featured = highlight ?? selectedId ?? items[Math.floor(items.length / 2)]?.id;
      const hot = active && id === featured;
      button.toggleAttribute("data-front", id === featured);
      tracksForCard.lift.target = hot ? -22 : 0;
      tracksForCard.scale.target = hot ? 1.06 : 1;
      if (id === kick.current) tracksForCard.lift.velocity = -260;
      states.push(tracksForCard.lift, tracksForCard.scale);
      tracks.current.set(id, tracksForCard);
      button.style.zIndex = id === featured ? "5" : index === 1 ? "3" : "2";
      return { button, tracks: tracksForCard, index: index - (items.length - 1) / 2 };
    });
    kick.current = null;
    const render = () => {
      const width = root.offsetWidth;
      const compact = width <= 290;
      const room = Math.min(78, Math.max(10, (width - (compact ? 184 : 166)) / 2));
      const angle = compact ? 5 : 9;
      rows.forEach(({ button, tracks: tracks2, index }) => {
        const x = index * (6 + spread.position * (room - 6));
        const y = Math.abs(index) * spread.position * 12 + tracks2.lift.position;
        button.style.setProperty("--yg-fan-transform", `translate(calc(-50% + ${x}px), ${y}px) rotate(${index * (3 + spread.position * angle)}deg) scale(${tracks2.scale.position})`);
      });
    };
    let stop = playSprings(states, render);
    const sizes = new ResizeObserver(() => {
      stop();
      stop = playSprings(states, render);
    });
    sizes.observe(root);
    return () => {
      sizes.disconnect();
      stop();
    };
  }, [highlight, items, keyboard, pointer, selectedId, spread]);
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
            onClick: () => {
              kick.current = item.id;
              setSelectedId(item.id === selectedId ? null : item.id);
            },
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
  const stroke = useRef6(null), fill = useRef6(null);
  const dot = useRef6(null);
  const axes = useRef6([]);
  useLayoutEffect5(() => {
    const safe = values.map((value) => Number.isFinite(value) ? value : 0);
    if (axes.current.length !== safe.length) axes.current = safe.map((value) => spring(value, 200, 17));
    const points = axes.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    function paint() {
      if (!points.length) return;
      const coordinates = points.map(({ position }, i) => [
        4 + i / Math.max(1, points.length - 1) * 288,
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
    }
    let frame = 0, previous = performance.now(), start = previous;
    function tick(time) {
      let waiting = false;
      points.forEach((point, index) => {
        if (time - start < index * 30) waiting = true;
        else point.target = safe[index];
      });
      const moving = advanceSprings(points, (time - previous) / 1e3);
      previous = time;
      paint();
      if (moving || waiting) frame = requestAnimationFrame(tick);
      else frame = 0;
    }
    function sync() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        points.forEach((point, index) => snap(point, safe[index]));
        paint();
      } else {
        paint();
        start = previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, [values]);
  return /* @__PURE__ */ jsxs6("svg", { viewBox: "0 0 296 96", className: "yg-stat-series", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx6("path", { ref: fill, className: "yg-stat-area" }),
    /* @__PURE__ */ jsx6("path", { ref: stroke, className: "yg-stat-line" }),
    /* @__PURE__ */ jsx6("circle", { ref: dot, r: "4" })
  ] });
}
function StatCard({ label, value, detail, series }) {
  const total = useRef6(null);
  const [motion] = useState6(() => spring(value, 160, 22));
  useLayoutEffect5(() => {
    motion.target = value;
    if (!Number.isFinite(value) || !Number.isFinite(motion.position)) {
      snap(motion, value);
      return;
    }
    return playSprings([motion], () => {
      if (total.current) total.current.textContent = (Number.isInteger(value) ? Math.round(motion.position) : Math.round(motion.position * 10) / 10).toLocaleString();
    });
  }, [motion, value]);
  return /* @__PURE__ */ jsxs6("section", { className: "yg-stat-card", "aria-label": label, children: [
    /* @__PURE__ */ jsxs6("div", { className: "yg-stat-heading", children: [
      /* @__PURE__ */ jsxs6("div", { children: [
        /* @__PURE__ */ jsx6("span", { className: "yg-stat-label", children: label }),
        /* @__PURE__ */ jsx6("strong", { className: "yg-stat-value", ref: total, children: value.toLocaleString() })
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
    children != null && /* @__PURE__ */ jsxs6("details", { children: [
      /* @__PURE__ */ jsxs6("summary", { children: [
        "More about ",
        name
      ] }),
      /* @__PURE__ */ jsx6("div", { className: "yg-profile-extra", children })
    ] }),
    actions
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { useId as useId7, useLayoutEffect as useLayoutEffect7, useRef as useRef8, useState as useState7 } from "react";

// packages/web/src/patterns/elastic-range.tsx
import { useId as useId6, useLayoutEffect as useLayoutEffect6, useRef as useRef7 } from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var clamp2 = (n, min, max) => Math.min(max, Math.max(min, n));
var radius = 12;
function animateRange(element, initial) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const thumb = spring(0, 900, 50), dropX = spring(0, 260, 18);
  const dropY = spring(16, 420, 22), dropScale = spring(0.5, 420, 22), press = spring(1, 520, 16);
  const tracks = [thumb, dropX, dropY, dropScale, press];
  let ratio = initial, width = 0, frame = 0, previous = 0;
  const x = () => radius + ratio * Math.max(1, width - radius * 2);
  function paint() {
    const stretch = 1 + Math.min(Math.abs(thumb.velocity) / 2400, 0.4);
    element.style.setProperty("--yg-elastic-thumb", `${thumb.position}px`);
    element.style.setProperty("--yg-elastic-fill", `${clamp2(thumb.position, 0, width) * clamp2((thumb.position - radius) / radius, 0, 1)}px`);
    element.style.setProperty("--yg-elastic-stretch", String(stretch * press.position));
    element.style.setProperty("--yg-elastic-squash", String(press.position / stretch));
    element.style.setProperty("--yg-elastic-drop-x", `${dropX.position}px`);
    element.style.setProperty("--yg-elastic-drop-y", `${dropY.position}px`);
    element.style.setProperty("--yg-elastic-drop-scale", String(dropScale.position));
    element.style.setProperty("--yg-elastic-tilt", `${clamp2((dropX.position - thumb.position) * 0.9, -28, 28)}deg`);
    element.style.setProperty("--yg-elastic-label-opacity", String(clamp2((dropScale.position - 0.7) / 0.25, 0, 1)));
  }
  function tick(time) {
    dropX.target = thumb.position;
    const moving = advanceSprings(tracks, (time - previous) / 1e3);
    previous = time;
    paint();
    frame = moving ? requestAnimationFrame(tick) : 0;
  }
  function wake() {
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      snap(thumb, x());
      snap(dropX, thumb.position);
      [dropY, dropScale, press].forEach((track) => snap(track, track.target));
      paint();
    } else if (!frame) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
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
  preference.addEventListener("change", wake);
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
      const edge = clamp2(raw, radius, limit);
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
      preference.removeEventListener("change", wake);
      cancelAnimationFrame(frame);
    }
  };
}
function ElasticRange({ label, value, min, max, step, onChange, formatValue }) {
  const id = useId6(), filter = useId6();
  const rail = useRef7(null), hit = useRef7(null);
  const motion = useRef7(null);
  const drag = useRef7(null);
  const hover = useRef7(false), focused = useRef7(false);
  const ratio = max > min ? clamp2((value - min) / (max - min), 0, 1) : 0;
  const valueOnMount = useRef7(ratio);
  useLayoutEffect6(() => {
    if (!rail.current) return;
    const controller = animateRange(rail.current, valueOnMount.current);
    motion.current = controller;
    return () => {
      controller.dispose();
      motion.current = null;
    };
  }, []);
  useLayoutEffect6(() => {
    motion.current?.controlled(ratio, drag.current !== null);
  }, [ratio]);
  function sync() {
    motion.current?.presence(drag.current !== null, focused.current, hover.current);
  }
  function aim(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const raw = rtl ? rect.right - event.clientX : event.clientX - rect.left;
    const next = clamp2((raw - radius) / Math.max(1, rect.width - radius * 2), 0, 1);
    const increment = Number.isFinite(step) && step > 0 ? step : 1;
    const value2 = clamp2(min + Math.round((max - min) * next / increment) * increment, min, max);
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
    const next = event.key === "Home" ? min : event.key === "End" ? max : clamp2(value + offsets[event.key] * step, min, max);
    focused.current = true;
    sync();
    onChange(Number(next.toFixed(10)));
  }
  return /* @__PURE__ */ jsxs7("div", { className: "yg-elastic-range", children: [
    /* @__PURE__ */ jsx7("label", { htmlFor: id, children: label }),
    /* @__PURE__ */ jsx7("svg", { width: "0", height: "0", "aria-hidden": "true", children: /* @__PURE__ */ jsx7("defs", { children: /* @__PURE__ */ jsxs7("filter", { id: filter, x: "-30%", y: "-100%", width: "160%", height: "240%", children: [
      /* @__PURE__ */ jsx7("feGaussianBlur", { stdDeviation: "8", result: "blur" }),
      /* @__PURE__ */ jsx7("feColorMatrix", { in: "blur", type: "matrix", values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10" })
    ] }) }) }),
    /* @__PURE__ */ jsxs7(
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
          /* @__PURE__ */ jsx7("span", { className: "yg-elastic-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx7("i", {}) }),
          /* @__PURE__ */ jsxs7("span", { className: "yg-elastic-goo", "aria-hidden": "true", style: { filter: `url(#${filter})` }, children: [
            /* @__PURE__ */ jsx7("i", { className: "yg-elastic-thumb" }),
            /* @__PURE__ */ jsx7("i", { className: "yg-elastic-drop" })
          ] }),
          /* @__PURE__ */ jsx7("span", { className: "yg-elastic-value", "aria-hidden": "true", children: formatValue(value) }),
          /* @__PURE__ */ jsx7(
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
    /* @__PURE__ */ jsx7("div", { className: "yg-elastic-marks", "aria-hidden": "true", children: Array.from({ length: 21 }, (_, i) => /* @__PURE__ */ jsx7(
      "i",
      {
        "data-major": i % 5 === 0 || void 0,
        "data-passed": i / 20 <= ratio && ratio > 0 || void 0
      },
      i
    )) }),
    /* @__PURE__ */ jsx7("div", { className: "yg-elastic-labels", "aria-hidden": "true", children: [0, 0.25, 0.5, 0.75, 1].map((position) => /* @__PURE__ */ jsx7("span", { style: { "--yg-scale-position": position }, children: formatValue(min + position * (max - min)) }, position)) })
  ] });
}

// packages/web/src/patterns/motion-stepped.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
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
  const interval = useRef8(null);
  const activeDrag = useRef8(null);
  const [trackWidth, setTrackWidth] = useState7(0);
  const percent = (number) => max > min ? Math.max(0, Math.min(100, (number - min) / (max - min) * 100)) : 0;
  const first = percent(value);
  const last = end === void 0 ? first : percent(end);
  const [motion] = useState7(() => ({
    start: spring(first, 260, 24),
    end: spring(last, 260, 24),
    merge: spring(0, 300, 26)
  }));
  useLayoutEffect7(() => {
    const rail = interval.current;
    const root = rail?.parentElement;
    if (!rail || !root) return;
    const firstTip = rail.querySelector('[data-tip="start"]');
    const lastTip = rail.querySelector('[data-tip="end"]');
    const joinedTip = rail.querySelector('[data-tip="joined"]');
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const tracks = Object.values(motion);
    let frame = 0, previous = performance.now(), width = 0, need = 0;
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
    function tick(now) {
      targetMerge();
      const moving = advanceSprings(tracks, (now - previous) / 1e3);
      previous = now;
      paint();
      frame = moving ? requestAnimationFrame(tick) : 0;
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
      motion.start.target = first;
      motion.end.target = last;
      cancelAnimationFrame(frame);
      if (media.matches) {
        snap(motion.start, first);
        snap(motion.end, last);
        targetMerge();
        snap(motion.merge, motion.merge.target);
        paint();
      } else {
        previous = performance.now();
        paint();
        frame = requestAnimationFrame(tick);
      }
    }
    work();
    const size = new ResizeObserver(work);
    size.observe(rail);
    if (firstTip) size.observe(firstTip);
    if (lastTip) size.observe(lastTip);
    if (joinedTip) size.observe(joinedTip);
    media.addEventListener("change", work);
    return () => {
      size.disconnect();
      media.removeEventListener("change", work);
      cancelAnimationFrame(frame);
    };
  }, [first, last, motion]);
  if (end === void 0 || !onEndChange) {
    if (presentation === "elastic") {
      return /* @__PURE__ */ jsx8(ElasticRange, { label, value, onChange, min, max, step, formatValue });
    }
    return /* @__PURE__ */ jsx8(
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
  return /* @__PURE__ */ jsxs8(
    "div",
    {
      className: "yg-motion-range",
      "data-interval": "",
      role: "group",
      "aria-labelledby": id,
      style: { "--yg-range-start": `${first}%`, "--yg-range-end": `${last}%` },
      children: [
        /* @__PURE__ */ jsxs8("div", { className: "yg-motion-range-heading", children: [
          /* @__PURE__ */ jsx8("strong", { id, children: label }),
          detail && /* @__PURE__ */ jsx8("span", { children: detail })
        ] }),
        /* @__PURE__ */ jsxs8(
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
              /* @__PURE__ */ jsx8("span", { className: "yg-motion-interval-track", "aria-hidden": "true", children: /* @__PURE__ */ jsx8("span", {}) }),
              /* @__PURE__ */ jsx8("span", { className: "yg-motion-range-tip", "data-tip": "start", "aria-hidden": "true", children: formatValue(value) }),
              /* @__PURE__ */ jsx8("span", { className: "yg-motion-range-tip", "data-tip": "end", "aria-hidden": "true", children: formatValue(end) }),
              /* @__PURE__ */ jsxs8("span", { className: "yg-motion-range-tip", "data-tip": "joined", "aria-hidden": "true", children: [
                formatValue(value),
                "\u2013",
                formatValue(end)
              ] }),
              /* @__PURE__ */ jsx8(
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
              /* @__PURE__ */ jsx8(
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
  const [shown, setShown] = useState7(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  const meter = useRef8(null);
  const [bars] = useState7(() => Array.from({ length: 4 }, () => spring(0, 260, 24)));
  useLayoutEffect7(() => {
    const fill = Array.from(meter.current?.querySelectorAll("i") ?? []);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop;
    const paint = () => fill.forEach((bar, index) => {
      bar.style.scale = `${Math.max(0, Math.min(1, bars[index].position))} 1`;
    });
    const timers = bars.map((bar, index) => {
      const target = Number(index < score);
      if (reduced) {
        snap(bar, target);
        return void 0;
      }
      return setTimeout(() => {
        bar.target = target;
        stop?.();
        stop = playSprings(bars, paint);
      }, index * 60);
    });
    paint();
    return () => {
      timers.forEach(clearTimeout);
      stop?.();
    };
  }, [bars, score]);
  return /* @__PURE__ */ jsxs8("div", { className: "yg-motion-password", "data-score": score, children: [
    /* @__PURE__ */ jsx8("label", { htmlFor: id, children: "Create a password" }),
    /* @__PURE__ */ jsxs8("div", { className: "yg-motion-password-field", children: [
      /* @__PURE__ */ jsx8(
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
      /* @__PURE__ */ jsx8(
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
          children: /* @__PURE__ */ jsxs8("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx8("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
            /* @__PURE__ */ jsx8("circle", { cx: "12", cy: "12", r: "2.8" }),
            /* @__PURE__ */ jsx8("path", { className: "yg-motion-password-slash", d: "M4.5 4.5l15 15" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "yg-motion-password-meter", ref: meter, "aria-hidden": "true", children: bars.map((_, index) => /* @__PURE__ */ jsx8("span", { children: /* @__PURE__ */ jsx8("i", {}) }, index)) }),
    /* @__PURE__ */ jsxs8("div", { className: "yg-motion-password-checks", children: [
      /* @__PURE__ */ jsx8("span", { role: "status", children: /* @__PURE__ */ jsx8("strong", { children: word }, word) }),
      /* @__PURE__ */ jsx8("span", { id: `${id}-checks`, children: "8+ characters, mixed case, a number and a symbol" })
    ] })
  ] });
}
function CheckboxList({ options, value, onChange }) {
  const count = options.filter((option) => value.includes(option.id)).length;
  return /* @__PURE__ */ jsxs8("fieldset", { className: "yg-motion-checklist", children: [
    /* @__PURE__ */ jsx8("legend", { children: "Choose options" }),
    /* @__PURE__ */ jsxs8("div", { className: "yg-motion-checklist-heading", children: [
      /* @__PURE__ */ jsx8("strong", { children: "Today" }),
      /* @__PURE__ */ jsxs8("span", { children: [
        /* @__PURE__ */ jsx8("b", { children: count }),
        " of ",
        options.length,
        " done"
      ] })
    ] }),
    options.map(
      (option) => /* @__PURE__ */ jsx8(
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
  return /* @__PURE__ */ jsxs8("div", { className: "yg-motion-dial", children: [
    /* @__PURE__ */ jsx8("label", { htmlFor: id, children: "Selection" }),
    /* @__PURE__ */ jsxs8("div", { className: "yg-motion-dial-face", style: { "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` }, children: [
      /* @__PURE__ */ jsx8("span", { className: "yg-motion-dial-marker", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx8("span", { className: "yg-motion-dial-value", children: options[index]?.label ?? "No selection" })
    ] }),
    /* @__PURE__ */ jsx8("input", { id, type: "range", min: 0, max: Math.max(0, options.length - 1), step: 1, value: selected, disabled: !options.length, "aria-valuetext": options[index]?.label ?? "No selection", onChange: (event) => choose(event.currentTarget.valueAsNumber), onKeyDown: (event) => {
      if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) {
        event.preventDefault();
        choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1));
      }
    } }),
    /* @__PURE__ */ jsx8("div", { className: "yg-motion-dial-options", "aria-hidden": "true", children: options.map((option) => /* @__PURE__ */ jsx8("span", { "data-selected": option.id === value || void 0, children: option.label }, option.id)) })
  ] });
}

// packages/web/src/patterns/motion-task-list.tsx
import { Fragment as Fragment2, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var stateName = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed"
};
function TaskLine({ task }) {
  const showState = task.state === "failed";
  return /* @__PURE__ */ jsxs9(Fragment2, { children: [
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
