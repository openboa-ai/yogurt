import { type ComponentProps, type ReactNode } from "react";
import { type ControlSize, type Option } from "../foundation/foundation.js";
type Input = Omit<ComponentProps<"input">, "size" | "prefix">;
export declare function InputGroup({ label, leading, trailing, help, error, id, size, motion, containerClassName, ...input }: Input & {
    label: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    help?: string;
    error?: string;
    size?: ControlSize | "featured";
    motion?: "spring";
    containerClassName?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function InputOTP({ label, length, value, onValueChange, name, disabled, verified, help, error, }: {
    label: string;
    length?: number;
    value: string;
    onValueChange: (v: string) => void;
    name?: string;
    disabled?: boolean;
    verified?: boolean;
    help?: string;
    error?: string;
}): import("react/jsx-runtime").JSX.Element;
export { Slider, RangeSlider } from "./slider.js";
export declare function Toggle({ pressed, defaultPressed, onPressedChange, children, disabled, size, className, }: {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    children: ReactNode;
    disabled?: boolean;
    size?: ControlSize;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ToggleGroup({ label, items, value, onValueChange, multiple, size, className, }: {
    label: string;
    items: Option[];
    value: string[];
    onValueChange: (ids: string[]) => void;
    multiple?: boolean;
    size?: ControlSize;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
