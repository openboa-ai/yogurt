"use client";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  Button
} from "./chunk-4IPCB3MM.js";
import {
  Icon,
  cx
} from "./chunk-GW3HPY4O.js";

// packages/web/src/controls/navigation.tsx
import { useLayoutEffect, useRef } from "react";
import { SegmentedControl as SDKSegment, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Tabs as SDKTabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

// packages/web/src/controls/tab-motion.ts
function animateTabMarker(marker, group, profile) {
  const dock = profile === "dock";
  const left = spring(0, dock ? 340 : 620, dock ? 28 : 40);
  const edge = spring(0, dock ? 340 : 170, dock ? 28 : 19);
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const tabs = /* @__PURE__ */ new Map();
  let active = null;
  let frame = 0, last = 0, y = 0;
  let motion = [left, edge];
  function measure() {
    if (!active) return;
    left.target = active.offsetLeft;
    edge.target = (dock ? 0 : active.offsetLeft) + active.offsetWidth;
    y = active.offsetTop;
    marker.style.setProperty("--yg-selection-height", `${active.offsetHeight}px`);
    marker.style.setProperty("--yg-selection-y", `${y}px`);
  }
  function paintLabels() {
    tabs.forEach(({ label, w, scale, full }, button) => {
      const fraction = Math.min(1, Math.max(0, w.position / Math.max(1, full)));
      label.style.setProperty("--yg-dock-label-width", `${Math.max(0, w.position)}px`);
      label.style.setProperty("--yg-dock-label-inset", `${8 * fraction}px`);
      label.style.setProperty("--yg-dock-label-opacity", String(Math.min(1, Math.max(0, fraction * 1.4 - 0.4))));
      button.style.setProperty("--yg-dock-icon-scale", String(scale.position));
    });
  }
  function paintMarker() {
    marker.style.setProperty("--yg-selection-x", `${left.position}px`);
    const width = dock ? edge.position : edge.position - left.position;
    marker.style.setProperty("--yg-selection-width", `${Math.max(0, width)}px`);
  }
  function tick(now) {
    const elapsed = (now - last) / 1e3;
    last = now;
    let other = false;
    if (dock) {
      other = advanceSprings(motion, elapsed);
      paintLabels();
      measure();
    }
    const moving = advanceSprings([left, edge], elapsed);
    paintMarker();
    frame = moving || other ? requestAnimationFrame(tick) : 0;
  }
  function refresh() {
    const next = group.querySelector(':scope > button[aria-selected="true"]');
    if (!next || !next.offsetWidth) {
      active = null;
      marker.removeAttribute("data-ready");
      return;
    }
    const last2 = active;
    const changed = next !== last2;
    if (dock) {
      tabs.forEach((_, button) => {
        if (!group.contains(button)) tabs.delete(button);
      });
      group.querySelectorAll(":scope > button").forEach((button) => {
        const label = button.querySelector(".yg-tab-label");
        const copy = label?.firstElementChild;
        if (!label || !copy) return;
        const tab = tabs.get(button) ?? { label, w: spring(0, 300, 26), scale: spring(1, 520, 14), full: 0 };
        tab.full = copy.getBoundingClientRect().width + 8;
        tab.w.target = button === next ? tab.full : 0;
        if (!last2 || media.matches) snap(tab.w, tab.w.target);
        if (changed && button === next && !media.matches) {
          tab.scale.position = 0.72;
          tab.scale.velocity = 6;
        }
        if (media.matches) snap(tab.scale, 1);
        tabs.set(button, tab);
      });
      motion = [...tabs.values()].flatMap((tab) => [tab.w, tab.scale]);
      paintLabels();
    }
    const previousRow = y;
    const direction = next.offsetLeft >= left.target;
    active = next;
    measure();
    if (!dock && changed) {
      const lead = direction ? edge : left, trail = direction ? left : edge;
      lead.stiffness = 620;
      lead.damping = 40;
      trail.stiffness = 170;
      trail.damping = 19;
    }
    if (media.matches || !last2 || previousRow !== y) {
      snap(left, left.target);
      snap(edge, edge.target);
      paintMarker();
    }
    marker.setAttribute("data-ready", "");
    marker.toggleAttribute("data-direct-motion", dock);
    if (media.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      lastFrame();
    }
  }
  function lastFrame() {
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  const mutations = new MutationObserver(refresh);
  mutations.observe(group, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-selected", "dir"] });
  const size = new ResizeObserver(refresh);
  size.observe(group);
  media.addEventListener("change", refresh);
  refresh();
  return () => {
    cancelAnimationFrame(frame);
    mutations.disconnect();
    size.disconnect();
    media.removeEventListener("change", refresh);
    marker.removeAttribute("data-direct-motion");
  };
}

// packages/web/src/controls/navigation.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Link(props) {
  return /* @__PURE__ */ jsx("a", { ...props, className: cx("yg-link", props.className) });
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
  items,
  current,
  label
}) {
  return /* @__PURE__ */ jsx("nav", { "aria-label": label, className: "yg-nav-list", children: items.map((o) => /* @__PURE__ */ jsx(
    "a",
    {
      href: o.href,
      "aria-current": o.id === current ? "page" : void 0,
      children: o.label
    },
    o.id
  )) });
}
function SelectionMarker({ selector, presentation }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const marker = ref.current;
    const group = marker?.parentElement;
    if (!marker || !group) return;
    if (presentation) return animateTabMarker(marker, group, presentation);
    let previous;
    const measure = (allowSlide) => {
      const button = group.querySelector(selector);
      if (!button?.offsetWidth || !button.offsetHeight) {
        marker.removeAttribute("data-ready");
        marker.removeAttribute("data-slide");
        previous = void 0;
        return;
      }
      const { offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height } = button;
      if (previous?.button === button && previous.x === x && previous.y === y && previous.width === width && previous.height === height) return;
      const switched = allowSlide && previous?.button !== button;
      const labelMoving = previous?.button === button && marker.hasAttribute("data-slide") && Boolean(button.querySelector(".yg-tab-label")?.getAnimations().length);
      const canSlide = previous?.y === y && (switched || labelMoving);
      if (canSlide && switched && previous) marker.toggleAttribute("data-forward", x >= previous.x);
      marker.toggleAttribute("data-slide", Boolean(canSlide));
      marker.style.setProperty("--yg-selection-x", `${x}px`);
      marker.style.setProperty("--yg-selection-y", `${y}px`);
      marker.style.setProperty("--yg-selection-width", `${width}px`);
      marker.style.setProperty("--yg-selection-height", `${height}px`);
      marker.setAttribute("data-ready", "");
      previous = { button, x, y, width, height };
    };
    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure(false));
    const observeSizes = () => {
      if (!sizes) return;
      sizes.disconnect();
      sizes.observe(group);
      group.querySelectorAll(":scope > button").forEach((button) => sizes.observe(button));
    };
    const changes = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeSizes();
      measure(true);
    });
    changes.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-selected", "data-state", "dir"]
    });
    observeSizes();
    measure(false);
    return () => {
      sizes?.disconnect();
      changes.disconnect();
    };
  }, [presentation, selector]);
  return /* @__PURE__ */ jsx("span", { ref, className: "yg-selection-marker", "aria-hidden": "true" });
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
        /* @__PURE__ */ jsx(SelectionMarker, { selector: ':scope > button[data-state="on"]' }),
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
          const next = {
            ArrowRight: (index + 1) % enabled.length,
            ArrowLeft: (index + enabled.length - 1) % enabled.length,
            Home: 0,
            End: enabled.length - 1
          }[event.key];
          if (next === void 0) return;
          event.preventDefault();
          const id = enabled[next].id;
          [...event.currentTarget.querySelectorAll('[role="tab"]')].find((tab) => tab.dataset.ygTabId === id)?.focus();
          onValueChange(id);
        }, children: [
          /* @__PURE__ */ jsx(SelectionMarker, { selector: ':scope > button[aria-selected="true"]', presentation }),
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
