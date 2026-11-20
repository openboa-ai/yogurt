"use client";
import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ToggleGroup as RadixGroup } from "radix-ui";
import { Button, IconButton } from "./actions.js";
import { Checkbox, Field } from "./forms.js";
import { cx, type Option } from "../foundation/foundation.js";

type Input = Omit<ComponentProps<"input">, "size" | "prefix">;
export function InputGroup({
  label,
  leading,
  trailing,
  help,
  error,
  id,
  ...input
}: Input & {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  help?: string;
  error?: string;
}) {
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <span className="yg-input yg-input-group">
          {leading}
          <input {...input} {...binding} />
          {trailing}
        </span>
      )}
    </Field>
  );
}
export function InputOTP({
  label,
  length = 6,
  value,
  onValueChange,
  name,
  disabled,
  help,
  error,
}: {
  label: string;
  length?: number;
  value: string;
  onValueChange: (v: string) => void;
  name?: string;
  disabled?: boolean;
  help?: string;
  error?: string;
}) {
  const count = Math.max(1, Math.min(12, Math.trunc(length) || 6));
  const [cursor, setCursor] = useState(0);
  return (
    <Field {...{ label, help, error }}>
      {(binding) => (
        <div
          className="yg-otp"
          data-complete={value.length >= count || undefined}
          data-disabled={disabled || undefined}
          style={{ "--yg-digits": count } as CSSProperties}
        >
          <input
            {...binding}
            aria-label={label}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            name={name}
            disabled={disabled}
            value={value}
            onSelect={(e) => setCursor(e.currentTarget.selectionStart ?? 0)}
            onChange={(e) =>
              onValueChange(e.target.value.replace(/\D/g, "").slice(0, count))
            }
          />
          <span className="yg-otp-slots" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span
                key={i}
                data-cursor={i === Math.min(cursor, count - 1) || undefined}
                data-filled={!!value[i] || undefined}
              >
                {value[i] && <span key={value[i]} className="yg-otp-digit">{value[i]}</span>}
              </span>
            ))}
          </span>
        </div>
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
            <input
              className="yg-standalone"
              aria-label={p.label}
              value={p.value}
              maxLength={p.maxLength}
              inputMode={p.inputMode}
              onChange={(e) => onValueChange(p.id, e.target.value)}
            />
          </span>
        ))}
      </div>
    </fieldset>
  );
}
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  disabled,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="yg-range">
      <div>
        <label htmlFor={id} className="yg-label">
          {label}
        </label>
        <output htmlFor={id}>
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={unit ? value + unit : undefined}
        onChange={(e) => onValueChange(e.target.valueAsNumber)}
      />
    </div>
  );
}
export function NumericSpinner({
  label,
  value,
  min = 0,
  max = 99,
  step = 1,
  onValueChange,
  disabled,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}) {
  const increment = Math.max(1, Math.floor(step) || 1);
  return (
    <div className="yg-quantity" role="group" aria-label={label}>
      <span className="yg-label">{label}</span>
      <div>
        <Button
          emphasis="quiet"
          aria-label={"Decrease " + label}
          disabled={disabled || value <= min}
          onClick={() => onValueChange(Math.max(min, value - increment))}
        >
          −
        </Button>
        <output aria-label={label} aria-live="polite">
          {value}
        </output>
        <IconButton
          icon="plus"
          label={"Increase " + label}
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
}: {
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
  max?: number;
}) {
  const id = useId(),
    count = Math.max(1, Math.min(10, Math.floor(max) || 5));
  if (!onValueChange)
    return (
      <span className="yg-score" aria-label={label}>
        {value} / {count}
      </span>
    );
  return (
    <fieldset className="yg-fieldset">
      <legend className="yg-label">{label}</legend>
      <div className="yg-rating">
        {Array.from({ length: count }, (_, i) => (
          <label key={i} data-filled={i < value || undefined}>
            <input
              type="radio"
              name={id}
              aria-label={i + 1 + " of " + count}
              checked={value === i + 1}
              onChange={() => onValueChange(i + 1)}
            />
            <span aria-hidden="true">★</span>
          </label>
        ))}
      </div>
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
    <Button
      aria-pressed={pressed}
      emphasis={pressed ? "soft" : "quiet"}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
    >
      {children}
    </Button>
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
  const children = items.map((i) => (
    <RadixGroup.Item
      className="yg-toggle-item"
      key={i.id}
      value={i.id}
      disabled={i.disabled}
    >
      {i.label}
    </RadixGroup.Item>
  ));
  return multiple ? (
    <RadixGroup.Root
      className="yg-toggle-group"
      aria-label={label}
      type="multiple"
      value={value}
      onValueChange={onValueChange}
    >
      {children}
    </RadixGroup.Root>
  ) : (
    <RadixGroup.Root
      className="yg-toggle-group"
      aria-label={label}
      type="single"
      value={value[0] ?? ""}
      onValueChange={(v) => onValueChange(v ? [v] : [])}
    >
      {children}
    </RadixGroup.Root>
  );
}
