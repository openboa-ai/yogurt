import { type ReactNode } from "react";
export declare function StorageMeter({ label, used, capacity, unit }: {
    label: string;
    used: number;
    capacity: number;
    unit: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ActivityIsland({ label, summary, children }: {
    label: string;
    summary: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
type ActionState = "idle" | "pending" | "success" | "error";
export declare function LoadingSuccessButton({ label, pendingLabel, successLabel, errorLabel, state, onAction }: {
    label: string;
    pendingLabel: string;
    successLabel: string;
    errorLabel: string;
    state: ActionState;
    onAction: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function CopyButton({ value }: {
    value: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
