"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";

type EditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
  value: string;
  presentation: "composer" | "prompt";
};

/** The measurement node is presentation-only; the host continues to own input. */
export function PromptEditor({ value, presentation, rows = 1, ...props }: EditorProps) {
  const editor = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const target = editor.current, source = measure.current, input = textarea.current;
    if (!target || !source || !input) return;
    const computed = getComputedStyle(input);
    const line = Number.parseFloat(computed.lineHeight) || 22;
    const padding = (Number.parseFloat(computed.paddingTop) || 0) + (Number.parseFloat(computed.paddingBottom) || 0);
    const minimum = line * rows + padding;
    const maximum = Math.max(minimum, presentation === "prompt" ? 88 : 176);
    target.style.setProperty("--yg-prompt-editor-height", `${Math.max(minimum, Math.min(source.offsetHeight, maximum))}px`);
  }, [presentation, rows]);

  useLayoutEffect(resize, [resize, value]);
  useLayoutEffect(() => {
    const source = measure.current;
    if (!source) return;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(resize);
      observer.observe(source);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return <div ref={editor} className={`yg-prompt-editor${presentation === "composer" ? " yg-composer-editor" : ""}`}>
    <span ref={measure} className="yg-prompt-measure" aria-hidden="true">{value}{"\u200b"}</span>
    <textarea {...props} ref={textarea} rows={rows} value={value} />
  </div>;
}

type ActionProps = {
  presentation: "composer" | "prompt";
  busy: boolean;
  ready: boolean;
  onStop?: () => void;
  renderComposer?: (button: Ref<HTMLButtonElement>, stopping: boolean) => ReactNode;
};

/** Separate button identities prevent a Stop click from submitting the form. */
export function PromptAction({ presentation, busy, ready, onStop, renderComposer }: ActionProps) {
  const button = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = useRef(false);
  const stopping = busy && Boolean(onStop);
  const attachButton = useCallback((node: HTMLButtonElement | null) => {
    if (!node) {
      const previous = button.current;
      restoreFocus.current = Boolean(previous && previous.ownerDocument.activeElement === previous);
      button.current = null;
      return;
    }
    button.current = node;
    const active = node.ownerDocument.activeElement;
    if (restoreFocus.current && (!active || active === node.ownerDocument.body || !active.isConnected)) {
      node.focus({ preventScroll: true });
    }
    restoreFocus.current = false;
  }, []);

  if (presentation === "composer") {
    return renderComposer?.(attachButton, stopping) ?? null;
  }
  return <button ref={attachButton} className="yg-prompt-action yg-shared-action"
    type={stopping ? "button" : "submit"} aria-label={stopping ? "Stop" : "Send"}
    data-busy={stopping || undefined} disabled={busy ? !onStop : !ready}
    onClick={stopping ? event => { event.preventDefault(); onStop?.(); } : undefined}>
    <span className="yg-prompt-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
    </span>
    <span className="yg-prompt-stop" aria-hidden="true" />
  </button>;
}
