"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../foundation/foundation.js";
import { playSprings, snap, spring } from "../foundation/spring-motion.js";

type Tool = {id: string; label: string; detail: string; icon: IconName};
const unit = (value: number) => Math.min(1, Math.max(0, value));

export function MorphTooltipBar({ label, tools, value, onChange }: {
  label: string; tools: readonly Tool[]; value: string; onChange: (value: string) => void;
}) {
  const id = useId();
  const bar = useRef<HTMLDivElement>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState<string | null>(null);
  const lastActive = useRef<string | null>(null);
  const [dial] = useState(() => ({
    tipLeft: spring(0, 620, 36), tipRight: spring(0, 620, 36), tail: spring(0, 300, 22),
    left: spring(0, 620, 36), right: spring(0, 620, 36), opacity: spring(0, 420, 24),
    labels: new Map<string, {visibility: ReturnType<typeof spring>; direction: number}>(),
  }));
  useEffect(() => () => clearTimeout(hide.current), []);
  useLayoutEffect(() => {
    const root = bar.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-tool]"));
    const labels = Array.from(root.querySelectorAll<HTMLElement>("[data-tooltip-label]"));
    let stop: (() => void) | undefined;
    const arrange = () => {
      const current = buttons.findIndex(button => button.dataset.tool === active);
      const previous = buttons.findIndex(button => button.dataset.tool === lastActive.current);
      const selected = buttons[current], description = labels[current];
      const inPlace = dial.opacity.position < .3;
      const direction = previous < 0 ? 0 : Math.sign((selected?.offsetLeft ?? 0) - (buttons[previous]?.offsetLeft ?? 0));
      if (selected && description) {
        const center = selected.offsetLeft + selected.offsetWidth / 2;
        const half = Math.min(description.offsetWidth / 2, root.clientWidth / 2);
        const left = Math.min(root.clientWidth - half * 2, Math.max(0, center - half));
        const tracks = [
          [dial.tipLeft, left], [dial.tipRight, left + half * 2],
          [dial.left, selected.offsetLeft], [dial.right, selected.offsetLeft + selected.offsetWidth],
          [dial.tail, center],
        ] as const;
        for (const [track, target] of tracks) {
          if (inPlace) snap(track, target);
          else track.target = target;
        }
        if (direction) {
          const leading = direction > 0 ? [dial.tipRight, dial.right] : [dial.tipLeft, dial.left];
          const trailing = direction > 0 ? [dial.tipLeft, dial.left] : [dial.tipRight, dial.right];
          leading.forEach(track => { track.stiffness = 620; track.damping = 36; });
          trailing.forEach(track => { track.stiffness = 190; track.damping = 19; });
        }
        lastActive.current = active;
      }
      for (const node of labels) {
        const tool = node.dataset.tooltipLabel!;
        const track = dial.labels.get(tool) ?? {visibility: spring(0, 420, 32), direction: 0};
        dial.labels.set(tool, track);
        const visible = Number(tool === active);
        if (inPlace && selected) {
          snap(track.visibility, visible);
          track.direction = 0;
        } else if (selected && track.visibility.target !== visible) {
          track.direction = visible ? direction : -direction;
          track.visibility.target = visible;
        }
      }
      dial.opacity.target = Number(current >= 0);
      const axes = [dial.tipLeft, dial.tipRight, dial.tail, dial.left, dial.right, dial.opacity,
        ...labels.map(node => dial.labels.get(node.dataset.tooltipLabel!)!.visibility)];
      stop?.();
      stop = playSprings(axes, () => {
        const shown = Math.min(1.15, Math.max(0, dial.opacity.position));
        const width = Math.max(30, dial.tipRight.position - dial.tipLeft.position);
        const start = Math.min(Math.max(0, dial.tipLeft.position), Math.max(0, root.clientWidth - width));
        const tail = Math.max(start + 8, Math.min(start + width - 8, dial.tail.position));
        root.style.setProperty("--yg-tooltip-open", String(shown));
        root.style.setProperty("--yg-tooltip-left", `${start}px`);
        root.style.setProperty("--yg-tooltip-width", `${width}px`);
        root.style.setProperty("--yg-tooltip-tail", `${tail}px`);
        root.style.setProperty("--yg-tooltip-marker", `${dial.left.position}px`);
        root.style.setProperty("--yg-tooltip-marker-width", `${Math.max(0, dial.right.position - dial.left.position)}px`);
        labels.forEach(node => {
          const track = dial.labels.get(node.dataset.tooltipLabel!)!;
          const opacity = unit(track.visibility.position);
          node.style.setProperty("--yg-tooltip-copy", String(opacity));
          node.style.setProperty("--yg-tooltip-copy-x", `${track.direction * (1 - opacity) * 14}px`);
        });
      });
    };
    arrange();
    const resize = new ResizeObserver(arrange);
    resize.observe(root);
    labels.forEach(node => resize.observe(node));
    return () => { resize.disconnect(); stop?.(); };
  }, [active, dial, tools]);

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
