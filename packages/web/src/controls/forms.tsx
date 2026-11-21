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
import { playSprings, snap, spring } from "../foundation/spring-motion.js";

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

type SpringGlyph = { id: number; text: string; delay: number };
type RemovedSpringGlyph = SpringGlyph & { left: number };

/** Optional visual response over a real native text input. */
export function SpringTextInput({ value, defaultValue, onChange, onSelect, onScroll,
  onFocus, onBlur, onCompositionStart, onCompositionEnd, ...props }: Omit<ComponentProps<"input">, "size">) {
  const initial = String(value ?? defaultValue ?? "");
  const nextId = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const layer = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const [glyphs, setGlyphs] = useState<SpringGlyph[]>(() => initial.length <= 256 && /^[\x20-\x7e]*$/.test(initial)
    ? Array.from(initial, text => ({ id: nextId.current++, text, delay: 0 })) : []);
  const glyphRef = useRef(glyphs);
  const [removed, setRemoved] = useState<RemovedSpringGlyph[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0, scroll: 0 });
  const [focused, setFocused] = useState(false);
  const [composing, setComposing] = useState(false);
  const [caretMotion] = useState(() => spring(0, 700, 32));
  const [text, setText] = useState(initial);
  const textRef = useRef(initial);
  // Keep complex scripts and long documents on the native renderer, which retains
  // browser grapheme shaping and avoids an unbounded decorative DOM.
  const compatible = /^[\x20-\x7e]*$/.test(text) && text.length <= 256;
  const showMirror = focused && !composing && !props.disabled && !props.readOnly && compatible && selection.start === selection.end;

  function follow(element: HTMLInputElement) {
    setSelection({ start: element.selectionStart ?? 0, end: element.selectionEnd ?? 0, scroll: element.scrollLeft });
  }
  function sync(next: string, animate: boolean) {
    const previous = glyphRef.current;
    if (textRef.current === next) return;
    textRef.current = next;
    setText(next);
    if (next.length > 256 || !/^[\x20-\x7e]*$/.test(next)) {
      glyphRef.current = [];
      setGlyphs([]);
      setRemoved([]);
      return;
    }
    const letters = Array.from(next);
    let prefix = 0, suffix = 0;
    while (prefix < letters.length && prefix < previous.length && letters[prefix] === previous[prefix].text) prefix++;
    while (suffix < letters.length - prefix && suffix < previous.length - prefix &&
      letters[letters.length - 1 - suffix] === previous[previous.length - 1 - suffix].text) suffix++;
    if (animate && typeof matchMedia === "function" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const nodes = layer.current?.querySelectorAll<HTMLElement>("[data-glyph]");
      const deleted = previous.slice(prefix, previous.length - suffix).map((glyph, index) => ({ ...glyph, left: nodes?.[prefix + index]?.offsetLeft ?? 0 }));
      if (deleted.length) setRemoved(items => [...items, ...deleted].slice(-256));
    }
    const added = letters.slice(prefix, letters.length - suffix).map((letter, index) => ({ id: nextId.current++, text: letter, delay: animate ? Math.min(index, 30) * 18 : 0 }));
    const nextGlyphs = [...previous.slice(0, prefix), ...added, ...previous.slice(previous.length - suffix)];
    glyphRef.current = nextGlyphs;
    setGlyphs(nextGlyphs);
  }
  useLayoutEffect(() => {
    if (input.current) sync(input.current.value, false);
  });
  useEffect(() => {
    const element = input.current, form = element?.form;
    if (!element || !form) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = (event: Event) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { if (!event.defaultPrevented && input.current === element) { sync(element.value, false); follow(element); } }, 0);
    };
    form.addEventListener("reset", reset);
    return () => { form.removeEventListener("reset", reset); if (timer) clearTimeout(timer); };
  }, [props.form]);
  useEffect(() => {
    if (!removed.length) return;
    const timer = setTimeout(() => setRemoved([]), 500);
    return () => clearTimeout(timer);
  }, [removed]);
  useLayoutEffect(() => {
    const stripe = caret.current, content = layer.current;
    if (!stripe || !content || !showMirror) return;
    const nodes = content.querySelectorAll<HTMLElement>("[data-glyph]");
    const index = Array.from(text.slice(0, selection.end)).length;
    const last = nodes[nodes.length - 1];
    caretMotion.target = nodes[index]?.offsetLeft ?? (last ? last.offsetLeft + last.offsetWidth : 0);
    if (!focused || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) snap(caretMotion, caretMotion.target);
    return playSprings([caretMotion], () => {
      const stretch = Math.min(Math.abs(caretMotion.velocity) / 80, 7);
      stripe.style.translate = `${caretMotion.position - (caretMotion.velocity > 0 ? stretch : 0)}px 0`;
      stripe.style.inlineSize = `${2 + stretch}px`;
    });
  }, [caretMotion, focused, selection.end, showMirror, text]);
  return <span className="yg-spring-edit motion-spring-field-edit" data-mirror={showMirror || undefined}>
    <SDKInput {...props} value={value == null ? undefined : String(value)} defaultValue={defaultValue == null ? undefined : String(defaultValue)}
      data-mirror={showMirror || undefined}
      onChange={event => { sync(event.currentTarget.value, !composing); follow(event.currentTarget); onChange?.(event); }}
      onFocus={event => { setFocused(true); follow(event.currentTarget); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }}
      onCompositionStart={event => { setComposing(true); onCompositionStart?.(event); }}
      onCompositionEnd={event => { setComposing(false); sync(event.currentTarget.value, false); follow(event.currentTarget); onCompositionEnd?.(event); }}
      onValueChange={(next, details) => { if (details.reason === "imperative" && props.maxLength !== undefined && props.maxLength >= 0 && next.length > props.maxLength) details.cancel(); }}
      render={<input ref={input} onSelect={event => { follow(event.currentTarget); onSelect?.(event); }} onScroll={event => { follow(event.currentTarget); onScroll?.(event); }} />} />
    <span className="yg-spring-window motion-spring-field-window" aria-hidden="true">
      <span className="yg-spring-glyphs motion-spring-glyphs" ref={layer} style={{ translate: `${-selection.scroll}px 0` }}>
        {compatible && glyphs.map(glyph => <span className="yg-spring-glyph motion-spring-glyph" data-glyph="" key={glyph.id}
          style={{ "--yg-glyph-delay": `${glyph.delay}ms` } as React.CSSProperties}>{glyph.text}</span>)}
        {removed.map(glyph => <span className="yg-spring-removed motion-spring-removed" key={glyph.id} style={{ left: glyph.left }}
          onAnimationEnd={() => setRemoved(items => items.filter(item => item.id !== glyph.id))}>{glyph.text}</span>)}
        <span className="yg-spring-caret motion-spring-caret" ref={caret} data-visible={showMirror || undefined} />
      </span>
    </span>
  </span>;
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
            ? <SpringTextInput {...props} {...binding} value={value} defaultValue={defaultValue} />
            : <SDKInput {...props} {...binding}
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
          <SDKTextarea {...props} {...binding} rows={rows} controller={suggestion !== undefined ? completionController : undefined} aria-describedby={[
            props["aria-describedby"], binding["aria-describedby"], available && `${binding.id}-suggestion`,
          ].filter(Boolean).join(" ") || undefined} data-accepted={rolling || undefined}
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
