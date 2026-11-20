"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export function StreamingReply({ value, active = false }: { value: string; active?: boolean }) {
  return <div className="yg-streaming-reply" aria-busy={active || undefined}>
    {value ? <span>{value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part : <span className="yg-streaming-word" key={index}>{part}</span>)}</span> : active ? <span className="yg-streaming-wait">Thinking</span> : null}
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
    <div className="yg-ghost-head"><label htmlFor={id}>Your message</label>{show && <span className="yg-ghost-key" aria-hidden="true">Tab ↹</span>}</div>
    <div className="yg-ghost-input">
      <div ref={mirror} className="yg-ghost-mirror" aria-hidden="true"><span>{value}</span>{show && <span className="yg-ghost-suffix">{Array.from(suffix).map((letter, index) => <span key={index} style={{animationDelay: `${Math.min(index * 8, 200)}ms`}}>{letter}</span>)}</span>}</div>
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
  const editor = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const target = editor.current;
    const source = measure.current;
    if (!target || !source) return;
    const resize = () => target.style.setProperty("--yg-prompt-editor-height", `${Math.min(source.offsetHeight, 88)}px`);
    const observer = new ResizeObserver(resize);
    observer.observe(source);
    resize();
    return () => observer.disconnect();
  }, []);

  return <form className="yg-prompt-box" aria-label="Prompt" aria-busy={busy || undefined}
    onSubmit={(event) => { event.preventDefault(); if (!busy && value.trim()) onSubmit(); }}>
    <div className="yg-prompt-panel">
      <div className="yg-prompt-status-slot">
        <div className="yg-prompt-status" role="status">
          {busy && <><span className="yg-prompt-indicator" aria-hidden="true" /><span>Thinking</span></>}
        </div>
      </div>
    </div>
    <div className="yg-prompt-editor" ref={editor}>
      <span className="yg-prompt-measure" ref={measure} aria-hidden="true">{value}{" "}</span>
      <textarea aria-label="Prompt" placeholder="Ask anything" rows={1} value={value}
        onChange={event => onChange(event.currentTarget.value)}
        onKeyDown={event => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
          event.preventDefault();
          if (!busy && value.trim()) event.currentTarget.form?.requestSubmit();
        }} />
    </div>
    <div className="yg-prompt-actions">
      <button className="yg-prompt-action" type={busy && onCancel ? "button" : "submit"}
        aria-label={busy && onCancel ? "Stop" : "Send"} data-busy={busy && onCancel ? true : undefined}
        disabled={busy ? !onCancel : !value.trim()} onClick={busy && onCancel ? onCancel : undefined}>
        <span className="yg-prompt-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </span>
        <span className="yg-prompt-stop" aria-hidden="true" />
      </button>
    </div>
  </form>;
}

export function ThinkingIndicator({ label = "Thinking", active = true }: { label?: string; active?: boolean }) {
  const filter = useId();
  if (!active) return null;
  return <div className="yg-thinking" role="status" aria-label={label}>
    <svg width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id={filter}><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" /></filter></defs></svg>
    <span className="yg-thinking-dots" aria-hidden="true" style={{filter: `url(#${filter})`}}><i /><i /><i /></span>
  </div>;
}
