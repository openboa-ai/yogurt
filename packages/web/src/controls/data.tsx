import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Heading, Stack } from "../foundation/foundation.js";

export interface Fact {
  id: string;
  label: string;
  value: ReactNode;
  unit?: string;
}
export interface Observation {
  source: string;
  asOf: string;
  timeLabel?: string;
}
export function RecordFacts({
  title,
  facts,
  source,
  asOf,
  timeLabel,
}: Observation & { title: string; facts: Fact[] }) {
  return (
    <section className="yg-facts">
      <Heading level={3}>{title}</Heading>
      <dl>
        {facts.map((f) => (
          <div key={f.id}>
            <dt>{f.label}</dt>
            <dd>
              {f.value}
              {f.unit ? " " + f.unit : ""}
            </dd>
          </div>
        ))}
      </dl>
      <p className="yg-meta">
        {source} · <time dateTime={asOf}>{timeLabel ?? asOf}</time>
      </p>
    </section>
  );
}
export interface DataColumn {
  id: string;
  label: string;
  numeric?: boolean;
  sortValue?: (row: DataRow) => string | number | null | undefined;
}
export interface DataRow {
  id: string;
  cells: Record<string, ReactNode>;
}
export function Table({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <div
      className="yg-table-scroll"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="yg-table">
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: DataColumn[];
  rows: DataRow[];
}) {
  const [sort, setSort] = useState<{ id: string; descending: boolean }>();
  const valueOf = columns.find((column) => column.id === sort?.id)?.sortValue;
  const ordered =
    valueOf && sort
      ? [...rows].sort((a, b) => {
          const x = valueOf(a);
          const y = valueOf(b);
          if (x == null) return y == null ? 0 : 1;
          if (y == null) return -1;
          const comparison =
            typeof x === "number" && typeof y === "number"
              ? x - y
              : String(x).localeCompare(String(y), "en", { numeric: true });
          return sort.descending ? -comparison : comparison;
        })
      : rows;
  return (
    <Table caption={caption}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.id}
              scope="col"
              data-numeric={c.numeric}
              aria-sort={
                sort?.id === c.id && c.sortValue
                  ? sort.descending
                    ? "descending"
                    : "ascending"
                  : undefined
              }
            >
              {c.sortValue ? (
                <button
                  type="button"
                  className="yg-table-sort"
                  onClick={() =>
                    setSort((last) => ({
                      id: c.id,
                      descending: last?.id === c.id && !last.descending,
                    }))
                  }
                >
                  {c.label}
                  <span aria-hidden="true">
                    {sort?.id === c.id ? (sort.descending ? "↓" : "↑") : "↕"}
                  </span>
                </button>
              ) : (
                c.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ordered.map((r) => (
          <tr key={r.id}>
            {columns.map((c) => (
              <td key={c.id} data-numeric={c.numeric}>
                {r.cells[c.id] ?? "No reading"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
export function Legend({ label }: { label: string }) {
  return (
    <span className="yg-legend">
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
export interface Reading {
  id: string;
  label: string;
  value: number | null;
}
export function Chart({
  title,
  series,
  unit,
  points,
  source,
  asOf,
  timeLabel,
}: Observation & {
  title: string;
  series: string;
  unit: string;
  points: Reading[];
}) {
  const id = useId();
  const numeric = points.flatMap((p) =>
    p.value !== null && Number.isFinite(p.value) ? [p.value] : [],
  );
  const lower = numeric.reduce((minimum, value) => Math.min(minimum, value), 0);
  const upper = numeric.reduce((maximum, value) => Math.max(maximum, value), 0);
  // Normalize first so that a finite positive and negative bound cannot overflow
  // when computing the chart's domain.
  const magnitude = Math.max(1, Math.abs(lower), Math.abs(upper));
  const scaledLower = lower / magnitude;
  const range = upper / magnitude - scaledLower || 1;
  const xy = (v: number, i: number) => [
    8 + (224 * i) / Math.max(1, points.length - 1),
    67 - (60 * (v / magnitude - scaledLower)) / range,
  ];
  const interior = points.slice(1, -1);
  const missingIndex = interior.findIndex(point => point.value === null || !Number.isFinite(point.value));
  const tickIndex = (missingIndex < 0 ? Math.floor(interior.length / 2) : missingIndex) + 1;
  const tick = points.length > 2 ? points[tickIndex] : undefined;
  let path = "",
    start = true;
  const dots: { id: string; x: number; y: number }[] = [];
  points.forEach((p, i) => {
    if (p.value === null || !Number.isFinite(p.value)) {
      start = true;
      return;
    }
    const [x, y] = xy(p.value, i);
    path += (start ? "M" : "L") + x + " " + y + " ";
    start = false;
    dots.push({ id: p.id, x, y });
  });
  return (
    <figure className="yg-chart" aria-labelledby={id}>
      <figcaption id={id}>
        <Heading level={3}>{title}</Heading>
        <Legend label={series + " (" + unit + ")"} />
      </figcaption>
      <div className="yg-chart-plot">
        <div className="yg-chart-scale" aria-hidden="true">
          {numeric.length > 0 && <><span>{upper}</span><span>{lower}</span></>}
        </div>
        <svg viewBox="0 0 240 76" preserveAspectRatio="none" aria-hidden="true">
          <g className="yg-chart-grid">
            <path d="M8 7H232 M8 37H232 M8 67H232" vectorEffect="non-scaling-stroke" />
          </g>
          <path
            className="yg-chart-line"
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {dots.map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r="0.15" className="yg-chart-point" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {numeric.length === 0 && <span className="yg-chart-empty">No readings</span>}
        <div className="yg-chart-range" aria-hidden="true">
          <span>{points[0]?.label}</span>
          {tick && numeric.length > 0 && (
            <span className="yg-chart-interior-tick" style={{
              "--yg-chart-tick-position": `${100 * xy(0, tickIndex)[0] / 240}%`,
            } as CSSProperties}>
              {tick.label}
              {missingIndex >= 0 && <small>No reading</small>}
            </span>
          )}
          <span>{points.length > 1 ? points.at(-1)?.label : undefined}</span>
        </div>
      </div>
      <p className="yg-meta">
        {source} · <time dateTime={asOf}>{timeLabel ?? asOf}</time>
      </p>
      <details>
        <summary>View readings</summary>
        <Stack>
          <DataTable
            caption={series}
            columns={[
              { id: "time", label: "Time" },
              { id: "value", label: unit, numeric: true },
            ]}
            rows={points.map((p) => ({
              id: p.id,
              cells: {
                time: p.label,
                value:
                  p.value !== null && Number.isFinite(p.value)
                    ? p.value
                    : "No reading",
              },
            }))}
          />
        </Stack>
      </details>
    </figure>
  );
}
