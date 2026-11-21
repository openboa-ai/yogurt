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
  useId,
  useRef,
  useState
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea } from "@ui-sdk/react/textarea";
import { Switch as SDKSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { Checkbox as SDKCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { RadioGroup as SDKRadio, Radio as SDKRadioItem, RadioIndicator } from "@ui-sdk/react/radio";
import { jsx, jsxs } from "react/jsx-runtime";
function Label(props) {
  return /* @__PURE__ */ jsx("label", { ...props, className: cx("yg-label", props.className) });
}
function HelpText(props) {
  return /* @__PURE__ */ jsx("p", { ...props, className: cx("yg-help", props.className) });
}
function FieldError(props) {
  return /* @__PURE__ */ jsx("p", { ...props, className: cx("yg-error", props.className) });
}
function Field({
  id,
  label,
  help,
  error,
  children
}) {
  const fallback = useId();
  const input = id ?? fallback;
  const description = [help && input + "-help", error && input + "-error"].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ jsxs("div", { className: "yg-field", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: input, children: label }),
    children({
      id: input,
      "aria-describedby": description,
      "aria-invalid": error ? true : void 0
    }),
    help && /* @__PURE__ */ jsx(HelpText, { id: input + "-help", children: help }),
    error && /* @__PURE__ */ jsx(FieldError, { id: input + "-error", children: error })
  ] });
}
function TextField({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  size = "regular",
  ...props
}) {
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(SDKInputGroup, { className: cx("yg-input", `yg-input-size-${size}`, className), children: /* @__PURE__ */ jsx(
    SDKInput,
    {
      ...props,
      ...binding,
      value: value === void 0 ? void 0 : String(value),
      defaultValue: defaultValue === void 0 ? void 0 : String(defaultValue)
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
function Textarea({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  onSubmit,
  rows = 3,
  ...props
}) {
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(SDKInputGroup, { className: cx("yg-input yg-textarea", className), children: /* @__PURE__ */ jsx(
    SDKTextarea,
    {
      ...props,
      ...binding,
      rows,
      value: value === void 0 ? void 0 : String(value),
      defaultValue: defaultValue === void 0 ? void 0 : String(defaultValue),
      render: onSubmit ? /* @__PURE__ */ jsx("textarea", { onSubmit }) : void 0
    }
  ) }) });
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
  const labelRef = useRef(null);
  const change = (checked) => {
    const thumb = labelRef.current?.closest(".yg-switch")?.querySelector('[role="switch"] > span');
    if (thumb && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const scale = getComputedStyle(thumb).scale;
      thumb.getAnimations().find((animation) => animation.id === "yg-switch-stretch")?.cancel();
      const stretch = thumb.animate([
        { scale, offset: 0 },
        { scale: "1.385 1", offset: 1 / 9 },
        { scale: "1.385 1", offset: 1 / 3 },
        { scale: "1.363 1", offset: 4 / 9 },
        { scale: "1.187 1", offset: 5 / 9 },
        { scale: "1.053 1", offset: 2 / 3 },
        { scale: "1", offset: 7 / 9 },
        { scale: "1", offset: 1 }
      ], { duration: 300 });
      stretch.id = "yg-switch-stretch";
    }
    onCheckedChange?.(checked);
  };
  return /* @__PURE__ */ jsxs("div", { className: cx("yg-choice yg-switch", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx(SDKSwitch, { ...props, id: inputId, disabled, onCheckedChange: change, children: /* @__PURE__ */ jsx(SwitchThumb, {}) }),
    /* @__PURE__ */ jsx("label", { htmlFor: inputId, children: /* @__PURE__ */ jsxs("span", { ref: labelRef, children: [
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
  TextField,
  SearchField,
  Textarea,
  Select,
  Switch,
  Checkbox,
  RadioGroup,
  Combobox
};
