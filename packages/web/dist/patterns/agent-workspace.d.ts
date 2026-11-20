import { type ComponentProps, type ReactNode } from "react";
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
export declare function AgentRow({ agent, current, onSelect, }: {
    agent: AgentSummary;
    current?: boolean;
    onSelect: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export type RuntimeState = "offline" | "connecting" | "available" | "working" | "waiting" | "controlled";
export declare function RuntimePanel({ state, title, detail, preview, onWatch, onRequestControl, onReturnControl, onReconnect, }: {
    state: RuntimeState;
    title?: string;
    detail?: string;
    preview?: ReactNode;
    onWatch?: () => void;
    onRequestControl?: () => void;
    onReturnControl?: () => void;
    onReconnect?: () => void;
}): import("react/jsx-runtime").JSX.Element;
