import { type ReactNode } from "react";
import { PopoverClose, PopoverDescription, PopoverTitle } from "@ui-sdk/react/popover";
import { TooltipArrow } from "@ui-sdk/react/tooltip";
import { type Option } from "../foundation/foundation.js";
import { type ButtonProps, type ButtonSize } from "./actions.js";
export declare function Disclosure({ label, children, initiallyOpen, }: {
    label: string;
    children: ReactNode;
    initiallyOpen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export { Disclosure as DisclosureRow };
export interface ActionMenuItem extends Option {
    checked?: boolean;
    tone?: "neutral" | "danger";
    separatorBefore?: boolean;
}
type ActionMenuProps = {
    label: string;
    items: ActionMenuItem[];
    onSelect: (id: string) => void;
    triggerText?: string;
    triggerVariant?: "button" | "more";
    triggerEmphasis?: ButtonProps["emphasis"];
    triggerSize?: ButtonSize;
    selectionIndicator?: "leading" | "none";
    align?: "start" | "center" | "end";
    presentation?: "anchored" | "expanding";
};
export declare function ActionMenu({ presentation, ...props }: ActionMenuProps): import("react/jsx-runtime").JSX.Element;
export { PopoverClose, PopoverDescription, PopoverTitle };
export interface PopoverProps {
    label: string;
    trigger?: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    className?: string;
    children: ReactNode;
}
export declare function Popover({ label, trigger, open, defaultOpen, onOpenChange, side, align, sideOffset, className, children, }: PopoverProps): import("react/jsx-runtime").JSX.Element;
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
export declare function Tooltip({ label, delay, children, }: {
    label: string;
    delay?: number;
    children: (props: {
        "aria-describedby": string;
    }) => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export { TooltipArrow };
export declare function MorphTooltip({ label, detail }: {
    label: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
