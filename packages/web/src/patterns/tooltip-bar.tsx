"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../foundation/foundation.js";

type Tool = {id: string; label: string; detail: string; icon: IconName};

export function MorphTooltipBar({ label, tools, value, onChange }: {
  label: string; tools: readonly Tool[]; value: string; onChange: (value: string) => void;
}) {
  const id = useId();
  const bar = useRef<HTMLDivElement>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => () => clearTimeout(hide.current), []);
  useLayoutEffect(() => {
    const root = bar.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-tool]"));
    const labels = Array.from(root.querySelectorAll<HTMLElement>("[data-tooltip-label]"));
    const arrange = () => {
      const current = buttons.findIndex(button => button.dataset.tool === active);
      const selected = buttons[current], description = labels[current];
      root.style.setProperty("--yg-tooltip-open", String(Number(Boolean(selected && description))));
      labels.forEach(node => {
        node.style.setProperty("--yg-tooltip-copy", String(Number(node.dataset.tooltipLabel === active)));
        node.style.setProperty("--yg-tooltip-copy-x", "0px");
      });
      if (!selected || !description) return;
      const center = selected.offsetLeft + selected.offsetWidth / 2;
      const half = Math.min(description.offsetWidth / 2, root.clientWidth / 2);
      const left = Math.min(root.clientWidth - half * 2, Math.max(0, center - half));
      const width = Math.max(30, half * 2);
      const start = Math.min(Math.max(0, left), Math.max(0, root.clientWidth - width));
      const tail = Math.max(start + 8, Math.min(start + width - 8, center));
      root.style.setProperty("--yg-tooltip-left", `${start}px`);
      root.style.setProperty("--yg-tooltip-width", `${width}px`);
      root.style.setProperty("--yg-tooltip-tail", `${tail}px`);
      root.style.setProperty("--yg-tooltip-marker", `${selected.offsetLeft}px`);
      root.style.setProperty("--yg-tooltip-marker-width", `${selected.offsetWidth}px`);
    };
    arrange();
    const resize = new ResizeObserver(arrange);
    resize.observe(root);
    labels.forEach(node => resize.observe(node));
    return () => resize.disconnect();
  }, [active, tools]);

  function reveal(tool: string) {
    clearTimeout(hide.current);
    setActive(tool);
  }
  function leave() {
    clearTimeout(hide.current);
    hide.current = setTimeout(() => setActive(null), 140);
  }
  return <div className="yg-tooltip-bar" ref={bar} role="toolbar" aria-label={label}
    style={{gridTemplateColumns: `repeat(${Math.max(1, tools.length)}, minmax(0, 1fr))`}}
    onPointerLeave={leave} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) leave();
    }}
    onKeyDown={event => {
      if (event.key !== "Escape") return;
      clearTimeout(hide.current);
      setActive(null);
    }}>
    <span className="yg-tooltip-bar-marker" aria-hidden="true" />
    <span className="yg-tooltip-bar-tail" aria-hidden="true" />
    <span className="yg-tooltip-bar-bubble" id={id} role="tooltip" aria-hidden={active === null}>
      {tools.map(tool => <span key={tool.id} data-tooltip-label={tool.id} aria-hidden={tool.id !== active}>
        {tool.detail}
      </span>)}
    </span>
    {tools.map(tool => <button key={tool.id} type="button" data-tool={tool.id}
      aria-label={tool.label} aria-pressed={value === tool.id} aria-describedby={active === tool.id ? id : undefined}
      onPointerEnter={() => reveal(tool.id)} onFocus={() => reveal(tool.id)}
      onClick={() => { reveal(tool.id); onChange(tool.id); }}>
      <Icon name={tool.icon} />
    </button>)}
  </div>;
}
