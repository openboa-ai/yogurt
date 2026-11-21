"use client";
import {
  AgentAvatar,
  agentPresenceLabels
} from "./chunk-IXON7IRO.js";
import {
  Status
} from "./chunk-KXVFHR7K.js";
import {
  Button
} from "./chunk-LTCB3AU4.js";
import {
  Heading,
  Stack,
  Text
} from "./chunk-H36QHH35.js";

// packages/web/src/patterns/agent-workspace.tsx
import { useId } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function AgentRow({
  agent,
  current,
  onSelect
}) {
  const context = useId();
  const timestamp = agent.time ? context + "-time" : void 0;
  const avatar = agent.avatar ?? (agent.art ? /* @__PURE__ */ jsx(
    AgentAvatar,
    {
      agent: agent.art,
      state: agent.state,
      size: 36
    }
  ) : null);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: "yg-agent-row",
      "aria-label": agent.name,
      "aria-describedby": [context, timestamp].filter(Boolean).join(" "),
      "aria-current": current || void 0,
      onClick: () => onSelect(agent.id),
      children: [
        avatar && /* @__PURE__ */ jsx("span", { className: "yg-agent-row-art", "aria-hidden": "true", children: avatar }),
        /* @__PURE__ */ jsxs("span", { className: "yg-agent-row-copy", children: [
          /* @__PURE__ */ jsxs("span", { className: "yg-agent-row-heading", children: [
            /* @__PURE__ */ jsx("span", { className: "yg-agent-row-name", children: agent.name }),
            agent.time && /* @__PURE__ */ jsx("time", { id: timestamp, className: "yg-agent-row-time", dateTime: agent.dateTime, children: agent.time })
          ] }),
          /* @__PURE__ */ jsxs("span", { id: context, className: "yg-agent-row-context", children: [
            /* @__PURE__ */ jsxs("span", { className: "yg-agent-row-signals", children: [
              /* @__PURE__ */ jsx("span", { className: "yg-agent-row-state", "data-state": agent.state, children: agentPresenceLabels[agent.state] }),
              agent.unread && /* @__PURE__ */ jsx("span", { className: "yg-agent-row-new", children: "Unread" })
            ] }),
            (agent.preview || agent.role) && /* @__PURE__ */ jsx("span", { className: "yg-agent-row-preview", children: agent.preview || agent.role })
          ] })
        ] })
      ]
    }
  );
}
var runtimeStates = {
  offline: "Disconnected",
  connecting: "Connecting",
  available: "Ready to watch",
  working: "Agent in control",
  waiting: "Needs your input",
  controlled: "You are in control"
};
function RuntimePanel({
  state,
  title = "Computer",
  detail,
  preview,
  onWatch,
  onRequestControl,
  onReturnControl,
  onReconnect
}) {
  const heading = useId();
  const connected = state !== "offline" && state !== "connecting";
  const canWatch = connected && state !== "controlled" && onWatch;
  const canRequest = connected && state !== "controlled" && onRequestControl;
  const canReturn = state === "controlled" && onReturnControl;
  const canReconnect = state === "offline" && onReconnect;
  const tone = state === "waiting" || state === "offline" ? "warning" : "neutral";
  return /* @__PURE__ */ jsx("section", { "aria-labelledby": heading, className: "yg-runtime-panel", children: /* @__PURE__ */ jsxs(Stack, { gap: 12, children: [
    /* @__PURE__ */ jsxs("div", { className: "yg-runtime-heading", children: [
      /* @__PURE__ */ jsx(Heading, { id: heading, level: 3, children: title }),
      /* @__PURE__ */ jsx(Status, { tone, children: runtimeStates[state] })
    ] }),
    detail && /* @__PURE__ */ jsx(Text, { children: detail }),
    connected && preview && /* @__PURE__ */ jsx("div", { className: "yg-runtime-preview", children: preview }),
    (canWatch || canRequest || canReturn || canReconnect) && /* @__PURE__ */ jsxs("div", { className: "yg-runtime-actions", children: [
      canWatch && /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onWatch, children: "Watch screen" }),
      canRequest && /* @__PURE__ */ jsx(Button, { emphasis: state === "waiting" ? "filled" : "quiet", onClick: onRequestControl, children: "Request control" }),
      canReturn && /* @__PURE__ */ jsx(Button, { onClick: onReturnControl, children: "Return control" }),
      canReconnect && /* @__PURE__ */ jsx(Button, { emphasis: "soft", onClick: onReconnect, children: "Reconnect" })
    ] })
  ] }) });
}

export {
  AgentRow,
  RuntimePanel
};
