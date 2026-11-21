import { createAgent } from "@ui-sdk/react/agent";
type ProviderOptions = NonNullable<Parameters<typeof createAgent>[0]>;
export interface YogurtAgentOptions {
    allow: NonNullable<ProviderOptions["allow"]>;
    timeout?: number;
}
export declare function createYogurtAgent(options: YogurtAgentOptions): {
    snapshot: () => import("@ui-sdk/core/agent").AgentComponent[];
    act: (input: {
        steps: import("@ui-sdk/core/agent").AgentStep[];
    }) => Promise<{
        appeared: import("@ui-sdk/core/agent").AgentComponent[];
        values: Record<string, unknown>;
        open?: import("@ui-sdk/core/agent").AgentComponent[] | undefined;
        steps: {
            step: number;
            ref: string;
            result?: unknown;
            changes?: import("@ui-sdk/core/agent").AgentChange[];
            gone?: string[];
        }[];
        error?: {
            step: number;
            message: string;
        } | undefined;
        ok: boolean;
    }>;
    query: (input: {
        text?: string;
        within?: string;
        kind?: string;
    }) => Promise<import("@ui-sdk/core/agent").AgentComponent[] | {
        error: string;
    }>;
    subscribe: (listener: (change: import("@ui-sdk/react/agent").ObservedChange) => void) => () => void;
};
export {};
