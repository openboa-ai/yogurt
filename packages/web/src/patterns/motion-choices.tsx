import { useId } from 'react';
import { Button } from '../controls/actions.js';

type FocusOption = { id: string; label: string; description: string };
type PlanOption = FocusOption & { price: string };

type ChoiceProps<T> = {
  value: string;
  onChange: (value: string) => void;
  options: T[];
};

export function FocusPicker({ value, onChange, options }: ChoiceProps<FocusOption>) {
  const name = useId();
  return (
    <div className="yg-focus-picker" role="radiogroup" aria-label="Focus">
      {options.map((option) => (
        <label className="yg-focus-choice" key={option.id} data-selected={value === option.id || undefined}>
          <input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
          <span className="yg-focus-orbit" aria-hidden="true" />
          <span className="yg-choice-copy"><strong>{option.label}</strong><span>{option.description}</span></span>
          <span className="yg-choice-check" aria-hidden="true">✓</span>
        </label>
      ))}
    </div>
  );
}

export function PlanSwitch({ value, onChange, options }: ChoiceProps<PlanOption>) {
  const name = useId();
  return (
    <div className="yg-plan-switch" role="radiogroup" aria-label="Plan">
      {options.map((option) => (
        <label className="yg-plan-choice" key={option.id} data-selected={value === option.id || undefined}>
          <input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
          <span className="yg-plan-heading"><strong>{option.label}</strong><span className="yg-choice-check" aria-hidden="true">✓</span></span>
          <span className="yg-plan-price">{option.price}</span>
          <span className="yg-plan-description">{option.description}</span>
        </label>
      ))}
    </div>
  );
}

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
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  const progress = maximum > 0 ? Math.min(1, value.length / maximum) : 0;
  const state = remaining <= 0 ? "full" : remaining <= Math.max(10, maximum * 0.1) ? "near" : "normal";
  return (
    <div className="yg-letter-limit" data-limit-state={state}>
      <textarea id={id} aria-label={label} placeholder={placeholder} value={value} maxLength={maximum}
        onChange={event => onChange(event.currentTarget.value)} aria-describedby={`${id}-count`} />
      <div className="yg-letter-footer">
        <svg className="yg-letter-meter" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="12" r="9.5" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - progress} />
        </svg>
        <span className="yg-letter-count" id={`${id}-count`}>{remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining`}</span>
        {onSubmit && <Button onClick={() => onSubmit(value)} disabled={remaining < 0 || !value.trim()}>Post</Button>}
      </div>
    </div>
  );
}
