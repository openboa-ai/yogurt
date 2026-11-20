"use client";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  dist_exports10 as dist_exports3,
  dist_exports3 as dist_exports,
  dist_exports9 as dist_exports2
} from "./chunk-74ISCFKG.js";
import {
  IconButton,
  clsx_default,
  o,
  toCssVariables
} from "./chunk-A323HUK4.js";
import {
  Icon,
  cx
} from "./chunk-RUS3W4HJ.js";

// packages/web/src/controls/forms.tsx
import {
  useId as useId6,
  useRef as useRef3,
  useState as useState3
} from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Input/Input.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Input/Input.module.css
var Input_default = { "Container": "yg-sdk-Input-Container", "Input": "yg-sdk-Input-Input" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Input/Input.js
var Input = (props) => {
  const inputRef = useRef(null);
  const inputIdSuffix = useId();
  const onePasswordPreventionId = `search-ui-input-${inputIdSuffix}`;
  const {
    id,
    name,
    type = "text",
    variant = "outline",
    size = "md",
    gutterSize,
    className,
    autoComplete,
    disabled = false,
    readOnly = false,
    invalid = false,
    // Default to `true` when the field declares autofill semantics.
    allowAutofillExtensions = type === "password" || !!name || !!autoComplete && autoComplete !== "off",
    onFocus,
    onBlur,
    onAnimationStart,
    onAutofill,
    autoSelect,
    startAdornment: StartAdornment,
    endAdornment: EndAdornment,
    pill,
    opticallyAlign,
    ref,
    ...restProps
  } = props;
  const handleMouseDown = (evt) => {
    const input = inputRef.current;
    if (!evt.target || !(evt.target instanceof Element) || !input) {
      return;
    }
    if (input.contains(evt.target)) {
      return;
    }
    if (evt.target.closest("button, [type='button'], [role='button'], [role='menuitem']")) {
      return;
    }
    evt.preventDefault();
    if (document.activeElement !== input) {
      input.focus();
    }
    const { left, top } = input.getBoundingClientRect();
    const { clientX, clientY } = evt;
    const isBefore = clientY < top || clientX < left;
    if (evt.detail === 1) {
      if (isBefore) {
        input.setSelectionRange(0, 0);
      } else {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    } else if (evt.detail === 2) {
      const words2 = input.value.match(/\w+|[^\w\s]/g) || [];
      const selectedWord = isBefore ? words2.at(0) : words2.at(-1);
      if (selectedWord) {
        const wordIndex = isBefore ? input.value.indexOf(selectedWord) : input.value.lastIndexOf(selectedWord);
        input.setSelectionRange(wordIndex, wordIndex + selectedWord.length);
      }
    } else {
      input.select();
    }
  };
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (autoSelect) {
      inputRef.current?.select();
    }
  }, [autoSelect]);
  const handleAnimationStart = (evt) => {
    onAnimationStart?.(evt);
    if (evt.animationName === "native-autofill-in") {
      onAutofill?.();
    }
  };
  return _jsxs("div", { className: clsx_default(Input_default.Container, className), "data-variant": variant, "data-size": size, "data-gutter-size": gutterSize, "data-focused": focused, "data-disabled": disabled ? "" : void 0, "data-readonly": readOnly ? "" : void 0, "data-invalid": invalid ? "" : void 0, "data-pill": pill ? "" : void 0, "data-optically-align": opticallyAlign, "data-has-start-adornment": StartAdornment ? "" : void 0, "data-has-end-adornment": EndAdornment ? "" : void 0, onMouseDown: handleMouseDown, children: [StartAdornment, _jsx("input", { ...restProps, ref: o([ref, inputRef]), id: id || (allowAutofillExtensions ? void 0 : onePasswordPreventionId), className: Input_default.Input, type, name, autoComplete, readOnly, disabled, onFocus: (evt) => {
    setFocused(true);
    onFocus?.(evt);
  }, onBlur: (evt) => {
    setFocused(false);
    onBlur?.(evt);
  }, onAnimationStart: handleAnimationStart, "data-lpignore": allowAutofillExtensions ? void 0 : true, "data-1p-ignore": allowAutofillExtensions ? void 0 : true }), EndAdornment] });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Textarea/Textarea.js
import { jsx as _jsx2 } from "react/jsx-runtime";
import { useCallback, useEffect as useEffect2, useId as useId2, useRef as useRef2, useState as useState2 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Textarea/Textarea.module.css
var Textarea_default = { "Container": "yg-sdk-Textarea-Container", "Textarea": "yg-sdk-Textarea-Textarea" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Textarea/Textarea.js
var Textarea = (props) => {
  const textAreaRef = useRef2(null);
  const inputIdSuffix = useId2();
  const onePasswordPreventionId = `search-ui-input-${inputIdSuffix}`;
  const {
    id,
    name,
    variant = "outline",
    size = "md",
    gutterSize,
    className,
    autoComplete,
    disabled = false,
    readOnly = false,
    invalid = false,
    // Default to `true` when presence of `name`
    allowAutofillExtensions = !!name,
    onFocus,
    onBlur,
    onAnimationStart,
    onAutofill,
    autoSelect,
    rows = 3,
    maxRows,
    autoResize,
    ref,
    onChange,
    ...restProps
  } = props;
  const [focused, setFocused] = useState2(false);
  const computedMaxRows = autoResize ? Math.max(maxRows ?? 10, rows) : rows;
  useEffect2(() => {
    if (autoSelect) {
      textAreaRef.current?.select();
    }
  }, [autoSelect]);
  const handleAnimationStart = (evt) => {
    onAnimationStart?.(evt);
    if (evt.animationName === "native-autofill-in") {
      onAutofill?.();
    }
  };
  const autosizeTextarea = useCallback(() => {
    if (!autoResize || !textAreaRef.current || computedMaxRows === void 0)
      return;
    textAreaRef.current.style.height = "0px";
    const scrollHeight = textAreaRef.current.scrollHeight;
    textAreaRef.current.style.height = scrollHeight + "px";
  }, [autoResize, computedMaxRows]);
  useEffect2(() => {
    autosizeTextarea();
  }, [props.value, rows, autosizeTextarea]);
  return _jsx2("div", { className: clsx_default(Textarea_default.Container, className), "data-variant": variant, "data-size": size, "data-gutter-size": gutterSize, "data-focused": focused, "data-disabled": disabled ? "" : void 0, "data-readonly": readOnly ? "" : void 0, "data-invalid": invalid ? "" : void 0, style: toCssVariables({
    "textarea-min-rows": `${rows}`,
    "textarea-max-rows": `${computedMaxRows}`
  }), children: _jsx2("textarea", { ...restProps, onChange: (evt) => {
    onChange?.(evt);
    autosizeTextarea();
  }, ref: o([textAreaRef, ref]), id: id || (allowAutofillExtensions ? void 0 : onePasswordPreventionId), className: Textarea_default.Textarea, name, readOnly, disabled, rows, onFocus: (evt) => {
    setFocused(true);
    onFocus?.(evt);
  }, onBlur: (evt) => {
    setFocused(false);
    onBlur?.(evt);
  }, onAnimationStart: handleAnimationStart, "data-lpignore": allowAutofillExtensions ? void 0 : true, "data-1p-ignore": allowAutofillExtensions ? void 0 : true }) });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Switch/Switch.js
import { jsx as _jsx3, jsxs as _jsxs2 } from "react/jsx-runtime";
import { useId as useId3 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Switch/Switch.module.css
var Switch_default = { "Container": "yg-sdk-Switch-Container", "Track": "yg-sdk-Switch-Track", "Thumb": "yg-sdk-Switch-Thumb", "Label": "yg-sdk-Switch-Label" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Switch/Switch.js
var Switch = ({ className, label, id: propsId, disabled, labelPosition = "end", ...restProps }) => {
  const reactId = useId3();
  const id = propsId ?? reactId;
  return _jsxs2("div", { className: clsx_default(Switch_default.Container, className), "data-disabled": disabled ? "" : void 0, "data-has-label": label ? "" : void 0, "data-label-position": labelPosition, children: [_jsx3(dist_exports3.Root, { id, className: Switch_default.Track, disabled, ...restProps, children: _jsx3(dist_exports3.Thumb, { className: Switch_default.Thumb }) }), label && _jsx3("label", { htmlFor: id, className: Switch_default.Label, children: label })] });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/Checkbox/Checkbox.js
import { jsx as _jsx4, jsxs as _jsxs3 } from "react/jsx-runtime";
import { useId as useId4 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/Checkbox/Checkbox.module.css
var Checkbox_default = { "Container": "yg-sdk-Checkbox-Container", "Checkbox": "yg-sdk-Checkbox-Checkbox", "CheckMark": "yg-sdk-Checkbox-CheckMark", "Label": "yg-sdk-Checkbox-Label" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/Checkbox/Checkbox.js
var Checkbox = ({ className, label, id: propsId, disabled, orientation = "left", ...restProps }) => {
  const reactId = useId4();
  const id = propsId ?? reactId;
  return _jsxs3("div", { "data-disabled": disabled ? "" : void 0, "data-has-label": label ? "" : void 0, "data-orientation": orientation, className: clsx_default(className, Checkbox_default.Container), children: [_jsx4(dist_exports.Root, { className: Checkbox_default.Checkbox, id, disabled, ...restProps, children: _jsx4(dist_exports.Indicator, { className: Checkbox_default.CheckMark }) }), label && _jsx4("label", { htmlFor: id, className: Checkbox_default.Label, onMouseDown: (event) => {
    if (!event.defaultPrevented && event.detail > 1)
      event.preventDefault();
  }, children: label })] });
};

// node_modules/@openai/apps-sdk-ui/dist/es/components/RadioGroup/RadioGroup.js
import { jsx as _jsx5, jsxs as _jsxs4 } from "react/jsx-runtime";
import React, { createContext, use, useId as useId5, useMemo } from "react";

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
  return _jsx5(RadioGroupContext, { value: store, children: _jsx5(dist_exports2.Root, { className: clsx_default(RadioGroup_default.RadioGroup, className), "data-direction": direction, onValueChange: onChange, disabled, ...restProps, children }) });
};
var Item = ({ value, disabled: itemDisabled = false, required, children, className, block = false, ...restProps }) => {
  const { disabled: groupDisabled } = useRadioGroupContext();
  const disabled = groupDisabled || itemDisabled;
  const id = useId5();
  const itemId = `${value}-${id}`;
  return (
    // Providing an extra wrapper enables `label` to be inline-flex, avoiding clickable whitespace
    // when radio options are of varied lengths.
    // NOTE: Important that this is `flex` to prevent the `inline-flex` label from extra, unintentional whitespace.
    _jsx5("div", { className: "flex", ...restProps, children: _jsxs4("label", { htmlFor: itemId, className: clsx_default(RadioGroup_default.RadioLabel, className), "data-disabled": disabled ? "" : void 0, "data-block": block ? "" : void 0, onMouseDown: (event) => {
      if (!event.defaultPrevented && event.detail > 1)
        event.preventDefault();
    }, children: [_jsx5("div", { className: RadioGroup_default.RadioIndicatorWrapper, children: _jsx5(dist_exports2.Item, { id: itemId, value, disabled, required, className: RadioGroup_default.RadioItem, children: _jsx5(dist_exports2.Indicator, { className: RadioGroup_default.RadioIndicator }) }) }), children] }) })
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
  const fallback = useId6();
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
  ...props
}) {
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(
    Input,
    {
      ...props,
      ...binding,
      variant: "soft",
      invalid: !!error,
      className: cx("yg-input", className)
    }
  ) });
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
  name
}) {
  const ref = useRef3(null);
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(
    Input,
    {
      ...binding,
      name,
      ref,
      type: "search",
      variant: "soft",
      className: "yg-input",
      value,
      disabled,
      placeholder,
      onChange: (e) => onValueChange(e.target.value),
      startAdornment: /* @__PURE__ */ jsx(Icon, { name: "search" }),
      endAdornment: value && !disabled ? /* @__PURE__ */ jsx(
        IconButton,
        {
          label: "Clear " + label.toLowerCase(),
          icon: "close",
          onClick: () => {
            onValueChange("");
            ref.current?.focus();
          }
        }
      ) : void 0
    }
  ) });
}
function Textarea2({
  id,
  label,
  help,
  error,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsx(
    Textarea,
    {
      ...props,
      ...binding,
      variant: "soft",
      invalid: !!error,
      className: cx("yg-input yg-textarea", className)
    }
  ) });
}
function Select({
  id,
  label,
  help,
  error,
  options,
  placeholder,
  ...props
}) {
  const dropdown = !props.multiple && (props.size ?? 1) <= 1;
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs("div", { className: "yg-select", "data-dropdown": dropdown || void 0, children: [
    /* @__PURE__ */ jsxs("select", { ...props, ...binding, children: [
      placeholder && /* @__PURE__ */ jsx("option", { value: "", children: placeholder }),
      options.map((o2) => /* @__PURE__ */ jsx("option", { value: o2.id, disabled: o2.disabled, children: o2.label }, o2.id))
    ] }),
    dropdown && /* @__PURE__ */ jsx(Icon, { name: "down" })
  ] }) });
}
function Switch2({
  label,
  help,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Switch,
    {
      ...props,
      labelPosition: "start",
      className: cx("yg-choice yg-switch", props.className),
      label: /* @__PURE__ */ jsxs("span", { children: [
        label,
        help && /* @__PURE__ */ jsx("span", { className: "yg-help", children: help })
      ] })
    }
  );
}
function Checkbox2({
  label,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Checkbox,
    {
      ...props,
      label,
      className: cx("yg-choice yg-checkbox", props.className)
    }
  );
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
        children: options.map((o2) => /* @__PURE__ */ jsx(RadioGroup.Item, { value: o2.id, disabled: o2.disabled, children: o2.label }, o2.id))
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
  const list = useId6();
  const [query, setQuery] = useState3(null);
  const [active, setActive] = useState3(null);
  const open = query !== null && !disabled;
  const selected = options.find((o2) => o2.id === value);
  const matches = options.filter(
    (o2) => o2.label.toLowerCase().includes((query ?? "").toLowerCase())
  );
  const enabled = matches.filter((o2) => !o2.disabled);
  const current = enabled.find((o2) => o2.id === active);
  function dismiss() {
    setQuery(null);
    setActive(null);
  }
  function choose(o2) {
    if (!o2.disabled) {
      dismiss();
      onValueChange(o2.id);
    }
  }
  function step(back) {
    const idx = enabled.findIndex((o2) => o2.id === active);
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
          matches.map((o2) => /* @__PURE__ */ jsx(
            "div",
            {
              id: optionId(o2.id),
              role: "option",
              "aria-selected": o2.id === value,
              "aria-disabled": o2.disabled,
              "data-active": o2.id === current?.id || void 0,
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => choose(o2),
              children: o2.label
            },
            o2.id
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
  Textarea2 as Textarea,
  Select,
  Switch2 as Switch,
  Checkbox2 as Checkbox,
  RadioGroup2 as RadioGroup,
  Combobox
};
