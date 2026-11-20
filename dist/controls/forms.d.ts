import { type ComponentProps, type ReactNode } from "react";
import { type Option } from "../foundation/foundation.js";
export declare function Label(props: ComponentProps<"label">): import("react/jsx-runtime").JSX.Element;
export declare function HelpText(props: ComponentProps<"p">): import("react/jsx-runtime").JSX.Element;
export declare function FieldError(props: ComponentProps<"p">): import("react/jsx-runtime").JSX.Element;
interface FieldInfo {
    id?: string;
    label: string;
    help?: string;
    error?: string;
}
interface FieldAttributes {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
}
export declare function Field({ id, label, help, error, children, }: FieldInfo & {
    children: (props: FieldAttributes) => ReactNode;
}): import("react/jsx-runtime").JSX.Element;
type InputProps = Omit<ComponentProps<"input">, "size"> & FieldInfo;
export declare function TextField({ id, label, help, error, className, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
export declare function SearchField({ id, label, help, error, value, onValueChange, placeholder, disabled, name, }: FieldInfo & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function Textarea({ id, label, help, error, className, ...props }: FieldInfo & ComponentProps<"textarea">): import("react/jsx-runtime").JSX.Element;
export declare function Select({ id, label, help, error, options, placeholder, ...props }: FieldInfo & ComponentProps<"select"> & {
    options: Option[];
    placeholder?: string;
}): import("react/jsx-runtime").JSX.Element;
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
export declare function Switch({ label, help, ...props }: Checkable & {
    help?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (value: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function Checkbox({ label, ...props }: Checkable & {
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
export declare function RadioGroup({ label, options, value, onValueChange, disabled, name, }: Choices): import("react/jsx-runtime").JSX.Element;
export declare function Combobox({ label, options, value, onValueChange, disabled, help, error, }: Choices & Pick<FieldInfo, "help" | "error">): import("react/jsx-runtime").JSX.Element;
export {};
