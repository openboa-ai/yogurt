"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  Slider as SDKSlider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
import { animateSliderCues } from "./slider-cue-motion.js";

type SliderProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  presentation?: "inline" | "card";
  formatValue?: (value: number) => string;
};

type SliderSurfaceProps = SliderProps & {
  end?: number;
  onEndChange?: (value: number) => void;
  detail?: string;
  minThumbGap?: number;
};

export function Slider(props: SliderProps) {
  return <SliderSurface {...props} />;
}

type RangeSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  end?: number;
  onEndChange?: (value: number) => void;
  detail?: string;
  formatValue?: (value: number) => string;
  presentation?: "standard" | "elastic";
  minThumbGap?: number;
};

export function RangeSlider({
  label, value, onChange, min, max, step, end, onEndChange, detail, formatValue = String,
  presentation = "standard", minThumbGap,
}: RangeSliderProps) {
  return (
    <SliderSurface label={label} value={value} onValueChange={onChange}
      min={min} max={max} step={step} end={end} onEndChange={onEndChange}
      detail={detail} formatValue={formatValue} minThumbGap={minThumbGap}
      presentation={presentation === "elastic" ? "inline" : "card"} />
  );
}

function SliderSurface({
  label, value, onValueChange, min = 0, max = 100, step = 1, unit = "",
  disabled, presentation = "inline", formatValue, end, onEndChange, detail, minThumbGap = 0,
}: SliderSurfaceProps) {
  const track = useRef<HTMLDivElement>(null);
  const tips = useRef<HTMLDivElement>(null);
  const cueMotion = useRef<ReturnType<typeof animateSliderCues> | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [tipWidths, setTipWidths] = useState({ start: 0, end: 0, overhang: 0 });
  const upper = end ?? value;
  const interval = end !== undefined && onEndChange !== undefined;
  const card = presentation === "card" || interval;
  const span = Math.max(0, max - min);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const format = formatValue ?? (unit ? (number: number) => number + unit : undefined);
  const lowerText = format?.(value) ?? String(value);
  const upperText = format?.(upper) ?? String(upper);
  const start = span ? Math.min(100, Math.max(0, (value - min) / span * 100)) : 0;
  const finish = span ? Math.min(100, Math.max(0, (upper - min) / span * 100)) : 0;
  function cueCenter(position: number, width: number) {
    const inset = Math.max(0, width / 2 - tipWidths.overhang);
    return Math.max(inset, Math.min(trackWidth - inset, trackWidth * position / 100));
  }
  const joined = interval && cueCenter(finish, tipWidths.end) - cueCenter(start, tipWidths.start)
    < (tipWidths.start + tipWidths.end) / 2 + 8;
  const minStepsBetweenThumbs = interval && trackWidth > 0 && Number.isFinite(minThumbGap)
    ? Math.max(0, Math.min(Math.floor(span / increment), Math.ceil(minThumbGap / trackWidth * span / increment)))
    : 0;

  useLayoutEffect(() => {
    const rail = track.current;
    const hints = tips.current;
    if (!rail || !hints) return;
    const motion = animateSliderCues(hints);
    cueMotion.current = motion;
    const labels = Array.from(hints.querySelectorAll<HTMLElement>("[data-tip]"));
    const measure = () => {
      const overhang = ((hints.parentElement?.clientWidth ?? hints.clientWidth) - hints.clientWidth) / 2;
      if (interval) {
        setTrackWidth(rail.clientWidth);
        const start = labels[0]?.offsetWidth ?? 0;
        const end = labels[1]?.offsetWidth ?? 0;
        setTipWidths(current => current.start === start && current.end === end && current.overhang === overhang
          ? current : { start, end, overhang });
      }
      labels.forEach(label => label.style.setProperty("--yg-tip-edge", `${Math.max(0, label.offsetWidth / 2 - overhang)}px`));
      motion.measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hints);
    observer.observe(rail);
    labels.forEach(label => observer.observe(label));
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

  return (
    <SDKSlider
      className="yg-value-slider"
      data-presentation={card ? "card" : "inline"}
      data-interval={interval || undefined}
      data-joined={joined || undefined}
      aria-label={label}
      value={interval ? [value, upper] : value}
      min={min}
      max={max}
      step={increment}
      format={format}
      disabled={disabled}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      onValueChange={(next, details) => {
        if (typeof next === "number") onValueChange(next);
        else {
          if (details.thumb !== 1 && next[0] !== value) onValueChange(next[0]);
          if (details.thumb !== 0 && next[1] !== upper) onEndChange?.(next[1]);
        }
      }}
      style={{
        "--yg-slider-start": `${start}%`,
        "--yg-slider-end": `${finish}%`,
      } as CSSProperties}
    >
      <div className="yg-value-slider-heading">
        <span>{label}</span>
        {(!card || detail) && <SliderValue>{detail ?? lowerText}</SliderValue>}
      </div>
      <div className="yg-value-slider-body">
        <SliderControl className="yg-value-slider-control">
          <SliderTrack ref={track} className="yg-value-slider-track">
            <SliderIndicator className="yg-value-slider-indicator" />
            <SliderThumb className="yg-value-slider-thumb" data-thumb="start"
              aria-label={interval ? `Minimum ${label.toLowerCase()}` : label} />
            {interval && (
              <SliderThumb index={1} className="yg-value-slider-thumb" data-thumb="end"
                aria-label={`Maximum ${label.toLowerCase()}`} />
            )}
          </SliderTrack>
        </SliderControl>
        <div ref={tips} className="yg-value-slider-tips" aria-hidden="true">
          <span className="yg-value-slider-tip" data-tip="start"><span>{lowerText}</span></span>
          {interval && <>
            <span className="yg-value-slider-tip" data-tip="end"><span>{upperText}</span></span>
            <span className="yg-value-slider-tip" data-tip="joined"><span>{lowerText}–{upperText}</span></span>
          </>}
        </div>
      </div>
    </SDKSlider>
  );
}
