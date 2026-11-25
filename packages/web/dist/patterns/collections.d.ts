import type { ReactNode } from "react";
import { type ControlSize, type Option } from "../foundation/foundation.js";
export declare function Count({ value, label }: {
    value: number;
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function FilterBar({ label, placeholder, query, onQueryChange, size, hiddenLabel, children, }: {
    label?: string;
    placeholder?: string;
    query: string;
    onQueryChange: (s: string) => void;
    size?: ControlSize;
    hiddenLabel?: boolean;
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function List({ label, divided, className, children, }: {
    label: string;
    divided?: boolean;
    className?: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function ListRow({ title, inlineMeta, description, leading, value, actions, trailing, separator, href, onActivate, current, className, }: {
    title: string;
    inlineMeta?: ReactNode;
    description?: string;
    leading?: ReactNode;
    value?: ReactNode;
    actions?: ReactNode;
    trailing?: ReactNode;
    separator?: boolean;
    href?: string;
    onActivate?: () => void;
    current?: boolean;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SelectionList({ label, options, selected, onValueChange, selectAllLabel, }: {
    label: string;
    options: Option[];
    selected: string[];
    onValueChange: (ids: string[]) => void;
    selectAllLabel?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function EmptyResult({ query, onClear, empty, }: {
    query?: string;
    onClear?: () => void;
    empty?: string;
}): import("react/jsx-runtime").JSX.Element;
