"use client";
import {
  Checkbox,
  Field
} from "./chunk-WWQHEDM4.js";
import {
  dist_exports12 as dist_exports
} from "./chunk-5SWGMKHQ.js";
import {
  Button,
  IconButton
} from "./chunk-P4D5QO3L.js";
import {
  cx
} from "./chunk-3EP3O3HY.js";

// packages/web/src/controls/inputs.tsx
import {
  useEffect,
  useId,
  useState
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function InputGroup({
  label,
  leading,
  trailing,
  help,
  error,
  id,
  ...input
}) {
  return /* @__PURE__ */ jsx(Field, { ...{ id, label, help, error }, children: (binding) => /* @__PURE__ */ jsxs("span", { className: "yg-input yg-input-group", children: [
    leading,
    /* @__PURE__ */ jsx("input", { ...input, ...binding }),
    trailing
  ] }) });
}
function InputOTP({
  label,
  length = 6,
  value,
  onValueChange,
  name,
  disabled,
  help,
  error
}) {
  const count = Math.max(1, Math.min(12, Math.trunc(length) || 6));
  const [cursor, setCursor] = useState(0);
  return /* @__PURE__ */ jsx(Field, { ...{ label, help, error }, children: (binding) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "yg-otp",
      "data-complete": value.length >= count || void 0,
      "data-disabled": disabled || void 0,
      style: { "--yg-digits": count },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ...binding,
            "aria-label": label,
            inputMode: "numeric",
            autoComplete: "one-time-code",
            pattern: "[0-9]*",
            name,
            disabled,
            value,
            onSelect: (e) => setCursor(e.currentTarget.selectionStart ?? 0),
            onChange: (e) => onValueChange(e.target.value.replace(/\D/g, "").slice(0, count))
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "yg-otp-slots", "aria-hidden": "true", children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsx(
          "span",
          {
            "data-cursor": i === Math.min(cursor, count - 1) || void 0,
            "data-filled": !!value[i] || void 0,
            children: value[i] && /* @__PURE__ */ jsx("span", { className: "yg-otp-digit", children: value[i] }, value[i])
          },
          i
        )) })
      ]
    }
  ) });
}
function SplitTextField({
  label,
  parts,
  onValueChange,
  separator = "\u2013"
}) {
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx("div", { className: "yg-split-inputs", children: parts.map((p, i) => /* @__PURE__ */ jsxs("span", { children: [
      i > 0 && /* @__PURE__ */ jsx("i", { "aria-hidden": "true", children: separator }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "yg-standalone",
          "aria-label": p.label,
          value: p.value,
          maxLength: p.maxLength,
          inputMode: p.inputMode,
          onChange: (e) => onValueChange(p.id, e.target.value)
        }
      )
    ] }, p.id)) })
  ] });
}
function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  disabled
}) {
  const id = useId();
  return /* @__PURE__ */ jsxs("div", { className: "yg-range", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: id, className: "yg-label", children: label }),
      /* @__PURE__ */ jsxs("output", { htmlFor: id, children: [
        value,
        unit
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        id,
        type: "range",
        min,
        max,
        step,
        value,
        disabled,
        "aria-valuetext": unit ? value + unit : void 0,
        onChange: (e) => onValueChange(e.target.valueAsNumber)
      }
    )
  ] });
}
function NumericSpinner({
  label,
  value,
  min = 0,
  max = 99,
  step = 1,
  onValueChange,
  disabled
}) {
  const increment = Math.max(1, Math.floor(step) || 1);
  return /* @__PURE__ */ jsxs("div", { className: "yg-quantity", role: "group", "aria-label": label, children: [
    /* @__PURE__ */ jsx("span", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "quiet",
          "aria-label": "Decrease " + label,
          disabled: disabled || value <= min,
          onClick: () => onValueChange(Math.max(min, value - increment)),
          children: "\u2212"
        }
      ),
      /* @__PURE__ */ jsx("output", { "aria-label": label, "aria-live": "polite", children: value }),
      /* @__PURE__ */ jsx(
        IconButton,
        {
          icon: "plus",
          label: "Increase " + label,
          disabled: disabled || value >= max,
          onClick: () => onValueChange(Math.min(max, value + increment))
        }
      )
    ] })
  ] });
}
function Rating({
  label,
  value,
  onValueChange,
  max = 5
}) {
  const id = useId(), count = Math.max(1, Math.min(10, Math.floor(max) || 5));
  if (!onValueChange)
    return /* @__PURE__ */ jsxs("span", { className: "yg-score", "aria-label": label, children: [
      value,
      " / ",
      count
    ] });
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx("div", { className: "yg-rating", children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsxs("label", { "data-filled": i < value || void 0, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "radio",
          name: id,
          "aria-label": i + 1 + " of " + count,
          checked: value === i + 1,
          onChange: () => onValueChange(i + 1)
        }
      ),
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u2605" })
    ] }, i)) })
  ] });
}
function Agreement({
  label,
  items,
  selected,
  onValueChange
}) {
  const enabled = items.filter((i) => !i.disabled), chosen = enabled.filter((i) => selected.includes(i.id)), all = enabled.length > 0 && chosen.length === enabled.length;
  function update(ids, on) {
    const keys = new Set(selected);
    ids.forEach((id) => on ? keys.add(id) : keys.delete(id));
    onValueChange([...keys]);
  }
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset yg-agreement", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: "Select all",
        disabled: !enabled.length,
        checked: all ? true : chosen.length ? "indeterminate" : false,
        onCheckedChange: () => update(
          enabled.map((i) => i.id),
          !all
        )
      }
    ),
    items.map((i) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          label: i.label,
          disabled: i.disabled,
          checked: selected.includes(i.id),
          onCheckedChange: (v) => update([i.id], v === true)
        }
      ),
      i.detail
    ] }, i.id))
  ] });
}
function keypadRows(mode, upper) {
  const letters = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].map(
    (row) => upper ? row.toUpperCase() : row
  );
  return mode === "number" ? ["123", "456", "789", "0"] : mode === "alphabet" ? letters : ["1234567890", ...letters];
}
function Keypad({
  label,
  mode = "number",
  onKey,
  onDelete,
  onSubmit,
  disabled = false
}) {
  const [upper, setUpper] = useState(false), [gaps, setGaps] = useState([]);
  useEffect(() => {
    if (mode === "private")
      setGaps(Array.from(crypto.getRandomValues(new Uint32Array(4))));
  }, [mode]);
  return /* @__PURE__ */ jsxs("div", { className: "yg-keypad", role: "group", "aria-label": label, "data-mode": mode, children: [
    (mode === "private" && !gaps.length ? [] : keypadRows(mode, upper)).map(
      (row, i) => {
        const keys = Array.from(row);
        if (mode === "private" && gaps[i] !== void 0)
          keys.splice(gaps[i] % (keys.length + 1), 0, null);
        return /* @__PURE__ */ jsx("div", { className: "yg-key-row", children: keys.map(
          (key, j) => key === null ? /* @__PURE__ */ jsx("span", { "aria-hidden": "true" }, "gap" + j) : /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              disabled,
              onClick: () => onKey(key),
              children: key
            },
            key
          )
        ) }, i);
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "yg-key-actions", children: [
      mode !== "number" && /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "quiet",
          disabled,
          "aria-pressed": upper,
          onClick: () => setUpper(!upper),
          children: "Shift"
        }
      ),
      /* @__PURE__ */ jsx(Button, { emphasis: "quiet", disabled, onClick: onDelete, children: "Delete" }),
      onSubmit && /* @__PURE__ */ jsx(Button, { disabled, onClick: onSubmit, children: "Done" })
    ] })
  ] });
}
function Form({
  label,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx("form", { ...props, "aria-label": label, className: cx("yg-stack", className) });
}
function Toggle({
  pressed,
  onPressedChange,
  children,
  disabled
}) {
  return /* @__PURE__ */ jsx(
    Button,
    {
      "aria-pressed": pressed,
      emphasis: pressed ? "soft" : "quiet",
      disabled,
      onClick: () => onPressedChange(!pressed),
      children
    }
  );
}
function ToggleGroup({
  label,
  items,
  value,
  onValueChange,
  multiple = false
}) {
  const children = items.map((i) => /* @__PURE__ */ jsx(
    dist_exports.Item,
    {
      className: "yg-toggle-item",
      value: i.id,
      disabled: i.disabled,
      children: i.label
    },
    i.id
  ));
  return multiple ? /* @__PURE__ */ jsx(
    dist_exports.Root,
    {
      className: "yg-toggle-group",
      "aria-label": label,
      type: "multiple",
      value,
      onValueChange,
      children
    }
  ) : /* @__PURE__ */ jsx(
    dist_exports.Root,
    {
      className: "yg-toggle-group",
      "aria-label": label,
      type: "single",
      value: value[0] ?? "",
      onValueChange: (v) => onValueChange(v ? [v] : []),
      children
    }
  );
}

export {
  InputGroup,
  InputOTP,
  SplitTextField,
  Slider,
  NumericSpinner,
  Rating,
  Agreement,
  Keypad,
  Form,
  Toggle,
  ToggleGroup
};
