"use client";
import { useId, type CSSProperties } from "react";

type Option = { id: string; label: string };

export function RangeSlider({ label, value, onChange, min = 0, max = 100, step = 1 }: {
  label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number;
}) {
  const id = useId();
  const percent = max > min ? Math.max(0, Math.min(100, (value - min) / (max - min) * 100)) : 0;
  return <div className="yg-motion-range">
    <div className="yg-motion-range-heading"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}</output></div>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(event.currentTarget.valueAsNumber)} style={{ "--yg-range-fill": `${percent}%` } as CSSProperties} />
    <div className="yg-motion-range-ends" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
  </div>;
}

export function PasswordStrength({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const checks = [
    { label: "8 or more characters", passed: value.length >= 8 },
    { label: "Uppercase and lowercase", passed: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "A number or symbol", passed: /[^a-zA-Z]/.test(value) },
  ];
  const count = checks.filter(check => check.passed).length;
  return <div className="yg-motion-password">
    <label htmlFor={id}>Password</label>
    <input id={id} type="password" autoComplete="new-password" value={value} onChange={event => onChange(event.currentTarget.value)} aria-describedby={`${id}-checks`} />
    <div className="yg-motion-password-meter" aria-hidden="true">{checks.map((check, index) => <span key={check.label} data-active={index < count || undefined} />)}</div>
    <div id={`${id}-checks`} className="yg-motion-password-checks"><span>Local input checks: {count} of {checks.length} met</span><ul>{checks.map(check => <li key={check.label} data-passed={check.passed || undefined}><span aria-hidden="true">{check.passed ? "✓" : "○"}</span> {check.label}: {check.passed ? "met" : "not met"}</li>)}</ul></div>
  </div>;
}

export function CheckboxList({ options, value, onChange }: { options: Option[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="yg-motion-checklist"><legend>Choose options</legend>{options.map(option => <label key={option.id} className="yg-motion-checklist-item"><input type="checkbox" checked={value.includes(option.id)} onChange={event => onChange(event.currentTarget.checked ? [...value, option.id] : value.filter(id => id !== option.id))} /><span>{option.label}</span></label>)}</fieldset>;
}

export function DetentDial({ options, value, onChange }: { options: Option[]; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const index = options.findIndex(option => option.id === value);
  const selected = Math.max(0, index);
  const choose = (next: number) => { if (options.length) onChange(options[(next + options.length) % options.length].id); };
  return <div className="yg-motion-dial"><label htmlFor={id}>Selection</label><div className="yg-motion-dial-face" style={{ "--yg-dial-angle": `${options.length > 1 ? -135 + 270 * selected / (options.length - 1) : 0}deg` } as CSSProperties}><span className="yg-motion-dial-marker" aria-hidden="true" /><span className="yg-motion-dial-value">{options[index]?.label ?? "No selection"}</span></div><input id={id} type="range" min={0} max={Math.max(0, options.length - 1)} step={1} value={selected} disabled={!options.length} aria-valuetext={options[index]?.label ?? "No selection"} onChange={event => choose(event.currentTarget.valueAsNumber)} onKeyDown={event => { if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key) && options.length) { event.preventDefault(); choose(selected + (event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1)); } }} /><div className="yg-motion-dial-options" aria-hidden="true">{options.map(option => <span key={option.id} data-selected={option.id === value || undefined}>{option.label}</span>)}</div></div>;
}
