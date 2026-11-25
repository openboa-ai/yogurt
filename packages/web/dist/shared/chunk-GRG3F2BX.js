"use client";
import {
  Result
} from "./chunk-BG4OQ2LF.js";
import {
  Checkbox,
  SearchField
} from "./chunk-SBJ7U7LP.js";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  Button
} from "./chunk-BMOTQIAZ.js";
import {
  cx
} from "./chunk-XELXU7JZ.js";

// packages/web/src/patterns/collections.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Count({ value, label }) {
  return /* @__PURE__ */ jsx("span", { className: "yg-count", "aria-label": value + " " + label, children: value });
}
function FilterBar({
  label = "Search records",
  placeholder,
  query,
  onQueryChange,
  size = "regular",
  hiddenLabel = false,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "yg-filter", role: "search", "aria-label": label, children: [
    /* @__PURE__ */ jsx(
      SearchField,
      {
        label,
        placeholder: placeholder ?? (hiddenLabel ? label : void 0),
        hiddenLabel,
        size,
        value: query,
        onValueChange: onQueryChange
      }
    ),
    children
  ] });
}
function List({
  label,
  divided = false,
  className,
  children
}) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "aria-label": label,
      className: cx("yg-list", className),
      "data-divided": divided || void 0,
      children
    }
  );
}
function ListRow({
  title,
  inlineMeta,
  description,
  leading,
  value,
  actions,
  trailing,
  separator = false,
  href,
  onActivate,
  current,
  className
}) {
  const hasSiblingEnd = Boolean(value || actions);
  const labelSlot = /* @__PURE__ */ jsxs("span", { className: "yg-row-label", children: [
    /* @__PURE__ */ jsxs("span", { className: "yg-row-title-line", children: [
      /* @__PURE__ */ jsx("span", { className: "yg-row-title", children: title }),
      inlineMeta && /* @__PURE__ */ jsx("span", { className: "yg-row-inline-meta", children: inlineMeta })
    ] }),
    description && /* @__PURE__ */ jsx("span", { className: "yg-help", children: description })
  ] });
  const mainContents = /* @__PURE__ */ jsxs(Fragment, { children: [
    leading && /* @__PURE__ */ jsx("span", { className: "yg-leading", children: leading }),
    labelSlot,
    !hasSiblingEnd && trailing && /* @__PURE__ */ jsx("span", { className: "yg-trailing", children: trailing })
  ] });
  const endSlots = hasSiblingEnd || trailing && hasSiblingEnd ? /* @__PURE__ */ jsxs("span", { className: "yg-row-end", children: [
    value && /* @__PURE__ */ jsx("span", { className: "yg-row-value", children: value }),
    trailing && /* @__PURE__ */ jsx("span", { className: "yg-trailing", children: trailing }),
    actions && /* @__PURE__ */ jsx("span", { className: "yg-row-actions", children: actions })
  ] }) : null;
  if ((href || onActivate) && hasSiblingEnd) {
    return /* @__PURE__ */ jsx("li", { className: cx("yg-list-item", className), "data-separator": separator || void 0, children: /* @__PURE__ */ jsxs("div", { className: "yg-row yg-row-split", "data-current": current || void 0, children: [
      href ? /* @__PURE__ */ jsx("a", { className: "yg-row-trigger", href, "aria-current": current || void 0, children: mainContents }) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "yg-row-trigger",
          onClick: onActivate,
          "aria-current": current || void 0,
          children: mainContents
        }
      ),
      endSlots
    ] }) });
  }
  return /* @__PURE__ */ jsx("li", { className: cx("yg-list-item", className), "data-separator": separator || void 0, children: href ? /* @__PURE__ */ jsx("a", { className: "yg-row", href, "aria-current": current || void 0, children: mainContents }) : onActivate ? /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "yg-row",
      onClick: onActivate,
      "aria-current": current || void 0,
      children: mainContents
    }
  ) : /* @__PURE__ */ jsxs("div", { className: "yg-row", "data-current": current || void 0, children: [
    mainContents,
    endSlots
  ] }) });
}
function SelectionList({
  label,
  options,
  selected,
  onValueChange,
  selectAllLabel
}) {
  const enabled = options.filter((o) => !o.disabled);
  const chosen = enabled.filter((o) => selected.includes(o.id));
  const all = enabled.length > 0 && chosen.length === enabled.length;
  const masterState = all ? true : chosen.length > 0 ? "indeterminate" : false;
  return /* @__PURE__ */ jsxs("fieldset", { className: "yg-fieldset yg-selection-list", children: [
    /* @__PURE__ */ jsx("legend", { className: "yg-label", children: label }),
    selectAllLabel && /* @__PURE__ */ jsx("div", { className: "yg-selection-list-all", children: /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: selectAllLabel,
        disabled: !enabled.length,
        checked: masterState,
        onCheckedChange: () => {
          const keys = new Set(selected);
          for (const option of enabled) {
            if (all) keys.delete(option.id);
            else keys.add(option.id);
          }
          onValueChange([...keys]);
        }
      }
    ) }),
    options.map((o) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: o.label,
        disabled: o.disabled,
        checked: selected.includes(o.id),
        onCheckedChange: (v) => onValueChange(
          v === true ? [.../* @__PURE__ */ new Set([...selected, o.id])] : selected.filter((id) => id !== o.id)
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
