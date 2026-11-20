"use client";
import { useState, type ReactNode } from "react";
import { Icon } from "../foundation/foundation.js";

export function ExpandCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="yg-expand-card">
      <summary><span>{title}</span><span className="yg-card-disclosure"><Icon name="plus" /></span></summary>
      <div className="yg-expand-card-body">{children}</div>
    </details>
  );
}

type FanItem = { id: string; label: string; detail: string };
export function FanCards({ items }: { items: FanItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId);
  return (
    <div className="yg-fan-cards">
      <div className="yg-fan-cards-list" aria-label="Cards">
        {items.map(item => (
          <button key={item.id} type="button" aria-pressed={item.id === selected?.id}
            onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}>
            <span>{item.label}</span><Icon name="next" />
          </button>
        ))}
      </div>
      {selected && <p className="yg-fan-detail"><strong>{selected.label}</strong><span>{selected.detail}</span></p>}
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <section className="yg-stat-card" aria-label={label}>
      <span className="yg-stat-label">{label}</span>
      <strong className="yg-stat-value" key={value}>{value.toLocaleString()}</strong>
      {detail && <span className="yg-stat-detail">{detail}</span>}
    </section>
  );
}

export function ProfileCard({ name, detail, initials, children }: { name: string; detail: string; initials: string; children?: ReactNode }) {
  return (
    <section className="yg-profile-card">
      <div className="yg-profile-header">
        <span className="yg-profile-avatar" aria-hidden="true">{initials}</span>
        <div><strong>{name}</strong><p>{detail}</p></div>
      </div>
      {children != null && <details><summary>More about {name}</summary><div className="yg-profile-extra">{children}</div></details>}
    </section>
  );
}
