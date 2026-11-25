"use client";
import {
  Field,
  SpringTextInput
} from "./chunk-SBJ7U7LP.js";
import {
  Icon,
  cx
} from "./chunk-XELXU7JZ.js";

// packages/web/src/controls/inputs.tsx
import { OTPInput as SDKOTP, OTPInputGroup, OTPInputSlot, createOTPInputController } from "@ui-sdk/react/otp-input";
import {
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup } from "@ui-sdk/react/toggle";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { jsx, jsxs } from "react/jsx-runtime";
function InputGroup({
  label,
  leading,
  trailing,
  help,
  error,
  id,
  size = "featured",
  motion,
  containerClassName,
  ...input
}) {
  const sharedInput = ["text", "search", "email", "url", "tel", "password"].includes(input.type ?? "text") && !Array.isArray(input.value) && !Array.isArray(input.defaultValue);
  const { onSelect, ...sharedProps } = input;
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs(SDKInputGroup, { className: cx("yg-input yg-input-group", `yg-input-size-${size}`, containerClassName), children: [
    leading,
    sharedInput && motion === "spring" && (input.type ?? "text") === "text" ? /* @__PURE__ */ jsx(SpringTextInput, { ...input, ...binding, "aria-invalid": binding["aria-invalid"] ?? input["aria-invalid"], "aria-describedby": [input["aria-describedby"], binding["aria-describedby"]].filter(Boolean).join(" ") || void 0 }) : sharedInput ? /* @__PURE__ */ jsx(
      SDKInput,
      {
        ...sharedProps,
        ...binding,
        "aria-invalid": binding["aria-invalid"] ?? input["aria-invalid"],
        "aria-describedby": [input["aria-describedby"], binding["aria-describedby"]].filter(Boolean).join(" ") || void 0,
        render: onSelect ? /* @__PURE__ */ jsx("input", { onSelect }) : void 0,
        value: input.value == null ? void 0 : String(input.value),
        defaultValue: input.defaultValue == null ? void 0 : String(input.defaultValue),
        onValueChange: (next, details) => {
          if (details.reason === "imperative" && input.maxLength !== void 0 && input.maxLength >= 0 && next.length > input.maxLength) details.cancel();
        }
      }
    ) : /* @__PURE__ */ jsx("input", { ...input, ...binding }),
    trailing
  ] }) });
}
function OtpDigit({ value }) {
  return /* @__PURE__ */ jsx("span", { className: "yg-otp-digit", children: value });
}
function insertOTPDigits(field, digits, count) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  return (field.value.slice(0, start) + digits + field.value.slice(end)).slice(0, count);
}
function InputOTP({
  label,
  length = 6,
  value,
  onValueChange,
  name,
  disabled,
  verified = false,
  help,
  error
}) {
  const count = Math.max(1, Math.min(12, Math.trunc(length) || 6));
  const [controller] = useState(createOTPInputController);
  const root = useRef(null);
  useLayoutEffect(() => {
    const host = root.current;
    const field = host?.querySelector("input");
    if (!host || !field) return;
    field.removeAttribute("maxlength");
    field.removeAttribute("minlength");
    field.pattern = "[0-9]*";
    const cleanReplacement = (event) => {
      const text = event.data;
      if (event.defaultPrevented || !event.cancelable || event.isComposing || !event.inputType.startsWith("insert") || !text || event.target !== field) return;
      const digits = text.replace(/\D/g, "");
      if (!digits || digits === text) return;
      event.preventDefault();
      event.stopPropagation();
      controller.setValue(insertOTPDigits(field, digits, count), { reason: "input-change", event });
    };
    host.addEventListener("beforeinput", cleanReplacement, true);
    return () => host.removeEventListener("beforeinput", cleanReplacement, true);
  }, [controller, count]);
  const confirmed = verified && value.length >= count;
  return /* @__PURE__ */ jsx(Field, { ...{ label, help, error }, children: (binding) => /* @__PURE__ */ jsxs(
    SDKOTP,
    {
      ...binding,
      ref: root,
      "aria-label": label,
      className: "yg-otp",
      "data-agent-secret": "",
      "data-partial": value.length > 0 && value.length < count || void 0,
      "data-verified": confirmed || void 0,
      maxLength: count,
      pattern: "digits",
      controller,
      onInputCapture: (event) => {
        const field = event.target;
        if (!(field instanceof HTMLInputElement)) return;
        const raw = field.value;
        const digits = raw.replace(/\D/g, "").slice(0, count);
        if (raw === digits) return;
        event.stopPropagation();
        field.value = value;
        controller.setValue(digits, { reason: "input-change", event: event.nativeEvent });
      },
      onPasteCapture: (event) => {
        const text = event.clipboardData.getData("text/plain");
        if (!/[^\d\s-]/.test(text) || !(event.target instanceof HTMLInputElement)) return;
        const digits = text.replace(/\D/g, "");
        if (!digits) return;
        event.stopPropagation();
        event.preventDefault();
        controller.setValue(
          insertOTPDigits(event.target, digits, count),
          { reason: "paste", event: event.nativeEvent }
        );
      },
      name,
      disabled,
      value,
      onValueChange,
      style: { "--yg-digits": count },
      children: [
        /* @__PURE__ */ jsx(OTPInputGroup, { className: "yg-otp-slots", children: Array.from({ length: count }, (_, index) => /* @__PURE__ */ jsx(OTPInputSlot, { index, render: /* @__PURE__ */ jsx("span", {}), children: ({ char }) => char && /* @__PURE__ */ jsx("span", { className: "yg-otp-ink", children: /* @__PURE__ */ jsx(OtpDigit, { value: char }, char) }) }, index)) }),
        confirmed && /* @__PURE__ */ jsxs("span", { role: "status", className: "yg-otp-confirmation", children: [
          /* @__PURE__ */ jsx(Icon, { name: "check" }),
          " Verified"
        ] })
      ]
    }
  ) });
}
function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  children,
  disabled,
  size = "regular",
  className
}) {
  const [internal, setInternal] = useState(Boolean(defaultPressed));
  const active = pressed ?? internal;
  return /* @__PURE__ */ jsx(
    SDKToggle,
    {
      pressed: active,
      onPressedChange: (next) => {
        if (pressed === void 0) setInternal(next);
        onPressedChange?.(next);
      },
      className: cx("yg-button yg-toggle", className),
      "data-control-size": size,
      "data-shape": "rounded",
      "data-pressed": active || void 0,
      disabled,
      children: /* @__PURE__ */ jsx("span", { className: "yg-button-inner", children: /* @__PURE__ */ jsx("span", { className: "yg-button-label", children: /* @__PURE__ */ jsx("span", { className: "yg-button-content", children }) }) })
    }
  );
}
function ToggleGroup({
  label,
  items,
  value,
  onValueChange,
  multiple = false,
  size = "regular",
  className
}) {
  return /* @__PURE__ */ jsx(
    SDKToggleGroup,
    {
      className: cx("yg-toggle-group", className),
      "data-control-size": size,
      "aria-label": label,
      render: (props) => /* @__PURE__ */ jsx("div", { ...props, role: multiple ? "toolbar" : "radiogroup" }),
      multiple,
      deselectable: true,
      value: multiple ? value : value.slice(0, 1),
      onValueChange: (next) => {
        if (next.some((id) => !value.includes(id) && !items.some((item) => item.id === id && !item.disabled))) return;
        const selected = new Set(next);
        onValueChange(multiple ? [...value.filter((id) => selected.has(id)), ...next.filter((id) => !value.includes(id))] : next);
      },
      onKeyDownCapture: (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const current = event.target.closest("button[data-yg-toggle-id]");
        const enabled = items.filter((item) => !item.disabled);
        const index = enabled.findIndex((item) => item.id === current?.dataset.ygToggleId);
        if (index < 0) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const next = {
          ArrowRight: (index + (rtl ? -1 : 1) + enabled.length) % enabled.length,
          ArrowLeft: (index + (rtl ? 1 : -1) + enabled.length) % enabled.length,
          Home: 0,
          End: enabled.length - 1
        }[event.key];
        if (next === void 0) return;
        event.preventDefault();
        [...event.currentTarget.querySelectorAll("button[data-yg-toggle-id]")].find((button) => button.dataset.ygToggleId === enabled[next].id)?.focus();
      },
      children: items.map((item) => /* @__PURE__ */ jsx(
        SDKToggle,
        {
          value: item.id,
          disabled: item.disabled,
          className: "yg-toggle-item",
          "data-yg-toggle-id": item.id,
          render: (props, state) => /* @__PURE__ */ jsx(
            "button",
            {
              ...props,
              disabled: item.disabled,
              role: multiple ? void 0 : "radio",
              "aria-checked": multiple ? void 0 : state.pressed,
              "aria-pressed": multiple ? state.pressed : void 0,
              "data-state": state.pressed ? "on" : "off"
            }
          ),
          children: item.label
        },
        item.id
      ))
    }
  );
}

export {
  InputGroup,
  InputOTP,
  Toggle,
  ToggleGroup
};
