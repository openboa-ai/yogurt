"use client";
import {
  dist_exports11 as dist_exports
} from "./chunk-74ISCFKG.js";
import {
  Button,
  clsx_default,
  handlePressableMouseEnter,
  useResizeObserver,
  waitForAnimationFrame
} from "./chunk-A323HUK4.js";
import {
  Icon,
  cx
} from "./chunk-RUS3W4HJ.js";

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

// packages/web/src/controls/navigation.tsx
import { jsx, jsxs } from "react/jsx-runtime";
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
function SelectionMarker({ selector }) {
  const ref = useRef2(null);
  useLayoutEffect2(() => {
    const marker = ref.current;
    const group = marker?.parentElement;
    if (!marker || !group) return;
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
      const canSlide = allowSlide && previous && previous.button !== button && previous.y === y;
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
  }, [selector]);
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
  onValueChange
}) {
  const uid = useId();
  const refs = useRef2(/* @__PURE__ */ new Map());
  const enabled = items.filter((o) => !o.disabled);
  const selected = enabled.some((i) => i.id === value) ? value : enabled[0]?.id;
  return /* @__PURE__ */ jsxs("div", { className: "yg-tabs", children: [
    /* @__PURE__ */ jsxs("div", { role: "tablist", "aria-label": label, children: [
      /* @__PURE__ */ jsx(SelectionMarker, { selector: ':scope > button[aria-selected="true"]' }),
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
          children: o.label
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
