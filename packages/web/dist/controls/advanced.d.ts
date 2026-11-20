import { type ReactNode } from "react";
import { type IconName, type Option } from "../foundation/foundation.js";
import type { Destination } from "./navigation.js";
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
    })[];
    onSelect: (id: string) => void;
};
export declare function ContextMenu({ label, items, onSelect, children, }: CommandProps & {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function HoverCard({ label, children, }: {
    label: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function Command({ label, title, items, onSelect }: CommandProps): import("react/jsx-runtime").JSX.Element;
export declare function Menubar({ label, menus, onSelect, }: {
    label: string;
    menus: {
        id: string;
        label: string;
        items: Option[];
    }[];
    onSelect: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function NavigationMenu({ label, groups, }: {
    label: string;
    groups: {
        id: string;
        label: string;
        links: Destination[];
    }[];
}): import("react/jsx-runtime").JSX.Element;
export declare function Sidebar({ label, links, current, }: {
    label: string;
    links: Destination[];
    current?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Navbar({ label, onBack, action, }: {
    label: string;
    onBack: () => void;
    action?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function Carousel({ label, items, }: {
    label: string;
    items: {
        id: string;
        label: string;
        content: ReactNode;
    }[];
}): import("react/jsx-runtime").JSX.Element;
export declare function Stepper({ label, steps, current, variant, }: {
    label: string;
    steps: {
        id: string;
        label: string;
        detail?: string;
        action?: ReactNode;
    }[];
    current: string;
    variant?: "list" | "progress";
}): import("react/jsx-runtime").JSX.Element;
export declare function Resizable({ label, first, second, initial, }: {
    label: string;
    first: ReactNode;
    second: ReactNode;
    initial?: number;
}): import("react/jsx-runtime").JSX.Element;
type DateValue = {
    label: string;
    value?: string;
    onValueChange: (date: string) => void;
    min?: string;
    max?: string;
};
export declare function Calendar({ label, value, min, max, onValueChange }: DateValue): import("react/jsx-runtime").JSX.Element;
export declare function DatePicker(props: DateValue): import("react/jsx-runtime").JSX.Element;
export interface Question {
    id: string;
    label: string;
    kind: "single" | "multiple" | "text";
    options?: Option[];
    optional?: boolean;
}
export type Answers = Record<string, string | string[]>;
export declare function Questionnaire({ questions, onComplete, }: {
    questions: Question[];
    onComplete: (answers: Answers) => void;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
