import { type ReactNode } from "react";
type StorageCategory = {
    id: string;
    label: string;
    amount: number;
    detail?: ReactNode;
};
export declare function StorageMeter({ label, used, capacity, unit, categories }: {
    label: string;
    used: number;
    capacity: number;
    unit: string;
    categories?: readonly StorageCategory[];
}): import("react/jsx-runtime").JSX.Element;
export declare function ActivityIsland({ label, summary, children, compact }: {
    label: string;
    summary: string;
    children: ReactNode;
    compact?: boolean;
}): import("react/jsx-runtime").JSX.Element;
type ActionState = "idle" | "pending" | "success" | "error";
type ResultActionProps = {
    label: string;
    pendingLabel: string;
    successLabel: string;
    errorLabel: string;
    state: ActionState;
    onAction: () => void;
};
export declare function LoadingSuccessButton({ presentation, ...props }: ResultActionProps & {
    presentation?: "fitted" | "morphing";
    fluid?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function CopyButton({ value }: {
    value: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
