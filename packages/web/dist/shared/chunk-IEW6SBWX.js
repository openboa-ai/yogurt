"use client";
import {
  dist_exports8 as dist_exports
} from "./chunk-M625EGNB.js";
import {
  clsx_default
} from "./chunk-6KAVIWHD.js";
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
  useId as useId2,
  useRef,
  useState
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea } from "@ui-sdk/react/textarea";
import { Switch as SDKSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { Checkbox as SDKCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";

// node_modules/@openai/apps-sdk-ui/dist/es/components/RadioGroup/RadioGroup.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, use, useId, useMemo } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/RadioGroup/RadioGroup.module.css
var RadioGroup_default = { "RadioGroup": "yg-sdk-RadioGroup-RadioGroup", "RadioLabel": "yg-sdk-RadioGroup-RadioLabel", "RadioIndicatorWrapper": "yg-sdk-RadioGroup-RadioIndicatorWrapper", "RadioItem": "yg-sdk-RadioGroup-RadioItem", "RadioIndicator": "yg-sdk-RadioGroup-RadioIndicator" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/RadioGroup/RadioGroup.js
var RadioGroupContext = createContext(null);
var useRadioGroupContext = () => {
  const context = use(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroup components must be wrapped in <RadioGroup />");
  }
  return context;
};
var RadioGroup = ({ onChange, children, className, direction = "row", disabled = false, ...restProps }) => {
  const store = useMemo(() => ({
    disabled,
    direction
  }), [disabled, direction]);
  return _jsx(RadioGroupContext, { value: store, children: _jsx(dist_exports.Root, { className: clsx_default(RadioGroup_default.RadioGroup, className), "data-direction": direction, onValueChange: onChange, disabled, ...restProps, children }) });
};
var Item = ({ value, disabled: itemDisabled = false, required, children, className, block = false, ...restProps }) => {
  const { disabled: groupDisabled } = useRadioGroupContext();
  const disabled = groupDisabled || itemDisabled;
  const id = useId();
  const itemId = `${value}-${id}`;
  return (
    // Providing an extra wrapper enables `label` to be inline-flex, avoiding clickable whitespace
    // when radio options are of varied lengths.
    // NOTE: Important that this is `flex` to prevent the `inline-flex` label from extra, unintentional whitespace.
    _jsx("div", { className: "flex", ...restProps, children: _jsxs("label", { htmlFor: itemId, className: clsx_default(RadioGroup_default.RadioLabel, className), "data-disabled": disabled ? "" : void 0, "data-block": block ? "" : void 0, onMouseDown: (event) => {
      if (!event.defaultPrevented && event.detail > 1)
        event.preventDefault();
    }, children: [_jsx("div", { className: RadioGroup_default.RadioIndicatorWrapper, children: _jsx(dist_exports.Item, { id: itemId, value, disabled, required, className: RadioGroup_default.RadioItem, children: _jsx(dist_exports.Indicator, { className: RadioGroup_default.RadioIndicator }) }) }), children] }) })
  );
};
RadioGroup.Item = Item;

// packages/web/src/controls/forms.tsx
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
  const fallback = useId2();
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
  const generatedId = useId2();
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
  const generatedId = useId2();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cx("yg-choice yg-checkbox", className), "data-disabled": disabled || void 0, children: [
    /* @__PURE__ */ jsx(SDKCheckbox, { ...props, id: inputId, disabled, children: /* @__PURE__ */ jsx(CheckboxIndicator, { keepMounted: true, children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("path", { className: "yg-checkbox-check", d: "M6 12.5l4 4L18 8" }),
      /* @__PURE__ */ jsx("path", { className: "yg-checkbox-mixed", d: "M7 12h10" })
    ] }) }) }),
    /* @__PURE__ */ jsx("label", { htmlFor: inputId, children: /* @__PURE__ */ jsx("span", { children: label }) })
  ] });
}
function RadioGroup2({
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
      RadioGroup,
      {
        className: "yg-radio",
        "aria-label": label,
        direction: "col",
        value,
        name,
        disabled,
        onChange: onValueChange,
        children: options.map((o) => /* @__PURE__ */ jsx(RadioGroup.Item, { value: o.id, disabled: o.disabled, children: o.label }, o.id))
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
  const list = useId2();
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
  RadioGroup2 as RadioGroup,
  Combobox
};
