"use client";
import { OTPInput as SDKOTP, OTPInputGroup, OTPInputSlot, createOTPInputController } from "@ui-sdk/react/otp-input";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup } from "@ui-sdk/react/toggle";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Field, SpringTextInput } from "./forms.js";
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
export { Slider, RangeSlider } from "./slider.js";
export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  children,
  disabled,
  size = "regular",
  className,
}: {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  size?: ControlSize;
  className?: string;
}) {
  const [internal, setInternal] = useState(Boolean(defaultPressed));
  const active = pressed ?? internal;
  return (
    <SDKToggle
      pressed={active}
      onPressedChange={(next) => {
        if (pressed === undefined) setInternal(next);
        onPressedChange?.(next);
      }}
      className={cx("yg-button yg-toggle", className)}
      data-control-size={size}
      data-shape="rounded"
      data-pressed={active || undefined}
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
  size = "regular",
  className,
}: {
  label: string;
  items: Option[];
  value: string[];
  onValueChange: (ids: string[]) => void;
  multiple?: boolean;
  size?: ControlSize;
  className?: string;
}) {
  return (
    <SDKToggleGroup
      className={cx("yg-toggle-group", className)}
      data-control-size={size}
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
