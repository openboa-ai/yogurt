"use client";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";
import {
  dist_exports12 as dist_exports
} from "./chunk-4T4N3D6L.js";
import {
  Button,
  clsx_default,
  handlePressableMouseEnter,
  useResizeObserver,
  waitForAnimationFrame
} from "./chunk-ZKE52UUY.js";
import {
  Icon,
  cx
} from "./chunk-6UUZC5QN.js";

// packages/web/src/controls/navigation.tsx
import { useId, useLayoutEffect as useLayoutEffect2, useRef as useRef2 } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/SegmentedControl/SegmentedControl.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef } from "react";

// node_modules/@openai/apps-sdk-ui/dist/es/components/SegmentedControl/SegmentedControl.module.css
var SegmentedControl_default = { "SegmentedControl": "yg-sdk-SegmentedControl-SegmentedControl", "SegmentedControlOption": "yg-sdk-SegmentedControl-SegmentedControlOption", "SegmentedControlThumb": "yg-sdk-SegmentedControl-SegmentedControlThumb" };

// node_modules/@openai/apps-sdk-ui/dist/es/components/SegmentedControl/SegmentedControl.js
var SegmentedControl = ({ value, onChange, children, block, pill = true, size = "md", gutterSize, className, onClick, ...restProps }) => {
  const rootRef = useRef(null);
  const thumbRef = useRef(null);
  const applyThumbSizing = useCallback((attemptScroll) => {
    const root = rootRef.current;
    const thumb = thumbRef.current;
    if (!root || !thumb) {
      return;
    }
    const activeNode = root?.querySelector('[data-state="on"]');
    if (!activeNode) {
      return;
    }
    const rootWidth = root.clientWidth;
    let targetWidth = Math.floor(activeNode.clientWidth);
    const targetOffset = activeNode.offsetLeft;
    if (rootWidth - (targetWidth + targetOffset) < 2) {
      targetWidth = targetWidth - 1;
    }
    thumb.style.width = `${Math.floor(targetWidth)}px`;
    thumb.style.transform = `translateX(${targetOffset}px)`;
    if (root.scrollWidth > rootWidth) {
      const buffer = rootWidth * 0.15;
      const scrollLeft = root.scrollLeft;
      const left = activeNode.offsetLeft;
      const right = left + targetWidth;
      if (left < scrollLeft + buffer || right > scrollLeft + rootWidth - buffer) {
        if (attemptScroll) {
          activeNode.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      }
    }
  }, []);
  useResizeObserver({
    // @ts-expect-error(2322) -- bug in types: https://github.com/juliencrn/usehooks-ts/issues/663
    ref: rootRef,
    onResize: () => {
      const thumb = thumbRef.current;
      if (!thumb) {
        return;
      }
      const currentTransition = thumb.style.transition;
      thumb.style.transition = "";
      applyThumbSizing(false);
      thumb.style.transition = currentTransition;
    }
  });
  useLayoutEffect(() => {
    const root = rootRef.current;
    const thumb = thumbRef.current;
    if (!root || !thumb) {
      return;
    }
    applyThumbSizing(!!thumb.style.transition);
    if (!thumb.style.transition) {
      waitForAnimationFrame(() => {
        thumb.style.transition = "width 300ms var(--cubic-enter), transform 300ms var(--cubic-enter)";
      });
    }
  }, [applyThumbSizing, value, size, gutterSize, pill]);
  const handleValueChange = (nextValue) => {
    if (nextValue && onChange)
      onChange(nextValue);
  };
  return _jsxs(dist_exports.Root, { ref: rootRef, className: clsx_default(SegmentedControl_default.SegmentedControl, className), type: "single", value, loop: false, onValueChange: handleValueChange, onClick, "data-block": block ? "" : void 0, "data-pill": pill ? "" : void 0, "data-size": size, "data-gutter-size": gutterSize, ...restProps, children: [_jsx("div", { className: SegmentedControl_default.SegmentedControlThumb, ref: thumbRef }), children] });
};
var Segment = ({ children, ...restProps }) => {
  return _jsx(dist_exports.Item, { className: SegmentedControl_default.SegmentedControlOption, ...restProps, onPointerEnter: handlePressableMouseEnter, children: _jsx("span", { className: "relative", children }) });
};
SegmentedControl.Option = Segment;

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
  const ref = useRef2(null);
  useLayoutEffect2(() => {
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
function SegmentedControl2({
  label,
  options,
  value,
  onValueChange,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    SegmentedControl,
    {
      className: "yg-segment",
      "aria-label": label,
      value,
      disabled,
      onChange: (v) => {
        if (v) onValueChange(v);
      },
      pill: false,
      children: [
        /* @__PURE__ */ jsx(SelectionMarker, { selector: ':scope > button[data-state="on"]' }),
        options.map((o) => /* @__PURE__ */ jsx(SegmentedControl.Option, { value: o.id, disabled: o.disabled, children: o.label }, o.id))
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
  const uid = useId();
  const refs = useRef2(/* @__PURE__ */ new Map());
  const enabled = items.filter((o) => !o.disabled);
  const selected = enabled.some((i) => i.id === value) ? value : enabled[0]?.id;
  return /* @__PURE__ */ jsxs("div", { className: "yg-tabs", "data-presentation": presentation, children: [
    /* @__PURE__ */ jsxs("div", { role: "tablist", "aria-label": label, children: [
      /* @__PURE__ */ jsx(SelectionMarker, { selector: ':scope > button[aria-selected="true"]', presentation }),
      items.map((o) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          role: "tab",
          id: uid + "-t-" + o.id,
          "aria-controls": uid + "-p-" + o.id,
          "aria-selected": selected === o.id,
          tabIndex: selected === o.id ? 0 : -1,
          disabled: o.disabled,
          ref: (el) => {
            if (el) refs.current.set(o.id, el);
            else refs.current.delete(o.id);
          },
          onClick: () => onValueChange(o.id),
          onKeyDown: (e) => {
            const index = enabled.findIndex((item) => item.id === o.id);
            const next = {
              ArrowRight: (index + 1) % enabled.length,
              ArrowLeft: (index + enabled.length - 1) % enabled.length,
              Home: 0,
              End: enabled.length - 1
            }[e.key];
            if (next !== void 0) {
              e.preventDefault();
              refs.current.get(enabled[next].id)?.focus();
              onValueChange(enabled[next].id);
            }
          },
          children: o.icon ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Icon, { name: o.icon }),
            /* @__PURE__ */ jsx("span", { className: "yg-tab-label", children: /* @__PURE__ */ jsx("span", { children: o.label }) })
          ] }) : o.label
        },
        o.id
      ))
    ] }),
    items.map((o) => /* @__PURE__ */ jsx(
      "div",
      {
        role: "tabpanel",
        tabIndex: 0,
        id: uid + "-p-" + o.id,
        "aria-labelledby": uid + "-t-" + o.id,
        hidden: selected !== o.id,
        children: o.panel
      },
      o.id
    ))
  ] });
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
      page,
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
  SegmentedControl2 as SegmentedControl,
  Tabs,
  Pagination
};
