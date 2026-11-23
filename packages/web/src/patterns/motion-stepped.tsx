"use client";
import { useId, useState, type CSSProperties } from "react";
import { Checkbox } from "../controls/forms.js";
import { Input as SDKInput } from "@ui-sdk/react/input";
import { Button } from "../controls/actions.js";

type Option = { id: string; label: string };

export function PasswordStrength({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const score = value.length < 6 ? 0 : 1 + Number(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value)) + Number(/\d/.test(value)) + Number(value.length >= 10 && /[^A-Za-z0-9]/.test(value));
  const word = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  return <div className="yg-motion-password" data-score={score}>
    <label htmlFor={id}>Create a password</label>
    <div className="yg-motion-password-field">
      <SDKInput id={id} type={shown ? "text" : "password"} autoComplete="new-password"
        value={value} onChange={event => onChange(event.currentTarget.value)} aria-describedby={`${id}-checks`} />
      <Button type="button" emphasis="quiet" className="yg-motion-password-eye" data-icon-only="" size="comfortable" aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown} onMouseDown={event => {
          if (event.currentTarget.parentElement?.querySelector("input") === document.activeElement) event.preventDefault();
        }} onClick={() => setShown(current => !current)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/>
          <circle cx="12" cy="12" r="2.8"/>
          <path className="yg-motion-password-slash" d="M4.5 4.5l15 15" />
        </svg>
      </Button>
    </div>
    <div className="yg-motion-password-meter" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => <span key={index}><i style={{ scale: `${Number(index < score)} 1` }} /></span>)}
    </div>
    <div className="yg-motion-password-checks">
      <span role="status"><strong key={word}>{word}</strong></span>
      <span id={`${id}-checks`}>8+ characters, mixed case, a number and a symbol</span>
    </div>
  </div>;
}

export function CheckboxList({ options, value, onChange }: { options: Option[]; value: string[]; onChange: (value: string[]) => void }) {
  const count = options.filter(option => value.includes(option.id)).length;
  return <fieldset className="yg-motion-checklist"><legend>Choose options</legend><div className="yg-motion-checklist-heading"><strong>Today</strong><span><b>{count}</b> of {options.length} done</span></div>{options.map(option =>
    <Checkbox key={option.id} className="yg-motion-checklist-item" label={option.label}
      checked={value.includes(option.id)} onCheckedChange={checked =>
        onChange(checked === true ? [...value, option.id] : value.filter(id => id !== option.id))} />
  )}</fieldset>;
}

export function DetentDial({ options, value, onChange }: { options: Option[]; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const index = options.findIndex(option => option.id === value);
  const selected = Math.max(0, index);
  const choose = (next: number) => { if (options.length) onChange(options[(next + options.length) % options.length].id); };
  return <div className="yg-motion-dial"><label htmlFor={id}>Selection</label><div className="yg-motion-dial-face" style={{ "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` } as CSSProperties}><span className="yg-motion-dial-marker" aria-hidden="true" /><span className="yg-motion-dial-value">{options[index]?.label ?? "No selection"}</span></div><input id={id} type="range" min={0} max={Math.max(0, options.length - 1)} step={1} value={selected} disabled={!options.length} aria-valuetext={options[index]?.label ?? "No selection"} onChange={event => choose(event.currentTarget.valueAsNumber)} onKeyDown={event => { if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) { event.preventDefault(); choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1)); } }} /><div className="yg-motion-dial-options" aria-hidden="true">{options.map(option => <span key={option.id} data-selected={option.id === value || undefined}>{option.label}</span>)}</div></div>;
}
