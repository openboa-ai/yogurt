"use client";
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type TextareaHTMLAttributes } from "react";
import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

type Person = { id: string; label: string };

/** Shared local presentation; the host remains the owner of the draft and people. */
export function useMention({ people, value, onChange, collapsedOnly = false }: {
  people?: readonly Person[]; value: string; onChange: (value: string) => void; collapsedOnly?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const followingSelection = useRef<{
    value: string; origin: string; caret: number; selectionStart: number; selectionEnd: number;
  } | null>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [edges] = useState(() => [spring(4, 620, 36), spring(44, 190, 19)]);
  const markerOpen = useRef(false);
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [focused, setFocused] = useState(false);
  const [composing, setComposing] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const enabled = people !== undefined;
  const previouslyEnabled = useRef(enabled);
  useLayoutEffect(() => {
    if (enabled && !previouslyEnabled.current) {
      const node = input.current;
      setFocused(Boolean(node && node.ownerDocument.activeElement === node));
      if (node) setSelection({start: node.selectionStart, end: node.selectionEnd});
    } else if (!enabled && previouslyEnabled.current) {
      followingSelection.current = null;
      setFocused(false); setDismissed(null); setActiveId(null);
    }
    previouslyEnabled.current = enabled;
  }, [enabled]);
  const caret = Math.min(selection.start, value.length);
  const before = value.slice(0, caret);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? caret - match[1].length - 1 : -1;
  const end = start < 0 ? caret : caret + (value.slice(caret).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${caret}:${value}`;
  const options = match ? (people ?? []).filter(person => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = !!people && focused && !composing && (!collapsedOnly || selection.start === selection.end) &&
    !!match && dismissed !== tokenKey && options.length > 0;
  const found = options.findIndex(option => option.id === activeId);
  const index = found < 0 ? 0 : found;
  useLayoutEffect(() => {
    const pill = marker.current;
    const list = pill?.parentElement;
    const row = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!pill || !list || !row || !open) { markerOpen.current = false; return; }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const [top, bottom] = edges;
    const y = row.offsetTop, last = y + row.offsetHeight;
    const forward = y >= top.target;
    const lead = forward ? bottom : top, trail = forward ? top : bottom;
    lead.stiffness = 620; lead.damping = 36;
    trail.stiffness = 190; trail.damping = 19;
    top.target = y; bottom.target = last;
    if (!markerOpen.current || preference.matches) { snap(top, y); snap(bottom, last); }
    markerOpen.current = true;
    if (y < list.scrollTop) list.scrollTop = y;
    else if (last > list.scrollTop + list.clientHeight && list.clientHeight > 0) list.scrollTop = last - list.clientHeight;
    let frame = 0, previous = performance.now();
    function paint() {
      pill?.style.setProperty("--yg-mention-top", `${top.position}px`);
      pill?.style.setProperty("--yg-mention-height", `${Math.max(0, bottom.position - top.position)}px`);
    }
    function tick(timestamp: number) {
      const moving = advanceSprings(edges, (timestamp - previous) / 1000);
      previous = timestamp;
      paint();
      if (moving) frame = requestAnimationFrame(tick);
    }
    function changePreference() {
      if (!preference.matches) return;
      cancelAnimationFrame(frame); snap(top, top.target); snap(bottom, bottom.target); paint();
    }
    paint();
    if (!preference.matches) frame = requestAnimationFrame(tick);
    preference.addEventListener("change", changePreference);
    return () => { cancelAnimationFrame(frame); preference.removeEventListener("change", changePreference); };
  }, [edges, index, open, options.length]);

  function moveCaret(next: number) {
    input.current?.focus({preventScroll: true});
    input.current?.setSelectionRange(next, next);
    setSelection({start: next, end: next});
  }
  useLayoutEffect(() => {
    const pending = followingSelection.current;
    if (!pending) return;
    if (pending.value !== value) {
      if (pending.origin !== value) followingSelection.current = null;
      return;
    }
    followingSelection.current = null;
    if (input.current?.ownerDocument.activeElement === input.current) moveCaret(pending.caret);
  }, [value]);
  function select(person: Person) {
    if (!open || start < 0 || !options.some(option => option.id === person.id)) return;
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    const next = value.slice(0, start) + replacement + space + suffix;
    setDismissed(null); setActiveId(null);
    if (next === value) moveCaret(nextCaret);
    else {
      followingSelection.current = {
        value: next, origin: value, caret: nextCaret,
        selectionStart: input.current?.selectionStart ?? caret,
        selectionEnd: input.current?.selectionEnd ?? caret,
      };
      onChange(next);
    }
  }
  const editorProps: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> = {
    "aria-autocomplete": "list",
    "aria-controls": open ? `${id}-list` : undefined,
    "aria-activedescendant": open ? `${id}-option-${index}` : undefined,
    onFocus: event => { setFocused(true); setSelection({start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd}); },
    onBlur: () => { followingSelection.current = null; setFocused(false); },
    onSelect: event => {
      const pending = followingSelection.current;
      if (pending && (event.currentTarget.selectionStart !== pending.selectionStart ||
        event.currentTarget.selectionEnd !== pending.selectionEnd)) followingSelection.current = null;
      setSelection({start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd}); setActiveId(null);
    },
    onCompositionStart: () => { followingSelection.current = null; setComposing(true); },
    onCompositionEnd: event => {
      setComposing(false);
      setSelection({start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd});
    },
    onChange: event => {
      followingSelection.current = null;
      setSelection({start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd});
      setActiveId(null); setDismissed(null); onChange(event.currentTarget.value);
    },
    onKeyDown: event => {
      if (!open || event.defaultPrevented || event.nativeEvent.isComposing ||
        (collapsedOnly && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey))) return;
      if (event.key === "Escape") { event.preventDefault(); setDismissed(tokenKey); }
      else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveId(options[(index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].id);
      } else if (event.key === "Enter") { event.preventDefault(); select(options[index]); }
    },
  };
  return { id, input, editorProps, open, options, index, marker, setActiveId, select };
}

export function MentionOptions({ mention }: { mention: ReturnType<typeof useMention> }) {
  const { id, open, options, index, marker, setActiveId, select } = mention;
  return <><span role="status" aria-live="polite" style={{position: "absolute", width: 1, height: 1,
    padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap"}}>
    {open ? `${options.length} ${options.length === 1 ? "suggestion" : "suggestions"} available` : ""}
  </span><div className="yg-mention-layer" data-open={open} style={{"--yg-mention-count": options.length} as CSSProperties}>
    <div id={`${id}-list`} className="yg-mention-list" role="listbox" aria-label="People" aria-hidden={!open || undefined} inert={!open}>
      <span ref={marker} className="yg-mention-marker" aria-hidden="true" />
      {options.map((person, i) => <button id={`${id}-option-${i}`} key={person.id} role="option"
        aria-selected={i === index} type="button" tabIndex={-1}
        style={{"--yg-mention-index": i} as CSSProperties}
        onPointerMove={event => { if (event.pointerType === "mouse") setActiveId(person.id); }}
        onMouseDown={event => event.preventDefault()} onClick={() => select(person)}>
        <span aria-hidden="true">{Array.from(person.label)[0]?.toLocaleUpperCase()}</span><b>{person.label}</b>
      </button>)}
    </div>
  </div></>;
}
