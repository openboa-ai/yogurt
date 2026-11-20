import { type ComponentProps, type ReactNode } from "react";
import { type Choices } from "./forms.js";
import { type IconName } from "../foundation/foundation.js";
export declare function Link(props: ComponentProps<"a"> & {
    href: string;
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
export declare function NavigationList({ items, current, label, }: {
    items: Destination[];
    current: string;
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SegmentedControl({ label, options, value, onValueChange, disabled, }: Choices): import("react/jsx-runtime").JSX.Element;
export declare function Tabs({ label, items, value, onValueChange, }: {
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
}): import("react/jsx-runtime").JSX.Element;
export declare function Pagination({ page, pages, onPageChange, label, }: {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
    label?: string;
}): import("react/jsx-runtime").JSX.Element | null;
