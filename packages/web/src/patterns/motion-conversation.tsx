"use client";

import { useId, useRef, useState } from "react";
import { Button } from "../controls/actions.js";

export function StreamingReply({ value, active = false }: { value: string; active?: boolean }) {
  return <div className="yg-streaming-reply" aria-busy={active || undefined}>
    <span>{value}</span>{active && <span className="yg-streaming-cursor" aria-hidden="true" />}
  </div>;
}

export function GhostSuggestion({ value, suggestion, onChange }: {
  value: string; suggestion: string; onChange: (value: string) => void;
}) {
  const id = useId();
  const [atEnd, setAtEnd] = useState(true);
  const mirror = useRef<HTMLDivElement>(null);
  const suffix = value && suggestion.startsWith(value) ? suggestion.slice(value.length) : "";
  const show = atEnd && !!suffix;
  return <div className="yg-ghost-field">
    <label htmlFor={id}>Your message</label>
    <div className="yg-ghost-input">
      <div ref={mirror} className="yg-ghost-mirror" aria-hidden="true"><span>{value}</span>{show && <span className="yg-ghost-suffix">{suffix}</span>}</div>
      <input id={id} value={value} autoComplete="off" aria-describedby={show ? `${id}-hint` : undefined}
        onScroll={(event) => { if (mirror.current) mirror.current.scrollLeft = event.currentTarget.scrollLeft; }}
        onChange={(event) => { onChange(event.currentTarget.value); setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length); }}
        onSelect={(event) => setAtEnd(event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length)}
        onKeyDown={(event) => {
          if (show && (event.key === "Tab" || event.key === "ArrowRight") && !event.nativeEvent.isComposing) {
            event.preventDefault(); onChange(suggestion);
          }
        }} />
    </div>
    {show && <span className="yg-ghost-hint" id={`${id}-hint`}>Press Tab or right arrow to accept</span>}
  </div>;
}

export function PromptBox({ value, onChange, onSubmit, busy = false, onCancel }: {
  value: string; onChange: (value: string) => void; onSubmit: () => void; busy?: boolean; onCancel?: () => void;
}) {
  return <form className="yg-prompt-box" aria-label="Prompt" aria-busy={busy || undefined}
    onSubmit={(event) => { event.preventDefault(); if (!busy && value.trim()) onSubmit(); }}>
    <div className="yg-prompt-editor" data-value={value}>
      <textarea aria-label="Prompt" placeholder="Ask anything" rows={1} value={value}
        onChange={(event) => onChange(event.currentTarget.value)} />
    </div>
    <div className="yg-prompt-actions">
      {busy && onCancel ? <Button type="button" emphasis="soft" onClick={onCancel}>Stop</Button>
        : <Button type="submit" disabled={busy || !value.trim()}>Send</Button>}
    </div>
  </form>;
}

export function ThinkingIndicator({ label = "Thinking", active = true }: { label?: string; active?: boolean }) {
  if (!active) return null;
  return <div className="yg-thinking" role="status"><span className="yg-thinking-shape" aria-hidden="true" /><span>{label}</span></div>;
}
