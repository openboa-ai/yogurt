"use client";
import {
  Attachment
} from "./chunk-AOCR2E3S.js";
import {
  ActionMenu
} from "./chunk-6MLFUGIG.js";
import {
  Button
} from "./chunk-4IPCB3MM.js";

// packages/web/src/patterns/composer.tsx
import { useId } from "react";
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
  companion
}) {
  const id = useId();
  const text = value.trim();
  const ready = !pending && (text.length > 0 || attachments.length > 0) && attachments.every((item) => item.progress == null || item.progress >= 100);
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "yg-composer",
      "aria-label": label + " composer",
      "aria-busy": pending || void 0,
      onSubmit: (event) => {
        event.preventDefault();
        if (ready) onSend({ text, attachmentIds: attachments.map((item) => item.id) });
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
          "textarea",
          {
            id,
            "aria-label": label,
            "aria-describedby": error ? id + "-error" : void 0,
            placeholder: label,
            rows: 2,
            value,
            onChange: (event) => onValueChange(event.currentTarget.value)
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
            pending && onStop ? /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onStop, children: "Stop" }) : /* @__PURE__ */ jsx(Button, { type: "submit", disabled: !ready, pending, pendingLabel: "Sending", children: "Send" })
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
