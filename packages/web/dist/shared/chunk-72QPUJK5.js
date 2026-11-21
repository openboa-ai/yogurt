"use client";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  IconButton
} from "./chunk-4IPCB3MM.js";
import {
  Icon,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/controls/forms.tsx
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea, createInputController } from "@ui-sdk/react/textarea";
import { Switch as SDKSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { Checkbox as SDKCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { RadioGroup as SDKRadio, Radio as SDKRadioItem, RadioIndicator } from "@ui-sdk/react/radio";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Label(props) {
  return /* @__PURE__ */ jsx("label", { ...props, className: cx("yg-label", props.className) });
}
function HelpText(props) {
  return /* @__PURE__ */ jsx("p", { ...props, className: cx("yg-help", props.className) });
}
function FieldError(props) {
  return /* @__PURE__ */ jsx("p", { ...props, className: cx("yg-error", props.className) });
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
  const fallback = useId();
  const input = id ?? fallback;
  const description = [help && input + "-help", error && input + "-error"].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ jsxs("div", { className: "yg-field", children: [
    labelEnd ? /* @__PURE__ */ jsxs("div", { className: "yg-ghost-head", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: input, children: label }),
      labelEnd
    ] }) : /* @__PURE__ */ jsx(Label, { htmlFor: input, children: label }),
    children({
      id: input,
      "aria-describedby": description,
      "aria-invalid": error ? true : void 0
    }),
    help && /* @__PURE__ */ jsx(HelpText, { id: input + "-help", children: help }),
    error && /* @__PURE__ */ jsx(FieldError, { id: input + "-error", children: error })
  ] });
}
function SpringTextInput({ value, defaultValue, onSelect, ...props }) {
  return /* @__PURE__ */ jsx(
    SDKInput,
    {
      ...props,
      value: value == null ? void 0 : String(value),
      defaultValue: defaultValue == null ? void 0 : String(defaultValue),
      render: onSelect ? /* @__PURE__ */ jsx("input", { onSelect }) : void 0,
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
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(SDKInputGroup, { className: cx("yg-input", `yg-input-size-${size}`, className), children: motion === "spring" && (props.type ?? "text") === "text" && !Array.isArray(value) && !Array.isArray(defaultValue) ? /* @__PURE__ */ jsx(
    SpringTextInput,
    {
      ...props,
      ...binding,
      "aria-describedby": describedBy(props["aria-describedby"], binding["aria-describedby"]),
      "aria-invalid": binding["aria-invalid"] ?? props["aria-invalid"],
      value,
      defaultValue
    }
  ) : /* @__PURE__ */ jsx(
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
  const ref = useRef(null);
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs(SDKInputGroup, { className: cx("yg-input", `yg-input-size-${size}`), children: [
    /* @__PURE__ */ jsx(Icon, { name: "search" }),
    /* @__PURE__ */ jsx(
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
    value && !disabled ? /* @__PURE__ */ jsx(
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
    return /^\s/u.test(match[0]) ? /* @__PURE__ */ jsx("span", { children: match[0] }, offset) : /* @__PURE__ */ jsx("span", { className: "yg-ghost-word", children: Array.from(match[0], (letter, i) => /* @__PURE__ */ jsx("span", { style: { animationDelay: `${Math.min((offset + i) * interval, cap)}ms` }, children: letter }, i)) }, offset);
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
  const [localValue, setLocalValue] = useState(() => String(defaultValue ?? ""));
  const [completionController] = useState(createInputController);
  const [atEnd, setAtEnd] = useState(true);
  const [accepted, setAccepted] = useState(null);
  const accepting = useRef(false);
  const textarea = useRef(null);
  const current = value == null ? localValue : String(value);
  const suffix = current && suggestion?.startsWith(current) ? suggestion.slice(current.length) : "";
  const available = !!suffix && atEnd && !props.disabled && !props.readOnly && (props.maxLength == null || props.maxLength < 0 || (suggestion?.length ?? 0) <= props.maxLength);
  const rolling = !!accepted && accepted.prefix + accepted.suffix === current;
  useEffect(() => {
    if (!accepted) return;
    const timer = setTimeout(() => setAccepted(null), Math.min(400, Array.from(accepted.suffix).length * 16) + 420);
    return () => clearTimeout(timer);
  }, [accepted]);
  useLayoutEffect(() => {
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
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, labelEnd: suggestion !== void 0 && available ? /* @__PURE__ */ jsx("span", { className: "yg-ghost-key", "aria-hidden": "true", children: "Tab \u21B9" }) : void 0, children: (binding) => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(SDKInputGroup, { className: cx("yg-input yg-textarea", suggestion !== void 0 && "yg-ghost-input", className), children: [
      suggestion !== void 0 && /* @__PURE__ */ jsxs("div", { className: "yg-ghost-mirror", "aria-hidden": "true", "data-accepted": rolling || void 0, children: [
        /* @__PURE__ */ jsx("span", { children: rolling ? accepted?.prefix : current }),
        available && /* @__PURE__ */ jsx("span", { className: "yg-ghost-suffix", children: /* @__PURE__ */ jsx(SuggestionLetters, { text: suffix, interval: 8, cap: 200 }) }),
        rolling && accepted && /* @__PURE__ */ jsx("span", { className: "yg-ghost-accepted", children: /* @__PURE__ */ jsx(SuggestionLetters, { text: accepted.suffix, interval: 16, cap: 400 }) })
      ] }),
      /* @__PURE__ */ jsx(
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
          render: /* @__PURE__ */ jsx(
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
    suggestion !== void 0 && /* @__PURE__ */ jsx("span", { className: "yg-ghost-hint", id: `${binding.id}-suggestion`, "aria-hidden": !available, "data-visible": available, children: "Press Tab or right arrow to accept" })
  ] }) });
}
function Select({
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
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs("div", { className: cx("yg-select", `yg-input-size-${controlSize}`), "data-dropdown": dropdown || void 0, children: [
    /* @__PURE__ */ jsxs(
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
          placeholder && /* @__PURE__ */ jsx("option", { value: "", children: placeholder }),
          options.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, disabled: o.disabled, children: o.label }, o.id))
        ]
      }
    ),
    dropdown && /* @__PURE__ */ jsx(Icon, { name: "down" })
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
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cx("yg-choice yg-switch", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx(SDKSwitch, { ...props, id: inputId, disabled, onCheckedChange, children: /* @__PURE__ */ jsx(SwitchThumb, {}) }),
    /* @__PURE__ */ jsx("label", { htmlFor: inputId, children: /* @__PURE__ */ jsxs("span", { children: [
      label,
      help && /* @__PURE__ */ jsx("span", { className: "yg-help", children: help })
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
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cx("yg-choice yg-checkbox", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx(SDKCheckbox, { ...props, id: inputId, disabled, children: /* @__PURE__ */ jsx(CheckboxIndicator, { keepMounted: true, children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("path", { className: "yg-checkbox-check", d: "M6 12.5l4 4L18 8" }),
      /* @__PURE__ */ jsx("path", { className: "yg-checkbox-mixed", d: "M7 12h10" })
    ] }) }) }),
    /* @__PURE__ */ jsx("label", { htmlFor: inputId, children: /* @__PURE__ */ jsx("span", { children: label }) })
  ] });
}
function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  disabled,
  name
}) {
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx(
      SDKRadio,
      {
        className: "yg-radio",
        "aria-label": label,
        value,
        name,
        disabled,
        onValueChange: (next) => {
          if (next !== null) onValueChange(next);
        },
        children: options.map((o) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("label", { "data-disabled": disabled || o.disabled ? "" : void 0, children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(SDKRadioItem, { value: o.id, disabled: o.disabled, children: /* @__PURE__ */ jsx(RadioIndicator, {}) }) }),
          o.label
        ] }) }, o.id))
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
  const list = useId();
  const [query, setQuery] = useState(null);
  const [active, setActive] = useState(null);
  const open = query !== null && !disabled;
  const selected = options.find((o) => o.id === value);
  const matches = options.filter(
    (o) => o.label.toLowerCase().includes((query ?? "").toLowerCase())
  );
  const enabled = matches.filter((o) => !o.disabled);
  const current = enabled.find((o) => o.id === active);
  function dismiss() {
    setQuery(null);
    setActive(null);
  }
  function choose(o) {
    if (!o.disabled) {
      dismiss();
      onValueChange(o.id);
    }
  }
  function step(back) {
    const idx = enabled.findIndex((o) => o.id === active);
    const next = idx < 0 ? back ? enabled.length - 1 : 0 : (idx + (back ? -1 : 1) + enabled.length) % enabled.length;
    setActive(enabled[next]?.id ?? null);
  }
  const optionId = (id) => list + "-" + encodeURIComponent(id);
  return /* @__PURE__ */ jsx(Field, { ...{ label, help, error }, children: (binding) => /* @__PURE__ */ jsxs("div", { className: "yg-combo", children: [
    name && /* @__PURE__ */ jsx("input", { type: "hidden", name, value, disabled }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ...binding,
        disabled,
        className: "yg-standalone",
        role: "combobox",
        autoComplete: "off",
        "aria-autocomplete": "list",
        "aria-expanded": open,
        "aria-controls": list,
        "aria-activedescendant": open && current ? optionId(current.id) : void 0,
        value: open ? query ?? "" : selected?.label ?? "",
        onFocus: (e) => e.target.select(),
        onClick: () => {
          if (!open) setQuery("");
        },
        onBlur: dismiss,
        onChange: (e) => {
          setQuery(e.target.value);
          setActive(null);
        },
        onKeyDown: (e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) setQuery("");
            step(e.key === "ArrowUp");
          }
          if (open && e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            dismiss();
          }
          if (open && e.key === "Enter") {
            e.preventDefault();
            if (current) choose(current);
          }
        }
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id: list,
        role: "listbox",
        "aria-label": label,
        className: "yg-options",
        hidden: !open,
        children: [
          matches.map((o) => /* @__PURE__ */ jsx(
            "div",
            {
              id: optionId(o.id),
              role: "option",
              "aria-selected": o.id === value,
              "aria-disabled": o.disabled,
              "data-active": o.id === current?.id || void 0,
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => choose(o),
              children: o.label
            },
            o.id
          )),
          matches.length === 0 && /* @__PURE__ */ jsx("div", { role: "presentation", className: "yg-help", children: words["state.no-matches"] })
        ]
      }
    )
  ] }) });
}

export {
  Label,
  HelpText,
  FieldError,
  Field,
  SpringTextInput,
  TextField,
  SearchField,
  Textarea,
  Select,
  Switch,
  Checkbox,
  RadioGroup,
  Combobox
};
