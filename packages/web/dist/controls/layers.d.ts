import { type ReactNode } from "react";
import { type Option } from "../foundation/foundation.js";
export declare function Disclosure({ label, children, initiallyOpen, }: {
    label: string;
    children: ReactNode;
    initiallyOpen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export { Disclosure as DisclosureRow };
export declare function ActionMenu({ label, items, onSelect, presentation, }: {
    label: string;
    items: Option[];
    onSelect: (id: string) => void;
    presentation?: "anchored" | "expanding";
}): import("react/jsx-runtime").JSX.Element;
export declare function Popover({ label, children, }: {
    label: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    description?: string;
}
export declare function Dialog(props: DialogProps): import("react/jsx-runtime").JSX.Element;
export declare function Sheet(props: DialogProps): import("react/jsx-runtime").JSX.Element;
export declare function Drawer(props: DialogProps): import("react/jsx-runtime").JSX.Element;
export declare function Tooltip({ label, children, }: {
    label: string;
    children: (props: {
        "aria-describedby": string;
    }) => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
