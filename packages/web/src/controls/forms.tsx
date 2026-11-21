"use client";
import { words } from "../foundation/words.js";
import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea } from "@ui-sdk/react/textarea";
import { Switch as SDKSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { Checkbox as SDKCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { RadioGroup as SDKRadio, Radio as SDKRadioItem, RadioIndicator } from "@ui-sdk/react/radio";
import { Icon, type ControlSize, type Option, cx } from "../foundation/foundation.js";
import { IconButton } from "./actions.js";

export function Label(props: ComponentProps<"label">) {
  return <label {...props} className={cx("yg-label", props.className)} />;
}
export function HelpText(props: ComponentProps<"p">) {
  return <p {...props} className={cx("yg-help", props.className)} />;
}
export function FieldError(props: ComponentProps<"p">) {
  return <p {...props} className={cx("yg-error", props.className)} />;
}
interface FieldInfo {
  id?: string;
  label: string;
  help?: string;
  error?: string;
}
interface FieldAttributes {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}
export function Field({
  id,
  label,
  help,
  error,
  children,
}: FieldInfo & { children: (props: FieldAttributes) => ReactNode }) {
  const fallback = useId();
  const input = id ?? fallback;
  const description =
    [help && input + "-help", error && input + "-error"]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="yg-field">
      <Label htmlFor={input}>{label}</Label>
      {children({
        id: input,
        "aria-describedby": description,
        "aria-invalid": error ? true : undefined,
      })}
      {help && <HelpText id={input + "-help"}>{help}</HelpText>}
      {error && <FieldError id={input + "-error"}>{error}</FieldError>}
    </div>
  );
}
type InputProps = Omit<ComponentProps<"input">, "size"> & FieldInfo & { size?: ControlSize };
export function TextField({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  size = "regular",
  ...props
}: InputProps) {
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input", `yg-input-size-${size}`, className)}>
          <SDKInput {...props} {...binding}
            value={value === undefined ? undefined : String(value)}
            defaultValue={defaultValue === undefined ? undefined : String(defaultValue)} />
        </SDKInputGroup>
      )}
    </Field>
  );
}
export function SearchField({
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
  size = "regular",
}: FieldInfo & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  size?: ControlSize;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input", `yg-input-size-${size}`)}>
          <Icon name="search" />
          <SDKInput {...binding} name={name} ref={ref} type="search" value={value}
            disabled={disabled} placeholder={placeholder}
            onChange={(e) => onValueChange(e.target.value)} onKeyDown={onKeyDown} />
          {
            value && !disabled ? (
              <IconButton
                label={"Clear " + label.toLowerCase()}
                icon="close"
                size={size === "compact" ? "compact" : "regular"}
                onClick={() => {
                  onValueChange("");
                  ref.current?.focus();
                }}
              />
            ) : undefined
          }
        </SDKInputGroup>
      )}
    </Field>
  );
}
export function Textarea({
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
}: FieldInfo & ComponentProps<"textarea">) {
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input yg-textarea", className)}>
          <SDKTextarea {...props} {...binding} rows={rows}
            value={value === undefined ? undefined : String(value)}
            defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
            render={onSubmit ? <textarea onSubmit={onSubmit} /> : undefined} />
        </SDKInputGroup>
      )}
    </Field>
  );
}
export function Select({
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
}: FieldInfo &
  ComponentProps<"select"> & { options: Option[]; placeholder?: string; controlSize?: ControlSize }) {
  const dropdown = !props.multiple && (props.size ?? 1) <= 1;
  function positionPicker(select: HTMLSelectElement) {
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

  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <div className={cx("yg-select", `yg-input-size-${controlSize}`)} data-dropdown={dropdown || undefined}>
          <select
            {...props}
            {...binding}
            onPointerDown={event => {
              onPointerDown?.(event);
              if (!event.defaultPrevented) positionPicker(event.currentTarget);
            }}
            onKeyDown={event => {
              onKeyDown?.(event);
              if (!event.defaultPrevented && !event.currentTarget.matches(":open")) {
                positionPicker(event.currentTarget);
              }
            }}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
          {dropdown && <Icon name="down" />}
        </div>
      )}
    </Field>
  );
}
interface Checkable {
  id?: string;
  label: string;
  name?: string;
  value?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}
export function Switch({
  label,
  help,
  id,
  className,
  disabled,
  onCheckedChange,
  ...props
}: Checkable & {
  help?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelRef = useRef<HTMLSpanElement>(null);
  const change = (checked: boolean) => {
    const thumb = labelRef.current?.closest(".yg-switch")?.querySelector<HTMLElement>('[role="switch"] > span');
    if (thumb && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const scale = getComputedStyle(thumb).scale;
      thumb.getAnimations().find(animation => animation.id === "yg-switch-stretch")?.cancel();
      const stretch = thumb.animate([
        {scale, offset: 0},
        {scale: "1.385 1", offset: 1 / 9},
        {scale: "1.385 1", offset: 1 / 3},
        {scale: "1.363 1", offset: 4 / 9},
        {scale: "1.187 1", offset: 5 / 9},
        {scale: "1.053 1", offset: 2 / 3},
        {scale: "1", offset: 7 / 9},
        {scale: "1", offset: 1},
      ], {duration: 300});
      stretch.id = "yg-switch-stretch";
    }
    onCheckedChange?.(checked);
  };
  return (
    <div className={cx("yg-choice yg-switch", className)} data-disabled={disabled || undefined}>
      <SDKSwitch {...props} id={inputId} disabled={disabled} onCheckedChange={change}>
        <SwitchThumb />
      </SDKSwitch>
      <label htmlFor={inputId}>
        <span ref={labelRef}>
          {label}
          {help && <span className="yg-help">{help}</span>}
        </span>
      </label>
    </div>
  );
}
export function Checkbox({
  label,
  id,
  className,
  disabled,
  ...props
}: Checkable & {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (value: boolean | "indeterminate") => void;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cx("yg-choice yg-checkbox", className)} data-disabled={disabled || undefined}>
      <SDKCheckbox {...props} id={inputId} disabled={disabled}>
        <CheckboxIndicator keepMounted>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path className="yg-checkbox-check" d="M6 12.5l4 4L18 8" />
            <path className="yg-checkbox-mixed" d="M7 12h10" />
          </svg>
        </CheckboxIndicator>
      </SDKCheckbox>
      <label htmlFor={inputId}><span>{label}</span></label>
    </div>
  );
}
export interface Choices {
  label: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
}
export function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  disabled,
  name,
}: Choices) {
  return (
    <fieldset className="yg-fieldset">
      <legend className="yg-label">{label}</legend>
      <SDKRadio
        className="yg-radio"
        aria-label={label}
        value={value}
        name={name}
        disabled={disabled}
        onValueChange={(next) => { if (next !== null) onValueChange(next); }}
      >
        {options.map((o) => (
          <div key={o.id}><label data-disabled={disabled || o.disabled ? "" : undefined}>
            <div><SDKRadioItem value={o.id} disabled={o.disabled}><RadioIndicator /></SDKRadioItem></div>
            {o.label}
          </label></div>
        ))}
      </SDKRadio>
    </fieldset>
  );
}
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  disabled,
  help,
  error,
}: Choices & Pick<FieldInfo, "help" | "error">) {
  const list = useId();
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const open = query !== null && !disabled;
  const selected = options.find((o) => o.id === value);
  const matches = options.filter((o) =>
    o.label.toLowerCase().includes((query ?? "").toLowerCase()),
  );
  const enabled = matches.filter((o) => !o.disabled);
  const current = enabled.find((o) => o.id === active);
  function dismiss() {
    setQuery(null);
    setActive(null);
  }
  function choose(o: Option) {
    if (!o.disabled) {
      dismiss();
      onValueChange(o.id);
    }
  }
  function step(back: boolean) {
    const idx = enabled.findIndex((o) => o.id === active);
    const next =
      idx < 0
        ? back
          ? enabled.length - 1
          : 0
        : (idx + (back ? -1 : 1) + enabled.length) % enabled.length;
    setActive(enabled[next]?.id ?? null);
  }
  const optionId = (id: string) => list + "-" + encodeURIComponent(id);
  return (
    <Field {...{ label, help, error }}>
      {(binding) => (
        <div className="yg-combo">
          <input
            {...binding}
            disabled={disabled}
            className="yg-standalone"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={list}
            aria-activedescendant={
              open && current ? optionId(current.id) : undefined
            }
            value={open ? (query ?? "") : (selected?.label ?? "")}
            onFocus={(e) => e.target.select()}
            onClick={() => {
              if (!open) setQuery("");
            }}
            onBlur={dismiss}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(null);
            }}
            onKeyDown={(e) => {
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
            }}
          />
          <div
            id={list}
            role="listbox"
            aria-label={label}
            className="yg-options"
            hidden={!open}
          >
            {matches.map((o) => (
              <div
                key={o.id}
                id={optionId(o.id)}
                role="option"
                aria-selected={o.id === value}
                aria-disabled={o.disabled}
                data-active={o.id === current?.id || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                {o.label}
              </div>
            ))}
            {matches.length === 0 && (
              <div role="presentation" className="yg-help">
                {words["state.no-matches"]}
              </div>
            )}
          </div>
        </div>
      )}
    </Field>
  );
}
