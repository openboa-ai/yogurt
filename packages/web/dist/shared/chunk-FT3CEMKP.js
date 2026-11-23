"use client";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-DRQJWO7S.js";

// packages/web/src/controls/slider.tsx
import { useLayoutEffect, useRef, useState } from "react";
import {
  Slider as SDKSlider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue
} from "@ui-sdk/react/slider";

// packages/web/src/controls/slider-cue-motion.ts
function animateSliderCues(container) {
  const cues = Array.from(container.querySelectorAll("[data-tip]"));
  const springs = cues.map(() => spring(0, 260, 18));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let previous = 0;
  let initialized = false;
  let pixelsPerPercent = 0;
  let direction = 1;
  function paint() {
    cues.forEach((cue, index) => {
      const axis = springs[index];
      const offset = (axis.position - axis.target) * pixelsPerPercent * direction;
      cue.style.setProperty("--yg-tip-current", `${axis.position}%`);
      cue.style.setProperty("--yg-tip-lean", `${Math.max(-28, Math.min(28, offset * 0.9))}deg`);
    });
  }
  function step(time) {
    const moving = advanceSprings(springs, (time - previous) / 1e3);
    previous = time;
    paint();
    frame = moving ? requestAnimationFrame(step) : 0;
  }
  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    springs.forEach((axis) => snap(axis, axis.target));
    paint();
  }
  function preferenceChanged() {
    if (reduced.matches) settle();
  }
  reduced.addEventListener("change", preferenceChanged);
  return {
    measure() {
      pixelsPerPercent = container.clientWidth / 100;
      direction = getComputedStyle(container).direction === "rtl" ? -1 : 1;
    },
    move(start, end) {
      const targets = [start, end, (start + end) / 2];
      if (initialized && springs.every((axis, index) => axis.target === targets[index])) return;
      springs.forEach((axis, index) => {
        axis.target = targets[index];
      });
      if (!initialized || reduced.matches) settle();
      else if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(step);
      }
      initialized = true;
    },
    dispose() {
      cancelAnimationFrame(frame);
      reduced.removeEventListener("change", preferenceChanged);
    }
  };
}

// packages/web/src/controls/slider.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Slider(props) {
  return /* @__PURE__ */ jsx(SliderSurface, { ...props });
}
function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  end,
  onEndChange,
  detail,
  formatValue = String,
  presentation = "standard",
  minThumbGap
}) {
  return /* @__PURE__ */ jsx(
    SliderSurface,
    {
      label,
      value,
      onValueChange: onChange,
      min,
      max,
      step,
      end,
      onEndChange,
      detail,
      formatValue,
      minThumbGap,
      presentation: presentation === "elastic" ? "inline" : "card"
    }
  );
}
function SliderSurface({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  disabled,
  presentation = "inline",
  formatValue,
  end,
  onEndChange,
  detail,
  minThumbGap = 0
}) {
  const track = useRef(null);
  const tips = useRef(null);
  const cueMotion = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [tipWidths, setTipWidths] = useState({ start: 0, end: 0, overhang: 0 });
  const upper = end ?? value;
  const interval = end !== void 0 && onEndChange !== void 0;
  const card = presentation === "card" || interval;
  const span = Math.max(0, max - min);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const format = formatValue ?? (unit ? (number) => number + unit : void 0);
  const lowerText = format?.(value) ?? String(value);
  const upperText = format?.(upper) ?? String(upper);
  const start = span ? Math.min(100, Math.max(0, (value - min) / span * 100)) : 0;
  const finish = span ? Math.min(100, Math.max(0, (upper - min) / span * 100)) : 0;
  function cueCenter(position, width) {
    const inset = Math.max(0, width / 2 - tipWidths.overhang);
    return Math.max(inset, Math.min(trackWidth - inset, trackWidth * position / 100));
  }
  const joined = interval && cueCenter(finish, tipWidths.end) - cueCenter(start, tipWidths.start) < (tipWidths.start + tipWidths.end) / 2 + 8;
  const minStepsBetweenThumbs = interval && trackWidth > 0 && Number.isFinite(minThumbGap) ? Math.max(0, Math.min(Math.floor(span / increment), Math.ceil(minThumbGap / trackWidth * span / increment))) : 0;
  useLayoutEffect(() => {
    const rail = track.current;
    const hints = tips.current;
    if (!rail || !hints) return;
    const motion = animateSliderCues(hints);
    cueMotion.current = motion;
    const labels = Array.from(hints.querySelectorAll("[data-tip]"));
    const measure = () => {
      const overhang = ((hints.parentElement?.clientWidth ?? hints.clientWidth) - hints.clientWidth) / 2;
      if (interval) {
        setTrackWidth(rail.clientWidth);
        const start2 = labels[0]?.offsetWidth ?? 0;
        const end2 = labels[1]?.offsetWidth ?? 0;
        setTipWidths((current) => current.start === start2 && current.end === end2 && current.overhang === overhang ? current : { start: start2, end: end2, overhang });
      }
      labels.forEach((label2) => label2.style.setProperty("--yg-tip-edge", `${Math.max(0, label2.offsetWidth / 2 - overhang)}px`));
      motion.measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hints);
    observer.observe(rail);
    labels.forEach((label2) => observer.observe(label2));
    measure();
    return () => {
      observer.disconnect();
      motion.dispose();
      cueMotion.current = null;
    };
  }, [interval]);
  useLayoutEffect(() => {
    cueMotion.current?.move(start, finish);
  }, [start, finish, interval]);
  return /* @__PURE__ */ jsxs(
    SDKSlider,
    {
      className: "yg-value-slider",
      "data-presentation": card ? "card" : "inline",
      "data-interval": interval || void 0,
      "data-joined": joined || void 0,
      "aria-label": label,
      value: interval ? [value, upper] : value,
      min,
      max,
      step: increment,
      format,
      disabled,
      minStepsBetweenThumbs,
      onValueChange: (next, details) => {
        if (typeof next === "number") onValueChange(next);
        else {
          if (details.thumb !== 1 && next[0] !== value) onValueChange(next[0]);
          if (details.thumb !== 0 && next[1] !== upper) onEndChange?.(next[1]);
        }
      },
      style: {
        "--yg-slider-start": `${start}%`,
        "--yg-slider-end": `${finish}%`
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "yg-value-slider-heading", children: [
          /* @__PURE__ */ jsx("span", { children: label }),
          (!card || detail) && /* @__PURE__ */ jsx(SliderValue, { children: detail ?? lowerText })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "yg-value-slider-body", children: [
          /* @__PURE__ */ jsx(SliderControl, { className: "yg-value-slider-control", children: /* @__PURE__ */ jsxs(SliderTrack, { ref: track, className: "yg-value-slider-track", children: [
            /* @__PURE__ */ jsx(SliderIndicator, { className: "yg-value-slider-indicator" }),
            /* @__PURE__ */ jsx(
              SliderThumb,
              {
                className: "yg-value-slider-thumb",
                "data-thumb": "start",
                "aria-label": interval ? `Minimum ${label.toLowerCase()}` : label
              }
            ),
            interval && /* @__PURE__ */ jsx(
              SliderThumb,
              {
                index: 1,
                className: "yg-value-slider-thumb",
                "data-thumb": "end",
                "aria-label": `Maximum ${label.toLowerCase()}`
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("div", { ref: tips, className: "yg-value-slider-tips", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("span", { className: "yg-value-slider-tip", "data-tip": "start", children: /* @__PURE__ */ jsx("span", { children: lowerText }) }),
            interval && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "yg-value-slider-tip", "data-tip": "end", children: /* @__PURE__ */ jsx("span", { children: upperText }) }),
              /* @__PURE__ */ jsx("span", { className: "yg-value-slider-tip", "data-tip": "joined", children: /* @__PURE__ */ jsxs("span", { children: [
                lowerText,
                "\u2013",
                upperText
              ] }) })
            ] })
          ] })
        ] })
      ]
    }
  );
}

export {
  Slider,
  RangeSlider
};
