type PickerOption = {
    id: string;
    label: string;
    marker?: "neutral" | "in-progress" | "review" | "done";
};
/** A controlled listbox with an anchored panel and explicit selected state. */
export type SelectPickerProps = {
    label: string;
    value: string;
    onValueChange?: (value: string) => void;
    onChange?: (value: string) => void;
    options: readonly PickerOption[];
};
export declare function SelectPicker({ label, value, onValueChange, onChange, options }: SelectPickerProps): import("react/jsx-runtime").JSX.Element;
export {};
