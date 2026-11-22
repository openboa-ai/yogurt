import { type ComponentProps, type ReactNode } from "react";
import { type Tone } from "../foundation/foundation.js";
import type { Observation, Reading } from "../controls/data.js";
type Content = {
    children: ReactNode;
};
type NamedSection = Content & {
    title: string;
    description?: string;
    action?: ReactNode;
};
export declare function AspectRatio({ ratio, children, }: Content & {
    ratio?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function Direction({ dir, children, }: Content & {
    dir?: "ltr" | "rtl";
}): import("react/jsx-runtime").JSX.Element;
export declare function Card({ title, description, children, action, density }: NamedSection & {
    density?: "compact" | "regular" | "spacious";
}): import("react/jsx-runtime").JSX.Element;
export declare function Asset({ children, size, framed, }: Content & {
    size?: number;
    framed?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Gradient({ children, tone, }: {
    children?: ReactNode;
    tone?: Tone;
}): import("react/jsx-runtime").JSX.Element;
export declare function Elevation({ children, level, }: Content & {
    level?: "flat" | "raised" | "floating";
}): import("react/jsx-runtime").JSX.Element;
export declare function KeyboardShortcut({ keys, label, }: {
    keys: string[];
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Post({ children, ...props }: ComponentProps<"article">): import("react/jsx-runtime").JSX.Element;
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
export declare function ListFooter({ children, action, }: Content & {
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
export declare function BottomInfo({ label, children }: Content & {
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Highlight({ children }: Content): import("react/jsx-runtime").JSX.Element;
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
export declare function TableRow({ label, children }: Content & {
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function AmountTop({ label, value, unit, detail, }: {
    label: string;
    value: string;
    unit?: string;
    detail?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function BarChart({ title, points, unit, source, asOf, timeLabel, }: Observation & {
    title: string;
    points: Reading[];
    unit: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Avatar({ label, src, size, }: {
    label: string;
    src?: string;
    size?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function Bubble({ children, outgoing, }: Content & {
    outgoing?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Attachment({ name, detail, preview, onOpen, onRemove, progress, }: {
    name: string;
    detail?: string;
    preview?: ReactNode;
    onOpen?: () => void;
    onRemove?: () => void;
    progress?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function Marker({ children, tone, }: Content & {
    tone?: Tone;
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
    state?: "working" | "complete" | "failed";
}
export declare function Trace({ label, events, }: {
    label: string;
    events: TraceEvent[];
}): import("react/jsx-runtime").JSX.Element;
export {};
