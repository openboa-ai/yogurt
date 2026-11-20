"use client";
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
import { ToggleGroup as RadixGroup } from "radix-ui";
import { Button, IconButton } from "./actions.js";
import { Checkbox, Field } from "./forms.js";
import { cx, Icon, type Option } from "../foundation/foundation.js";
import { playSprings, snap, spring } from "../foundation/spring-motion.js";

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
function OtpDigit({ value }: { value: string }) {
  const digit = useRef<HTMLSpanElement>(null);
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
  return <span ref={digit} className="yg-otp-digit">{value}</span>;
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
  const [cursor, setCursor] = useState(0);
  const confirmed = verified && value.length >= count;
  const surface = useRef<HTMLDivElement>(null);
  const [motion] = useState(() => ({merge: spring(0, 260, 24), confirm: spring(0, 220, 28)}));
  useLayoutEffect(() => {
    const node = surface.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const axes = [motion.merge, motion.confirm];
    let stop: (() => void) | undefined;
    let mergeTimer: ReturnType<typeof setTimeout> | undefined;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;
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
      axes.forEach(axis => snap(axis, Number(confirmed)));
      paint();
    }
    if (media.matches) {
      settleImmediately();
    } else if (confirmed) {
      mergeTimer = setTimeout(() => {motion.merge.target = 1; play();}, 250);
      revealTimer = setTimeout(() => {motion.confirm.target = 1; play();}, 550);
    } else {
      axes.forEach(axis => {axis.target = 0;});
      if (axes.some(axis => axis.position !== 0)) play();
    }
    media.addEventListener("change", settleImmediately);
    return () => {
      stop?.();
      clearTimeout(mergeTimer);
      clearTimeout(revealTimer);
      media.removeEventListener("change", settleImmediately);
    };
  }, [confirmed, motion]);
  return (
    <Field {...{ label, help, error }}>
      {(binding) => (
        <div
          ref={surface}
          className="yg-otp"
          data-complete={value.length >= count || undefined}
          data-verified={confirmed || undefined}
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
            onChange={(event) => {
              const next = event.currentTarget.value.replace(/\D/g, "").slice(0, count);
              setCursor(Math.min(event.currentTarget.selectionStart ?? next.length, next.length));
              onValueChange(next);
            }}
          />
          <span className="yg-otp-slots" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span
                key={i}
                data-cursor={i === Math.min(cursor, count - 1) || undefined}
                data-filled={!!value[i] || undefined}
              >
                {value[i] && <span className="yg-otp-ink">
                  <OtpDigit key={value[i]} value={value[i]} />
                </span>}
              </span>
            ))}
          </span>
          {confirmed && <span role="status" className="yg-otp-confirmation"><Icon name="check" /> Verified</span>}
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
