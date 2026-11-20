import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { type ControlSize, type IconName } from "../foundation/foundation.js";
export type ButtonSize = ControlSize;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    emphasis?: "filled" | "soft" | "quiet";
    tone?: "neutral" | "brand" | "danger";
    size?: ButtonSize;
    shape?: "rounded" | "pill";
    pending?: boolean;
    pendingLabel?: string;
    ref?: Ref<HTMLButtonElement>;
}
export declare function Button({ emphasis, tone, size, shape, pending, pendingLabel, children, type, className, onClick, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export declare function IconButton({ label, icon, ...props }: Omit<ButtonProps, "children"> & {
    label: string;
    icon: IconName;
}): import("react/jsx-runtime").JSX.Element;
export declare function ButtonGroup({ label, children, }: {
    label: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function BottomAction({ children, label, fixed, }: {
    children: ReactNode;
    label?: string;
    fixed?: boolean;
}): import("react/jsx-runtime").JSX.Element;
