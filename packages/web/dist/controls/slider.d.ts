type SliderProps = {
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
};
export declare function Slider(props: SliderProps): import("react/jsx-runtime").JSX.Element;
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
    minThumbGap?: number;
};
export declare function RangeSlider({ label, value, onChange, min, max, step, end, onEndChange, detail, formatValue, presentation, minThumbGap, }: RangeSliderProps): import("react/jsx-runtime").JSX.Element;
export {};
