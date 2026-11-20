type FocusOption = {
    id: string;
    label: string;
    description: string;
};
type PlanOption = FocusOption & {
    price: string;
};
type ChoiceProps<T> = {
    value: string;
    onChange: (value: string) => void;
    options: T[];
};
export declare function FocusPicker({ value, onChange, options }: ChoiceProps<FocusOption>): import("react/jsx-runtime").JSX.Element;
export declare function PlanSwitch({ value, onChange, options }: ChoiceProps<PlanOption>): import("react/jsx-runtime").JSX.Element;
type LetterLimitProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    limit: number;
    placeholder?: string;
    onSubmit?: (value: string) => void;
};
export declare function LetterLimit({ label, value, onChange, limit, placeholder, onSubmit }: LetterLimitProps): import("react/jsx-runtime").JSX.Element;
export {};
