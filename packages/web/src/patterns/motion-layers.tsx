"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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

function SpringHighlight() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const highlight = ref.current;
    const viewport = highlight?.parentElement;
    if (!highlight || !viewport) return;
    let lastTop: number | undefined;
    const update = () => {
      const row = viewport.querySelector<HTMLElement>("[data-highlighted]")
        ?? viewport.querySelector<HTMLElement>('[role="option"][data-state="checked"]');
      if (!row) {
        highlight.removeAttribute("data-ready");
        lastTop = undefined;
        return;
      }
      const top = row.offsetTop;
      if (lastTop !== undefined && lastTop !== top) {
        highlight.toggleAttribute("data-forward", top > lastTop);
      }
      lastTop = top;
      highlight.style.setProperty("--yg-spring-active-y", `${top}px`);
      highlight.style.setProperty("--yg-spring-active-height", `${row.offsetHeight}px`);
      highlight.style.setProperty("--yg-spring-active-end", `${top + row.offsetHeight}px`);
      highlight.setAttribute("data-ready", "");
    };
    const changes = new MutationObserver(update);
    changes.observe(viewport, {subtree: true, childList: true, attributes: true,
      attributeFilter: ["data-highlighted", "data-state"]});
    const sizes = new ResizeObserver(update);
    sizes.observe(viewport);
    update();
    return () => { changes.disconnect(); sizes.disconnect(); };
  }, []);
  return <span ref={ref} className="yg-spring-highlight" aria-hidden="true" />;
}

/** A controlled listbox with an anchored panel and explicit selected state. */
export function SpringDropdown({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void; options: readonly SpringOption[];
}) {
  const id = useId();
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState({open: false, lift: 0});
  const selected = options.find(option => option.id === value);
  const [roll, setRoll] = useState({value, previous: undefined as string | undefined});
  if (roll.value !== value) setRoll({value, previous: roll.value});
  const previous = options.find(option => option.id === roll.previous);
  return <div ref={setPortal} className="yg-spring-dropdown" data-open={menu.open}
    style={{"--yg-picker-lift": `${menu.lift}px`} as CSSProperties}>
    <label id={id} className="yg-spring-label">{label}</label>
    <SelectPrimitive.Root value={value} onValueChange={onChange} onOpenChange={open => {
      const room = Math.max(0, (portal?.getBoundingClientRect().top ?? 0) - 16);
      const lift = Math.min(room, 10 + Math.min(options.length, 4) * 22);
      setMenu({open, lift});
    }}>
      <SelectPrimitive.Trigger className="yg-spring-trigger" aria-labelledby={id}>
        <span className="yg-spring-value">
          {previous && <span key={`previous-${value}`} className="yg-spring-value-roll" data-outgoing aria-hidden="true">
            <span className="yg-spring-symbol" data-marker={previous.marker} />
            <span className="yg-spring-value-label">{previous.label}</span>
          </span>}
          <span key={value} className="yg-spring-value-roll" data-incoming={previous ? "" : undefined}>
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
            <SpringHighlight />
            {options.map((option, index) => <SelectPrimitive.Item key={option.id} value={option.id}
              className="yg-spring-option" style={{"--yg-spring-row-index": index, "--yg-spring-row-reverse": options.length - index - 1} as CSSProperties}>
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
