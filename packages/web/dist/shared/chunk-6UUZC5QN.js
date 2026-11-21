"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// packages/web/src/foundation/foundation.tsx
import { jsx } from "react/jsx-runtime";
function cx(...values) {
  return values.filter(Boolean).join(" ");
}
function Yogurt({
  appearance = "auto",
  material = "neutral",
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      className: cx("yg-root", className),
      "data-appearance": appearance,
      "data-material": material
    }
  );
}
function Text({
  variant = "body",
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx("span", { ...props, className: cx("yg-text", className), "data-type": variant });
}
function Heading({
  level = 2,
  className,
  ...props
}) {
  const Tag = "h" + level;
  return /* @__PURE__ */ jsx(Tag, { ...props, className: cx("yg-heading", className) });
}
function layoutStyle(gap, style) {
  return {
    "--yg-gap": "var(--boa-space-" + gap + ")",
    ...style
  };
}
function Stack({ gap = 8, className, style, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      className: cx("yg-stack", className),
      style: layoutStyle(gap, style)
    }
  );
}
function Inline({ gap = 8, className, style, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      className: cx("yg-inline", className),
      style: layoutStyle(gap, style)
    }
  );
}
function Grid({ gap = 12, className, style, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      className: cx("yg-grid", className),
      style: layoutStyle(gap, style)
    }
  );
}
function Surface({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { ...props, className: cx("yg-surface", className) });
}
function Divider() {
  return /* @__PURE__ */ jsx("hr", { className: "yg-divider" });
}
function ScrollArea({
  label,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ...props,
      role: "region",
      "aria-label": label,
      tabIndex: 0,
      className: cx("yg-scroll", className)
    }
  );
}
var paths = {
  close: "m6 6 12 12M18 6 6 18",
  check: "m5 12 4 4 10-10",
  search: "m16.5 16.5 4 4M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0",
  down: "m6 9 6 6 6-6",
  next: "m9 6 6 6-6 6",
  back: "m15 6-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  copy: "M9 8h11v13H9zM15 5V3H4v13h2",
  menu: "M4 6h16M4 12h16M4 18h16",
  home: "M4 10.5 12 4l8 6.5v9H14v-5h-4v5H4z",
  bookmark: "M6 4h12v16l-6-4-6 4z",
  person: "M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 20a7 7 0 0 1 14 0",
  moon: "M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5",
  sun: "M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  info: "M12 11v6m0-10v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
};
function Icon({ name, label }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className: "yg-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      role: label ? "img" : void 0,
      "aria-label": label,
      "aria-hidden": label ? void 0 : true,
      children: /* @__PURE__ */ jsx("path", { d: paths[name] })
    }
  );
}

export {
  __commonJS,
  __export,
  __toESM,
  cx,
  Yogurt,
  Text,
  Heading,
  Stack,
  Inline,
  Grid,
  Surface,
  Divider,
  ScrollArea,
  Icon
};
