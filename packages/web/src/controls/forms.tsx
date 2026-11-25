"use client";
import { SelectPicker, type SelectPickerProps } from "./select-picker.js";
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
import {
  Select as SDKSelect,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import {
  Combobox as SDKCombobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList,
  createComboboxController,
} from "@ui-sdk/react/combobox";
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
export type FieldLayout = "vertical" | "horizontal" | "responsive";

interface FieldInfo {
  id?: string;
  label: string;
  help?: string;
  error?: string;
  layout?: FieldLayout;
  hiddenLabel?: boolean;
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
  layout = "vertical",
  hiddenLabel = false,
  labelEnd,
  className,
  children,
}: FieldInfo & {
  labelEnd?: ReactNode;
  className?: string;
  children: (props: FieldAttributes) => ReactNode;
}) {
  const fallback = useId();
  const input = id ?? fallback;
  const description =
    [help && input + "-help", error && input + "-error"]
      .filter(Boolean)
      .join(" ") || undefined;
  const labelNode = labelEnd ? (
    <div className="yg-ghost-head">
      <Label htmlFor={input} className={hiddenLabel ? "yg-sr-only" : undefined}>
        {label}
      </Label>
      {labelEnd}
    </div>
  ) : (
    <Label htmlFor={input} className={hiddenLabel ? "yg-sr-only" : undefined}>
      {label}
    </Label>
  );
  const controlNode = children({
    id: input,
    "aria-describedby": description,
    "aria-invalid": error ? true : undefined,
  });
  const feedbackNode = (
    <>
      {help && <HelpText id={input + "-help"}>{help}</HelpText>}
      {error && <FieldError id={input + "-error"}>{error}</FieldError>}
    </>
  );
  if (layout === "responsive") {
    return (
      <div className={cx("yg-field-responsive", className)}>
        <div className="yg-field" data-layout="responsive">
          <div className="yg-field-label-col">{labelNode}</div>
          <div className="yg-field-control-col">
            {controlNode}
            {feedbackNode}
          </div>
        </div>
      </div>
    );
  }
  if (layout === "horizontal") {
    return (
      <div className={cx("yg-field", className)} data-layout="horizontal">
        <div className="yg-field-label-col">{labelNode}</div>
        <div className="yg-field-control-col">
          {controlNode}
          {feedbackNode}
        </div>
      </div>
    );
  }
  return (
    <div className={cx("yg-field", className)} data-layout="vertical">
      {labelNode}
      {controlNode}
      {feedbackNode}
    </div>
  );
}

export function FieldGroup({
  legend,
  description,
  className,
  children,
  ...props
}: ComponentProps<"fieldset"> & {
  legend?: string;
  description?: string;
}) {
  return (
    <fieldset {...props} className={cx("yg-fieldset yg-field-group", className)}>
      {legend && <legend className="yg-field-group-legend">{legend}</legend>}
      {description && <p className="yg-help yg-field-group-description">{description}</p>}
      <div className="yg-field-group-fields">{children}</div>
    </fieldset>
  );
}

export function FormRow({
  align = "end",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  align?: "start" | "center" | "end" | "stretch";
}) {
  return (
    <div
      {...props}
      className={cx("yg-form-row", className)}
      data-align={align}
    >
      {children}
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
  layout,
  hiddenLabel,
  className,
  value,
  defaultValue,
  motion,
  size = "regular",
  ...props
}: InputProps) {
  return (
    <Field {...{ id, label, help, error, layout, hiddenLabel }}>
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
  layout,
  hiddenLabel,
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
    <Field {...{ id, label, help, error, layout, hiddenLabel }}>
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
  layout,
  hiddenLabel,
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
    <Field {...{ id, label, help, error, layout, hiddenLabel }} labelEnd={suggestion !== undefined && available ? <span className="yg-ghost-key" aria-hidden="true">Tab ↹</span> : undefined}>
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
type StandardSelectProps = FieldInfo &
  Omit<ComponentProps<"select">, "size" | "value" | "defaultValue" | "onChange"> & {
    options: Option[];
    placeholder?: string;
    size?: ControlSize;
    controlSize?: ControlSize;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  };

export function Select(
  props:
    | (StandardSelectProps & { presentation?: "custom" })
    | (SelectPickerProps & { presentation: "animated" }),
) {
  if (props.presentation === "animated") return <SelectPicker {...props} />;
  const { presentation: _presentation, ...selectProps } = props;
  return <UnifiedSelect {...selectProps} />;
}

function UnifiedSelect({
  id,
  label,
  help,
  error,
  layout,
  hiddenLabel,
  options,
  placeholder,
  size,
  controlSize,
  value,
  defaultValue,
  onValueChange,
  onChange,
  name,
  disabled,
  required,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  autoComplete: _autoComplete,
  form: _form,
  multiple: _multiple,
  ...restProps
}: StandardSelectProps) {
  const triggerRest = restProps as Record<string, unknown>;
  const resolvedSize = size ?? controlSize ?? "regular";
  const hasEmptyOption = options.some((option) => option.id === "");
  const sdkItems = options.map((option) => ({
    value: option.id,
    label: option.label,
    disabled: option.disabled,
  }));
  const controlled = value !== undefined;
  const resolvedValue = controlled
    ? value === "" && !hasEmptyOption
      ? null
      : String(value)
    : undefined;
  const resolvedDefault = controlled
    ? undefined
    : defaultValue !== undefined
      ? defaultValue === "" && !hasEmptyOption
        ? null
        : String(defaultValue)
      : placeholder
        ? null
        : (options.find((option) => !option.disabled)?.id ?? null);

  return (
    <Field {...{ id, label, help, error, layout, hiddenLabel }}>
      {(binding) => (
        <SDKSelect
          items={sdkItems}
          value={resolvedValue}
          defaultValue={resolvedDefault}
          name={name}
          disabled={disabled}
          required={required}
          onValueChange={(next) => {
            const normalized = next ?? "";
            onValueChange?.(normalized);
            if (onChange) {
              const target = { value: normalized, name: name ?? "" };
              onChange({
                target,
                currentTarget: target,
              } as unknown as React.ChangeEvent<HTMLSelectElement>);
            }
          }}
        >
          <SelectTrigger
            {...triggerRest}
            id={binding.id}
            aria-describedby={describedBy(ariaDescribedBy, binding["aria-describedby"])}
            aria-invalid={binding["aria-invalid"] ?? ariaInvalid}
            className={cx(
              "yg-select",
              "yg-select-trigger",
              `yg-input-size-${resolvedSize}`,
              className,
            )}
          >
            <SelectValue placeholder={placeholder} className="yg-select-value" />
            <Icon name="down" />
          </SelectTrigger>
          <SelectContent
            className="yg-popup-menu yg-select-popup"
            sideOffset={6}
            align="start"
            collisionPadding={8}
          >
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                label={option.label}
                disabled={option.disabled}
                className="yg-select-option"
              >
                <span className="yg-select-option-label">{option.label}</span>
                <SelectItemIndicator className="yg-select-option-check">
                  <Icon name="check" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </SDKSelect>
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
  presentation = "row",
  onCheckedChange,
  ...props
}: Checkable & {
  help?: string;
  presentation?: "row" | "inset";
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = inputId + "-label";
  const helpId = help ? inputId + "-help" : undefined;
  return (
    <div
      className={cx("yg-choice yg-switch", className)}
      data-presentation={presentation}
      data-disabled={disabled || undefined}
    >
      <SDKSwitch
        {...props}
        id={inputId}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={helpId}
        onCheckedChange={onCheckedChange}
      >
        <SwitchThumb />
      </SDKSwitch>
      <label htmlFor={inputId}>
        <span>
          <span id={labelId}>{label}</span>
          {help && <span id={helpId} className="yg-help">{help}</span>}
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
type SwatchOption = Option & { color: string; accessibleLabel: string; column?: number };
type RadioGroupProps = Omit<Choices, "options"> & (
  | { presentation?: "standard"; options: Option[]; columns?: never }
  | { presentation: "swatches"; options: SwatchOption[]; columns?: number }
);

export function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  disabled,
  name,
  presentation = "standard",
  columns,
}: RadioGroupProps) {
  return (
    <fieldset className="yg-fieldset">
      <legend className="yg-label">{label}</legend>
      <SDKRadio
        className={presentation === "swatches" ? "yg-swatch-list" : "yg-radio"}
        data-aligned={columns !== undefined || undefined}
        style={columns === undefined ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        aria-label={label}
        value={value}
        name={name}
        disabled={disabled}
        onValueChange={(next) => { if (next !== null) onValueChange(next); }}
      >
        {options.map((option) => presentation === "swatches" && "color" in option ? (
          <div className="yg-swatch-choice" key={option.id} data-step={option.label} style={{ gridColumn: option.column }}>
            <SDKRadioItem value={option.id} disabled={option.disabled}
              aria-label={option.accessibleLabel} style={{ backgroundColor: option.color }} />
            {columns === undefined && <span className="yg-meta" aria-hidden="true">{option.label}</span>}
          </div>
        ) : (
          <div key={option.id}><label data-disabled={disabled || option.disabled ? "" : undefined}>
            <div><SDKRadioItem value={option.id} disabled={option.disabled}><RadioIndicator /></SDKRadioItem></div>
            {option.label}
          </label></div>
        ))}
      </SDKRadio>
    </fieldset>
  );
}
export function Combobox({
  id,
  label,
  options,
  value,
  onValueChange,
  disabled,
  name,
  help,
  error,
  layout,
  hiddenLabel,
  placeholder,
  size = "regular",
  className,
}: Choices & Pick<FieldInfo, "id" | "help" | "error" | "layout" | "hiddenLabel"> & {
  placeholder?: string;
  size?: ControlSize;
  className?: string;
}) {
  const [controller] = useState(() => createComboboxController<string>());
  return (
    <Field {...{ id, label, help, error, layout, hiddenLabel }}>
      {binding => (
        <SDKCombobox controller={controller} value={value || null} name={name} disabled={disabled}
          itemToLabel={id => options.find(option => option.id === id)?.label ?? ""}
          onValueChange={(next, details) => {
            if (next === null) {
              details.cancel();
              return;
            }
            onValueChange(next);
          }}>
          <span className="yg-combobox-wrap">
            <ComboboxInput {...binding} className={cx("yg-standalone yg-combobox-input", `yg-input-size-${size}`, className)}
              placeholder={placeholder} autoComplete="off"
              onFocus={event => event.currentTarget.select()}
              onClick={event => {
                if (event.currentTarget.getAttribute("aria-expanded") === "true") return;
                controller.open();
                controller.setQuery("");
              }} />
            <span className="yg-combobox-chevron" aria-hidden="true"><Icon name="down" /></span>
          </span>
          <ComboboxContent className="yg-popup-menu yg-combobox-popup" sideOffset={6} align="start" collisionPadding={8}>
            <ComboboxList aria-label={label}>
              {options.map(option => (
                <ComboboxItem key={option.id} value={option.id} label={option.label} disabled={option.disabled}
                  className="yg-select-option">
                  <span className="yg-select-option-label">{option.label}</span>
                  <ComboboxItemIndicator className="yg-select-option-check">
                    <Icon name="check" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty className="yg-help">{words["state.no-matches"]}</ComboboxEmpty>
          </ComboboxContent>
        </SDKCombobox>
      )}
    </Field>
  );
}
