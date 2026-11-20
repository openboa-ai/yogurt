import type { ReactNode } from "react";
import { type Option } from "../foundation/foundation.js";
export declare function Count({ value, label }: {
    value: number;
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function FilterBar({ label, query, onQueryChange, children, }: {
    label?: string;
    query: string;
    onQueryChange: (s: string) => void;
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function List({ label, children, }: {
    label: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function ListRow({ title, description, leading, trailing, href, onActivate, current, }: {
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    href?: string;
    onActivate?: () => void;
    current?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function SelectionList({ label, options, selected, onValueChange, }: {
    label: string;
    options: Option[];
    selected: string[];
    onValueChange: (ids: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function EmptyResult({ query, onClear, empty, }: {
    query?: string;
    onClear?: () => void;
    empty?: string;
}): import("react/jsx-runtime").JSX.Element;
