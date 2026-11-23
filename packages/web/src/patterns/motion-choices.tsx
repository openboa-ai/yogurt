import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Button } from '../controls/actions.js';

type LetterLimitProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  limit: number;
  placeholder?: string;
  onSubmit?: (value: string) => void;
};

export function LetterLimit({ label, value, onChange, limit, placeholder, onSubmit }: LetterLimitProps) {
  const id = useId();
  const editor = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLSpanElement>(null);
  const [rejected, setRejected] = useState<{key: number; letters: string[]; x: number; y: number; fall: number}>();
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  const progress = maximum > 0 ? Math.min(1, value.length / maximum) : 0;
  const state = remaining <= 0 ? "full" : remaining <= Math.max(10, maximum * 0.1) ? "near" : "normal";
  useEffect(() => {
    const field = editor.current;
    const card = field?.parentElement;
    if (!field || !card) return;
    const reject = (text: string) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const space = Math.max(0, maximum - field.value.length + field.selectionEnd - field.selectionStart);
      const letters = Array.from(text.slice(space, space + 24)).filter(letter => letter.trim()).slice(0, 12);
      const marker = end.current?.getBoundingClientRect();
      if (!letters.length || !marker) return;
      const frame = card.getBoundingClientRect();
      const y = Math.max(field.offsetTop, marker.top - frame.top - field.scrollTop);
      const floor = Math.min(frame.height + 46, innerHeight - frame.top - 14);
      setRejected(previous => ({
        key: (previous?.key ?? 0) + 1,
        letters,
        x: marker.left - frame.left,
        y,
        fall: Math.max(0, floor - y),
      }));
    };
    const insert = (event: InputEvent) => {
      if (!event.isComposing && event.inputType !== "insertFromPaste" && event.data) reject(event.data);
    };
    const paste = (event: ClipboardEvent) => reject(event.clipboardData?.getData("text/plain") ?? "");
    field.addEventListener("beforeinput", insert);
    field.addEventListener("paste", paste);
    return () => {
      field.removeEventListener("beforeinput", insert);
      field.removeEventListener("paste", paste);
    };
  }, [maximum]);
  return (
    <div className="yg-letter-limit" data-limit-state={state}>
      <textarea ref={editor} id={id} aria-label={label} placeholder={placeholder} value={value} maxLength={maximum}
        onChange={event => {
          if (event.currentTarget.value.length < value.length) setRejected(undefined);
          onChange(event.currentTarget.value);
        }} aria-describedby={`${id}-count`} />
      <span className="yg-letter-measure" aria-hidden="true">{value}<span ref={end}>{"\u200b"}</span></span>
      {rejected && <span className="yg-letter-rejected" aria-hidden="true" key={rejected.key}
        style={{left: rejected.x, top: rejected.y, "--yg-letter-fall": `${rejected.fall}px`} as CSSProperties}>
        {rejected.letters.map((letter, index) => <span key={index} style={{
          "--yg-letter-order": index, "--yg-letter-drift": `${(index % 5 - 2) * 12}px`,
        } as CSSProperties}>{letter}</span>)}
      </span>}
      <div className="yg-letter-footer">
        <svg className="yg-letter-meter" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="12" r="9.5" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - progress} />
        </svg>
        <span className="yg-letter-count" id={`${id}-count`}>{remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining`}</span>
        {onSubmit && <Button onClick={() => {
          setRejected(undefined);
          onSubmit(value);
        }} disabled={remaining < 0 || !value.trim()}>Post</Button>}
      </div>
    </div>
  );
}
