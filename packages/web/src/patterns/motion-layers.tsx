"use client";

import { useId, useState } from "react";
import { Select } from "../controls/forms.js";
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
      <span id={id} role="tooltip" className="yg-morph-tooltip-card" data-open={open} hidden={!open}>
        <span>{detail}</span>
      </span>
    </span>
  );
}

type LayerOption = { id: string; label: string };

/** A controlled select with the browser's native selection and recovery behavior. */
export function SpringDropdown({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: LayerOption[];
}) {
  return <div className="yg-spring-dropdown"><Select label={label} value={value} options={options} onChange={(event) => onChange(event.currentTarget.value)} /></div>;
}

/** A searchable command surface that returns the selected command ID. */
export function CommandButton({ label, items, onSelect }: {
  label: string; items: LayerOption[]; onSelect: (id: string) => void;
}) {
  return <div className="yg-command-button"><Command label={label} items={items} onSelect={onSelect} /></div>;
}
