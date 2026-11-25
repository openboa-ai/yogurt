"use client";
import {
  Heading,
  Stack
} from "./chunk-XELXU7JZ.js";

// packages/web/src/controls/data.tsx
import { useId, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function RecordFacts({
  title,
  facts,
  source,
  asOf,
  timeLabel
}) {
  return /* @__PURE__ */ jsxs("section", { className: "yg-facts", children: [
    title && /* @__PURE__ */ jsx(Heading, { level: 3, children: title }),
    /* @__PURE__ */ jsx("dl", { children: facts.map((f) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("dt", { children: f.label }),
      /* @__PURE__ */ jsxs("dd", { children: [
        f.value,
        f.unit ? " " + f.unit : ""
      ] })
    ] }, f.id)) }),
    /* @__PURE__ */ jsxs("p", { className: "yg-meta", children: [
      source,
      " \xB7 ",
      /* @__PURE__ */ jsx("time", { dateTime: asOf, children: timeLabel ?? asOf })
    ] })
  ] });
}
function Table({
  caption,
  children
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "yg-table-scroll",
      role: "region",
      "aria-label": caption,
      tabIndex: 0,
      children: /* @__PURE__ */ jsxs("table", { className: "yg-table", children: [
        /* @__PURE__ */ jsx("caption", { children: caption }),
        children
      ] })
    }
  );
}
function DataTable({
  caption,
  columns,
  rows
}) {
  const [sort, setSort] = useState();
  const valueOf = columns.find((column) => column.id === sort?.id)?.sortValue;
  const ordered = valueOf && sort ? [...rows].sort((a, b) => {
    const x = valueOf(a);
    const y = valueOf(b);
    if (x == null) return y == null ? 0 : 1;
    if (y == null) return -1;
    const comparison = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "en", { numeric: true });
    return sort.descending ? -comparison : comparison;
  }) : rows;
  const colMeta = (c) => {
    const isNumeric = c.numeric ?? c.kind === "numeric";
    const align = c.align ?? (isNumeric || c.kind === "actions" ? "end" : "start");
    return { isNumeric, align };
  };
  return /* @__PURE__ */ jsxs(Table, { caption, children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((c) => {
      const { isNumeric, align } = colMeta(c);
      return /* @__PURE__ */ jsx(
        "th",
        {
          scope: "col",
          "data-kind": c.kind,
          "data-align": align,
          "data-numeric": isNumeric || void 0,
          "aria-sort": sort?.id === c.id && c.sortValue ? sort.descending ? "descending" : "ascending" : void 0,
          children: c.sortValue ? /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "yg-table-sort",
              onClick: () => setSort((last) => ({
                id: c.id,
                descending: last?.id === c.id && !last.descending
              })),
              children: [
                c.label,
                /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: sort?.id === c.id ? sort.descending ? "\u2193" : "\u2191" : "\u2195" })
              ]
            }
          ) : c.label
        },
        c.id
      );
    }) }) }),
    /* @__PURE__ */ jsx("tbody", { children: ordered.map((r) => /* @__PURE__ */ jsx("tr", { children: columns.map((c) => {
      const { isNumeric, align } = colMeta(c);
      return /* @__PURE__ */ jsx(
        "td",
        {
          "data-kind": c.kind,
          "data-align": align,
          "data-numeric": isNumeric || void 0,
          children: r.cells[c.id] ?? "No reading"
        },
        c.id
      );
    }) }, r.id)) })
  ] });
}
function Legend({ label }) {
  return /* @__PURE__ */ jsxs("span", { className: "yg-legend", children: [
    /* @__PURE__ */ jsx("i", { "aria-hidden": "true" }),
    label
  ] });
}
function Chart({
  title,
  series,
  unit,
  points,
  source,
  asOf,
  timeLabel
}) {
  const id = useId();
  const numeric = points.flatMap(
    (p) => p.value !== null && Number.isFinite(p.value) ? [p.value] : []
  );
  const lower = numeric.reduce((minimum, value) => Math.min(minimum, value), 0);
  const upper = numeric.reduce((maximum, value) => Math.max(maximum, value), 0);
  const magnitude = Math.max(1, Math.abs(lower), Math.abs(upper));
  const scaledLower = lower / magnitude;
  const range = upper / magnitude - scaledLower || 1;
  const xy = (v, i) => [
    8 + 224 * i / Math.max(1, points.length - 1),
    67 - 60 * (v / magnitude - scaledLower) / range
  ];
  const interior = points.slice(1, -1);
  const missingIndex = interior.findIndex((point) => point.value === null || !Number.isFinite(point.value));
  const tickIndex = (missingIndex < 0 ? Math.floor(interior.length / 2) : missingIndex) + 1;
  const tick = points.length > 2 ? points[tickIndex] : void 0;
  let path = "", start = true;
  const dots = [];
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
  return /* @__PURE__ */ jsxs("figure", { className: "yg-chart", "aria-labelledby": id, children: [
    /* @__PURE__ */ jsxs("figcaption", { id, children: [
      /* @__PURE__ */ jsx(Heading, { level: 3, children: title }),
      /* @__PURE__ */ jsx(Legend, { label: series + " (" + unit + ")" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "yg-chart-plot", children: [
      /* @__PURE__ */ jsx("div", { className: "yg-chart-scale", "aria-hidden": "true", children: numeric.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { children: upper }),
        /* @__PURE__ */ jsx("span", { children: lower })
      ] }) }),
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 240 76", preserveAspectRatio: "none", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("g", { className: "yg-chart-grid", children: /* @__PURE__ */ jsx("path", { d: "M8 7H232 M8 37H232 M8 67H232", vectorEffect: "non-scaling-stroke" }) }),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: "yg-chart-line",
            d: path,
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            vectorEffect: "non-scaling-stroke"
          }
        ),
        dots.map((p) => /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "0.15", className: "yg-chart-point", vectorEffect: "non-scaling-stroke" }, p.id))
      ] }),
      numeric.length === 0 && /* @__PURE__ */ jsx("span", { className: "yg-chart-empty", children: "No readings" }),
      /* @__PURE__ */ jsx("div", { className: "yg-chart-range", "data-dense": points.length <= 7 || void 0, "aria-hidden": "true", children: points.length <= 7 && numeric.length > 0 ? points.map((point, index) => {
        const isMissing = point.value === null || !Number.isFinite(point.value);
        const isInteriorTarget = index === tickIndex && tick;
        return /* @__PURE__ */ jsxs(
          "span",
          {
            className: isInteriorTarget ? "yg-chart-interior-tick yg-chart-tick" : "yg-chart-tick",
            style: isInteriorTarget ? { "--yg-chart-tick-position": `${100 * xy(0, index)[0] / 240}%` } : void 0,
            children: [
              point.label,
              isMissing && /* @__PURE__ */ jsx("small", { children: "No reading" })
            ]
          },
          point.id
        );
      }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { children: points[0]?.label }),
        tick && numeric.length > 0 && /* @__PURE__ */ jsxs("span", { className: "yg-chart-interior-tick", style: {
          "--yg-chart-tick-position": `${100 * xy(0, tickIndex)[0] / 240}%`
        }, children: [
          tick.label,
          missingIndex >= 0 && /* @__PURE__ */ jsx("small", { children: "No reading" })
        ] }),
        /* @__PURE__ */ jsx("span", { children: points.length > 1 ? points.at(-1)?.label : void 0 })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "yg-meta", children: [
      source,
      " \xB7 ",
      /* @__PURE__ */ jsx("time", { dateTime: asOf, children: timeLabel ?? asOf })
    ] }),
    /* @__PURE__ */ jsxs("details", { children: [
      /* @__PURE__ */ jsx("summary", { children: "View readings" }),
      /* @__PURE__ */ jsx(Stack, { children: /* @__PURE__ */ jsx(
        DataTable,
        {
          caption: series,
          columns: [
            { id: "time", label: "Time" },
            { id: "value", label: unit, numeric: true }
          ],
          rows: points.map((p) => ({
            id: p.id,
            cells: {
              time: p.label,
              value: p.value !== null && Number.isFinite(p.value) ? p.value : "No reading"
            }
          }))
        }
      ) })
    ] })
  ] });
}

export {
  RecordFacts,
  Table,
  DataTable,
  Legend,
  Chart
};
