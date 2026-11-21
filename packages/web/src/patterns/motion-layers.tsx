"use client";

import { useId, useState, type CSSProperties } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Command } from "../controls/advanced.js";

/** A contextual note that can be revealed with a pointer or keyboard focus. */
export function MorphTooltip({ label, detail }: { label: string; detail: string }) {
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = !dismissed && (hovered || focused);
  return (
    <span className="yg-morph-tooltip"
      onPointerEnter={() => { setHovered(true); setDismissed(false); }}
      onPointerLeave={() => { setHovered(false); }}
      onFocus={() => { setFocused(true); setDismissed(false); }}
      onBlur={() => { setFocused(false); setDismissed(false); }}
      onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}>
      <button type="button" className="yg-morph-tooltip-trigger" aria-describedby={open ? id : undefined}>
        {label}<span aria-hidden="true">i</span>
      </button>
      <span id={id} role="tooltip" className="yg-morph-tooltip-card" data-open={open} aria-hidden={!open}>
        <span>{detail}</span>
      </span>
    </span>
  );
}

type LayerOption = { id: string; label: string };
type SpringOption = LayerOption & {
  marker?: "neutral" | "in-progress" | "review" | "done";
};

/** A controlled listbox with an anchored panel and explicit selected state. */
export function SpringDropdown({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: readonly SpringOption[];
}) {
  const id = useId();
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.id === value);
  const settledStyle = {
    "--yg-picker-open": 1,
    "--yg-picker-opacity": 1,
    "--yg-picker-row": 1,
    "--yg-picker-chevron-now": open ? "180deg" : "0deg",
  } as CSSProperties;

  return <div ref={setPortal} className="yg-spring-dropdown" data-open={open} data-value={value} style={settledStyle}>
    <label id={id} className="yg-spring-label">{label}</label>
    <SelectPrimitive.Root value={value} onValueChange={onChange} open={open} onOpenChange={setOpen}>
      <SelectPrimitive.Trigger className="yg-spring-trigger" aria-labelledby={id}>
        <span className="yg-spring-value">
          <span key={value} className="yg-spring-value-roll">
            <span className="yg-spring-symbol" data-marker={selected?.marker} aria-hidden="true" />
            <span className="yg-spring-value-label">
              <SelectPrimitive.Value placeholder="Choose an option" />
            </span>
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <svg className="yg-spring-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal container={portal}>
        <SelectPrimitive.Content className="yg-spring-menu" style={{ animation: "none" }} position="popper" sideOffset={8} collisionPadding={16}>
          <SelectPrimitive.Viewport className="yg-spring-viewport">
            {options.map(option => <SelectPrimitive.Item key={option.id} value={option.id} className="yg-spring-option">
              <span className="yg-spring-symbol" data-marker={option.marker} aria-hidden="true" />
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <svg className="yg-spring-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" pathLength="22" />
              </svg>
            </SelectPrimitive.Item>)}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  </div>;
}

/** A searchable command surface that returns the selected command ID. */
export function CommandButton({ label, items, onSelect }: {
  label: string; items: LayerOption[]; onSelect: (id: string) => void;
}) {
  return <div className="yg-command-button"><Command label={label} items={items} onSelect={onSelect} /></div>;
}
