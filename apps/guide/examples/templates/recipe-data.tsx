import { useState, type CSSProperties } from "react";
import * as Y from "@openboa/yogurt";
import { type Recipe } from "./recipes";

const observation = { source: "Sample records", asOf: "2026-11-21", timeLabel: "November 21" };
const facts: Record<string, [string, string][]> = {
  invoice: [["Invoice", "INV-024"], ["Due", "November 28"], ["Balance due", "$240.00"]],
  profile: [["Contributor", "Casey Lee"], ["Role", "Design engineer"], ["Team", "Studio"]],
  balance: [["Available today", "$1,480.00"], ["Pending", "$320.00"]],
  "card-details": [["Card", "•••• 0824"], ["Expires", "11/29"], ["Status", "Active"]],
};
const lists: Record<string, [string, string, string][]> = {
  payments: [["Visa ending in 0824", "Expires 11/29", "Default"], ["Bank account ending in 7016", "Operating account", ""]],
  upcoming: [["Hosting", "November 23", "$48"], ["Studio membership", "November 27", "$120"]],
  contributors: [["Casey Lee", "Components", "8 changes"], ["Avery Park", "Documentation", "5 changes"]],
  social: [["Studio profile", "Team information", ""], ["Release feed", "Product changes", ""], ["Community", "Events and discussions", ""]],
};

export function RecordRecipe({ recipe }: { recipe: Recipe }) {
  const { id, title } = recipe;
  if (id === "album") return <Y.Inline className="template-cover">
    <Y.ProjectMark project="yogurt" label="Field recordings cover" size={96} />
    <Y.Stack><Y.Heading level={3}>Field recordings</Y.Heading><Y.Text variant="help">OpenBoa Studio · 8 tracks</Y.Text></Y.Stack>
  </Y.Inline>;
  if (id === "transactions" || id === "releases") {
    const transaction = id === "transactions";
    const data = transaction
      ? [["Workspace renewal", "Nov 18", "$24.00"], ["File storage", "Nov 14", "$8.50"], ["Account credit", "Nov 8", "−$12.00"]]
      : [["Workspace 2.4", "Nov 21", "Published"], ["Workspace 2.3", "Nov 14", "Published"], ["Workspace 2.2", "Nov 3", "Archived"]];
    return <Y.DataTable caption={title}
      columns={[{ id: "name", label: transaction ? "Transaction" : "Version", sortValue: row => String(row.cells.name) },
        { id: "date", label: "Date" }, { id: "value", label: transaction ? "Amount" : "Status", numeric: transaction }]}
      rows={data.map(([name, date, value]) => ({ id: name, cells: { name, date, value } }))} />;
  }
  if (lists[id]) return <Y.List label={title}>{lists[id].map(([name, detail, value]) =>
    <Y.ListRow key={name} title={name} description={detail} trailing={value ? <Y.Text variant="meta">{value}</Y.Text> : undefined} />
  )}</Y.List>;
  return <Y.RecordFacts title={title} facts={facts[id].map(([label, value]) => ({ id: label, label, value }))} {...observation} />;
}

const metrics: Record<string, [string, string[], number[]]> = {
  "activity-history": ["contributions", ["Week 1", "Week 2", "Week 3", "Week 4"], [14, 12, 23, 26]],
  contributions: ["changes", ["Mon", "Tue", "Wed", "Thu", "Fri"], [4, 7, 3, 8, 6]],
  observability: ["ms", ["Mon", "Tue", "Wed", "Thu", "Fri"], [124, 142, 128, 116, 121]],
  "traffic-mix": ["%", ["Direct", "Search", "Referral", "Other"], [42, 31, 22, 5]],
  sleep: ["hours", ["Mon", "Tue", "Wed", "Thu", "Fri"], [7.5, 7, 8, 7.8, 8.1]],
  fitness: ["minutes", ["Mon", "Tue", "Wed", "Thu", "Fri"], [26, 34, 18, 41, 32]],
  analytics: ["items", ["Week 1", "Week 2", "Week 3", "Week 4"], [8, 14, 12, 26]],
  visitors: ["visits", ["Mon", "Tue", "Wed", "Thu", "Fri"], [82, 91, 84, 112, 121]],
  dividends: ["USD", ["Q1", "Q2", "Q3", "Q4"], [25, 28, 24, 35]],
  investment: ["%", ["Aug", "Sep", "Oct", "Nov"], [1.2, 1.4, 1.8, 2.1]],
  energy: ["kWh", ["Mon", "Tue", "Wed", "Thu", "Fri"], [11, 9, 12, 9.5, 10]],
  stock: ["USD", ["Mon", "Tue", "Wed", "Thu", "Fri"], [41, 46, 45, 47, 48]],
  signal: ["dB", ["08:00", "08:05", "08:10", "08:15", "08:20"], [24, 48, 32, 55, 27]],
  volume: ["requests", ["Search", "Export", "Review", "Sync"], [38, 18, 26, 15]],
};

export function MetricRecipe({ recipe }: { recipe: Recipe }) {
  const [period, setPeriod] = useState("current");
  const { id, title, components } = recipe;
  if (id === "usage") return <Y.Progress label="Storage used · 6.4 of 10 GB" value={64} />;
  if (id === "savings") return <Y.Progress label="Reserve fund · $1,480 of $2,000" value={1480} max={2000} />;
  if (id === "targets") return <Y.Stack gap={16}><Y.Progress label="Equipment" value={46} /><Y.Progress label="Team retreat" value={74} /><Y.Progress label="Learning budget" value={88} /></Y.Stack>;
  const [unit, labels, values] = metrics[id];
  const points = labels.map((label, index) => ({
    id: label, label, value: period === "current" ? values[index] : Math.round(values[index] * 7) / 10,
  }));
  if (id === "traffic-mix") {
    const total = points.reduce((sum, point) => sum + point.value, 0) || 100;
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;
    const segments = points.map((point, index) => {
      const fraction = point.value / total;
      const offset = -cumulative * circumference;
      cumulative += fraction;
      return {
        ...point,
        colorVar: `var(--donut-series-${index})`,
        length: fraction * circumference,
        offset,
      };
    });
    return <Y.Stack gap={12} className="template-donut-wrap">
      <div role="img" aria-label="Traffic sources by percentage" className="template-donut">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <g transform="rotate(-90 60 60)">
            {segments.map(({ id: segId, colorVar, length, offset }) => (
              <circle
                key={segId}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={colorVar}
                strokeWidth="16"
                strokeDasharray={`${length.toFixed(2)} ${circumference.toFixed(2)}`}
                strokeDashoffset={offset.toFixed(2)}
              />
            ))}
          </g>
        </svg>
      </div>
      <Y.List label="Traffic sources">{segments.map(({ id, label, value, colorVar }) =>
        <Y.ListRow key={id} title={label} leading={<span className="template-chart-key" style={{ backgroundColor: colorVar }} />}
          trailing={<Y.Text variant="meta">{value}%</Y.Text>} />
      )}</Y.List>
    </Y.Stack>;
  }
  return <Y.Stack gap={16}>
    <Y.Chart title={title} series={title} unit={unit} points={points} {...observation} />
    <Y.SegmentedControl label="Reporting period" options={[{ id: "current", label: "Current" }, { id: "previous", label: "Previous" }]} value={period} onValueChange={setPeriod} />
  </Y.Stack>;
}
