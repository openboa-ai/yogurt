import { type ComponentProps, type ReactNode } from "react";
import { type ButtonProps } from "./actions.js";
import { type Choices } from "./forms.js";
import { type IconName } from "../foundation/foundation.js";
export declare function Link({ emphasis, size, className, children, ...props }: ComponentProps<"a"> & {
    href: string;
    emphasis?: ButtonProps["emphasis"];
    size?: ButtonProps["size"];
}): import("react/jsx-runtime").JSX.Element;
export interface Destination {
    id: string;
    label: string;
    href: string;
}
export declare function Breadcrumb({ items, label, }: {
    items: Destination[];
    label?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function NavigationList({ id, items, current, currentKind, label, orientation, expanded, }: {
    id?: string;
    items: Destination[];
    current: string;
    currentKind?: "page" | "location";
    label: string;
    orientation?: "vertical" | "horizontal";
    expanded?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function SegmentedControl({ label, options, value, onValueChange, disabled, }: Choices): import("react/jsx-runtime").JSX.Element;
export declare function Tabs({ label, items, value, onValueChange, presentation, }: {
    label: string;
    items: {
        id: string;
        label: string;
        panel: ReactNode;
        icon?: IconName;
        disabled?: boolean;
    }[];
    value: string;
    onValueChange: (id: string) => void;
    presentation?: "pill" | "dock";
}): import("react/jsx-runtime").JSX.Element;
export declare function Pagination({ page, pages, onPageChange, label, }: {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
    label?: string;
}): import("react/jsx-runtime").JSX.Element | null;
