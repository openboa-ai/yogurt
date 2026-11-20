"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../foundation/foundation.js";
import { advanceSprings, playSprings, snap, spring } from "../foundation/spring-motion.js";

export function ExpandCard({ title, children }: { title: string; children: ReactNode }) {
  const card = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [motion] = useState(() => ({shape: spring(0,240,21), copy: spring(0,260,28)}));
  useLayoutEffect(() => {
    const root = card.current;
    if (!root) return;
    motion.shape.target = Number(open);
    if (!open) motion.copy.target = 0;
    const paint = () => {
      root.style.setProperty("--yg-card-expansion", String(motion.shape.position));
      root.style.setProperty("--yg-card-content", String(motion.copy.position));
    };
    const states = Object.values(motion);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open && reduced) motion.copy.target = 1;
    let stop = playSprings(states, paint);
    const reveal = open && !reduced ? setTimeout(() => {
      motion.copy.target = 1;
      stop();
      stop = playSprings(states, paint);
    }, 160) : undefined;
    return () => { clearTimeout(reveal); stop(); };
  }, [motion, open]);
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
  const [spread] = useState(() => spring(0,220,18));
  const tracks = useRef(new Map<string, {lift: ReturnType<typeof spring>; scale: ReturnType<typeof spring>}>());
  const kick = useRef<string | null>(null);
  useLayoutEffect(() => {
    const root = list.current;
    if (!root || items.length > 3) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-card]"));
    const active = pointer || keyboard;
    spread.target = Number(active);
    const states = [spread];
    const live = new Set(items.map(item => item.id));
    tracks.current.forEach((_, id) => { if (!live.has(id)) tracks.current.delete(id); });
    const rows = buttons.map((button,index) => {
      const id = button.dataset.card!;
      const tracksForCard = tracks.current.get(id) ?? {lift:spring(0,420,20),scale:spring(1,420,22)};
      const hot = active && id === highlight;
      tracksForCard.lift.target = hot ? -22 : 0;
      tracksForCard.scale.target = hot ? 1.06 : 1;
      if (id === kick.current) tracksForCard.lift.velocity = -260;
      states.push(tracksForCard.lift, tracksForCard.scale);
      tracks.current.set(id, tracksForCard);
      button.style.zIndex = hot ? "5" : index === 1 ? "3" : "2";
      return {button, tracks:tracksForCard, index:index - (items.length-1)/2};
    });
    kick.current = null;
    const render = () => {
      const room = Math.min(78, Math.max(24, (root.offsetWidth - 166) / 2));
      rows.forEach(({button,tracks,index}) => {
        const x = index * (6 + spread.position * (room - 6));
        const y = Math.abs(index) * spread.position * 12 + tracks.lift.position;
        button.style.setProperty("--yg-fan-transform", `translate(calc(-50% + ${x}px), ${y}px) rotate(${index*(3+spread.position*9)}deg) scale(${tracks.scale.position})`);
      });
    };
    let stop = playSprings(states, render);
    const sizes = new ResizeObserver(() => { stop(); stop = playSprings(states, render); });
    sizes.observe(root);
    return () => { sizes.disconnect(); stop(); };
  }, [highlight, items, keyboard, pointer, selectedId, spread]);
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
            onClick={() => { kick.current=item.id; setSelectedId(item.id === selectedId ? null : item.id); }}>
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
  const axes = useRef<ReturnType<typeof spring>[]>([]);
  useLayoutEffect(() => {
    const safe = values.map(value => Number.isFinite(value) ? value : 0);
    if (axes.current.length !== safe.length) axes.current = safe.map(value => spring(value,200,17));
    const points = axes.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    function paint() {
      if (!points.length) return;
      const coordinates = points.map(({position}, i) => [
        4 + i / Math.max(1, points.length - 1) * 288,
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
    }
    let frame = 0, previous = performance.now(), start = previous;
    function tick(time: number) {
      let waiting = false;
      points.forEach((point,index) => {
        if (time-start < index*30) waiting = true;
        else point.target = safe[index];
      });
      const moving = advanceSprings(points,(time-previous)/1000);
      previous = time;
      paint();
      if (moving || waiting) frame = requestAnimationFrame(tick);
      else frame = 0;
    }
    function sync() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        points.forEach((point, index) => snap(point,safe[index]));
        paint();
      } else {
        paint();
        start = previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    sync();
    media.addEventListener("change",sync);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change",sync); };
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
  const total = useRef<HTMLElement>(null);
  const [motion] = useState(() => spring(value,160,22));
  useLayoutEffect(() => {
    motion.target = value;
    if (!Number.isFinite(value) || !Number.isFinite(motion.position)) {
      snap(motion, value);
      return;
    }
    return playSprings([motion], () => {
      if (total.current) total.current.textContent = (Number.isInteger(value) ? Math.round(motion.position) : Math.round(motion.position*10)/10).toLocaleString();
    });
  },[motion,value]);
  return (
    <section className="yg-stat-card" aria-label={label}>
      <div className="yg-stat-heading"><div><span className="yg-stat-label">{label}</span>
        <strong className="yg-stat-value" ref={total}>{value.toLocaleString()}</strong></div>
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
      {children != null && <details><summary>More about {name}</summary><div className="yg-profile-extra">{children}</div></details>}
      {actions}
    </section>
  );
}
