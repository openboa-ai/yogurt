import { type SelectPickerProps } from "./select-picker.js";
import { type ComponentProps, type ReactNode } from "react";
import { type ControlSize, type Option } from "../foundation/foundation.js";
export declare function Label(props: ComponentProps<"label">): import("react/jsx-runtime").JSX.Element;
export declare function HelpText(props: ComponentProps<"p">): import("react/jsx-runtime").JSX.Element;
export declare function FieldError(props: ComponentProps<"p">): import("react/jsx-runtime").JSX.Element;
export type FieldLayout = "vertical" | "horizontal" | "responsive";
interface FieldInfo {
    id?: string;
    label: string;
    help?: string;
    error?: string;
    layout?: FieldLayout;
    hiddenLabel?: boolean;
}
interface FieldAttributes {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
}
export declare function Field({ id, label, help, error, layout, hiddenLabel, labelEnd, className, children, }: FieldInfo & {
    labelEnd?: ReactNode;
    className?: string;
    children: (props: FieldAttributes) => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function FieldGroup({ legend, description, className, children, ...props }: ComponentProps<"fieldset"> & {
    legend?: string;
    description?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function FormRow({ align, className, children, ...props }: ComponentProps<"div"> & {
    align?: "start" | "center" | "end" | "stretch";
}): import("react/jsx-runtime").JSX.Element;
type InputProps = Omit<ComponentProps<"input">, "size"> & FieldInfo & {
    size?: ControlSize;
    motion?: "spring";
};
/** Compatibility entry for text inputs using the default SDK interaction. */
export declare function SpringTextInput({ value, defaultValue, onSelect, ...props }: Omit<ComponentProps<"input">, "size">): import("react/jsx-runtime").JSX.Element;
export declare function TextField({ id, label, help, error, layout, hiddenLabel, className, value, defaultValue, motion, size, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
export declare function SearchField({ id, label, help, error, layout, hiddenLabel, value, onValueChange, placeholder, disabled, name, onKeyDown, size, }: FieldInfo & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    size?: ControlSize;
}): import("react/jsx-runtime").JSX.Element;
export declare function Textarea({ id, label, help, error, layout, hiddenLabel, className, value, defaultValue, onSubmit, onSelect, suggestion, rows, ...props }: FieldInfo & ComponentProps<"textarea"> & {
    suggestion?: string;
}): import("react/jsx-runtime").JSX.Element;
type StandardSelectProps = FieldInfo & Omit<ComponentProps<"select">, "size" | "value" | "defaultValue" | "onChange"> & {
    options: Option[];
    placeholder?: string;
    size?: ControlSize;
    controlSize?: ControlSize;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};
export declare function Select(props: (StandardSelectProps & {
    presentation?: "custom";
}) | (SelectPickerProps & {
    presentation: "animated";
})): import("react/jsx-runtime").JSX.Element;
interface Checkable {
    id?: string;
    label: string;
    name?: string;
    value?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}
export declare function Switch({ label, help, id, className, disabled, presentation, onCheckedChange, ...props }: Checkable & {
    help?: string;
    presentation?: "row" | "inset";
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (value: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Checkbox({ label, id, className, disabled, ...props }: Checkable & {
    checked?: boolean | "indeterminate";
    defaultChecked?: boolean | "indeterminate";
    onCheckedChange?: (value: boolean | "indeterminate") => void;
}): import("react/jsx-runtime").JSX.Element;
export interface Choices {
    label: string;
    options: Option[];
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    name?: string;
}
type SwatchOption = Option & {
    color: string;
    accessibleLabel: string;
    column?: number;
};
type RadioGroupProps = Omit<Choices, "options"> & ({
    presentation?: "standard";
    options: Option[];
    columns?: never;
} | {
    presentation: "swatches";
    options: SwatchOption[];
    columns?: number;
});
export declare function RadioGroup({ label, options, value, onValueChange, disabled, name, presentation, columns, }: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export declare function Combobox({ id, label, options, value, onValueChange, disabled, name, help, error, layout, hiddenLabel, placeholder, size, className, }: Choices & Pick<FieldInfo, "id" | "help" | "error" | "layout" | "hiddenLabel"> & {
    placeholder?: string;
    size?: ControlSize;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
