"use client";
import { OTPInput as SDKOTP, OTPInputGroup, OTPInputSlot, createOTPInputController } from "@ui-sdk/react/otp-input";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup } from "@ui-sdk/react/toggle";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Radio as SDKRadio, RadioGroup as SDKRadioGroup } from "@ui-sdk/react/radio";
import { Button, IconButton } from "./actions.js";
import { Checkbox, Field, SpringTextInput } from "./forms.js";
import { cx, Icon, type ControlSize, type Option } from "../foundation/foundation.js";

type Input = Omit<ComponentProps<"input">, "size" | "prefix">;
export function InputGroup({
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
}: Input & {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  help?: string;
  error?: string;
  size?: ControlSize | "featured";
  motion?: "spring";
  containerClassName?: string;
}) {
  const sharedInput = ["text", "search", "email", "url", "tel", "password"].includes(input.type ?? "text") &&
    !Array.isArray(input.value) && !Array.isArray(input.defaultValue);
  const { onSelect, ...sharedProps } = input;
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input yg-input-group", `yg-input-size-${size}`, containerClassName)}>
          {leading}
          {sharedInput && motion === "spring" && (input.type ?? "text") === "text"
            ? <SpringTextInput {...input} {...binding} aria-invalid={binding["aria-invalid"] ?? input["aria-invalid"]} aria-describedby={[input["aria-describedby"], binding["aria-describedby"]].filter(Boolean).join(" ") || undefined} />
            : sharedInput ? <SDKInput {...sharedProps} {...binding}
            aria-invalid={binding["aria-invalid"] ?? input["aria-invalid"]}
            aria-describedby={[input["aria-describedby"], binding["aria-describedby"]].filter(Boolean).join(" ") || undefined}
            render={onSelect ? <input onSelect={onSelect} /> : undefined}
            value={input.value == null ? undefined : String(input.value)}
            defaultValue={input.defaultValue == null ? undefined : String(input.defaultValue)}
            onValueChange={(next, details) => {
              if (details.reason === "imperative" && input.maxLength !== undefined && input.maxLength >= 0 && next.length > input.maxLength) details.cancel();
            }} /> : <input {...input} {...binding} />}
          {trailing}
        </SDKInputGroup>
      )}
    </Field>
  );
}
function OtpDigit({ value }: { value: string }) {
  return <span className="yg-otp-digit">{value}</span>;
}

function insertOTPDigits(field: HTMLInputElement, digits: string, count: number) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  return (field.value.slice(0, start) + digits + field.value.slice(end)).slice(0, count);
}

export function InputOTP({
  label,
  length = 6,
  value,
  onValueChange,
  name,
  disabled,
  verified = false,
  help,
  error,
}: {
  label: string;
  length?: number;
  value: string;
  onValueChange: (v: string) => void;
  name?: string;
  disabled?: boolean;
  verified?: boolean;
  help?: string;
  error?: string;
}) {
  const count = Math.max(1, Math.min(12, Math.trunc(length) || 6));
  const [controller] = useState(createOTPInputController);
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const host = root.current;
    const field = host?.querySelector("input");
    if (!host || !field) return;
    // WebKit truncates replacement text before beforeinput when maxlength is present.
    field.removeAttribute("maxlength");
    // Forms can submit a partial code for host validation.
    field.removeAttribute("minlength");
    field.pattern = "[0-9]*";

    const cleanReplacement = (event: InputEvent) => {
      const text = event.data;
      if (event.defaultPrevented || !event.cancelable || event.isComposing ||
          !event.inputType.startsWith("insert") || !text || event.target !== field) return;
      const digits = text.replace(/\D/g, "");
      if (!digits || digits === text) return;

      // The SDK rejects mixed insertions before an input event can normalize them.
      event.preventDefault();
      event.stopPropagation();
      controller.setValue(insertOTPDigits(field, digits, count), { reason: "input-change", event });
    };

    host.addEventListener("beforeinput", cleanReplacement, true);
    return () => host.removeEventListener("beforeinput", cleanReplacement, true);
  }, [controller, count]);
  const confirmed = verified && value.length >= count;
  return (
    <Field {...{ label, help, error }}>
      {(binding) => (
        <SDKOTP
          {...binding}
          ref={root}
          aria-label={label}
          className="yg-otp"
          data-agent-secret=""
          data-partial={value.length > 0 && value.length < count || undefined}
          data-verified={confirmed || undefined}
          maxLength={count}
          pattern="digits"
          controller={controller}
          onInputCapture={event => {
            const field = event.target;
            if (!(field instanceof HTMLInputElement)) return;
            const raw = field.value;
            const digits = raw.replace(/\D/g, "").slice(0, count);
            if (raw === digits) return;

            event.stopPropagation();
            field.value = value;
            controller.setValue(digits, { reason: "input-change", event: event.nativeEvent });
          }}
          onPasteCapture={event => {
            const text = event.clipboardData.getData("text/plain");
            if (!/[^\d\s-]/.test(text) || !(event.target instanceof HTMLInputElement)) return;
            const digits = text.replace(/\D/g, "");
            if (!digits) return;
            event.stopPropagation();
            event.preventDefault();
            controller.setValue(insertOTPDigits(event.target, digits, count),
              { reason: "paste", event: event.nativeEvent });
          }}
          name={name}
          disabled={disabled}
          value={value}
          onValueChange={onValueChange}
          style={{ "--yg-digits": count } as CSSProperties}
        >
          <OTPInputGroup className="yg-otp-slots">
            {Array.from({ length: count }, (_, index) => (
              <OTPInputSlot key={index} index={index} render={<span />}>
                {({ char }) => char && <span className="yg-otp-ink">
                  <OtpDigit key={char} value={char} />
                </span>}
              </OTPInputSlot>
            ))}
          </OTPInputGroup>
          {confirmed && <span role="status" className="yg-otp-confirmation"><Icon name="check" /> Verified</span>}
        </SDKOTP>
      )}
    </Field>
  );
}
export function SplitTextField({
  label,
  parts,
  onValueChange,
  separator = "–",
}: {
  label: string;
  parts: {
    id: string;
    label: string;
    value: string;
    maxLength?: number;
    inputMode?: Input["inputMode"];
  }[];
  onValueChange: (id: string, value: string) => void;
  separator?: string;
}) {
  return (
    <fieldset className="yg-fieldset">
      <legend className="yg-label">{label}</legend>
      <div className="yg-split-inputs">
        {parts.map((p, i) => (
          <span key={p.id}>
            {i > 0 && <i aria-hidden="true">{separator}</i>}
            <SDKInput
              className="yg-standalone"
              aria-label={p.label}
              value={p.value}
              maxLength={p.maxLength}
              inputMode={p.inputMode}
              onValueChange={(next, details) => {
                if (details.reason === "imperative" && p.maxLength !== undefined && p.maxLength >= 0 && next.length > p.maxLength) details.cancel();
              }}
              onChange={(e) => {
                onValueChange(p.id, e.currentTarget.value);
              }}
            />
          </span>
        ))}
      </div>
    </fieldset>
  );
}
export { Slider, RangeSlider } from "./slider.js";
export function NumericSpinner({
  label,
  help,
  decreaseLabel,
  increaseLabel,
  value,
  min = 0,
  max = 99,
  step = 1,
  onValueChange,
  disabled,
}: {
  label: string;
  help?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}) {
  const increment = Math.max(1, Math.floor(step) || 1);
  const previous = useRef(value);
  const last = previous.current;
  useLayoutEffect(() => { previous.current = value; }, [value]);
  return (
    <div className="yg-quantity" role="group" aria-label={label}>
      <span className="yg-quantity-label">
        <span className="yg-label">{label}</span>
        {help && <span className="yg-help">{help}</span>}
      </span>
      <div>
        <Button
          emphasis="soft"
          shape="pill"
          size="comfortable"
          aria-label={decreaseLabel ?? "Decrease " + label}
          disabled={disabled || value <= min}
          onClick={() => onValueChange(Math.max(min, value - increment))}
        >
          −
        </Button>
        <output aria-label={label} aria-live="polite" data-decreasing={value < last || undefined}>
          {[min, max, last, value].map((measurement, index) => (
            <span className="yg-quantity-measure" aria-hidden="true" key={index}>{measurement}</span>
          ))}
          {last !== value && <span key={`old-${value}`} className="yg-quantity-out" aria-hidden="true">{last}</span>}
          <span key={value} className={last !== value ? "yg-quantity-in" : undefined}>{value}</span>
        </output>
        <IconButton
          icon="plus"
          label={increaseLabel ?? "Increase " + label}
          emphasis="soft"
          shape="pill"
          size="comfortable"
          disabled={disabled || value >= max}
          onClick={() => onValueChange(Math.min(max, value + increment))}
        />
      </div>
    </div>
  );
}
export function Rating({
  label,
  value,
  onValueChange,
  max = 5,
  showStatus = false,
}: {
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
  max?: number;
  showStatus?: boolean;
}) {
  const id = useId(),
    count = Math.max(1, Math.min(10, Math.floor(max) || 5));
  const [hovered, setHovered] = useState(0);
  const shown = Math.max(0, Math.min(count, hovered || value));
  if (!onValueChange)
    return (
      <span className="yg-score" aria-label={label}>
        {value} / {count}
      </span>
    );
  return (
    <fieldset className="yg-fieldset" style={{ "--yg-rating-shown": shown } as CSSProperties}>
      <legend className="yg-label">{label}</legend>
      <SDKRadioGroup className="yg-rating" aria-label={label} name={id} value={String(value)}
        onValueChange={(next, details) => {
          const selected = Number(next);
          if (next === null || !Number.isInteger(selected) || selected < 1 || selected > count) {
            details.cancel();
            return;
          }
          onValueChange(selected);
        }} onPointerLeave={() => setHovered(0)}
        onKeyDown={event => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) setHovered(0);
        }}>
        {Array.from({ length: count }, (_, i) => (
          <label key={i} data-filled={i < shown || undefined}
            onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(i + 1); }}>
            <SDKRadio
              value={String(i + 1)}
              aria-label={i + 1 + " of " + count}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ "--yg-star-fill": i < shown ? "100%" : "0%" } as CSSProperties}>
              <path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z" />
            </svg>
          </label>
        ))}
      </SDKRadioGroup>
      {showStatus && <span className="yg-help yg-rating-status" role="status"
        aria-label={value ? `${value} of ${count} selected` : "Choose a rating"}>
        <span aria-hidden="true">{["Choose a rating", ...Array.from({ length: count }, (_, i) => `${i + 1} of ${count} selected`)]
          .map(text => <span key={text}>{text}</span>)}</span>
      </span>}
    </fieldset>
  );
}
export function Agreement({
  label,
  items,
  selected,
  onValueChange,
}: {
  label: string;
  items: (Option & { detail?: ReactNode })[];
  selected: string[];
  onValueChange: (ids: string[]) => void;
}) {
  const enabled = items.filter((i) => !i.disabled),
    chosen = enabled.filter((i) => selected.includes(i.id)),
    all = enabled.length > 0 && chosen.length === enabled.length;
  function update(ids: string[], on: boolean) {
    const keys = new Set(selected);
    ids.forEach((id) => (on ? keys.add(id) : keys.delete(id)));
    onValueChange([...keys]);
  }
  return (
    <fieldset className="yg-fieldset yg-agreement">
      <legend className="yg-label">{label}</legend>
      <Checkbox
        label="Select all"
        disabled={!enabled.length}
        checked={all ? true : chosen.length ? "indeterminate" : false}
        onCheckedChange={() =>
          update(
            enabled.map((i) => i.id),
            !all,
          )
        }
      />
      {items.map((i) => (
        <div key={i.id}>
          <Checkbox
            label={i.label}
            disabled={i.disabled}
            checked={selected.includes(i.id)}
            onCheckedChange={(v) => update([i.id], v === true)}
          />
          {i.detail}
        </div>
      ))}
    </fieldset>
  );
}
type KeyMode = "number" | "alphabet" | "private";
function keypadRows(mode: KeyMode, upper: boolean) {
  const letters = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row) =>
    upper ? row.toUpperCase() : row,
  );
  return mode === "number"
    ? ["123", "456", "789", "0"]
    : mode === "alphabet"
      ? letters
      : ["1234567890", ...letters];
}
export function Keypad({
  label,
  mode = "number",
  onKey,
  onDelete,
  onSubmit,
  disabled = false,
}: {
  label: string;
  mode?: KeyMode;
  onKey: (key: string) => void;
  onDelete: () => void;
  onSubmit?: () => void;
  disabled?: boolean;
}) {
  const [upper, setUpper] = useState(false),
    [gaps, setGaps] = useState<number[]>([]);
  useEffect(() => {
    if (mode === "private")
      setGaps(Array.from(crypto.getRandomValues(new Uint32Array(4))));
  }, [mode]);
  return (
    <div className="yg-keypad" role="group" aria-label={label} data-mode={mode}>
      {(mode === "private" && !gaps.length ? [] : keypadRows(mode, upper)).map(
        (row, i) => {
          const keys: (string | null)[] = Array.from(row);
          if (mode === "private" && gaps[i] !== undefined)
            keys.splice(gaps[i] % (keys.length + 1), 0, null);
          return (
            <div className="yg-key-row" key={i}>
              {keys.map((key, j) =>
                key === null ? (
                  <span key={"gap" + j} aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    key={key}
                    disabled={disabled}
                    onClick={() => onKey(key)}
                  >
                    {key}
                  </button>
                ),
              )}
            </div>
          );
        },
      )}
      <div className="yg-key-actions">
        {mode !== "number" && (
          <Button
            emphasis="quiet"
            disabled={disabled}
            aria-pressed={upper}
            onClick={() => setUpper(!upper)}
          >
            Shift
          </Button>
        )}
        <Button emphasis="quiet" disabled={disabled} onClick={onDelete}>
          Delete
        </Button>
        {onSubmit && (
          <Button disabled={disabled} onClick={onSubmit}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
export function Form({
  label,
  className,
  ...props
}: Omit<ComponentProps<"form">, "aria-label"> & { label: string }) {
  return (
    <form {...props} aria-label={label} className={cx("yg-stack", className)} />
  );
}
export function Toggle({
  pressed,
  onPressedChange,
  children,
  disabled,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <SDKToggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className="yg-button"
      data-emphasis={pressed ? "soft" : "quiet"}
      data-tone="neutral"
      data-control-size="regular"
      data-shape="rounded"
      disabled={disabled}
    >
      <span className="yg-button-inner"><span className="yg-button-label"><span className="yg-button-content">{children}</span></span></span>
    </SDKToggle>
  );
}
export function ToggleGroup({
  label,
  items,
  value,
  onValueChange,
  multiple = false,
}: {
  label: string;
  items: Option[];
  value: string[];
  onValueChange: (ids: string[]) => void;
  multiple?: boolean;
}) {
  return (
    <SDKToggleGroup
      className="yg-toggle-group"
      aria-label={label}
      render={(props) => <div {...props} role={multiple ? "toolbar" : "radiogroup"} />}
      multiple={multiple}
      deselectable
      value={multiple ? value : value.slice(0, 1)}
      onValueChange={(next) => {
        if (next.some((id) => !value.includes(id) && !items.some((item) => item.id === id && !item.disabled))) return;
        const selected = new Set(next);
        onValueChange(multiple ? [...value.filter((id) => selected.has(id)), ...next.filter((id) => !value.includes(id))] : next);
      }}
      onKeyDownCapture={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const current = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-yg-toggle-id]");
        const enabled = items.filter((item) => !item.disabled);
        const index = enabled.findIndex((item) => item.id === current?.dataset.ygToggleId);
        if (index < 0) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const next = ({ ArrowRight: (index + (rtl ? -1 : 1) + enabled.length) % enabled.length,
          ArrowLeft: (index + (rtl ? 1 : -1) + enabled.length) % enabled.length,
          Home: 0, End: enabled.length - 1 } as Record<string, number | undefined>)[event.key];
        if (next === undefined) return;
        event.preventDefault();
        [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-yg-toggle-id]")]
          .find((button) => button.dataset.ygToggleId === enabled[next].id)?.focus();
      }}
    >
      {items.map((item) => <SDKToggle key={item.id} value={item.id} disabled={item.disabled}
        className="yg-toggle-item" data-yg-toggle-id={item.id}
        render={(props, state) => <button {...props} disabled={item.disabled}
          role={multiple ? undefined : "radio"} aria-checked={multiple ? undefined : state.pressed}
          aria-pressed={multiple ? state.pressed : undefined} data-state={state.pressed ? "on" : "off"} />}>
        {item.label}
      </SDKToggle>)}
    </SDKToggleGroup>
  );
}
