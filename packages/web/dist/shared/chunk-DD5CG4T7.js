"use client";

// packages/web/src/patterns/prompt-shared.tsx
import { useCallback, useLayoutEffect, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function PromptEditor({ value, presentation, rows = 1, ...props }) {
  const editor = useRef(null);
  const measure = useRef(null);
  const textarea = useRef(null);
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
    /* @__PURE__ */ jsx("textarea", { ...props, ref: textarea, rows, value })
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

export {
  PromptEditor,
  PromptAction
};
