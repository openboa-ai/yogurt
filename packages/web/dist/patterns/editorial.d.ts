import { type ReactNode } from "react";
type Content = {
    children: ReactNode;
};
type NamedSection = Content & {
    title?: string;
    description?: string;
    headerAction?: ReactNode;
    action?: ReactNode;
};
export declare function Card({ title, description, headerAction, children, action, density, variant, className, "data-state": dataState, }: NamedSection & {
    density?: "compact" | "regular" | "spacious";
    variant?: "raised" | "outlined" | "subtle";
    className?: string;
    "data-state"?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Asset({ children, size, framed, }: Content & {
    size?: number;
    framed?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function GridList({ label, items, minWidth, }: {
    label: string;
    items: {
        id: string;
        content: ReactNode;
    }[];
    minWidth?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function ListHeader({ title, detail, action, }: {
    title: string;
    detail?: string;
    action?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function PageHeader({ title, detail, eyebrow, subtitle, leading, action, featured, className, }: {
    title: string;
    detail?: string;
    eyebrow?: string;
    subtitle?: string;
    leading?: ReactNode;
    action?: ReactNode;
    featured?: boolean;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Spinner({ label }: {
    label?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ToastStack({ items, onDismiss, label, presentation, defaultExpanded, swipe, }: {
    items: {
        id: string;
        message: string;
    }[];
    onDismiss: (id: string) => void;
    label?: string;
    presentation?: "list" | "stacked";
    defaultExpanded?: boolean;
    swipe?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare const avatarSizes: {
    readonly compact: 26;
    readonly regular: 36;
    readonly large: 44;
};
export declare function Avatar({ label, src, size, }: {
    label: string;
    src?: string;
    size?: number | keyof typeof avatarSizes;
}): import("react/jsx-runtime").JSX.Element;
export declare function CodeBlock({ code, language, onCopy, }: {
    code: string;
    language: string;
    onCopy?: (text: string) => Promise<void>;
}): import("react/jsx-runtime").JSX.Element;
export interface TraceEvent {
    id: string;
    title: string;
    detail: ReactNode;
    state?: "working" | "complete" | "failed" | "flagged";
    latency?: string;
    index?: string;
}
export declare function Trace({ label, events, }: {
    label: string;
    events: TraceEvent[];
}): import("react/jsx-runtime").JSX.Element;
export {};
