"use client";

import { useId, useState } from "react";
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
  const selected = options.find(option => option.id === value);
  return <div ref={setPortal} className="yg-spring-dropdown">
    <label id={id} className="yg-spring-label">{label}</label>
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="yg-spring-trigger" aria-labelledby={id}>
        <span className="yg-spring-value">
          <span key={value} className="yg-spring-value-roll">
            <span className="yg-spring-symbol" data-marker={selected?.marker} aria-hidden="true" />
            <span className="yg-spring-value-label">
              <SelectPrimitive.Value placeholder="Choose an option" />
            </span>
          </span>
        </span>
        <SelectPrimitive.Icon className="yg-spring-chevron" aria-hidden="true">⌄</SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal container={portal}>
        <SelectPrimitive.Content className="yg-spring-menu" position="popper" sideOffset={8}>
          <SelectPrimitive.Viewport className="yg-spring-viewport">
            {options.map(option => <SelectPrimitive.Item key={option.id} value={option.id} className="yg-spring-option">
              <span className="yg-spring-symbol" data-marker={option.marker} aria-hidden="true" />
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator className="yg-spring-check" aria-hidden="true">✓</SelectPrimitive.ItemIndicator>
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
