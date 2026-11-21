import { type ComponentProps, type ReactNode } from "react";
import { type Option } from "../foundation/foundation.js";
type Input = Omit<ComponentProps<"input">, "size" | "prefix">;
export declare function InputGroup({ label, leading, trailing, help, error, id, ...input }: Input & {
    label: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    help?: string;
    error?: string;
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
export declare function SplitTextField({ label, parts, onValueChange, separator, }: {
    label: string;
    parts: {
        id: string;
        label: string;
        value: string;
        maxLength?: number;
        inputMode?: Input["inputMode"];
    }[];
    onValueChange: (id: string, value: string) => void;
    separator?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Slider({ label, value, onValueChange, min, max, step, unit, disabled, presentation, formatValue, }: {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    presentation?: "inline" | "card";
    formatValue?: (value: number) => string;
}): import("react/jsx-runtime").JSX.Element;
export declare function NumericSpinner({ label, help, decreaseLabel, increaseLabel, value, min, max, step, onValueChange, disabled, }: {
    label: string;
    help?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onValueChange: (value: number) => void;
    disabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Rating({ label, value, onValueChange, max, showStatus, }: {
    label: string;
    value: number;
    onValueChange?: (value: number) => void;
    max?: number;
    showStatus?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Agreement({ label, items, selected, onValueChange, }: {
    label: string;
    items: (Option & {
        detail?: ReactNode;
    })[];
    selected: string[];
    onValueChange: (ids: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
type KeyMode = "number" | "alphabet" | "private";
export declare function Keypad({ label, mode, onKey, onDelete, onSubmit, disabled, }: {
    label: string;
    mode?: KeyMode;
    onKey: (key: string) => void;
    onDelete: () => void;
    onSubmit?: () => void;
    disabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function Form({ label, className, ...props }: Omit<ComponentProps<"form">, "aria-label"> & {
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Toggle({ pressed, onPressedChange, children, disabled, }: {
    pressed: boolean;
    onPressedChange: (pressed: boolean) => void;
    children: ReactNode;
    disabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function ToggleGroup({ label, items, value, onValueChange, multiple, }: {
    label: string;
    items: Option[];
    value: string[];
    onValueChange: (ids: string[]) => void;
    multiple?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
