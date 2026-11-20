import { useId } from 'react';

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
};

export function LetterLimit({ label, value, onChange, limit }: LetterLimitProps) {
  const id = useId();
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  const remaining = maximum - value.length;
  return (
    <div className="yg-letter-limit" data-near={remaining <= Math.max(10, maximum * 0.1) || undefined}>
      <label htmlFor={id}>{label}</label>
      <div className="yg-letter-field">
        <textarea id={id} value={value} maxLength={maximum} onChange={(event) => onChange(event.currentTarget.value)} aria-describedby={`${id}-count`} />
        <div className="yg-letter-meter" aria-hidden="true"><span style={{ width: `${maximum ? Math.min(100, value.length / maximum * 100) : 0}%` }} /></div>
      </div>
      <div className="yg-letter-count" id={`${id}-count`}>{remaining < 0 ? `${-remaining} over limit` : `${remaining} remaining`}</div>
    </div>
  );
}
