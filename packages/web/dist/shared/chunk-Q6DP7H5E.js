"use client";
import {
  advanceSprings,
  snap,
  spring
} from "./chunk-V7PMO7T5.js";

// packages/web/src/patterns/prompt-shared.tsx
import { useCallback, useLayoutEffect, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function PromptEditor({ value, presentation, rows = 1, inputRef, after, ...props }) {
  const editor = useRef(null);
  const measure = useRef(null);
  const textarea = useRef(null);
  const setTextarea = useCallback((node) => {
    textarea.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) inputRef.current = node;
  }, [inputRef]);
  const resize = useCallback(() => {
    const target = editor.current, source = measure.current, input = textarea.current;
    if (!target || !source || !input) return;
    const computed = getComputedStyle(input);
    const line = Number.parseFloat(computed.lineHeight) || 22;
    const padding = (Number.parseFloat(computed.paddingTop) || 0) + (Number.parseFloat(computed.paddingBottom) || 0);
    const minimum = line * rows + padding;
    const maximum = Math.max(minimum, presentation === "prompt" ? 88 : 176);
    target.style.setProperty("--yg-prompt-editor-height", `${Math.max(minimum, Math.min(source.offsetHeight, maximum))}px`);
  }, [presentation, rows]);
  useLayoutEffect(resize, [resize, value]);
  useLayoutEffect(() => {
    const source = measure.current;
    if (!source) return;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(resize);
      observer.observe(source);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);
  return /* @__PURE__ */ jsxs("div", { ref: editor, className: `yg-prompt-editor${presentation === "composer" ? " yg-composer-editor" : ""}`, children: [
    /* @__PURE__ */ jsxs("span", { ref: measure, className: "yg-prompt-measure", "aria-hidden": "true", children: [
      value,
      "\u200B"
    ] }),
    /* @__PURE__ */ jsx("textarea", { ...props, ref: setTextarea, rows, value }),
    after
  ] });
}
function PromptAction({ presentation, busy, ready, onStop, renderComposer }) {
  const button = useRef(null);
  const restoreFocus = useRef(false);
  const stopping = busy && Boolean(onStop);
  const attachButton = useCallback((node) => {
    if (!node) {
      const previous = button.current;
      restoreFocus.current = Boolean(previous && previous.ownerDocument.activeElement === previous);
      button.current = null;
      return;
    }
    button.current = node;
    const active = node.ownerDocument.activeElement;
    if (restoreFocus.current && (!active || active === node.ownerDocument.body || !active.isConnected)) {
      node.focus({ preventScroll: true });
    }
    restoreFocus.current = false;
  }, []);
  if (presentation === "composer") {
    return renderComposer?.(attachButton, stopping) ?? null;
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref: attachButton,
      className: "yg-prompt-action yg-shared-action",
      type: stopping ? "button" : "submit",
      "aria-label": stopping ? "Stop" : "Send",
      "data-busy": stopping || void 0,
      disabled: busy ? !onStop : !ready,
      onClick: stopping ? (event) => {
        event.preventDefault();
        onStop?.();
      } : void 0,
      children: [
        /* @__PURE__ */ jsx("span", { className: "yg-prompt-arrow", "aria-hidden": "true", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 19V5M6 11l6-6 6 6" }) }) }),
        /* @__PURE__ */ jsx("span", { className: "yg-prompt-stop", "aria-hidden": "true" })
      ]
    }
  );
}

// packages/web/src/patterns/mention-controller.tsx
import { useId, useLayoutEffect as useLayoutEffect2, useRef as useRef2, useState } from "react";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function useMention({ people, value, onChange, collapsedOnly = false }) {
  const id = useId();
  const input = useRef2(null);
  const followingSelection = useRef2(null);
  const marker = useRef2(null);
  const [edges] = useState(() => [spring(4, 620, 36), spring(44, 190, 19)]);
  const markerOpen = useRef2(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [focused, setFocused] = useState(false);
  const [composing, setComposing] = useState(false);
  const [dismissed, setDismissed] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const enabled = people !== void 0;
  const previouslyEnabled = useRef2(enabled);
  useLayoutEffect2(() => {
    if (enabled && !previouslyEnabled.current) {
      const node = input.current;
      setFocused(Boolean(node && node.ownerDocument.activeElement === node));
      if (node) setSelection({ start: node.selectionStart, end: node.selectionEnd });
    } else if (!enabled && previouslyEnabled.current) {
      followingSelection.current = null;
      setFocused(false);
      setDismissed(null);
      setActiveId(null);
    }
    previouslyEnabled.current = enabled;
  }, [enabled]);
  const caret = Math.min(selection.start, value.length);
  const before = value.slice(0, caret);
  const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
  const start = match ? caret - match[1].length - 1 : -1;
  const end = start < 0 ? caret : caret + (value.slice(caret).match(/^[^\s@]*/)?.[0].length ?? 0);
  const tokenKey = `${start}:${caret}:${value}`;
  const options = match ? (people ?? []).filter((person) => person.label.toLocaleLowerCase().includes(match[1].toLocaleLowerCase())) : [];
  const open = !!people && focused && !composing && (!collapsedOnly || selection.start === selection.end) && !!match && dismissed !== tokenKey && options.length > 0;
  const found = options.findIndex((option) => option.id === activeId);
  const index = found < 0 ? 0 : found;
  useLayoutEffect2(() => {
    const pill = marker.current;
    const list = pill?.parentElement;
    const row = list?.querySelector('[aria-selected="true"]');
    if (!pill || !list || !row || !open) {
      markerOpen.current = false;
      return;
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const [top, bottom] = edges;
    const y = row.offsetTop, last = y + row.offsetHeight;
    const forward = y >= top.target;
    const lead = forward ? bottom : top, trail = forward ? top : bottom;
    lead.stiffness = 620;
    lead.damping = 36;
    trail.stiffness = 190;
    trail.damping = 19;
    top.target = y;
    bottom.target = last;
    if (!markerOpen.current || preference.matches) {
      snap(top, y);
      snap(bottom, last);
    }
    markerOpen.current = true;
    if (y < list.scrollTop) list.scrollTop = y;
    else if (last > list.scrollTop + list.clientHeight && list.clientHeight > 0) list.scrollTop = last - list.clientHeight;
    let frame = 0, previous = performance.now();
    function paint() {
      pill?.style.setProperty("--yg-mention-top", `${top.position}px`);
      pill?.style.setProperty("--yg-mention-height", `${Math.max(0, bottom.position - top.position)}px`);
    }
    function tick(timestamp) {
      const moving = advanceSprings(edges, (timestamp - previous) / 1e3);
      previous = timestamp;
      paint();
      if (moving) frame = requestAnimationFrame(tick);
    }
    function changePreference() {
      if (!preference.matches) return;
      cancelAnimationFrame(frame);
      snap(top, top.target);
      snap(bottom, bottom.target);
      paint();
    }
    paint();
    if (!preference.matches) frame = requestAnimationFrame(tick);
    preference.addEventListener("change", changePreference);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", changePreference);
    };
  }, [edges, index, open, options.length]);
  function moveCaret(next) {
    input.current?.focus({ preventScroll: true });
    input.current?.setSelectionRange(next, next);
    setSelection({ start: next, end: next });
  }
  useLayoutEffect2(() => {
    const pending = followingSelection.current;
    if (!pending) return;
    if (pending.value !== value) {
      if (pending.origin !== value) followingSelection.current = null;
      return;
    }
    followingSelection.current = null;
    if (input.current?.ownerDocument.activeElement === input.current) moveCaret(pending.caret);
  }, [value]);
  function select(person) {
    if (!open || start < 0 || !options.some((option) => option.id === person.id)) return;
    const replacement = `@${person.label}`;
    const suffix = value.slice(end);
    const space = suffix && /^\s/.test(suffix) ? "" : " ";
    const nextCaret = start + replacement.length + space.length;
    const next = value.slice(0, start) + replacement + space + suffix;
    setDismissed(tokenKey);
    setActiveId(null);
    if (next === value) moveCaret(nextCaret);
    else {
      followingSelection.current = {
        value: next,
        origin: value,
        caret: nextCaret,
        selectionStart: input.current?.selectionStart ?? caret,
        selectionEnd: input.current?.selectionEnd ?? caret
      };
      onChange(next);
    }
  }
  const editorProps = {
    "aria-autocomplete": "list",
    "aria-controls": open ? `${id}-list` : void 0,
    "aria-activedescendant": open ? `${id}-option-${index}` : void 0,
    onFocus: (event) => {
      setFocused(true);
      setSelection({ start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd });
    },
    onBlur: () => {
      followingSelection.current = null;
      setFocused(false);
    },
    onSelect: (event) => {
      const pending = followingSelection.current;
      if (pending && (event.currentTarget.selectionStart !== pending.selectionStart || event.currentTarget.selectionEnd !== pending.selectionEnd)) followingSelection.current = null;
      setSelection({ start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd });
      setActiveId(null);
    },
    onCompositionStart: () => {
      followingSelection.current = null;
      setComposing(true);
    },
    onCompositionEnd: (event) => {
      setComposing(false);
      setSelection({ start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd });
    },
    onChange: (event) => {
      followingSelection.current = null;
      setSelection({ start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd });
      setActiveId(null);
      setDismissed(null);
      onChange(event.currentTarget.value);
    },
    onKeyDown: (event) => {
      if (!open || event.defaultPrevented || event.nativeEvent.isComposing || collapsedOnly && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setDismissed(tokenKey);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveId(options[(index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].id);
      } else if (event.key === "Enter") {
        event.preventDefault();
        select(options[index]);
      }
    }
  };
  return { id, input, editorProps, open, options, index, marker, setActiveId, select };
}
function MentionOptions({ mention }) {
  const { id, open, options, index, marker, setActiveId, select } = mention;
  return /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsx2("span", { role: "status", "aria-live": "polite", style: {
      position: "absolute",
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap"
    }, children: open ? `${options.length} ${options.length === 1 ? "suggestion" : "suggestions"} available` : "" }),
    /* @__PURE__ */ jsx2("div", { className: "yg-mention-layer", "data-open": open, style: { "--yg-mention-count": options.length }, children: /* @__PURE__ */ jsxs2("div", { id: `${id}-list`, className: "yg-mention-list", role: "listbox", "aria-label": "People", "aria-hidden": !open || void 0, inert: !open, children: [
      /* @__PURE__ */ jsx2("span", { ref: marker, className: "yg-mention-marker", "aria-hidden": "true" }),
      options.map((person, i) => /* @__PURE__ */ jsxs2(
        "button",
        {
          id: `${id}-option-${i}`,
          role: "option",
          "aria-selected": i === index,
          type: "button",
          tabIndex: -1,
          style: { "--yg-mention-index": i },
          onPointerMove: (event) => {
            if (event.pointerType === "mouse") setActiveId(person.id);
          },
          onMouseDown: (event) => event.preventDefault(),
          onClick: () => select(person),
          children: [
            /* @__PURE__ */ jsx2("span", { "aria-hidden": "true", children: Array.from(person.label)[0]?.toLocaleUpperCase() }),
            /* @__PURE__ */ jsx2("b", { children: person.label })
          ]
        },
        person.id
      ))
    ] }) })
  ] });
}

export {
  PromptEditor,
  PromptAction,
  useMention,
  MentionOptions
};
