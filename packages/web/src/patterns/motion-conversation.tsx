"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { advanceSprings, playSprings, snap, spring } from "../foundation/spring-motion.js";
import { Textarea } from "../controls/forms.js";
import { PromptAction, PromptEditor } from "./prompt-shared.js";

export function StreamingReply({ value, active = false }: { value: string; active?: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const reply = useRef<HTMLDivElement>(null);
  const wait = useRef<HTMLSpanElement>(null);
  const wasActive = useRef(active);
  const mounted = useRef(false);
  const [motion] = useState(() => ({width: spring(0, 260, 26), height: spring(40, 260, 26), waiting: spring(1, 300, 30)}));
  const streaming = active || wasActive.current;
  useLayoutEffect(() => {
    const box = surface.current, words = reply.current, thinking = wait.current;
    if (!box || !words || !thinking) return;
    let stop: (() => void) | undefined;
    const resize = () => {
      const max = box.clientWidth;
      box.style.setProperty("--yg-reply-available", `${max}px`);
      const inline = value ? max : Math.min(max, thinking.offsetWidth + 28);
      const block = Math.max(40, words.offsetHeight + 18);
      const waitOpacity = Number(active && !value);
      if (!mounted.current) {
        snap(motion.width, inline);
        snap(motion.height, block);
        snap(motion.waiting, waitOpacity);
      } else {
        motion.width.target = inline;
        motion.height.target = block;
        motion.waiting.target = waitOpacity;
      }
      mounted.current = true;
      stop?.();
      stop = playSprings(Object.values(motion), () => {
        box.style.setProperty("--yg-reply-width", `${motion.width.position}px`);
        box.style.setProperty("--yg-reply-height", `${motion.height.position}px`);
        box.style.setProperty("--yg-reply-waiting", String(motion.waiting.position));
      });
    };
    if (active) wasActive.current = true;
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(words);
    return () => { observer.disconnect(); stop?.(); };
  }, [active, motion, value]);
  return <div ref={surface} className="yg-streaming-shell">
    <div className="yg-streaming-reply" aria-busy={active || undefined} data-streaming={streaming || undefined}>
      <span ref={wait} className="yg-streaming-wait" aria-hidden={!active || !!value}>
        {active || value ? "Thinking" : ""}
      </span>
      <div ref={reply} className="yg-streaming-body">
        {value && value.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? part :
          <span className="yg-streaming-word" key={index}>{part}</span>)}
      </div>
    </div>
  </div>;
}

export function GhostSuggestion({ value, suggestion, onChange }: {
  value: string; suggestion: string; onChange: (value: string) => void;
}) {
  return <div className="yg-ghost-field"><Textarea label="Your message" rows={2} value={value}
    autoComplete="off" suggestion={suggestion} onChange={event => onChange(event.currentTarget.value)} /></div>;
}

export function PromptBox({ value, onChange, onSubmit, busy = false, onCancel }: {
  value: string; onChange: (value: string) => void; onSubmit: () => void; busy?: boolean; onCancel?: () => void;
}) {
  return <form className="yg-prompt-box yg-prompt-shared" aria-label="Prompt" aria-busy={busy || undefined}
    onSubmit={(event) => { event.preventDefault(); if (!busy && value.trim()) onSubmit(); }}>
    <div className="yg-prompt-panel">
      <div className="yg-prompt-status-slot">
        <div className="yg-prompt-status" role="status">
          {busy && <><span className="yg-prompt-indicator" aria-hidden="true" /><span>Thinking</span></>}
        </div>
      </div>
    </div>
      <PromptEditor presentation="prompt" aria-label="Prompt" placeholder="Ask anything" rows={1} value={value}
        onChange={event => onChange(event.currentTarget.value)}
        onKeyDown={event => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
          event.preventDefault();
          if (!busy && value.trim()) event.currentTarget.form?.requestSubmit();
        }} />
    <div className="yg-prompt-actions">
      <PromptAction presentation="prompt" busy={busy} ready={Boolean(value.trim())} onStop={onCancel} />
    </div>
  </form>;
}

export function ThinkingIndicator({ label = "Thinking", active = true }: { label?: string; active?: boolean }) {
  const filter = useId();
  const node = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!active || !node.current) return;
    const dots = Array.from(node.current.querySelectorAll("i"));
    const axes = dots.map(() => spring(0, 420, 14));
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, clock = 0, previous = performance.now(), hop = .3, index = 0;
    function tick(time: number) {
      const elapsed = Math.min(1 / 30, (time - previous) / 1000);
      previous = time;
      clock += elapsed;
      if (clock >= hop) {
        axes[index % axes.length].velocity = -95;
        index++;
        hop += index % axes.length ? .16 : .46;
      }
      advanceSprings(axes, elapsed);
      dots.forEach((dot, i) => { dot.style.translate = `0 ${axes[i].position}px`; });
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        axes.forEach(axis => snap(axis, 0));
        dots.forEach(dot => dot.style.removeProperty("translate"));
      } else {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    sync();
    media.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); media.removeEventListener("change", sync); };
  }, [active]);
  if (!active) return null;
  return <div className="yg-thinking" role="status" aria-label={label}>
    <svg width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id={filter}><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" /></filter></defs></svg>
    <span ref={node} className="yg-thinking-dots" aria-hidden="true" style={{filter: `url(#${filter})`}}><i /><i /><i /></span>
  </div>;
}
