"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Button } from "../controls/actions.js";
import { Heading, Stack, Text } from "../foundation/foundation.js";
import { Status } from "../controls/feedback.js";
import { AgentAvatar } from "../identity/identity.js";

import { agentPresenceLabels } from "../identity/agent-motion-data.js";
import type { GazeState } from "../identity/identity.js";

export type AgentPresence = GazeState;
export { agentPresenceLabels };

export interface AgentSummary {
  id: string;
  name: string;
  state: AgentPresence;
  art?: ComponentProps<typeof AgentAvatar>["agent"];
  avatar?: ReactNode;
  role?: string;
  preview?: string;
  time?: string;
  dateTime?: string;
  group?: string;
  pinned?: boolean;
  unread?: boolean;
}

export function AgentRow({
  agent,
  current,
  onSelect,
}: {
  agent: AgentSummary;
  current?: boolean;
  onSelect: (id: string) => void;
}) {
  const context = useId();
  const timestamp = agent.time ? context + "-time" : undefined;
  const avatar =
    agent.avatar ??
    (agent.art ? (
      <AgentAvatar
        agent={agent.art}
        state={agent.state}
        size={36}
      />
    ) : null);
  return (
    <button
      type="button"
      className="yg-agent-row"
      aria-label={agent.name}
      aria-describedby={[context, timestamp].filter(Boolean).join(" ")}
      aria-current={current || undefined}
      onClick={() => onSelect(agent.id)}
    >
      {avatar && (
        <span className="yg-agent-row-art" aria-hidden="true">
          {avatar}
        </span>
      )}
      <span className="yg-agent-row-copy">
        <span className="yg-agent-row-heading">
          <span className="yg-agent-row-name">{agent.name}</span>
          {agent.time && (
            <time id={timestamp} className="yg-agent-row-time" dateTime={agent.dateTime}>
              {agent.time}
            </time>
          )}
        </span>
        <span id={context} className="yg-agent-row-context">
          <span className="yg-agent-row-signals">
            <span className="yg-agent-row-state" data-state={agent.state}>
              {agentPresenceLabels[agent.state]}
            </span>
            {agent.unread && <span className="yg-agent-row-new">Unread</span>}
          </span>
          {(agent.preview || agent.role) && (
            <span className="yg-agent-row-preview">
              {agent.preview || agent.role}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export type RuntimeState =
  | "offline"
  | "connecting"
  | "available"
  | "working"
  | "waiting"
  | "controlled";

const runtimeStates: Record<RuntimeState, string> = {
  offline: "Disconnected",
  connecting: "Connecting",
  available: "Ready to watch",
  working: "Agent in control",
  waiting: "Needs your input",
  controlled: "You are in control",
};

export function RuntimePanel({
  state,
  title = "Computer",
  detail,
  preview,
  onWatch,
  onRequestControl,
  onReturnControl,
  onReconnect,
}: {
  state: RuntimeState;
  title?: string;
  detail?: string;
  preview?: ReactNode;
  onWatch?: () => void;
  onRequestControl?: () => void;
  onReturnControl?: () => void;
  onReconnect?: () => void;
}) {
  const heading = useId();
  const connected = state !== "offline" && state !== "connecting";
  const canWatch = connected && state !== "controlled" && onWatch;
  const canRequest = connected && state !== "controlled" && onRequestControl;
  const canReturn = state === "controlled" && onReturnControl;
  const canReconnect = state === "offline" && onReconnect;
  const tone = state === "waiting" || state === "offline" ? "warning" : "neutral";
  return (
    <section aria-labelledby={heading} className="yg-runtime-panel">
      <Stack gap={12}>
        <div className="yg-runtime-heading">
          <Heading id={heading} level={3}>{title}</Heading>
          <Status tone={tone}>{runtimeStates[state]}</Status>
        </div>
        {detail && <Text>{detail}</Text>}
        {connected && preview && (
          <div className="yg-runtime-preview">{preview}</div>
        )}
        {(canWatch || canRequest || canReturn || canReconnect) && (
          <div className="yg-runtime-actions">
            {canWatch && <Button emphasis="soft" onClick={onWatch}>Watch screen</Button>}
            {canRequest && <Button emphasis={state === "waiting" ? "filled" : "quiet"} onClick={onRequestControl}>Request control</Button>}
            {canReturn && <Button onClick={onReturnControl}>Return control</Button>}
            {canReconnect && <Button emphasis="soft" onClick={onReconnect}>Reconnect</Button>}
          </div>
        )}
      </Stack>
    </section>
  );
}
