import { type ReactNode } from "react";
export interface Decision {
    id: string;
    revision: string;
    title: string;
    consequence: string;
    confirmLabel: string;
    available: boolean;
    destructive?: boolean;
}
export interface DecisionRef {
    id: string;
    revision: string;
}
export declare function ConfirmDialog({ decision, open, onOpenChange, onConfirm, pending, }: {
    decision: Decision;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (original: DecisionRef) => void;
    pending?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export interface ReceiptRecord {
    id: string;
    state: "pending" | "confirmed" | "failed" | "unknown";
    description: ReactNode;
}
export declare function Receipt({ record, onLookup, pending, }: {
    record: ReceiptRecord;
    onLookup?: (originalId: string) => void;
    pending?: boolean;
}): import("react/jsx-runtime").JSX.Element;
