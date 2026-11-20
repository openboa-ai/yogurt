type Option = {
    id: string;
    label: string;
};
type RangeSliderProps = {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    end?: number;
    onEndChange?: (value: number) => void;
    detail?: string;
    formatValue?: (value: number) => string;
    presentation?: "standard" | "elastic";
};
export declare function RangeSlider({ label, value, onChange, min, max, step, end, onEndChange, detail, formatValue, presentation, }: RangeSliderProps): import("react/jsx-runtime").JSX.Element;
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
