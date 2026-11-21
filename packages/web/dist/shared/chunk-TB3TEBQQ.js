"use client";
import {
  playSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Checkbox,
  Field
} from "./chunk-HFYCA3VK.js";
import {
  Button,
  IconButton
} from "./chunk-4IPCB3MM.js";
import {
  Icon,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/controls/inputs.tsx
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup } from "@ui-sdk/react/toggle";
import { Input as SDKInput } from "@ui-sdk/react/input";
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
function OtpDigit({ value }) {
  const digit = useRef(null);
  useLayoutEffect(() => {
    const node = digit.current;
    if (!node) return;
    const lift = spring(-14, 520, 16);
    const opacity = spring(0, 400, 28);
    lift.target = 0;
    opacity.target = 1;
    return playSprings([lift, opacity], () => {
      node.style.translate = `0 ${lift.position}px`;
      node.style.opacity = String(Math.max(0, Math.min(1, opacity.position)));
    });
  }, [value]);
  return /* @__PURE__ */ jsx("span", { ref: digit, className: "yg-otp-digit", children: value });
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
  const [cursor, setCursor] = useState(0);
  const confirmed = verified && value.length >= count;
  const surface = useRef(null);
  const [motion] = useState(() => ({ merge: spring(0, 260, 24), confirm: spring(0, 220, 28) }));
  useLayoutEffect(() => {
    const node = surface.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const axes = [motion.merge, motion.confirm];
    let stop;
    let mergeTimer;
    let revealTimer;
    function paint() {
      node?.style.setProperty("--yg-otp-merge", String(Math.max(0, Math.min(1, motion.merge.position))));
      node?.style.setProperty("--yg-otp-confirm", String(Math.max(0, Math.min(1, motion.confirm.position))));
    }
    function play() {
      stop?.();
      stop = playSprings(axes, paint);
    }
    function settleImmediately() {
      if (!media.matches) return;
      clearTimeout(mergeTimer);
      clearTimeout(revealTimer);
      stop?.();
      axes.forEach((axis) => snap(axis, Number(confirmed)));
      paint();
    }
    if (media.matches) {
      settleImmediately();
    } else if (confirmed) {
      mergeTimer = setTimeout(() => {
        motion.merge.target = 1;
        play();
      }, 250);
      revealTimer = setTimeout(() => {
        motion.confirm.target = 1;
        play();
      }, 550);
    } else {
      axes.forEach((axis) => {
        axis.target = 0;
      });
      if (axes.some((axis) => axis.position !== 0)) play();
    }
    media.addEventListener("change", settleImmediately);
    return () => {
      stop?.();
      clearTimeout(mergeTimer);
      clearTimeout(revealTimer);
      media.removeEventListener("change", settleImmediately);
    };
  }, [confirmed, motion]);
  return /* @__PURE__ */ jsx(Field, { ...{ label, help, error }, children: (binding) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: surface,
      className: "yg-otp",
      "data-complete": value.length >= count || void 0,
      "data-verified": confirmed || void 0,
      "data-disabled": disabled || void 0,
      style: { "--yg-digits": count },
      children: [
        /* @__PURE__ */ jsx(
          SDKInput,
          {
            ...binding,
            "aria-label": label,
            "data-agent-secret": "",
            inputMode: "numeric",
            autoComplete: "one-time-code",
            pattern: "[0-9]*",
            name,
            disabled,
            value,
            render: /* @__PURE__ */ jsx("input", { onSelect: (e) => setCursor(e.currentTarget.selectionStart ?? 0) }),
            onChange: (event) => {
              const next = event.currentTarget.value.replace(/\D/g, "").slice(0, count);
              setCursor(Math.min(event.currentTarget.selectionStart ?? next.length, next.length));
              onValueChange(next);
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "yg-otp-slots", "aria-hidden": "true", children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsx(
          "span",
          {
            "data-cursor": i === Math.min(cursor, count - 1) || void 0,
            "data-filled": !!value[i] || void 0,
            children: value[i] && /* @__PURE__ */ jsx("span", { className: "yg-otp-ink", children: /* @__PURE__ */ jsx(OtpDigit, { value: value[i] }, value[i]) })
          },
          i
        )) }),
        confirmed && /* @__PURE__ */ jsxs("span", { role: "status", className: "yg-otp-confirmation", children: [
          /* @__PURE__ */ jsx(Icon, { name: "check" }),
          " Verified"
        ] })
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
  disabled,
  presentation = "inline",
  formatValue
}) {
  const id = useId();
  const fill = max > min ? Math.max(0, Math.min(100, (value - min) / (max - min) * 100)) : 0;
  const formatted = formatValue ? formatValue(value) : value + unit;
  if (presentation === "card") {
    return /* @__PURE__ */ jsxs("div", { className: "yg-motion-range", style: { "--yg-range-fill": `${fill}%` }, children: [
      /* @__PURE__ */ jsx("div", { className: "yg-motion-range-heading", children: /* @__PURE__ */ jsx("label", { htmlFor: id, children: label }) }),
      /* @__PURE__ */ jsxs("div", { className: "yg-motion-range-area", children: [
        /* @__PURE__ */ jsx("span", { className: "yg-motion-range-tip", "aria-hidden": "true", style: { insetInlineStart: `${fill}%` }, children: formatted }),
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
            "aria-valuetext": formatValue || unit ? formatted : void 0,
            onChange: (event) => onValueChange(event.currentTarget.valueAsNumber)
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "yg-range", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: id, className: "yg-label", children: label }),
      /* @__PURE__ */ jsx("output", { htmlFor: id, children: formatted })
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
        style: { "--yg-range-fill": `${fill}%` },
        "aria-valuetext": formatValue || unit ? formatted : void 0,
        onChange: (e) => onValueChange(e.target.valueAsNumber)
      }
    )
  ] });
}
function NumericSpinner({
  label,
  help,
  decreaseLabel,
  increaseLabel,
  value,
  min = 0,
  max = 99,
  step = 1,
  onValueChange,
  disabled
}) {
  const increment = Math.max(1, Math.floor(step) || 1);
  const previous = useRef(value);
  const last = previous.current;
  useLayoutEffect(() => {
    previous.current = value;
  }, [value]);
  return /* @__PURE__ */ jsxs("div", { className: "yg-quantity", role: "group", "aria-label": label, children: [
    /* @__PURE__ */ jsxs("span", { className: "yg-quantity-label", children: [
      /* @__PURE__ */ jsx("span", { className: "yg-label", children: label }),
      help && /* @__PURE__ */ jsx("span", { className: "yg-help", children: help })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "soft",
          shape: "pill",
          size: "comfortable",
          "aria-label": decreaseLabel ?? "Decrease " + label,
          disabled: disabled || value <= min,
          onClick: () => onValueChange(Math.max(min, value - increment)),
          children: "\u2212"
        }
      ),
      /* @__PURE__ */ jsxs("output", { "aria-label": label, "aria-live": "polite", "data-decreasing": value < last || void 0, children: [
        last !== value && /* @__PURE__ */ jsx("span", { className: "yg-quantity-out", "aria-hidden": "true", children: last }, `old-${value}`),
        /* @__PURE__ */ jsx("span", { className: last !== value ? "yg-quantity-in" : void 0, children: value }, value)
      ] }),
      /* @__PURE__ */ jsx(
        IconButton,
        {
          icon: "plus",
          label: increaseLabel ?? "Increase " + label,
          emphasis: "soft",
          shape: "pill",
          size: "comfortable",
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
  max = 5,
  showStatus = false
}) {
  const id = useId(), count = Math.max(1, Math.min(10, Math.floor(max) || 5));
  const [hovered, setHovered] = useState(0);
  const root = useRef(null);
  const [roller] = useState(() => spring(0, 260, 22));
  const stars = useMemo(() => Array.from({ length: count }, () => ({
    fill: spring(0, 300, 24),
    press: spring(1, 520, 13)
  })), [count]);
  const shown = Math.max(0, Math.min(count, hovered || value));
  const editable = Boolean(onValueChange);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const glyphs = Array.from(node.querySelectorAll(".yg-rating svg"));
    const springs = [roller, ...stars.flatMap((star) => [star.fill, star.press])];
    roller.target = shown;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop;
    const render = () => {
      node.style.setProperty("--yg-rating-shown", String(roller.position));
      stars.forEach((star, index) => {
        const alpha = Math.min(1, Math.max(0, star.fill.position));
        glyphs[index]?.style.setProperty("--yg-star-fill", `${alpha * 100}%`);
        glyphs[index]?.style.setProperty("--yg-star-scale", String(star.press.position));
      });
    };
    const timers = stars.map((star, index) => {
      const on = index < shown;
      const light = () => {
        if (on && star.fill.target !== 1 && !reduced) {
          star.press.position = 0.7;
          star.press.velocity = 7;
        }
        star.fill.target = Number(on);
      };
      if (!on || reduced || index === 0) {
        light();
        return void 0;
      }
      return setTimeout(() => {
        light();
        stop?.();
        stop = playSprings(springs, render);
      }, index * 50);
    });
    stop = playSprings(springs, render);
    return () => {
      timers.forEach(clearTimeout);
      stop?.();
    };
  }, [shown, stars, roller, editable]);
  if (!onValueChange)
    return /* @__PURE__ */ jsxs("span", { className: "yg-score", "aria-label": label, children: [
      value,
      " / ",
      count
    ] });
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset", ref: root, children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    /* @__PURE__ */ jsx("div", { className: "yg-rating", onPointerLeave: () => setHovered(0), children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsxs(
      "label",
      {
        "data-filled": i < shown || void 0,
        onPointerEnter: (event) => {
          if (event.pointerType === "mouse") setHovered(i + 1);
        },
        children: [
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
          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z" }) })
        ]
      },
      i
    )) }),
    showStatus && /* @__PURE__ */ jsx(
      "span",
      {
        className: "yg-help yg-rating-status",
        role: "status",
        "aria-label": value ? `${value} of ${count} selected` : "Choose a rating",
        children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: ["Choose a rating", ...Array.from({ length: count }, (_, i) => `${i + 1} of ${count} selected`)].map((text) => /* @__PURE__ */ jsx("span", { children: text }, text)) })
      }
    )
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
    SDKToggle,
    {
      pressed,
      onPressedChange,
      className: "yg-button",
      "data-emphasis": pressed ? "soft" : "quiet",
      "data-tone": "neutral",
      "data-control-size": "regular",
      "data-shape": "rounded",
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
  multiple = false
}) {
  return /* @__PURE__ */ jsx(
    SDKToggleGroup,
    {
      className: "yg-toggle-group",
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
