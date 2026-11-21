"use client";
import {
  Button
} from "./chunk-LTCB3AU4.js";
import {
  Icon,
  cx
} from "./chunk-H36QHH35.js";

// packages/web/src/controls/navigation.tsx
import { SegmentedControl as SDKSegment, SegmentedControlItem, SegmentedControlIndicator } from "@ui-sdk/react/segmented-control";
import { Tabs as SDKTabs, TabsList, TabsPanel, TabsTab, TabsIndicator } from "@ui-sdk/react/tabs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Link({
  emphasis,
  size = "regular",
  className,
  children,
  ...props
}) {
  if (emphasis) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        ...props,
        className: cx("yg-button", "yg-action-link", className),
        "data-emphasis": emphasis,
        "data-control-size": size,
        children: /* @__PURE__ */ jsx("span", { className: "yg-button-label", children })
      }
    );
  }
  return /* @__PURE__ */ jsx("a", { ...props, className: cx("yg-link", className), children });
}
function Breadcrumb({
  items,
  label = "Breadcrumb"
}) {
  return /* @__PURE__ */ jsx("nav", { "aria-label": label, className: "yg-breadcrumb", children: /* @__PURE__ */ jsx("ol", { children: items.map((item, i) => /* @__PURE__ */ jsxs("li", { children: [
    i > 0 && /* @__PURE__ */ jsx(Icon, { name: "next" }),
    i === items.length - 1 ? /* @__PURE__ */ jsx("span", { "aria-current": "page", children: item.label }) : /* @__PURE__ */ jsx(Link, { href: item.href, children: item.label })
  ] }, item.id)) }) });
}
function NavigationList({
  id,
  items,
  current,
  currentKind = "page",
  label,
  orientation = "vertical",
  expanded
}) {
  return /* @__PURE__ */ jsx("nav", { id, "aria-label": label, className: "yg-nav-list", "data-orientation": orientation, "data-expanded": expanded, children: items.map((item) => /* @__PURE__ */ jsx(Link, { href: item.href, "aria-current": item.id === current ? currentKind : void 0, children: item.label }, item.id)) });
}
function SegmentedControl({
  label,
  options,
  value,
  onValueChange,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    SDKSegment,
    {
      className: "yg-segment",
      "aria-label": label,
      value,
      disabled,
      loop: false,
      onValueChange: (v) => {
        if (v) onValueChange(v);
      },
      children: [
        /* @__PURE__ */ jsx(SegmentedControlIndicator, { className: "yg-selection-marker", "data-ready": "", "aria-hidden": "true" }),
        options.map((o) => /* @__PURE__ */ jsx(
          SegmentedControlItem,
          {
            value: o.id,
            disabled: o.disabled,
            render: (props, state) => /* @__PURE__ */ jsx("button", { ...props, "data-state": state.checked ? "on" : "off" }),
            children: o.label
          },
          o.id
        ))
      ]
    }
  );
}
function Tabs({
  label,
  items,
  value,
  onValueChange,
  presentation = "pill"
}) {
  const enabled = items.filter((o) => !o.disabled);
  const selected = enabled.some((i) => i.id === value) ? value : enabled[0]?.id;
  return /* @__PURE__ */ jsxs(
    SDKTabs,
    {
      className: "yg-tabs",
      "data-presentation": presentation,
      value: selected ?? null,
      onValueChange: (id) => {
        if (id !== null) onValueChange(id);
      },
      children: [
        /* @__PURE__ */ jsxs(TabsList, { "aria-label": label, onKeyDownCapture: (event) => {
          const current = event.target.closest('[role="tab"]');
          if (!current || !event.currentTarget.contains(current) || !enabled.length || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          const index = enabled.findIndex((item) => item.id === current.dataset.ygTabId);
          if (index < 0) return;
          const step = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
          const next = {
            ArrowRight: (index + step + enabled.length) % enabled.length,
            ArrowLeft: (index - step + enabled.length) % enabled.length,
            Home: 0,
            End: enabled.length - 1
          }[event.key];
          if (next === void 0) return;
          event.preventDefault();
          const id = enabled[next].id;
          [...event.currentTarget.querySelectorAll('[role="tab"]')].find((tab) => tab.dataset.ygTabId === id)?.focus();
          onValueChange(id);
        }, children: [
          /* @__PURE__ */ jsx(TabsIndicator, { className: "yg-selection-marker", "data-ready": "", "aria-hidden": "true" }),
          items.map((o) => /* @__PURE__ */ jsx(
            TabsTab,
            {
              value: o.id,
              disabled: o.disabled,
              "data-yg-tab-id": o.id,
              onClick: () => {
                if (o.id === selected) onValueChange(o.id);
              },
              render: (props, state) => /* @__PURE__ */ jsx("button", { ...props, disabled: state.disabled }),
              children: o.icon ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Icon, { name: o.icon }),
                /* @__PURE__ */ jsx("span", { className: "yg-tab-label", children: /* @__PURE__ */ jsx("span", { children: o.label }) })
              ] }) : o.label
            },
            o.id
          ))
        ] }),
        items.map((o) => /* @__PURE__ */ jsx(TabsPanel, { value: o.id, keepMounted: true, tabIndex: 0, children: o.panel }, o.id))
      ]
    }
  );
}
function Pagination({
  page,
  pages,
  onPageChange,
  label = "Pages"
}) {
  if (pages < 1) return null;
  return /* @__PURE__ */ jsxs("nav", { "aria-label": label, className: "yg-inline", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        emphasis: "quiet",
        size: "compact",
        disabled: page <= 1,
        onClick: () => onPageChange(page - 1),
        children: "Previous"
      }
    ),
    /* @__PURE__ */ jsxs("span", { className: "yg-meta", "aria-live": "polite", children: [
      /* @__PURE__ */ jsx("span", { className: "yg-pagination-value", children: page }, page),
      " of ",
      pages
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        emphasis: "quiet",
        size: "compact",
        disabled: page >= pages,
        onClick: () => onPageChange(page + 1),
        children: "Next"
      }
    )
  ] });
}

export {
  Link,
  Breadcrumb,
  NavigationList,
  SegmentedControl,
  Tabs,
  Pagination
};
