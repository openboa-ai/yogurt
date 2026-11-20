import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
export type Appearance = "auto" | "light" | "dark";
export type Material = "neutral" | "paper" | "mist";
export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "accent";
export type Size = "compact" | "regular" | "touch";
export interface Option {
    id: string;
    label: string;
    disabled?: boolean;
}
type Box = HTMLAttributes<HTMLDivElement>;
export declare function cx(...values: (string | undefined | false)[]): string;
export declare function Yogurt({ appearance, material, className, ...props }: Box & {
    appearance?: Appearance;
    material?: Material;
}): import("react/jsx-runtime").JSX.Element;
export declare function Text({ variant, className, ...props }: ComponentProps<"span"> & {
    variant?: "body" | "help" | "meta";
}): import("react/jsx-runtime").JSX.Element;
export declare function Heading({ level, className, ...props }: HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}): import("react/jsx-runtime").JSX.Element;
type Layout = Box & {
    gap?: 2 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64;
};
export declare function Stack({ gap, className, style, ...props }: Layout): import("react/jsx-runtime").JSX.Element;
export declare function Inline({ gap, className, style, ...props }: Layout): import("react/jsx-runtime").JSX.Element;
export declare function Grid({ gap, className, style, ...props }: Layout): import("react/jsx-runtime").JSX.Element;
export declare function Surface({ className, ...props }: Box): import("react/jsx-runtime").JSX.Element;
export declare function Divider(): import("react/jsx-runtime").JSX.Element;
export declare function ScrollArea({ label, className, ...props }: Box & {
    label: string;
}): import("react/jsx-runtime").JSX.Element;
declare const paths: {
    close: string;
    check: string;
    search: string;
    down: string;
    next: string;
    back: string;
    plus: string;
    copy: string;
    menu: string;
    moon: string;
    sun: string;
    arrow: string;
    info: string;
    clock: string;
};
export type IconName = keyof typeof paths;
export declare function Icon({ name, label }: {
    name: IconName;
    label?: string;
}): import("react/jsx-runtime").JSX.Element;
export type Content = {
    children: ReactNode;
};
export {};
