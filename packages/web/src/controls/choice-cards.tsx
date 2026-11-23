"use client";

import type { ReactNode } from "react";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";

type FocusOption = { id: string; label: string; description: string };
type PlanOption = FocusOption & { price: string };

type ChoiceProps<T> = {
  value: string;
  onChange: (value: string) => void;
  options: T[];
};

function ChoiceCards<T extends FocusOption>({
  label, value, onChange, options, groupClass, itemClass, children,
}: ChoiceProps<T> & {
  label: string;
  groupClass: string;
  itemClass: string;
  children: (option: T) => ReactNode;
}) {
  return (
    <RadioGroup className={groupClass} aria-label={label} value={value}
      onValueChange={next => { if (next !== null) onChange(next); }}>
      {options.map(option => (
        <label className={itemClass} key={option.id} data-selected={value === option.id || undefined}>
          <Radio value={option.id} />
          {children(option)}
        </label>
      ))}
    </RadioGroup>
  );
}

export function FocusPicker(props: ChoiceProps<FocusOption>) {
  return <ChoiceCards {...props} label="Focus" groupClass="yg-focus-picker" itemClass="yg-focus-choice">
    {option => <>
      <span className="yg-focus-orbit" aria-hidden="true" />
      <span className="yg-choice-copy"><strong>{option.label}</strong><span>{option.description}</span></span>
      <span className="yg-choice-check" aria-hidden="true">✓</span>
    </>}
  </ChoiceCards>;
}

export function PlanSwitch(props: ChoiceProps<PlanOption>) {
  return <ChoiceCards {...props} label="Plan" groupClass="yg-plan-switch" itemClass="yg-plan-choice">
    {option => <>
      <span className="yg-plan-heading"><strong>{option.label}</strong><span className="yg-choice-check" aria-hidden="true">✓</span></span>
      <span className="yg-plan-price">{option.price}</span>
      <span className="yg-plan-description">{option.description}</span>
    </>}
  </ChoiceCards>;
}
