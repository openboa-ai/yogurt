"use client";
import {
  Result
} from "./chunk-FUHQGU5Y.js";
import {
  Checkbox,
  SearchField
} from "./chunk-IWFGMSSX.js";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  Button
} from "./chunk-4A4FGE4R.js";

// packages/web/src/patterns/collections.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Count({ value, label }) {
  return /* @__PURE__ */ jsx("span", { className: "yg-count", "aria-label": value + " " + label, children: value });
}
function FilterBar({
  label = "Search records",
  query,
  onQueryChange,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "yg-filter", role: "search", "aria-label": label, children: [
    /* @__PURE__ */ jsx(SearchField, { label, value: query, onValueChange: onQueryChange }),
    children
  ] });
}
function List({
  label,
  children
}) {
  return /* @__PURE__ */ jsx("ul", { "aria-label": label, className: "yg-list", children });
}
function ListRow({
  title,
  description,
  leading,
  trailing,
  href,
  onActivate,
  current
}) {
  const contents = /* @__PURE__ */ jsxs(Fragment, { children: [
    leading && /* @__PURE__ */ jsx("span", { className: "yg-leading", children: leading }),
    /* @__PURE__ */ jsxs("span", { className: "yg-row-label", children: [
      title,
      description && /* @__PURE__ */ jsx("span", { className: "yg-help", children: description })
    ] }),
    trailing && /* @__PURE__ */ jsx("span", { className: "yg-trailing", children: trailing })
  ] });
  return /* @__PURE__ */ jsx("li", { children: href ? /* @__PURE__ */ jsx("a", { className: "yg-row", href, "aria-current": current || void 0, children: contents }) : onActivate ? /* @__PURE__ */ jsx("button", { type: "button", className: "yg-row", onClick: onActivate, "aria-current": current || void 0, children: contents }) : /* @__PURE__ */ jsx("div", { className: "yg-row", children: contents }) });
}
function SelectionList({
  label,
  options,
  selected,
  onValueChange
}) {
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    options.map((o) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: o.label,
        disabled: o.disabled,
        checked: selected.includes(o.id),
        onCheckedChange: (v) => onValueChange(
          v ? [.../* @__PURE__ */ new Set([...selected, o.id])] : selected.filter((id) => id !== o.id)
        )
      },
      o.id
    ))
  ] });
}
function EmptyResult({
  query,
  onClear,
  empty = words["state.empty"]
}) {
  return query ? /* @__PURE__ */ jsxs(
    Result,
    {
      title: words["state.no-matches"],
      action: onClear && /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onClear, children: words["action.clear-search"] }),
      children: [
        "No records match \u201C",
        query,
        "\u201D."
      ]
    }
  ) : /* @__PURE__ */ jsx(Result, { title: empty, children: "New records will appear here." });
}

export {
  Count,
  FilterBar,
  List,
  ListRow,
  SelectionList,
  EmptyResult
};
