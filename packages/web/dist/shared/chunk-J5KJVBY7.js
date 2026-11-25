"use client";
import {
  MentionOptions,
  PromptAction,
  PromptEditor,
  useMention
} from "./chunk-LKB52XNS.js";
import {
  ActionMenu
} from "./chunk-2TEZLIKS.js";
import {
  Button,
  IconButton
} from "./chunk-BMOTQIAZ.js";
import {
  Icon
} from "./chunk-XELXU7JZ.js";

// packages/web/src/patterns/composer.tsx
import { useId, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function ComposerAttachment({
  name,
  detail,
  onRemove,
  progress
}) {
  return /* @__PURE__ */ jsxs("div", { className: "yg-attachment", children: [
    /* @__PURE__ */ jsxs("span", { className: "yg-file-name", children: [
      /* @__PURE__ */ jsx("strong", { children: name }),
      detail && /* @__PURE__ */ jsx("small", { children: detail })
    ] }),
    progress !== void 0 && /* @__PURE__ */ jsx("progress", { "aria-label": "Upload " + name, value: progress, max: 100 }),
    " ",
    onRemove && /* @__PURE__ */ jsx(IconButton, { icon: "close", label: "Remove " + name, onClick: onRemove })
  ] });
}
function Composer({
  value,
  onValueChange,
  onSend,
  attachments = [],
  onRemoveAttachment,
  onAddAttachment,
  tools = [],
  onTool,
  pending = false,
  onStop,
  label = "Message",
  placeholder,
  toolLabel = "Tools",
  sendTone = "neutral",
  error,
  companion,
  header,
  contextChips,
  shortcutHint,
  mentionPeople
}) {
  const id = useId();
  const mention = useMention({ people: mentionPeople, value, onChange: onValueChange, collapsedOnly: true });
  const composingRef = useRef(false);
  const [composing, setComposing] = useState(false);
  const text = value.trim();
  const ready = !pending && !composing && (text.length > 0 || attachments.length > 0) && attachments.every((item) => item.progress == null || item.progress >= 100);
  const hasHeader = Boolean(header);
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "yg-composer yg-prompt-shared",
      "aria-label": label + " composer",
      "aria-busy": pending || void 0,
      onSubmit: (event) => {
        event.preventDefault();
        if (ready && !composingRef.current) onSend({ text, attachmentIds: attachments.map((item) => item.id) });
      },
      children: [
        hasHeader && /* @__PURE__ */ jsx("div", { className: "yg-composer-header", children: header }),
        attachments.length > 0 && /* @__PURE__ */ jsx("ul", { className: "yg-composer-sources", "aria-label": "Attachments", children: attachments.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          ComposerAttachment,
          {
            name: item.name,
            detail: item.detail,
            progress: item.progress,
            onRemove: onRemoveAttachment && (() => onRemoveAttachment(item.id))
          }
        ) }, item.id)) }),
        /* @__PURE__ */ jsx(
          PromptEditor,
          {
            presentation: "composer",
            id,
            "aria-label": label,
            "aria-describedby": error ? id + "-error" : void 0,
            placeholder: placeholder ?? label,
            rows: 1,
            value,
            ...mentionPeople === void 0 ? {
              onChange: (event) => onValueChange(event.currentTarget.value)
            } : mention.editorProps,
            onCompositionStart: (event) => {
              composingRef.current = true;
              setComposing(true);
              mention.editorProps.onCompositionStart?.(event);
            },
            onCompositionEnd: (event) => {
              composingRef.current = false;
              setComposing(false);
              mention.editorProps.onCompositionEnd?.(event);
            },
            onKeyDown: (event) => {
              if (mentionPeople !== void 0) mention.editorProps.onKeyDown?.(event);
              if (!event.defaultPrevented && event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing && !composingRef.current && ready) {
                event.preventDefault();
                onSend({ text, attachmentIds: attachments.map((item) => item.id) });
              }
            },
            inputRef: mentionPeople === void 0 ? void 0 : mention.input,
            after: mentionPeople === void 0 ? void 0 : /* @__PURE__ */ jsx(MentionOptions, { mention })
          }
        ),
        error && /* @__PURE__ */ jsx("span", { className: "yg-error", id: id + "-error", role: "alert", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "yg-composer-footer", children: [
          /* @__PURE__ */ jsxs("div", { className: "yg-composer-tools", children: [
            onAddAttachment && /* @__PURE__ */ jsx(IconButton, { icon: "plus", label: "Attach", emphasis: "soft", size: "compact", onClick: onAddAttachment, disabled: pending }),
            !pending && onTool && tools.length > 0 && /* @__PURE__ */ jsx(ActionMenu, { label: toolLabel, triggerSize: "compact", items: [...tools], onSelect: onTool }),
            contextChips?.map((chip) => /* @__PURE__ */ jsx("span", { className: "yg-composer-chip", "data-tone": chip.tone ?? "neutral", children: chip.label }, chip.id))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "yg-composer-tools", children: [
            companion,
            shortcutHint && /* @__PURE__ */ jsx("span", { className: "yg-composer-hint", "aria-hidden": "true", children: shortcutHint }),
            /* @__PURE__ */ jsx(
              PromptAction,
              {
                presentation: "composer",
                busy: pending,
                ready,
                onStop,
                renderComposer: (button, stopping) => stopping ? /* @__PURE__ */ jsx(Button, { ref: button, className: "yg-shared-action", emphasis: "soft", size: "compact", onClick: onStop, children: "Stop" }, "stop") : /* @__PURE__ */ jsx(Button, { ref: button, className: "yg-shared-action yg-composer-send", "data-icon-only": "", "aria-label": "Send", tone: sendTone, size: "compact", type: "submit", disabled: !ready, pending, children: /* @__PURE__ */ jsx(Icon, { name: "send" }) }, "send")
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function VoiceControl({
  state,
  duration,
  preview,
  onStart,
  onStop,
  onSend,
  onDiscard
}) {
  const labels = {
    idle: "Ready to record",
    recording: "Recording",
    review: "Review voice note",
    unavailable: "Voice unavailable"
  };
  return /* @__PURE__ */ jsxs("section", { className: "yg-voice", "aria-label": "Voice note", "data-state": state, children: [
    /* @__PURE__ */ jsx("span", { className: "yg-voice-state", role: "status", children: labels[state] }),
    duration && /* @__PURE__ */ jsx("span", { className: "yg-meta", "aria-label": "Duration " + duration, children: duration }),
    state === "review" && preview,
    state === "idle" && onStart && /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onStart, children: "Record" }),
    state === "recording" && onStop && /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onStop, children: "Stop recording" }),
    state === "review" && onSend && /* @__PURE__ */ jsx(Button, { onClick: onSend, children: "Send voice note" }),
    state !== "idle" && state !== "unavailable" && onDiscard && /* @__PURE__ */ jsx(Button, { emphasis: "quiet", onClick: onDiscard, children: "Discard voice note" })
  ] });
}

export {
  Composer,
  VoiceControl
};
