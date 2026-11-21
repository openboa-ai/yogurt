"use client";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup } from "@ui-sdk/react/toggle";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Button, IconButton } from "./actions.js";
import { Checkbox, Field } from "./forms.js";
import { cx, Icon, type ControlSize, type Option } from "../foundation/foundation.js";
import { playSprings, snap, spring } from "../foundation/spring-motion.js";

type Input = Omit<ComponentProps<"input">, "size" | "prefix">;
export function InputGroup({
  label,
  leading,
  trailing,
  help,
  error,
  id,
  size = "featured",
  ...input
}: Input & {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  help?: string;
  error?: string;
  size?: ControlSize | "featured";
}) {
  const sharedInput = ["text", "search", "email", "url", "tel", "password"].includes(input.type ?? "text") &&
    !input.onSelect && !Array.isArray(input.value) && !Array.isArray(input.defaultValue);
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input yg-input-group", `yg-input-size-${size}`)}>
          {leading}
          {sharedInput ? <SDKInput {...input} {...binding}
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
          <SDKInput
            {...binding}
            aria-label={label}
            data-agent-secret=""
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            name={name}
            disabled={disabled}
            value={value}
            render={<input onSelect={(e) => setCursor(e.currentTarget.selectionStart ?? 0)} />}
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
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  disabled,
  presentation = "inline",
  formatValue,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  presentation?: "inline" | "card";
  formatValue?: (value: number) => string;
}) {
  const id = useId();
  const fill = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;
  const formatted = formatValue ? formatValue(value) : value + unit;
  if (presentation === "card") {
    return (
      <div className="yg-motion-range" style={{ "--yg-range-fill": `${fill}%` } as CSSProperties}>
        <div className="yg-motion-range-heading"><label htmlFor={id}>{label}</label></div>
        <div className="yg-motion-range-area">
          <span className="yg-motion-range-tip" aria-hidden="true" style={{ insetInlineStart: `${fill}%` }}>{formatted}</span>
          <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
            aria-valuetext={formatValue || unit ? formatted : undefined}
            onChange={(event) => onValueChange(event.currentTarget.valueAsNumber)} />
        </div>
      </div>
    );
  }
  return (
    <div className="yg-range">
      <div>
        <label htmlFor={id} className="yg-label">
          {label}
        </label>
        <output htmlFor={id}>
          {formatted}
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
        style={{ "--yg-range-fill": `${fill}%` } as CSSProperties}
        aria-valuetext={formatValue || unit ? formatted : undefined}
        onChange={(e) => onValueChange(e.target.valueAsNumber)}
      />
    </div>
  );
}
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
  const root = useRef<HTMLFieldSetElement>(null);
  const [roller] = useState(() => spring(0, 260, 22));
  const stars = useMemo(() => Array.from({ length: count }, () => ({
    fill: spring(0, 300, 24), press: spring(1, 520, 13),
  })), [count]);
  const shown = Math.max(0, Math.min(count, hovered || value));
  const editable = Boolean(onValueChange);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const glyphs = Array.from(node.querySelectorAll<SVGSVGElement>(".yg-rating svg"));
    const springs = [roller, ...stars.flatMap(star => [star.fill, star.press])];
    roller.target = shown;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop: (() => void) | undefined;
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
          star.press.position = .7;
          star.press.velocity = 7;
        }
        star.fill.target = Number(on);
      };
      if (!on || reduced || index === 0) { light(); return undefined; }
      return setTimeout(() => { light(); stop?.(); stop = playSprings(springs, render); }, index * 50);
    });
    stop = playSprings(springs, render);
    return () => { timers.forEach(clearTimeout); stop?.(); };
  }, [shown, stars, roller, editable]);
  if (!onValueChange)
    return (
      <span className="yg-score" aria-label={label}>
        {value} / {count}
      </span>
    );
  return (
    <fieldset className="yg-fieldset" ref={root}>
      <legend className="yg-label">{label}</legend>
      <div className="yg-rating" onPointerLeave={() => setHovered(0)}>
        {Array.from({ length: count }, (_, i) => (
          <label key={i} data-filled={i < shown || undefined}
            onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(i + 1); }}>
            <input
              type="radio"
              name={id}
              aria-label={i + 1 + " of " + count}
              checked={value === i + 1}
              onChange={() => onValueChange(i + 1)}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z" />
            </svg>
          </label>
        ))}
      </div>
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
