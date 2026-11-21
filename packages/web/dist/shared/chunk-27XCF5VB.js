"use client";
import {
  Dialog
} from "./chunk-P2CIQA55.js";
import {
  words
} from "./chunk-5GJUJT3P.js";
import {
  Button,
  ButtonGroup
} from "./chunk-LTCB3AU4.js";
import {
  Heading,
  Stack
} from "./chunk-H36QHH35.js";

// packages/web/src/patterns/decisions.tsx
import { useEffect, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function ConfirmDialog({
  decision,
  open,
  onOpenChange,
  onConfirm,
  pending = false
}) {
  const sent = useRef(false);
  const opened = useRef(null);
  useEffect(() => {
    if (!open) {
      opened.current = null;
      sent.current = false;
    } else if (!opened.current)
      opened.current = { id: decision.id, revision: decision.revision };
  }, [open, decision.id, decision.revision]);
  const changed = opened.current && (opened.current.id !== decision.id || opened.current.revision !== decision.revision);
  return /* @__PURE__ */ jsx(
    Dialog,
    {
      open,
      onOpenChange,
      title: decision.title,
      description: decision.consequence,
      children: /* @__PURE__ */ jsxs(Stack, { gap: 12, children: [
        changed && /* @__PURE__ */ jsx("p", { className: "yg-error", role: "status", children: "This decision changed. Close and review it again." }),
        /* @__PURE__ */ jsxs(ButtonGroup, { label: "Decision", children: [
          /* @__PURE__ */ jsx(Button, { emphasis: "quiet", onClick: () => onOpenChange(false), children: words["action.cancel"] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              tone: "danger",
              pending,
              disabled: !decision.available || !!changed,
              onClick: () => {
                if (sent.current || !decision.available || !opened.current || opened.current.id !== decision.id || opened.current.revision !== decision.revision)
                  return;
                sent.current = true;
                onOpenChange(false);
                onConfirm({ ...opened.current });
              },
              children: decision.confirmLabel
            }
          )
        ] })
      ] })
    }
  );
}
function Receipt({
  record,
  onLookup,
  pending = false
}) {
  const titles = {
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    failed: "Request failed",
    unknown: words["state.unknown"]
  };
  return /* @__PURE__ */ jsxs(Stack, { className: "yg-receipt", gap: 8, children: [
    /* @__PURE__ */ jsx(Heading, { level: 3, children: titles[record.state] }),
    /* @__PURE__ */ jsxs("span", { className: "yg-meta", children: [
      "Request ",
      record.id
    ] }),
    /* @__PURE__ */ jsx("div", { children: record.description }),
    onLookup && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      Button,
      {
        emphasis: "soft",
        pending,
        onClick: () => onLookup(record.id),
        children: words["action.lookup-original"]
      }
    ) })
  ] });
}

export {
  ConfirmDialog,
  Receipt
};
