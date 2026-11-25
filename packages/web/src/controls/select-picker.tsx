"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectItemText, SelectTrigger, SelectValue } from "@ui-sdk/react/select";
import { animateSpringPicker } from "./spring-picker-motion.js";

type PickerOption = {
  id: string;
  label: string;
  marker?: "neutral" | "in-progress" | "review" | "done";
};

/** A controlled listbox with an anchored panel and explicit selected state. */
export type SelectPickerProps = {
  label: string;
  value: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  options: readonly PickerOption[];
};

export function SelectPicker({ label, value, onValueChange, onChange, options }: SelectPickerProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const motion = useRef<ReturnType<typeof animateSpringPicker> | null>(null);
  const [open, setOpen] = useState(false);
  const previousValue = useRef(value);
  const [roll, setRoll] = useState<{ current: string; previous?: string }>({ current: value });
  const selected = options.find(option => option.id === value);
  const previous = options.find(option => option.id === roll.previous);
  useLayoutEffect(() => {
    setRoll(prev => (prev.current === value ? prev : { current: value, previous: prev.current }));
  }, [value]);
  useLayoutEffect(() => {
    if (!root.current) return;
    motion.current = animateSpringPicker(root.current);
    return () => { motion.current?.dispose(); motion.current = null; };
  }, []);
  useLayoutEffect(() => {
    if (previousValue.current !== value) motion.current?.press(.955);
    previousValue.current = value;
  }, [value]);

  return <div ref={root} className="yg-spring-dropdown" data-open={open} data-value={value}>
    <span id={id} className="yg-spring-label">{label}</span>
    <Select value={value} open={open} onOpenChange={setOpen}
      onValueChange={next => { if (next !== null && next !== value) (onValueChange ?? onChange)?.(next); }}>
      <SelectTrigger className="yg-spring-trigger" aria-labelledby={id}
        onPointerDown={() => motion.current?.press(.965)}>
        <span className="yg-spring-value">
          {previous && <span key={`previous-${value}`} className="yg-spring-value-roll" data-outgoing="" aria-hidden="true">
            <span className="yg-spring-symbol" data-marker={previous.marker} />
            <span className="yg-spring-value-label">{previous.label}</span>
          </span>}
          <span key={value} className="yg-spring-value-roll" data-incoming={previous ? "" : undefined}>
            <span className="yg-spring-symbol" data-marker={selected?.marker} aria-hidden="true" />
            <SelectValue className="yg-spring-value-label" placeholder="Choose an option" />
          </span>
        </span>
        <svg className="yg-spring-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </SelectTrigger>
      <SelectContent className="yg-spring-menu" sideOffset={8} collisionPadding={16} align="start" alignItemWithTrigger={false}>
        <div className="yg-spring-viewport">
          <span className="yg-spring-highlight" aria-hidden="true" />
          {options.map(option => <SelectItem key={option.id} value={option.id} label={option.label} className="yg-spring-option">
            <span className="yg-spring-symbol" data-marker={option.marker} aria-hidden="true" />
            <SelectItemText />
            <svg className="yg-spring-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="22" />
            </svg>
          </SelectItem>)}
        </div>
      </SelectContent>
    </Select>
  </div>;
}
