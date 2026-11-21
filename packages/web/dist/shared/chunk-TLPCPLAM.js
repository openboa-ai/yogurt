"use client";
import {
  Attachment
} from "./chunk-7EGCAWTV.js";
import {
  MentionOptions,
  PromptAction,
  PromptEditor,
  useMention
} from "./chunk-LKB52XNS.js";
import {
  ActionMenu
} from "./chunk-Y34L4C5K.js";
import {
  Button
} from "./chunk-4IPCB3MM.js";

// packages/web/src/patterns/composer.tsx
import { useId, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
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
  toolLabel = "Tools",
  error,
  companion,
  mentionPeople
}) {
  const id = useId();
  const mention = useMention({ people: mentionPeople, value, onChange: onValueChange, collapsedOnly: true });
  const composingRef = useRef(false);
  const [composing, setComposing] = useState(false);
  const text = value.trim();
  const ready = !pending && !composing && (text.length > 0 || attachments.length > 0) && attachments.every((item) => item.progress == null || item.progress >= 100);
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
        attachments.length > 0 && /* @__PURE__ */ jsx("ul", { className: "yg-composer-sources", "aria-label": "Attachments", children: attachments.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          Attachment,
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
            placeholder: label,
            rows: 2,
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
            inputRef: mentionPeople === void 0 ? void 0 : mention.input,
            after: mentionPeople === void 0 ? void 0 : /* @__PURE__ */ jsx(MentionOptions, { mention })
          }
        ),
        error && /* @__PURE__ */ jsx("span", { className: "yg-field-error", id: id + "-error", role: "alert", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "yg-composer-footer", children: [
          /* @__PURE__ */ jsxs("div", { className: "yg-composer-tools", children: [
            onAddAttachment && /* @__PURE__ */ jsx(Button, { emphasis: "quiet", onClick: onAddAttachment, disabled: pending, children: "Attach" }),
            !pending && onTool && tools.length > 0 && /* @__PURE__ */ jsx(ActionMenu, { label: toolLabel, items: [...tools], onSelect: onTool })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "yg-composer-tools", children: [
            companion,
            /* @__PURE__ */ jsx(
              PromptAction,
              {
                presentation: "composer",
                busy: pending,
                ready,
                onStop,
                renderComposer: (button, stopping) => stopping ? /* @__PURE__ */ jsx(Button, { ref: button, className: "yg-shared-action", emphasis: "soft", onClick: onStop, children: "Stop" }, "stop") : /* @__PURE__ */ jsx(Button, { ref: button, className: "yg-shared-action", type: "submit", disabled: !ready, pending, pendingLabel: "Sending", children: "Send" }, "send")
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
