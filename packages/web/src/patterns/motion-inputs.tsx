"use client";
import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { advanceSprings, snap, spring } from "../foundation/spring-motion.js";

export function MentionPicker({ label, people, value, onChange }: {
  label: string;
  people: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const followingSelection = useRef<{value: string; caret: number} | null>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [edges] = useState(() => [spring(4, 620, 36), spring(44, 190, 19)]);
  const markerOpen = useRef(false);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const selection = Math.min(caret, value.length);
  const before = value.slice(0, selection);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? selection - match[1].length - 1 : -1;
  const end = start < 0 ? selection : selection + (value.slice(selection).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${selection}:${value}`;
  const options = match ? people.filter(person => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = focused && !!match && dismissed !== tokenKey && options.length > 0;
  const index = Math.min(active, options.length - 1);
  useLayoutEffect(() => {
    const pill = marker.current;
    const list = pill?.parentElement;
    const row = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!pill || !list || !row || !open) {
      markerOpen.current = false;
      return;
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const [top, bottom] = edges;
    const y = row.offsetTop, end = y + row.offsetHeight;
    const forward = y >= top.target;
    const lead = forward ? bottom : top, trail = forward ? top : bottom;
    lead.stiffness = 620; lead.damping = 36;
    trail.stiffness = 190; trail.damping = 19;
    top.target = y; bottom.target = end;
    if (!markerOpen.current || preference.matches) {
      snap(top, y); snap(bottom, end);
    }
    markerOpen.current = true;
    if (y < list.scrollTop) list.scrollTop = y;
    else if (end > list.scrollTop + list.clientHeight && list.clientHeight > 0) {
      list.scrollTop = end - list.clientHeight;
    }
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
      cancelAnimationFrame(frame);
      snap(top, top.target); snap(bottom, bottom.target); paint();
    }
    paint();
    if (!preference.matches) frame = requestAnimationFrame(tick);
    preference.addEventListener("change", changePreference);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", changePreference);
    };
  }, [edges, index, open, options.length]);
  function moveCaret(next: number) {
    input.current?.focus({preventScroll: true});
    input.current?.setSelectionRange(next, next);
    setCaret(next);
  }
  useLayoutEffect(() => {
    const pending = followingSelection.current;
    if (pending?.value !== value) return;
    followingSelection.current = null;
    moveCaret(pending.caret);
  }, [value]);
  function select(person: { label: string }) {
    if (start < 0) return;
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    const next = value.slice(0, start) + replacement + space + suffix;
    setDismissed(null);
    setActive(0);
    if (next === value) moveCaret(nextCaret);
    else {
      followingSelection.current = {value: next, caret: nextCaret};
      onChange(next);
    }
  }
  return <div className="yg-mention">
    <label className="yg-label" htmlFor={id}>{label}</label>
    <div className="yg-mention-surface">
      <textarea id={id} ref={input} value={value} rows={2} placeholder="Write a comment" aria-describedby={`${id}-hint`} aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open ? `${id}-option-${index}` : undefined}
        onFocus={event => { setFocused(true); setCaret(event.currentTarget.selectionStart); }}
        onBlur={() => setFocused(false)}
        onSelect={event => { setCaret(event.currentTarget.selectionStart); setActive(0); }}
        onChange={event => {
          followingSelection.current = null;
          setCaret(event.currentTarget.selectionStart);
          setActive(0);
          setDismissed(null);
          onChange(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (!open || event.nativeEvent.isComposing) return;
          if (event.key === "Escape") { event.preventDefault(); setDismissed(tokenKey); }
          else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length); }
          else if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); select(options[index]); }
        }} />
      <span className="yg-mention-hint" id={`${id}-hint`}>Type @ to mention</span>
      <div className="yg-mention-layer" data-open={open} style={{"--yg-mention-count": options.length} as CSSProperties}>
        <div id={`${id}-list`} className="yg-mention-list" role="listbox" aria-label="People" inert={!open}>
          <span ref={marker} className="yg-mention-marker" aria-hidden="true" />
          {options.map((person, i) => <button id={`${id}-option-${i}`} key={person.id} role="option"
            aria-selected={i === index} type="button" tabIndex={-1}
            style={{"--yg-mention-index": i} as CSSProperties}
            onPointerMove={event => { if (event.pointerType === "mouse") setActive(i); }}
            onMouseDown={event => event.preventDefault()} onClick={() => select(person)}>
            <span aria-hidden="true">{Array.from(person.label)[0]?.toLocaleUpperCase()}</span><b>{person.label}</b>
          </button>)}
        </div>
      </div>
    </div>
  </div>;
}

function acceptsFile(file: File, accept?: string) {
  const rules = accept?.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return rules.some(rule => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}

export function FileDrop({ label, onFiles, accept, multiple = false, progress }: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Caller-reported work on the selected files, as a fraction from zero to one. */
  progress?: number;
}) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const percent = accepted && progress !== undefined && Number.isFinite(progress)
    ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : null;
  const processing = percent !== null && percent < 100;
  const complete = accepted && !processing;
  function receive(files: File[]) {
    if (!files.length) return;
    const allowed = files.filter(file => acceptsFile(file, accept));
    const selected = multiple ? allowed : allowed.slice(0, 1);
    const rejected = files.length - selected.length;
    setAccepted(selected.length > 0);
    setMessage(rejected ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added${accept ? ` (accepted: ${accept})` : ""}.` : `${selected.length} ${selected.length === 1 ? "file" : "files"} selected.`);
    if (selected.length) onFiles(selected);
  }
  const formats = accept?.split(",").map(rule => rule.trim()).filter(Boolean)
    .map(rule => rule.endsWith("/*") ? rule.split("/")[0] + " files" :
      (rule.split("/").at(-1) ?? rule).replace(/^\./, "").toUpperCase()).join(", ");
  return <div className="yg-file-drop-wrap">
    <span className="yg-label" id={`${id}-label`}>{label}</span>
    <label htmlFor={id} className="yg-file-drop" data-dragging={dragging || undefined}
      data-processing={processing || undefined} data-accepted={complete || undefined}
      onDragEnter={event => { event.preventDefault(); depth.current++; setDragging(true); }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
      onDragLeave={event => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
      onDrop={event => { event.preventDefault(); depth.current = 0; setDragging(false); receive(Array.from(event.dataTransfer.files)); }}>
      <span className="yg-file-drop-core">
        <svg className="yg-file-drop-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
        </svg>
        <svg className="yg-file-drop-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="24" />
        </svg>
        {percent !== null && <span className="yg-file-drop-progress" data-complete={!processing || undefined}
          role="progressbar" aria-label="Preparing selected files" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={percent} aria-hidden={!processing || undefined}>
          <svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" pathLength="100" style={{strokeDashoffset: 100 - percent}} /></svg>
          <span>{percent}%</span>
        </span>}
      </span>
      <div className="yg-file-drop-copy">
        <strong key={processing ? "processing" : complete ? "complete" : "idle"}>{processing ? "Preparing files" : complete ? "Files selected" : "Drop files here"}</strong>
        <span id={`${id}-formats`}>{formats || "Choose a file from your device"}</span>
      </div>
      <input id={id} type="file" aria-labelledby={`${id}-label`} aria-describedby={`${id}-formats`} accept={accept} multiple={multiple} onChange={event => { receive(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
    </label>
    <span className="yg-file-drop-status" role="status">{message}</span>
  </div>;
}
