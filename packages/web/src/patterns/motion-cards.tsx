"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../foundation/foundation.js";
import { DisclosureRow } from "../controls/layers.js";

export function ExpandCard({ title, children }: { title: string; children: ReactNode }) {
  const card = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const root = card.current;
    if (!root) return;
    root.style.setProperty("--yg-card-expansion", String(Number(open)));
    root.style.setProperty("--yg-card-content", String(Number(open)));
  }, [open]);
  return (
    <details ref={card} className="yg-expand-card" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary><span className="yg-expand-art" aria-hidden="true" /><span className="yg-expand-title">{title}</span><span className="yg-card-disclosure"><Icon name="plus" /></span></summary>
      <div className="yg-expand-card-body">{children}</div>
    </details>
  );
}

type FanItem = { id: string; label: string; detail: string };
export function FanCards({ items }: { items: FanItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const selected = items.find((item) => item.id === selectedId);
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = list.current;
    if (!root || items.length > 3) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-card]"));
    const active = pointer || keyboard;
    const rows = buttons.map((button,index) => {
      const id = button.dataset.card!;
      const featured = highlight ?? selectedId ?? items[Math.floor(items.length / 2)]?.id;
      const hot = active && id === featured;
      button.toggleAttribute("data-front", id === featured);
      button.style.zIndex = id === featured ? "5" : index === 1 ? "3" : "2";
      return {button, hot, index:index - (items.length-1)/2};
    });
    const render = () => {
      const width = root.offsetWidth;
      const room = Math.min(66, Math.max(0, (width - 208) / 2));
      const angle = 9;
      rows.forEach(({button,hot,index}) => {
        const x = index * (active ? room : 6);
        const y = Math.abs(index) * (active ? 12 : 0) + (hot ? -22 : 0);
        button.style.setProperty("--yg-fan-transform", `translate(calc(-50% + ${x}px), ${y}px) rotate(${index * (3 + (active ? angle : 0))}deg) scale(${hot ? 1.06 : 1})`);
      });
    };
    render();
    const sizes = new ResizeObserver(render);
    sizes.observe(root);
    return () => sizes.disconnect();
  }, [highlight, items, keyboard, pointer, selectedId]);
  return (
    <div className="yg-fan-cards">
      <div className="yg-fan-cards-list" ref={list} aria-label="Cards" data-many={items.length > 3 || undefined}
        onPointerEnter={() => setPointer(true)}
        onPointerLeave={() => { setPointer(false); setHighlight(null); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboard(false); }}>
        {items.map((item, index) => (
          <button key={item.id} type="button" data-card={item.id}
            style={{ "--yg-fan-offset": index - (items.length - 1) / 2 } as CSSProperties} aria-pressed={item.id === selected?.id}
            onPointerEnter={() => setHighlight(item.id)}
            onFocus={event => { if (event.currentTarget.matches(":focus-visible")) { setKeyboard(true); setHighlight(item.id); } }}
            onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}>
            <span className="yg-fan-art" aria-hidden="true" /><span className="yg-fan-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="yg-fan-label">{item.label}</span><Icon name="next" />
          </button>
        ))}
      </div>
      {selected && <p className="yg-fan-detail"><strong>{selected.label}</strong><span>{selected.detail}</span></p>}
    </div>
  );
}

function StatSeries({ values }: { values: readonly number[] }) {
  const stroke = useRef<SVGPathElement>(null), fill = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  useLayoutEffect(() => {
    const safe = values.map(value => Number.isFinite(value) ? value : 0);
    if (!safe.length) return;
    const coordinates = safe.map((position, i) => [
      4 + i / Math.max(1, safe.length - 1) * 288,
      8 + (1 - Math.min(1.05, Math.max(-.05,position))) * 80,
    ]);
    let curve = `M${coordinates[0].join(" ")}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const a = coordinates[i - 1] ?? coordinates[i], b = coordinates[i];
      const c = coordinates[i + 1], d = coordinates[i + 2] ?? c;
      const first = b.map((value,axis) => value + (c[axis]-a[axis])/6);
      const second = c.map((value,axis) => value - (d[axis]-b[axis])/6);
      curve += ` C${first.join(" ")} ${second.join(" ")} ${c.join(" ")}`;
    }
    const last = coordinates[coordinates.length-1];
    stroke.current?.setAttribute("d",curve);
    fill.current?.setAttribute("d",`${curve} L${last[0]} 96 L4 96 Z`);
    dot.current?.setAttribute("cx",String(last[0]));
    dot.current?.setAttribute("cy",String(last[1]));
  },[values]);
  return <svg viewBox="0 0 296 96" className="yg-stat-series" aria-hidden="true">
    <path ref={fill} className="yg-stat-area" />
    <path ref={stroke} className="yg-stat-line" />
    <circle ref={dot} r="4" />
  </svg>;
}

export function StatCard({ label, value, detail, series }: {
  label: string; value: number; detail?: string; series?: readonly number[];
}) {
  return (
    <section className="yg-stat-card" aria-label={label}>
      <div className="yg-stat-heading"><div><span className="yg-stat-label">{label}</span>
        <strong className="yg-stat-value">{value.toLocaleString()}</strong></div>
        {detail && <span className="yg-stat-detail">{detail}</span>}
      </div>
      {series && series.length > 1 && <StatSeries values={series} />}
    </section>
  );
}

export function ProfileCard({ name, detail, initials, children, actions }: { name: string; detail: string; initials: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="yg-profile-card">
      <div className="yg-profile-header">
        <span className="yg-profile-avatar" aria-hidden="true">{initials}</span>
        <div><strong>{name}</strong><p>{detail}</p></div>
      </div>
      {children != null && <DisclosureRow label={`More about ${name}`}><div className="yg-profile-extra">{children}</div></DisclosureRow>}
      {actions}
    </section>
  );
}
