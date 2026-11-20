type Option = {
    id: string;
    label: string;
};
export declare function RangeSlider({ label, value, onChange, min, max, step }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function PasswordStrength({ value, onChange }: {
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function CheckboxList({ options, value, onChange }: {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function DetentDial({ options, value, onChange }: {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
