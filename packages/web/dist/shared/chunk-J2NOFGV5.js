"use client";
import {
  Badge
} from "./chunk-BG4OQ2LF.js";
import {
  Button
} from "./chunk-BMOTQIAZ.js";
import {
  Icon,
  Text
} from "./chunk-XELXU7JZ.js";

// packages/web/src/patterns/operations.tsx
import { useId } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var eventKinds = {
  task: { label: "Task", icon: "check" },
  handoff: { label: "Handoff", icon: "arrow" },
  artifact: { label: "Output", icon: "copy" },
  review: { label: "Review", icon: "info" },
  voice: { label: "Voice note", icon: "info" },
  routine: { label: "Routine", icon: "clock" }
};
var eventStates = {
  running: { label: "In progress", tone: "neutral" },
  ready: { label: "Ready", tone: "success" },
  waiting: { label: "Waiting", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  done: { label: "Complete", tone: "neutral" }
};
function WorkEvent({
  event,
  onOpen,
  inlineMeta,
  actions,
  hideStateBadge = false
}) {
  const titleId = useId();
  const kind = eventKinds[event.kind];
  const state = !hideStateBadge && event.state ? eventStates[event.state] : void 0;
  const hasActions = Boolean(onOpen || actions);
  return /* @__PURE__ */ jsxs("article", { className: "yg-work-event", "aria-labelledby": titleId, "data-state": event.state, children: [
    /* @__PURE__ */ jsx("span", { className: "yg-work-event-icon", children: /* @__PURE__ */ jsx(Icon, { name: kind.icon }) }),
    /* @__PURE__ */ jsxs("div", { className: "yg-work-event-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "yg-operations-line", children: [
        /* @__PURE__ */ jsx(Text, { variant: "meta", children: kind.label }),
        event.time && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Text, { variant: "meta", "aria-hidden": "true", children: "\xB7" }),
          /* @__PURE__ */ jsx("time", { className: "yg-meta", dateTime: event.dateTime, children: event.time })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "yg-operations-title-line", children: [
        /* @__PURE__ */ jsx("strong", { id: titleId, children: event.title }),
        state && /* @__PURE__ */ jsx(Badge, { tone: state.tone, children: state.label }),
        inlineMeta
      ] }),
      event.detail && /* @__PURE__ */ jsx(Text, { variant: "help", children: event.detail })
    ] }),
    hasActions && /* @__PURE__ */ jsxs("div", { className: "yg-operations-actions", children: [
      actions,
      onOpen && /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "soft",
          size: "compact",
          "aria-label": `Open ${event.title}`,
          onClick: () => onOpen(event.id),
          children: "Open"
        }
      )
    ] })
  ] });
}
var routineStates = {
  scheduled: { label: "Scheduled", tone: "success" },
  paused: { label: "Paused", tone: "neutral" },
  running: { label: "Running", tone: "neutral" },
  failed: { label: "Needs attention", tone: "danger" }
};
function RoutineRow({
  routine,
  onInspect,
  onEdit,
  onRun
}) {
  const titleId = useId();
  const state = routineStates[routine.state];
  const hasActions = Boolean(onInspect || onEdit || onRun);
  return /* @__PURE__ */ jsxs("article", { className: "yg-routine-row", "aria-labelledby": titleId, children: [
    /* @__PURE__ */ jsxs("div", { className: "yg-work-event-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "yg-operations-title-line", children: [
        /* @__PURE__ */ jsx("strong", { id: titleId, children: routine.title }),
        /* @__PURE__ */ jsx(Badge, { tone: state.tone, children: state.label })
      ] }),
      /* @__PURE__ */ jsx(Text, { variant: "help", children: routine.cadence }),
      (routine.nextRun || routine.lastRun) && /* @__PURE__ */ jsxs("div", { className: "yg-operations-line", children: [
        routine.nextRun && /* @__PURE__ */ jsxs(Text, { variant: "meta", children: [
          "Next \xB7 ",
          routine.nextRun
        ] }),
        routine.nextRun && routine.lastRun && /* @__PURE__ */ jsx(Text, { variant: "meta", "aria-hidden": "true", children: "\xB7" }),
        routine.lastRun && /* @__PURE__ */ jsxs(Text, { variant: "meta", children: [
          "Last \xB7 ",
          routine.lastRun
        ] })
      ] })
    ] }),
    hasActions && /* @__PURE__ */ jsxs("div", { className: "yg-operations-actions", children: [
      onInspect && /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "quiet",
          size: "compact",
          "aria-label": `Inspect ${routine.title}`,
          onClick: () => onInspect(routine.id),
          children: "Details"
        }
      ),
      onEdit && /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "quiet",
          size: "compact",
          "aria-label": `Edit ${routine.title}`,
          onClick: () => onEdit(routine.id),
          children: "Edit"
        }
      ),
      onRun && /* @__PURE__ */ jsx(
        Button,
        {
          emphasis: "soft",
          size: "compact",
          "aria-label": `Run ${routine.title}`,
          disabled: routine.canRun === false || routine.state === "running",
          onClick: () => onRun(routine.id),
          children: "Run now"
        }
      )
    ] })
  ] });
}

export {
  WorkEvent,
  RoutineRow
};
