import type { ReactNode } from "react";
import { type Tone } from "../foundation/foundation.js";
export declare function Badge({ children, tone, variant, dot, className, }: {
    children: ReactNode;
    tone?: Tone;
    variant?: "soft" | "outline";
    dot?: boolean;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Status({ children, tone, }: {
    children: ReactNode;
    tone?: Exclude<Tone, "accent">;
}): import("react/jsx-runtime").JSX.Element;
export declare function Notice({ title, children, tone, action, urgent, }: {
    title: string;
    children?: ReactNode;
    tone?: Tone;
    action?: ReactNode;
    urgent?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Skeleton({ label, lines, }: {
    label?: string;
    lines?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function Progress({ label, value, max, presentation, segments, valueLabel, }: {
    label: string;
    value?: number;
    max?: number;
    presentation?: "bar" | "segmented";
    segments?: number;
    valueLabel?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Toast({ message, onDismiss, }: {
    message: string;
    onDismiss: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Result({ title, children, action, }: {
    title: string;
    children?: ReactNode;
    action?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
