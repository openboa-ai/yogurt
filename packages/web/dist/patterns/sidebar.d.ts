import { type CSSProperties, type ReactNode } from "react";
export declare function SidebarLayout({ label, navigation, children, edge, variant, collapse, collapsed, defaultCollapsed, onCollapsedChange, width, compactAt, className, style, }: {
    label: string;
    navigation: ReactNode;
    children: ReactNode;
    edge?: "start" | "end";
    variant?: "inset" | "flat";
    collapse?: "rail" | "hide" | "none";
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    width?: string;
    compactAt?: number;
    className?: string;
    style?: CSSProperties;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarTrigger({ label, showLabel, }: {
    label?: string;
    showLabel?: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function SidebarHeader({ children, compact }: {
    children: ReactNode;
    compact?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarContent({ children, label }: {
    children: ReactNode;
    label?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarFooter({ children, compact }: {
    children: ReactNode;
    compact?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarItem({ label, href, icon, active, disabled, badge, action, onSelect, }: {
    label: string;
    href?: string;
    icon?: ReactNode;
    active?: boolean;
    disabled?: boolean;
    badge?: ReactNode;
    action?: ReactNode;
    onSelect?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarGroup({ label, children, action }: {
    label?: string;
    children: ReactNode;
    action?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function SidebarSubmenu({ label, icon, children, defaultOpen, containsCurrent, open: controlledOpen, onOpenChange }: {
    label: string;
    icon?: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    containsCurrent?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
