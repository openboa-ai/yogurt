"use client";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  IconButton
} from "./chunk-JHTLYLR5.js";
import {
  Icon,
  cx
} from "./chunk-A5HC7UHE.js";

// packages/web/src/controls/select-picker.tsx
import { useId, useLayoutEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectItemText, SelectTrigger, SelectValue } from "@ui-sdk/react/select";

// packages/web/src/controls/spring-picker-motion.ts
var clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
function animateSpringPicker(root) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const height = spring(0, 300, 23);
  const chevron = spring(0, 300, 18), alpha = spring(0, 400, 34);
  const press = spring(1, 500, 18), roll = spring(1, 340, 26);
  const top = spring(6, 620, 36), bottom = spring(50, 620, 36), highlightAlpha = spring(0, 400, 32);
  const springs = [height, chevron, alpha, press, roll, top, bottom, highlightAlpha];
  let menu = null;
  let marker = null;
  let rows = [], runningSprings = springs;
  let active = -1, maxHeight = 0;
  let open = false, now = 0, frame = 0, value = root.dataset.value;
  function paint() {
    const fraction = maxHeight > 0 ? height.position / maxHeight : 0;
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
      selected = elements.findIndex((row) => row.hasAttribute("data-selected"));
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
    attributeFilter: ["data-open", "data-value", "data-side", "data-selected", "data-highlighted"]
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

// packages/web/src/controls/select-picker.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function SelectPicker({ label, value, onChange, options }) {
  const id = useId();
  const root = useRef(null);
  const motion = useRef(null);
  const [open, setOpen] = useState(false);
  const previousValue = useRef(value);
  const [roll, setRoll] = useState({ current: value });
  if (value !== roll.current) setRoll({ current: value, previous: roll.current });
  const selected = options.find((option) => option.id === value);
  const previous = options.find((option) => option.id === roll.previous);
  useLayoutEffect(() => {
    if (!root.current) return;
    motion.current = animateSpringPicker(root.current);
    return () => {
      motion.current?.dispose();
      motion.current = null;
    };
  }, []);
  useLayoutEffect(() => {
    if (previousValue.current !== value) motion.current?.press(0.955);
    previousValue.current = value;
  }, [value]);
  return /* @__PURE__ */ jsxs("div", { ref: root, className: "yg-spring-dropdown", "data-open": open, "data-value": value, children: [
    /* @__PURE__ */ jsx("span", { id, className: "yg-spring-label", children: label }),
    /* @__PURE__ */ jsxs(
      Select,
      {
        value,
        open,
        onOpenChange: setOpen,
        onValueChange: (next) => {
          if (next !== null && next !== value) onChange(next);
        },
        children: [
          /* @__PURE__ */ jsxs(
            SelectTrigger,
            {
              className: "yg-spring-trigger",
              "aria-labelledby": id,
              onPointerDown: () => motion.current?.press(0.965),
              children: [
                /* @__PURE__ */ jsxs("span", { className: "yg-spring-value", children: [
                  previous && /* @__PURE__ */ jsxs("span", { className: "yg-spring-value-roll", "data-outgoing": "", "aria-hidden": "true", children: [
                    /* @__PURE__ */ jsx("span", { className: "yg-spring-symbol", "data-marker": previous.marker }),
                    /* @__PURE__ */ jsx("span", { className: "yg-spring-value-label", children: previous.label })
                  ] }, `previous-${value}`),
                  /* @__PURE__ */ jsxs("span", { className: "yg-spring-value-roll", "data-incoming": previous ? "" : void 0, children: [
                    /* @__PURE__ */ jsx("span", { className: "yg-spring-symbol", "data-marker": selected?.marker, "aria-hidden": "true" }),
                    /* @__PURE__ */ jsx(SelectValue, { className: "yg-spring-value-label", placeholder: "Choose an option" })
                  ] }, value)
                ] }),
                /* @__PURE__ */ jsx(
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
                    children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(SelectContent, { className: "yg-spring-menu", sideOffset: 8, collisionPadding: 16, align: "start", alignItemWithTrigger: false, children: /* @__PURE__ */ jsxs("div", { className: "yg-spring-viewport", children: [
            /* @__PURE__ */ jsx("span", { className: "yg-spring-highlight", "aria-hidden": "true" }),
            options.map((option) => /* @__PURE__ */ jsxs(SelectItem, { value: option.id, label: option.label, className: "yg-spring-option", children: [
              /* @__PURE__ */ jsx("span", { className: "yg-spring-symbol", "data-marker": option.marker, "aria-hidden": "true" }),
              /* @__PURE__ */ jsx(SelectItemText, {}),
              /* @__PURE__ */ jsx(
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
                  children: /* @__PURE__ */ jsx("path", { d: "m5 12.5 4.5 4.5L19 7.5", pathLength: "22" })
                }
              )
            ] }, option.id))
          ] }) })
        ]
      }
    )
  ] });
}

// packages/web/src/controls/choice-cards.tsx
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function ChoiceCards({
  label,
  value,
  onChange,
  options,
  groupClass,
  itemClass,
  children
}) {
  return /* @__PURE__ */ jsx2(
    RadioGroup,
    {
      className: groupClass,
      "aria-label": label,
      value,
      onValueChange: (next) => {
        if (next !== null) onChange(next);
      },
      children: options.map((option) => /* @__PURE__ */ jsxs2("label", { className: itemClass, "data-selected": value === option.id || void 0, children: [
        /* @__PURE__ */ jsx2(Radio, { value: option.id }),
        children(option)
      ] }, option.id))
    }
  );
}
function FocusPicker(props) {
  return /* @__PURE__ */ jsx2(ChoiceCards, { ...props, label: "Focus", groupClass: "yg-focus-picker", itemClass: "yg-focus-choice", children: (option) => /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsx2("span", { className: "yg-focus-orbit", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs2("span", { className: "yg-choice-copy", children: [
      /* @__PURE__ */ jsx2("strong", { children: option.label }),
      /* @__PURE__ */ jsx2("span", { children: option.description })
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
  ] }) });
}
function PlanSwitch(props) {
  return /* @__PURE__ */ jsx2(ChoiceCards, { ...props, label: "Plan", groupClass: "yg-plan-switch", itemClass: "yg-plan-choice", children: (option) => /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsxs2("span", { className: "yg-plan-heading", children: [
      /* @__PURE__ */ jsx2("strong", { children: option.label }),
      /* @__PURE__ */ jsx2("span", { className: "yg-choice-check", "aria-hidden": "true", children: "\u2713" })
    ] }),
    /* @__PURE__ */ jsx2("span", { className: "yg-plan-price", children: option.price }),
    /* @__PURE__ */ jsx2("span", { className: "yg-plan-description", children: option.description })
  ] }) });
}

// packages/web/src/controls/forms.tsx
import {
  useEffect,
  useId as useId2,
  useLayoutEffect as useLayoutEffect2,
  useRef as useRef2,
  useState as useState2
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea, createInputController } from "@ui-sdk/react/textarea";
import {
  Combobox as SDKCombobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  createComboboxController
} from "@ui-sdk/react/combobox";
import { Switch as SDKSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { Checkbox as SDKCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { RadioGroup as SDKRadio, Radio as SDKRadioItem, RadioIndicator } from "@ui-sdk/react/radio";
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Label(props) {
  return /* @__PURE__ */ jsx3("label", { ...props, className: cx("yg-label", props.className) });
}
function HelpText(props) {
  return /* @__PURE__ */ jsx3("p", { ...props, className: cx("yg-help", props.className) });
}
function FieldError(props) {
  return /* @__PURE__ */ jsx3("p", { ...props, className: cx("yg-error", props.className) });
}
function describedBy(...values) {
  const ids = values.flatMap((value) => typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean) : []);
  return [...new Set(ids)].join(" ") || void 0;
}
function Field({
  id,
  label,
  help,
  error,
  labelEnd,
  children
}) {
  const fallback = useId2();
  const input = id ?? fallback;
  const description = [help && input + "-help", error && input + "-error"].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ jsxs3("div", { className: "yg-field", children: [
    labelEnd ? /* @__PURE__ */ jsxs3("div", { className: "yg-ghost-head", children: [
      /* @__PURE__ */ jsx3(Label, { htmlFor: input, children: label }),
      labelEnd
    ] }) : /* @__PURE__ */ jsx3(Label, { htmlFor: input, children: label }),
    children({
      id: input,
      "aria-describedby": description,
      "aria-invalid": error ? true : void 0
    }),
    help && /* @__PURE__ */ jsx3(HelpText, { id: input + "-help", children: help }),
    error && /* @__PURE__ */ jsx3(FieldError, { id: input + "-error", children: error })
  ] });
}
function SpringTextInput({ value, defaultValue, onSelect, ...props }) {
  return /* @__PURE__ */ jsx3(
    SDKInput,
    {
      ...props,
      value: value == null ? void 0 : String(value),
      defaultValue: defaultValue == null ? void 0 : String(defaultValue),
      render: onSelect ? /* @__PURE__ */ jsx3("input", { onSelect }) : void 0,
      onValueChange: (next, details) => {
        if (details.reason === "imperative" && props.maxLength !== void 0 && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
      }
    }
  );
}
function TextField({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  motion,
  size = "regular",
  ...props
}) {
  return /* @__PURE__ */ jsx3(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx3(SDKInputGroup, { className: cx("yg-input", `yg-input-size-${size}`, className), children: motion === "spring" && (props.type ?? "text") === "text" && !Array.isArray(value) && !Array.isArray(defaultValue) ? /* @__PURE__ */ jsx3(
    SpringTextInput,
    {
      ...props,
      ...binding,
      "aria-describedby": describedBy(props["aria-describedby"], binding["aria-describedby"]),
      "aria-invalid": binding["aria-invalid"] ?? props["aria-invalid"],
      value,
      defaultValue
    }
  ) : /* @__PURE__ */ jsx3(
    SDKInput,
    {
      ...props,
      ...binding,
      "aria-describedby": describedBy(props["aria-describedby"], binding["aria-describedby"]),
      "aria-invalid": binding["aria-invalid"] ?? props["aria-invalid"],
      value: value == null ? void 0 : String(value),
      defaultValue: defaultValue == null ? void 0 : String(defaultValue),
      onValueChange: (next, details) => {
        if (details.reason === "imperative" && props.maxLength !== void 0 && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
      }
    }
  ) }) });
}
function SearchField({
  id,
  label,
  help,
  error,
  value,
  onValueChange,
  placeholder,
  disabled,
  name,
  onKeyDown,
  size = "regular"
}) {
  const ref = useRef2(null);
  return /* @__PURE__ */ jsx3(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs3(SDKInputGroup, { className: cx("yg-input", `yg-input-size-${size}`), children: [
    /* @__PURE__ */ jsx3(Icon, { name: "search" }),
    /* @__PURE__ */ jsx3(
      SDKInput,
      {
        ...binding,
        name,
        ref,
        type: "search",
        value,
        disabled,
        placeholder,
        onChange: (e) => onValueChange(e.target.value),
        onKeyDown
      }
    ),
    value && !disabled ? /* @__PURE__ */ jsx3(
      IconButton,
      {
        label: "Clear " + label.toLowerCase(),
        icon: "close",
        size: size === "compact" ? "compact" : "regular",
        onClick: () => {
          onValueChange("");
          ref.current?.focus();
        }
      }
    ) : void 0
  ] }) });
}
function SuggestionLetters({ text, interval, cap }) {
  return Array.from(text.matchAll(/\s+|\S+/gu), (match) => {
    const offset = match.index;
    return /^\s/u.test(match[0]) ? /* @__PURE__ */ jsx3("span", { children: match[0] }, offset) : /* @__PURE__ */ jsx3("span", { className: "yg-ghost-word", children: Array.from(match[0], (letter, i) => /* @__PURE__ */ jsx3("span", { style: { animationDelay: `${Math.min((offset + i) * interval, cap)}ms` }, children: letter }, i)) }, offset);
  });
}
function Textarea({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  onSubmit,
  onSelect,
  suggestion,
  rows = 3,
  ...props
}) {
  const [localValue, setLocalValue] = useState2(() => String(defaultValue ?? ""));
  const [completionController] = useState2(createInputController);
  const [atEnd, setAtEnd] = useState2(true);
  const [accepted, setAccepted] = useState2(null);
  const accepting = useRef2(false);
  const textarea = useRef2(null);
  const current = value == null ? localValue : String(value);
  const suffix = current && suggestion?.startsWith(current) ? suggestion.slice(current.length) : "";
  const available = !!suffix && atEnd && !props.disabled && !props.readOnly && (props.maxLength == null || props.maxLength < 0 || (suggestion?.length ?? 0) <= props.maxLength);
  const rolling = !!accepted && accepted.prefix + accepted.suffix === current;
  useEffect(() => {
    if (!accepted) return;
    const timer = setTimeout(() => setAccepted(null), Math.min(400, Array.from(accepted.suffix).length * 16) + 420);
    return () => clearTimeout(timer);
  }, [accepted]);
  useLayoutEffect2(() => {
    const input = textarea.current;
    if (suggestion === void 0 || !input) return;
    if (value == null) setLocalValue(input.value);
    setAtEnd(input.ownerDocument.activeElement !== input || input.selectionStart === input.value.length && input.selectionEnd === input.value.length);
    setAccepted(null);
  }, [suggestion]);
  useEffect(() => {
    const input = textarea.current;
    const form = input?.form;
    if (suggestion === void 0 || !input || !form) return;
    let timer;
    const reset = (event) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (event.defaultPrevented || textarea.current !== input) return;
        if (value == null) setLocalValue(input.value);
        setAtEnd(input.ownerDocument.activeElement !== input || input.selectionStart === input.value.length && input.selectionEnd === input.value.length);
        setAccepted(null);
      }, 0);
    };
    form.addEventListener("reset", reset);
    return () => {
      form.removeEventListener("reset", reset);
      if (timer) clearTimeout(timer);
    };
  }, [suggestion, value, props.form]);
  return /* @__PURE__ */ jsx3(Field, { ...{ id, label, help, error }, labelEnd: suggestion !== void 0 && available ? /* @__PURE__ */ jsx3("span", { className: "yg-ghost-key", "aria-hidden": "true", children: "Tab \u21B9" }) : void 0, children: (binding) => /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsxs3(SDKInputGroup, { className: cx("yg-input yg-textarea", suggestion !== void 0 && "yg-ghost-input", className), children: [
      suggestion !== void 0 && /* @__PURE__ */ jsxs3("div", { className: "yg-ghost-mirror", "aria-hidden": "true", "data-accepted": rolling || void 0, children: [
        /* @__PURE__ */ jsx3("span", { children: rolling ? accepted?.prefix : current }),
        available && /* @__PURE__ */ jsx3("span", { className: "yg-ghost-suffix", children: /* @__PURE__ */ jsx3(SuggestionLetters, { text: suffix, interval: 8, cap: 200 }) }),
        rolling && accepted && /* @__PURE__ */ jsx3("span", { className: "yg-ghost-accepted", children: /* @__PURE__ */ jsx3(SuggestionLetters, { text: accepted.suffix, interval: 16, cap: 400 }) })
      ] }),
      /* @__PURE__ */ jsx3(
        SDKTextarea,
        {
          ...props,
          ...binding,
          rows,
          controller: suggestion !== void 0 ? completionController : void 0,
          "aria-describedby": describedBy(props["aria-describedby"], binding["aria-describedby"], available && `${binding.id}-suggestion`),
          "aria-invalid": binding["aria-invalid"] ?? props["aria-invalid"],
          "data-accepted": rolling || void 0,
          value: value == null ? void 0 : String(value),
          defaultValue: defaultValue == null ? void 0 : String(defaultValue),
          onChange: suggestion === void 0 ? props.onChange : (event) => {
            if (!accepting.current) setAccepted(null);
            setLocalValue(event.currentTarget.value);
            setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
            props.onChange?.(event);
          },
          onKeyUp: suggestion === void 0 ? props.onKeyUp : (event) => {
            setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
            props.onKeyUp?.(event);
          },
          onMouseUp: suggestion === void 0 ? props.onMouseUp : (event) => {
            setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
            props.onMouseUp?.(event);
          },
          onKeyDown: suggestion === void 0 ? props.onKeyDown : (event) => {
            props.onKeyDown?.(event);
            const input = event.currentTarget;
            const keySuffix = input.value && suggestion?.startsWith(input.value) ? suggestion.slice(input.value.length) : "";
            if (!keySuffix || !suggestion || props.disabled || props.readOnly || props.maxLength != null && props.maxLength >= 0 && suggestion.length > props.maxLength || event.defaultPrevented || event.nativeEvent.isComposing || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.key !== "Tab" && event.key !== "ArrowRight" || input.selectionStart !== input.value.length || input.selectionEnd !== input.value.length || input.value !== current) return;
            accepting.current = true;
            try {
              const prefix = input.value;
              if (completionController.setValue(suggestion)) {
                event.preventDefault();
                setAccepted({ prefix, suffix: keySuffix });
                if (value == null) setLocalValue(input.value);
              }
            } finally {
              accepting.current = false;
            }
          },
          onValueChange: (next, details) => {
            if (details.reason === "imperative" && props.maxLength !== void 0 && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
          },
          render: /* @__PURE__ */ jsx3(
            "textarea",
            {
              ref: textarea,
              onSubmit,
              onSelect: suggestion === void 0 ? onSelect : (event) => {
                setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
                onSelect?.(event);
              }
            }
          )
        }
      )
    ] }),
    suggestion !== void 0 && /* @__PURE__ */ jsx3("span", { className: "yg-ghost-hint", id: `${binding.id}-suggestion`, "aria-hidden": !available, "data-visible": available, children: "Press Tab or right arrow to accept" })
  ] }) });
}
function Select2(props) {
  if (props.presentation === "animated") return /* @__PURE__ */ jsx3(SelectPicker, { ...props });
  const { presentation: _presentation, ...nativeProps } = props;
  return /* @__PURE__ */ jsx3(NativeSelect, { ...nativeProps });
}
function NativeSelect({
  id,
  label,
  help,
  error,
  options,
  placeholder,
  onPointerDown,
  onKeyDown,
  controlSize = "regular",
  ...props
}) {
  const dropdown = !props.multiple && (props.size ?? 1) <= 1;
  function positionPicker(select) {
    if (!dropdown || !select.ownerDocument.defaultView?.CSS.supports("appearance", "base-select")) return;
    const viewport = select.ownerDocument.defaultView;
    const viewHeight = viewport.visualViewport?.height ?? viewport.innerHeight;
    const viewTop = viewport.visualViewport?.offsetTop ?? 0;
    const bounds = select.getBoundingClientRect();
    const desired = Math.min(288, select.offsetHeight * select.options.length + 16);
    const above = bounds.top - viewTop;
    const below = viewTop + viewHeight - bounds.bottom;
    if (select.parentElement) {
      select.parentElement.dataset.pickerSide = below < desired && above > below ? "above" : "below";
    }
  }
  return /* @__PURE__ */ jsx3(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs3("div", { className: cx("yg-select", `yg-input-size-${controlSize}`), "data-dropdown": dropdown || void 0, children: [
    /* @__PURE__ */ jsxs3(
      "select",
      {
        ...props,
        ...binding,
        "aria-describedby": describedBy(props["aria-describedby"], binding["aria-describedby"]),
        "aria-invalid": binding["aria-invalid"] ?? props["aria-invalid"],
        onPointerDown: (event) => {
          onPointerDown?.(event);
          if (!event.defaultPrevented) positionPicker(event.currentTarget);
        },
        onKeyDown: (event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && !event.currentTarget.matches(":open")) {
            positionPicker(event.currentTarget);
          }
        },
        children: [
          placeholder && /* @__PURE__ */ jsx3("option", { value: "", children: placeholder }),
          options.map((o) => /* @__PURE__ */ jsx3("option", { value: o.id, disabled: o.disabled, children: o.label }, o.id))
        ]
      }
    ),
    dropdown && /* @__PURE__ */ jsx3(Icon, { name: "down" })
  ] }) });
}
function Switch({
  label,
  help,
  id,
  className,
  disabled,
  onCheckedChange,
  ...props
}) {
  const generatedId = useId2();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs3("div", { className: cx("yg-choice yg-switch", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx3(SDKSwitch, { ...props, id: inputId, disabled, onCheckedChange, children: /* @__PURE__ */ jsx3(SwitchThumb, {}) }),
    /* @__PURE__ */ jsx3("label", { htmlFor: inputId, children: /* @__PURE__ */ jsxs3("span", { children: [
      label,
      help && /* @__PURE__ */ jsx3("span", { className: "yg-help", children: help })
    ] }) })
  ] });
}
function Checkbox({
  label,
  id,
  className,
  disabled,
  ...props
}) {
  const generatedId = useId2();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs3("div", { className: cx("yg-choice yg-checkbox", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx3(SDKCheckbox, { ...props, id: inputId, disabled, children: /* @__PURE__ */ jsx3(CheckboxIndicator, { keepMounted: true, children: /* @__PURE__ */ jsxs3("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx3("path", { className: "yg-checkbox-check", d: "M6.24 12.96 10.32 16.8 18.24 7.68" }),
      /* @__PURE__ */ jsx3("path", { className: "yg-checkbox-mixed", d: "M7 12h10" })
    ] }) }) }),
    /* @__PURE__ */ jsx3("label", { htmlFor: inputId, children: /* @__PURE__ */ jsx3("span", { children: label }) })
  ] });
}
function RadioGroup2({
  label,
  options,
  value,
  onValueChange,
  disabled,
  name,
  presentation = "standard",
  columns
}) {
  return /* @__PURE__ */ jsxs3("fieldset", { className: "yg-fieldset", children: [
    /* @__PURE__ */ jsx3("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx3(
      SDKRadio,
      {
        className: presentation === "swatches" ? "yg-swatch-list" : "yg-radio",
        "data-aligned": columns !== void 0 || void 0,
        style: columns === void 0 ? void 0 : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
        "aria-label": label,
        value,
        name,
        disabled,
        onValueChange: (next) => {
          if (next !== null) onValueChange(next);
        },
        children: options.map((option) => presentation === "swatches" && "color" in option ? /* @__PURE__ */ jsxs3("div", { className: "yg-swatch-choice", style: { gridColumn: option.column }, children: [
          /* @__PURE__ */ jsx3(
            SDKRadioItem,
            {
              value: option.id,
              disabled: option.disabled,
              "aria-label": option.accessibleLabel,
              style: { backgroundColor: option.color }
            }
          ),
          columns === void 0 && /* @__PURE__ */ jsx3("span", { className: "yg-meta", "aria-hidden": "true", children: option.label })
        ] }, option.id) : /* @__PURE__ */ jsx3("div", { children: /* @__PURE__ */ jsxs3("label", { "data-disabled": disabled || option.disabled ? "" : void 0, children: [
          /* @__PURE__ */ jsx3("div", { children: /* @__PURE__ */ jsx3(SDKRadioItem, { value: option.id, disabled: option.disabled, children: /* @__PURE__ */ jsx3(RadioIndicator, {}) }) }),
          option.label
        ] }) }, option.id))
      }
    )
  ] });
}
function Combobox({
  label,
  options,
  value,
  onValueChange,
  disabled,
  name,
  help,
  error
}) {
  const [controller] = useState2(() => createComboboxController());
  return /* @__PURE__ */ jsx3(Field, { ...{ label, help, error }, children: (binding) => /* @__PURE__ */ jsxs3(
    SDKCombobox,
    {
      controller,
      value: value || null,
      name,
      disabled,
      itemToLabel: (id) => options.find((option) => option.id === id)?.label ?? "",
      onValueChange: (next, details) => {
        if (next === null) {
          details.cancel();
          return;
        }
        onValueChange(next);
      },
      children: [
        /* @__PURE__ */ jsx3(
          ComboboxInput,
          {
            ...binding,
            className: "yg-standalone",
            autoComplete: "off",
            onFocus: (event) => event.currentTarget.select(),
            onClick: (event) => {
              if (event.currentTarget.getAttribute("aria-expanded") === "true") return;
              controller.open();
              controller.setQuery("");
            }
          }
        ),
        /* @__PURE__ */ jsxs3(
          ComboboxContent,
          {
            className: "yg-popup-menu yg-combobox-popup",
            sideOffset: 6,
            align: "start",
            collisionPadding: 8,
            render: (props, state) => /* @__PURE__ */ jsx3("div", { ...props, "aria-hidden": !state.open || void 0, inert: !state.open }),
            children: [
              /* @__PURE__ */ jsx3(ComboboxList, { "aria-label": label, children: options.map((option) => /* @__PURE__ */ jsx3(ComboboxItem, { value: option.id, label: option.label, disabled: option.disabled, children: option.label }, option.id)) }),
              /* @__PURE__ */ jsx3(ComboboxEmpty, { className: "yg-help", children: words["state.no-matches"] })
            ]
          }
        )
      ]
    }
  ) });
}

export {
  SelectPicker,
  FocusPicker,
  PlanSwitch,
  Label,
  HelpText,
  FieldError,
  Field,
  SpringTextInput,
  TextField,
  SearchField,
  Textarea,
  Select2 as Select,
  Switch,
  Checkbox,
  RadioGroup2 as RadioGroup,
  Combobox
};
