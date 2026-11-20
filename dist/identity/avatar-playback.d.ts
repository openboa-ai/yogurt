import { tracks } from "./avatar-pose-data.js";
import type { agentPresenceLabels } from "./agent-motion-data.js";
import type { AgentMotionFit } from "./agent-family-data.js";
type State = keyof typeof agentPresenceLabels;
type Agent = keyof typeof tracks;
export declare function bindAvatarPlayback(root: SVGSVGElement, agent: Agent, size: number, fit?: AgentMotionFit): {
    update(state: State, animated: boolean): void;
    dispose(): void;
} | undefined;
export {};
