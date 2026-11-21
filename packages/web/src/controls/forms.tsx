"use client";
import { words } from "../foundation/words.js";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Input as SDKInput, InputGroup as SDKInputGroup } from "@ui-sdk/react/input";
import { Textarea as SDKTextarea, createInputController } from "@ui-sdk/react/textarea";
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
function describedBy(...values: (string | undefined | false)[]) {
  const ids = values.flatMap(value => typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean) : []);
  return [...new Set(ids)].join(" ") || undefined;
}
export function Field({
  id,
  label,
  help,
  error,
  labelEnd,
  children,
}: FieldInfo & { labelEnd?: ReactNode; children: (props: FieldAttributes) => ReactNode }) {
  const fallback = useId();
  const input = id ?? fallback;
  const description =
    [help && input + "-help", error && input + "-error"]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="yg-field">
      {labelEnd ? <div className="yg-ghost-head"><Label htmlFor={input}>{label}</Label>{labelEnd}</div> : <Label htmlFor={input}>{label}</Label>}
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
type InputProps = Omit<ComponentProps<"input">, "size"> & FieldInfo & { size?: ControlSize; motion?: "spring" };

/** Compatibility entry for text inputs using the default SDK interaction. */
export function SpringTextInput({ value, defaultValue, onSelect, ...props }: Omit<ComponentProps<"input">, "size">) {
  return <SDKInput {...props}
    value={value == null ? undefined : String(value)}
    defaultValue={defaultValue == null ? undefined : String(defaultValue)}
    render={onSelect ? <input onSelect={onSelect} /> : undefined}
    onValueChange={(next, details) => {
      if (details.reason === "imperative" && props.maxLength !== undefined && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
    }} />;
}

export function TextField({
  id,
  label,
  help,
  error,
  className,
  value,
  defaultValue,
  motion,
  size = "regular",
  ...props
}: InputProps) {
  return (
    <Field {...{ id, label, help, error }}>
      {(binding) => (
        <SDKInputGroup className={cx("yg-input", `yg-input-size-${size}`, className)}>
          {motion === "spring" && (props.type ?? "text") === "text" && !Array.isArray(value) && !Array.isArray(defaultValue)
            ? <SpringTextInput {...props} {...binding} aria-describedby={describedBy(props["aria-describedby"], binding["aria-describedby"])}
              aria-invalid={binding["aria-invalid"] ?? props["aria-invalid"]} value={value} defaultValue={defaultValue} />
            : <SDKInput {...props} {...binding}
            aria-describedby={describedBy(props["aria-describedby"], binding["aria-describedby"])}
            aria-invalid={binding["aria-invalid"] ?? props["aria-invalid"]}
            value={value == null ? undefined : String(value)}
            defaultValue={defaultValue == null ? undefined : String(defaultValue)}
            onValueChange={(next, details) => {
              if (details.reason === "imperative" && props.maxLength !== undefined && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
            }} />}
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
function SuggestionLetters({ text, interval, cap }: { text: string; interval: number; cap: number }) {
  return Array.from(text.matchAll(/\s+|\S+/gu), match => {
    const offset = match.index;
    return /^\s/u.test(match[0]) ? <span key={offset}>{match[0]}</span>
      : <span className="yg-ghost-word" key={offset}>{Array.from(match[0], (letter, i) =>
        <span key={i} style={{ animationDelay: `${Math.min((offset + i) * interval, cap)}ms` }}>{letter}</span>)}</span>;
  });
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
  onSelect,
  suggestion,
  rows = 3,
  ...props
}: FieldInfo & ComponentProps<"textarea"> & { suggestion?: string }) {
  const [localValue, setLocalValue] = useState(() => String(defaultValue ?? ""));
  const [completionController] = useState(createInputController);
  const [atEnd, setAtEnd] = useState(true);
  const [accepted, setAccepted] = useState<{ prefix: string; suffix: string } | null>(null);
  const accepting = useRef(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const current = value == null ? localValue : String(value);
  const suffix = current && suggestion?.startsWith(current) ? suggestion.slice(current.length) : "";
  const available = !!suffix && atEnd && !props.disabled && !props.readOnly &&
    (props.maxLength == null || props.maxLength < 0 || (suggestion?.length ?? 0) <= props.maxLength);
  const rolling = !!accepted && accepted.prefix + accepted.suffix === current;
  useEffect(() => {
    if (!accepted) return;
    const timer = setTimeout(() => setAccepted(null), Math.min(400, Array.from(accepted.suffix).length * 16) + 420);
    return () => clearTimeout(timer);
  }, [accepted]);
  useLayoutEffect(() => {
    const input = textarea.current;
    if (suggestion === undefined || !input) return;
    if (value == null) setLocalValue(input.value);
    setAtEnd(input.ownerDocument.activeElement !== input || (input.selectionStart === input.value.length && input.selectionEnd === input.value.length));
    setAccepted(null);
  }, [suggestion]);
  useEffect(() => {
    const input = textarea.current;
    const form = input?.form;
    if (suggestion === undefined || !input || !form) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = (event: Event) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (event.defaultPrevented || textarea.current !== input) return;
        if (value == null) setLocalValue(input.value);
        setAtEnd(input.ownerDocument.activeElement !== input || (input.selectionStart === input.value.length && input.selectionEnd === input.value.length));
        setAccepted(null);
      }, 0);
    };
    form.addEventListener("reset", reset);
    return () => { form.removeEventListener("reset", reset); if (timer) clearTimeout(timer); };
  }, [suggestion, value, props.form]);
  return (
    <Field {...{ id, label, help, error }} labelEnd={suggestion !== undefined && available ? <span className="yg-ghost-key" aria-hidden="true">Tab ↹</span> : undefined}>
      {(binding) => (
        <>
        <SDKInputGroup className={cx("yg-input yg-textarea", suggestion !== undefined && "yg-ghost-input", className)}>
          {suggestion !== undefined && <div className="yg-ghost-mirror" aria-hidden="true" data-accepted={rolling || undefined}>
            <span>{rolling ? accepted?.prefix : current}</span>
            {available && <span className="yg-ghost-suffix"><SuggestionLetters text={suffix} interval={8} cap={200} /></span>}
            {rolling && accepted && <span className="yg-ghost-accepted"><SuggestionLetters text={accepted.suffix} interval={16} cap={400} /></span>}
          </div>}
          <SDKTextarea {...props} {...binding} rows={rows} controller={suggestion !== undefined ? completionController : undefined}
            aria-describedby={describedBy(props["aria-describedby"], binding["aria-describedby"], available && `${binding.id}-suggestion`)}
            aria-invalid={binding["aria-invalid"] ?? props["aria-invalid"]} data-accepted={rolling || undefined}
            value={value == null ? undefined : String(value)}
            defaultValue={defaultValue == null ? undefined : String(defaultValue)}
            onChange={suggestion === undefined ? props.onChange : event => {
              if (!accepting.current) setAccepted(null);
              setLocalValue(event.currentTarget.value);
              setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
              props.onChange?.(event);
            }}
            onKeyUp={suggestion === undefined ? props.onKeyUp : event => {
              setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
              props.onKeyUp?.(event);
            }}
            onMouseUp={suggestion === undefined ? props.onMouseUp : event => {
              setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
              props.onMouseUp?.(event);
            }}
            onKeyDown={suggestion === undefined ? props.onKeyDown : event => {
              props.onKeyDown?.(event);
              const input = event.currentTarget;
              const keySuffix = input.value && suggestion?.startsWith(input.value) ? suggestion.slice(input.value.length) : "";
              if (!keySuffix || !suggestion || props.disabled || props.readOnly || (props.maxLength != null && props.maxLength >= 0 && suggestion.length > props.maxLength) ||
                  event.defaultPrevented || event.nativeEvent.isComposing || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey ||
                  (event.key !== "Tab" && event.key !== "ArrowRight") || input.selectionStart !== input.value.length || input.selectionEnd !== input.value.length || input.value !== current) return;
              accepting.current = true;
              try {
                const prefix = input.value;
                if (completionController.setValue(suggestion)) {
                  event.preventDefault();
                  setAccepted({ prefix, suffix: keySuffix });
                  if (value == null) setLocalValue(input.value);
                }
              } finally { accepting.current = false; }
            }}
            onValueChange={(next, details) => {
              if (details.reason === "imperative" && props.maxLength !== undefined && props.maxLength >= 0 && next.length > props.maxLength) details.cancel();
            }}
            render={<textarea ref={textarea} onSubmit={onSubmit}
              onSelect={suggestion === undefined ? onSelect : event => {
                setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length);
                onSelect?.(event);
              }} />} />
        </SDKInputGroup>
        {suggestion !== undefined && <span className="yg-ghost-hint" id={`${binding.id}-suggestion`} aria-hidden={!available} data-visible={available}>Press Tab or right arrow to accept</span>}
        </>
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
            aria-describedby={describedBy(props["aria-describedby"], binding["aria-describedby"])}
            aria-invalid={binding["aria-invalid"] ?? props["aria-invalid"]}
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
  return (
    <div className={cx("yg-choice yg-switch", className)} data-disabled={disabled || undefined}>
      <SDKSwitch {...props} id={inputId} disabled={disabled} onCheckedChange={onCheckedChange}>
        <SwitchThumb />
      </SDKSwitch>
      <label htmlFor={inputId}>
        <span>
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
            <path className="yg-checkbox-check" d="M6.24 12.96 10.32 16.8 18.24 7.68" />
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
  name,
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
          {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
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
