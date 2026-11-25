import { type ReactNode } from "react";
import { type IconName, type Option } from "../foundation/foundation.js";
import { type Destination } from "./navigation.js";
export declare function Accordion({ label, items, multiple, }: {
    label: string;
    items: {
        id: string;
        title: string;
        content: ReactNode;
        disabled?: boolean;
    }[];
    multiple?: boolean;
}): import("react/jsx-runtime").JSX.Element;
type CommandProps = {
    label: string;
    title?: string;
    items: (Option & {
        hint?: string;
        icon?: IconName;
        shortcut?: string;
    })[];
    onSelect: (id: string) => void;
};
export declare function ContextMenu({ label, items, onSelect, children, }: CommandProps & {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function Command({ label, title, items, onSelect, presentation, triggerText, }: CommandProps & {
    presentation?: "dialog" | "inline";
    triggerText?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Sidebar({ label, links, current, }: {
    label: string;
    links: Destination[];
    current?: string;
}): import("react/jsx-runtime").JSX.Element;
type NavbarProps = {
    className?: string;
    action?: ReactNode;
} & ({
    variant?: "back";
    label: string;
    onBack: () => void;
} | {
    variant: "sections";
    label: string;
    identity: ReactNode;
    destinations: Destination[];
    current: string;
    currentKind?: "page" | "location";
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
});
export declare function Navbar(props: NavbarProps): import("react/jsx-runtime").JSX.Element;
export declare function Carousel({ label, items, }: {
    label: string;
    items: {
        id: string;
        label: string;
        content: ReactNode;
    }[];
}): import("react/jsx-runtime").JSX.Element;
type DateValue = {
    label: string;
    value?: string;
    onValueChange: (date: string) => void;
    min?: string;
    max?: string;
};
export declare function Calendar({ label, value, min, max, onValueChange }: DateValue): import("react/jsx-runtime").JSX.Element;
export {};
