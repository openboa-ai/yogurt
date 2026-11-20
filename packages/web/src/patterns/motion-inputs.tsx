"use client";
import { useId, useRef, useState } from "react";

export function MentionPicker({ label, people, value, onChange }: {
  label: string;
  people: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const before = value.slice(0, caret);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? caret - match[1].length - 1 : -1;
  const end = start < 0 ? caret : caret + (value.slice(caret).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${caret}:${value}`;
  const options = match ? people.filter(person => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = focused && !!match && dismissed !== tokenKey && options.length > 0;
  const index = Math.min(active, options.length - 1);
  function select(person: { label: string }) {
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    onChange(value.slice(0, start) + replacement + space + suffix);
    setDismissed(null);
    setActive(0);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  }
  return <div className="yg-mention">
    <label className="yg-label" htmlFor={id}>{label}</label>
    <div className="yg-mention-surface">
      <textarea id={id} ref={input} value={value} rows={3} aria-describedby={`${id}-hint`} aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open ? `${id}-option-${index}` : undefined}
        onFocus={event => { setFocused(true); setCaret(event.currentTarget.selectionStart); }}
        onBlur={() => setFocused(false)}
        onSelect={event => { setCaret(event.currentTarget.selectionStart); setActive(0); }}
        onChange={event => { setCaret(event.currentTarget.selectionStart); setActive(0); setDismissed(null); onChange(event.currentTarget.value); }}
        onKeyDown={event => {
          if (!open || event.nativeEvent.isComposing) return;
          if (event.key === "Escape") { event.preventDefault(); setDismissed(tokenKey); }
          else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length); }
          else if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); select(options[index]); }
        }} />
      <span className="yg-mention-hint" id={`${id}-hint`}><kbd>@</kbd> Mention someone</span>
      {open && <div id={`${id}-list`} className="yg-mention-list" role="listbox" aria-label="People">
        <div className="yg-mention-list-heading" role="presentation">People <span>{options.length}</span></div>
        {options.map((person, i) => <button id={`${id}-option-${i}`} key={person.id} role="option" aria-selected={i === index} type="button" onMouseDown={event => event.preventDefault()} onClick={() => select(person)}><span aria-hidden="true">{Array.from(person.label)[0]?.toLocaleUpperCase()}</span>{person.label}</button>)}
      </div>}
    </div>
  </div>;
}

function acceptsFile(file: File, accept?: string) {
  const rules = accept?.split(",").map(rule => rule.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return rules.some(rule => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}

export function FileDrop({ label, onFiles, accept, multiple = false }: {
  label: string;
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const id = useId();
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  function receive(files: File[]) {
    if (!files.length) return;
    const allowed = files.filter(file => acceptsFile(file, accept));
    const selected = multiple ? allowed : allowed.slice(0, 1);
    const rejected = files.length - selected.length;
    setMessage(rejected ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added${accept ? ` (accepted: ${accept})` : ""}.` : `${selected.length} ${selected.length === 1 ? "file" : "files"} selected.`);
    if (selected.length) onFiles(selected);
  }
  const formats = accept?.split(",").map(rule => rule.trim()).filter(Boolean)
    .map(rule => rule.endsWith("/*") ? rule.split("/")[0] + " files" :
      (rule.split("/").at(-1) ?? rule).replace(/^\./, "").toUpperCase()).join(", ");
  return <div className="yg-file-drop-wrap">
    <span className="yg-label" id={`${id}-label`}>{label}</span>
    <div className="yg-file-drop" data-dragging={dragging || undefined}
      onDragEnter={event => { event.preventDefault(); depth.current++; setDragging(true); }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
      onDragLeave={event => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
      onDrop={event => { event.preventDefault(); depth.current = 0; setDragging(false); receive(Array.from(event.dataTransfer.files)); }}>
      <svg className="yg-file-drop-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 16V4m-4 4 4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      </svg>
      <div className="yg-file-drop-copy">
        <strong>Drop files here</strong>
        {formats && <span id={`${id}-formats`}>{formats}</span>}
      </div>
      <label className="yg-file-drop-button" htmlFor={id}>Choose {multiple ? "files" : "a file"}</label>
      <input id={id} type="file" aria-labelledby={`${id}-label`} aria-describedby={formats ? `${id}-formats` : undefined} accept={accept} multiple={multiple} onChange={event => { receive(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
    </div>
    <span className="yg-file-drop-status" role="status">{message}</span>
  </div>;
}
